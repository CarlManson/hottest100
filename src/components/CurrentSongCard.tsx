import React from 'react';
import type { Song } from '../types';
import { getPositionAdjective } from '../data/positionAdjectives';
import { COUNTDOWN_YEAR } from '../config/brand';
import { Icon } from './icons/Icon';

export interface CurrentSongCardProps {
  /** The song to display */
  song: Song;
  /** The countdown position (1-200) */
  position: number;
  /** Whether this is the #1 song (shows crown badge) */
  isNumberOne?: boolean;
  /** Label text displayed above the title */
  label?: string;
  /** Color theme variant */
  variant?: 'home' | 'tv';
  /** Max width size */
  size?: 'md' | 'lg' | '2xl';
  /** Additional wrapper classes */
  className?: string;
  /** Optional ID for the wrapper */
  id?: string;
  /** Optional additional class for the card container (e.g., for CSS hooks) */
  cardClassName?: string;
}

/**
 * CurrentSongCard - Displays the current/featured song with album artwork and rank
 *
 * Used on both the Homepage and TV Mode to show the current highest song
 * or the #1 song when revealed.
 */
export const CurrentSongCard: React.FC<CurrentSongCardProps> = ({
  song,
  position,
  isNumberOne = false,
  label,
  variant = 'home',
  size = 'md',
  className = '',
  id = 'song',
  cardClassName = '',
}) => {
  // Determine fallback gradient based on variant
  const fallbackGradient = isNumberOne
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : variant === 'tv'
      ? 'linear-gradient(135deg, var(--accent-col-dark, var(--brand-surface)) 0%, var(--accent-col-base, var(--brand-primary)) 100%)'
      : 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)';

  // Size classes
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-md xl:max-w-lg lg:max-w-lg',
    '2xl': 'max-w-md xl:max-w-2xl',
  };

  // Default label if not provided - uses position-based adjective
  const displayLabel = label ?? (isNumberOne ? `#1 Song of ${COUNTDOWN_YEAR}` : getPositionAdjective(position));

  return (
    <div id={id} className={`flex justify-center ${className}`}>
      <div
        className={`relative w-full ${sizeClasses[size]} aspect-square rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-3xl song-card-background ${cardClassName}`}
        style={{
          backgroundImage: song.thumbnail
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${song.thumbnail})`
            : fallbackGradient,
        }}
      >
        {/* Crown Badge - Only for #1 song on homepage variant */}
        {isNumberOne && variant === 'home' && (
          <div className="absolute top-4 left-4 text-5xl sm:text-6xl drop-shadow-xl">
            <Icon name="crown" size="1.1em" />
          </div>
        )}

        {/* Position Badge */}
        <div className={`song-card-number absolute top-4 ${isNumberOne && variant === 'home' ? 'right-4' : 'left-4'} text-white font-black text-4xl sm:text-5xl w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white`}>
          {isNumberOne && variant === 'tv' ? <Icon name="crown" size="0.9em" /> : position}
        </div>

        {/* Song Info - Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8">
          <div className="song-details">
            <div className={`rank-label`}>
              {displayLabel}
            </div>
            <h3 className="song-name mb-2">
              {song.title}
            </h3>
            <p className="artist-name flex items-center gap-2">
              {song.artist}
              {song.isAustralian && (
                <span className="aus-badge">AUS</span>
              )}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
