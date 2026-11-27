import { authHeader } from './auth';
import type { TriplejSong } from './triplejMatch';

export interface TriplejCountdown {
  source: string | null;
  fetchedAt: string;
  songs: TriplejSong[];
  tried: { url: string; status: number; count: number; note?: string }[];
}

/** triple j's latest list for one countdown, via the triplej-countdown edge function */
export async function fetchTriplejCountdown(list: '1-100' | '101-200', year: string): Promise<TriplejCountdown> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Supabase configuration missing');

  const response = await fetch(`${supabaseUrl}/functions/v1/triplej-countdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: await authHeader() },
    body: JSON.stringify({ list, year }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) {
    throw new Error(data?.error ?? (response.status === 404 ? 'The triplej-countdown function is not deployed yet' : `triple j check failed (${response.status})`));
  }
  return data as TriplejCountdown;
}
