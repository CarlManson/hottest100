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
- `Settings.tsx` - Tabbed interface (AI Prompts, Songs, Data) for all administrative functions
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

### Settings Page
`Settings.tsx` provides a tabbed interface for all administrative functions:

**Songs Tab** - Import and manage songs:
- JSON import: `[{"artist": "...", "title": "...", "thumbnail": "url", "isAustralian": true}]`
- CSV import: One per line `Artist Name, Song Title`
- Manual entry: Form-based single song entry
- View/remove current songs

**AI Prompts Tab** - Configure AI profile generation:
- Customize nickname/label generation prompt
- Customize music taste analysis prompt
- Save prompts locally for reference
- Reset rate limits

**Data Tab** - Export and manage all data:
- View statistics (songs, members, results counts)
- Export all data as JSON
- Clear all data (with confirmation)

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

**Countdown Update Protection:**
During countdown updates (DELETE→INSERT operations), the app prevents the temporary 0-results state from appearing:
- `isUpdatingCountdown` and `isUpdatingHottest200` ref flags block real-time subscription updates
- Users maintain their current view during the DELETE→INSERT gap
- After operation completes, manual reload syncs all users
- Loading overlay prevents interaction during updates
- Multi-user safe: all clients see consistent state, never flicker to 0 results

### AI Member Profiles (Optional Feature)
The app includes an optional AI feature powered by Claude (Anthropic API) that generates personality profiles for members with cheeky Aussie personality.

**Implementation:**
- **Supabase Edge Function**: `supabase/functions/generate-profile/index.ts`
- **Model**: Claude 3 Haiku (fast, cost-effective)
- **API Key Storage**: Stored as Supabase secret, NOT in client .env file
- **Tone**: Cheeky Aussie music critic - funny, playful, uses natural Aussie slang

**Two Generation Types:**
1. **Nickname Generation** (`generateLabel`)
   - Generates creative 2-3 word label only
   - Examples: "Chart Chaser", "Bandcamp Browser", "Pub Rock Warrior"
   - Saves to: `label` field + `last_label_regeneration` timestamp
   - 24-hour cooldown per member

2. **Profile Generation** (`generateMusicTaste`)
   - Generates music taste description only (3-4 sentences)
   - Analyzes genre preferences, mainstream vs indie, artist origins
   - Saves to: `music_taste_description` field + `last_music_taste_update` timestamp
   - 24-hour cooldown per member

**User Access:**
- Click **✎ (edit)** button next to member name on Voting page
- Opens member management modal with:
  - Rename functionality
  - **🏷️ Re/generate Nickname** button (label only)
  - **✨ Re/generate Profile** button (music taste description only)
- Separate 24-hour cooldowns for each generation type
- Requires member to have at least one vote

**Data Flow:**
1. User clicks generation button in `VotingInterface.tsx` modal
2. Client calls `generateLabel()` or `generateMusicTaste()` from AppContext
3. AppContext invokes Supabase Edge Function via API utility
4. Edge Function calls Anthropic API with structured prompts
5. Response parsed and returned to client
6. Database updated via Supabase client
7. Real-time subscription updates UI automatically

**Prompt Engineering:**
- **Label Generation**: Creative, specific labels based on actual picks (not generic) - avoids "Triple J" and "Indie Darling"
- **Music Taste Analysis**: Focuses purely on genre, mainstream vs indie, and artist origins (Australian vs International)
- **Existing Labels**: Passed to avoid duplicate labels across members
- **Cheeky Aussie Tone**: Natural slang (mate, reckon, ripper, bloody) without overdoing it

**Key Features:**
- Analyzes genre preferences (indie vs mainstream) inferred from artists
- Identifies artist origin patterns (Australian-heavy, international mix, etc.)
- Generates unique, creative labels specific to member's picks
- Cheeky Aussie personality with friendly roasting
- Independent cooldowns allow nickname and profile to be regenerated separately
- Graceful fallback if API key not configured

**Deployment:**
```bash
# Set API key as Supabase secret
supabase secrets set ANTHROPIC_API_KEY=your_key_here

# Deploy edge function
supabase functions deploy generate-profile
```

**Cost Considerations:**
- Only runs on-demand (per-member button clicks)
- ~$0.01-0.05 per generation
- Separate 24-hour cooldowns prevent excessive usage
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
