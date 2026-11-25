import { useCallback, useEffect, useRef, useState } from 'react';
import type { CountdownResult, FamilyMember, Song } from '../types';
import { WINNER_PICK_BONUS } from './scoring';
import { getWinnerPickers, joinNames } from './winnerPick';
import { brand } from '../config/brand';

const STORAGE_KEY = 'song_alerts_enabled';
const MEMBER_KEY = 'song_alerts_member_id';
// Larger jumps are initial loads or bulk edits, not live reveals
const MAX_NEW_PER_UPDATE = 3;
/** One alert per this many songs revealed */
export const ALERT_EVERY = 10;
// Browsers clamp long timers; anything further out is re-armed on a later render
const MAX_TIMER_MS = 2 ** 31 - 1;

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode etc.) - preference just won't persist
  }
};

/** Songs that arrived in this update, or none when it looks like a load or bulk edit */
export function newResults(previousCount: number, results: CountdownResult[], previousIds: Set<string>): CountdownResult[] {
  const added = results.length - previousCount;
  if (added <= 0 || added > MAX_NEW_PER_UPDATE) return [];
  return results.filter(result => !previousIds.has(result.songId));
}

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

/** New results that are among the member's own picks, with the rank they gave each */
export function picksInResults(member: FamilyMember | undefined, added: CountdownResult[]) {
  if (!member) return [];
  return added.flatMap(result => {
    const vote = member.votes.find(v => v.songId === result.songId);
    return vote ? [{ result, rank: vote.rank }] : [];
  });
}

/** Extra alert line once #1 is in, saying who called the winner (null if nobody had a pick) */
export function winnerPickLine(batch: CountdownResult[], members: FamilyMember[], countdownResults: CountdownResult[]): string | null {
  if (!batch.some(r => r.position === 1) || !members.some(m => m.winnerSongId)) return null;
  const pickers = getWinnerPickers(members, countdownResults);
  return pickers.length > 0
    ? `Called the winner: ${joinNames(pickers)} (+${WINNER_PICK_BONUS})`
    : 'Nobody called the winner';
}

/**
 * Show an alert through the service worker when there is one. Android Chrome and iPhone home screen
 * apps only allow it that way; desktop browsers without a service worker use the plain API.
 */
async function showNotification(title: string, options: NotificationOptions) {
  const withIcon = { icon: options.icon ?? brand.images.appIcon, ...options };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, withIcon);
      return;
    }
  } catch {
    // Fall through to the plain API
  }
  try {
    new Notification(title, withIcon);
  } catch {
    // Not allowed outside a service worker on this browser
  }
}

export function useResultNotifications(
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[],
  familyMembers: FamilyMember[],
  countdownDate: Date | null,
  /** False until the first data load finishes, so loaded songs aren't mistaken for new ones */
  ready: boolean
) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [enabled, setEnabled] = useState(
    () => supported && Notification.permission === 'granted' && readStored(STORAGE_KEY) === 'true'
  );
  const [blocked, setBlocked] = useState(() => supported && Notification.permission === 'denied');
  const [memberId, setMemberIdState] = useState<string | null>(() => readStored(MEMBER_KEY));
  const snapshot = useRef<{ counts: number[]; ids: Set<string>[] } | null>(null);
  const startAlerted = useRef(false);

  const member = familyMembers.find(m => m.id === memberId);

  const notify = useCallback((title: string, options: NotificationOptions) => {
    if (!enabled || !document.hidden) return;
    void showNotification(title, options);
  }, [enabled]);

  const notifyStart = useCallback(() => {
    if (startAlerted.current) return;
    startAlerted.current = true;
    notify('The countdown has started', {
      body: 'Songs are coming in. Come and watch the leaderboard move.',
      tag: 'countdown-start',
    });
  }, [notify]);

  // Countdown start: fire when the scheduled start time passes while the page is open
  useEffect(() => {
    if (!countdownDate) return;
    const wait = countdownDate.getTime() - Date.now();
    if (wait <= 0 || wait > MAX_TIMER_MS) return;
    const timer = setTimeout(notifyStart, wait);
    return () => clearTimeout(timer);
  }, [countdownDate, notifyStart]);

  useEffect(() => {
    const lists = [countdownResults, hottest200Results];
    const previous = snapshot.current;
    const current = {
      counts: lists.map(list => list.length),
      ids: lists.map(list => new Set(list.map(r => r.songId))),
    };

    if (previous === null) {
      if (ready) snapshot.current = current;
      return;
    }
    snapshot.current = current;

    const songLine = (result: CountdownResult) => {
      const song = songs.find(s => s.id === result.songId);
      return song ? `#${result.position} ${song.title} - ${song.artist}` : null;
    };

    // No start time set (or the page opened after it): the first song in counts as the start
    if (previous.counts.every(count => count === 0) && current.counts.some(count => count > 0)) {
      notifyStart();
    }

    lists.forEach((list, i) => {
      const added = newResults(previous.counts[i], list, previous.ids[i]);

      picksInResults(member, added).forEach(({ result, rank }) => {
        const line = songLine(result);
        if (!line) return;
        notify(`Your pick is in at #${result.position}!`, {
          body: `${line}\nYou had it at #${rank}.`,
          icon: songs.find(s => s.id === result.songId)?.thumbnail,
          tag: `pick-${result.songId}`,
        });
      });

      const batch = alertBatch(previous.counts[i], list);
      if (!batch) return;
      const lines = batch.map(songLine).filter((line): line is string => line !== null);
      if (lines.length === 0) return;
      const bonusLine = i === 0 ? winnerPickLine(batch, familyMembers, countdownResults) : null;
      if (bonusLine) lines.push(bonusLine);
      const newest = batch[0].position;
      const oldest = batch[batch.length - 1].position;
      notify(`Songs #${oldest} to #${newest} are in`, {
        body: lines.join('\n'),
        icon: songs.find(s => s.id === batch[0].songId)?.thumbnail,
        tag: `results-${newest}`,
      });
    });
  }, [countdownResults, hottest200Results, songs, familyMembers, member, notify, notifyStart, ready]);

  const setMemberId = useCallback((id: string | null) => {
    setMemberIdState(id);
    writeStored(MEMBER_KEY, id);
  }, []);

  const toggle = useCallback(async () => {
    if (!supported) return;
    if (enabled) {
      setEnabled(false);
      writeStored(STORAGE_KEY, 'false');
      return;
    }
    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
    if (permission === 'granted') {
      setEnabled(true);
      writeStored(STORAGE_KEY, 'true');
    } else if (permission === 'denied') {
      setBlocked(true);
    }
  }, [supported, enabled]);

  return { supported, enabled, blocked, toggle, member, setMemberId };
}
