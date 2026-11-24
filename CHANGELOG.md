# Changelog

## [Unreleased] - 2026-11-24

### Added
- Shared countdown configuration (`src/config/countdown.ts`) - single source of truth for countdown year and date
  - `COUNTDOWN_YEAR` - the year the countdown is FOR (e.g., 2026)
  - `COUNTDOWN_START` - when the broadcast starts (Jan 25, 2027)
  - `BROADCAST_YEAR` - the year of the broadcast (2027)
- Client-side duplicate song prevention on import
  - JSON import: filters out songs already in library
  - CSV import: filters out songs already in library
  - Manual entry: blocks adding duplicate songs
  - Shows count of skipped duplicates in success message
- Undo button in Countdown Entry page
  - Tracks last add/remove action
  - Yellow "↩ Undo" button appears after any action
  - Works across both Hottest 100 and 200 tabs
- Awards system now supports Hottest 200
  - All existing awards now consider both countdowns
  - New "So Close" award: picks that landed 101-200
  - New "Deep Diver" award: most picks in 101-200 range
  - New "Total Domination" award: most matches across full 200
  - Perfect 10 details show breakdown of Hottest 100 vs 200

### Changed
- Dynamic year display across all components (no more hardcoded "2025"/"2026")
  - PublicHome.tsx: "#1 Song of {year}", "The Hottest 100/200 of {year}"
  - TVMode.tsx: "#1 Song of {year}", "The Hottest 200 of {year}"
  - App.tsx footer: copyright year from BROADCAST_YEAR
- Updated countdown date to Jan 25, 2027 (Hottest 100 of 2026)

### Removed
- Console.log debug statements (kept console.error for error handling)
  - Removed 3 console.log calls from AppContext.tsx

### Fixed
- Countdown date no longer duplicated across files (now imported from config)
