import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Song, FamilyMember, CountdownResult } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType extends AppState {
  loading: boolean;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    songs: [],
    familyMembers: [],
    countdownResults: [],
    hottest200Results: [],
  });
  const [loading, setLoading] = useState(true);

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

    return () => {
      songsSubscription.unsubscribe();
      membersSubscription.unsubscribe();
      votesSubscription.unsubscribe();
      resultsSubscription.unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadSongs(),
      loadFamilyMembers(),
      loadCountdownResults(),
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

    setState((prev) => ({ ...prev, songs: data || [] }));
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
    const familyMembers: FamilyMember[] = (members || []).map((member) => ({
      id: member.id,
      name: member.name,
      votes: (votes || [])
        .filter((v) => v.family_member_id === member.id)
        .map((v) => ({
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

    (data || []).forEach((result) => {
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

  const addSong = async (song: Omit<Song, 'id'>) => {
    const { error } = await supabase
      .from('songs')
      .insert([{ title: song.title, artist: song.artist }]);

    if (error) {
      console.error('Error adding song:', error);
      throw error;
    }
  };

  const addSongs = async (songs: Omit<Song, 'id'>[]) => {
    const { error } = await supabase
      .from('songs')
      .insert(songs.map(s => ({ title: s.title, artist: s.artist })));

    if (error) {
      console.error('Error adding songs:', error);
      throw error;
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
      .insert([{ name: member.name }]);

    if (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    // Update member name
    const { error: memberError } = await supabase
      .from('family_members')
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
          }))
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
      }]);

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
          }))
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
      }]);

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
          }))
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

  return (
    <AppContext.Provider
      value={{
        ...state,
        loading,
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
