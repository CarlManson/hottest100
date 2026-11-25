import React, { useEffect, useRef, useState } from 'react';
import { useGroupView } from '../hooks/useGroupView';
import { Icon } from './icons/Icon';

interface GroupMenuProps {
  /** "hero" sits on the dark banner; "light" sits on a white page */
  variant?: 'hero' | 'light';
  className?: string;
}

/**
 * The selected group's name as a button that opens a menu of groups.
 * Hidden when no groups exist.
 */
export const GroupMenu: React.FC<GroupMenuProps> = ({ variant = 'hero', className = '' }) => {
  const { groups, selectedGroup, selectGroup } = useGroupView();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (groups.length === 0) return null;

  const label = selectedGroup ? `${selectedGroup.emoji ? `${selectedGroup.emoji} ` : ''}${selectedGroup.name}` : 'All members';

  const buttonClass =
    variant === 'hero'
      ? 'group-menu-button text-sm sm:text-base font-medium text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-sm'
      : 'group-menu-button text-sm sm:text-base font-semibold text-gray-800 bg-white ring-1 ring-gray-200 hover:ring-primary-300';

  const choose = (group: (typeof groups)[number] | null) => {
    selectGroup(group);
    setOpen(false);
  };

  const item = (active: boolean) =>
    `group-menu-item w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-semibold transition ${
      active ? 'bg-primary-500 text-white' : 'text-gray-800 hover:bg-primary-50'
    }`;

  return (
    <div ref={ref} className={`group-menu relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${buttonClass} inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition`}
      >
        {label}
        <svg className={`w-[0.7em] h-[0.7em] transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={`group-menu-list absolute z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl overflow-hidden text-base normal-case tracking-normal ${
            variant === 'hero' ? 'left-1/2 -translate-x-1/2' : 'left-0'
          }`}
        >
          <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Show leaderboard for</p>
          <button role="menuitemradio" aria-checked={!selectedGroup} onClick={() => choose(null)} className={item(!selectedGroup)}>
            <span>All members</span>
            {!selectedGroup && <Icon name="check" />}
          </button>
          {groups.map(group => {
            const active = selectedGroup?.id === group.id;
            return (
              <button key={group.id} role="menuitemradio" aria-checked={active} onClick={() => choose(group)} className={item(active)}>
                <span>
                  {group.emoji && <span className="mr-1">{group.emoji}</span>}
                  {group.name}
                  <span className="ml-1.5 opacity-60">{group.memberIds.length}</span>
                </span>
                {active && <Icon name="check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
