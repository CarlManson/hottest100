import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchTriplejCountdown } from '../utils/triplejApi';
import { planAutoFill, triplejYear, type AutoFillPlan, type SongMatch } from '../utils/triplejMatch';
import { Icon } from './icons/Icon';

type List = 'hottest100' | 'hottest200';

const POLL_MS = 60_000;
const STORAGE_KEY = 'fairest100_triplej_autofill';

/** `?triplejYear=25` checks an older countdown, for testing against last year's results */
const yearFromUrl = (): string => {
  const param = new URLSearchParams(window.location.search).get('triplejYear');
  return param && /^\d{2}$/.test(param) ? param : triplejYear();
};

const readStoredOn = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
};

interface CheckState {
  checkedAt: Date;
  source: string | null;
  found: number;
  added: number;
  plan: AutoFillPlan;
  dryRun: boolean;
}

/**
 * Auto-fill on the Countdown page: reads triple j's live list every minute and adds the
 * songs it can match. Songs it can't match, close calls and clashes are listed for a person.
 */
export const TriplejAutoFill: React.FC<{ activeTab: List; disabled?: boolean }> = ({ activeTab, disabled }) => {
  const { songs, countdownResults, hottest200Results, addCountdownResult, addHottest200Result } = useApp();
  const [autoOn, setAutoOn] = useState(readStoredOn);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState<CheckState | null>(null);
  const [year] = useState(yearFromUrl);

  // Latest data for the poller, without restarting the timer on every change
  const latest = useRef({ songs, countdownResults, hottest200Results, activeTab });
  latest.current = { songs, countdownResults, hottest200Results, activeTab };
  const busy = useRef(false);

  const runCheck = useCallback(async (write: boolean) => {
    if (busy.current) return;
    busy.current = true;
    setChecking(true);
    setError(null);
    try {
      const { songs, countdownResults, hottest200Results, activeTab } = latest.current;
      const is100 = activeTab === 'hottest100';
      const data = await fetchTriplejCountdown(is100 ? '1-100' : '101-200', year);
      const results = is100 ? countdownResults : hottest200Results;
      const other = is100 ? hottest200Results : countdownResults;
      const plan = planAutoFill(data.songs, songs, results, other);

      let added = 0;
      if (write) {
        const add = is100 ? addCountdownResult : addHottest200Result;
        for (const result of plan.add) {
          try {
            await add(result);
            added++;
          } catch (err) {
            // Another browser may have added it first (positions and songs are unique per countdown)
            console.warn('Auto-fill skipped a song:', err);
          }
        }
      }
      setCheck({ checkedAt: new Date(), source: data.source, found: data.songs.length, added, plan, dryRun: !write });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'triple j check failed');
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }, [year, addCountdownResult, addHottest200Result]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, autoOn ? 'on' : 'off');
    } catch {
      // Private mode: the switch just won't be remembered
    }
    if (!autoOn) return;
    runCheck(true);
    const timer = window.setInterval(() => runCheck(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [autoOn, runCheck]);

  // A different countdown tab means a different triple j list
  useEffect(() => setCheck(null), [activeTab]);

  const songName = (id: string) => {
    const s = songs.find((x) => x.id === id);
    return s ? `${s.artist} – ${s.title}` : 'another song';
  };
  const listName = activeTab === 'hottest100' ? 'Hottest 100' : 'Hottest 200';

  const renderMatch = (m: SongMatch) => (
    <>
      <span className="font-bold">#{m.entry.position}</span> {m.entry.artist} – {m.entry.title}
      {m.song && <span className="text-gray-500"> (closest: {m.song.artist} – {m.song.title})</span>}
    </>
  );

  return (
    <div className="triplej-autofill mb-4 sm:mb-6 p-3 sm:p-4 border border-blue-200 bg-blue-50 rounded-lg text-xs sm:text-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="triplej-autofill-toggle flex items-center gap-2 font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={autoOn}
            onChange={(e) => setAutoOn(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4"
          />
          Auto-fill the {listName} from triple j
        </label>
        <button
          onClick={() => runCheck(false)}
          disabled={checking || disabled}
          className="triplej-autofill-check px-2 sm:px-3 py-1 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 disabled:opacity-50"
        >
          <Icon name="refresh" /> {checking ? 'Checking…' : 'Check now (no changes)'}
        </button>
        {year !== triplejYear() && <span className="text-amber-700">Testing against the {2000 + Number(year)} countdown</span>}
      </div>
      <p className="mt-1 text-gray-600">
        {autoOn
          ? 'Checking triple j every minute while this page is open and adding songs it can match. Keep it on in one browser only.'
          : 'Turn on when the countdown starts. Songs it can\'t match are listed here for you to add by hand.'}
      </p>

      {error && <p className="mt-2 text-red-700"><Icon name="warning" /> {error}</p>}

      {check && (
        <div className="triplej-autofill-status mt-2 space-y-1">
          <p>
            {check.checkedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}:{' '}
            {check.found === 0
              ? 'triple j has no songs up for this countdown yet.'
              : `triple j has ${check.found} song${check.found === 1 ? '' : 's'}. ${check.plan.alreadyIn} already in, ${
                  check.dryRun ? `${check.plan.add.length} ready to add` : `${check.added} added`
                }.`}
          </p>
          {check.dryRun && check.plan.add.length > 0 && (
            <ul className="triplej-autofill-ready list-disc pl-5 text-gray-700">
              {check.plan.add.slice(0, 10).map((r) => (
                <li key={r.position}>#{r.position} {songName(r.songId)}</li>
              ))}
              {check.plan.add.length > 10 && <li>…and {check.plan.add.length - 10} more</li>}
            </ul>
          )}
          {check.plan.needsYou.length > 0 && (
            <div className="triplej-autofill-needs-you text-amber-900">
              <p className="font-semibold"><Icon name="warning" /> Add these by hand ({check.plan.needsYou.length}):</p>
              <ul className="list-disc pl-5">
                {check.plan.needsYou.map((m) => (
                  <li key={m.entry.position}>{renderMatch(m)}</li>
                ))}
              </ul>
            </div>
          )}
          {check.plan.conflicts.length > 0 && (
            <div className="triplej-autofill-conflicts text-red-800">
              <p className="font-semibold"><Icon name="warning" /> Different from triple j ({check.plan.conflicts.length}):</p>
              <ul className="list-disc pl-5">
                {check.plan.conflicts.map(({ match, existingSongId }) => (
                  <li key={match.entry.position}>
                    #{match.entry.position}: you have {songName(existingSongId)}, triple j has {match.entry.artist} – {match.entry.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
