import { useCallback, useEffect, useRef, useState } from 'react';
import type { CountdownResult, FamilyMember, Song } from '../types';
import { WINNER_PICK_BONUS } from './scoring';
import { getWinnerPickers } from './winnerPick';

const STORAGE_KEY = 'song_alerts_enabled';
// Larger jumps are initial loads or bulk edits, not live reveals
const MAX_NEW_PER_UPDATE = 3;
/** One alert per this many songs revealed */
export const ALERT_EVERY = 5;

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const writeStored = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage unavailable (private mode etc.) - preference just won't persist
  }
};

/**
 * Returns the latest batch of songs to alert on when a list's size crosses a
 * multiple of ALERT_EVERY, else null. The countdown runs down, so the latest
 * songs are the lowest positions; they come back newest first.
 */
export function alertBatch(previousCount: number, results: CountdownResult[]): CountdownResult[] | null {
  const added = results.length - previousCount;
  if (added <= 0 || added > MAX_NEW_PER_UPDATE) return null;
  if (Math.floor(results.length / ALERT_EVERY) === Math.floor(previousCount / ALERT_EVERY)) return null;
  return [...results].sort((a, b) => a.position - b.position).slice(0, ALERT_EVERY);
}

/** Extra alert line once #1 is in, saying who called the winner (null if nobody had a pick) */
export function winnerPickLine(batch: CountdownResult[], members: FamilyMember[], countdownResults: CountdownResult[]): string | null {
  if (!batch.some(r => r.position === 1) || !members.some(m => m.winnerSongId)) return null;
  const pickers = getWinnerPickers(members, countdownResults);
  return pickers.length > 0
    ? `Called the winner: ${pickers.join(', ')} (+${WINNER_PICK_BONUS})`
    : 'Nobody called the winner';
}

export function useResultNotifications(
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  members: FamilyMember[] = []
) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [enabled, setEnabled] = useState(
    () => supported && Notification.permission === 'granted' && readStored()
  );
  const [blocked, setBlocked] = useState(() => supported && Notification.permission === 'denied');
  const counts = useRef<number[] | null>(null);

  useEffect(() => {
    const lists = [countdownResults, hottest200Results];
    const previous = counts.current;

    if (previous === null) {
      if (lists.some(list => list.length > 0)) counts.current = lists.map(list => list.length);
      return;
    }
    counts.current = lists.map(list => list.length);

    if (!enabled || !document.hidden) return;

    lists.forEach((list, i) => {
      const batch = alertBatch(previous[i], list);
      if (!batch) return;
      const lines = batch.flatMap(result => {
        const song = songs.find(s => s.id === result.songId);
        return song ? [`#${result.position} ${song.title} - ${song.artist}`] : [];
      });
      if (lines.length === 0) return;
      const bonusLine = i === 0 ? winnerPickLine(batch, members, countdownResults) : null;
      if (bonusLine) lines.push(bonusLine);
      const newest = batch[0].position;
      const oldest = batch[batch.length - 1].position;
      new Notification(`Songs #${oldest} to #${newest} are in`, {
        body: lines.join('\n'),
        icon: songs.find(s => s.id === batch[0].songId)?.thumbnail,
        tag: `results-${newest}`,
      });
    });
  }, [countdownResults, hottest200Results, songs, members, enabled]);

  const toggle = useCallback(async () => {
    if (!supported) return;
    if (enabled) {
      setEnabled(false);
      writeStored(false);
      return;
    }
    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
    if (permission === 'granted') {
      setEnabled(true);
      writeStored(true);
    } else if (permission === 'denied') {
      setBlocked(true);
    }
  }, [supported, enabled]);

  return { supported, enabled, blocked, toggle };
}
