import type { CountdownResult, Song } from '../types';

// Loose matching of triple j's countdown entries to catalogue songs, for auto-fill.
// No AI: normalise both sides, then compare letter pairs. Anything unsure is flagged for a person.

export interface TriplejSong {
  position: number;
  artist: string;
  title: string;
  image?: string;
}

export interface SongMatch {
  entry: TriplejSong;
  song: Song | null;
  /** 0-1, how alike the best catalogue song is */
  score: number;
  /** Matched, but another song came close, so a person should check */
  unsure: boolean;
}

/** Lower case, no accents, no "(feat. ...)" or "[...]" bits, punctuation turned into spaces */
export function normalise(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\((?:feat|ft|featuring|with|prod)\.?[^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s(?:feat|ft|featuring)\.?\s.*$/, ' ')
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Artist credits split into names: "A, B & C feat. D" → a, b, c, d */
export function artistNames(artist: string): string[] {
  return artist
    .toLowerCase()
    .split(/\s*(?:,|&|\bx\b|\band\b|\bfeat\.?|\bft\.?|\bfeaturing\b|\bwith\b|\bvs\.?)\s*/)
    .map(normalise)
    .filter(Boolean);
}

function pairs(text: string): string[] {
  const t = text.replace(/\s+/g, ' ');
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
}

/** Dice coefficient on letter pairs: 1 is identical, 0 shares nothing */
export function similarity(a: string, b: string): number {
  if (a === b) return a ? 1 : 0;
  if (a.length < 2 || b.length < 2) return 0;
  const counts = new Map<string, number>();
  for (const p of pairs(a)) counts.set(p, (counts.get(p) ?? 0) + 1);
  let shared = 0;
  const bPairs = pairs(b);
  for (const p of bPairs) {
    const n = counts.get(p) ?? 0;
    if (n > 0) {
      shared++;
      counts.set(p, n - 1);
    }
  }
  return (2 * shared) / (pairs(a).length + bPairs.length);
}

function titleScore(a: string, b: string): number {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return 1;
  return similarity(na, nb);
}

function artistScore(a: string, b: string): number {
  const whole = similarity(normalise(a), normalise(b));
  const namesA = artistNames(a);
  const namesB = artistNames(b);
  let best = whole;
  for (const x of namesA) for (const y of namesB) best = Math.max(best, similarity(x, y));
  return best;
}

const MIN_TITLE = 0.8;
const MIN_ARTIST = 0.5;
const MIN_SCORE = 0.82;
const CLOSE_CALL = 0.05;

/** Best catalogue song for one triple j entry, or null when nothing is close enough */
export function matchEntry(entry: TriplejSong, songs: Song[]): SongMatch {
  const scored = songs
    .map((song) => {
      const t = titleScore(entry.title, song.title);
      const a = artistScore(entry.artist, song.artist);
      return { song, t, a, score: t * 0.7 + a * 0.3 };
    })
    .filter((s) => s.t >= MIN_TITLE && s.a >= MIN_ARTIST && s.score >= MIN_SCORE)
    .sort((x, y) => y.score - x.score);

  if (scored.length === 0) return { entry, song: null, score: 0, unsure: false };
  const [best, next] = scored;
  return { entry, song: best.song, score: best.score, unsure: !!next && best.score - next.score < CLOSE_CALL };
}

export interface AutoFillPlan {
  /** Safe to add now */
  add: CountdownResult[];
  /** No catalogue song close enough, or a close call: a person picks */
  needsYou: SongMatch[];
  /** The position already holds a different song */
  conflicts: { match: SongMatch; existingSongId: string }[];
  /** Already in the results, nothing to do */
  alreadyIn: number;
}

/**
 * Works out what auto-fill should do with triple j's latest list.
 * `results` is the current list for this countdown; `otherResults` the other countdown's,
 * so a song is never in both.
 */
export function planAutoFill(
  entries: TriplejSong[],
  songs: Song[],
  results: CountdownResult[],
  otherResults: CountdownResult[] = []
): AutoFillPlan {
  const byPosition = new Map(results.map((r) => [r.position, r.songId]));
  const used = new Set([...results, ...otherResults].map((r) => r.songId));
  const plan: AutoFillPlan = { add: [], needsYou: [], conflicts: [], alreadyIn: 0 };

  for (const entry of [...entries].sort((a, b) => b.position - a.position)) {
    const match = matchEntry(entry, songs);
    const existing = byPosition.get(entry.position);

    if (match.song && existing === match.song.id) {
      plan.alreadyIn++;
    } else if (existing) {
      plan.conflicts.push({ match, existingSongId: existing });
    } else if (!match.song || match.unsure || used.has(match.song.id)) {
      plan.needsYou.push(match);
    } else {
      plan.add.push({ songId: match.song.id, position: entry.position });
      used.add(match.song.id);
      byPosition.set(entry.position, match.song.id);
    }
  }
  return plan;
}

/** triple j's two-digit year: the Hottest 100 of 2026 airs in January 2027, at /hottest100/26 */
export function triplejYear(now: Date = new Date()): string {
  const year = now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
  return String(year % 100).padStart(2, '0');
}
