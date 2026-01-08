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

/**
 * Calculate the maximum possible score based on the top 10 highest-scoring songs
 * currently in the countdown (what a perfect picker would have scored)
 */
export const calculateMaxPossibleScore = (
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): number => {
  const allResults = [...countdownResults, ...hottest200Results];

  // Calculate points for each song in the countdown
  const songPoints = allResults.map((result) => {
    const isHottest200 = result.position > 100;
    return isHottest200
      ? 101 + (200 - result.position)
      : 101 + (100 - result.position);
  });

  // Sort in descending order and take top 10
  const top10Points = songPoints.sort((a, b) => b - a).slice(0, 10);

  // Sum the top 10 scores
  return top10Points.reduce((sum, points) => sum + points, 0);
};

/**
 * Calculate efficiency percentage (actual score vs max possible score)
 */
export const calculateEfficiency = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};
