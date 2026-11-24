import { describe, expect, it } from 'vitest';
import { findGroup, groupSlug, membersInGroup } from './groups';
import { getLeaderboard } from './scoring';
import type { FamilyMember, Group } from '../types';

const member = (id: string, songIds: string[]): FamilyMember => ({
  id,
  name: id,
  votes: songIds.map((songId, i) => ({ songId, rank: i + 1 })),
});

const members = [member('alex', ['a']), member('sam', ['b']), member('jo', ['c'])];
const family: Group = { id: 'g1', name: 'The Fair Family!', memberIds: ['sam', 'jo'] };

describe('groups', () => {
  it('slugs names for shareable links', () => {
    expect(groupSlug('The Fair Family!')).toBe('the-fair-family');
    expect(groupSlug('  Work  Colleagues ')).toBe('work-colleagues');
  });

  it('finds a group by slug or id, and falls back to everyone', () => {
    expect(findGroup([family], 'the-fair-family')).toBe(family);
    expect(findGroup([family], 'g1')).toBe(family);
    expect(findGroup([family], 'deleted-group')).toBeNull();
    expect(findGroup([family], null)).toBeNull();
  });

  it('filters members, with null meaning all members', () => {
    expect(membersInGroup(members, null)).toHaveLength(3);
    expect(membersInGroup(members, family).map(m => m.id)).toEqual(['sam', 'jo']);
  });

  it('ranks within the group without changing anyone’s score', () => {
    const results = [{ songId: 'a', position: 1 }, { songId: 'b', position: 50 }, { songId: 'c', position: 90 }];
    const overall = getLeaderboard(members, results, []);
    const inGroup = getLeaderboard(membersInGroup(members, family), results, []);
    expect(overall[0].member.id).toBe('alex');
    expect(inGroup.map(e => e.member.id)).toEqual(['sam', 'jo']);
    expect(inGroup[0].score).toBe(overall.find(e => e.member.id === 'sam')!.score);
  });
});
