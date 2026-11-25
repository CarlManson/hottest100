import React, { useState } from 'react';
import type { FamilyMember } from '../types';
import type { useResultNotifications } from '../utils/useResultNotifications';
import { ALERT_EVERY } from '../utils/useResultNotifications';
import { Icon } from './icons/Icon';

const DISMISS_KEY = 'song_alerts_bar_dismissed';

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

export const ALERTS_SUMMARY =
  `We’ll ping you when the countdown starts, every ${ALERT_EVERY} songs, and whenever one of your picks makes it in.`;

interface MemberSelectProps {
  notifications: ReturnType<typeof useResultNotifications>;
  members: FamilyMember[];
  className?: string;
}

/** Choose whose picks count as "yours" for pick alerts */
export const AlertsMemberSelect: React.FC<MemberSelectProps> = ({ notifications, members, className }) => {
  const options = members
    .filter(m => m.votes.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (options.length === 0) return null;
  return (
    <select
      value={notifications.member?.id ?? ''}
      onChange={(e) => notifications.setMemberId(e.target.value || null)}
      className={className}
      aria-label="Whose picks are yours?"
    >
      <option value="" className="text-gray-900">Whose picks are yours?</option>
      {options.map(m => (
        <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>
      ))}
    </select>
  );
};

interface AlertsBarProps {
  notifications: ReturnType<typeof useResultNotifications>;
  members: FamilyMember[];
}

/** Dismissible prompt to turn on song alerts; the footer handles it afterwards */
export const AlertsBar: React.FC<AlertsBarProps> = ({ notifications, members }) => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [confirming, setConfirming] = useState(false);

  const { supported, enabled, blocked, toggle, member } = notifications;
  const hasVoters = members.some(m => m.votes.length > 0);
  const needsMember = enabled && !member && hasVoters;
  const visible = supported && !blocked && !dismissed && (!enabled || needsMember || confirming);
  if (!visible) return null;

  const dismiss = () => {
    setDismissed(true);
    setConfirming(false);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Storage unavailable: stays dismissed for this visit
    }
  };

  const confirm = () => {
    setConfirming(true);
    setTimeout(() => setConfirming(false), 4000);
  };

  const turnOn = async () => {
    await toggle();
    if (!hasVoters) confirm();
  };

  let message: string;
  if (!enabled) message = `Song alerts: ${ALERTS_SUMMARY.charAt(0).toLowerCase()}${ALERTS_SUMMARY.slice(1)}`;
  else if (needsMember) message = 'Alerts on. Pick your name so we can ping you when your songs come in.';
  else if (member) message = `Alerts on. We’ll ping you when the countdown starts, every ${ALERT_EVERY} songs, and when ${member.name}’s picks come in.`;
  else message = `Alerts on. We’ll ping you when the countdown starts and every ${ALERT_EVERY} songs.`;

  return (
    <div role="region" aria-label="Song alerts" className="alerts-bar relative z-10 bg-surface text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <Icon name="bell" />
        <p className="alerts-bar-message flex-1 min-w-[12rem]">{message}</p>
        {!enabled && (
          <button
            onClick={turnOn}
            className="alerts-bar-action shrink-0 px-3 py-1 rounded-full bg-primary-500 hover:bg-primary-600 font-semibold text-xs sm:text-sm transition"
          >
            Turn on
          </button>
        )}
        {needsMember && (
          <AlertsMemberSelect
            notifications={{ ...notifications, setMemberId: (id) => { notifications.setMemberId(id); if (id) confirm(); } }}
            members={members}
            className="alerts-bar-member shrink-0 bg-white/10 rounded-full px-3 py-1 text-xs sm:text-sm"
          />
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
