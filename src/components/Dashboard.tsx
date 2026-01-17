import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import type { MemberProfile } from '../types';
import { LazyImage } from './LazyImage';

interface DashboardProps {
  onNavigate?: (tab: 'settings' | 'voting' | 'countdown' | 'leaderboard') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { familyMembers, countdownResults, hottest200Results, songs, getProfileForMember } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);
  const totalResults = countdownResults.length + hottest200Results.length;

  // Calculate ranks with tie handling
  const getRank = useMemo(() => {
    const rankMap = new Map<string, number>();
    let currentRank = 1;

    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];
      if (i === 0) {
        rankMap.set(entry.member.id, currentRank);
      } else {
        const prevEntry = leaderboard[i - 1];
        if (entry.score === prevEntry.score) {
          rankMap.set(entry.member.id, rankMap.get(prevEntry.member.id)!);
        } else {
          currentRank = i + 1;
          rankMap.set(entry.member.id, currentRank);
        }
      }
    }

    return (memberId: string) => rankMap.get(memberId) || 0;
  }, [leaderboard]);
  const hasVotes = familyMembers.some(m => m.votes.length > 0);

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
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-8 hidden sm:block">
        <h2 className="text-2xl sm:text-4xl font-black mb-2 text-gray-800">Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600">Live standings and countdown progress</p>
      </div>

      {/* Stats Cards - Hidden on mobile */}
      <div className={`hidden md:grid gap-4 mb-8 ${hottest200Results.length > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black">{songs.length}</div>
          <div className="text-white/80 font-semibold">Eligible Songs</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black">{familyMembers.length}</div>
          <div className="text-white/80 font-semibold">Mates</div>
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

      {!hasVotes && familyMembers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 text-center border-2 border-orange-200">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎵</div>
          <h3 className="text-lg sm:text-2xl font-bold mb-2 text-gray-800">Welcome to Hottest 100 Tracker!</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Get started by adding songs and mates</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => onNavigate?.('settings')}
              className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition font-bold text-sm sm:text-base"
            >
              Manage Songs
            </button>
            <button
              onClick={() => onNavigate?.('voting')}
              className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition font-bold text-sm sm:text-base"
            >
              Start Voting
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Countdown Progress */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 border-2 border-orange-200">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
              📊 Countdown Progress
            </h3>
            {totalResults === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-2">⏰</div>
                <p className="text-sm sm:text-base text-gray-500">No results entered yet</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Results will appear here as the countdown happens</p>
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
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg">
                    <div className="text-[10px] sm:text-xs font-bold text-orange-600 mb-1 sm:mb-2">🏆 HIGHEST POSITION</div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="font-black text-xl sm:text-3xl text-orange-600">
                        #{topSong.position}
                      </div>
                      {topSongData.thumbnail && (
                        <img
                          src={topSongData.thumbnail}
                          alt={`${topSongData.title} artwork`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm sm:text-lg truncate">{topSongData.title}</div>
                        <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
                          <span className="truncate">{topSongData.artist}</span>
                          {topSongData.isAustralian && (
                            <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
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
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      {hasHottest200Started ? 'Latest Entries (Hottest 200)' : 'Latest Entries'}
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1.5 sm:space-y-2 pr-2">
                      {recentResults.map((result) => {
                        const song = songs.find(s => s.id === result.songId);
                        if (!song) return null;

                        return (
                          <div
                            key={result.position}
                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                          >
                            {song.thumbnail && (
                              <img
                                src={song.thumbnail}
                                alt=""
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                              <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                                <span className="truncate">{song.artist}</span>
                                {song.isAustralian && (
                                  <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                                    AUS
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="font-bold text-orange-600 text-sm sm:text-lg flex-shrink-0">
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
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 border-2 border-orange-200">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
              🏆 Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8">No votes yet</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {leaderboard.slice(0, 5).map((entry) => {
                  const matchCount = entry.member.votes.filter(vote =>
                    [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                  ).length;
                  const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                  const rank = getRank(entry.member.id);

                  return (
                    <div
                      key={entry.member.id}
                      className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg ${
                        rank === 1 && entry.score > 0
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-lg ${
                        entry.score === 0 ? 'bg-gray-200 text-gray-400' :
                        rank === 1 ? 'bg-yellow-500 text-white' :
                        rank === 2 ? 'bg-gray-400 text-white' :
                        rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {entry.score === 0 ? '-' : rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-bold text-sm sm:text-base text-gray-900 truncate">{entry.member.name}</div>
                          {(() => {
                            const profile = getProfileForMember(entry.member.id);
                            if (!profile || !profile.label) return null;

                            if (profile.musicTasteDescription) {
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProfile(profile);
                                  }}
                                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-orange-500 hover:to-pink-500 transition whitespace-nowrap cursor-pointer"
                                >
                                  {profile.label}
                                </button>
                              );
                            } else {
                              return (
                                <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                  {profile.label}
                                </span>
                              );
                            }
                          })()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {matchCount} match{matchCount !== 1 ? 'es' : ''} • {entry.member.votes.length}/10 votes
                        </div>
                        {maxPossibleScore > 0 && (
                          <div className="mt-1 sm:mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all"
                                  style={{ width: `${efficiency}%` }}
                                />
                              </div>
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-600 w-8 sm:w-10">
                                {efficiency}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-orange-600">
                          {entry.score}
                        </div>
                        {maxPossibleScore > 0 && (
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            of {maxPossibleScore}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length > 5 && (
                  <div className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    +{leaderboard.length - 5} more • View full leaderboard
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {hasVotes && (
        <div className="mt-4 sm:mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-6">
          <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate?.('countdown')}
              className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm"
            >
              Enter Results
            </button>
            <button
              onClick={() => onNavigate?.('leaderboard')}
              className="bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-600 transition font-semibold text-sm"
            >
              View Full Leaderboard
            </button>
            <button
              onClick={() => onNavigate?.('voting')}
              className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
            >
              Manage Votes
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">
                {familyMembers.find(m => m.id === selectedProfile.familyMemberId)?.name}'s Music Taste
              </h3>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedProfile.musicTasteDescription ? (
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                {selectedProfile.musicTasteDescription}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic mb-6">No music taste profile generated yet</p>
            )}

            {/* Member's Picks */}
            {(() => {
              const member = familyMembers.find(m => m.id === selectedProfile.familyMemberId);
              if (!member || member.votes.length === 0) return null;

              return (
                <div>
                  <h4 className="text-base sm:text-lg font-bold mb-3 text-gray-800">Their Picks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
                    {member.votes.map((vote) => {
                      const song = songs.find((s) => s.id === vote.songId);
                      if (!song) return null;

                      // Check if song is in countdown
                      const countdownEntry = [...countdownResults, ...hottest200Results].find(
                        r => r.songId === vote.songId
                      );
                      const isMatched = !!countdownEntry;

                      return (
                        <div
                          key={vote.songId}
                          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                            isMatched
                              ? 'bg-green-50 border-2 border-green-500'
                              : 'bg-gray-50'
                          }`}
                        >
                          {song.thumbnail && (
                            <LazyImage
                              src={song.thumbnail}
                              alt={`${song.title} artwork`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                              <span className="truncate">{song.artist}</span>
                              {song.isAustralian && (
                                <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                                  AUS
                                </span>
                              )}
                            </div>
                          </div>
                          {countdownEntry && (
                            <div className="font-bold text-green-600 text-sm sm:text-lg flex-shrink-0">
                              #{countdownEntry.position}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
