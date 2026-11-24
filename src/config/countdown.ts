// Countdown configuration - update each year once Triple J announces the date.

// The year the countdown is FOR (e.g. 2026 for the Hottest 100 of 2026)
export const COUNTDOWN_YEAR = 2026;

// Broadcast start, in UTC. 1:00 AM UTC = 9:00 AM AWST / 12:00 PM AEDT.
// PLACEHOLDER: fourth Saturday of January 2027 — confirm once officially announced.
export const COUNTDOWN_START = new Date(Date.UTC(COUNTDOWN_YEAR + 1, 0, 23, 1, 0, 0));

export const BROADCAST_YEAR = COUNTDOWN_YEAR + 1;

// Optional live radio stream for the in-app player. Leave unset to hide the player.
export const STREAM_URL: string | undefined = import.meta.env.VITE_STREAM_URL || undefined;
