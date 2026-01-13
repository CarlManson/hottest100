# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Triple J Hottest 100 Prediction Tracker - a web application for tracking predictions during the annual Triple J Hottest 100 countdown. Built with React, TypeScript, Tailwind CSS v4, and Supabase for real-time data synchronization.

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript compile + production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add Supabase credentials:
   - `VITE_SUPABASE_URL` - Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
3. Set authentication credentials:
   - `VITE_AUTH_USERNAME` - Username for admin access (choose something unique to your group)
   - `VITE_AUTH_PASSWORD` - Strong password (recommend using a password generator)
4. Run `supabase-schema.sql` in Supabase SQL Editor to create tables

### Security & Sharing
**Authentication**: The app uses client-side username/password authentication stored in environment variables. This is suitable for small group sharing where one set of credentials is shared among trusted users.

**For sharing with other Triple J fans:**
- Each group should set up their own Supabase project
- Choose a unique, non-obvious username
- Use a strong, randomly-generated password
- This approach protects against casual brute force attempts
- **Note**: This is not enterprise-grade security, but appropriate for a small group prediction tracker

**Session Management**: Authentication state is stored in both localStorage and cookies with a 7-day expiration.

## Architecture

### State Management & Data Flow
- **Global State**: Managed via React Context (`src/context/AppContext.tsx`)
- **Data Source**: Supabase PostgreSQL database with real-time subscriptions
- **State Pattern**: Context Provider wraps entire app, exposing state + mutation methods
- **Real-time Sync**: Supabase real-time channels subscribe to all table changes, automatically updating local state

### Database Schema
Four main tables (see `supabase-schema.sql`):
- `songs` - Eligible songs with metadata (title, artist, thumbnail, is_australian)
- `family_members` - Users who can vote (database table name kept as-is for compatibility)
- `votes` - Top 10 picks per member (1-10 ranking)
- `countdown_results` - Actual Hottest 100/200 results (type: 'hottest100' or 'hottest200')

All tables use UUIDs as primary keys with foreign key constraints and ON DELETE CASCADE.

### Component Structure
Single-page app with tab navigation:
- `App.tsx` - Root component with tab navigation
- `Dashboard.tsx` - Overview stats, leaderboard preview, recent results
- `SongManager.tsx` - Import songs (JSON/CSV/manual), manage song list
- `VotingInterface.tsx` - Add members, select member, rank their top 10
- `CountdownEntry.tsx` - Enter actual countdown results (separate tabs for 100 vs 200)
- `Leaderboard.tsx` - Final rankings with scoring breakdown

### Scoring System
Implemented in `src/utils/scoring.ts`:
- **Hottest 100**: Position 100 = 101 points, Position 1 = 200 points
  - Formula: `101 + (100 - position)`
- **Hottest 200**: Position 200 = 1 point, Position 101 = 100 points
  - Formula: `101 + (200 - position)`
- Only songs that appear in countdown earn points (vote ranking doesn't affect points)

### Type Definitions
Core types in `src/types.ts`:
- `Song` - id, title, artist, thumbnail?, isAustralian?
- `FamilyMember` - id, name, votes[]
- `Vote` - songId, rank (1-10)
- `CountdownResult` - songId, position (1-100 or 101-200)
- `AppState` - songs[], familyMembers[], countdownResults[], hottest200Results[]

### Data Layer Pattern
`AppContext.tsx` handles all database operations:
1. Initial load on mount (`loadAllData`)
2. Real-time subscriptions to all tables
3. Mutation methods (add/update/remove) that write to Supabase
4. Subscriptions trigger reloads, updating local state
5. Components consume via `useApp()` hook

Data mapping: Snake_case in DB (PostgreSQL) → camelCase in app (JavaScript/TypeScript)

### Styling
- Tailwind CSS v4 with PostCSS
- Gradient theme: orange → red → pink
- Responsive design with sticky navigation
- Album artwork thumbnails displayed via Song.thumbnail URLs

## Key Implementation Details

### Song Import
`SongManager.tsx` supports three import methods:
- JSON: `[{"artist": "...", "title": "...", "thumbnail": "url", "isAustralian": true}]`
- CSV: One per line `Artist Name, Song Title`
- Manual: Form-based single song entry

### Voting Flow
1. Select member from dropdown
2. Search/filter song list
3. Add up to 10 songs (enforced)
4. Reorder via up/down arrows (affects Vote.rank)
5. Save updates member.votes via `updateFamilyMember()`

### Countdown Entry
Two separate lists (Hottest 100 vs 200) stored in same table, differentiated by `type` column. Position number determines which list automatically.

### Real-time Updates
Supabase channels (`*-channel`) subscribe to all operations (`event: '*'`) on respective tables. On any change, relevant load function re-fetches data, triggering React re-renders across all connected clients.

### AI Member Profiles (Optional Feature)
The app includes an optional AI feature powered by Claude (Anthropic API) that generates personality profiles for members.

**Implementation:**
- **Supabase Edge Function**: `supabase/functions/generate-profile/index.ts`
- **Model**: Claude 3 Haiku (fast, cost-effective)
- **API Key Storage**: Stored as Supabase secret, NOT in client .env file
- **Modes**:
  - `music_taste` - Analyzes song picks for genre preferences and patterns
  - `label_and_taste` - Generates 2-3 word label + music taste description
  - `running_commentary` - Live performance commentary during countdown
  - `full_regeneration` - Complete profile with label, taste, and performance

**Data Flow:**
1. Client calls Supabase Edge Function via `supabase.functions.invoke('generate-profile')`
2. Edge Function calls Anthropic API with structured prompts
3. Response parsed and returned to client
4. Client updates member profile in UI

**Key Features:**
- Analyzes genre preferences (indie vs mainstream)
- Identifies artist origin patterns (Australian-heavy, international mix, etc.)
- Generates unique labels for each member
- Provides live commentary based on match counts and scores
- Graceful fallback if API key not configured

**Deployment:**
```bash
# Set API key as Supabase secret
supabase secrets set ANTHROPIC_API_KEY=your_key_here

# Deploy edge function
supabase functions deploy generate-profile
```

**Cost Considerations:**
- Only runs on-demand (button click)
- ~$0.01-0.05 per generation
- App fully functional without this feature

## Important Constraints

- Members can have exactly 0-10 votes (enforced in UI)
- Vote ranks must be 1-10
- Countdown positions: 1-100 for Hottest 100, 101-200 for Hottest 200
- Song deletion cascades to votes and countdown_results (foreign key constraints)
- All database IDs are UUIDs generated by Supabase

## Testing & Debugging

- Check browser console for Supabase errors
- View data in Supabase Table Editor
- Test real-time: Open app in multiple browser windows/tabs
- Network tab: Monitor Supabase API calls and WebSocket connections
