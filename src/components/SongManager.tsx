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
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  const handleImport = async () => {
    setError('');
    setImportProgress('');
    setImporting(true);

    try {
      // Try JSON first
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const newSongs = parsed.map((item) => ({
          title: item.title || item.song || item.track || '',
          artist: item.artist || '',
          thumbnail: item.thumbnail,
          isAustralian: item.isAustralian,
        }));

        // Import in chunks for large datasets
        const chunkSize = 50; // Reduced for better reliability
        if (newSongs.length > chunkSize) {
          setImportProgress(`Importing ${newSongs.length} songs in batches...`);

          try {
            for (let i = 0; i < newSongs.length; i += chunkSize) {
              const chunk = newSongs.slice(i, i + chunkSize);
              await addSongs(chunk);
              const imported = Math.min(i + chunkSize, newSongs.length);
              setImportProgress(`Imported ${imported}/${newSongs.length} songs...`);

              // Longer delay to prevent rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            setImportProgress(`✅ Successfully imported ${newSongs.length} songs!`);
            setTimeout(() => {
              setImportText('');
              setImportProgress('');
            }, 3000);
          } catch (err) {
            console.error('Import error:', err);
            const errorMsg = err instanceof Error
              ? err.message
              : (err && typeof err === 'object' && 'message' in err)
                ? String((err as any).message)
                : JSON.stringify(err);
            setError(`Import failed: ${errorMsg}`);
            setImporting(false);
            return;
          }
        } else {
          try {
            await addSongs(newSongs);
            setImportProgress(`✅ Successfully imported ${newSongs.length} songs!`);
            setTimeout(() => {
              setImportText('');
              setImportProgress('');
            }, 3000);
          } catch (err) {
            console.error('Import error:', err);
            const errorMsg = err instanceof Error
              ? err.message
              : (err && typeof err === 'object' && 'message' in err)
                ? String((err as any).message)
                : JSON.stringify(err);
            setError(`Import failed: ${errorMsg}`);
            setImporting(false);
            return;
          }
        }

        setImporting(false);
        return;
      }
    } catch (e) {
      // Not JSON, try CSV
      const lines = importText.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        setError('No data to import');
        setImporting(false);
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
          setImportProgress(`✅ Successfully imported ${newSongs.length} songs!`);
          setTimeout(() => setImportProgress(''), 3000);
        } catch (err) {
          setError('Failed to import songs. Please try again.');
        }
      } else {
        setError('No valid songs found. Format: Artist, Title (one per line)');
      }
    } finally {
      setImporting(false);
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
          Paste JSON array with thumbnails and Australian artist flags, or CSV (format: Artist, Title - one per line)
        </p>
        <textarea
          className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg mb-3 font-mono text-sm focus:border-orange-500 focus:outline-none"
          placeholder='JSON: [{"artist": "Artist Name", "title": "Song Title", "thumbnail": "url", "isAustralian": true}]\nCSV: Artist Name, Song Title'
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          disabled={importing}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {importProgress && <p className="text-blue-600 text-sm mb-3 font-semibold">{importProgress}</p>}
        <button
          onClick={handleImport}
          disabled={importing}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import Songs'}
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
            <div className="space-y-2">
              {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  {song.thumbnail && (
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{song.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="truncate">{song.artist}</span>
                      {song.isAustralian && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                          AUS
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSong(song.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
