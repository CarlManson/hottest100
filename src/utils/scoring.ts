import type { FamilyMember, CountdownResult, Song } from '../types';

/** Flat bonus for picking the song that finishes #1 */
export const WINNER_PICK_BONUS = 50;

/** The song at #1, once it has been entered */
export const getWinningSongId = (countdownResults: CountdownResult[]): string | undefined =>
  countdownResults.find((r) => r.position === 1)?.songId;

/** WINNER_PICK_BONUS if the member's winner pick is the #1 song, else 0 */
export const calculateWinnerBonus = (
  member: FamilyMember,
  countdownResults: CountdownResult[]
): number => {
  const winner = getWinningSongId(countdownResults);
  return winner && member.winnerSongId === winner ? WINNER_PICK_BONUS : 0;
};

export const calculateScore = (
  member: FamilyMember,
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): number => {
  let score = 0;
  const hasHottest200 = hottest200Results.length > 0;

  // Dynamic scoring based on whether Hottest 200 has been revealed
  if (hasHottest200) {
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
        score += 201 - result.position;
      }
    });
  } else {
    // Simple scoring when only Hottest 100 exists: position 100 = 1 point, position 1 = 100 points
    countdownResults.forEach((result) => {
      const vote = member.votes.find((v) => v.songId === result.songId);
      if (vote) {
        score += 1 + (100 - result.position);
      }
    });
  }

  return score + calculateWinnerBonus(member, countdownResults);
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
      bonus: calculateWinnerBonus(member, countdownResults),
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
  const hasHottest200 = hottest200Results.length > 0;

  // Calculate points for each song in the countdown using dynamic scoring
  const songPoints = allResults.map((result) => {
    const isHottest200 = result.position > 100;

    if (hasHottest200) {
      // With Hottest 200: Hottest 100 is 101-200 pts, Hottest 200 is 1-100 pts
      return isHottest200
        ? 201 - result.position
        : 101 + (100 - result.position);
    } else {
      // Without Hottest 200: Simple 1-100 scoring for Hottest 100 only
      return 1 + (100 - result.position);
    }
  });

  // Sort in descending order and take top 10
  const top10Points = songPoints.sort((a, b) => b - a).slice(0, 10);

  // Sum the top 10 scores, plus the bonus a perfect picker would also have called
  const winnerBonus = getWinningSongId(countdownResults) ? WINNER_PICK_BONUS : 0;
  return top10Points.reduce((sum, points) => sum + points, 0) + winnerBonus;
};

/**
 * Calculate efficiency percentage (actual score vs max possible score)
 */
export const calculateEfficiency = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};
