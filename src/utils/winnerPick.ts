import type { CountdownResult, FamilyMember, Song } from '../types';
import { getWinningSongId } from './scoring';

/**
 * Where a member's winner pick stands:
 * - none: no pick
 * - alive: not played yet, could still be #1
 * - won: it's the #1 song (+50)
 * - out: played at another position (or another song took #1)
 */
export type WinnerPickStatus = 'none' | 'alive' | 'won' | 'out';

export function getWinnerPickStatus(
  songId: string | undefined,
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): WinnerPickStatus {
  if (!songId) return 'none';
  const winner = getWinningSongId(countdownResults);
  if (winner === songId) return 'won';
  if (winner) return 'out';
  const played = [...countdownResults, ...hottest200Results].some((r) => r.songId === songId);
  return played ? 'out' : 'alive';
}

/** Where a pick that's out actually landed, if it charted at all */
export function getPickPosition(
  songId: string,
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): number | undefined {
  return [...countdownResults, ...hottest200Results].find((r) => r.songId === songId)?.position;
}

export interface TippedSong {
  song: Song;
  names: string[];
  status: WinnerPickStatus;
  position?: number;
}

/** Songs members picked to win, still-alive and winning picks first, then by number of backers */
export function getTippedSongs(
  members: FamilyMember[],
  songs: Song[],
  countdownResults: CountdownResult[],
  hottest200Results: CountdownResult[]
): TippedSong[] {
  const backers = new Map<string, string[]>();
  for (const member of members) {
    if (!member.winnerSongId) continue;
    backers.set(member.winnerSongId, [...(backers.get(member.winnerSongId) ?? []), member.name]);
  }
  const order: Record<WinnerPickStatus, number> = { won: 0, alive: 1, out: 2, none: 3 };
  return [...backers.entries()]
    .flatMap(([songId, names]) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) return [];
      return [{
        song,
        names,
        status: getWinnerPickStatus(songId, countdownResults, hottest200Results),
        position: getPickPosition(songId, countdownResults, hottest200Results),
      }];
    })
    .sort((a, b) =>
      order[a.status] - order[b.status] ||
      b.names.length - a.names.length ||
      a.song.title.localeCompare(b.song.title)
    );
}

/** Names of members whose winner pick is the #1 song */
export function getWinnerPickers(members: FamilyMember[], countdownResults: CountdownResult[]): string[] {
  const winner = getWinningSongId(countdownResults);
  if (!winner) return [];
  return members.filter((m) => m.winnerSongId === winner).map((m) => m.name);
}

/** "Sam", "Sam and Jo", "Sam, Jo and Alex" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
