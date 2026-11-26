import { supabase } from '../lib/supabase';

// Login helpers shared by AuthContext and the edge function calls. See AuthContext.tsx.

export type Role = 'admin' | 'host';

/** Domain added to a bare username, so "host" signs in as host@fairest100.au */
export const LOGIN_EMAIL_DOMAIN = 'fairest100.au';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  host: 'Host',
};

export const usernameToEmail = (username: string): string => {
  const trimmed = username.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : `${trimmed}@${LOGIN_EMAIL_DOMAIN}`;
};

export const isRole = (value: unknown): value is Role => value === 'admin' || value === 'host';

/** Bearer token for edge function calls: the signed-in user's, else the public key */
export async function authHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return `Bearer ${data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`;
}
