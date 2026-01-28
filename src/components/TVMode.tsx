import React, { useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import { Podium } from './Podium';
import { getPodiumQuip } from '../data/podiumQuips';
import { CountdownQuip } from './CountdownQuip';
import banner from '../assets/banner-bg.jpg';
import logo from '../assets/fairest-100-logo.png';

// TV Mode - Simplified view for large screens
export const TVMode: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs, getProfileForMember } = useApp();

  // Add data-display-mode attribute to body when TV mode is active
  useEffect(() => {
    document.body.setAttribute('data-display-mode', 'tv');

    return () => {
      document.body.removeAttribute('data-display-mode');
    };
  }, []);

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

  // Get the #1 song if available
  const numberOneSong = countdownResults.find(r => r.position === 1);
  const numberOneSongData = numberOneSong ? songs.find(s => s.id === numberOneSong.songId) : null;

  // Determine which countdown to feature
  const hasHottest200Started = hottest200Results.length > 0;

  // Get current highest song from active countdown
  let currentHighestResult;
  if (hasHottest200Started) {
    currentHighestResult = [...hottest200Results].sort((a, b) => a.position - b.position)[0];
  } else {
    if (!numberOneSong) {
      currentHighestResult = [...countdownResults].sort((a, b) => a.position - b.position)[0];
    }
  }
  const currentHighestSong = currentHighestResult ? songs.find(s => s.id === currentHighestResult.songId) : null;

  // For countdown progress widget
  const displayResults = hasHottest200Started ? hottest200Results : countdownResults;
  const recentResults = [...displayResults].sort((a, b) => a.position - b.position);

  // Get stored quip for most recent countdown entry (song commentary)
  const countdownQuip = useMemo(() => {
    if (recentResults.length === 0) return '';
    return recentResults[0].quip || '';
  }, [recentResults]);

  // Calculate podium quip
  const podiumQuip = useMemo(() => {
    if (leaderboard.length === 0) return '';

    const hasPosition101 = hottest200Results.some(r => r.position === 101);

    if (hottest200Results.length > 0 && !hasPosition101) {
      return '';
    }

    let currentPosition: number;

    if (hasPosition101) {
      currentPosition = 101;
    } else if (countdownResults.length > 0) {
      const sortedByPosition = [...countdownResults].sort((a, b) => a.position - b.position);
      currentPosition = sortedByPosition[0].position;
    } else {
      return '';
    }

    const allZero = leaderboard.every(entry => entry.score === 0);
    if (allZero) {
      return getPodiumQuip(currentPosition, '', '', 0);
    }

    const peopleWithPoints = leaderboard.filter(entry => entry.score > 0);
    if (peopleWithPoints.length === 1) {
      const leader = peopleWithPoints[0].member.name;
      return getPodiumQuip(currentPosition, leader, '', 0, undefined, true);
    }

    const firstPlaceScore = leaderboard[0].score;
    const tiedForFirst = leaderboard.filter(entry => entry.score === firstPlaceScore);

    if (tiedForFirst.length >= 3) {
      const tiedNames = tiedForFirst.slice(0, 3).map(entry => entry.member.name);
      return getPodiumQuip(currentPosition, '', '', 0, tiedNames);
    } else if (tiedForFirst.length === 2) {
      const tiedNames = tiedForFirst.map(entry => entry.member.name);
      return getPodiumQuip(currentPosition, '', '', 0, tiedNames);
    }

    const leader = leaderboard[0].member.name;
    const loser = leaderboard[leaderboard.length - 1].member.name;
    const margin = leaderboard.length > 1 ? leaderboard[0].score - leaderboard[1].score : leaderboard[0].score;
    return getPodiumQuip(currentPosition, leader, loser, margin);
  }, [countdownResults, hottest200Results, leaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Subtle link back to homepage */}
      <a
        href="#home"
        className="home-link"
      >
        ← Back to Home
      </a>

      {/* Main Layout: Banner (1/3) | Content (2/3) */}
      <div className="flex min-h-screen" id="tv-mode-container">
        {/* Blue Banner - Vertical, 1/3 width */}
        <div
          className="relative w-full lg:w-1/3 left-column"
        >
          <div className="relative h-full flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="space-y-8">
            {/* Current Song Card - Large Display */}
            {(numberOneSong && numberOneSongData && !hasHottest200Started) || (currentHighestResult && currentHighestSong) ? (
              <div>
                <div id="song" className={`flex justify-center song-rank-${currentHighestResult?.position ?? numberOneSong?.position}`}>
                  <div
                    className="relative w-full max-w-md lg:max-w-lg aspect-square rounded-2xl shadow-2xl overflow-hidden song-card-background"
                    style={{
                      backgroundImage: (numberOneSongData || currentHighestSong)?.thumbnail
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${(numberOneSongData || currentHighestSong)!.thumbnail})`
                        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    }}
                  >
                    {/* Position Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      {numberOneSong ? '👑' : currentHighestResult?.position}
                    </div>

                    {/* Song Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8">
                      <div className="text-white">
                        <div className="text-xs sm:text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider">
                          {numberOneSong ? '#1 Song of 2025' : 'Current Highest Song'}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                          {(numberOneSongData || currentHighestSong)?.title}
                        </h3>
                        <p className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                          {(numberOneSongData || currentHighestSong)?.artist}
                          {(numberOneSongData || currentHighestSong)?.isAustralian && (
                            <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full">🦘</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent"></div>
                  </div>
                </div>

                {/* Song Commentary Quip */}
                {countdownQuip && (
                  <div className="mt-4">
                    <CountdownQuip quip={countdownQuip} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center lg:justify-start">
                <div className="text-white text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">
                    {hasHottest200Started ? 'Triple J Hottest 200' : 'Triple J Hottest 100'}
                  </h1>
                  <p className="text-xl sm:text-2xl font-semibold drop-shadow-md">
                    {totalResults === 0 ? 'Get ready!' : `${totalResults} songs revealed`}
                  </p>
                </div>
              </div>
            )}

            {/* Current Standings (Podium) */}
            {leaderboard.length > 0 && (
              <div>
                {!numberOneSong && (
                  <h3 className="text-center text-blue-300 font-bold text-3xl sm:text-4xl mb-4 drop-shadow-lg">
                    {hottest200Results.length === 100 ? "Winners!" : "Current Standings"}
                  </h3>
                )}
                <Podium
                  entries={leaderboard}
                  isComplete={hottest200Results.length === 100}
                />
                {podiumQuip && (
                  <div className="commentary-quip commentary-quip--animated">
                    <div className="commentary-quip__tail"></div>
                    <div className="commentary-quip__bubble">
                      <div className="commentary-quip__content">
                        "{podiumQuip}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Right Side: Countdown Progress and Full Leaderboard - 2/3 width */}
        <div className="right-column w-full lg:w-2/3 p-6 sm:p-8 lg:p-10">
            {/* Logo */}
            {/* <div className="flex justify-center">
              <img src={logo} alt="Fairest 100 Logo" className="logo" />
            </div> */}

            {/* Countdown Progress */}
            <div className="countdown-progress-wrapper rounded-xl shadow-lg p-6">
            <div className="header-group mb-4">
              <h3 className="text-2xl font-bold text-white">
                📊 {hasHottest200Started ? "The Hottest 200 of 2025" : "Countdown Progress"}
              </h3>

              <div className="">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-orange-500">
                    {hasHottest200Started ? 'Overall Progress' : 'Hottest 100 Progress'}
                  </span>
                  <span className="text-gray-400">
                    {hasHottest200Started
                      ? `${totalResults}/200 songs`
                      : `${countdownResults.length}/100 songs`
                    }
                  </span>
                </div>
                <div className="w-full bg-transparent rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: hasHottest200Started
                        ? `${(totalResults / 200) * 100}%`
                        : `${(countdownResults.length / 100) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {recentResults.length > 0 && (
              <div>
                {/* <div className="text-sm font-semibold text-gray-700 mb-2">
                  Latest Entries
                </div> */}
                <div className="list-table space-y-2">
                  {recentResults.map((result) => {
                    const song = songs.find(s => s.id === result.songId);
                    if (!song) return null;

                    return (
                      <div
                        key={result.position}
                        className="list-item-song flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {song.thumbnail && (
                          <img
                            src={song.thumbnail}
                            alt=""
                            className="song-thumbnail w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 song-info">
                          <div className="font-semibold truncate song-title">{song.title}</div>
                          <div className="text-gray-600 flex items-center gap-1 song-artist">
                            <span className="truncate">{song.artist}</span>
                            {song.isAustralian && (
                              <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                AUS
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-orange-600 text-lg flex-shrink-0 position">
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
            <div className="leaderboard-wrapper rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Full Leaderboard
            </h3>
            <div>
              <div className="leaderboard list-table space-y-2">
                {leaderboard.map((entry) => {
                  const matchCount = entry.member.votes.filter(vote =>
                    [...countdownResults, ...hottest200Results].some(r => r.songId === vote.songId)
                  ).length;
                  const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                  const profile = getProfileForMember(entry.member.id);

                  return (
                    <div
                      key={entry.member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition ${
                        getRank(entry.member.id) <= 3 && entry.score > 0
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${
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
                          <div className="font-bold text-lg text-gray-900">{entry.member.name}</div>
                          {profile && profile.label && (
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                              {profile.label}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {matchCount} match{matchCount !== 1 ? 'es' : ''} • {entry.member.votes.length}/10 votes
                        </div>
                        {/* {maxPossibleScore > 0 && (
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-full transition-all"
                                  style={{ width: `${efficiency}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-12">
                                {efficiency}%
                              </span>
                            </div>
                          </div>
                        )} */}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-blue-600">
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
        </div>
      </div>
    </div>
  );
};
