import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FamilyMember } from '../types';

export const VotingInterface: React.FC = () => {
  const { songs, familyMembers, addFamilyMember, updateFamilyMember, removeFamilyMember } = useApp();
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;

    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      votes: [],
    };

    addFamilyMember(newMember);
    setNewMemberName('');
  };

  const handleToggleSong = (songId: string) => {
    if (!selectedMember) return;

    const existingVote = selectedMember.votes.find((v) => v.songId === songId);

    if (existingVote) {
      // Remove vote
      const updatedMember = {
        ...selectedMember,
        votes: selectedMember.votes.filter((v) => v.songId !== songId),
      };
      updateFamilyMember(updatedMember);
      setSelectedMember(updatedMember);
    } else {
      // Add vote if less than 10
      if (selectedMember.votes.length < 10) {
        const updatedMember = {
          ...selectedMember,
          votes: [
            ...selectedMember.votes,
            { songId, rank: selectedMember.votes.length + 1 },
          ],
        };
        updateFamilyMember(updatedMember);
        setSelectedMember(updatedMember);
      }
    }
  };

  const handleReorderVote = (voteIndex: number, direction: 'up' | 'down') => {
    if (!selectedMember) return;

    const votes = [...selectedMember.votes];
    const newIndex = direction === 'up' ? voteIndex - 1 : voteIndex + 1;

    if (newIndex < 0 || newIndex >= votes.length) return;

    [votes[voteIndex], votes[newIndex]] = [votes[newIndex], votes[voteIndex]];

    // Update ranks
    votes.forEach((vote, index) => {
      vote.rank = index + 1;
    });

    const updatedMember = {
      ...selectedMember,
      votes,
    };

    updateFamilyMember(updatedMember);
    setSelectedMember(updatedMember);
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSongIds = selectedMember?.votes.map((v) => v.songId) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-4xl font-black mb-6 text-gray-800">Family Voting</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-orange-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Family Members</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter name"
            className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold"
          >
            Add Member
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMember(member)}
                className={`px-4 py-2 rounded-lg transition font-bold ${
                  selectedMember?.id === member.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {member.name} ({member.votes.length}/10)
              </button>
              <button
                onClick={() => {
                  removeFamilyMember(member.id);
                  if (selectedMember?.id === member.id) {
                    setSelectedMember(null);
                  }
                }}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Family Members' Votes */}
      {familyMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Everyone's Votes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{member.name}</h4>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    {member.votes.length}/10
                  </span>
                </div>
                {member.votes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No votes yet</p>
                ) : (
                  <div className="space-y-2">
                    {member.votes.map((vote) => {
                      const song = songs.find((s) => s.id === vote.songId);
                      if (!song) return null;
                      return (
                        <div
                          key={vote.songId}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex-shrink-0">
                            {vote.rank}
                          </div>
                          {song.thumbnail && (
                            <img
                              src={song.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{song.title}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="truncate">{song.artist}</span>
                              {song.isAustralian && (
                                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                  AUS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setSelectedMember(member)}
                  className="w-full mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Edit Votes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {selectedMember.name}'s Top 10
            </h3>
            {selectedMember.votes.length === 0 ? (
              <p className="text-gray-500">No votes yet</p>
            ) : (
              <div className="space-y-2">
                {selectedMember.votes.map((vote, index) => {
                  const song = songs.find((s) => s.id === vote.songId);
                  if (!song) return null;
                  return (
                    <div
                      key={vote.songId}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleReorderVote(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleReorderVote(index, 'down')}
                          disabled={index === selectedMember.votes.length - 1}
                          className="text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                        >
                          ▼
                        </button>
                      </div>
                      <div className="font-bold text-lg w-8">{vote.rank}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{song.title}</div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                      <button
                        onClick={() => handleToggleSong(vote.songId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Select Songs</h3>
            <input
              type="text"
              placeholder="Search songs..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[600px] overflow-y-auto grid grid-cols-1 gap-3">
              {filteredSongs.map((song) => {
                const isSelected = selectedSongIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    className={`relative flex gap-3 p-3 rounded-xl transition shadow-sm border-2 ${
                      isSelected
                        ? 'bg-green-50 border-green-500'
                        : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    {song.thumbnail && (
                      <img
                        src={song.thumbnail}
                        alt={`${song.title} artwork`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="font-bold text-gray-900 truncate">{song.title}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <span className="truncate">{song.artist}</span>
                        {song.isAustralian && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                            AUS
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSong(song.id)}
                      className={`absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition flex-shrink-0 ${
                        isSelected
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
