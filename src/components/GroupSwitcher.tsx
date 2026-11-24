import React from 'react';
import { useGroupView } from '../hooks/useGroupView';

interface GroupSwitcherProps {
  className?: string;
}

/** "All members · Fair Family · Work" chips; hidden when no groups exist */
export const GroupSwitcher: React.FC<GroupSwitcherProps> = ({ className = '' }) => {
  const { groups, selectedGroup, selectGroup } = useGroupView();
  if (groups.length === 0) return null;

  const chip = (active: boolean) =>
    `group-chip px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
      active
        ? 'bg-primary-500 text-white shadow-md'
        : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-primary-300 hover:text-primary-700'
    }`;

  return (
    <nav aria-label="Show leaderboard for" className={`group-switcher flex gap-2 overflow-x-auto pb-1 ${className}`}>
      <button onClick={() => selectGroup(null)} className={chip(!selectedGroup)} aria-pressed={!selectedGroup}>
        All members
      </button>
      {groups.map(group => (
        <button
          key={group.id}
          onClick={() => selectGroup(group)}
          className={chip(selectedGroup?.id === group.id)}
          aria-pressed={selectedGroup?.id === group.id}
        >
          {group.emoji && <span className="mr-1">{group.emoji}</span>}
          {group.name}
          <span className="ml-1.5 opacity-60">{group.memberIds.length}</span>
        </button>
      ))}
    </nav>
  );
};
