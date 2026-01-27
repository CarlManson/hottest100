import React from 'react';
import { DetailedBreakdownTable } from './DetailedBreakdownTable';

export const DetailedBreakdown: React.FC = () => {
  return (
    <div className="max-w-[95vw] mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <a
          href="#leaderboard"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline inline-block mb-3"
        >
          ← Back to Leaderboard
        </a>
        <h2 className="text-xl sm:text-3xl font-bold mb-2">Detailed Vote Breakdown</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Complete breakdown of all votes and scores earned
        </p>
      </div>

      <DetailedBreakdownTable />
    </div>
  );
};
