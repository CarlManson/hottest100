import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { groupSlug } from '../utils/groups';
import type { Group } from '../types';

type Draft = { id?: string; name: string; emoji: string; memberIds: string[] };

const emptyDraft: Draft = { name: '', emoji: '', memberIds: [] };

/** Party management on the Mates page (the `voting` tab) (stored in the `groups` tables) */
export const PartyManager: React.FC = () => {
  const { groups, groupsAvailable, familyMembers, saveGroup, removeGroup } = useApp();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');

  if (!groupsAvailable) {
    return (
      <div className="party-manager bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-sm text-yellow-900">
        <h3 className="text-lg font-bold mb-2">Parties aren't set up yet</h3>
        <p>Run <code className="bg-yellow-100 px-1 rounded">supabase-add-groups.sql</code> in the Supabase SQL Editor, then reload this page.</p>
      </div>
    );
  }

  const members = [...familyMembers].sort((a, b) => a.name.localeCompare(b.name));
  const memberName = (id: string) => familyMembers.find(m => m.id === id)?.name;

  const startEdit = (group: Group) =>
    setDraft({ id: group.id, name: group.name, emoji: group.emoji ?? '', memberIds: [...group.memberIds] });

  const toggleMember = (id: string) =>
    setDraft(d => d && {
      ...d,
      memberIds: d.memberIds.includes(id) ? d.memberIds.filter(m => m !== id) : [...d.memberIds, id],
    });

  const handleSave = async () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) return setError('Give the party a name');
    const clash = groups.find(g => g.id !== draft.id && groupSlug(g.name) === groupSlug(name));
    if (clash) return setError(`There's already a party called "${clash.name}"`);

    setSaving(true);
    setError('');
    try {
      await saveGroup({ id: draft.id, name, emoji: draft.emoji, memberIds: draft.memberIds });
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the party. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: Group) => {
    if (!window.confirm(`Delete "${group.name}"? Mates and their votes are not affected.`)) return;
    try {
      await removeGroup(group.id);
      if (draft?.id === group.id) setDraft(null);
    } catch {
      alert('Could not delete the party. Please try again.');
    }
  };

  const copyLink = async (group: Group, tv: boolean) => {
    const url = `${window.location.origin}${window.location.pathname}?group=${groupSlug(group.name)}#${tv ? 'tv' : 'home'}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(`${group.id}-${tv}`);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <div className="party-manager mb-4 sm:mb-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-primary-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Parties</h3>
          {!draft && (
            <button
              onClick={() => { setDraft({ ...emptyDraft }); setError(''); }}
              className="px-4 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition text-sm"
            >
              + New party
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Everyone can switch the home page, leaderboard and TV mode to a party. Mates can be in more than one party.
        </p>

        {draft && (
          <div className="border-2 border-primary-200 rounded-lg p-4 mb-6 space-y-4 bg-primary-50/40">
            <div className="flex gap-3">
              <label className="w-20">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Emoji</span>
                <input
                  value={draft.emoji}
                  onChange={e => setDraft({ ...draft, emoji: e.target.value })}
                  maxLength={4}
                  placeholder="🏡"
                  className="w-full p-2 border-2 border-gray-200 rounded-lg text-center focus:border-primary-500 focus:outline-none"
                />
              </label>
              <label className="flex-1">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Name</span>
                <input
                  value={draft.name}
                  onChange={e => { setDraft({ ...draft, name: e.target.value }); setError(''); }}
                  placeholder="e.g. The Fair Family"
                  autoFocus
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-xs font-semibold text-gray-700 mb-2">
                Mates ({draft.memberIds.length} selected)
              </legend>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">Add mates above first.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members.map(m => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                        draft.memberIds.includes(m.id) ? 'bg-primary-100 ring-1 ring-primary-300' : 'bg-white ring-1 ring-gray-200 hover:ring-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={draft.memberIds.includes(m.id)}
                        onChange={() => toggleMember(m.id)}
                        className="accent-primary-500"
                      />
                      <span className="truncate">{m.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
              >
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create party'}
              </button>
              <button
                onClick={() => { setDraft(null); setError(''); }}
                className="px-5 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {groups.length === 0 && !draft ? (
          <p className="text-sm text-gray-500">No parties yet. Make one to give a household, workplace or friend group its own leaderboard.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map(group => (
              <li key={group.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900">
                      {group.emoji && <span className="mr-1.5">{group.emoji}</span>}
                      {group.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      {group.memberIds.length === 0
                        ? 'No members yet'
                        : group.memberIds.map(memberName).filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <button onClick={() => copyLink(group, false)} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold">
                      {copied === `${group.id}-false` ? 'Copied!' : 'Copy link'}
                    </button>
                    <button onClick={() => copyLink(group, true)} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold">
                      {copied === `${group.id}-true` ? 'Copied!' : 'Copy TV link'}
                    </button>
                    <button onClick={() => { startEdit(group); setError(''); }} className="px-3 py-1.5 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 font-semibold">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(group)} className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold">
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
