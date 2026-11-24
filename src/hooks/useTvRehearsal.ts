import { useEffect, useMemo, useState } from 'react';
import type { CountdownResult, Song } from '../types';

const TOTAL_STEPS = 200;

const isRehearsalUrl = () => {
  try {
    return new URLSearchParams(window.location.search).has('rehearsal');
  } catch {
    return false;
  }
};

/**
 * TV rehearsal: simulates the broadcast order (Hottest 100 #100→#1, then Hottest 200 #200→#101)
 * using the real song list, so the escalating TV styling can be previewed without live data.
 * Enable with ?rehearsal in the URL (e.g. /?rehearsal#tv).
 */
export function useTvRehearsal(songs: Song[]) {
  const [active] = useState(isRehearsalUrl);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1500);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= TOTAL_STEPS) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [playing, speedMs]);

  const data = useMemo(() => {
    // Reuse real songs where possible so members' votes still score; clone only if the list is short
    const pool: Song[] = songs.length >= TOTAL_STEPS
      ? songs.slice(0, TOTAL_STEPS)
      : Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const base = songs[i % Math.max(songs.length, 1)];
          return base
            ? (i < songs.length ? base : { ...base, id: `${base.id}~rehearsal${i}` })
            : { id: `rehearsal${i}`, title: `Song ${i + 1}`, artist: 'Rehearsal Artist' };
        });

    // pool[0] finishes #1, pool[199] finishes #200
    const countdownResults: CountdownResult[] = [];
    const hottest200Results: CountdownResult[] = [];
    for (let s = 1; s <= Math.min(step, 100); s++) {
      const position = 101 - s;
      countdownResults.push({ songId: pool[position - 1].id, position });
    }
    for (let s = 101; s <= step; s++) {
      const position = 301 - s;
      hottest200Results.push({ songId: pool[position - 1].id, position });
    }
    return { songs: [...songs, ...pool.filter(p => p.id.includes('~rehearsal'))], countdownResults, hottest200Results };
  }, [songs, step]);

  return { active, step, setStep, playing, setPlaying, speedMs, setSpeedMs, totalSteps: TOTAL_STEPS, data };
}
