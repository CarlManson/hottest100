# Triple J Hottest 100 Family Tracker

A modern web application for tracking your family's predictions for the Triple J Hottest 100 countdown.

**Live App:** Built with React, TypeScript, Tailwind CSS, and Supabase
**Latest Build:** January 2026
**Database:** Cloud-based with real-time sync

## 🚀 Quick Start

**New here?** Get set up in 10 minutes: **[QUICKSTART.md](QUICKSTART.md)**

## 📚 Documentation

- **[⚡ Quick Start](QUICKSTART.md)** - Get running in 10 minutes
- **[🗄️ Supabase Setup](SUPABASE_SETUP.md)** - Detailed database setup guide
- **[📖 User Guide](FAMILY_GUIDE.md)** - How to use the app
- **[🔄 Database Migration](DATABASE_MIGRATION.md)** - What changed from localStorage
- **[🔧 Developer Notes](PROJECT_NOTES.md)** - Technical documentation
- **[📦 Deployment Guide](DEPLOYMENT.md)** - How to host the app

---

## Features

- **Dashboard**: Overview of leaderboard standings and countdown progress
- **Song Management**: Import eligible songs via CSV or JSON with album artwork and Australian artist badges
- **Family Voting**: Create family members and let everyone pick their top 10 songs
- **Countdown Entry**: Enter the actual Hottest 100 and Hottest 200 results as they're announced
- **Live Leaderboard**: See who predicted the best in real-time with automatic scoring
- **Cloud Storage**: All data is saved in Supabase with real-time synchronization across devices
- **Data Export**: Download all your data as JSON for backup

## How to Use

### 0. Dashboard

1. Go to the "Dashboard" tab to see:
   - Overview stats (songs count, family members, countdown progress)
   - Top 5 leaderboard with match counts
   - Recent countdown results with album artwork
   - Quick action buttons to navigate to other sections

### 1. Setup Songs

1. Go to the "Manage Songs" tab
2. Import eligible songs by:
   - **JSON**: Paste an array like `[{"artist": "Artist Name", "title": "Song Title", "thumbnail": "url", "isAustralian": true}]`
   - **CSV**: Paste one song per line as `Artist Name, Song Title`
   - **Manual**: Use the form to add songs one by one

### 2. Family Voting

1. Go to the "Family Votes" tab
2. Add family members using the input field
3. Select a member to vote
4. Choose their top 10 songs from the list (searchable)
5. Reorder their picks using the up/down arrows

### 3. Enter Results

1. Go to the "Countdown Results" tab
2. Switch between "Hottest 100" and "Hottest 200 (101-200)" tabs
3. Enter the position number and select the song
4. Results are automatically saved

### 4. View Leaderboard

1. Go to the "Leaderboard" tab
2. See who's winning based on their predictions
3. Click on a member to see which songs they got right

## Scoring System

### Hottest 100
- Position #100 = 101 points
- Position #1 = 200 points
- Formula: `101 + (100 - position)`

### Hottest 200 (101-200)
- Position #200 = 1 point
- Position #101 = 100 points
- Formula: `101 + (200 - position)`

**Note**: You only earn points if the song appears in the countdown. Your ranking of songs doesn't affect the points earned.

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

This is a static web app that can be hosted anywhere:

- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **Vercel**: Connect your repository and it will auto-deploy
- **GitHub Pages**: Push the `dist` folder to a gh-pages branch
- **Any static host**: Upload the contents of the `dist` folder

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **Supabase** - PostgreSQL database with real-time subscriptions

## Data Storage

All data is stored in Supabase (cloud PostgreSQL database) with real-time synchronization across devices. The app automatically syncs changes and subscribes to real-time updates.

To backup your data:
1. Go to "Manage Songs" tab
2. Click "Export All Data"
3. Save the JSON file somewhere safe

## License

MIT
