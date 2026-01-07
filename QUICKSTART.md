# Quick Start - Get Running in 10 Minutes

## What You're Building

A web app where your family can:
- Vote for their top 10 songs
- See results update live as the countdown happens
- Track who predicted best with automatic scoring
- Access from any device (phone, laptop, tablet)

## Setup Steps

### 1. Create Supabase Database (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Create a new project
3. In Supabase, go to **SQL Editor**
4. Copy everything from `supabase-schema.sql` and paste it in
5. Click "Run"

### 2. Configure the App (2 minutes)

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. In your project folder, create a file called `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and paste your credentials:
   ```
   VITE_SUPABASE_URL=paste-your-url-here
   VITE_SUPABASE_ANON_KEY=paste-your-key-here
   ```

### 3. Run the App (1 minute)

```bash
npm install
npm run dev
```

Open http://localhost:5173 and you're ready!

### 4. Deploy for Your Family (2 minutes)

**Option A: Netlify (Easiest)**
1. Run `npm run build`
2. Drag the `dist` folder to [netlify.com](https://netlify.com)
3. Add your environment variables in Netlify settings
4. Share the URL!

**Option B: Vercel**
```bash
npm install -g vercel
vercel
```

Follow the prompts and you're done!

## What's Next?

1. **Add Songs**: Go to "Manage Songs" and import eligible songs
2. **Add Family**: Go to "Family Votes" and add everyone
3. **Start Voting**: Each person picks their top 10
4. **Countdown Day**: Enter results as they're announced
5. **Watch Leaderboard**: See who wins in real-time!

## Real-Time Features

When anyone updates the app, everyone sees it instantly:
- Dad adds a song → Everyone sees it
- Sister votes → Her picks appear for all
- You enter results → Leaderboard updates live

No refreshing needed!

## Need Help?

- **Full setup guide**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **How to use**: [FAMILY_GUIDE.md](FAMILY_GUIDE.md)
- **Technical details**: [PROJECT_NOTES.md](PROJECT_NOTES.md)

## Costs

**Free** for family use! Supabase free tier includes:
- 500MB database (way more than you need)
- Unlimited users
- Real-time updates
- Everything works forever on free plan

---

**Have fun and may the best predictor win!** 🔥
