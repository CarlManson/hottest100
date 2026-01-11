import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import { calculateAwards } from '../utils/awards';
import type { MemberProfile } from '../utils/profileGenerator';
import banner from '../assets/banner-bg.jpg';

export const PublicHome: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs, getProfileForMember } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);
  const totalResults = countdownResults.length + hottest200Results.length;

  // Calculate awards when Hottest 100 is complete
  const awards = calculateAwards(familyMembers, songs, countdownResults);
  const isHottest100Complete = countdownResults.length === 100;

  // Get top 3 for podium display
  const topThree = leaderboard.slice(0, 3);

  // Get the #1 song if available
  const numberOneSong = countdownResults.find(r => r.position === 1);
  const numberOneSongData = numberOneSong ? songs.find(s => s.id === numberOneSong.songId) : null;

  // Determine which countdown to feature
  const hasHottest200Started = hottest200Results.length > 0;

  // Get current highest song from active countdown
  let currentHighestResult;
  if (hasHottest200Started) {
    // Show highest from Hottest 200 (101-200)
    currentHighestResult = [...hottest200Results].sort((a, b) => a.position - b.position)[0];
  } else {
    // Show highest from Hottest 100, but not if #1 is revealed
    if (!numberOneSong) {
      currentHighestResult = [...countdownResults].sort((a, b) => a.position - b.position)[0];
    }
  }
  const currentHighestSong = currentHighestResult ? songs.find(s => s.id === currentHighestResult.songId) : null;

  // For countdown progress widget
  const displayResults = hasHottest200Started ? hottest200Results : countdownResults;
  const recentResults = [...displayResults].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Banner Background */}
      <div
        className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 sm:py-20 mb-8"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Title and Progress */}
            <div className="text-center lg:text-left text-white">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">
                {hasHottest200Started ? 'Triple J Hottest 200 Tracker' : 'Triple J Hottest 100 Tracker'}
              </h1>
              <p className="text-lg sm:text-2xl font-semibold mb-8 drop-shadow-md">
                {totalResults === 0
                  ? 'Predictions are in! Let the countdown begin...'
                  : hasHottest200Started
                  ? `${hottest200Results.length} songs revealed • ${familyMembers.length} competitors`
                  : `${countdownResults.length} songs revealed • ${familyMembers.length} competitors`}
              </p>

              {/* Progress Bar */}
              {totalResults > 0 && (
                <div className="max-w-2xl lg:max-w-none">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full h-8 overflow-hidden border-2 border-white/40">
                    <div
                      className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 h-full flex items-center justify-center font-black text-white text-sm transition-all"
                      style={{
                        width: hasHottest200Started
                          ? `${(hottest200Results.length / 100) * 100}%`
                          : `${(countdownResults.length / 100) * 100}%`
                      }}
                    >
                      {hasHottest200Started
                        ? hottest200Results.length > 10 && `${hottest200Results.length}/100`
                        : countdownResults.length > 10 && `${countdownResults.length}/100`}
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mt-2 font-semibold">
                    Hottest 100: {countdownResults.length}/100 revealed
                    {hottest200Results.length > 0 && ` • Hottest 200: ${hottest200Results.length}/100`}
                  </p>
                </div>
              )}
            </div>

            {/* #1 Song Card - Only when available and Hottest 200 NOT started */}
            {numberOneSong && numberOneSongData && !hasHottest200Started && (
              <div className="flex justify-center lg:justify-end">
                <div
                  className="relative w-full max-w-sm aspect-square rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-3xl"
                  style={{
                    backgroundImage: numberOneSongData.thumbnail
                      ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${numberOneSongData.thumbnail})`
                      : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Crown Badge - Top Left */}
                  <div className="absolute top-4 left-4 text-5xl sm:text-6xl drop-shadow-xl">
                    👑
                  </div>

                  {/* #1 Badge - Top Right */}
                  <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    1
                  </div>

                  {/* Song Info - Bottom Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8">
                    <div className="text-white">
                      <div className="text-xs sm:text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider">
                        #1 Song of 2025
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                        {numberOneSongData.title}
                      </h3>
                      <p className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                        {numberOneSongData.artist}
                        {numberOneSongData.isAustralian && (
                          <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full">🦘</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* Current Highest Song Card + Countdown Progress - Side by side on md+ */}
        {currentHighestResult && currentHighestSong && totalResults > 0 && (
          <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Highest Song Card */}
            <div className="flex justify-center md:justify-start">
              <div
                className="relative w-full max-w-sm aspect-square rounded-2xl shadow-2xl overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
                style={{
                  backgroundImage: currentHighestSong.thumbnail
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${currentHighestSong.thumbnail})`
                    : 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Rank Badge - Top Left */}
                <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  {currentHighestResult.position}
                </div>

                {/* Song Info - Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8">
                  <div className="text-white">
                    <div className="text-xs sm:text-sm font-bold text-orange-400 mb-2 uppercase tracking-wider">
                      Current Highest Song
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                      {currentHighestSong.title}
                    </h3>
                    <p className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                      {currentHighestSong.artist}
                      {currentHighestSong.isAustralian && (
                        <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full">🦘</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent"></div>
              </div>
            </div>

            {/* Countdown Progress Widget */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-orange-200 h-fit">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                📊 {hasHottest200Started ? "The Hottest 200 of 2025" : numberOneSong ? "The Hottest 100 of 2025" : "Countdown Progress"}
              </h3>

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
            </div>
          </div>
        )}

        {/* Current Highest Song Card - Solo display when no countdown results yet */}
        {currentHighestResult && currentHighestSong && totalResults === 0 && (
          <div className="mb-12 flex justify-center">
            <div
              className="relative w-full max-w-sm aspect-square rounded-2xl shadow-2xl overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
              style={{
                backgroundImage: currentHighestSong.thumbnail
                  ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${currentHighestSong.thumbnail})`
                  : 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Rank Badge - Top Left */}
              <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                {currentHighestResult.position}
              </div>

              {/* Song Info - Bottom Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8">
                <div className="text-white">
                  <div className="text-xs sm:text-sm font-bold text-orange-400 mb-2 uppercase tracking-wider">
                    Current Highest Song
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                    {currentHighestSong.title}
                  </h3>
                  <p className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                    {currentHighestSong.artist}
                    {currentHighestSong.isAustralian && (
                      <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full">🦘</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent"></div>
            </div>
          </div>
        )}

        {/* Leader Podium - Visual representation of top 3 */}
        {leaderboard.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {hottest200Results.length === 100 ? "Winners Podium" : "Current Standings"}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Who's leading the pack?</p>
            </div>

            {/* Conditional Layout: Podium + Leaderboard OR Countdown + Leaderboard OR just Leaderboard */}
            {currentHighestResult && currentHighestSong ? (
              // Featured song is showing above, so show podium + leaderboard side by side on md+
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Podium Visualization (Top 3) */}
                <div className="flex items-end justify-center gap-4 sm:gap-8">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center" style={{ width: '30%' }}>
                      <div className="text-4xl sm:text-6xl mb-2">🥈</div>
                      <div className="font-bold text-sm sm:text-lg text-gray-800 truncate w-full text-center">
                        {topThree[1].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[1].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-2xl sm:text-4xl font-black text-gray-400 mt-2">
                        {topThree[1].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg mt-4 shadow-lg" style={{ height: '120px' }}>
                        <div className="text-white font-black text-3xl sm:text-5xl pt-6 text-center">2</div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center" style={{ width: '35%' }}>
                      <div className="text-5xl sm:text-7xl mb-2">🥇</div>
                      <div className="font-bold text-base sm:text-xl text-gray-800 truncate w-full text-center">
                        {topThree[0].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[0].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-3xl sm:text-5xl font-black text-yellow-600 mt-2">
                        {topThree[0].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-lg mt-4 shadow-xl" style={{ height: '160px' }}>
                        <div className="text-white font-black text-4xl sm:text-6xl pt-8 text-center drop-shadow-lg">1</div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center" style={{ width: '30%' }}>
                      <div className="text-4xl sm:text-6xl mb-2">🥉</div>
                      <div className="font-bold text-sm sm:text-lg text-gray-800 truncate w-full text-center">
                        {topThree[2].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[2].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-2xl sm:text-4xl font-black text-orange-600 mt-2">
                        {topThree[2].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-lg mt-4 shadow-lg" style={{ height: '90px' }}>
                        <div className="text-white font-black text-3xl sm:text-5xl pt-4 text-center">3</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                    Full Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                      const matchCount = entry.member.votes.filter(vote =>
                        [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                      ).length;
                      const efficiency = calculateEfficiency(entry.score, maxPossibleScore);

                      return (
                        <div
                          key={entry.member.id}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition ${
                            index < 3
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                              {(() => {
                                const profile = getProfileForMember(entry.member.id);
                                return profile ? (
                                  <button
                                    onClick={() => setSelectedProfile(profile)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap"
                                  >
                                    {profile.label}
                                  </button>
                                ) : null;
                              })()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {matchCount} match{matchCount !== 1 ? 'es' : ''} • {entry.member.votes.length}/10 votes
                            </div>
                            {maxPossibleScore > 0 && (
                              <div className="mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all"
                                      style={{ width: `${efficiency}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600 w-12">
                                    {efficiency}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-black text-orange-600">
                              {entry.score}
                            </div>
                            {maxPossibleScore > 0 && (
                              <div className="text-xs text-gray-500">
                                of {maxPossibleScore}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : totalResults > 0 ? (
              // No featured song, show podium + countdown + leaderboard
              <>
                {/* Podium Display for Top 3 */}
                <div className="flex items-end justify-center gap-4 sm:gap-8 mb-8">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center" style={{ width: '30%' }}>
                      <div className="text-4xl sm:text-6xl mb-2">🥈</div>
                      <div className="font-bold text-sm sm:text-lg text-gray-800 truncate w-full text-center">
                        {topThree[1].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[1].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-2xl sm:text-4xl font-black text-gray-400 mt-2">
                        {topThree[1].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg mt-4 shadow-lg" style={{ height: '120px' }}>
                        <div className="text-white font-black text-3xl sm:text-5xl pt-6 text-center">2</div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center" style={{ width: '35%' }}>
                      <div className="text-5xl sm:text-7xl mb-2">🥇</div>
                      <div className="font-bold text-base sm:text-xl text-gray-800 truncate w-full text-center">
                        {topThree[0].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[0].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-3xl sm:text-5xl font-black text-yellow-600 mt-2">
                        {topThree[0].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-t-lg mt-4 shadow-xl" style={{ height: '160px' }}>
                        <div className="text-white font-black text-4xl sm:text-6xl pt-8 text-center drop-shadow-lg">1</div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center" style={{ width: '30%' }}>
                      <div className="text-4xl sm:text-6xl mb-2">🥉</div>
                      <div className="font-bold text-sm sm:text-lg text-gray-800 truncate w-full text-center">
                        {topThree[2].member.name}
                      </div>
                      {(() => {
                        const profile = getProfileForMember(topThree[2].member.id);
                        return profile ? (
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap mt-1"
                          >
                            {profile.label}
                          </button>
                        ) : null;
                      })()}
                      <div className="text-2xl sm:text-4xl font-black text-orange-600 mt-2">
                        {topThree[2].score}
                      </div>
                      <div className="w-full bg-gradient-to-br from-orange-400 to-orange-500 rounded-t-lg mt-4 shadow-lg" style={{ height: '90px' }}>
                        <div className="text-white font-black text-3xl sm:text-5xl pt-4 text-center">3</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Countdown Progress Widget */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-orange-200 h-fit">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    📊 {hasHottest200Started ? "The Hottest 200 of 2025" : numberOneSong ? "The Hottest 100 of 2025" : "Countdown Progress"}
                  </h3>

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
                </div>

                {/* Full Leaderboard */}
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                    Full Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                      const matchCount = entry.member.votes.filter(vote =>
                        [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                      ).length;
                      const efficiency = calculateEfficiency(entry.score, maxPossibleScore);

                      return (
                        <div
                          key={entry.member.id}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition ${
                            index < 3
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                              {(() => {
                                const profile = getProfileForMember(entry.member.id);
                                return profile ? (
                                  <button
                                    onClick={() => setSelectedProfile(profile)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap"
                                  >
                                    {profile.label}
                                  </button>
                                ) : null;
                              })()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {matchCount} match{matchCount !== 1 ? 'es' : ''} • {entry.member.votes.length}/10 votes
                            </div>
                            {maxPossibleScore > 0 && (
                              <div className="mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all"
                                      style={{ width: `${efficiency}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600 w-12">
                                    {efficiency}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-black text-orange-600">
                              {entry.score}
                            </div>
                            {maxPossibleScore > 0 && (
                              <div className="text-xs text-gray-500">
                                of {maxPossibleScore}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              </>
            ) : (
              // No countdown results yet, just show member votes
              <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                  Predictions Submitted
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const profile = getProfileForMember(entry.member.id);
                    return (
                      <div
                        key={entry.member.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                            {profile && (
                              <button
                                onClick={() => setSelectedProfile(profile)}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap"
                              >
                                {profile.label}
                              </button>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {entry.member.votes.length}/10 predictions submitted
                          </div>
                        </div>
                        {entry.member.votes.length === 10 && (
                          <div className="text-green-600 text-xl">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Awards Section - Only show when Hottest 100 complete and Hottest 200 NOT started */}
        {isHottest100Complete && awards.length > 0 && !hasHottest200Started && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                🏆 Hottest 100 Awards 🏆
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">Celebrating our champions!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 shadow-xl border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{award.emoji}</div>
                    <h4 className="font-black text-lg text-gray-800 mb-2">
                      {award.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {award.description}
                    </p>
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-base py-2 px-3 rounded-full inline-block mb-2 shadow-lg">
                      {award.winnerName}
                    </div>
                    {award.details && (
                      <p className="text-[11px] text-gray-500 mt-2 italic">
                        {award.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Get Started!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Log in to add family members and start making predictions
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold">
                  {familyMembers.find(m => m.id === selectedProfile.memberId)?.name}
                </h3>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {selectedProfile.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {selectedProfile.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
