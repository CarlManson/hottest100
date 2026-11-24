import { useCallback, useSyncExternalStore } from 'react';
import { useApp } from '../context/AppContext';
import { findGroup, groupSlug, membersInGroup } from '../utils/groups';
import type { Group } from '../types';

const STORAGE_KEY = 'hottest100_group';
const CHANGE_EVENT = 'hottest100_group_change';

const readInitial = (): string | null => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('group');
    if (fromUrl !== null) return fromUrl || null;
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

let selectedKey: string | null = readInitial();

const subscribe = (callback: () => void) => {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
};

const setSelectedKey = (key: string | null) => {
  selectedKey = key;
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: selection still applies for this visit
  }
  // Keep the link shareable (TV screens read ?group= on load)
  const url = new URL(window.location.href);
  if (key) url.searchParams.set('group', key);
  else url.searchParams.delete('group');
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

/**
 * The group currently being viewed ("All members" when null) and the members to show.
 * Shared across components so the home page, breakdown modal and TV stay in sync.
 */
export function useGroupView() {
  const { groups, groupsAvailable, familyMembers } = useApp();
  const key = useSyncExternalStore(subscribe, () => selectedKey);

  // A stale or unknown key falls back to everyone
  const selectedGroup = groupsAvailable ? findGroup(groups, key) : null;
  const visibleMembers = membersInGroup(familyMembers, selectedGroup);

  const selectGroup = useCallback((group: Group | null) => {
    setSelectedKey(group ? groupSlug(group.name) : null);
  }, []);

  return { groups: groupsAvailable ? groups : [], selectedGroup, selectGroup, visibleMembers };
}
