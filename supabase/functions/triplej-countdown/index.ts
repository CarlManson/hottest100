import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Reads triple j's live countdown so the Countdown page can auto-fill results.
// The browser can't fetch abc.net.au itself (no CORS), so this function fetches
// the public page and returns the songs from its __NEXT_DATA__ JSON.
// No AI and no secrets: it only reads a public page, and only for a signed-in Admin or Host.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const ABC_BASE = 'https://www.abc.net.au/triplej/countdown/hottest100';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

async function callerHasRole(req: Request): Promise<boolean> {
  const authorization = req.headers.get('Authorization');
  if (!authorization || !SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.rpc('app_role');
  return !error && (data === 'admin' || data === 'host');
}

interface TriplejSong {
  position: number;
  artist: string;
  title: string;
  image?: string;
}

// deno-lint-ignore no-explicit-any
function findSongCountdowns(node: any, found: any[] = []): any[] {
  if (!node || typeof node !== 'object') return found;
  if (node.component === 'SongCountdown' && node.componentProps) found.push(node.componentProps);
  for (const value of Object.values(node)) findSongCountdowns(value, found);
  return found;
}

async function readPage(path: string, year: string) {
  const url = `${ABC_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fairest100/1.0)', Accept: 'text/html' },
  });
  if (!res.ok) return { url, status: res.status, songs: [] as TriplejSong[] };
  const html = await res.text();

  // The main page shows whichever year is current, so only trust it when it's the year asked for
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const yearMatches = !/\/hottest100\/\d{2}/.test(canonical) || canonical.includes(`/hottest100/${year}`);
  const titleYear = html.match(/<title[^>]*>[^<]*?(20\d{2})/)?.[1];
  const titleMatches = !titleYear || titleYear.slice(2) === year;
  if (!yearMatches || !titleMatches) return { url, status: res.status, songs: [], note: 'different year' };

  const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!raw) return { url, status: res.status, songs: [], note: 'no page data' };

  const songs: TriplejSong[] = [];
  for (const props of findSongCountdowns(JSON.parse(raw))) {
    // deno-lint-ignore no-explicit-any
    for (const s of (props.songsPrepared ?? []) as any[]) {
      if (typeof s?.position !== 'number' || !s.title || !s.artist) continue;
      songs.push({ position: s.position, artist: String(s.artist), title: String(s.title), image: s.cardImagePrepared?.imgSrc });
    }
  }
  return { url, status: res.status, songs };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!(await callerHasRole(req))) return json({ error: 'Log in as the Admin or Host to auto-fill results' }, 401);

    const body = await req.json().catch(() => ({}));
    const list: '1-100' | '101-200' = body.list === '101-200' ? '101-200' : '1-100';
    const year = String(body.year ?? '');
    if (!/^\d{2}$/.test(year)) return json({ error: 'year must be two digits, e.g. "26"' }, 400);

    const [min, max] = list === '1-100' ? [1, 100] : [101, 200];
    // Year page first, then the year's landing page and the main page (which may carry the live list)
    const paths = [`/${year}/${list}`, `/${year}`, ''];
    const tried: { url: string; status: number; count: number; note?: string }[] = [];

    for (const path of paths) {
      const page = await readPage(path, year);
      const songs = page.songs.filter((s) => s.position >= min && s.position <= max);
      tried.push({ url: page.url, status: page.status, count: songs.length, note: (page as { note?: string }).note });
      if (songs.length > 0) {
        const unique = [...new Map(songs.map((s) => [s.position, s])).values()].sort((a, b) => b.position - a.position);
        return json({ source: page.url, fetchedAt: new Date().toISOString(), songs: unique, tried });
      }
    }
    return json({ source: null, fetchedAt: new Date().toISOString(), songs: [], tried });
  } catch (error) {
    console.error('triplej-countdown error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
