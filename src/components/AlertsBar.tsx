import React, { useState } from 'react';
import type { useResultNotifications } from '../utils/useResultNotifications';
import { Icon } from './icons/Icon';

const DISMISS_KEY = 'song_alerts_bar_dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

interface AlertsBarProps {
  notifications: ReturnType<typeof useResultNotifications>;
}

/** Dismissible prompt to turn on song alerts; the footer link handles it afterwards */
export const AlertsBar: React.FC<AlertsBarProps> = ({ notifications }) => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [justEnabled, setJustEnabled] = useState(false);

  const { supported, enabled, blocked, toggle } = notifications;
  const visible = supported && !blocked && ((!enabled && !dismissed) || justEnabled);
  if (!visible) return null;

  const dismiss = () => {
    setDismissed(true);
    setJustEnabled(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Storage unavailable: stays dismissed for this visit
    }
  };

  const turnOn = async () => {
    await toggle();
    setJustEnabled(true);
    setTimeout(() => setJustEnabled(false), 3000);
  };

  return (
    <div role="region" aria-label="Song alerts" className="alerts-bar bg-surface text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-sm">
        <Icon name="bell" />
        <p className="flex-1 min-w-0">
          {enabled
            ? 'Alerts on — we’ll ping you every 5 songs.'
            : 'Get a ping every 5 songs.'}
        </p>
        {!enabled && (
          <button
            onClick={turnOn}
            className="alerts-bar-action shrink-0 px-3 py-1 rounded-full bg-primary-500 hover:bg-primary-600 font-semibold text-xs sm:text-sm transition"
          >
            Turn on
          </button>
        )}
        <button
          onClick={dismiss}
          className="alerts-bar-dismiss shrink-0 w-7 h-7 rounded-full hover:bg-white/10 transition"
          aria-label="Dismiss"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
};
