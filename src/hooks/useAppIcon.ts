import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { brand } from '../config/brand';

// An icon uploaded in Settings → Style, shared with everyone through app_settings.
// It replaces the browser tab icon and the iPhone "Add to Home Screen" icon.
// The Android/desktop install icon comes from public/manifest.webmanifest and stays as built.

const CACHE_KEY = 'fairest100_app_icon';
const CHANGE_EVENT = 'fairest100_app_icon_change';
const SETTINGS_TABLE = 'app_settings';
const SETTING_KEY = 'app_icon';
export const APP_ICON_SIZE = 256;

const settingsTable = () => supabase.from(SETTINGS_TABLE as never) as ReturnType<typeof supabase.from>;

const parseIcon = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('data:image/') ? value : null;

const readCache = (): string | null => {
  try {
    return parseIcon(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
};

const writeCache = (icon: string | null) => {
  try {
    if (icon) localStorage.setItem(CACHE_KEY, icon);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    // Storage full or blocked: the shared value still applies for this visit
  }
};

// Remember the built-in icons so "Use default" can put them back
const defaults = new Map<string, string>();

function setLink(rel: string, href: string | null) {
  const link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) return;
  if (!defaults.has(rel)) defaults.set(rel, link.href);
  link.href = href ?? defaults.get(rel)!;
  if (rel === 'icon') link.removeAttribute('type');
}

function applyIcon(icon: string | null) {
  setLink('icon', icon ?? brand.images.favicon);
  setLink('apple-touch-icon', icon);
}

let currentIcon: string | null = readCache();
let syncStarted = false;

const setCurrentIcon = (icon: string | null) => {
  currentIcon = icon;
  writeCache(icon);
  applyIcon(icon);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

async function fetchRemoteIcon() {
  const { data, error } = await settingsTable().select('value').eq('key', SETTING_KEY).maybeSingle();
  if (error) return; // offline or table missing: keep what this browser has
  const icon = parseIcon((data as { value?: unknown } | null)?.value);
  if (icon !== currentIcon) setCurrentIcon(icon);
}

/** Applies the shared icon on load and keeps it in sync. Call once at startup. */
export function startAppIconSync() {
  if (syncStarted) return;
  syncStarted = true;
  if (currentIcon) applyIcon(currentIcon);
  fetchRemoteIcon();
  supabase
    .channel('app-icon-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: SETTINGS_TABLE, filter: `key=eq.${SETTING_KEY}` }, () => {
      fetchRemoteIcon();
    })
    .subscribe();
}

async function saveIcon(icon: string | null): Promise<boolean> {
  const { error } = await settingsTable().upsert(
    { key: SETTING_KEY, value: icon, updated_at: new Date().toISOString() } as never,
    { onConflict: 'key' }
  );
  if (error) {
    console.error('App icon not saved:', error);
    return false;
  }
  setCurrentIcon(icon);
  return true;
}

/**
 * Turns an uploaded image into a square PNG. The image is centred and fitted inside the square
 * on the menu bar colour, because iPhones show transparent areas as black.
 */
export async function prepareIcon(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That file couldn't be read as an image."));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = APP_ICON_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = brand.colors.surface;
    ctx.fillRect(0, 0, APP_ICON_SIZE, APP_ICON_SIZE);
    const scale = Math.min(APP_ICON_SIZE / img.naturalWidth, APP_ICON_SIZE / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (APP_ICON_SIZE - w) / 2, (APP_ICON_SIZE - h) / 2, w, h);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** The uploaded icon (null when the built-in one is used), plus save/reset */
export const useAppIcon = () => {
  const [icon, setIcon] = useState<string | null>(currentIcon);

  useEffect(() => {
    startAppIconSync();
    const sync = () => setIcon(currentIcon);
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  const setAppIcon = useCallback((value: string | null) => saveIcon(value), []);
  return { icon, setAppIcon };
};
