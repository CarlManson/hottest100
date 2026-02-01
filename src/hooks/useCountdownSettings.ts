import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const COUNTDOWN_DATE_KEY = 'hottest100_countdown_date';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
}

export interface CountdownSettings {
  countdownDate: Date | null;
  setCountdownDate: (date: Date | null) => void;
  isEnabled: boolean;
}

// Subscribers for external store
let listeners: Array<() => void> = [];

const subscribe = (listener: () => void) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Snapshot function for useSyncExternalStore
const getSnapshot = (): string | null => {
  return localStorage.getItem(COUNTDOWN_DATE_KEY);
};

/**
 * Hook to manage countdown date settings stored in localStorage
 * Uses useSyncExternalStore for reliable cross-component sync
 */
export const useCountdownSettings = (): CountdownSettings => {
  // Subscribe to localStorage changes
  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const countdownDate = storedValue ? (() => {
    const date = new Date(storedValue);
    return isNaN(date.getTime()) ? null : date;
  })() : null;

  const setCountdownDate = useCallback((date: Date | null) => {
    if (date) {
      localStorage.setItem(COUNTDOWN_DATE_KEY, date.toISOString());
    } else {
      localStorage.removeItem(COUNTDOWN_DATE_KEY);
    }
    // Notify all subscribers that the value changed
    notifyListeners();
  }, []);

  return {
    countdownDate,
    setCountdownDate,
    isEnabled: countdownDate !== null,
  };
};

/**
 * Hook to calculate countdown time remaining
 * Uses the stored countdown date from localStorage
 */
export const useCountdown = (): CountdownTime & { isEnabled: boolean } => {
  const { countdownDate, isEnabled } = useCountdownSettings();

  const calculateTimeLeft = useCallback((): CountdownTime => {
    if (!countdownDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true };
    }

    const now = new Date();
    const diff = countdownDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isStarted: false,
    };
  }, [countdownDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    // Recalculate when countdown date changes
    setTimeLeft(calculateTimeLeft());

    if (!countdownDate) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isStarted) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownDate, calculateTimeLeft]);

  return {
    ...timeLeft,
    isEnabled,
  };
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
