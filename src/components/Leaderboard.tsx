import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, getSongMatches, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import type { MemberProfile } from '../utils/profileGenerator';
import type { FamilyMember } from '../types';

export const Leaderboard: React.FC = () => {
  const {
    familyMembers,
    countdownResults,
    hottest200Results,
    songs,
    profiles,
    isGeneratingProfiles,
    profileError,
    generateProfiles,
    getProfileForMember
  } = useApp();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);
  const hasHottest200 = hottest200Results.length > 0;

  const matches = selectedMember
    ? getSongMatches(selectedMember, countdownResults, hottest200Results, songs)
    : [];

  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

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
          <button
            onClick={generateProfiles}
            disabled={isGeneratingProfiles || familyMembers.length === 0}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
              isGeneratingProfiles || familyMembers.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : hasApiKey
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
            title={!hasApiKey ? 'Requires Anthropic API key in .env file' : ''}
          >
            {isGeneratingProfiles ? '🤖 Generating...' : profiles.length > 0 ? '🔄 Regenerate Profiles' : hasApiKey ? '✨ Generate Profiles' : '✨ Generate Profiles (Setup Required)'}
          </button>
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
            <p className="text-sm sm:text-base text-gray-500">No family members yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {leaderboard.map((entry, index) => {
                const efficiency = calculateEfficiency(entry.score, maxPossibleScore);
                const profile = getProfileForMember(entry.member.id);
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
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg sm:text-xl">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm sm:text-lg truncate">{entry.member.name}</div>
                        {profile && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProfile(profile);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:from-purple-600 hover:to-pink-600 transition whitespace-nowrap"
                          >
                            {profile.label}
                          </button>
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
