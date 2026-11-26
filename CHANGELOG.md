# Changelog

## [Unreleased] - 2026-11-27

### Action needed before the countdown
- **Run the SQL scripts** in the Supabase SQL Editor, if not done yet (new projects get most of these from `supabase-schema.sql`):
  - `supabase-add-app-settings.sql`: shares the countdown date (and uploaded app icon) with every visitor
  - `supabase-add-groups.sql`: turns on Parties (hidden until then)
  - `supabase-add-winner-pick.sql`: turns on the pick-the-winner bonus (hidden until then)
  - `supabase-add-song-unique-index.sql`: blocks duplicate songs at the database
  - `supabase-clear-empty-groups.sql`: one-off, removes empty parties left from the 2025 reset
  - `supabase-add-roles.sql` then `supabase-lock-writes.sql`: Admin and Host logins (see below). `supabase-unlock-writes.sql` is the emergency undo
- **Redeploy the AI profile function** (`supabase functions deploy generate-profile`) so only a signed-in Admin or Host can spend API credit
- **Delete the old `VITE_AUTH_USERNAME` / `VITE_AUTH_PASSWORD` secrets** from GitHub; the app no longer reads them
- **Set the countdown date** in Settings → Event once Triple J announces it ("Use default" picks the fourth Saturday of January)
- **Drop in the new event branding**: see `src/assets/brand/README.md` and `src/config/brand.ts`
- Optional: set `VITE_STREAM_URL` to show the "Listen live" button, and `VITE_CAST_APP_ID` (or `brand.castAppId`) for the Cast button

### Added — Admin and Host logins
- Real Supabase Auth logins (email + password, sign-ups off, users created in the Supabase dashboard) replace the old shared username/password that was baked into the site's JavaScript
- The login box takes a username: `host` becomes `host@fairest100.au` (`LOGIN_EMAIL_DOMAIN` in `src/context/AuthContext.tsx`); a full email works too
- Two roles in a new `user_roles` table: **Admin** can do everything; **Host** (one shared login) can manage mates, picks and parties, enter countdown results, run AI nicknames/profiles, view the leaderboard and archive, and change the countdown date in Settings → Event
- Row-level security now enforces this in the database: anyone can read (Home, TV mode, /tv), but writes need a signed-in role. Songs, archives and other settings are Admin only
- The `generate-profile` edge function checks the caller's role, so visitors can't spend API credit
- The old `hottest100_auth` flag and cookie are cleared on load; Supabase keeps and refreshes the session

### Changed — menu, Log in and Settings
- The mobile menu button now shows for everyone: visitors get Home, TV Mode and Log in; Admin and Host also get their pages, Settings and Log out. The desktop menu bar has Settings and Log out too
- Desktop visitors have no menu, so the footer keeps a Log in link for them; the hero's Log in button stays
- Countdown and Leaderboard are always in the Admin's menu. For the Host they stay hidden until the countdown starts (date reached or first result). `#countdown` / `#leaderboard` still open, Settings → Event links to them, and a notice explains it's a test run (Admin) or why it's not in the menu yet (Host)
- Navbar tidy: Archive is styled like the other links and sits next to a white TV Mode tab on the right

### Added — pick the winner
- Each mate can pick one song from the catalogue to finish #1. If it does, they get a flat **+50 points**, with or without the Hottest 200, and whether or not the song is in their top 10
- Picks lock with the votes when the countdown starts (or the first result is entered), are visible to everyone, and tied scores share a position
- Hidden until `supabase-add-winner-pick.sql` has been run

### Added — TV mode on a TV
- **Cast** button in TV mode (Chrome/Edge) sends the leaderboard to a Chromecast or Google TV through a custom receiver (`public/cast-receiver.html`), including the selected party. Only shown when a Cast app ID is set
- **Full screen** and **Show on your TV** buttons, with a guide for Cast, AirPlay mirroring, HDMI and smart-TV browsers. The buttons fade when idle, and TV mode keeps the screen awake
- **fairest100.au/tv** for old smart-TV browsers: modern browsers jump to the normal TV mode, old ones get a simple leaderboard that refreshes every 15 seconds (`?lite` / `?full` force a view; `?group=` works)
- TV mode shows "Predictions Submitted" only once there are songs, and lists only mates who have picked something

### Added — installable app
- The site can be installed to a phone's home screen and opens full screen like an app (iPhone: Share → Add to Home Screen; Android/desktop Chrome: Install). No app stores involved
- A dismissible bar on Home explains how to install (with the browser's own Install button where it has one); the footer keeps an "Install the app" link. On Android, until Chrome is ready to offer its Install button, the bar shows the browser-menu steps instead
- A service worker (`pwa/service-worker.js`, written to `/sw.js` by the build) keeps the app shell cached so it opens on bad signal; scores, Supabase data and the /tv page always come from the network

### Added — app icon
- Admins can upload an app icon in Settings → Style. It's resized to a 256px square and used as the browser tab icon and iPhone home-screen icon for everyone. Android and desktop installs keep the built-in icon

### Changed — song alerts
- Three kinds of alert: a round-up every 10 songs (Hottest 100 and 200), "your pick is in" when one of your mate's songs is played, and one when the countdown starts
- Alerts are now for **phones and tablets only**. A bell next to the menu button (crossed out when off) opens a panel from the bottom of the screen with the on/off switch, "Which mate are you?" (for pick alerts) and a note that alerts are for this device only
- The Home alerts bar and footer toggle are gone; desktops no longer send alerts
- Alerts go through the service worker, which Android Chrome and iPhone home-screen apps require. They still only fire while the app is open in the background; alerts with the app fully closed would need a web push service

### Added — Parties (member groups)
- Parties (e.g. The Fair Family, Work, Friends) are managed on the **Mates & Picks** page (formerly Votes), below the list of mates. The panel appears once there are more than two mates (or a party already exists). A mate can be in several parties
- Everyone can switch the home page, leaderboard and detailed breakdown between "All members" and a party; podium, quips, awards, Crowd Favourites and score bumps follow the party (scores don't change)
- The home page shows the selected party's name above the title as a small menu for switching
- The choice is remembered and kept in the link (`?group=the-fair-family`), so TV screens can be pointed at a party (`/?group=work#tv`); each party has "Copy link" / "Copy TV link"
- Parties belong to the season: Archive & Reset saves them into the archive and clears them with the mates. The Archive page can filter a year by its parties. Empty parties are hidden
- Code, tables and the `?group=` link keep the name "group"

### Changed — look and home page
- Emojis are replaced across the app by a custom set of Riso-style line icons (`src/components/icons`); award definitions use icon names. Party emojis stay as chosen
- Before the countdown, the home page centres a larger countdown timer that fills the first screen, with a Log in button for visitors. The old "Get started" empty state is gone
- Home hides "Predictions Submitted" until someone has voted, and shows the "G'day Legends" welcome only once there are songs, with a "Cast your votes" button
- Fixed white gaps under the countdown hero and above the footer

### Changed — archive
- "Archive & Reset for Next Year" (Settings → Data) now appears once the Hottest 100 is complete; the Hottest 200 no longer has to be finished and is archived as it stands

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

### Removed — Dashboard page
- Logging in now lands on Home instead of the old Dashboard. The Dashboard left the menus in January but its page and the login redirect were still there; the page is now gone and old `#dashboard` links open Home

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
