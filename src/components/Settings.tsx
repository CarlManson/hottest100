import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const DEFAULT_LABEL_PROMPT = `You're a music critic analyzing someone's song choices based purely on their musical preferences.

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

export const Settings: React.FC = () => {
  const { resetRateLimit, isGeneratingProfiles, getNextAvailableRegenerationTime } = useApp();
  const [labelPrompt, setLabelPrompt] = useState(DEFAULT_LABEL_PROMPT);
  const [musicTastePrompt, setMusicTastePrompt] = useState(DEFAULT_MUSIC_TASTE_PROMPT);
  const [saveMessage, setSaveMessage] = useState('');
  const hasActiveRateLimit = getNextAvailableRegenerationTime() !== null;

  useEffect(() => {
    // Load prompts from localStorage
    const savedLabelPrompt = localStorage.getItem('ai_label_prompt');
    const savedMusicTastePrompt = localStorage.getItem('ai_music_taste_prompt');

    if (savedLabelPrompt) setLabelPrompt(savedLabelPrompt);
    if (savedMusicTastePrompt) setMusicTastePrompt(savedMusicTastePrompt);
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Customize AI prompts and manage rate limits</p>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {saveMessage}
        </div>
      )}

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
    </div>
  );
};
