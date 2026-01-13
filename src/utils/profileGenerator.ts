import type { FamilyMember, Song, CountdownResult, MemberProfile } from '../types';

// API call for music taste only
export async function generateMusicTasteProfileAPI(
  member: FamilyMember,
  songs: Song[]
): Promise<{ musicTasteDescription: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const pickDetails = buildPickDetails(member, songs, [], []);

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      mode: 'music_taste',
      memberId: member.id,
      memberName: member.name,
      picks: pickDetails,
      totalPicks: member.votes.length,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge function request failed: ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return { musicTasteDescription: data.musicTasteDescription };
}

// API call for label and music taste
export async function generateLabelAndTasteAPI(
  member: FamilyMember,
  songs: Song[]
): Promise<{ label: string; musicTasteDescription: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const pickDetails = buildPickDetails(member, songs, [], []);

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      mode: 'label_and_taste',
      memberId: member.id,
      memberName: member.name,
      picks: pickDetails,
      totalPicks: member.votes.length,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge function request failed: ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    label: data.label,
    musicTasteDescription: data.musicTasteDescription,
  };
}

// API call for running commentary (batch)
export async function generateRunningCommentaryAPI(
  members: FamilyMember[],
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  leaderboard: Array<{ member: FamilyMember; score: number }>,
  existingProfiles: MemberProfile[]
): Promise<Array<{ memberId: string; performanceCommentary: string }>> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const allResults = [...countdownResults, ...hottest200Results];

  const membersData = members.map(member => {
    const leaderboardEntry = leaderboard.find(e => e.member.id === member.id);
    const score = leaderboardEntry?.score || 0;
    const rank = leaderboard.findIndex(e => e.member.id === member.id) + 1;
    const matchCount = member.votes.filter(vote =>
      allResults.some(r => r.songId === vote.songId)
    ).length;
    const profile = existingProfiles.find(p => p.familyMemberId === member.id);

    return {
      memberId: member.id,
      memberName: member.name,
      picks: buildPickDetails(member, songs, countdownResults, hottest200Results),
      score,
      rank,
      totalMembers: members.length,
      matchCount,
      totalPicks: member.votes.length,
      currentMusicTaste: profile?.musicTasteDescription || undefined,
    };
  });

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      mode: 'running_commentary',
      members: membersData,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge function request failed: ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.profiles;
}

// API call for full regeneration
export async function generateFullProfileAPI(
  member: FamilyMember,
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  leaderboard: Array<{ member: FamilyMember; score: number }>,
  existingLabels?: string[]
): Promise<{
  label: string;
  musicTasteDescription: string;
  performanceCommentary: string;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const allResults = [...countdownResults, ...hottest200Results];
  const leaderboardEntry = leaderboard.find(e => e.member.id === member.id);
  const score = leaderboardEntry?.score || 0;
  const rank = leaderboard.findIndex(e => e.member.id === member.id) + 1;
  const matchCount = member.votes.filter(vote =>
    allResults.some(r => r.songId === vote.songId)
  ).length;

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      mode: 'full_regeneration',
      memberId: member.id,
      memberName: member.name,
      picks: buildPickDetails(member, songs, countdownResults, hottest200Results),
      score,
      rank,
      totalMembers: leaderboard.length,
      matchCount,
      totalPicks: member.votes.length,
      existingLabels: existingLabels || [],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge function request failed: ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    label: data.label,
    musicTasteDescription: data.musicTasteDescription,
    performanceCommentary: data.performanceCommentary,
  };
}

// Helper function
function buildPickDetails(
  member: FamilyMember,
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): string {
  const allResults = [...countdownResults, ...hottest200Results];

  return member.votes.map(vote => {
    const song = songs.find(s => s.id === vote.songId);
    const result = allResults.find(r => r.songId === vote.songId);

    if (!song) return null;

    const madeIt = result ? `Made #${result.position}` : "Didn't make it";
    const aussie = song.isAustralian ? ' (Aussie)' : '';

    return `${vote.rank}. "${song.title}" by ${song.artist}${aussie} - ${madeIt}`;
  }).filter(Boolean).join('\n');
}
