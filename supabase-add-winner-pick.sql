-- Pick the winner: each member can name the song they reckon finishes #1 for a 50 point bonus.
-- The pick lives on the member, so it is per season (cleared with members on Archive & Reset).
-- Run in the Supabase SQL Editor on an existing project. Safe to re-run.

ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS winner_song_id UUID REFERENCES songs(id) ON DELETE SET NULL;
