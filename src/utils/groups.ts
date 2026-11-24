import type { FamilyMember, Group } from '../types';

export const groupSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Finds a group by slug (used in links) or id; null means "All members" */
export function findGroup(groups: Group[], key: string | null): Group | null {
  if (!key) return null;
  return groups.find(g => groupSlug(g.name) === key || g.id === key) ?? null;
}

export function membersInGroup(members: FamilyMember[], group: Group | null): FamilyMember[] {
  if (!group) return members;
  const ids = new Set(group.memberIds);
  return members.filter(m => ids.has(m.id));
}
