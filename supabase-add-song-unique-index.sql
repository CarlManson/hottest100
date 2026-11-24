-- Prevent duplicate songs (same artist + title, ignoring case and surrounding whitespace).
-- Run in the Supabase SQL Editor on an existing project. Safe to re-run.

-- 1. Show any existing duplicates (the index creation below fails while these exist)
SELECT lower(trim(artist)) AS artist, lower(trim(title)) AS title, count(*) AS copies
FROM songs
GROUP BY 1, 2
HAVING count(*) > 1;

-- 2. Optional: delete duplicates, keeping the oldest copy.
--    WARNING: votes/countdown results pointing at the deleted copies are cascade-deleted.
--    Only uncomment if step 1 returned rows and you've checked nobody voted for the extra copies.
-- DELETE FROM songs s
-- USING songs keep
-- WHERE lower(trim(s.artist)) = lower(trim(keep.artist))
--   AND lower(trim(s.title)) = lower(trim(keep.title))
--   AND (s.created_at, s.id) > (keep.created_at, keep.id);

-- 3. Add the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_songs_artist_title_unique
  ON songs (lower(trim(artist)), lower(trim(title)));
