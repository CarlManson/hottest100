import { useState, useEffect, useCallback } from 'react';

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

// Helper to read countdown date from localStorage
const getStoredCountdownDate = (): Date | null => {
  const stored = localStorage.getItem(COUNTDOWN_DATE_KEY);
  if (stored) {
    const date = new Date(stored);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
};

/**
 * Hook to manage countdown date settings stored in localStorage
 * Syncs across components via custom events
 */
export const useCountdownSettings = (): CountdownSettings => {
  const [countdownDate, setCountdownDateState] = useState<Date | null>(getStoredCountdownDate);

  // Listen for changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      setCountdownDateState(getStoredCountdownDate());
    };

    // Listen for custom event (same-tab updates)
    window.addEventListener('countdown-date-changed', handleStorageChange);
    // Listen for storage event (cross-tab updates)
    window.addEventListener('storage', (e) => {
      if (e.key === COUNTDOWN_DATE_KEY) {
        handleStorageChange();
      }
    });

    return () => {
      window.removeEventListener('countdown-date-changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setCountdownDate = useCallback((date: Date | null) => {
    if (date) {
      localStorage.setItem(COUNTDOWN_DATE_KEY, date.toISOString());
    } else {
      localStorage.removeItem(COUNTDOWN_DATE_KEY);
    }
    setCountdownDateState(date);
    // Dispatch custom event to notify other components in the same tab
    window.dispatchEvent(new Event('countdown-date-changed'));
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
