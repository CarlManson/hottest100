import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard } from '../utils/scoring';
import type { Archive as ArchiveType } from '../types';

export const Archive: React.FC = () => {
  const { archives } = useApp();
  const [selectedArchive, setSelectedArchive] = useState<ArchiveType | null>(
    archives.length > 0 ? archives[0] : null
  );

  if (archives.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-black text-gray-800 mb-6">Archive</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No archived data yet. Complete a countdown and archive it to see past results here!</p>
        </div>
      </div>
    );
  }

  const leaderboard = selectedArchive
    ? getLeaderboard(
        selectedArchive.data.familyMembers,
        selectedArchive.data.countdownResults,
        selectedArchive.data.hottest200Results
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-black text-gray-800 mb-6">Archive</h1>

      {/* Year selector */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Year:</label>
        <select
          value={selectedArchive?.id || ''}
          onChange={(e) => {
            const archive = archives.find(a => a.id === e.target.value);
            setSelectedArchive(archive || null);
          }}
          className="p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
        >
          {archives.map(archive => (
            <option key={archive.id} value={archive.id}>
              {archive.year} Hottest 100
            </option>
          ))}
        </select>
      </div>

      {selectedArchive && (
        <>
          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Final Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      text-2xl font-black w-10 h-10 flex items-center justify-center rounded-full
                      ${index === 0 ? 'bg-yellow-400 text-white' : ''}
                      ${index === 1 ? 'bg-gray-300 text-white' : ''}
                      ${index === 2 ? 'bg-orange-600 text-white' : ''}
                      ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{entry.member.name}</div>
                      <div className="text-sm text-gray-600">
                        {entry.member.votes.length} pick{entry.member.votes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-600">{entry.score}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hottest 100 */}
            {selectedArchive.data.countdownResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Hottest 100</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {selectedArchive.data.countdownResults
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((result) => {
                      const song = selectedArchive.data.songs.find(s => s.id === result.songId);
                      if (!song) return null;

                      return (
                        <div key={result.position} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-black text-orange-500 w-12 text-center">
                            #{result.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{song.title}</div>
                            <div className="text-sm text-gray-600 truncate">{song.artist}</div>
                          </div>
                          {song.isAustralian && (
                            <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full text-white">🦘</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Hottest 200 */}
            {selectedArchive.data.hottest200Results.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Hottest 200</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {selectedArchive.data.hottest200Results
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((result) => {
                      const song = selectedArchive.data.songs.find(s => s.id === result.songId);
                      if (!song) return null;

                      return (
                        <div key={result.position} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-black text-pink-500 w-12 text-center">
                            #{result.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{song.title}</div>
                            <div className="text-sm text-gray-600 truncate">{song.artist}</div>
                          </div>
                          {song.isAustralian && (
                            <span className="text-sm bg-orange-500 px-2 py-0.5 rounded-full text-white">🦘</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
