import { describe, expect, it } from 'vitest';
import { matchEntry, normalise, planAutoFill, triplejYear } from './triplejMatch';
import type { Song } from '../types';

const song = (id: string, artist: string, title: string): Song => ({ id, artist, title });

const catalogue = [
  song('man', 'Olivia Dean', 'Man I Need'),
  song('dance', 'Keli Holiday', 'Dancing2'),
  song('real', 'Playlunch & Aunty Donna', 'Real Estate Apps'),
  song('kelly', 'Paul Kelly', 'Did It Again'),
  song('beyonce', 'Beyoncé', 'Texas Hold ’Em'),
  song('feat', 'Chappell Roan', 'Good Luck, Babe!'),
  song('love1', 'Ruel', 'Love Me'),
  song('love2', 'Ruby Fields', 'Love Me'),
];

describe('triplej matching', () => {
  it('normalises feat. credits, brackets, accents and punctuation', () => {
    expect(normalise('Texas Hold ’Em')).toBe('texas hold em');
    expect(normalise('Good Luck, Babe! (feat. Someone)')).toBe('good luck babe');
    expect(normalise('Song [Triple J Like A Version]')).toBe('song');
    expect(normalise('Beyoncé')).toBe('beyonce');
  });

  it('matches exact and loosely written entries', () => {
    expect(matchEntry({ position: 1, artist: 'Olivia Dean', title: 'Man I Need' }, catalogue).song?.id).toBe('man');
    expect(matchEntry({ position: 2, artist: 'Keli Holiday', title: 'Dancing 2' }, catalogue).song?.id).toBe('dance');
    expect(matchEntry({ position: 3, artist: 'Beyonce', title: "Texas Hold 'Em" }, catalogue).song?.id).toBe('beyonce');
    expect(matchEntry({ position: 4, artist: 'Chappell Roan feat. Friend', title: 'Good Luck Babe' }, catalogue).song?.id).toBe('feat');
    expect(matchEntry({ position: 5, artist: 'Aunty Donna', title: 'Real Estate Apps' }, catalogue).song?.id).toBe('real');
  });

  it('uses the artist to tell apart songs with the same title', () => {
    expect(matchEntry({ position: 6, artist: 'Ruel', title: 'Love Me' }, catalogue).song?.id).toBe('love1');
    expect(matchEntry({ position: 7, artist: 'Ruby Fields', title: 'Love Me' }, catalogue).song?.id).toBe('love2');
  });

  it('leaves songs it does not know unmatched', () => {
    expect(matchEntry({ position: 8, artist: 'Paul Kelly', title: 'Dumb Things' }, catalogue).song).toBeNull();
    expect(matchEntry({ position: 9, artist: 'Somebody Else', title: 'Did It Again' }, catalogue).song).toBeNull();
  });

  it('plans adds, skips what is in, flags unknowns and conflicts', () => {
    const plan = planAutoFill(
      [
        { position: 100, artist: 'Paul Kelly', title: 'Did It Again' },
        { position: 99, artist: 'Olivia Dean', title: 'Man I Need' },
        { position: 98, artist: 'Nobody', title: 'Unknown Song' },
        { position: 97, artist: 'Keli Holiday', title: 'Dancing2' },
      ],
      catalogue,
      [
        { songId: 'kelly', position: 100 },
        { songId: 'real', position: 97 },
      ]
    );
    expect(plan.alreadyIn).toBe(1);
    expect(plan.add).toEqual([{ songId: 'man', position: 99 }]);
    expect(plan.needsYou.map((m) => m.entry.position)).toEqual([98]);
    expect(plan.conflicts.map((c) => c.match.entry.position)).toEqual([97]);
  });

  it('never adds a song that is already in the other countdown', () => {
    const plan = planAutoFill(
      [{ position: 50, artist: 'Olivia Dean', title: 'Man I Need' }],
      catalogue,
      [],
      [{ songId: 'man', position: 150 }]
    );
    expect(plan.add).toEqual([]);
    expect(plan.needsYou).toHaveLength(1);
  });

  it('works out triple j year paths', () => {
    expect(triplejYear(new Date(2027, 0, 23))).toBe('26');
    expect(triplejYear(new Date(2026, 10, 27))).toBe('26');
  });
});
