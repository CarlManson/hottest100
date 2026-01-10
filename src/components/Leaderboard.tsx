import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, getSongMatches, calculateMaxPossibleScore, calculateEfficiency } from '../utils/scoring';
import type { FamilyMember } from '../types';

export const Leaderboard: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs } = useApp();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);
  const maxPossibleScore = calculateMaxPossibleScore(countdownResults, hottest200Results);

  const matches = selectedMember
    ? getSongMatches(selectedMember, countdownResults, hottest200Results, songs)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-bold hidden sm:block">Leaderboard</h2>
        <a
          href="#detailed-breakdown"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline inline-block mt-2"
        >
          View detailed vote breakdown →
        </a>
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
                      <div className="font-semibold text-sm sm:text-lg truncate">{entry.member.name}</div>
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
                const points = isHottest200
                  ? 101 + (200 - result.position)
                  : 101 + (100 - result.position);

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
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span>Your pick: #{vote.rank}</span>
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
    </div>
  );
};
