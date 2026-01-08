import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env file if it exists
config();

// Get credentials from command line args or environment variables
const supabaseUrl = process.argv[2] || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('');
  console.error('Usage: node import-songs.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  console.error('Or create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importSongs() {
  console.log('📖 Reading all-songs.json...');

  // Read the JSON file
  const songsData = JSON.parse(readFileSync('./all-songs.json', 'utf8'));
  console.log(`✅ Found ${songsData.length} songs to import`);

  // Transform songs to database format
  const songsToInsert = songsData.map(song => ({
    title: song.title,
    artist: song.artist,
    thumbnail: song.thumbnail || null,
    is_australian: song.isAustralian || false,
  }));

  console.log('🚀 Starting import to Supabase...');

  // Supabase has a limit on batch inserts, so we'll do it in chunks of 100
  const chunkSize = 100;
  let imported = 0;

  for (let i = 0; i < songsToInsert.length; i += chunkSize) {
    const chunk = songsToInsert.slice(i, i + chunkSize);

    const { error } = await supabase
      .from('songs')
      .insert(chunk);

    if (error) {
      console.error(`❌ Error importing chunk ${Math.floor(i / chunkSize) + 1}:`, error);
      process.exit(1);
    }

    imported += chunk.length;
    console.log(`✅ Imported ${imported}/${songsToInsert.length} songs...`);
  }

  console.log('🎉 All songs imported successfully!');
}

importSongs().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
