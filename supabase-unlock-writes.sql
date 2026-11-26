-- Undo supabase-lock-writes.sql: go back to "anyone with the site's public key can change anything".
-- Only for emergencies (for example if the new logins stop working on countdown day).
-- Run supabase-lock-writes.sql again once things are sorted. Logins and roles are left alone.

BEGIN;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['songs', 'archives', 'family_members', 'votes', 'countdown_results',
                           'member_profiles', 'groups', 'group_members', 'app_settings'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Anyone can read ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin can change ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin and Host can change ' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Allow all operations on ' || t, t);
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true)', 'Allow all operations on ' || t, t);
  END LOOP;
END $$;

COMMIT;
