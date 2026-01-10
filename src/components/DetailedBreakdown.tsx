import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateLeaderboard } from '../utils/scoring';

export const DetailedBreakdown: React.FC = () => {
  const { songs, familyMembers, countdownResults, hottest200Results } = useApp();

  const leaderboard = calculateLeaderboard(familyMembers, [...countdownResults, ...hottest200Results], songs);
  const allResults = [...countdownResults, ...hottest200Results];

  // Get score for a specific song
  const getSongScore = (songId: string) => {
    const result = allResults.find(r => r.songId === songId);
    if (!result) return null;

    // Calculate score based on position
    if (result.position <= 100) {
      // Hottest 100: Position 100 = 101 points, Position 1 = 200 points
      return 101 + (100 - result.position);
    } else {
      // Hottest 200: Position 200 = 1 point, Position 101 = 100 points
      return 101 + (200 - result.position);
    }
  };

  return (
    <div className="max-w-[95vw] mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <a
          href="#leaderboard"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline inline-block mb-3"
        >
          ← Back to Leaderboard
        </a>
        <h2 className="text-xl sm:text-3xl font-bold mb-2">Detailed Vote Breakdown</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Complete breakdown of all votes and scores earned
        </p>
      </div>

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
              {leaderboard.map((entry, index) => {
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
                              {song.isAustralian && (
                                <div className="mt-0.5">
                                  <span className="bg-orange-500 text-white text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded">
                                    AUS
                                  </span>
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
                      {entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
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
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">AUS</span>
            <span>Australian artist</span>
          </div>
        </div>
      </div>
    </div>
  );
};
