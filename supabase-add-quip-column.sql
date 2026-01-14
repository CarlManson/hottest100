-- Add quip column to countdown_results table
ALTER TABLE countdown_results ADD COLUMN quip TEXT;

-- If you want to populate existing entries with their quips, you'll need to do that manually
-- or re-enter them through the app
