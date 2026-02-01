import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Song } from '../types';
import { useCountdownSettings, useCountdown, formatDateForInput, parseDateFromInput } from '../hooks/useCountdownSettings';

const DEFAULT_LABEL_PROMPT = `You're a cheeky Aussie music critic analyzing someone's Hottest 100 picks. Be funny, playful, and engaging.

**{memberName}'s Picks:**
{picks}

{existingLabels}

Write a response in this EXACT format:

LABEL: [2-3 word punchy description based on their music taste - like "Indie Purist", "Pop Connoisseur", "Alt-Rock Fan", "Genre Hopper", "Mainstream Maven", "Aussie Champion", "Global Selector", etc. Base it on the genres, styles, and artist origins (Australian vs International) they chose. MUST be unique and different from any labels already used above.]

MUSIC_TASTE: [3-4 sentences analyzing their song choices - genre preferences (infer from artists), mainstream vs indie/alternative leanings, artist nationality/origin patterns (Australian-heavy, international mix, etc.), any notable themes or trends. Focus on WHAT they picked based on musical style and artist origins.]

Be observant and insightful about their musical preferences.`;

const DEFAULT_MUSIC_TASTE_PROMPT = `You're a cheeky Aussie music critic analyzing someone's Hottest 100 picks. Be funny, playful, and a bit cheeky - but never mean-spirited.

**{memberName}'s Picks:**
{picks}

Write a music taste analysis (3-4 sentences) with personality. Comment on:
- Genre preferences and patterns (infer genres from the artists and songs)
- Mainstream vs indie/alternative leanings
- Artist nationality/origin patterns (e.g., backing the Aussies, going international, etc.)
- Any notable themes or trends
- Give them a bit of a roast if their taste is predictable, or props if it's interesting

Be observant, funny, and engaging about their musical preferences. Keep it friendly and fun!

Return format:
MUSIC_TASTE: [Your 3-4 sentence analysis here]`;

type TabType = 'event' | 'ai' | 'songs' | 'data';

export const Settings: React.FC = () => {
  const {
    songs,
    familyMembers,
    countdownResults,
    hottest200Results,
    addSongs,
    removeSong,
    clearAllData,
    archiveAndReset,
    resetRateLimit,
    isGeneratingProfiles,
    getNextAvailableRegenerationTime
  } = useApp();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('event');

  // Countdown settings
  const { countdownDate, setCountdownDate, isEnabled: isCountdownEnabled } = useCountdownSettings();
  const countdown = useCountdown();
  const [countdownDateInput, setCountdownDateInput] = useState<string>('');

  // AI Prompts state
  const [labelPrompt, setLabelPrompt] = useState(DEFAULT_LABEL_PROMPT);
  const [musicTastePrompt, setMusicTastePrompt] = useState(DEFAULT_MUSIC_TASTE_PROMPT);
  const [saveMessage, setSaveMessage] = useState('');
  const hasActiveRateLimit = getNextAvailableRegenerationTime() !== null;

  // Songs state
  const [importText, setImportText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualThumbnail, setManualThumbnail] = useState('');
  const [manualIsAustralian, setManualIsAustralian] = useState(false);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  // Data state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear() - 1);

  useEffect(() => {
    // Load prompts from localStorage
    const savedLabelPrompt = localStorage.getItem('ai_label_prompt');
    const savedMusicTastePrompt = localStorage.getItem('ai_music_taste_prompt');

    if (savedLabelPrompt) setLabelPrompt(savedLabelPrompt);
    if (savedMusicTastePrompt) setMusicTastePrompt(savedMusicTastePrompt);
  }, []);

  // Initialize countdown date input when countdown date changes
  useEffect(() => {
    if (countdownDate) {
      setCountdownDateInput(formatDateForInput(countdownDate));
    } else {
      setCountdownDateInput('');
    }
  }, [countdownDate]);

  // Get unique artists for autocomplete
  const uniqueArtists = useMemo(() => {
    const artists = songs.map(song => song.artist);
    return Array.from(new Set(artists)).sort();
  }, [songs]);

  // AI Prompts handlers
  const handleSave = () => {
    localStorage.setItem('ai_label_prompt', labelPrompt);
    localStorage.setItem('ai_music_taste_prompt', musicTastePrompt);
    setSaveMessage('Prompts saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleResetToDefaults = () => {
    setLabelPrompt(DEFAULT_LABEL_PROMPT);
    setMusicTastePrompt(DEFAULT_MUSIC_TASTE_PROMPT);
    localStorage.removeItem('ai_label_prompt');
    localStorage.removeItem('ai_music_taste_prompt');
    setSaveMessage('Reset to default prompts');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleResetRateLimit = async () => {
    try {
      await resetRateLimit();
      setSaveMessage('Rate limit reset successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error resetting rate limit');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Event/Countdown handlers
  const handleSetCountdownDate = () => {
    const date = parseDateFromInput(countdownDateInput);
    if (date) {
      setCountdownDate(date);
      setSaveMessage('Countdown date saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Please enter a valid date and time');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleClearCountdownDate = () => {
    setCountdownDate(null);
    setCountdownDateInput('');
    setSaveMessage('Countdown timer disabled');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSetDefaultDate = () => {
    // Default: Jan 25, 2026 at 12:00 PM local time (typical Hottest 100 start)
    const defaultDate = new Date(2026, 0, 25, 12, 0, 0);
    setCountdownDateInput(formatDateForInput(defaultDate));
  };

  // Songs handlers
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
        const chunkSize = 50;
        if (newSongs.length > chunkSize) {
          setImportProgress(`Importing ${newSongs.length} songs in batches...`);

          try {
            for (let i = 0; i < newSongs.length; i += chunkSize) {
              const chunk = newSongs.slice(i, i + chunkSize);
              await addSongs(chunk);
              const imported = Math.min(i + chunkSize, newSongs.length);
              setImportProgress(`Imported ${imported}/${newSongs.length} songs...`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            setImportProgress(`✅ Successfully imported ${newSongs.length} songs!`);
            setTimeout(() => {
              setImportText('');
              setImportProgress('');
            }, 3000);
          } catch (err) {
            console.error('Import error:', err);
            const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
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
            const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
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
          thumbnail: manualThumbnail.trim() || undefined,
          isAustralian: manualIsAustralian,
        },
      ]);

      setManualTitle('');
      setManualArtist('');
      setManualThumbnail('');
      setManualIsAustralian(false);
      setError('');
    } catch (err) {
      setError('Failed to add song. Please try again.');
    }
  };

  // Data handlers
  const handleExport = () => {
    const data = {
      songs,
      familyMembers,
      countdownResults,
      hottest200Results,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hottest100-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (showConfirm) {
      clearAllData();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleArchiveAndReset = async () => {
    if (showArchiveConfirm) {
      setArchiving(true);
      try {
        await archiveAndReset(archiveYear);
        setShowArchiveConfirm(false);
        setArchiveYear(new Date().getFullYear()); // Reset to current year for next time
      } catch (error) {
        console.error('Error archiving:', error);
        setError('Failed to archive data. Please try again.');
      } finally {
        setArchiving(false);
      }
    } else {
      setShowArchiveConfirm(true);
    }
  };

  // Check if both countdowns are complete
  const bothCountdownsComplete = countdownResults.length === 100 && hottest200Results.length === 100;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage AI prompts, songs, and data</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('event')}
          className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'event'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📅 Event
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'ai'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🤖 AI Prompts
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'songs'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🎵 Songs
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'data'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          💾 Data
        </button>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {saveMessage}
        </div>
      )}

      {/* Event Tab */}
      {activeTab === 'event' && (
        <div className="space-y-6">
          {/* Countdown Date/Time Setting */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Countdown Timer</h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the date and time when the Hottest 100 countdown begins. The countdown timer will appear in the blue banner on the dashboard and public home page.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Countdown Start Date & Time
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="datetime-local"
                    value={countdownDateInput}
                    onChange={(e) => setCountdownDateInput(e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSetDefaultDate}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Use 2026 Default
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Typically the Saturday of the Australia Day long weekend at 12:00 PM AEDT
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSetCountdownDate}
                  disabled={!countdownDateInput}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💾 Save Countdown Date
                </button>
                {isCountdownEnabled && (
                  <button
                    onClick={handleClearCountdownDate}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                  >
                    🗑️ Disable Countdown
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className={`rounded-lg shadow-md p-4 sm:p-6 ${isCountdownEnabled ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800' : 'bg-gray-100'}`}>
            <h2 className={`text-lg sm:text-xl font-bold mb-4 ${isCountdownEnabled ? 'text-white' : 'text-gray-800'}`}>
              {isCountdownEnabled ? '⏰ Countdown Status' : '⏰ Countdown Disabled'}
            </h2>

            {isCountdownEnabled && countdownDate ? (
              countdown.isStarted ? (
                <div className="text-center py-4">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-2">
                    The Countdown Has Started!
                  </div>
                  <p className="text-white/80">
                    The countdown timer is no longer visible as the event has begun.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-white/80 text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wide text-center">
                    Countdown Starts In
                  </div>
                  <div className="flex justify-center gap-2 sm:gap-4">
                    <div className="bg-white rounded-lg px-3 sm:px-6 py-2 sm:py-4 min-w-[60px] sm:min-w-[80px] text-center">
                      <div className="text-2xl sm:text-4xl font-black text-gray-800">{String(countdown.days).padStart(2, '0')}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Days</div>
                    </div>
                    <div className="bg-white rounded-lg px-3 sm:px-6 py-2 sm:py-4 min-w-[60px] sm:min-w-[80px] text-center">
                      <div className="text-2xl sm:text-4xl font-black text-gray-800">{String(countdown.hours).padStart(2, '0')}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Hours</div>
                    </div>
                    <div className="bg-white rounded-lg px-3 sm:px-6 py-2 sm:py-4 min-w-[60px] sm:min-w-[80px] text-center">
                      <div className="text-2xl sm:text-4xl font-black text-gray-800">{String(countdown.minutes).padStart(2, '0')}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Minutes</div>
                    </div>
                    <div className="bg-white rounded-lg px-3 sm:px-6 py-2 sm:py-4 min-w-[60px] sm:min-w-[80px] text-center">
                      <div className="text-2xl sm:text-4xl font-black text-gray-800">{String(countdown.seconds).padStart(2, '0')}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Seconds</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-center text-sm mt-4">
                    Counting down to: {countdownDate.toLocaleString()}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  No countdown date is set. Set a date above to enable the countdown timer on the dashboard.
                </p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">ℹ️ About the Countdown Timer</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• The countdown timer appears in a blue banner on the Dashboard and Public Home page</li>
              <li>• Once the countdown reaches zero, the timer automatically hides</li>
              <li>• This setting is stored locally in your browser</li>
              <li>• The Hottest 100 typically starts at 12:00 PM AEDT on the Saturday of Australia Day weekend</li>
              <li>• For 2026, the expected date is Saturday, January 25th</li>
            </ul>
          </div>
        </div>
      )}

      {/* AI Prompts Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Label Prompt */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Nickname/Label Prompt</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                This prompt generates member labels (2-3 word creative descriptions) and is used by the 🏷️ Re/generate Nickname button. Available variables:
                <code className="bg-gray-100 px-1 rounded text-xs">{'{memberName}'}</code>,
                <code className="bg-gray-100 px-1 rounded text-xs ml-1">{'{picks}'}</code>,
                <code className="bg-gray-100 px-1 rounded text-xs ml-1">{'{existingLabels}'}</code>
              </p>
            </div>
            <textarea
              value={labelPrompt}
              onChange={(e) => setLabelPrompt(e.target.value)}
              className="w-full h-64 p-3 border-2 border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
              placeholder="Enter prompt template..."
            />
          </div>

          {/* Music Taste Prompt */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Music Taste Profile Prompt</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                This prompt generates music taste descriptions (3-4 sentence analysis) and is used by the ✨ Re/generate Profile button. Available variables:
                <code className="bg-gray-100 px-1 rounded text-xs">{'{memberName}'}</code>,
                <code className="bg-gray-100 px-1 rounded text-xs ml-1">{'{picks}'}</code>
              </p>
            </div>
            <textarea
              value={musicTastePrompt}
              onChange={(e) => setMusicTastePrompt(e.target.value)}
              className="w-full h-64 p-3 border-2 border-gray-200 rounded-lg font-mono text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
              placeholder="Enter prompt template..."
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-pink-600 transition text-sm sm:text-base"
              >
                💾 Save Prompts
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                ↺ Reset to Defaults
              </button>
              {hasActiveRateLimit && (
                <button
                  onClick={handleResetRateLimit}
                  disabled={isGeneratingProfiles}
                  className="px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  🔓 Reset Rate Limit
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">ℹ️ About Prompt Customization</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• These prompts show what the AI currently uses to generate profiles</li>
              <li>• Prompts are stored locally in your browser for reference</li>
              <li>• Variables in curly braces like <code className="bg-blue-100 px-1 rounded">{'{memberName}'}</code> are replaced with actual values</li>
              <li>• The AI expects specific output formats (LABEL: and MUSIC_TASTE:)</li>
              <li>• <strong>Note:</strong> To actually customize prompts, you need to modify and redeploy the Supabase Edge Function</li>
              <li>• These saved prompts serve as a reference for what you'd want to change in the Edge Function</li>
            </ul>
          </div>

          {/* Advanced Usage Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2 text-sm sm:text-base">⚙️ To Apply Custom Prompts</h3>
            <ol className="text-xs sm:text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Edit prompts here and save them as reference</li>
              <li>Open <code className="bg-yellow-100 px-1 rounded">supabase/functions/generate-profile/index.ts</code></li>
              <li>Update the prompts in the <code className="bg-yellow-100 px-1 rounded">generateLabelAndTaste()</code> and <code className="bg-yellow-100 px-1 rounded">generateMusicTaste()</code> functions</li>
              <li>Run: <code className="bg-yellow-100 px-1 rounded">supabase functions deploy generate-profile</code></li>
              <li>Your custom prompts will now be active!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Songs Tab */}
      {activeTab === 'songs' && (
        <div className="space-y-6">
          {/* Import Songs */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Import Songs</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Paste JSON array with thumbnails and Australian artist flags, or CSV (format: Artist, Title - one per line)
            </p>
            <textarea
              className="w-full h-40 p-3 border-2 border-gray-200 rounded-lg mb-3 font-mono text-xs sm:text-sm focus:border-orange-500 focus:outline-none"
              placeholder='JSON: [{"artist": "Artist Name", "title": "Song Title", "thumbnail": "url", "isAustralian": true}]&#10;CSV: Artist Name, Song Title'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              disabled={importing}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {importProgress && <p className="text-blue-600 text-sm mb-3 font-semibold">{importProgress}</p>}
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : '📥 Import Songs'}
            </button>
          </div>

          {/* Add Song Manually */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Add Song Manually</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Artist"
                  list="artist-suggestions"
                  className="p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none w-full"
                  value={manualArtist}
                  onChange={(e) => setManualArtist(e.target.value)}
                />
                <datalist id="artist-suggestions">
                  {uniqueArtists.map(artist => (
                    <option key={artist} value={artist} />
                  ))}
                </datalist>
              </div>
              <input
                type="text"
                placeholder="Song Title"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Thumbnail URL (optional)"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none md:col-span-2"
                value={manualThumbnail}
                onChange={(e) => setManualThumbnail(e.target.value)}
              />
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition md:col-span-2">
                <input
                  type="checkbox"
                  checked={manualIsAustralian}
                  onChange={(e) => setManualIsAustralian(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">Australian Artist 🦘</span>
              </label>
            </div>
            <button
              onClick={handleAddManual}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition font-bold"
            >
              ➕ Add Song
            </button>
          </div>

          {/* Current Songs */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              Current Songs ({songs.length})
            </h2>
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
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Data Statistics */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Current Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{songs.length}</div>
                <div className="text-sm text-gray-600">Songs</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{familyMembers.length}</div>
                <div className="text-sm text-gray-600">Members</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{countdownResults.length}/100</div>
                <div className="text-sm text-gray-600">Hottest 100</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{hottest200Results.length}/100</div>
                <div className="text-sm text-gray-600">Hottest 200</div>
              </div>
            </div>
          </div>

          {/* Archive & Reset for Next Year */}
          {bothCountdownsComplete && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-4 sm:p-6 border-2 border-green-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Archive & Reset for Next Year</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Both countdowns are complete! Archive this year's results and reset for the next Hottest 100.
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold text-sm mb-2">⚠️ Warning: This will permanently delete all current data!</p>
                <ul className="text-yellow-700 text-xs space-y-1">
                  <li>✓ All data will be saved to the archive first</li>
                  <li>✓ Songs, members, votes, and results will be cleared</li>
                  <li>✓ You'll start fresh for the next year</li>
                  <li>✓ Archived data can be viewed in the Archive tab</li>
                </ul>
                <p className="text-yellow-800 text-xs mt-2 font-semibold">💡 Tip: Export your data first if you want an extra backup!</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Archive as Year:
                </label>
                <input
                  type="number"
                  value={archiveYear}
                  onChange={(e) => setArchiveYear(parseInt(e.target.value))}
                  min={2020}
                  max={2030}
                  className="w-32 p-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This year will be used in the Archive dropdown
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleArchiveAndReset}
                  disabled={archiving}
                  className={`${
                    showArchiveConfirm
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } text-white px-6 py-2 rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {archiving
                    ? '🔄 Archiving...'
                    : showArchiveConfirm
                    ? `⚠️ CONFIRM: Archive ${archiveYear} & Delete All Data`
                    : `📚 Archive ${archiveYear} & Reset`}
                </button>
                {showArchiveConfirm && !archiving && (
                  <button
                    onClick={() => setShowArchiveConfirm(false)}
                    className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Export Data */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Export Data</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Download all songs, members, votes, and countdown results as JSON
            </p>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition font-bold"
            >
              📦 Export All Data
            </button>
          </div>

          {/* Clear All Data */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 border-red-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Permanently delete all data including songs, members, votes, and countdown results
            </p>
            <button
              onClick={handleClearAll}
              className={`px-6 py-2 rounded-lg transition font-bold ${
                showConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showConfirm ? '⚠️ Click Again to Confirm' : '🗑️ Clear All Data'}
            </button>
            {showConfirm && (
              <div className="mt-3">
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ Warning: This will permanently delete everything!
                </p>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
