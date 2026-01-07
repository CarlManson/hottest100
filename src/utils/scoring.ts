import type { FamilyMember, CountdownResult, Song } from '../types';

export const calculateScore = (
  member: FamilyMember,
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): number => {
  let score = 0;

  // Hottest 100 scoring: position 100 = 101 points, position 1 = 200 points
  countdownResults.forEach((result) => {
    const vote = member.votes.find((v) => v.songId === result.songId);
    if (vote) {
      score += 101 + (100 - result.position);
    }
  });

  // Hottest 200 (101-200) scoring: position 200 = 1 point, position 101 = 100 points
  hottest200Results.forEach((result) => {
    const vote = member.votes.find((v) => v.songId === result.songId);
    if (vote) {
      score += 101 + (200 - result.position);
    }
  });

  return score;
};

export const getLeaderboard = (
  familyMembers: FamilyMember[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
) => {
  return familyMembers
    .map((member) => ({
      member,
      score: calculateScore(member, countdownResults, hottest200Results),
    }))
    .sort((a, b) => b.score - a.score);
};

export const getSongMatches = (
  member: FamilyMember,
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  songs: Song[]
) => {
  const allResults = [...countdownResults, ...hottest200Results];

  return member.votes
    .map((vote) => {
      const result = allResults.find((r) => r.songId === vote.songId);
      const song = songs.find((s) => s.id === vote.songId);
      return {
        vote,
        result,
        song,
      };
    })
    .filter((match) => match.result && match.song);
};
