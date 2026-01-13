import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Song, FamilyMember, CountdownResult, MemberProfile } from '../types';
import { supabase } from '../lib/supabase';
import { generateMusicTasteProfileAPI } from '../utils/profileGenerator';

interface AppContextType extends AppState {
  loading: boolean;
  isGeneratingProfiles: boolean;
  profileError: string;
  addSong: (song: Omit<Song, 'id'>) => Promise<void>;
  addSongs: (songs: Omit<Song, 'id'>[]) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'votes'>) => Promise<void>;
  updateFamilyMember: (member: FamilyMember) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  addCountdownResult: (result: Omit<CountdownResult, 'id'>) => Promise<void>;
  updateCountdownResults: (results: Omit<CountdownResult, 'id'>[]) => Promise<void>;
  addHottest200Result: (result: Omit<CountdownResult, 'id'>) => Promise<void>;
  updateHottest200Results: (results: Omit<CountdownResult, 'id'>[]) => Promise<void>;
  clearAllData: () => Promise<void>;
  generateMusicTasteProfile: (memberId: string) => Promise<void>;
  regenerateAllMusicTastes: () => Promise<void>;
  canRegenerateMusicTaste: (memberId: string) => boolean;
  getNextAvailableRegenerationTime: () => Date | null;
  resetRateLimit: () => Promise<void>;
  getProfileForMember: (memberId: string) => MemberProfile | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    songs: [],
    familyMembers: [],
    countdownResults: [],
    hottest200Results: [],
    profiles: [],
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingProfiles, setIsGeneratingProfiles] = useState(false);
  const [profileError, setProfileError] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    // Subscribe to songs
    const songsSubscription = supabase
      .channel('songs-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, () => {
        loadSongs();
      })
      .subscribe();

    // Subscribe to family members
    const membersSubscription = supabase
      .channel('members-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, () => {
        loadFamilyMembers();
      })
      .subscribe();

    // Subscribe to votes
    const votesSubscription = supabase
      .channel('votes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        loadFamilyMembers(); // Reload to get updated votes
      })
      .subscribe();

    // Subscribe to countdown results
    const resultsSubscription = supabase
      .channel('results-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countdown_results' }, () => {
        loadCountdownResults();
      })
      .subscribe();

    // Subscribe to profiles
    const profilesSubscription = supabase
      .channel('profiles-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_profiles' }, () => {
        loadProfiles();
      })
      .subscribe();

    return () => {
      songsSubscription.unsubscribe();
      membersSubscription.unsubscribe();
      votesSubscription.unsubscribe();
      resultsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadSongs(),
      loadFamilyMembers(),
      loadCountdownResults(),
      loadProfiles(),
    ]);
    setLoading(false);
  };

  const loadSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('artist', { ascending: true });

    if (error) {
      console.error('Error loading songs:', error);
      return;
    }

    const songs = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      thumbnail: row.thumbnail || undefined,
      isAustralian: row.is_australian,
    }));

    setState((prev) => ({ ...prev, songs }));
  };

  const loadFamilyMembers = async () => {
    // Get family members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('*')
      .order('name', { ascending: true });

    if (membersError) {
      console.error('Error loading family members:', membersError);
      return;
    }

    // Get votes for all members
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .order('rank', { ascending: true });

    if (votesError) {
      console.error('Error loading votes:', votesError);
      return;
    }

    // Combine members with their votes
    const familyMembers: FamilyMember[] = (members || []).map((member: any) => ({
      id: member.id,
      name: member.name,
      votes: (votes || [])
        .filter((v: any) => v.family_member_id === member.id)
        .map((v: any) => ({
          songId: v.song_id,
          rank: v.rank,
        })),
    }));

    setState((prev) => ({ ...prev, familyMembers }));
  };

  const loadCountdownResults = async () => {
    const { data, error } = await supabase
      .from('countdown_results')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading countdown results:', error);
      return;
    }

    const countdownResults: CountdownResult[] = [];
    const hottest200Results: CountdownResult[] = [];

    (data || []).forEach((result: any) => {
      const countdownResult = {
        songId: result.song_id,
        position: result.position,
      };

      if (result.type === 'hottest100') {
        countdownResults.push(countdownResult);
      } else {
        hottest200Results.push(countdownResult);
      }
    });

    setState((prev) => ({ ...prev, countdownResults, hottest200Results }));
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('member_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    const profiles: MemberProfile[] = (data || []).map((row: any) => ({
      id: row.id,
      familyMemberId: row.family_member_id,
      label: row.label,
      musicTasteDescription: row.music_taste_description,
      performanceCommentary: row.performance_commentary,
      lastLabelRegeneration: row.last_label_regeneration ? new Date(row.last_label_regeneration) : null,
      lastCommentaryUpdate: row.last_commentary_update ? new Date(row.last_commentary_update) : null,
      lastMusicTasteUpdate: row.last_music_taste_update ? new Date(row.last_music_taste_update) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    setState((prev) => ({ ...prev, profiles }));
  };

  const addSong = async (song: Omit<Song, 'id'>) => {
    const { error } = await supabase
      .from('songs')
      .insert([{
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail || null,
        is_australian: song.isAustralian || false,
      }] as any);

    if (error) {
      console.error('Error adding song:', error);
      throw error;
    }
  };

  const addSongs = async (songs: Omit<Song, 'id'>[]) => {
    const { error } = await supabase
      .from('songs')
      .insert(songs.map(s => ({
        title: s.title,
        artist: s.artist,
        thumbnail: s.thumbnail || null,
        is_australian: s.isAustralian || false,
      })) as any);

    if (error) {
      console.error('Error adding songs:', error);
      const errorMessage = error.message || error.details || 'Unknown database error';
      throw new Error(`Database error: ${errorMessage}`);
    }
  };

  const removeSong = async (songId: string) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      console.error('Error removing song:', error);
      throw error;
    }
  };

  const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'votes'>) => {
    const { error } = await supabase
      .from('family_members')
      .insert([{ name: member.name }] as any);

    if (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    // Update member name
    const { error: memberError } = await supabase
      .from('family_members')
      // @ts-ignore - Type mismatch with Supabase generated types
      .update({ name: member.name })
      .eq('id', member.id);

    if (memberError) {
      console.error('Error updating family member:', memberError);
      throw memberError;
    }

    // Delete existing votes
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('family_member_id', member.id);

    if (deleteError) {
      console.error('Error deleting votes:', deleteError);
      throw deleteError;
    }

    // Insert new votes
    if (member.votes.length > 0) {
      const { error: votesError } = await supabase
        .from('votes')
        .insert(
          member.votes.map((vote) => ({
            family_member_id: member.id,
            song_id: vote.songId,
            rank: vote.rank,
          })) as any
        );

      if (votesError) {
        console.error('Error adding votes:', votesError);
        throw votesError;
      }
    }
  };

  const removeFamilyMember = async (memberId: string) => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing family member:', error);
      throw error;
    }
  };

  const addCountdownResult = async (result: Omit<CountdownResult, 'id'>) => {
    const type = result.position <= 100 ? 'hottest100' : 'hottest200';

    const { error } = await supabase
      .from('countdown_results')
      .insert([{
        song_id: result.songId,
        position: result.position,
        type,
      }] as any);

    if (error) {
      console.error('Error adding countdown result:', error);
      throw error;
    }
  };

  const updateCountdownResults = async (results: Omit<CountdownResult, 'id'>[]) => {
    // Delete existing hottest100 results
    const { error: deleteError } = await supabase
      .from('countdown_results')
      .delete()
      .eq('type', 'hottest100');

    if (deleteError) {
      console.error('Error deleting countdown results:', deleteError);
      throw deleteError;
    }

    // Insert new results
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('countdown_results')
        .insert(
          results.map((r) => ({
            song_id: r.songId,
            position: r.position,
            type: 'hottest100' as const,
          })) as any
        );

      if (insertError) {
        console.error('Error inserting countdown results:', insertError);
        throw insertError;
      }
    }
  };

  const addHottest200Result = async (result: Omit<CountdownResult, 'id'>) => {
    const { error } = await supabase
      .from('countdown_results')
      .insert([{
        song_id: result.songId,
        position: result.position,
        type: 'hottest200',
      }] as any);

    if (error) {
      console.error('Error adding hottest200 result:', error);
      throw error;
    }
  };

  const updateHottest200Results = async (results: Omit<CountdownResult, 'id'>[]) => {
    // Delete existing hottest200 results
    const { error: deleteError } = await supabase
      .from('countdown_results')
      .delete()
      .eq('type', 'hottest200');

    if (deleteError) {
      console.error('Error deleting hottest200 results:', deleteError);
      throw deleteError;
    }

    // Insert new results
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('countdown_results')
        .insert(
          results.map((r) => ({
            song_id: r.songId,
            position: r.position,
            type: 'hottest200' as const,
          })) as any
        );

      if (insertError) {
        console.error('Error inserting hottest200 results:', insertError);
        throw insertError;
      }
    }
  };

  const clearAllData = async () => {
    // Delete in order due to foreign key constraints
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('countdown_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('family_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const canRegenerateMusicTaste = (memberId: string): boolean => {
    const profile = state.profiles.find(p => p.familyMemberId === memberId);

    // New member (no profile) can always generate
    if (!profile || !profile.lastMusicTasteUpdate) return true;

    // Check if 24 hours have passed
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(profile.lastMusicTasteUpdate) < twentyFourHoursAgo;
  };

  const generateMusicTasteProfile = async (memberId: string) => {
    setIsGeneratingProfiles(true);
    setProfileError('');

    try {
      const member = state.familyMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      // Check 24-hour rate limit
      if (!canRegenerateMusicTaste(memberId)) {
        throw new Error('Music taste was updated recently. Please wait 24 hours before regenerating.');
      }

      const result = await generateMusicTasteProfileAPI(member, state.songs);

      // Upsert to database
      const { error } = await supabase
        .from('member_profiles')
        .upsert({
          family_member_id: memberId,
          music_taste_description: result.musicTasteDescription,
          last_music_taste_update: new Date().toISOString(),
        } as any, {
          onConflict: 'family_member_id'
        });

      if (error) throw error;
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to generate profile');
      console.error('Music taste generation error:', err);
    } finally {
      setIsGeneratingProfiles(false);
    }
  };

  const regenerateAllMusicTastes = async () => {
    setIsGeneratingProfiles(true);
    setProfileError('');

    try {
      let regeneratedCount = 0;
      let skippedCount = 0;

      // Get leaderboard to calculate scores
      const { getLeaderboard } = await import('../utils/scoring');
      const leaderboard = getLeaderboard(state.familyMembers, state.countdownResults, state.hottest200Results);

      // Collect existing labels as we generate
      const usedLabels: string[] = [];

      for (const member of state.familyMembers) {
        // Check 24-hour rate limit
        if (!canRegenerateMusicTaste(member.id)) {
          console.log(`Skipping ${member.name} - updated within last 24 hours`);
          // Still add their existing label to the used list
          const existingProfile = state.profiles.find(p => p.familyMemberId === member.id);
          if (existingProfile?.label) {
            usedLabels.push(existingProfile.label);
          }
          skippedCount++;
          continue;
        }

        // Use full_regeneration mode which is already deployed
        const { generateFullProfileAPI } = await import('../utils/profileGenerator');
        const result = await generateFullProfileAPI(
          member,
          state.songs,
          state.countdownResults,
          state.hottest200Results,
          leaderboard,
          usedLabels
        );

        const { error } = await supabase
          .from('member_profiles')
          .upsert({
            family_member_id: member.id,
            label: result.label,
            music_taste_description: result.musicTasteDescription,
            performance_commentary: result.performanceCommentary,
            last_music_taste_update: new Date().toISOString(),
            last_label_regeneration: new Date().toISOString(),
            last_commentary_update: new Date().toISOString(),
          } as any, {
            onConflict: 'family_member_id'
          });

        if (error) {
          console.error(`Error upserting profile for ${member.name}:`, error);
          throw error;
        }

        // Add the new label to the used list
        usedLabels.push(result.label);
        regeneratedCount++;
      }

      console.log(`Regenerated ${regeneratedCount} profiles, skipped ${skippedCount}`);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to regenerate profiles');
      console.error('Profile regeneration error:', err);
    } finally {
      setIsGeneratingProfiles(false);
    }
  };

  const getProfileForMember = (memberId: string): MemberProfile | undefined => {
    return state.profiles.find(p => p.familyMemberId === memberId);
  };

  const getNextAvailableRegenerationTime = (): Date | null => {
    // Find the most recent update across all profiles
    const mostRecentUpdate = state.profiles
      .filter(p => p.lastMusicTasteUpdate)
      .map(p => new Date(p.lastMusicTasteUpdate!).getTime())
      .sort((a, b) => b - a)[0];

    if (!mostRecentUpdate) return null;

    // Add 24 hours to the most recent update
    const nextAvailable = new Date(mostRecentUpdate + 24 * 60 * 60 * 1000);

    // If the time has passed, return null (can regenerate now)
    if (nextAvailable <= new Date()) return null;

    return nextAvailable;
  };

  const resetRateLimit = async () => {
    // Set all profile timestamps to 25 hours ago to bypass rate limit
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('member_profiles')
      // @ts-ignore - Type mismatch with Supabase generated types
      .update({
        last_music_taste_update: twentyFiveHoursAgo,
        last_label_regeneration: twentyFiveHoursAgo,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

    if (error) {
      console.error('Error resetting rate limit:', error);
      throw error;
    }

    // Reload profiles to reflect the change
    await loadProfiles();
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        loading,
        isGeneratingProfiles,
        profileError,
        addSong,
        addSongs,
        removeSong,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        addCountdownResult,
        updateCountdownResults,
        addHottest200Result,
        updateHottest200Results,
        clearAllData,
        generateMusicTasteProfile,
        regenerateAllMusicTastes,
        canRegenerateMusicTaste,
        getNextAvailableRegenerationTime,
        resetRateLimit,
        getProfileForMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
