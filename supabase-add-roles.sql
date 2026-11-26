-- Step 1 of 2: Admin and Host logins
--
-- Before running this, in the Supabase dashboard:
--   1. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up"
--      (leave the Email provider on).
--   2. Authentication → Users → Add user → Create new user, twice, ticking "Auto Confirm User":
--        admin@fairest100.au   (log in with username "admin")
--        host@fairest100.au    (log in with username "host")
--      Use long random passwords. The addresses don't need to be real inboxes.
--      Using other addresses? Change them in the two INSERTs at the bottom.
--
-- Safe to run more than once. Nothing is locked down yet: that's supabase-lock-writes.sql.

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'host')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Each login can see its own role; nobody can change roles from the app
DROP POLICY IF EXISTS "Users read their own role" ON user_roles;
CREATE POLICY "Users read their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- The signed-in user's role ('admin', 'host') or NULL. Used by the app and by the write rules.
CREATE OR REPLACE FUNCTION public.app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.app_role() TO anon, authenticated;

-- Give the two logins their roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@fairest100.au'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

INSERT INTO user_roles (user_id, role)
SELECT id, 'host' FROM auth.users WHERE email = 'host@fairest100.au'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Check: should list both logins with their roles
SELECT u.email, r.role FROM user_roles r JOIN auth.users u ON u.id = r.user_id ORDER BY r.role;
