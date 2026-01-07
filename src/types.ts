export interface Song {
  id: string;
  title: string;
  artist: string;
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

export interface AppState {
  songs: Song[];
  familyMembers: FamilyMember[];
  countdownResults: CountdownResult[];
  hottest200Results: CountdownResult[];
}
