import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard } from '../utils/scoring';

type BreakdownTab = 'hottest200' | 'hottest100' | 'positions101to200';

export const DetailedBreakdownTable: React.FC = () => {
  const { songs, familyMembers, countdownResults, hottest200Results } = useApp();

  const hasHottest200 = hottest200Results.length > 0;
  const [activeTab, setActiveTab] = useState<BreakdownTab>('hottest200');

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const allResults = [...countdownResults, ...hottest200Results];

  // Get score for a specific song based on active tab filter
  const getSongScore = (songId: string) => {
    const result = allResults.find(r => r.songId === songId);
    if (!result) return null;

    const isHottest200Song = result.position > 100;

    // Filter by active tab
    if (activeTab === 'hottest100' && isHottest200Song) return null;
    if (activeTab === 'positions101to200' && !isHottest200Song) return null;

    // Use Hottest 100 standalone scoring when viewing that tab in isolation
    if (activeTab === 'hottest100') {
      return 1 + (100 - result.position);
    }

    // Combined / 101-200 tab: use full dynamic scoring
    if (hasHottest200) {
      if (result.position <= 100) {
        return 101 + (100 - result.position);
      } else {
        return 201 - result.position;
      }
    } else {
      return 1 + (100 - result.position);
    }
  };

  // Calculate filtered totals per member based on active tab
  const filteredScores = useMemo(() => {
    const scores = new Map<string, number>();
    for (const entry of leaderboard) {
      let score = 0;
      for (const vote of entry.member.votes) {
        const pts = getSongScore(vote.songId);
        if (pts !== null) score += pts;
      }
      scores.set(entry.member.id, score);
    }
    return scores;
  }, [leaderboard, activeTab, hasHottest200]);

  // Sort leaderboard by filtered scores
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      const scoreA = filteredScores.get(a.member.id) || 0;
      const scoreB = filteredScores.get(b.member.id) || 0;
      return scoreB - scoreA;
    });
  }, [leaderboard, filteredScores]);

  return (
    <>
      {/* Tabs - only shown when Hottest 200 is active */}
      {hasHottest200 && (
        <div className="flex gap-1 sm:gap-2 mb-4">
          {([
            { key: 'hottest200' as BreakdownTab, label: 'Hottest 200' },
            { key: 'hottest100' as BreakdownTab, label: 'Hottest 100' },
            { key: 'positions101to200' as BreakdownTab, label: '101-200' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${
                activeTab === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
                <th className="sticky left-0 bg-orange-500 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap z-10">
                  Name
                </th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
                  <th
                    key={rank}
                    className="px-2 sm:px-3 py-2 sm:py-3 text-center font-bold whitespace-nowrap min-w-[120px] sm:min-w-[150px]"
                  >
                    Pick #{rank}
                  </th>
                ))}
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold whitespace-nowrap bg-orange-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((entry, index) => {
                // Sort votes by rank to display in order
                const sortedVotes = [...entry.member.votes].sort((a, b) => a.rank - b.rank);

                // Pad with empty slots if less than 10 votes
                const votesWithPadding = [...sortedVotes];
                while (votesWithPadding.length < 10) {
                  votesWithPadding.push({ songId: '', rank: votesWithPadding.length + 1 });
                }

                return (
                  <tr
                    key={entry.member.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-orange-50 transition`}
                  >
                    {/* Name column - sticky */}
                    <td className={`sticky left-0 px-2 sm:px-4 py-2 sm:py-3 font-bold whitespace-nowrap z-10 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-xs sm:text-sm">{entry.member.name}</span>
                      </div>
                    </td>

                    {/* Vote columns */}
                    {votesWithPadding.map((vote, voteIndex) => {
                      if (!vote.songId) {
                        return (
                          <td
                            key={voteIndex}
                            className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-400"
                          >
                            —
                          </td>
                        );
                      }

                      const song = songs.find(s => s.id === vote.songId);
                      const score = getSongScore(vote.songId);
                      const isInCountdown = score !== null;

                      return (
                        <td
                          key={vote.songId}
                          className={`px-2 sm:px-3 py-2 sm:py-3 ${
                            isInCountdown
                              ? 'bg-green-100 border-l-2 border-r-2 border-green-400'
                              : ''
                          }`}
                        >
                          {song ? (
                            <div className="text-center">
                              <div className="font-semibold text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-[150px] mx-auto">
                                {song.title}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-gray-600 truncate max-w-[120px] sm:max-w-[150px] mx-auto">
                                {song.artist}
                              </div>
                              {isInCountdown && (
                                <div className="mt-1 font-bold text-green-700 text-xs sm:text-sm">
                                  +{score} pts
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total score column */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-black text-base sm:text-xl text-orange-600 bg-orange-50">
                      {filteredScores.get(entry.member.id) || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Legend</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 border-2 border-green-400 rounded"></div>
            <span>Song made the countdown (shows points earned)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded"></div>
            <span>Song didn't make the countdown</span>
          </div>
        </div>
      </div>
    </>
  );
};
