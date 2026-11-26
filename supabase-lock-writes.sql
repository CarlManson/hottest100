-- Step 2 of 2: only the Admin and Host can change data
--
-- Run this AFTER supabase-add-roles.sql, after the new app version is live, and once you've
-- checked both logins work. Until now every table let anyone with the site's public key write.
--
-- After this:
--   * Everyone can still READ everything (home page, TV mode, fairest100.au/tv, live updates).
--   * Admin + Host can change: mates, picks, profiles, parties, countdown results, countdown date.
--   * Admin only: songs, archives, app icon and any other setting.
--
-- Undo with supabase-unlock-writes.sql. Safe to run more than once.

BEGIN;

-- Admin only
DROP POLICY IF EXISTS "Allow all operations on songs" ON songs;
DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
DROP POLICY IF EXISTS "Admin can change songs" ON songs;
CREATE POLICY "Anyone can read songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Admin can change songs" ON songs FOR ALL TO authenticated
  USING (public.app_role() = 'admin') WITH CHECK (public.app_role() = 'admin');

DROP POLICY IF EXISTS "Allow all operations on archives" ON archives;
DROP POLICY IF EXISTS "Anyone can read archives" ON archives;
DROP POLICY IF EXISTS "Admin can change archives" ON archives;
CREATE POLICY "Anyone can read archives" ON archives FOR SELECT USING (true);
CREATE POLICY "Admin can change archives" ON archives FOR ALL TO authenticated
  USING (public.app_role() = 'admin') WITH CHECK (public.app_role() = 'admin');

-- Admin + Host
DROP POLICY IF EXISTS "Allow all operations on family_members" ON family_members;
DROP POLICY IF EXISTS "Anyone can read family_members" ON family_members;
DROP POLICY IF EXISTS "Admin and Host can change family_members" ON family_members;
CREATE POLICY "Anyone can read family_members" ON family_members FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change family_members" ON family_members FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
DROP POLICY IF EXISTS "Admin and Host can change votes" ON votes;
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change votes" ON votes FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

DROP POLICY IF EXISTS "Allow all operations on countdown_results" ON countdown_results;
DROP POLICY IF EXISTS "Anyone can read countdown_results" ON countdown_results;
DROP POLICY IF EXISTS "Admin and Host can change countdown_results" ON countdown_results;
CREATE POLICY "Anyone can read countdown_results" ON countdown_results FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change countdown_results" ON countdown_results FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

DROP POLICY IF EXISTS "Allow all operations on member_profiles" ON member_profiles;
DROP POLICY IF EXISTS "Anyone can read member_profiles" ON member_profiles;
DROP POLICY IF EXISTS "Admin and Host can change member_profiles" ON member_profiles;
CREATE POLICY "Anyone can read member_profiles" ON member_profiles FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change member_profiles" ON member_profiles FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

DROP POLICY IF EXISTS "Allow all operations on groups" ON groups;
DROP POLICY IF EXISTS "Anyone can read groups" ON groups;
DROP POLICY IF EXISTS "Admin and Host can change groups" ON groups;
CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change groups" ON groups FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

DROP POLICY IF EXISTS "Allow all operations on group_members" ON group_members;
DROP POLICY IF EXISTS "Anyone can read group_members" ON group_members;
DROP POLICY IF EXISTS "Admin and Host can change group_members" ON group_members;
CREATE POLICY "Anyone can read group_members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change group_members" ON group_members FOR ALL TO authenticated
  USING (public.app_role() IN ('admin', 'host')) WITH CHECK (public.app_role() IN ('admin', 'host'));

-- Settings: Admin can change any; Host only the countdown date
DROP POLICY IF EXISTS "Allow all operations on app_settings" ON app_settings;
DROP POLICY IF EXISTS "Anyone can read app_settings" ON app_settings;
DROP POLICY IF EXISTS "Admin and Host can change app_settings" ON app_settings;
CREATE POLICY "Anyone can read app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admin and Host can change app_settings" ON app_settings FOR ALL TO authenticated
  USING (public.app_role() = 'admin' OR (public.app_role() = 'host' AND key = 'countdown_date'))
  WITH CHECK (public.app_role() = 'admin' OR (public.app_role() = 'host' AND key = 'countdown_date'));

COMMIT;

-- Check: every table should show one "Anyone can read" and one "can change" policy
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
