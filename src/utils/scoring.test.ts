import { describe, expect, it } from 'vitest';
import { calculateScore, getLeaderboard } from './scoring';
import type { CountdownResult, FamilyMember } from '../types';

const member = (id: string, songIds: string[]): FamilyMember => ({
  id,
  name: id,
  votes: songIds.map((songId, i) => ({ songId, rank: i + 1 })),
});

const h100 = (entries: [string, number][]): CountdownResult[] =>
  entries.map(([songId, position]) => ({ songId, position }));

describe('calculateScore', () => {
  it('scores Hottest 100 alone as 1 point for #100 up to 100 for #1', () => {
    const results = h100([['a', 100], ['b', 1]]);
    expect(calculateScore(member('m', ['a']), results, [])).toBe(1);
    expect(calculateScore(member('m', ['b']), results, [])).toBe(100);
    expect(calculateScore(member('m', ['a', 'b']), results, [])).toBe(101);
  });

  it('lifts Hottest 100 songs to 101-200 points once the Hottest 200 starts', () => {
    const results100 = h100([['a', 100], ['b', 1]]);
    const results200 = h100([['c', 200], ['d', 101]]);
    expect(calculateScore(member('m', ['a']), results100, results200)).toBe(101);
    expect(calculateScore(member('m', ['b']), results100, results200)).toBe(200);
    expect(calculateScore(member('m', ['c']), results100, results200)).toBe(1);
    expect(calculateScore(member('m', ['d']), results100, results200)).toBe(100);
  });

  it('ignores picks that did not chart and ignores vote rank', () => {
    const results = h100([['a', 50]]);
    const first = { id: 'x', name: 'x', votes: [{ songId: 'a', rank: 1 }, { songId: 'z', rank: 2 }] };
    const last = { id: 'y', name: 'y', votes: [{ songId: 'a', rank: 10 }] };
    expect(calculateScore(first, results, [])).toBe(51);
    expect(calculateScore(last, results, [])).toBe(51);
  });
});

describe('getLeaderboard', () => {
  it('can reorder when the Hottest 200 starts because each match gains 100 points', () => {
    const results100 = h100([['big', 1], ['s1', 90], ['s2', 91]]);
    const fewBig = member('fewBig', ['big']);
    const manySmall = member('manySmall', ['s1', 's2']);

    const before = getLeaderboard([fewBig, manySmall], results100, []);
    expect(before.map(e => e.member.id)).toEqual(['fewBig', 'manySmall']);

    const after = getLeaderboard([fewBig, manySmall], results100, h100([['other', 200]]));
    expect(after.map(e => e.member.id)).toEqual(['manySmall', 'fewBig']);
  });
});
