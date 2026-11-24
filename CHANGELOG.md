# Changelog

## [Unreleased] - 2026-11-24

### Action needed before the countdown
- **Confirm the countdown date** in `src/config/countdown.ts` once Triple J announces it (placeholder: Sat 23 Jan 2027, 9:00 AM AWST)
- **Run `supabase-add-song-unique-index.sql`** in the Supabase SQL Editor (new projects get it from `supabase-schema.sql`)
- Optional: set `VITE_STREAM_URL` to show the "Listen live" button

### Added
- Shared countdown configuration (`src/config/countdown.ts`) - single source of truth for countdown year, start date and stream URL
- Duplicate song prevention
  - Client-side: JSON/CSV import and manual entry skip songs already in the library *and* repeats within the same import, with a skipped count
  - Database: case/whitespace-insensitive unique index on artist + title
- Vote locking: votes lock automatically when the broadcast starts or the first result is entered, with an "Unlock for corrections" override on the Votes page
- "Crowd Favourites" widget on the home page: most-picked songs and who picked them
- "Listen live" audio player in the home page hero (only shown when `VITE_STREAM_URL` is set)
- "Song alerts": opt-in browser notifications when a new result is revealed while the tab is in the background
- Playlist export (Settings → Data): copy results as text or download CSV, ordered #1 first, for playlist import tools
- Undo button in Countdown Entry (last add/remove; cleared after Clear All or a drag reorder)
- Search/filter for the countdown results list (shows when >5 results; drag-reorder pauses while filtering)
- Awards for the Hottest 200
  - Existing awards consider both countdowns
  - "So Close": most picks that landed #101-120
  - "Deep Diver": most picks in #101-200
  - "Total Domination": most matches across the full 200
  - Perfect 10 shows the Hottest 100 vs 200 breakdown
  - Awards section now reappears as "Hottest 200 Awards" once the 200 is complete (previously hidden for good once the 200 started)
- Automated tests (Vitest) for scoring and awards: `npm test`

### Changed
- Dynamic year display across all components (no more hardcoded "2025"/"2026")
- Extracted `CountdownProgressWidget` component from PublicHome (removed ~130 duplicated lines)

### Removed
- Unused `SongManager` and `DataManager` components (superseded by Settings)
- Debug `console.log` calls (kept `console.error`)
