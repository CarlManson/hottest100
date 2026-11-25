import { describe, expect, it } from 'vitest';
import { alertBatch, winnerPickLine } from './useResultNotifications';
import type { CountdownResult } from '../types';

// The countdown reveals #100 first, then #99, and so on
const revealed = (count: number, from = 100): CountdownResult[] =>
  Array.from({ length: count }, (_, i) => ({ songId: `s${from - i}`, position: from - i }));

describe('alertBatch', () => {
  it('stays quiet until the fifth song', () => {
    for (let n = 1; n < 5; n++) expect(alertBatch(n - 1, revealed(n))).toBeNull();
  });

  it('returns the last five songs, newest first, on every fifth song', () => {
    expect(alertBatch(4, revealed(5))?.map(r => r.position)).toEqual([96, 97, 98, 99, 100]);
    expect(alertBatch(9, revealed(10))?.map(r => r.position)).toEqual([91, 92, 93, 94, 95]);
    expect(alertBatch(99, revealed(100))?.map(r => r.position)).toEqual([1, 2, 3, 4, 5]);
  });

  it('fires when a small jump crosses a multiple of five', () => {
    expect(alertBatch(3, revealed(6))?.map(r => r.position)).toEqual([95, 96, 97, 98, 99]);
  });

  it('ignores removals and bulk loads', () => {
    expect(alertBatch(6, revealed(5))).toBeNull();
    expect(alertBatch(0, revealed(10))).toBeNull();
  });

  it('works for the Hottest 200 positions', () => {
    expect(alertBatch(4, revealed(5, 200))?.map(r => r.position)).toEqual([196, 197, 198, 199, 200]);
  });
});

describe('winnerPickLine', () => {
  const r = (songId: string, position: number) => ({ songId, position });
  const m = (name: string, winnerSongId?: string) => ({ id: name, name, votes: [], winnerSongId });

  it('names who called the #1 in the final alert', () => {
    const results = [r('a', 1), r('b', 2)];
    expect(winnerPickLine(results, [m('Sam', 'a'), m('Jo', 'b')], results)).toBe('Called the winner: Sam (+50)');
  });

  it('says nobody called it, and stays quiet with no picks or before #1', () => {
    const results = [r('a', 1)];
    expect(winnerPickLine(results, [m('Jo', 'b')], results)).toBe('Nobody called the winner');
    expect(winnerPickLine(results, [m('Jo')], results)).toBeNull();
    expect(winnerPickLine([r('a', 2)], [m('Sam', 'a')], [r('a', 2)])).toBeNull();
  });
});
