-- Shared app settings (e.g. the countdown start date) so every visitor sees the same timer.
-- Run in the Supabase SQL Editor on an existing project. Safe to re-run.

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on app_settings" ON app_settings;
CREATE POLICY "Allow all operations on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
