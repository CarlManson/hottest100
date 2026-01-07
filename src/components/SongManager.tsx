import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Song } from '../types';
import { DataManager } from './DataManager';

export const SongManager: React.FC = () => {
  const { songs, addSongs, removeSong } = useApp();
  const [importText, setImportText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    try {
      // Try JSON first
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const newSongs = parsed.map((item) => ({
          title: item.title || item.song || item.track || '',
          artist: item.artist || '',
        }));
        await addSongs(newSongs);
        setImportText('');
        return;
      }
    } catch {
      // Not JSON, try CSV
      const lines = importText.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        setError('No data to import');
        return;
      }

      const newSongs: Omit<Song, 'id'>[] = [];
      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          newSongs.push({
            artist: parts[0],
            title: parts[1],
          });
        }
      });

      if (newSongs.length > 0) {
        try {
          await addSongs(newSongs);
          setImportText('');
        } catch (err) {
          setError('Failed to import songs. Please try again.');
        }
      } else {
        setError('No valid songs found. Format: Artist, Title (one per line)');
      }
    }
  };

  const handleAddManual = async () => {
    if (!manualTitle.trim() || !manualArtist.trim()) {
      setError('Please enter both title and artist');
      return;
    }

    try {
      await addSongs([
        {
          title: manualTitle.trim(),
          artist: manualArtist.trim(),
        },
      ]);

      setManualTitle('');
      setManualArtist('');
      setError('');
    } catch (err) {
      setError('Failed to add song. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-4xl font-black mb-6 text-gray-800">Manage Songs</h2>

      <DataManager />

      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Import Songs</h3>
        <p className="text-gray-600 mb-4">
          Paste JSON array or CSV (format: Artist, Title - one per line)
        </p>
        <textarea
          className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg mb-3 font-mono text-sm focus:border-orange-500 focus:outline-none"
          placeholder='JSON: [{"artist": "Artist Name", "title": "Song Title"}]\nCSV: Artist Name, Song Title'
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={handleImport}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold"
        >
          Import Songs
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Add Song Manually</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Artist"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
          />
          <input
            type="text"
            placeholder="Song Title"
            className="p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddManual}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold"
        >
          Add Song
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Current Songs ({songs.length})
        </h3>
        {songs.length === 0 ? (
          <p className="text-gray-500">No songs added yet</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3">Artist</th>
                  <th className="text-left p-3">Title</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{song.artist}</td>
                    <td className="p-3">{song.title}</td>
                    <td className="p-3">
                      <button
                        onClick={() => removeSong(song.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
