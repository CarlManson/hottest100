import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const DataManager: React.FC = () => {
  const { songs, familyMembers, countdownResults, hottest200Results, clearAllData } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Data Management</h3>

      <div className="space-y-3">
        <div>
          <button
            onClick={handleExport}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold"
          >
            Export All Data
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Download all songs, votes, and results as JSON
          </p>
        </div>

        <div>
          <button
            onClick={handleClearAll}
            className={`px-6 py-2 rounded-lg transition font-bold ${
              showConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showConfirm ? 'Click Again to Confirm' : 'Clear All Data'}
          </button>
          {showConfirm && (
            <p className="text-sm text-red-600 mt-1">
              Warning: This will delete everything!
            </p>
          )}
          {showConfirm && (
            <button
              onClick={() => setShowConfirm(false)}
              className="ml-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Current Data:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Songs: {songs.length}</li>
          <li>Family Members: {familyMembers.length}</li>
          <li>Hottest 100 Results: {countdownResults.length}/100</li>
          <li>Hottest 200 Results: {hottest200Results.length}/100</li>
        </ul>
      </div>
    </div>
  );
};
