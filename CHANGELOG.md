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
