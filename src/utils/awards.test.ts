import { describe, expect, it } from 'vitest';
import { calculateAwards } from './awards';
import type { CountdownResult, FamilyMember, Song } from '../types';

const songs: Song[] = Array.from({ length: 200 }, (_, i) => ({
  id: `s${i + 1}`,
  title: `Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  isAustralian: i % 2 === 0,
}));

// Song sN finishes at position N
const hottest100: CountdownResult[] = songs.slice(0, 100).map((s, i) => ({ songId: s.id, position: i + 1 }));
const hottest200: CountdownResult[] = songs.slice(100).map((s, i) => ({ songId: s.id, position: i + 101 }));

const member = (id: string, songIds: string[]): FamilyMember => ({
  id,
  name: id,
  votes: songIds.map((songId, i) => ({ songId, rank: i + 1 })),
});

describe('calculateAwards', () => {
  it('returns nothing until the Hottest 100 is complete', () => {
    expect(calculateAwards([member('a', ['s1'])], songs, hottest100.slice(0, 50))).toEqual([]);
  });

  it('gives The Oracle to whoever picked #1', () => {
    const awards = calculateAwards([member('a', ['s1']), member('b', ['s2'])], songs, hottest100);
    expect(awards.find(a => a.id === 'oracle')?.winnerId).toBe('a');
  });

  it('adds Hottest 200 awards only when the 200 is complete', () => {
    const deep = member('deep', ['s101', 's105', 's150', 's199']);
    const top = member('top', ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's101', 's102']);

    const partial = calculateAwards([deep, top], songs, hottest100, hottest200.slice(0, 50));
    expect(partial.find(a => a.id === 'deep-diver')).toBeUndefined();

    const full = calculateAwards([deep, top], songs, hottest100, hottest200);
    expect(full.find(a => a.id === 'deep-diver')?.winnerId).toBe('deep');
    expect(full.find(a => a.id === 'total-domination')?.winnerId).toBe('top');
    expect(full.find(a => a.id === 'perfect-top')?.details).toBe('8/10 in Hottest 100, all 10 in the 200!');
  });

  it('So Close counts only near misses at #101-120', () => {
    const near = member('near', ['s101', 's110']);
    const far = member('far', ['s150', 's160', 's170']);
    const awards = calculateAwards([near, far], songs, hottest100, hottest200);
    expect(awards.find(a => a.id === 'so-close')?.winnerId).toBe('near');
  });
});
