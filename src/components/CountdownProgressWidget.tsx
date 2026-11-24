import React from 'react';
import type { Song, CountdownResult } from '../types';
import { COUNTDOWN_YEAR } from '../config/brand';
import { useNewArrivals } from '../hooks/useNewArrivals';

interface CountdownProgressWidgetProps {
  songs: Song[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
  recentResults: CountdownResult[];
  numberOneSong: CountdownResult | undefined;
  /** Hide headings and progress on small screens (hero placement) */
  compact?: boolean;
}

export const CountdownProgressWidget: React.FC<CountdownProgressWidgetProps> = ({
  songs,
  countdownResults,
  hottest200Results,
  recentResults,
  numberOneSong,
  compact = false,
}) => {
  const isNew = useNewArrivals(recentResults);
  const hasHottest200Started = hottest200Results.length > 0;
  const totalResults = countdownResults.length + hottest200Results.length;
  const desktopOnly = compact ? 'hidden md:block' : '';

  const title = hasHottest200Started
    ? `The Hottest 200 of ${COUNTDOWN_YEAR}`
    : numberOneSong
    ? `The Hottest 100 of ${COUNTDOWN_YEAR}`
    : 'Countdown Progress';

  const progressPercent = hasHottest200Started
    ? (totalResults / 200) * 100
    : (countdownResults.length / 100) * 100;

  return (
    <div className={`countdown-widget bg-white rounded-xl shadow-lg ${compact ? 'p-2' : 'p-4'} sm:p-6 border-2 border-accent-light h-fit`}>
      <h3 className={`countdown-widget-title ${desktopOnly} text-xl sm:text-2xl font-bold mb-4 text-gray-800`}>
        {title}
      </h3>

      <div className={`${desktopOnly} mb-4`}>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-gray-700">
            {hasHottest200Started ? 'Overall Progress' : 'Hottest 100 Progress'}
          </span>
          <span className="text-gray-600">
            {hasHottest200Started ? `${totalResults}/200 songs` : `${countdownResults.length}/100 songs`}
          </span>
        </div>
        <div className="progress-bar bg-gray-100 rounded-full h-3">
          <div className="progress-bar-marker h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {recentResults.length > 0 && (
        <div className="latest-entries">
          <div className={`latest-entries-title ${desktopOnly} text-xs sm:text-sm font-semibold text-gray-700 mb-2`}>
            {hasHottest200Started ? 'Latest Entries (Hottest 200)' : 'Latest Entries'}
          </div>
          <div className="latest-entries-list max-h-80 overflow-y-auto space-y-1.5 sm:space-y-2 pr-2">
            {recentResults.map((result) => {
              const song = songs.find(s => s.id === result.songId);
              if (!song) return null;

              return (
                <div
                  key={result.songId}
                  className={`latest-entry-item flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg ${isNew(result) ? 'song-arrival' : ''}`}
                  style={{ '--current-song': result.position } as React.CSSProperties}
                >
                  {song.thumbnail && (
                    <img
                      src={song.thumbnail}
                      alt=""
                      className="song-thumbnail w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="song-info flex-1 min-w-0">
                    <div className="song-title font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                    <div className="song-artist-row text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                      <span className="song-artist truncate">{song.artist}</span>
                      {song.isAustralian && (
                        <span className="australian-badge bg-accent-dark text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                          AUS
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="song-position font-bold text-accent text-sm sm:text-lg flex-shrink-0">
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
