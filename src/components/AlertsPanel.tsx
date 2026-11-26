import React, { useEffect } from 'react';
import type { FamilyMember } from '../types';
import type { useResultNotifications } from '../utils/useResultNotifications';
import { ALERT_EVERY } from '../utils/useResultNotifications';
import { isInstalledApp, isIos } from '../utils/installPrompt';
import { Icon } from './icons/Icon';

type Notifications = ReturnType<typeof useResultNotifications>;

interface BellProps {
  notifications: Notifications;
  onClick: () => void;
  className?: string;
}

/** Header button: a bell when alerts are on, a crossed-out bell when they're off */
export const AlertsBellButton: React.FC<BellProps> = ({ notifications, onClick, className }) => {
  const on = notifications.enabled;
  return (
    <button
      onClick={onClick}
      className={`alerts-bell p-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-white ${className ?? ''}`}
      aria-label={on ? 'Song alerts are on' : 'Song alerts are off'}
      aria-haspopup="dialog"
    >
      <Icon name={on ? 'bell' : 'bell-off'} size={24} />
    </button>
  );
};

interface PanelProps {
  notifications: Notifications;
  members: FamilyMember[];
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet for turning song alerts on or off on this device */
export const AlertsPanel: React.FC<PanelProps> = ({ notifications, members, open, onClose }) => {
  const { supported, enabled, blocked, toggle, member, setMemberId } = notifications;
  const voters = members
    .filter(m => m.votes.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  // iPhone only allows alerts from the Home Screen app, not a Safari tab
  const needsHomeScreen = !supported && isIos() && !isInstalledApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`alerts-panel-wrap fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`alerts-panel-backdrop absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Song alerts"
        className={`alerts-panel absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-surface text-white shadow-2xl overflow-y-auto transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="alerts-panel-grabber mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/30" />
        <div className="max-w-lg mx-auto p-6 pt-4 space-y-6">
          <div className="flex items-center gap-3">
            <Icon name={enabled ? 'bell' : 'bell-off'} size={28} />
            <h2 className="text-xl font-bold flex-1">Song alerts</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-white/10 transition flex items-center justify-center"
              aria-label="Close"
              tabIndex={open ? 0 : -1}
            >
              <Icon name="close" />
            </button>
          </div>

          <p className="alerts-panel-device bg-white/10 rounded-xl p-4 text-sm leading-relaxed">
            <strong>These alerts are for this device only.</strong> Turning them on here doesn’t turn them on
            anywhere else, and nobody else gets them. Using another phone or tablet too? Turn them on there as well.
          </p>

          {supported && !blocked && (
            <button
              onClick={toggle}
              role="switch"
              aria-checked={enabled}
              tabIndex={open ? 0 : -1}
              className="alerts-panel-switch w-full flex items-center justify-between gap-4 rounded-xl bg-white/5 hover:bg-white/10 transition p-4 text-left"
            >
              <span className="font-semibold">{enabled ? 'Alerts are on' : 'Alerts are off'}</span>
              <span className={`relative inline-block w-12 h-7 rounded-full transition ${enabled ? 'bg-primary-500' : 'bg-white/25'}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
              </span>
            </button>
          )}

          {needsHomeScreen && (
            <p className="alerts-panel-note text-sm leading-relaxed">
              On iPhone, alerts only work from the Home Screen app. Tap Share, then <strong>Add to Home Screen</strong>,
              open Fairest 100 from there, and turn alerts on.
            </p>
          )}
          {!supported && !needsHomeScreen && (
            <p className="alerts-panel-note text-sm leading-relaxed">
              This browser can’t show alerts. Try Chrome, or add the site to your home screen.
            </p>
          )}
          {blocked && (
            <p className="alerts-panel-note text-sm leading-relaxed">
              Alerts are blocked for this site. Allow notifications for it in your browser or phone settings,
              then come back here.
            </p>
          )}

          {voters.length > 0 && (
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Which mate are you?</span>
              <select
                value={member?.id ?? ''}
                onChange={(e) => setMemberId(e.target.value || null)}
                tabIndex={open ? 0 : -1}
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="" className="text-gray-900">Pick your name</option>
                {voters.map(m => (
                  <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>
                ))}
              </select>
              <span className="block text-xs text-white/70">So we know which picks are yours. Only saved on this device.</span>
            </label>
          )}

          <div className="space-y-2 text-sm">
            <p className="font-semibold">You’ll get a ping when:</p>
            <ul className="list-disc pl-5 space-y-1 text-white/90">
              <li>the countdown starts</li>
              <li>every {ALERT_EVERY} songs, with the latest ones</li>
              <li>{member ? `one of ${member.name}’s picks comes in` : 'one of your picks comes in (pick your name above)'}</li>
            </ul>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">
            Keep Fairest 100 open in the background. If you close it completely, the alerts stop.
          </p>
        </div>
      </div>
    </div>
  );
};
