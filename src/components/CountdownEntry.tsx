import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CountdownEntry: React.FC = () => {
  const { songs, countdownResults, updateCountdownResults, hottest200Results, updateHottest200Results } = useApp();
  const [activeTab, setActiveTab] = useState<'hottest100' | 'hottest200'>('hottest100');
  const [position, setPosition] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const currentResults = activeTab === 'hottest100' ? countdownResults : hottest200Results;
  const updateResults = activeTab === 'hottest100' ? updateCountdownResults : updateHottest200Results;

  const minPosition = activeTab === 'hottest100' ? 1 : 101;
  const maxPosition = activeTab === 'hottest100' ? 100 : 200;

  const handleAddResult = (songId: string) => {
    const pos = parseInt(position);
    if (isNaN(pos) || pos < minPosition || pos > maxPosition) {
      alert(`Please enter a position between ${minPosition} and ${maxPosition}`);
      return;
    }

    const existingAtPosition = currentResults.find((r) => r.position === pos);
    if (existingAtPosition) {
      if (!confirm(`Position ${pos} already has a song. Replace it?`)) {
        return;
      }
    }

    const newResults = currentResults.filter((r) => r.position !== pos && r.songId !== songId);
    newResults.push({ songId, position: pos });
    newResults.sort((a, b) => a.position - b.position);

    updateResults(newResults);
    setPosition('');
    setSearchTerm('');
  };

  const handleRemoveResult = (position: number) => {
    const newResults = currentResults.filter((r) => r.position !== position);
    updateResults(newResults);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedSongIds = currentResults.map((r) => r.songId);
  const availableSongs = filteredSongs.filter((s) => !assignedSongIds.includes(s.id));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Countdown Results</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('hottest100')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              activeTab === 'hottest100'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Hottest 100 ({countdownResults.length}/100)
          </button>
          <button
            onClick={() => setActiveTab('hottest200')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              activeTab === 'hottest200'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Hottest 200 (101-200) ({hottest200Results.length}/100)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Add Result</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Position</label>
              <input
                type="number"
                min={minPosition}
                max={maxPosition}
                placeholder={`${minPosition}-${maxPosition}`}
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search Song</label>
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleAddResult(song.id)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="font-semibold">{song.title}</div>
                  <div className="text-sm text-gray-600">{song.artist}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Current Results</h3>
            {currentResults.length === 0 ? (
              <p className="text-gray-500">No results entered yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {currentResults.map((result) => {
                  const song = songs.find((s) => s.id === result.songId);
                  if (!song) return null;
                  return (
                    <div
                      key={result.position}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="font-bold text-lg w-12">#{result.position}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{song.title}</div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveResult(result.position)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
