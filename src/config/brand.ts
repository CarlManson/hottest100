// Event branding — the one place to update each year.
// Drop new artwork into src/assets/brand/ (keep the same filenames, or change the imports below).

import logo from '../assets/brand/logo.png';
import mascot from '../assets/brand/mascot.png';
import background from '../assets/brand/background.jpg';
import backgroundTv from '../assets/brand/background-tv.jpg';

export const brand = {
  appName: 'Fairest 100',
  tagline: 'The Triple J Hottest 100 Voting Scorecard',

  // The year the countdown is FOR (e.g. 2026 for the Hottest 100 of 2026)
  countdownYear: 2026,

  images: {
    logo,
    // Character/badge/motif shown in the header corner. Set to null to hide it.
    mascot: mascot as string | null,
    background,
    backgroundTv,
    // Browser tab icon; falls back to the logo
    favicon: null as string | null,
  },

  // Brand colours. The UI derives light/dark shades from these automatically.
  colors: {
    primary: '#f97316',   // main brand colour (buttons, active tabs, highlights)
    secondary: '#ec4899', // second gradient colour
    tertiary: '#ef4444',  // middle stop of the signature gradient
    surface: '#292e47',   // menu bar / dark panels
    // Countdown "hotness" scale used for accents that heat up as the countdown nears #1
    cold: '#6ea4bc',
    hot: '#ff9d00',
  },

  // Optional live radio stream for the "Listen live" button. Leave unset to hide it.
  streamUrl: (import.meta.env.VITE_STREAM_URL as string | undefined) || undefined,
};

export const COUNTDOWN_YEAR = brand.countdownYear;
export const BROADCAST_YEAR = brand.countdownYear + 1;

export function applyBrand() {
  const root = document.documentElement.style;
  const { colors, images } = brand;
  root.setProperty('--brand-primary', colors.primary);
  root.setProperty('--brand-secondary', colors.secondary);
  root.setProperty('--brand-tertiary', colors.tertiary);
  root.setProperty('--brand-surface', colors.surface);
  root.setProperty('--hotness-cold', colors.cold);
  root.setProperty('--hotness-hot', colors.hot);
  root.setProperty('--brand-background', `url(${images.background})`);
  root.setProperty('--brand-background-tv', `url(${images.backgroundTv})`);

  document.title = brand.appName;
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon) {
    icon.href = images.favicon ?? images.logo;
    icon.removeAttribute('type');
  }
}
