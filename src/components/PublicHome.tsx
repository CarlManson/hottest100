import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import { calculateAwards } from '../utils/awards';
import type { MemberProfile } from '../types';
import banner from '../assets/banner-bg.jpg';
import { LazyImage } from './LazyImage';
import { CountdownQuip } from './CountdownQuip';
import { Podium } from './Podium';
import { getPodiumQuip } from '../data/podiumQuips';
import { DetailedBreakdownTable } from './DetailedBreakdownTable';
import { CurrentSongCard } from './CurrentSongCard';
import { useCountdown } from '../hooks/useCountdownSettings';

export const PublicHome: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs, getProfileForMember } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);
  const countdown = useCountdown();
  const countdownStarted = countdown.isStarted;
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

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
          // Same score = same rank
          rankMap.set(entry.member.id, rankMap.get(prevEntry.member.id)!);
        } else {
          // Different score = rank is current position + 1
          currentRank = i + 1;
          rankMap.set(entry.member.id, currentRank);
        }
      }
    }

    return (memberId: string) => rankMap.get(memberId) || 0;
  }, [leaderboard]);

  // Calculate awards when Hottest 100 is complete
  const awards = calculateAwards(familyMembers, songs, countdownResults);
  const isHottest100Complete = countdownResults.length === 100;

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

  // Get stored quip for most recent countdown entry
  const countdownQuip = useMemo(() => {
    if (recentResults.length === 0) return '';
    return recentResults[0].quip || '';
  }, [recentResults]);

  // Calculate podium quip based on leaderboard state
  const podiumQuip = useMemo(() => {
    if (leaderboard.length === 0) return '';

    // Check if position 101 (Hottest 200 finale) has been revealed
    const hasPosition101 = hottest200Results.some(r => r.position === 101);

    // If Hottest 200 has started but position 101 hasn't been revealed yet, show no quip
    if (hottest200Results.length > 0 && !hasPosition101) {
      return '';
    }

    // Determine which position to use for the quip
    let currentPosition: number;

    if (hasPosition101) {
      // Always use position 101 for the grand finale quip
      currentPosition = 101;
    } else if (countdownResults.length > 0) {
      // Use the most recently revealed Hottest 100 position
      const sortedByPosition = [...countdownResults].sort((a, b) => a.position - b.position);
      currentPosition = sortedByPosition[0].position;
    } else {
      return '';
    }

    // Check if everyone has 0 score FIRST (no score state takes priority)
    const allZero = leaderboard.every(entry => entry.score === 0);
    if (allZero) {
      return getPodiumQuip(currentPosition, '', '', 0);
    }

    // Check for solo podium - only one person has points
    const peopleWithPoints = leaderboard.filter(entry => entry.score > 0);
    if (peopleWithPoints.length === 1) {
      const leader = peopleWithPoints[0].member.name;
      return getPodiumQuip(currentPosition, leader, '', 0, undefined, true);
    }

    // Check for ties in first place
    const firstPlaceScore = leaderboard[0].score;
    const tiedForFirst = leaderboard.filter(entry => entry.score === firstPlaceScore);

    if (tiedForFirst.length >= 3) {
      // Three-way tie (or more)
      const tiedNames = tiedForFirst.slice(0, 3).map(entry => entry.member.name);
      return getPodiumQuip(currentPosition, '', '', 0, tiedNames);
    } else if (tiedForFirst.length === 2) {
      // Two-way tie
      const tiedNames = tiedForFirst.map(entry => entry.member.name);
      return getPodiumQuip(currentPosition, '', '', 0, tiedNames);
    }

    // Normal update - leader vs loser
    const leader = leaderboard[0].member.name;
    const loser = leaderboard[leaderboard.length - 1].member.name;
    const margin = leaderboard.length > 1 ? leaderboard[0].score - leaderboard[1].score : leaderboard[0].score;
    return getPodiumQuip(currentPosition, leader, loser, margin);
  }, [countdownResults, hottest200Results, leaderboard]);

  // Countdown timer visibility is controlled by CSS :has() based on marker elements
  // This avoids React state sync issues that caused the "blink" bug
  const showCountdownTimerBase = countdown.isEnabled && !countdownStarted && !numberOneSong;
  const showNumberOneSong = numberOneSong && numberOneSongData && !hasHottest200Started;
  const hasBannerRightContent = (showCountdownTimerBase && songs.length === 0) || showNumberOneSong;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Banner Background */}
      <div
        className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-6 sm:py-20 mb-8 full-banner-background"
        style={{ '--banner-image': `url(${banner})` } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 ${hasBannerRightContent ? 'xl:grid-cols-2' : ''} gap-8 lg:gap-12 items-center`}>
            {/* Title and Progress */}
            <div className={`text-white ${hasBannerRightContent ? 'text-center xl:text-left' : 'text-center'}`}>
              <h1 className="text-2xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black mb-4 drop-shadow-lg">
                {hasHottest200Started ? 'Triple J Hottest 200 Tracker' : 'Triple J Hottest 100 Tracker'}
              </h1>
              <p className="hidden md:block text-lg sm:text-2xl 2xl:text-3xl font-semibold mb-8 drop-shadow-md">
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
                  <p className="hidden md:block text-white/90 text-sm mt-2 font-semibold">
                    Hottest 100: {countdownResults.length}/100 revealed
                    {hottest200Results.length > 0 && ` • Hottest 200: ${hottest200Results.length}/100`}
                  </p>
                </div>
              )}

              {/* TV Mode Button - large screens only */}
              <div className="mt-6 hidden lg:block">
                <a
                  href="#tv"
                  className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-lg transition border-2 border-white/40 hover:border-white/60 shadow-lg"
                >
                  📺 TV Mode
                </a>
              </div>
            </div>

            {/* Countdown Timer - visibility controlled by CSS :has() to avoid React state blink issues */}
            {/* Hidden marker element for CSS :has() detection */}
            {songs.length > 0 && <span data-has-songs hidden />}

            {showCountdownTimerBase && (
              <div className="countdown">
                    <h3>Countdown Starts In</h3>
                    <div className="countdown-timer">
                      <div className="countdown-ticker">
                        <div className="big-number">{String(countdown.days).padStart(2, '0')}</div>
                        <div className="small-text">Days</div>
                      </div>
                      <div className="countdown-ticker">
                        <div className="big-number">{String(countdown.hours).padStart(2, '0')}</div>
                        <div className="small-text">Hours</div>
                      </div>
                      <div className="countdown-ticker">
                        <div className="big-number">{String(countdown.minutes).padStart(2, '0')}</div>
                        <div className="small-text">Minutes</div>
                      </div>
                      <div className="countdown-ticker">
                        <div className="big-number">{String(countdown.seconds).padStart(2, '0')}</div>
                        <div className="small-text">Seconds</div>
                      </div>
                    </div>
              </div>
            )}

            {/* #1 Song Card - Only when available and Hottest 200 NOT started */}
            {showNumberOneSong && (
              <CurrentSongCard
                song={numberOneSongData}
                position={1}
                isNumberOne
                variant="home"
                size="lg"
                className="xl:justify-end"
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Current Highest Song Card + Countdown Progress - Side by side on md+ */}
        {currentHighestResult && currentHighestSong && totalResults > 0 && (
          <div className="mb-12 grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Current Highest Song Card */}
            <CurrentSongCard
              song={currentHighestSong}
              position={currentHighestResult.position}
              variant="home"
              size="md"
              className="xl:justify-start"
            />

            {/* Countdown Progress Widget */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-2 sm:p-6 border-2 border-orange-200 h-fit">
                <h3 className="hidden md:block text-xl sm:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  📊 {hasHottest200Started ? "The Hottest 200 of 2025" : numberOneSong ? "The Hottest 100 of 2025" : "Countdown Progress"}
                </h3>

                <div className="hidden md:block mb-4">
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
                  <div className="progress-bar rounded-full h-3">
                    <div
                      className="progress-bar-marker h-3 rounded-full transition-all"
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
                    <div className="hidden md:block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                            style={{ '--current-song': result.position } as React.CSSProperties}
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
                                  <span className="bg-accent-dark text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                                    AUS
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="font-bold text-accent text-sm sm:text-lg flex-shrink-0">
                              #{result.position}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Commentator Quip */}
              <CountdownQuip quip={countdownQuip} />
            </div>
          </div>
        )}

        {/* Current Highest Song Card - Solo display when no countdown results yet */}
        {currentHighestResult && currentHighestSong && totalResults === 0 && (
          <div className="mb-12">
            <CurrentSongCard
              song={currentHighestSong}
              position={currentHighestResult.position}
              variant="home"
              size="2xl"
            />
          </div>
        )}

        {/* Leader Podium - Visual representation of top 3 */}
        {leaderboard.length > 0 && (
          <div className="mb-12">

            {/* Conditional Layout: Podium + Leaderboard OR Countdown + Leaderboard OR just Leaderboard */}
            {currentHighestResult && currentHighestSong ? (
              // Featured song is showing above, so show podium + leaderboard side by side on md+
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
                {/* Podium Visualization (Top 3) + Commentary */}
                <div>
                  <h2 className="text-center text-2xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {hottest200Results.length === 100 ? "Winners Podium" : "Current Standings"}</h2>
                <p className="hidden md:block text-center text-gray-600 text-sm sm:text-base mb-5">Who's leading the pack?</p>
                  <Podium
                    entries={leaderboard}
                    isComplete={hottest200Results.length === 100}
                  />

                  {/* Podium Commentator Quip */}
                  <CountdownQuip quip={podiumQuip} />
                </div>

                {/* Full Leaderboard */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-xl p-2 sm:p-6 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      <span className="hidden md:block">Full</span> Leaderboard
                    </h3>
                    {totalResults > 0 && (
                      <button
                        onClick={() => setShowDetailedBreakdown(true)}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg"
                      >
                        📊 Detailed Breakdown
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
                    {leaderboard.map((entry) => {
                      const matchCount = entry.member.votes.filter(vote =>
                        [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                      ).length;
                      const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                      const profile = getProfileForMember(entry.member.id);

                      return (
                        <div
                          key={entry.member.id}
                          onClick={() => profile && setSelectedProfile(profile)}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition ${
                            getRank(entry.member.id) <= 3 && entry.score > 0
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                              : 'bg-gray-50'
                          } ${profile ? 'cursor-pointer hover:shadow-md' : ''}`}
                        >
                          <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
                            entry.score === 0 ? 'bg-gray-200 text-gray-400' :
                            getRank(entry.member.id) === 1 ? 'bg-yellow-500 text-white' :
                            getRank(entry.member.id) === 2 ? 'bg-gray-400 text-white' :
                            getRank(entry.member.id) === 3 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {entry.score === 0 ? '-' : getRank(entry.member.id)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                              {profile && profile.label && (
                                <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                  {profile.label}
                                </span>
                              )}
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
                <div className="mb-8">
                  <Podium
                    entries={leaderboard}
                    isComplete={hottest200Results.length === 100}
                  />
                </div>

                {/* Podium Commentator Quip */}
                <CountdownQuip quip={podiumQuip} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
                {/* Countdown Progress Widget - spans first column on the left */}
                <div>
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

                  {/* Commentator Quip */}
                  <CountdownQuip quip={countdownQuip} />
                </div>

                {/* Full Leaderboard */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Full Leaderboard
                    </h3>
                    {totalResults > 0 && (
                      <button
                        onClick={() => setShowDetailedBreakdown(true)}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg"
                      >
                        📊 Detailed Breakdown
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
                    {leaderboard.map((entry) => {
                      const matchCount = entry.member.votes.filter(vote =>
                        [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                      ).length;
                      const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                      const profile = getProfileForMember(entry.member.id);

                      return (
                        <div
                          key={entry.member.id}
                          onClick={() => profile && setSelectedProfile(profile)}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition ${
                            getRank(entry.member.id) <= 3 && entry.score > 0
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                              : 'bg-gray-50'
                          } ${profile ? 'cursor-pointer hover:shadow-md' : ''}`}
                        >
                          <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
                            entry.score === 0 ? 'bg-gray-200 text-gray-400' :
                            getRank(entry.member.id) === 1 ? 'bg-yellow-500 text-white' :
                            getRank(entry.member.id) === 2 ? 'bg-gray-400 text-white' :
                            getRank(entry.member.id) === 3 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {entry.score === 0 ? '-' : getRank(entry.member.id)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                              {profile && profile.label && (
                                <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                  {profile.label}
                                </span>
                              )}
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
              <>
                {/* Welcome Message - shown before/during countdown when no results yet */}
                {!countdownStarted ? (
                  <div className="bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 sm:p-6 mb-6 welcome-message">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-2xl font-black text-gray-800 mb-2 sm:mb-3">G'day Legends!</h3>
                      <div className="text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 mx-auto">
                        <p><strong>Righto, here's how this works. You've chucked in your top 10 picks, and now we wait for Triple J to do their thing.</strong>
                        </p>
                        <p>
                          <strong>Scoring is dead simple:</strong> If your song cracks the Hottest 100, you score points based on how high it lands.
                          Position #100 gets you <span className="font-bold text-orange-600">1 point</span>, and if one of your picks somehow nabs the #1 spot,
                          that's a whopping <span className="font-bold text-orange-600">100 points</span>. The higher the song, the more points you bag.
                        </p>
                        <p className="text-gray-600 italic">
                          Good luck to all you legends. Stay hydrated, keep the snacks coming, and may your picks absolutely smash it.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-100 via-orange-50 to-red-100 border-2 border-red-300 rounded-xl p-4 sm:p-6 mb-6">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-2xl font-black text-gray-800 mb-2 sm:mb-3">
                        It's Happening!
                      </h3>
                      <div className="text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                        <p>
                          The countdown has kicked off, but someone needs to actually log the results here.
                          Carl wasn't smart enough to make this thing update automatically, so we're doing it the old-fashioned way.
                        </p>
                        <p>
                          <strong>If you're free:</strong> Log in and head to the <span className="font-bold text-orange-600">Countdown Results</span> tab
                          to start adding songs as Triple J announces them. Don't all rush at once - one legend at a time will do the trick.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                    Predictions Submitted
                  </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                  {leaderboard.map((entry) => {
                    const profile = getProfileForMember(entry.member.id);
                    return (
                      <div
                        key={entry.member.id}
                        onClick={() => profile && setSelectedProfile(profile)}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 ${profile ? 'cursor-pointer hover:bg-gray-100 transition' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-bold text-sm sm:text-lg text-gray-900">{entry.member.name}</div>
                            {profile && profile.label && (
                              <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                {profile.label}
                              </span>
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
              </>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
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
              Log in to add mates and start making predictions
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

      {/* Detailed Breakdown Modal */}
      {showDetailedBreakdown && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailedBreakdown(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-[95vw] w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold">Detailed Vote Breakdown</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Complete breakdown of all votes and scores earned
                </p>
              </div>
              <button
                onClick={() => setShowDetailedBreakdown(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0 ml-4"
              >
                ×
              </button>
            </div>

            <DetailedBreakdownTable />
          </div>
        </div>
      )}
    </div>
  );
};
