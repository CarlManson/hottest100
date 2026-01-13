export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  isAustralian?: boolean;
}

export interface Vote {
  songId: string;
  rank: number; // 1-10
}

export interface FamilyMember {
  id: string;
  name: string;
  votes: Vote[];
}

export interface CountdownResult {
  songId: string;
  position: number; // 1-100 for Hottest 100, 101-200 for extended
}

export interface MemberProfile {
  id: string;
  familyMemberId: string;
  label: string | null;
  musicTasteDescription: string | null;
  performanceCommentary: string | null;
  lastLabelRegeneration: Date | null;
  lastCommentaryUpdate: Date | null;
  lastMusicTasteUpdate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  songs: Song[];
  familyMembers: FamilyMember[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
  profiles: MemberProfile[];
}
