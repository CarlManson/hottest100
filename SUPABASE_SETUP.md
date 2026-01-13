# Supabase Setup Guide

This guide will help you set up the database backend so your group can all access the app from their own devices with real-time updates.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Free tier includes:
   - 500MB database
   - 1GB file storage
   - 50,000 monthly active users
   - More than enough for a group app!

## Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in:
   - **Name:** `hottest100-tracker` (or whatever you like)
   - **Database Password:** Generate a strong password and save it somewhere safe
   - **Region:** Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Run the Database Schema

1. In your Supabase project, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the `supabase-schema.sql` file from this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" or press Cmd/Ctrl + Enter
7. You should see "Success. No rows returned"

This creates all the tables you need:
- `songs` - All eligible songs
- `family_members` - Everyone who's voting (database table name kept for compatibility)
- `votes` - Each person's top 10 picks
- `countdown_results` - The actual Hottest 100/200 results

## Step 4: Get Your API Credentials

1. Click on the **Settings** gear icon in the left sidebar
2. Click **API** in the settings menu
3. Find two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. Keep these handy for the next step

## Step 5: Configure Your App

1. In your project folder, create a file named `.env`
2. Copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and paste your credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Save the file

**Important:** Never commit `.env` to git! It's already in `.gitignore`.

## Step 6: Update Your App Code

The app has been updated to use Supabase instead of localStorage. The new version includes:

✅ Real-time updates - everyone sees changes instantly
✅ Multi-device support - vote from phone, view on TV
✅ Shared data - one source of truth for the whole family
✅ Persistent storage - data never gets lost

## Step 7: Test It Out

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Try adding some songs and members

4. Open the app in multiple browser windows to see real-time updates!

## Step 8: Deploy for Your Group

Once everything works locally, deploy it so your group can access it:

### Option A: Netlify (Easiest)

1. Build the app:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)

3. Drag the `dist` folder into Netlify

4. Click on "Site settings" → "Environment variables"

5. Add your environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

6. Redeploy the site

7. Share the URL with your family!

### Option B: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts and add environment variables when asked

4. Share the URL with your mates!

## Step 9: AI Member Profiles (Optional)

The app includes an **optional** AI feature that generates personality profiles for each member based on their music picks and performance. This requires an Anthropic API key and deploying a Supabase Edge Function.

### Why It's Optional

- The app works perfectly without this feature
- It requires an Anthropic account (free tier available)
- Adds a small cost per profile generation (~$0.01-0.05)
- Requires deploying a Supabase Edge Function

### Setup Steps

**1. Get an Anthropic API Key**

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up for an account (free tier includes $5 credit)
3. Navigate to API Keys
4. Create a new API key and copy it

**2. Install Supabase CLI**

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**3. Login and Link Your Project**

```bash
# Login to Supabase
supabase login

# Link to your project (find YOUR_PROJECT_REF in your Supabase project URL)
supabase link --project-ref YOUR_PROJECT_REF
```

**4. Store Your API Key as a Secret**

```bash
# Set the Anthropic API key (replace with your actual key)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Important:** The API key is stored securely in Supabase, **not** in your `.env` file.

**5. Deploy the Edge Function**

```bash
# Deploy from your project root directory
supabase functions deploy generate-profile
```

**6. Verify Deployment**

1. Go to your Supabase Dashboard
2. Click **Edge Functions** in the sidebar
3. You should see `generate-profile` listed and active

### What You Get

Once deployed, the app will show "Generate AI Profile" buttons that create:
- **Music Taste Analysis**: Genre preferences, mainstream vs indie, artist origins
- **Profile Labels**: Fun 2-3 word descriptions like "Indie Purist" or "Aussie Champion"
- **Live Commentary**: Performance updates as countdown results come in

### Cost Estimate

- Uses Claude 3 Haiku model (fast and cheap)
- ~$0.01-0.05 per profile generation
- Only runs when you click the button
- Anthropic free tier includes $5 credit (~100-500 profiles)

### Troubleshooting

**Function not responding:**
- Check Edge Function logs in Supabase Dashboard
- Verify the secret: `supabase secrets list`
- Ensure your API key is valid at console.anthropic.com

**"ANTHROPIC_API_KEY not configured" error:**
- Re-run: `supabase secrets set ANTHROPIC_API_KEY=your_key`
- Redeploy: `supabase functions deploy generate-profile`

**Detailed setup guide:** See [supabase/functions/README.md](supabase/functions/README.md)

---

## Database Management

### View Your Data

1. In Supabase, click **Table Editor** in the sidebar
2. Click on any table to view/edit data
3. You can manually add, edit, or delete records here

### Backup Your Data

**Automatic Backups:**
- Supabase automatically backs up your database daily
- Backups kept for 7 days (free tier)

**Manual Export:**
1. Go to **Database** → **Backups** in Supabase
2. Click "Export database"
3. Save the file somewhere safe

### Reset for Next Year

When Hottest 100 is over and you want to start fresh:

```sql
-- Clear all data but keep the structure
TRUNCATE songs, family_members, votes, countdown_results CASCADE;
```

Or keep the songs and family members but clear votes:

```sql
-- Just clear votes and results
TRUNCATE votes, countdown_results CASCADE;
```

## Real-Time Features

The app now has real-time updates! When someone:
- Adds a song → Everyone sees it instantly
- Casts a vote → Updates on all devices
- Enters a countdown result → Leaderboard updates live

This happens automatically using Supabase Realtime.

## Security Notes

### Current Setup (Group-Friendly)

The database is currently open - anyone with the app URL can read/write data. This is fine for a private group app.

### If You Want to Add Authentication

If you want to require login (optional):

1. Enable Email auth in Supabase:
   - Go to **Authentication** → **Providers**
   - Enable Email provider

2. Update the RLS policies in SQL Editor:
   ```sql
   -- Only allow authenticated users
   DROP POLICY "Allow all operations on songs" ON songs;
   CREATE POLICY "Authenticated users can do anything"
     ON songs FOR ALL
     USING (auth.role() = 'authenticated');
   ```

3. Add sign-in UI to your app (we can do this if you want!)

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check the variable names start with `VITE_`
- Restart the dev server after creating `.env`

### Changes don't appear in real-time
- Check browser console for errors
- Verify realtime is enabled in Supabase:
  - Database → Replication
  - Ensure tables are published

### "Failed to fetch"
- Check your internet connection
- Verify Supabase URL is correct
- Check Supabase project status (Settings → General)

### Can't run SQL schema
- Make sure you're in the SQL Editor (not Table Editor)
- Run the entire file at once, not line by line
- Check for error messages and share them if stuck

## Cost Estimate

**Free Tier Limits:**
- 500MB database (enough for ~500,000 songs)
- 2GB bandwidth per month
- Unlimited API requests

**Your Usage:**
- ~1,000 songs = ~1MB
- ~10 members = negligible
- Real-time updates = ~1MB per day during voting

**Verdict:** You'll easily stay within free tier limits! 🎉

## Support

If you run into issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review error messages in browser console (F12)
3. Check Supabase project logs (Logs & Analytics)
4. Ask in [Supabase Discord](https://discord.supabase.com)

---

**You're all set! Your group can now vote together in real-time** 🔥
