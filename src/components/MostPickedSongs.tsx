import React, { useMemo } from 'react';
import type { FamilyMember, Song } from '../types';

interface MostPickedSongsProps {
  songs: Song[];
  familyMembers: FamilyMember[];
  limit?: number;
}

export const MostPickedSongs: React.FC<MostPickedSongsProps> = ({ songs, familyMembers, limit = 10 }) => {
  const ranked = useMemo(() => {
    const pickers = new Map<string, string[]>();
    for (const member of familyMembers) {
      for (const vote of member.votes) {
        const names = pickers.get(vote.songId) ?? [];
        names.push(member.name);
        pickers.set(vote.songId, names);
      }
    }
    return [...pickers.entries()]
      .map(([songId, names]) => ({ song: songs.find(s => s.id === songId), names }))
      .filter((entry): entry is { song: Song; names: string[] } => !!entry.song)
      .sort((a, b) => b.names.length - a.names.length || a.song.title.localeCompare(b.song.title))
      .slice(0, limit);
  }, [songs, familyMembers, limit]);

  if (ranked.length === 0) return null;

  const memberCount = familyMembers.length;

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-primary-200 mt-6">
      <h3 className="text-xl sm:text-2xl font-bold mb-1 text-gray-800">🔥 Crowd Favourites</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">The songs picked by the most people in the group</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {ranked.map(({ song, names }, index) => (
          <div key={song.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-gray-50">
            <div className="font-black text-primary-500 w-6 text-center flex-shrink-0">{index + 1}</div>
            {song.thumbnail && (
              <img src={song.thumbnail} alt="" loading="lazy" className="w-10 h-10 rounded object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 truncate" title={names.join(', ')}>
                {song.artist} · {names.join(', ')}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-sm sm:text-base text-gray-800">{names.length}</div>
              <div className="text-[10px] text-gray-500">of {memberCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
