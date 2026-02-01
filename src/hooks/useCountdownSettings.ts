import { useState, useEffect, useCallback, useRef } from 'react';

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

// Read countdown date from localStorage
const readCountdownDate = (): Date | null => {
  try {
    const stored = localStorage.getItem(COUNTDOWN_DATE_KEY);
    if (!stored) return null;
    const date = new Date(stored);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Write countdown date to localStorage
const writeCountdownDate = (date: Date | null): void => {
  try {
    if (date) {
      localStorage.setItem(COUNTDOWN_DATE_KEY, date.toISOString());
    } else {
      localStorage.removeItem(COUNTDOWN_DATE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Hook to manage countdown date settings
 * Reads directly from localStorage to avoid sync issues
 */
export const useCountdownSettings = (): CountdownSettings => {
  // Read initial value from localStorage
  const [countdownDate, setCountdownDateState] = useState<Date | null>(() => readCountdownDate());

  // Keep a ref to track if we've mounted
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync with localStorage on mount and when storage changes
  useEffect(() => {
    const syncFromStorage = () => {
      if (!isMounted.current) return;
      const stored = readCountdownDate();
      setCountdownDateState(stored);
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', syncFromStorage);

    // Also sync on focus in case another tab changed it
    window.addEventListener('focus', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  const setCountdownDate = useCallback((date: Date | null) => {
    writeCountdownDate(date);
    setCountdownDateState(date);
  }, []);

  return {
    countdownDate,
    setCountdownDate,
    isEnabled: countdownDate !== null,
  };
};

/**
 * Hook to get countdown time values
 * Combines settings with timer logic
 */
export const useCountdown = (): CountdownTime & { isEnabled: boolean } => {
  // Read directly from localStorage for the most accurate value
  const getCountdownDate = useCallback(() => readCountdownDate(), []);

  const [state, setState] = useState<CountdownTime & { isEnabled: boolean }>(() => {
    const date = getCountdownDate();
    if (!date) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnabled: false };
    }
    const now = new Date();
    const diff = date.getTime() - now.getTime();
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
  });

  useEffect(() => {
    const updateCountdown = () => {
      const date = getCountdownDate();

      if (!date) {
        setState({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnabled: false });
        return;
      }

      const now = new Date();
      const diff = date.getTime() - now.getTime();

      if (diff <= 0) {
        setState({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnabled: true });
        return;
      }

      setState({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isStarted: false,
        isEnabled: true,
      });
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const timer = setInterval(updateCountdown, 1000);

    // Also update when storage changes or window gets focus
    window.addEventListener('storage', updateCountdown);
    window.addEventListener('focus', updateCountdown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', updateCountdown);
      window.removeEventListener('focus', updateCountdown);
    };
  }, [getCountdownDate]);

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
