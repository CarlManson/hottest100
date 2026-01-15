import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, getSongMatches, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import type { MemberProfile, FamilyMember } from '../types';
import { LazyImage } from './LazyImage';

export const Leaderboard: React.FC = () => {
  const {
    familyMembers,
    countdownResults,
    hottest200Results,
    songs,
    profileError,
    getProfileForMember
  } = useApp();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);
  const hasHottest200 = hottest200Results.length > 0;

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

  const matches = selectedMember
    ? getSongMatches(selectedMember, countdownResults, hottest200Results, songs)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold hidden sm:block">Leaderboard</h2>
            <a
              href="#detailed-breakdown"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline inline-block mt-2"
            >
              View detailed vote breakdown →
            </a>
          </div>
        </div>
        {profileError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
            {profileError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Standings</h3>
          {leaderboard.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-500">No mates yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {leaderboard.map((entry) => {
                const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                const profile = getProfileForMember(entry.member.id);
                const rank = getRank(entry.member.id);
                return (
                  <div
                    key={entry.member.id}
                    onClick={() => setSelectedMember(entry.member)}
                    className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg cursor-pointer transition ${
                      selectedMember?.id === entry.member.id
                        ? 'bg-blue-100 border border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
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
                        <div className="font-semibold text-sm sm:text-lg truncate">{entry.member.name}</div>
                        {profile && profile.label && profile.musicTasteDescription && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfile(profile);
                            }}
                            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-orange-500 hover:to-pink-500 transition whitespace-nowrap cursor-pointer"
                          >
                            {profile.label}
                          </button>
                        )}
                        {profile && profile.label && !profile.musicTasteDescription && (
                          <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                            {profile.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {matches.length > 0 && selectedMember?.id === entry.member.id
                          ? `${getSongMatches(entry.member, countdownResults, hottest200Results, songs).length} matches`
                          : `${entry.member.votes.length} votes`}
                      </div>
                      {maxPossibleScore > 0 && (
                        <div className="mt-1 sm:mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all"
                                style={{ width: `${efficiency}%` }}
                              />
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 w-10 sm:w-12">
                              {efficiency}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
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
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {selectedMember ? `${selectedMember.name}'s Matches` : 'Select a Member'}
          </h3>
          {!selectedMember ? (
            <p className="text-sm sm:text-base text-gray-500">Click on a member to see their matching songs</p>
          ) : matches.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-500">No matches yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {matches.map(({ vote, result, song }) => {
                if (!result || !song) return null;

                const isHottest200 = result.position > 100;

                // Dynamic scoring based on whether Hottest 200 has been revealed
                let points: number;
                if (hasHottest200) {
                  // With Hottest 200 revealed
                  points = isHottest200
                    ? 101 + (200 - result.position)  // Hottest 200: position 200 = 1 pt, position 101 = 100 pts
                    : 101 + (100 - result.position); // Hottest 100: position 100 = 101 pts, position 1 = 200 pts
                } else {
                  // Simple scoring when only Hottest 100 exists
                  points = 101 - result.position; // Position 100 = 1 pt, position 1 = 100 pts
                }

                return (
                  <div
                    key={vote.songId}
                    className="p-2 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base truncate">{song.title}</div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">{song.artist}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-bold text-green-600 text-sm sm:text-base">+{points}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          {isHottest200 ? 'H200' : 'H100'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span>Actual: #{result.position}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h4 className="font-semibold text-sm sm:text-base mb-2">Scoring Rules:</h4>
        <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
          <li>• <strong>Before Hottest 200 is revealed:</strong> Hottest 100 songs score 1-100 points (Position #100 = 1 pt, #1 = 100 pts)</li>
          <li>• <strong>After Hottest 200 is revealed:</strong> Hottest 100 scores 101-200 points (Position #100 = 101 pts, #1 = 200 pts), Hottest 200 scores 1-100 points (Position #200 = 1 pt, #101 = 100 pts)</li>
          <li>• Only songs that appear in the countdown earn points</li>
          <li>• Efficiency % = Your score vs the max possible score from top 10 songs currently in the countdown</li>
        </ul>
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
    </div>
  );
};
