import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isRole, usernameToEmail, type Role } from '../utils/auth';

/**
 * Logins and roles.
 *
 * Logins are Supabase Auth users (sign-ups off, created by hand in the dashboard).
 * Each one has a row in `user_roles` (see supabase-add-roles.sql) saying what it may do:
 *   - admin: everything
 *   - host:  mates, picks, parties, countdown results and the countdown date
 * The database enforces the same rules (supabase-lock-writes.sql), so hiding a screen
 * here is only for tidiness, never the actual protection.
 */
interface AuthContextType {
  /** False until the saved session (if any) has been checked */
  ready: boolean;
  role: Role | null;
  isAdmin: boolean;
  /** Signed in with any role (admin or host) */
  isSignedIn: boolean;
  /** Resolves to an error message, or null on success */
  signIn: (username: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchRole(): Promise<Role | null> {
  const { data, error } = await (supabase.rpc as unknown as (fn: string) => Promise<{ data: unknown; error: unknown }>)('app_role');
  if (error) {
    console.error('Could not read login role (has supabase-add-roles.sql been run?):', error);
    return null;
  }
  return isRole(data) ? data : null;
}

// Left over from the old shared login, which lived only in the browser
const clearLegacyLogin = () => {
  try {
    localStorage.removeItem('hottest100_auth');
    document.cookie = 'hottest100_session=; Max-Age=0; path=/';
  } catch {
    // Storage blocked: nothing to clear
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    clearLegacyLogin();
    let cancelled = false;

    const applySession = async (hasSession: boolean) => {
      const nextRole = hasSession ? await fetchRole() : null;
      if (cancelled) return;
      setRole(nextRole);
      setReady(true);
    };

    supabase.auth.getSession().then(({ data }) => applySession(!!data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Run outside the auth callback, as Supabase recommends
        setTimeout(() => applySession(!!session), 0);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) {
      return error.message === 'Invalid login credentials' ? 'Wrong username or password' : error.message;
    }
    const nextRole = await fetchRole();
    if (!nextRole) {
      await supabase.auth.signOut();
      return 'That login has no role yet. Add it to user_roles in Supabase.';
    }
    setRole(nextRole);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ ready, role, isAdmin: role === 'admin', isSignedIn: role !== null, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
