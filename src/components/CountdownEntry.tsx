import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LazyImage } from './LazyImage';

export const CountdownEntry: React.FC = () => {
  const { songs, countdownResults, updateCountdownResults, hottest200Results, updateHottest200Results } = useApp();

  // Default to Hottest 200 tab if Hottest 100 is complete
  const defaultTab = countdownResults.length === 100 ? 'hottest200' : 'hottest100';
  const [activeTab, setActiveTab] = useState<'hottest100' | 'hottest200'>(defaultTab);
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

  const handleClearAll = () => {
    const countdownName = activeTab === 'hottest100' ? 'Hottest 100' : 'Hottest 200';
    const confirmed = window.confirm(
      `Are you sure you want to clear ALL ${currentResults.length} songs from the ${countdownName}? This cannot be undone.`
    );
    if (confirmed) {
      updateResults([]);
    }
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

    const sortedResults = [...currentResults].sort((a, b) => a.position - b.position);

    // Preserve the current position values
    const currentPositions = sortedResults.map(r => r.position);

    // Reorder the songs
    const draggedItem = sortedResults[draggedIndex];
    const newSortedResults = sortedResults.filter((_, i) => i !== draggedIndex);
    newSortedResults.splice(targetIndex, 0, draggedItem);

    // Reassign the same position values to the reordered songs
    const updatedResults = newSortedResults.map((result, index) => ({
      ...result,
      position: currentPositions[index]
    }));

    updateResults(updatedResults);
    setDraggedIndex(null);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Exclude songs that are in either Hottest 100 OR Hottest 200
  const allAssignedSongIds = [
    ...countdownResults.map((r) => r.songId),
    ...hottest200Results.map((r) => r.songId)
  ];
  const availableSongs = filteredSongs.filter((s) => !allAssignedSongIds.includes(s.id));

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 hidden sm:block">Countdown Results</h2>

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('hottest100')}
            className={`flex-1 py-2 sm:py-3 px-2 rounded-lg font-semibold transition text-xs sm:text-base ${
              activeTab === 'hottest100'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="hidden sm:inline">Hottest 100 ({countdownResults.length}/100)</span>
            <span className="sm:hidden">100 ({countdownResults.length}/100)</span>
          </button>
          <button
            onClick={() => setActiveTab('hottest200')}
            className={`flex-1 py-2 sm:py-3 px-2 rounded-lg font-semibold transition text-xs sm:text-base ${
              activeTab === 'hottest200'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <span className="hidden sm:inline">Hottest 200 (101-200) ({hottest200Results.length}/100)</span>
            <span className="sm:hidden">200 ({hottest200Results.length}/100)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add Song</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Click a song to add it to the countdown. Songs are added from position {maxPosition} down to {minPosition}.
            </p>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium mb-2">Search Song</label>
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-48 sm:max-h-96 overflow-y-auto space-y-1.5 sm:space-y-2">
              {availableSongs.length === 0 ? (
                <p className="text-gray-500 text-xs sm:text-sm">
                  {searchTerm ? 'No songs match your search' : 'All songs have been added'}
                </p>
              ) : (
                availableSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleAddResult(song.id)}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
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
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">
                Current Results ({currentResults.length}/{maxPosition - minPosition + 1})
              </h3>
              {currentResults.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-600 transition text-xs sm:text-sm font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Drag and drop to reorder the countdown
            </p>
            {currentResults.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No results entered yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1.5 sm:space-y-2">
                {[...currentResults]
                  .sort((a, b) => a.position - b.position)
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
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition ${
                          draggedIndex === index ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="font-bold text-sm sm:text-lg w-8 sm:w-12 flex-shrink-0">#{result.position}</div>
                        {song.thumbnail && (
                          <LazyImage
                            src={song.thumbnail}
                            alt={`${song.title} artwork`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                          <div className="text-[10px] sm:text-sm text-gray-600 truncate">{song.artist}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveResult(result.position)}
                          className="text-red-600 hover:text-red-800 px-1 sm:px-2 text-lg sm:text-xl flex-shrink-0"
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
