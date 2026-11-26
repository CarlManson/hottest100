import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const COUNTDOWN_DATE_KEY = 'hottest100_countdown_date';
const COUNTDOWN_CHANGE_EVENT = 'hottest100_countdown_change';
const SETTINGS_TABLE = 'app_settings';
const SETTING_KEY = 'countdown_date';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
}

export interface CountdownSettings {
  countdownDate: Date | null;
  /** Resolves true when saved for everyone, false when only saved in this browser */
  setCountdownDate: (date: Date | null) => Promise<boolean>;
  isEnabled: boolean;
}

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

// localStorage is only a cache so the timer paints instantly; Supabase is the source of truth
const readCachedDate = (): Date | null => {
  try {
    return parseDate(localStorage.getItem(COUNTDOWN_DATE_KEY));
  } catch {
    return null;
  }
};

const writeCachedDate = (date: Date | null): void => {
  try {
    if (date) localStorage.setItem(COUNTDOWN_DATE_KEY, date.toISOString());
    else localStorage.removeItem(COUNTDOWN_DATE_KEY);
  } catch {
    // Storage unavailable - the shared value still applies for this session
  }
};

// Module-level store shared by every hook instance (also prevents a blink on remount)
let currentDate: Date | null = readCachedDate();
let remoteSyncStarted = false;

const setCurrentDate = (date: Date | null) => {
  currentDate = date;
  writeCachedDate(date);
  window.dispatchEvent(new CustomEvent(COUNTDOWN_CHANGE_EVENT));
};

const settingsTable = () => supabase.from(SETTINGS_TABLE as never) as ReturnType<typeof supabase.from>;

async function fetchRemoteDate() {
  const { data, error } = await settingsTable()
    .select('value')
    .eq('key', SETTING_KEY)
    .maybeSingle();
  // Table not created yet (or offline): keep whatever this browser has
  if (error) return;
  setCurrentDate(parseDate((data as { value?: unknown } | null)?.value));
}

function startRemoteSync() {
  if (remoteSyncStarted) return;
  remoteSyncStarted = true;
  fetchRemoteDate();
  supabase
    .channel('app-settings-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: SETTINGS_TABLE }, () => {
      fetchRemoteDate();
    })
    .subscribe();
}

async function saveCountdownDate(date: Date | null): Promise<boolean> {
  setCurrentDate(date);
  const { error } = await settingsTable().upsert(
    { key: SETTING_KEY, value: date ? date.toISOString() : null, updated_at: new Date().toISOString() } as never,
    { onConflict: 'key' }
  );
  if (error) console.error('Countdown date saved locally only:', error);
  return !error;
}

/** Subscribes a component to the shared countdown date */
const useSharedCountdownDate = () => {
  const [date, setDate] = useState<Date | null>(currentDate);

  useEffect(() => {
    startRemoteSync();
    const sync = () => setDate(currentDate);
    const refetch = () => { fetchRemoteDate(); };
    sync();
    window.addEventListener(COUNTDOWN_CHANGE_EVENT, sync);
    window.addEventListener('focus', refetch);
    return () => {
      window.removeEventListener(COUNTDOWN_CHANGE_EVENT, sync);
      window.removeEventListener('focus', refetch);
    };
  }, []);

  return date;
};

/** Hook to read and change the countdown start date (shared across all visitors via Supabase) */
export const useCountdownSettings = (): CountdownSettings => {
  const countdownDate = useSharedCountdownDate();
  const setCountdownDate = useCallback((date: Date | null) => saveCountdownDate(date), []);

  return {
    countdownDate,
    setCountdownDate,
    isEnabled: countdownDate !== null,
  };
};

const calculateState = (date: Date | null): CountdownTime & { isEnabled: boolean } => {
  if (!date) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnabled: false };
  }
  const diff = date.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnabled: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isStarted: false,
    isEnabled: true,
  };
};

/** Live countdown values (ticks every second) */
export const useCountdown = (): CountdownTime & { isEnabled: boolean } => {
  const date = useSharedCountdownDate();
  const [state, setState] = useState(() => calculateState(currentDate));

  useEffect(() => {
    const update = () => setState(calculateState(date));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [date]);

  return state;
};

/**
 * Helper to format a date for datetime-local input
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Helper to parse datetime-local input value
 */
export const parseDateFromInput = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

// setTimeout overflows past ~24.8 days, so long waits re-check hourly
const MAX_WAIT_MS = 60 * 60 * 1000;

/**
 * True once the shared countdown date has passed (or no date is set).
 * Re-renders only when that flips, unlike useCountdown which ticks every second.
 */
export const useCountdownDateReached = (): boolean => {
  const date = useSharedCountdownDate();
  const reached = (d: Date | null) => !d || d.getTime() <= Date.now();
  const [isReached, setIsReached] = useState(() => reached(date));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      if (reached(date)) {
        setIsReached(true);
        return;
      }
      setIsReached(false);
      timer = setTimeout(check, Math.min(date!.getTime() - Date.now() + 250, MAX_WAIT_MS));
    };
    check();
    return () => clearTimeout(timer);
  }, [date]);

  return isReached;
};
