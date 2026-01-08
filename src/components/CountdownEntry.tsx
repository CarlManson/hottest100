import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CountdownResult } from '../types';

export const CountdownEntry: React.FC = () => {
  const { songs, countdownResults, updateCountdownResults, hottest200Results, updateHottest200Results } = useApp();
  const [activeTab, setActiveTab] = useState<'hottest100' | 'hottest200'>('hottest100');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const currentResults = activeTab === 'hottest100' ? countdownResults : hottest200Results;
  const updateResults = activeTab === 'hottest100' ? updateCountdownResults : updateHottest200Results;

  const minPosition = activeTab === 'hottest100' ? 1 : 101;
  const maxPosition = activeTab === 'hottest100' ? 100 : 200;

  // Get next available position (counting down from max)
  const getNextPosition = () => {
    if (currentResults.length === 0) return maxPosition;
    const occupiedPositions = new Set(currentResults.map(r => r.position));
    for (let pos = maxPosition; pos >= minPosition; pos--) {
      if (!occupiedPositions.has(pos)) {
        return pos;
      }
    }
    return null; // All positions filled
  };

  const handleAddResult = (songId: string) => {
    const nextPos = getNextPosition();
    if (nextPos === null) {
      alert(`All positions are filled for this countdown`);
      return;
    }

    const newResults = [...currentResults];
    newResults.push({ songId, position: nextPos });
    newResults.sort((a, b) => a.position - b.position);

    updateResults(newResults);
    setSearchTerm('');
  };

  const handleRemoveResult = (position: number) => {
    const newResults = currentResults.filter((r) => r.position !== position);
    updateResults(newResults);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const sortedResults = [...currentResults].sort((a, b) => b.position - a.position);
    const draggedItem = sortedResults[draggedIndex];
    const newSortedResults = sortedResults.filter((_, i) => i !== draggedIndex);
    newSortedResults.splice(targetIndex, 0, draggedItem);

    // Reassign positions based on new order
    const updatedResults = newSortedResults.map((result, index) => ({
      ...result,
      position: maxPosition - index
    }));

    updateResults(updatedResults);
    setDraggedIndex(null);
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
            <h3 className="text-xl font-semibold mb-4">Add Song</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click a song to add it to the countdown. Songs are added from position {maxPosition} down to {minPosition}.
            </p>

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
              {availableSongs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'No songs match your search' : 'All songs have been added'}
                </p>
              ) : (
                availableSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleAddResult(song.id)}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="font-semibold">{song.title}</div>
                    <div className="text-sm text-gray-600">{song.artist}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">
              Current Results ({currentResults.length}/{maxPosition - minPosition + 1})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop to reorder the countdown
            </p>
            {currentResults.length === 0 ? (
              <p className="text-gray-500">No results entered yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {[...currentResults]
                  .sort((a, b) => b.position - a.position)
                  .map((result, index) => {
                    const song = songs.find((s) => s.id === result.songId);
                    if (!song) return null;
                    return (
                      <div
                        key={result.songId}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition ${
                          draggedIndex === index ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="font-bold text-lg w-12">#{result.position}</div>
                        {song.thumbnail && (
                          <img
                            src={song.thumbnail}
                            alt={`${song.title} artwork`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">{song.title}</div>
                          <div className="text-sm text-gray-600">{song.artist}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveResult(result.position)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ✕
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
