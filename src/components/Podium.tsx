import React from 'react';
import type { FamilyMember } from '../types';

interface LeaderboardEntry {
  member: FamilyMember;
  score: number;
}

interface PodiumProps {
  entries: LeaderboardEntry[];
  isComplete?: boolean; // True when Hottest 200 is complete
}

interface PodiumPosition {
  entries: LeaderboardEntry[];
  rank: number; // 1, 2, or 3
  height: number; // Calculated height in pixels
}

// Height constants
const MAX_HEIGHT = 160;
const MIN_HEIGHT = 40;

export const Podium: React.FC<PodiumProps> = ({ entries, isComplete: _isComplete = false }) => {
  if (entries.length === 0) return null;

  // Don't show podium if everyone has zero score
  const allZero = entries.every(e => e.score === 0);
  if (allZero) return null;

  // Calculate positions with tie handling
  const positions = calculatePodiumPositions(entries.slice(0, 10)); // Consider top 10 for potential ties

  // Get only positions that fit on podium (ranks 1, 2, 3)
  const podiumPositions = positions.filter(p => p.rank <= 3);

  // Medal and styling configs
  const rankConfig = {
    1: {
      medal: '🥇',
      medalSize: 'text-5xl sm:text-7xl 2xl:text-8xl',
      nameSize: 'text-base sm:text-xl 2xl:text-2xl',
      scoreSize: 'text-3xl sm:text-5xl 2xl:text-6xl',
      scoreColor: 'text-yellow-600',
      baseGradient: 'from-yellow-400 to-yellow-500',
      numberSize: 'text-4xl sm:text-6xl',
      containerWidth: 'podium-first',
      shadow: 'shadow-xl',
    },
    2: {
      medal: '🥈',
      medalSize: 'text-4xl sm:text-6xl 2xl:text-7xl',
      nameSize: 'text-sm sm:text-lg 2xl:text-xl',
      scoreSize: 'text-2xl sm:text-4xl 2xl:text-5xl',
      scoreColor: 'text-gray-400',
      baseGradient: 'from-gray-300 to-gray-400',
      numberSize: 'text-3xl sm:text-5xl',
      containerWidth: 'podium-second',
      shadow: 'shadow-lg',
    },
    3: {
      medal: '🥉',
      medalSize: 'text-4xl sm:text-6xl 2xl:text-7xl',
      nameSize: 'text-sm sm:text-lg 2xl:text-xl',
      scoreSize: 'text-2xl sm:text-4xl 2xl:text-5xl',
      scoreColor: 'text-orange-600',
      baseGradient: 'from-orange-400 to-orange-500',
      numberSize: 'text-3xl sm:text-5xl',
      containerWidth: 'podium-third',
      shadow: 'shadow-lg',
    },
  };

  // Arrange positions for display: 2nd, 1st, 3rd
  const displayOrder: (PodiumPosition | null)[] = [
    podiumPositions.find(p => p.rank === 2) || null,
    podiumPositions.find(p => p.rank === 1) || null,
    podiumPositions.find(p => p.rank === 3) || null,
  ];

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8 lg:gap-12">
      {displayOrder.map((position, idx) => {
        // Don't show anything for empty positions or zero scores
        if (!position || position.entries[0].score === 0) {
          return <div key={idx} className="w-20 sm:w-28" />; // Empty placeholder
        }

        const config = rankConfig[position.rank as 1 | 2 | 3];
        const isTied = position.entries.length > 1;

        return (
          <div key={position.rank} className={`flex flex-col items-center ${config.containerWidth}`}>
            {/* Medal */}
            <div className={`${config.medalSize} mb-2`}>
              {config.medal}
            </div>

            {/* Name(s) */}
            <div className={`font-bold ${config.nameSize} text-gray-800 text-center w-full`}>
              {isTied ? (
                <div className="flex flex-col items-center gap-0.5">
                  {position.entries.slice(0, 3).map((entry, i) => (
                    <span key={entry.member.id} className="truncate block w-full">
                      {entry.member.name}
                      {i < Math.min(position.entries.length, 3) - 1 && position.entries.length <= 3 && (
                        <span className="text-gray-400 mx-1">&</span>
                      )}
                    </span>
                  ))}
                  {position.entries.length > 3 && (
                    <span className="text-xs text-gray-500">+{position.entries.length - 3} more</span>
                  )}
                </div>
              ) : (
                <span className="truncate block">{position.entries[0].member.name}</span>
              )}
            </div>

            {/* Score */}
            <div className={`${config.scoreSize} font-black ${config.scoreColor} mt-2`}>
              {position.entries[0].score}
              {isTied && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">
                  (tied)
                </span>
              )}
            </div>

            {/* Podium Base - only show if score > 0 */}
            {position.entries[0].score > 0 && (
              <div
                className={`w-full bg-gradient-to-br ${config.baseGradient} rounded-t-lg mt-4 ${config.shadow} transition-all duration-500`}
                style={{ height: position.height }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Calculate podium positions with tie handling and dynamic heights
 */
function calculatePodiumPositions(entries: LeaderboardEntry[]): PodiumPosition[] {
  if (entries.length === 0) return [];

  // Sort by score descending
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  // Group by score to find ties
  const positions: PodiumPosition[] = [];
  let currentRank = 1;
  let i = 0;

  while (i < sorted.length && currentRank <= 3) {
    const currentScore = sorted[i].score;

    // Find all entries with this score
    const tiedEntries: LeaderboardEntry[] = [];
    while (i < sorted.length && sorted[i].score === currentScore) {
      tiedEntries.push(sorted[i]);
      i++;
    }

    positions.push({
      entries: tiedEntries,
      rank: currentRank,
      height: 0, // Calculate after we know all positions
    });

    // Next rank skips the number of tied entries
    currentRank += tiedEntries.length;
  }

  // Calculate heights based on scores
  const maxScore = sorted[0]?.score || 0;

  // Scale heights proportionally
  positions.forEach(p => {
    const score = p.entries[0].score;
    const ratio = maxScore > 0 ? score / maxScore : 0;

    // Scale between MIN_HEIGHT and MAX_HEIGHT based on score ratio
    // But also factor in the rank to maintain visual hierarchy
    const rankMultiplier = p.rank === 1 ? 1 : p.rank === 2 ? 0.85 : 0.7;

    if (score === 0) {
      p.height = 0; // No base for zero score
    } else {
      // Height is primarily based on ratio but with rank influence
      const baseHeight = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * ratio * rankMultiplier;
      p.height = Math.max(MIN_HEIGHT, Math.round(baseHeight));
    }
  });

  // Ensure first place is always tallest
  const firstPlace = positions.find(p => p.rank === 1);
  if (firstPlace && firstPlace.entries[0].score > 0) {
    firstPlace.height = MAX_HEIGHT;
  }

  // Ensure proper visual hierarchy (1st >= 2nd >= 3rd) when not tied on score
  for (let j = 1; j < positions.length; j++) {
    const prev = positions[j - 1];
    const curr = positions[j];

    // Only enforce hierarchy if scores are different and both have scores
    if (prev.entries[0].score !== curr.entries[0].score && curr.entries[0].score > 0) {
      // Ensure there's at least a 20px difference for visual distinction
      if (curr.height >= prev.height - 15) {
        curr.height = Math.max(MIN_HEIGHT, prev.height - 20);
      }
    }
  }

  return positions;
}
