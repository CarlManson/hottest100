-- Triple J Hottest 100 Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  thumbnail TEXT,
  is_australian BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case/whitespace-insensitive duplicate protection
CREATE UNIQUE INDEX idx_songs_artist_title_unique
  ON songs (lower(trim(artist)), lower(trim(title)));

-- Family members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table (many-to-many between family_members and songs)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, song_id),
  UNIQUE(family_member_id, rank)
);

-- Countdown results table
CREATE TABLE countdown_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 200),
  type TEXT NOT NULL CHECK (type IN ('hottest100', 'hottest200')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position, type),
  UNIQUE(song_id, type)
);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdown_results ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on songs" ON songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on countdown_results" ON countdown_results FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_votes_family_member ON votes(family_member_id);
CREATE INDEX idx_votes_song ON votes(song_id);
CREATE INDEX idx_countdown_results_type ON countdown_results(type);
CREATE INDEX idx_countdown_results_position ON countdown_results(position);

-- Member profiles table (AI-generated profiles with timestamps)
CREATE TABLE member_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  label TEXT,
  music_taste_description TEXT,
  performance_commentary TEXT,
  last_label_regeneration TIMESTAMPTZ,
  last_commentary_update TIMESTAMPTZ,
  last_music_taste_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id)
);

-- Enable Row Level Security for member_profiles
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for member_profiles
CREATE POLICY "Allow all operations on member_profiles" ON member_profiles FOR ALL USING (true) WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_member_profiles_family_member ON member_profiles(family_member_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER member_profiles_updated_at
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_member_profiles_updated_at();

-- Archives table (stores completed years)
CREATE TABLE archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB NOT NULL,
  UNIQUE(year)
);

-- Enable Row Level Security for archives
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- Create policy for archives
CREATE POLICY "Allow all operations on archives" ON archives FOR ALL USING (true) WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_archives_year ON archives(year);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE countdown_results;
ALTER PUBLICATION supabase_realtime ADD TABLE member_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE archives;

-- Shared app settings (countdown start date etc.)
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;

-- Member groups for filtered leaderboards
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, family_member_id)
);
CREATE INDEX idx_group_members_member ON group_members(family_member_id);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_members" ON group_members FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;

-- Winner pick: the song each member reckons will finish #1 (50 point bonus)
ALTER TABLE family_members
  ADD COLUMN winner_song_id UUID REFERENCES songs(id) ON DELETE SET NULL;
