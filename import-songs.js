import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
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
