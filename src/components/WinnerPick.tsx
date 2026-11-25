import React, { useMemo } from 'react';
import type { CountdownResult, FamilyMember, Song } from '../types';
import { WINNER_PICK_BONUS } from '../utils/scoring';
import { getPickPosition, getTippedSongs, getWinnerPickStatus } from '../utils/winnerPick';
import { Icon } from './icons/Icon';

interface BadgeProps {
  member: FamilyMember;
  songs: Song[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
  className?: string;
}

/** Small crown chip showing a member's winner pick and how it's going */
export const WinnerPickBadge: React.FC<BadgeProps> = ({ member, songs, countdownResults, hottest200Results, className = '' }) => {
  const status = getWinnerPickStatus(member.winnerSongId, countdownResults, hottest200Results);
  if (status === 'none') return null;
  const song = songs.find((s) => s.id === member.winnerSongId);
  if (!song) return null;
  const position = getPickPosition(song.id, countdownResults, hottest200Results);

  const tone =
    status === 'won' ? 'bg-green-100 text-green-800 border-green-400' :
    status === 'out' ? 'bg-gray-100 text-gray-400 border-gray-200' :
    'bg-yellow-50 text-gray-700 border-yellow-300';

  return (
    <span
      className={`winner-pick-badge winner-pick-${status} inline-flex items-center gap-1 max-w-full text-[10px] sm:text-xs border rounded-full px-1.5 sm:px-2 py-0.5 ${tone} ${className}`}
      title={`Winner pick: ${song.title} - ${song.artist}`}
    >
      <Icon name="crown" />
      <span className={`truncate ${status === 'out' ? 'line-through' : ''}`}>{song.title}</span>
      {status === 'won' && <strong className="flex-shrink-0">+{WINNER_PICK_BONUS}</strong>}
      {status === 'out' && position && <span className="flex-shrink-0 no-underline">#{position}</span>}
    </span>
  );
};

interface TippedProps {
  songs: Song[];
  familyMembers: FamilyMember[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
}

/** Which songs the group reckons will be #1, with knocked-out picks crossed off */
export const TippedToWin: React.FC<TippedProps> = ({ songs, familyMembers, countdownResults, hottest200Results }) => {
  const tipped = useMemo(
    () => getTippedSongs(familyMembers, songs, countdownResults, hottest200Results),
    [familyMembers, songs, countdownResults, hottest200Results]
  );
  if (tipped.length === 0) return null;

  const winnerIn = tipped.some((t) => t.status === 'won') || countdownResults.some((r) => r.position === 1);
  const alive = tipped.filter((t) => t.status === 'alive').length;

  return (
    <div className="tipped-to-win bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-yellow-300 mt-6">
      <h3 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800"><Icon name="crown" /> Tipped to Win</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">
        {winnerIn
          ? `The #1 is in. Called it? That's +${WINNER_PICK_BONUS} points.`
          : countdownResults.length > 0
          ? `${alive} winner pick${alive === 1 ? '' : 's'} still in the running for +${WINNER_PICK_BONUS} points`
          : `Everyone's pick for #1. Nail it for +${WINNER_PICK_BONUS} points.`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {tipped.map(({ song, names, status, position }) => (
          <div
            key={song.id}
            className={`tipped-song tipped-${status} flex items-center gap-3 p-2 sm:p-3 rounded-lg ${
              status === 'won' ? 'bg-green-50 border-2 border-green-500' :
              status === 'out' ? 'bg-gray-50 opacity-50' :
              'bg-yellow-50'
            }`}
          >
            {song.thumbnail && (
              <img src={song.thumbnail} alt="" loading="lazy" className={`w-10 h-10 rounded object-cover flex-shrink-0 ${status === 'out' ? 'grayscale' : ''}`} />
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-xs sm:text-sm truncate ${status === 'out' ? 'line-through' : ''}`}>{song.title}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 truncate" title={names.join(', ')}>
                {song.artist} · {names.join(', ')}
              </div>
            </div>
            <div className="text-right flex-shrink-0 text-xs sm:text-sm font-bold">
              {status === 'won' && <span className="text-green-700">#1 +{WINNER_PICK_BONUS}</span>}
              {status === 'out' && <span className="text-gray-500">{position ? `#${position}` : 'Out'}</span>}
              {status === 'alive' && <span className="text-gray-800">{names.length}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
