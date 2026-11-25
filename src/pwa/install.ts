// Installable app support: registers the service worker and keeps hold of the browser's
// "install this app" prompt so the install bar can show it when someone taps Install.
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode =
  /** Already running from the home screen, or the browser can't install it */
  | 'none'
  /** Chrome, Edge, Samsung Internet...: we can show the browser's own install dialog */
  | 'prompt'
  /** iPhone/iPad: has to be done by hand from the Share menu */
  | 'ios';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  // iPadOS reports itself as a Mac, but Macs don't have touch screens
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function getInstallMode(): InstallMode {
  if (installed || isStandalone()) return 'none';
  if (deferredPrompt) return 'prompt';
  if (isIos()) return 'ios';
  return 'none';
}

/** Show the browser's install dialog. Resolves true if the person installed it. */
export async function promptInstall(): Promise<boolean> {
  const event = deferredPrompt;
  if (!event) return false;
  deferredPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === 'accepted') installed = true;
  notify();
  return outcome === 'accepted';
}

/** Current install mode, updated when the browser says the app can (or has been) installed */
export function useInstallMode(): InstallMode {
  const [mode, setMode] = useState(getInstallMode);
  useEffect(() => {
    const update = () => setMode(getInstallMode());
    listeners.add(update);
    update();
    return () => { listeners.delete(update); };
  }, []);
  return mode;
}

/** Called once at startup from main.tsx */
export function setupInstallableApp() {
  if (typeof window === 'undefined') return;

  // Fires early, often before React has drawn anything, so catch it here
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });

  // Only in the built site: a service worker in dev would serve stale files while editing
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed', error);
      });
    });
  }
}
