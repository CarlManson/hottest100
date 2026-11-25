import { describe, expect, it } from 'vitest';
import { getTippedSongs, getWinnerPickers, getWinnerPickStatus, joinNames } from './winnerPick';
import type { CountdownResult, FamilyMember, Song } from '../types';

const r = (songId: string, position: number): CountdownResult => ({ songId, position });
const song = (id: string): Song => ({ id, title: id, artist: 'x' });
const m = (name: string, winnerSongId?: string): FamilyMember => ({ id: name, name, votes: [], winnerSongId });

describe('getWinnerPickStatus', () => {
  it('is alive until the pick is played, then out', () => {
    expect(getWinnerPickStatus('a', [r('b', 5)], [])).toBe('alive');
    expect(getWinnerPickStatus('a', [r('a', 5)], [])).toBe('out');
  });

  it('is won when the pick is #1, and out for everyone else', () => {
    expect(getWinnerPickStatus('a', [r('a', 1)], [])).toBe('won');
    expect(getWinnerPickStatus('b', [r('a', 1)], [])).toBe('out');
  });

  it('is none with no pick', () => {
    expect(getWinnerPickStatus(undefined, [r('a', 1)], [])).toBe('none');
  });
});

describe('getTippedSongs', () => {
  it('groups backers and puts live picks before knocked-out ones', () => {
    const tipped = getTippedSongs(
      [m('Sam', 'a'), m('Alex', 'b'), m('Jo', 'b'), m('Kim')],
      [song('a'), song('b')],
      [r('b', 4)],
      []
    );
    expect(tipped.map(t => [t.song.id, t.names, t.status, t.position])).toEqual([
      ['a', ['Sam'], 'alive', undefined],
      ['b', ['Alex', 'Jo'], 'out', 4],
    ]);
  });
});

describe('getWinnerPickers', () => {
  it('lists who called the #1', () => {
    expect(getWinnerPickers([m('Sam', 'a'), m('Alex', 'b'), m('Jo', 'a')], [r('a', 1)])).toEqual(['Sam', 'Jo']);
    expect(getWinnerPickers([m('Sam', 'a')], [r('a', 2)])).toEqual([]);
  });
});

describe('joinNames', () => {
  it('reads naturally', () => {
    expect(joinNames(['Sam'])).toBe('Sam');
    expect(joinNames(['Sam', 'Jo'])).toBe('Sam and Jo');
    expect(joinNames(['Sam', 'Jo', 'Alex'])).toBe('Sam, Jo and Alex');
  });
});
