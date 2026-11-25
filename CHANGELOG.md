# Changelog

## [Unreleased] - 2026-11-24

### Action needed before the countdown
- **Run `supabase-add-groups.sql`** in the Supabase SQL Editor to turn on member groups (group features stay hidden until then)
- **Set the countdown date** in Settings once Triple J announces it ("Use default" now picks the fourth Saturday of January)
- **Drop in the new event branding** — see `src/assets/brand/README.md` and `src/config/brand.ts`
- **Run `supabase-add-app-settings.sql`** in the Supabase SQL Editor so the countdown date is shared with every visitor
- **Run `supabase-add-song-unique-index.sql`** in the Supabase SQL Editor (new projects get it from `supabase-schema.sql`)
- Optional: set `VITE_STREAM_URL` to show the "Listen live" button

### Added — groups
- Member groups (e.g. The Fair Family, Work, Friends): admins create, rename, re-member and delete them in Settings → Groups; a member can be in several groups
- Everyone can switch the home page, leaderboard page and detailed breakdown between "All members" and a group; podium, quips, awards, Crowd Favourites and score bumps follow the group (scores don't change)
- The home page shows the selected group's name above the title (hidden for "All members")
- The choice is remembered and kept in the link (`?group=the-fair-family`), so TV screens can be pointed at a group (`/?group=work#tv`); Settings has "Copy link" / "Copy TV link" for each group

### Changed — archive
- "Archive & Reset for Next Year" (Settings → Data) now appears once the Hottest 100 is complete; the Hottest 200 no longer has to be finished and is archived as it stands

### Changed — song alerts
- The hero "Song alerts" button is now a slim, dismissible bar under the menu on the home page; it hides once alerts are on, if notifications are blocked, or after dismissal
- "Song alerts: on/off" link in the footer to change it later; alerts now work from any page, not just home
- Fixed the header mascot image intercepting clicks below the menu

### Added — branding, TV mode and motion
- Brand layer: `src/config/brand.ts` + `src/assets/brand/` hold the event name, year, logo, mascot/badge, backgrounds, favicon and colours
  - Colours become CSS variables at runtime and Tailwind `primary-*` / `secondary-*` / `tertiary-*` scales (all hardcoded orange/pink classes migrated)
  - Hotness cold/hot endpoints are configurable too
- TV mode escalates through the broadcast, built on `--hotness`:
  - `--tv-intensity` (0→1 per broadcast) and `data-tv-stage` (build → heat → fever → finale) on `<body>`
  - Ambient glow that brightens and speeds up, a reveal flash on every new song, heartbeat glow on the featured song from #50, embers from #10, confetti at #1 / #101
- TV rehearsal mode: open `/?rehearsal#tv` to scrub or auto-play a simulated countdown with the real song list
- Song arrival animations: featured song card "reveal", new entries slide in with an accent glow, leaderboard rows bump with a floating "+N"
- All motion lives in `src/styles/_motion.scss` and is disabled under `prefers-reduced-motion`

### Changed — shared countdown date
- The countdown date set in Settings is now stored in Supabase (`app_settings` table) and synced live, so every visitor sees the same timer and votes lock for everyone at start time
- Falls back to this-browser-only (previous behaviour) until the table exists; Settings says which happened

### Changed — polish
- Home: removed the duplicated progress bar from the latest-entries card (the hero already shows it), fixed "Full Leaderboard" breaking onto two lines, smaller podium heading, lighter and consistent card borders
- Merged latest `main` (hotness styling, CurrentSongCard, Settings-based countdown date); the hardcoded countdown date was removed in favour of the Settings one

### Added
- Single config for the countdown year and stream URL (now part of `src/config/brand.ts`)
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
