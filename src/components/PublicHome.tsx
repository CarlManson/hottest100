import React from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';

export const PublicHome: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs } = useApp();

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);
  const totalResults = countdownResults.length + hottest200Results.length;

  // Determine which results to show in "Latest Entries" and "Featured Song"
  // If Hottest 200 has started, show only those. Otherwise show Hottest 100
  const hasHottest200Started = hottest200Results.length > 0;
  const displayResults = hasHottest200Started ? hottest200Results : countdownResults;

  // Get recent countdown results (sorted ascending, so lowest position is first)
  const recentResults = [...displayResults]
    .sort((a, b) => a.position - b.position);

  // Get the top song (lowest position number from current display results)
  const topSong = recentResults.length > 0 ? recentResults[0] : null;
  const topSongData = topSong ? songs.find(s => s.id === topSong.songId) : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-4xl font-black mb-2 text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Live standings and countdown progress</p>
      </div>

      {/* Stats Cards - Hidden on mobile */}
      <div className={`hidden md:grid gap-4 mb-8 ${hottest200Results.length > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black">{songs.length}</div>
          <div className="text-white/80 font-semibold">Eligible Songs</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black">{familyMembers.length}</div>
          <div className="text-white/80 font-semibold">Family Members</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black">{countdownResults.length}/100</div>
          <div className="text-white/80 font-semibold">Hottest 100</div>
        </div>

        {hottest200Results.length > 0 && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black">{hottest200Results.length}/100</div>
            <div className="text-white/80 font-semibold">Hottest 200</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countdown Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            📊 Countdown Progress
          </h3>
          {totalResults === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-gray-500">No results entered yet</p>
              <p className="text-sm text-gray-400 mt-1">Results will appear here as the countdown happens</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">
                    {hasHottest200Started ? 'Overall Progress' : 'Hottest 100 Progress'}
                  </span>
                  <span className="text-gray-600">
                    {hasHottest200Started
                      ? `${totalResults}/200 songs`
                      : `${countdownResults.length}/100 songs`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                    style={{
                      width: hasHottest200Started
                        ? `${(totalResults / 200) * 100}%`
                        : `${(countdownResults.length / 100) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Featured Top Song */}
              {topSong && topSongData && (
                <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg">
                  <div className="text-xs font-bold text-orange-600 mb-2">🏆 HIGHEST POSITION</div>
                  <div className="flex items-center gap-3">
                    <div className="font-black text-3xl text-orange-600">
                      #{topSong.position}
                    </div>
                    {topSongData.thumbnail && (
                      <img
                        src={topSongData.thumbnail}
                        alt={`${topSongData.title} artwork`}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate">{topSongData.title}</div>
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <span className="truncate">{topSongData.artist}</span>
                        {topSongData.isAustralian && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                            AUS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {recentResults.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {hasHottest200Started ? 'Latest Entries (Hottest 200)' : 'Latest Entries'}
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {recentResults.map((result) => {
                      const song = songs.find(s => s.id === result.songId);
                      if (!song) return null;

                      return (
                        <div
                          key={result.position}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          {song.thumbnail && (
                            <img
                              src={song.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{song.title}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="truncate">{song.artist}</span>
                              {song.isAustralian && (
                                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                  AUS
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-orange-600 text-lg flex-shrink-0">
                            #{result.position}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            🏆 Leaderboard
          </h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No votes yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => {
                const matchCount = entry.member.votes.filter(vote =>
                  [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                ).length;
                const efficiency = calculateEfficiency(entry.score, maxPossibleScore);

                return (
                  <div
                    key={entry.member.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{entry.member.name}</div>
                      <div className="text-sm text-gray-600">
                        {matchCount} match{matchCount !== 1 ? 'es' : ''} • {entry.member.votes.length}/10 votes
                      </div>
                      {maxPossibleScore > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all"
                                style={{ width: `${efficiency}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 w-10">
                              {efficiency}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-orange-600">
                        {entry.score}
                      </div>
                      {maxPossibleScore > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          of {maxPossibleScore}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {leaderboard.length > 5 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  +{leaderboard.length - 5} more • View full leaderboard
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
