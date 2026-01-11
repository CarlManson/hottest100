import type { FamilyMember, Song, CountdownResult } from '../types';

export interface MemberProfile {
  memberId: string;
  label: string; // 2-3 word description
  description: string; // Full paragraph
}

export async function generateMemberProfile(
  member: FamilyMember,
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  currentScore: number,
  currentRank: number,
  totalMembers: number
): Promise<MemberProfile> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file');
  }

  const allResults = [...countdownResults, ...hottest200Results];

  // Build pick details
  const pickDetails = member.votes.map(vote => {
    const song = songs.find(s => s.id === vote.songId);
    const result = allResults.find(r => r.songId === vote.songId);

    if (!song) return null;

    const madeIt = result ? `Made #${result.position}` : "Didn't make it";
    const aussie = song.isAustralian ? ' (Aussie)' : '';

    return `${vote.rank}. "${song.title}" by ${song.artist}${aussie} - ${madeIt}`;
  }).filter(Boolean).join('\n');

  const matchCount = member.votes.filter(vote =>
    allResults.some(r => r.songId === vote.songId)
  ).length;

  const prompt = `You're a cheeky Aussie music critic writing tongue-in-cheek profiles for a family's Triple J Hottest 100 predictions competition. Be friendly, funny, and use Aussie slang.

**${member.name}'s Picks:**
${pickDetails}

**Their Performance:**
- Score: ${currentScore} points
- Ranking: ${currentRank} of ${totalMembers}
- Matches: ${matchCount} out of ${member.votes.length} picks made the countdown

Write a response in this EXACT format:

LABEL: [2-3 word punchy description like "Indie Tragic", "Mainstream Merchant", "Wildcard Wizard", etc]

DESCRIPTION: [One paragraph (3-4 sentences) that's cheeky and fun, analyzing their music taste and performance. Use Aussie slang, be tongue-in-cheek but friendly. Comment on their song choices, how they're performing, and what it says about them. Make it personal and funny but good-natured.]

Keep it short, punchy, and funny. Don't be mean-spirited.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse the response
  const labelMatch = content.match(/LABEL:\s*(.+?)(?:\n|$)/i);
  const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?:\n\n|$)/is);

  if (!labelMatch || !descMatch) {
    throw new Error('Failed to parse API response');
  }

  return {
    memberId: member.id,
    label: labelMatch[1].trim(),
    description: descMatch[1].trim(),
  };
}

export async function generateAllProfiles(
  members: FamilyMember[],
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  leaderboard: Array<{ member: FamilyMember; score: number }>
): Promise<MemberProfile[]> {
  const profiles: MemberProfile[] = [];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const leaderboardEntry = leaderboard.find(e => e.member.id === member.id);
    const score = leaderboardEntry?.score || 0;
    const rank = leaderboard.findIndex(e => e.member.id === member.id) + 1;

    const profile = await generateMemberProfile(
      member,
      songs,
      countdownResults,
      hottest200Results,
      score,
      rank,
      members.length
    );

    profiles.push(profile);
  }

  return profiles;
}
