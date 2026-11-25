import { describe, expect, it } from 'vitest';
import { calculateScore, getLeaderboard, calculateWinnerBonus, calculateMaxPossibleScore, WINNER_PICK_BONUS } from './scoring';
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

describe('winner pick bonus', () => {
  const withPick = (id: string, songIds: string[], winnerSongId?: string): FamilyMember => ({
    ...member(id, songIds),
    winnerSongId,
  });

  it('adds nothing until #1 is entered', () => {
    const results = h100([['a', 2], ['b', 3]]);
    expect(calculateScore(withPick('m', [], 'a'), results, [])).toBe(0);
  });

  it('adds 50 when the pick is #1, even outside the top ten', () => {
    const results = h100([['a', 1], ['b', 2]]);
    expect(calculateScore(withPick('m', ['b'], 'a'), results, [])).toBe(99 + WINNER_PICK_BONUS);
    expect(calculateWinnerBonus(withPick('m', ['b'], 'a'), results)).toBe(50);
  });

  it('stacks with the normal #1 points when the pick is also in the top ten', () => {
    const results = h100([['a', 1]]);
    expect(calculateScore(withPick('m', ['a'], 'a'), results, [])).toBe(100 + 50);
  });

  it('stays a flat 50 in Hottest 200 mode', () => {
    const results100 = h100([['a', 1]]);
    const results200 = h100([['c', 200]]);
    expect(calculateScore(withPick('m', ['a'], 'a'), results100, results200)).toBe(200 + 50);
  });

  it('gives nothing for a wrong pick or no pick (e.g. old archives)', () => {
    const results = h100([['a', 1], ['b', 2]]);
    expect(calculateScore(withPick('m', [], 'b'), results, [])).toBe(0);
    expect(calculateScore(member('m', ['a']), results, [])).toBe(100);
  });

  it('includes the bonus in the max possible score once #1 is in', () => {
    expect(calculateMaxPossibleScore(h100([['a', 2]]), [])).toBe(99);
    expect(calculateMaxPossibleScore(h100([['a', 1]]), [])).toBe(150);
  });

  it('reports the bonus on the leaderboard and ties members who end level', () => {
    const results = h100([['a', 1], ['b', 51]]);
    const board = getLeaderboard([withPick('x', ['b'], 'a'), withPick('y', ['b'], 'a')], results, []);
    expect(board.map(e => [e.score, e.bonus])).toEqual([[100, 50], [100, 50]]);
  });
});
