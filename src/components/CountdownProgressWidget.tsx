import React from 'react';
import type { Song, CountdownResult } from '../types';
import { COUNTDOWN_YEAR } from '../config/countdown';

interface CountdownProgressWidgetProps {
  songs: Song[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
  recentResults: CountdownResult[];
  numberOneSong: CountdownResult | undefined;
}

export const CountdownProgressWidget: React.FC<CountdownProgressWidgetProps> = ({
  songs,
  countdownResults,
  hottest200Results,
  recentResults,
  numberOneSong,
}) => {
  const hasHottest200Started = hottest200Results.length > 0;
  const totalResults = countdownResults.length + hottest200Results.length;

  const title = hasHottest200Started
    ? `The Hottest 200 of ${COUNTDOWN_YEAR}`
    : numberOneSong
    ? `The Hottest 100 of ${COUNTDOWN_YEAR}`
    : "Countdown Progress";

  const progressLabel = hasHottest200Started ? 'Overall Progress' : 'Hottest 100 Progress';
  const progressCount = hasHottest200Started
    ? `${totalResults}/200 songs`
    : `${countdownResults.length}/100 songs`;
  const progressPercent = hasHottest200Started
    ? (totalResults / 200) * 100
    : (countdownResults.length / 100) * 100;

  const latestLabel = hasHottest200Started ? 'Latest Entries (Hottest 200)' : 'Latest Entries';

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-orange-200 h-fit">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        📊 {title}
      </h3>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-gray-700">{progressLabel}</span>
          <span className="text-gray-600">{progressCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {recentResults.length > 0 && (
        <div>
          <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            {latestLabel}
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1.5 sm:space-y-2 pr-2">
            {recentResults.map((result) => {
              const song = songs.find(s => s.id === result.songId);
              if (!song) return null;

              return (
                <div
                  key={result.position}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                >
                  {song.thumbnail && (
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
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
                  <div className="font-bold text-orange-600 text-sm sm:text-lg flex-shrink-0">
                    #{result.position}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
