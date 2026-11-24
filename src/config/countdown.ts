// Countdown configuration - update this for each year's countdown
// Hottest 100 starts at 9:00 AM AWST (UTC+8) = 1:00 AM UTC

// The year the countdown is FOR (e.g., 2025 for the Hottest 100 of 2025)
export const COUNTDOWN_YEAR = 2026;

// When the countdown broadcast starts (always late January of the following year)
export const COUNTDOWN_START = new Date(Date.UTC(COUNTDOWN_YEAR + 1, 0, 25, 1, 0, 0));

// Derived values
export const BROADCAST_YEAR = COUNTDOWN_YEAR + 1;
