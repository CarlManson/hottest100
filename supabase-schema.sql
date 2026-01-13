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

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE countdown_results;
ALTER PUBLICATION supabase_realtime ADD TABLE member_profiles;
