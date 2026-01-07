import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard, getSongMatches } from '../utils/scoring';
import type { FamilyMember } from '../types';

export const Leaderboard: React.FC = () => {
  const { familyMembers, countdownResults, hottest200Results, songs } = useApp();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const leaderboard = getLeaderboard(familyMembers, countdownResults, hottest200Results);

  const matches = selectedMember
    ? getSongMatches(selectedMember, countdownResults, hottest200Results, songs)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Leaderboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Standings</h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500">No family members yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.member.id}
                  onClick={() => setSelectedMember(entry.member)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
                    selectedMember?.id === entry.member.id
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{entry.member.name}</div>
                    <div className="text-sm text-gray-600">
                      {matches.length > 0 && selectedMember?.id === entry.member.id
                        ? `${getSongMatches(entry.member, countdownResults, hottest200Results, songs).length} matches`
                        : `${entry.member.votes.length} votes`}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            {selectedMember ? `${selectedMember.name}'s Matches` : 'Select a Member'}
          </h3>
          {!selectedMember ? (
            <p className="text-gray-500">Click on a member to see their matching songs</p>
          ) : matches.length === 0 ? (
            <p className="text-gray-500">No matches yet</p>
          ) : (
            <div className="space-y-3">
              {matches.map(({ vote, result, song }) => {
                if (!result || !song) return null;

                const isHottest200 = result.position > 100;
                const points = isHottest200
                  ? 101 + (200 - result.position)
                  : 101 + (100 - result.position);

                return (
                  <div
                    key={vote.songId}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-semibold">{song.title}</div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{points}</div>
                        <div className="text-xs text-gray-500">
                          {isHottest200 ? 'H200' : 'H100'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Scoring Rules:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Hottest 100: Position #100 = 101 points, #1 = 200 points</li>
          <li>• Hottest 200 (101-200): Position #200 = 1 point, #101 = 100 points</li>
          <li>• Only songs that appear in the countdown earn points</li>
          <li>• Your ranking of songs doesn't affect points (only whether they made the list)</li>
        </ul>
      </div>
    </div>
  );
};
