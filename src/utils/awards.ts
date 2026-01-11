import type { FamilyMember, Song, CountdownResult } from '../types';

export interface Award {
  id: string;
  emoji: string;
  title: string;
  description: string;
  winnerId: string;
  winnerName: string;
  details: string;
}

export function calculateAwards(
  familyMembers: FamilyMember[],
  songs: Song[],
  countdownResults: CountdownResult[]
): Award[] {
  // Only calculate awards when Hottest 100 is complete
  if (countdownResults.length < 100) {
    return [];
  }

  const awards: Award[] = [];

  // Helper: Get all matches for a member
  const getMatches = (member: FamilyMember) => {
    return member.votes.filter(vote =>
      countdownResults.some(r => r.songId === vote.songId)
    );
  };

  // Helper: Get song details
  const getSong = (songId: string) => songs.find(s => s.id === songId);
  const getResult = (songId: string) => countdownResults.find(r => r.songId === songId);

  // 🔮 Oracle - Got #1 song right
  const numberOneResult = countdownResults.find(r => r.position === 1);
  if (numberOneResult) {
    const oracle = familyMembers.find(m =>
      m.votes.some(v => v.songId === numberOneResult.songId)
    );
    if (oracle) {
      const song = getSong(numberOneResult.songId);
      awards.push({
        id: 'oracle',
        emoji: '🔮',
        title: 'The Oracle',
        description: 'Predicted the #1 song',
        winnerId: oracle.id,
        winnerName: oracle.name,
        details: song ? `Picked "${song.title}" by ${song.artist}` : ''
      });
    }
  }

  // 🦘 True Blue - Most Australian artists that made it
  const australianScores = familyMembers.map(member => {
    const matches = getMatches(member);
    const australianMatches = matches.filter(vote => {
      const song = getSong(vote.songId);
      return song?.isAustralian;
    });
    return { member, count: australianMatches.length };
  }).filter(s => s.count > 0);

  if (australianScores.length > 0) {
    const maxAussie = Math.max(...australianScores.map(s => s.count));
    const trueBlue = australianScores.find(s => s.count === maxAussie);
    if (trueBlue) {
      awards.push({
        id: 'true-blue',
        emoji: '🦘',
        title: 'True Blue',
        description: 'Most Aussie artists in the countdown',
        winnerId: trueBlue.member.id,
        winnerName: trueBlue.member.name,
        details: `${trueBlue.count} Australian ${trueBlue.count === 1 ? 'artist' : 'artists'}`
      });
    }
  }

  // 💎 Diamond in the Rough - Picked the lowest-ranked song that still made it
  const lowestPicks = familyMembers.map(member => {
    const matches = getMatches(member);
    if (matches.length === 0) return null;

    const positions = matches.map(vote => {
      const result = getResult(vote.songId);
      return result?.position || 0;
    }).filter(p => p > 0);

    const lowest = Math.max(...positions);
    return { member, position: lowest };
  }).filter(Boolean);

  if (lowestPicks.length > 0) {
    const deepestDig = Math.max(...lowestPicks.map(p => p!.position));
    const diamond = lowestPicks.find(p => p!.position === deepestDig);
    if (diamond) {
      const vote = diamond.member.votes.find(v => getResult(v.songId)?.position === deepestDig);
      const song = vote ? getSong(vote.songId) : null;
      awards.push({
        id: 'diamond',
        emoji: '💎',
        title: 'Diamond in the Rough',
        description: 'Picked the deepest cut',
        winnerId: diamond.member.id,
        winnerName: diamond.member.name,
        details: song ? `"${song.title}" at #${deepestDig}` : `Position #${deepestDig}`
      });
    }
  }

  // 🎯 Sharpshooter - Best average position accuracy
  const accuracyScores = familyMembers.map(member => {
    const matches = getMatches(member);
    if (matches.length === 0) return null;

    const totalDiff = matches.reduce((sum, vote) => {
      const result = getResult(vote.songId);
      if (!result) return sum;
      const diff = Math.abs(vote.rank - (101 - result.position)); // Convert position to points
      return sum + diff;
    }, 0);

    const avgDiff = totalDiff / matches.length;
    return { member, avgDiff, matches: matches.length };
  }).filter(Boolean);

  if (accuracyScores.length > 0) {
    const bestAccuracy = Math.min(...accuracyScores.map(s => s!.avgDiff));
    const sharpshooter = accuracyScores.find(s => s!.avgDiff === bestAccuracy);
    if (sharpshooter) {
      awards.push({
        id: 'sharpshooter',
        emoji: '🎯',
        title: 'Sharpshooter',
        description: 'Best prediction accuracy',
        winnerId: sharpshooter.member.id,
        winnerName: sharpshooter.member.name,
        details: `${sharpshooter.matches} spot-on ${sharpshooter.matches === 1 ? 'pick' : 'picks'}`
      });
    }
  }

  // 🎲 Risk Taker - Most picks that didn't make it
  const riskScores = familyMembers.map(member => {
    const matches = getMatches(member);
    const misses = member.votes.length - matches.length;
    return { member, misses };
  }).filter(s => s.misses > 0);

  if (riskScores.length > 0) {
    const mostRisky = Math.max(...riskScores.map(s => s.misses));
    const riskTaker = riskScores.find(s => s.misses === mostRisky);
    if (riskTaker && riskTaker.misses >= 3) {
      awards.push({
        id: 'risk-taker',
        emoji: '🎲',
        title: 'Risk Taker',
        description: 'Boldest predictions',
        winnerId: riskTaker.member.id,
        winnerName: riskTaker.member.name,
        details: `${riskTaker.misses} brave ${riskTaker.misses === 1 ? 'pick' : 'picks'} didn't make it`
      });
    }
  }

  // 😢 So Close - Had picks at positions 101-110 in hottest200
  // Note: We're checking if they have votes for songs that didn't make hottest 100 but are close
  // Since we only care about Hottest 100, this checks songs that barely missed
  const closeCallScores = familyMembers.map(member => {
    // Count votes that didn't make the countdown at all
    const misses = member.votes.filter(vote =>
      !countdownResults.some(r => r.songId === vote.songId)
    );
    return { member, misses: misses.length };
  }).filter(s => s.misses > 0);

  if (closeCallScores.length > 0) {
    const mostClose = Math.max(...closeCallScores.map(s => s.misses));
    const soClose = closeCallScores.find(s => s.misses === mostClose);
    if (soClose && soClose.misses >= 3) {
      awards.push({
        id: 'so-close',
        emoji: '😢',
        title: 'So Close',
        description: 'Most heartbreaking misses',
        winnerId: soClose.member.id,
        winnerName: soClose.member.name,
        details: `${soClose.misses} ${soClose.misses === 1 ? 'pick' : 'picks'} didn't make it`
      });
    }
  }

  // 🏆 Perfect 10 - All 10 picks made the countdown
  const perfectPickers = familyMembers.filter(member => {
    if (member.votes.length !== 10) return false;
    const matches = getMatches(member);
    return matches.length === 10;
  });

  if (perfectPickers.length > 0) {
    perfectPickers.forEach(member => {
      awards.push({
        id: `perfect-${member.id}`,
        emoji: '🏆',
        title: 'Perfect 10',
        description: 'All picks made the countdown',
        winnerId: member.id,
        winnerName: member.name,
        details: '10/10 songs in the Hottest 100!'
      });
    });
  }

  return awards;
}
