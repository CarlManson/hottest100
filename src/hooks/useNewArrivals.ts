import { useCallback, useState } from 'react';
import type { CountdownResult } from '../types';

/**
 * Tracks which results arrived after the list was first shown, so only live
 * reveals animate (not everything on page load).
 */
export function useNewArrivals(results: CountdownResult[]) {
  const ids = results.map(r => r.songId);
  const signature = ids.join('|');

  const [seen, setSeen] = useState<Set<string> | null>(() => (ids.length ? new Set(ids) : null));
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [prevSignature, setPrevSignature] = useState(signature);

  // Adjust state while rendering when the results change (avoids an extra effect pass)
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setFresh(seen ? new Set(ids.filter(id => !seen.has(id))) : new Set());
    setSeen(new Set(ids));
  }

  return useCallback((result: CountdownResult) => fresh.has(result.songId), [fresh]);
}
