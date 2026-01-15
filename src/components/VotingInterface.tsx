import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FamilyMember } from '../types';
import { LazyImage } from './LazyImage';

export const VotingInterface: React.FC = () => {
  const {
    songs,
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    generateLabelAndTaste,
    generateFullProfile,
    isGeneratingProfiles,
    canRegenerateLabel,
    canRegenerateFullProfile,
    getProfileForMember
  } = useApp();
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editingName, setEditingName] = useState('');

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

  const handleStartEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setEditingName(member.name);
  };

  const handleSaveEdit = () => {
    if (!editingMember) return;
    if (editingName.trim() && editingName !== editingMember.name) {
      const updatedMember = {
        ...editingMember,
        name: editingName.trim(),
      };
      updateFamilyMember(updatedMember);
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember(updatedMember);
      }
    }
    setEditingMember(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditingName('');
  };

  const handleGenerateNickname = async () => {
    if (!editingMember) return;

    try {
      await generateLabelAndTaste(editingMember.id);
      // Success - profile will update via real-time subscription
    } catch (error) {
      console.error('Failed to generate nickname:', error);
      // Error is already shown via profileError in context
    }
  };

  const handleGenerateProfile = async () => {
    if (!editingMember) return;

    try {
      await generateFullProfile(editingMember.id);
      // Success - profile will update via real-time subscription
    } catch (error) {
      console.error('Failed to generate profile:', error);
      // Error is already shown via profileError in context
    }
  };

  const handleDeleteMember = (member: FamilyMember) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This will remove all their votes.`
    );
    if (confirmed) {
      removeFamilyMember(member.id);
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
      }
    }
  };

  const handleToggleSong = (songId: string) => {
    if (!selectedMember) return;

    const existingVote = selectedMember.votes.find((v) => v.songId === songId);

    if (existingVote) {
      // Remove vote and re-rank remaining votes
      const filteredVotes = selectedMember.votes.filter((v) => v.songId !== songId);
      const rerankedVotes = filteredVotes
        .sort((a, b) => a.rank - b.rank)
        .map((vote, index) => ({ ...vote, rank: index + 1 }));

      const updatedMember = {
        ...selectedMember,
        votes: rerankedVotes,
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

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSongIds = selectedMember?.votes.map((v) => v.songId) || [];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 hidden sm:block">Voting</h2>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-orange-200">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Mates</h3>
        <div className="flex gap-2 mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Enter name"
            className="flex-1 p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm sm:text-base"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            className="bg-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-600 transition font-bold text-sm sm:text-base whitespace-nowrap"
          >
            Add Member
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSelectedMember(member)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition font-bold text-sm sm:text-base ${
                  selectedMember?.id === member.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {member.name} ({member.votes.length}/10)
              </button>
              <button
                onClick={() => handleStartEdit(member)}
                className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-base"
                title="Manage Member"
              >
                ✎
              </button>
              <button
                onClick={() => handleDeleteMember(member)}
                className="text-red-600 hover:text-red-800 font-bold text-lg sm:text-xl"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedMember && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select Songs</h3>
            <input
              type="text"
              placeholder="Search songs..."
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-48 sm:max-h-[600px] overflow-y-auto space-y-1.5 sm:space-y-2">
              {filteredSongs.map((song) => {
                const isSelected = selectedSongIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => handleToggleSong(song.id)}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {song.thumbnail && (
                      <LazyImage
                        src={song.thumbnail}
                        alt={`${song.title} artwork`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                        <span className="truncate">{song.artist}</span>
                        {song.isAustralian && (
                          <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                            AUS
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
              {selectedMember.name}'s Top 10
            </h3>
            {selectedMember.votes.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No votes yet</p>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {selectedMember.votes.map((vote) => {
                  const song = songs.find((s) => s.id === vote.songId);
                  if (!song) return null;
                  return (
                    <div
                      key={vote.songId}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                      {song.thumbnail && (
                        <LazyImage
                          src={song.thumbnail}
                          alt={`${song.title} artwork`}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm truncate text-white">{song.title}</div>
                        <div className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                          <span className="truncate">{song.artist}</span>
                          {song.isAustralian && (
                            <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                              AUS
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSong(vote.songId)}
                        className="text-red-400 hover:text-red-300 px-1 sm:px-2 text-lg sm:text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Mates' Votes */}
      {familyMembers.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Everyone's Votes</h3>

          {/* Mobile Accordion View */}
          <div className="md:hidden space-y-2">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                >
                  <h4 className="text-lg font-bold text-gray-800">{member.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-bold text-xs">
                      {member.votes.length}/10
                    </span>
                    <span className="text-gray-500 text-xl">
                      {expandedMember === member.id ? '−' : '+'}
                    </span>
                  </div>
                </button>
                {expandedMember === member.id && (
                  <div className="p-4 pt-0 border-t border-gray-100">
                    {member.votes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 text-sm">No votes yet</p>
                    ) : (
                      <div className="space-y-1.5 mb-3">
                        {member.votes.map((vote) => {
                          const song = songs.find((s) => s.id === vote.songId);
                          if (!song) return null;
                          return (
                            <div
                              key={vote.songId}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              {song.thumbnail && (
                                <LazyImage
                                  src={song.thumbnail}
                                  alt={`${song.title} artwork`}
                                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs truncate">{song.title}</div>
                                <div className="text-[10px] text-gray-600 flex items-center gap-1">
                                  <span className="truncate">{song.artist}</span>
                                  {song.isAustralian && (
                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1 py-0.5 rounded flex-shrink-0">
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
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm"
                    >
                      Edit Votes
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-orange-200"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">{member.name}</h4>
                  <span className="bg-orange-500 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold text-xs sm:text-sm">
                    {member.votes.length}/10
                  </span>
                </div>
                {member.votes.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No votes yet</p>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    {member.votes.map((vote) => {
                      const song = songs.find((s) => s.id === vote.songId);
                      if (!song) return null;
                      return (
                        <div
                          key={vote.songId}
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          {song.thumbnail && (
                            <LazyImage
                              src={song.thumbnail}
                              alt={`${song.title} artwork`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs sm:text-sm truncate">{song.title}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                              <span className="truncate">{song.artist}</span>
                              {song.isAustralian && (
                                <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
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
                  className="w-full mt-3 sm:mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm sm:text-base"
                >
                  Edit Votes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (() => {
        const profile = getProfileForMember(editingMember.id);
        const canGenerateLabel = canRegenerateLabel(editingMember.id);
        const canGenerateProfile = canRegenerateFullProfile(editingMember.id);

        return (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCancelEdit}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold">Manage Member</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Rename Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Rename Member</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm sm:text-base"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                  >
                    Save Name
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Current Profile Display */}
              {profile && (profile.label || profile.musicTasteDescription) && (
                <div className="mb-6 border-t pt-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Current Profile</label>
                  {profile.label && (
                    <div className="mb-2">
                      <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {profile.label}
                      </span>
                    </div>
                  )}
                  {profile.musicTasteDescription && (
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      {profile.musicTasteDescription}
                    </p>
                  )}
                  {profile.performanceCommentary && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">
                      {profile.performanceCommentary}
                    </p>
                  )}
                </div>
              )}

              {/* AI Profile Generation Section */}
              {editingMember.votes.length > 0 && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">AI Profile Generation</label>
                  <div className="space-y-2">
                    {!isGeneratingProfiles && canGenerateLabel && (
                      <button
                        onClick={handleGenerateNickname}
                        className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      >
                        🏷️ Re/generate Nickname
                      </button>
                    )}
                    {!canGenerateLabel && !isGeneratingProfiles && (
                      <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        🏷️ Nickname cooldown active (24h since last generation)
                      </p>
                    )}

                    {!isGeneratingProfiles && canGenerateProfile && (
                      <button
                        onClick={handleGenerateProfile}
                        className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      >
                        ✨ Re/generate Profile
                      </button>
                    )}
                    {!canGenerateProfile && !isGeneratingProfiles && (
                      <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        ✨ Profile cooldown active (24h since last generation)
                      </p>
                    )}

                    {isGeneratingProfiles && (
                      <div className="text-center py-3">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <p className="text-sm text-gray-600 mt-2">Generating...</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      <strong>Nickname:</strong> Generates label + music taste description<br />
                      <strong>Profile:</strong> Generates label + music taste + performance commentary
                    </p>
                  </div>
                </div>
              )}

              {editingMember.votes.length === 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 italic text-center">
                    Add some votes to enable AI profile generation
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
