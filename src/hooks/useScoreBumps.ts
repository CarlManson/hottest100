import { useState } from 'react';

interface ScoredEntry {
  member: { id: string };
  score: number;
}

/**
 * Returns how much each member's score went up in the most recent change
 * (empty on first render), for "+N" bump animations.
 */
export function useScoreBumps(entries: ScoredEntry[]) {
  const signature = entries.map(e => `${e.member.id}:${e.score}`).join('|');
  const [prevSignature, setPrevSignature] = useState(signature);
  const [prevScores, setPrevScores] = useState(() => new Map(entries.map(e => [e.member.id, e.score])));
  const [bumps, setBumps] = useState<Map<string, number>>(() => new Map());
  const [bumpId, setBumpId] = useState(0);

  if (signature !== prevSignature) {
    const next = new Map<string, number>();
    for (const e of entries) {
      const before = prevScores.get(e.member.id);
      if (before != null && e.score > before) next.set(e.member.id, e.score - before);
    }
    setPrevSignature(signature);
    setPrevScores(new Map(entries.map(e => [e.member.id, e.score])));
    setBumps(next);
    setBumpId(id => id + 1);
  }

  // bumpId lets callers key the animated element so it replays on each change
  return { bumps, bumpId };
}
