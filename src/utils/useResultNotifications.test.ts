import { describe, expect, it } from 'vitest';
import { alertBatch, newResults, picksInResults } from './useResultNotifications';
import type { CountdownResult, FamilyMember } from '../types';

// The countdown reveals #100 first, then #99, and so on
const revealed = (count: number, from = 100): CountdownResult[] =>
  Array.from({ length: count }, (_, i) => ({ songId: `s${from - i}`, position: from - i }));
const ids = (results: CountdownResult[]) => new Set(results.map(r => r.songId));

describe('alertBatch', () => {
  it('stays quiet until the tenth song', () => {
    for (let n = 1; n < 10; n++) expect(alertBatch(n - 1, revealed(n))).toBeNull();
  });

  it('returns the last ten songs, newest first, on every tenth song', () => {
    expect(alertBatch(9, revealed(10))?.map(r => r.position)).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);
    expect(alertBatch(19, revealed(20))?.map(r => r.position)[0]).toBe(81);
    expect(alertBatch(99, revealed(100))?.map(r => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('fires when a small jump crosses a multiple of ten', () => {
    expect(alertBatch(8, revealed(11))?.map(r => r.position)[0]).toBe(90);
  });

  it('ignores removals and bulk loads', () => {
    expect(alertBatch(11, revealed(10))).toBeNull();
    expect(alertBatch(0, revealed(10))).toBeNull();
  });

  it('works for the Hottest 200 positions', () => {
    expect(alertBatch(9, revealed(10, 200))?.map(r => r.position)[9]).toBe(200);
  });
});

describe('newResults', () => {
  it('returns only the songs added since last time', () => {
    const before = revealed(4);
    expect(newResults(4, revealed(5), ids(before)).map(r => r.position)).toEqual([96]);
  });

  it('ignores bulk loads', () => {
    expect(newResults(0, revealed(10), new Set())).toEqual([]);
  });
});

describe('picksInResults', () => {
  const member: FamilyMember = {
    id: 'm1',
    name: 'Carl',
    votes: [{ songId: 's96', rank: 3 }, { songId: 's50', rank: 1 }],
  };

  it('finds the member’s picks among new songs, with their rank', () => {
    const added = [{ songId: 's96', position: 96 }, { songId: 's95', position: 95 }];
    expect(picksInResults(member, added)).toEqual([{ result: added[0], rank: 3 }]);
  });

  it('returns nothing without a member', () => {
    expect(picksInResults(undefined, revealed(3))).toEqual([]);
  });
});
