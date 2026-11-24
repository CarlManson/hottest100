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
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[] = []
): Award[] {
  // Only calculate awards when Hottest 100 is complete
  if (countdownResults.length < 100) {
    return [];
  }

  const awards: Award[] = [];
  const allResults = [...countdownResults, ...hottest200Results];
  const hasHottest200 = hottest200Results.length > 0;

  // Helper: Get all matches for a member (across all results)
  const getAllMatches = (member: FamilyMember) => {
    return member.votes.filter(vote =>
      allResults.some(r => r.songId === vote.songId)
    );
  };

  // Helper: Get Hottest 100 matches only
  const getHottest100Matches = (member: FamilyMember) => {
    return member.votes.filter(vote =>
      countdownResults.some(r => r.songId === vote.songId)
    );
  };

  // Helper: Get Hottest 200 (101-200) matches only
  const getHottest200Matches = (member: FamilyMember) => {
    return member.votes.filter(vote =>
      hottest200Results.some(r => r.songId === vote.songId)
    );
  };

  // Helper: Get song details
  const getSong = (songId: string) => songs.find(s => s.id === songId);
  const getResult = (songId: string) => allResults.find(r => r.songId === songId);

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
    const matches = getAllMatches(member);
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
    const matches = getAllMatches(member);
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

  // 🎯 Sharpshooter - Best average position accuracy (Hottest 100)
  const accuracyScores = familyMembers.map(member => {
    const matches = getHottest100Matches(member);
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
    const matches = getAllMatches(member);
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

  // 😢 So Close - Picks that made 101-200 but missed the Hottest 100
  if (hasHottest200) {
    const closeCallScores = familyMembers.map(member => {
      // Count votes that made 101-200 but not the Hottest 100
      const closeMatches = getHottest200Matches(member);
      return { member, count: closeMatches.length };
    }).filter(s => s.count > 0);

    if (closeCallScores.length > 0) {
      const mostClose = Math.max(...closeCallScores.map(s => s.count));
      const soClose = closeCallScores.find(s => s.count === mostClose);
      if (soClose && soClose.count >= 2) {
        awards.push({
          id: 'so-close',
          emoji: '😢',
          title: 'So Close',
          description: 'Most picks just outside the 100',
          winnerId: soClose.member.id,
          winnerName: soClose.member.name,
          details: `${soClose.count} ${soClose.count === 1 ? 'pick' : 'picks'} landed 101-200`
        });
      }
    }
  } else {
    // Without Hottest 200 data, check for complete misses
    const closeCallScores = familyMembers.map(member => {
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
  }

  // 🏆 Perfect 10 - All 10 picks made the countdown (100 or 200)
  const perfectPickers = familyMembers.filter(member => {
    if (member.votes.length !== 10) return false;
    const matches = getAllMatches(member);
    return matches.length === 10;
  });

  if (perfectPickers.length > 0) {
    perfectPickers.forEach(member => {
      const inTop100 = getHottest100Matches(member).length;
      const details = hasHottest200
        ? `${inTop100}/10 in Hottest 100, all 10 in the 200!`
        : '10/10 songs in the Hottest 100!';
      awards.push({
        id: `perfect-${member.id}`,
        emoji: '🏆',
        title: 'Perfect 10',
        description: 'All picks made the countdown',
        winnerId: member.id,
        winnerName: member.name,
        details
      });
    });
  }

  // 🔥 Hottest 200 specific awards
  if (hasHottest200 && hottest200Results.length >= 100) {
    // 🌟 Deep Diver - Most picks that landed in 101-200 (not Hottest 100)
    const deepDiverScores = familyMembers.map(member => {
      const h200Matches = getHottest200Matches(member);
      return { member, count: h200Matches.length };
    }).filter(s => s.count > 0);

    if (deepDiverScores.length > 0) {
      const mostDeep = Math.max(...deepDiverScores.map(s => s.count));
      const deepDiver = deepDiverScores.find(s => s.count === mostDeep);
      if (deepDiver && deepDiver.count >= 2) {
        awards.push({
          id: 'deep-diver',
          emoji: '🌟',
          title: 'Deep Diver',
          description: 'Most picks in the 101-200',
          winnerId: deepDiver.member.id,
          winnerName: deepDiver.member.name,
          details: `${deepDiver.count} picks landed in positions 101-200`
        });
      }
    }

    // 💯 Total Domination - Most total matches across both lists
    const totalMatchScores = familyMembers.map(member => {
      const matches = getAllMatches(member);
      return { member, count: matches.length };
    }).sort((a, b) => b.count - a.count);

    if (totalMatchScores.length > 0 && totalMatchScores[0].count >= 8) {
      const dominator = totalMatchScores[0];
      awards.push({
        id: 'total-domination',
        emoji: '💯',
        title: 'Total Domination',
        description: 'Most picks in the entire Hottest 200',
        winnerId: dominator.member.id,
        winnerName: dominator.member.name,
        details: `${dominator.count}/10 picks made it!`
      });
    }
  }

  return awards;
}
