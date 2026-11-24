import { useCallback, useEffect, useRef, useState } from 'react';
import type { CountdownResult, Song } from '../types';

const STORAGE_KEY = 'song_alerts_enabled';
// Larger jumps are initial loads or bulk edits, not live reveals
const MAX_ALERTS_PER_UPDATE = 3;

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

export function useResultNotifications(
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [enabled, setEnabled] = useState(
    () => supported && Notification.permission === 'granted' && readStored()
  );
  const [blocked, setBlocked] = useState(() => supported && Notification.permission === 'denied');
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const all = [...countdownResults, ...hottest200Results];
    const keys = all.map(r => `${r.position}:${r.songId}`);

    if (seen.current === null) {
      if (all.length > 0) seen.current = new Set(keys);
      return;
    }

    const fresh = all.filter(r => !seen.current!.has(`${r.position}:${r.songId}`));
    seen.current = new Set(keys);

    if (!enabled || !document.hidden || fresh.length === 0 || fresh.length > MAX_ALERTS_PER_UPDATE) return;

    for (const result of fresh) {
      const song = songs.find(s => s.id === result.songId);
      if (!song) continue;
      new Notification(`#${result.position}: ${song.title}`, {
        body: song.artist,
        icon: song.thumbnail,
        tag: `result-${result.position}`,
      });
    }
  }, [countdownResults, hottest200Results, songs, enabled]);

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
