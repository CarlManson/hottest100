# Triple J Hottest 100 Tracker - Developer Notes

## Project Overview

A React/TypeScript web application for tracking family voting predictions for Triple J's Hottest 100 countdown. Features a vibrant Triple J-inspired design with orange/red gradients and card-based layouts.

**Built:** January 2026
**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4
**Storage:** Browser LocalStorage
**Deployment:** Static hosting (Netlify, Vercel, GitHub Pages, etc.)

---

## Project Structure

```
hottest100-app/
├── src/
│   ├── components/
│   │   ├── SongManager.tsx       # Song import/management
│   │   ├── VotingInterface.tsx   # Family voting UI
│   │   ├── CountdownEntry.tsx    # Results entry
│   │   ├── Leaderboard.tsx       # Score display
│   │   └── DataManager.tsx       # Export/backup
│   ├── context/
│   │   └── AppContext.tsx        # State management + localStorage
│   ├── utils/
│   │   └── scoring.ts            # Scoring calculations
│   ├── types.ts                  # TypeScript interfaces
│   ├── App.tsx                   # Main app + navigation
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind imports
├── sample-songs.json             # Sample data
├── README.md                     # Technical documentation
├── DEPLOYMENT.md                 # Deployment instructions
├── FAMILY_GUIDE.md              # User guide
└── PROJECT_NOTES.md             # This file
```

---

## Key Features Implemented

### 1. Song Management
- **Import:** JSON array or CSV (Artist, Title)
- **Manual Entry:** Add songs one at a time
- **View/Delete:** Table view with remove buttons
- **Validation:** Duplicate prevention via unique IDs

### 2. Family Voting
- **Member Management:** Add/remove family members
- **Vote Selection:** Card-based UI with orange + buttons
- **Limit Enforcement:** Max 10 songs per person
- **Reordering:** Up/down arrows to rank 1-10
- **Visual Feedback:** Selected songs show green checkmark
- **Search:** Real-time filtering of songs

### 3. Countdown Results Entry
- **Dual Modes:** Hottest 100 (1-100) and Hottest 200 (101-200)
- **Position Input:** Number field + song selection
- **Duplicate Prevention:** Warns if position already filled
- **Auto-sort:** Results displayed in order

### 4. Leaderboard
- **Live Scoring:** Updates as results are entered
- **Match Details:** Click member to see their successful picks
- **Point Breakdown:** Shows points per song and source (H100/H200)
- **Scoring Rules Display:** In-app documentation

### 5. Data Persistence
- **Auto-save:** Every change persisted to localStorage
- **Export:** Download JSON backup
- **Clear:** Confirmed deletion of all data
- **Statistics:** Current data counts displayed

---

## Data Models

### Song
```typescript
{
  id: string;          // Unique identifier (timestamp-based)
  title: string;       // Song title
  artist: string;      // Artist name
}
```

### FamilyMember
```typescript
{
  id: string;          // Unique identifier
  name: string;        // Display name
  votes: Vote[];       // Array of 0-10 votes
}
```

### Vote
```typescript
{
  songId: string;      // Reference to Song.id
  rank: number;        // 1-10 (personal ranking)
}
```

### CountdownResult
```typescript
{
  songId: string;      // Reference to Song.id
  position: number;    // 1-100 or 101-200
}
```

### AppState
```typescript
{
  songs: Song[];
  familyMembers: FamilyMember[];
  countdownResults: CountdownResult[];      // Positions 1-100
  hottest200Results: CountdownResult[];     // Positions 101-200
}
```

---

## Scoring Logic

### Hottest 100 (Positions 1-100)
```typescript
points = 101 + (100 - position)
// Position 100 = 101 points
// Position 1 = 200 points
```

### Hottest 200 (Positions 101-200)
```typescript
points = 101 + (200 - position)
// Position 200 = 1 point
// Position 101 = 100 points
```

### Implementation
- Located in `src/utils/scoring.ts`
- `calculateScore()`: Computes total for a family member
- `getLeaderboard()`: Sorts members by score
- `getSongMatches()`: Returns successful predictions

**Note:** Personal ranking (1-10) does NOT affect scoring. Only whether the song appears in countdown.

---

## Design System

### Color Palette
- **Primary:** Orange 500 (#f97316)
- **Secondary:** Red 500 (#ef4444)
- **Accent:** Pink 500 (#ec4899)
- **Success:** Green 500 (#22c55e)
- **Background:** Orange/Red/Purple gradient
- **Text:** Gray 800 for headings, Gray 600 for body

### Components
- **Cards:** White bg, orange border, rounded-xl, shadow-lg
- **Buttons:** Orange 500, white text, rounded-lg, bold font
- **Inputs:** Border-2, focus:orange-500
- **Headers:** Font-black (900 weight), large sizes
- **Song Cards:** Grid layout, relative positioning for + button

### Typography
- **Headings:** font-black (900)
- **Subheadings:** font-bold (700)
- **Body:** font-normal (400)
- **Buttons:** font-bold (700)

---

## State Management

### Context API
- Single `AppContext` provides all state and mutations
- `AppProvider` wraps entire app
- `useApp()` hook for components to access state

### LocalStorage Sync
- Key: `hottest100-app-data`
- Auto-save on every state change via `useEffect`
- Initial state loads from localStorage
- Graceful fallback if parsing fails

### State Operations
All mutations provided via context:
- `addSong()`, `addSongs()`, `removeSong()`
- `addFamilyMember()`, `updateFamilyMember()`, `removeFamilyMember()`
- `addCountdownResult()`, `updateCountdownResults()`
- `addHottest200Result()`, `updateHottest200Results()`
- `clearAllData()`

---

## Import/Export Format

### Export Structure
```json
{
  "songs": [...],
  "familyMembers": [...],
  "countdownResults": [...],
  "hottest200Results": [...],
  "exportedAt": "2026-01-06T12:00:00.000Z"
}
```

### Import Formats

**JSON Songs:**
```json
[
  {"artist": "Artist", "title": "Song"}
]
```

**CSV Songs:**
```
Artist Name, Song Title
Another Artist, Another Song
```

---

## Technical Decisions

### Why Tailwind v4?
- Installed during setup, uses new `@import "tailwindcss"` syntax
- No config files needed (removed `tailwind.config.js` and `postcss.config.js`)
- Simpler setup for this use case

### Why LocalStorage?
- No backend needed - fully client-side
- Simple deployment
- Perfect for single-user/single-browser use case
- Automatic persistence without API calls

### Why Context API (not Redux)?
- Simple state structure
- Limited number of mutations
- No need for middleware
- Easier setup and maintenance

### TypeScript Import Types
- Uses `import type { ... }` for type-only imports
- Required by `verbatimModuleSyntax` in tsconfig
- Keeps runtime bundle smaller

---

## Known Limitations

1. **Single Browser Only**
   - Data doesn't sync across devices
   - Multiple people can't vote simultaneously on different devices
   - Workaround: Use one shared device, or export/import data

2. **No Real-time Collaboration**
   - One person must enter all countdown results
   - No automatic updates for multiple viewers

3. **Browser Data Dependency**
   - Clearing browser data deletes everything
   - Must export for backup
   - No cloud storage

4. **No Historical Tracking**
   - Designed for one year at a time
   - Would need to export/archive for year-over-year comparison

5. **No User Authentication**
   - Anyone with access can modify any data
   - Designed for trusted family use

---

## Future Enhancement Ideas

### If You Want to Expand This Later

**Easy Additions:**
- Dark mode toggle
- Print-friendly leaderboard view
- Confetti animation when countdown completes
- Sound effects on vote selection
- Progress bar for votes (X/10 completed)
- Filter leaderboard by Hottest 100 vs 200 points
- Show which family member voted for each song

**Medium Complexity:**
- Firebase/Supabase backend for multi-device sync
- Real-time updates via WebSockets
- User authentication per family member
- Historical year-over-year comparison
- Statistics: Most common picks, dark horses, etc.
- Auto-import from Spotify playlist

**Advanced:**
- Mobile app version (React Native)
- Voice input for countdown entry
- OCR to scan countdown results
- Predictive scoring as countdown progresses
- Social sharing of results
- Tournament/bracket style family competition

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## Deployment Checklist

- [ ] Run `npm run build`
- [ ] Test production build locally with `npm run preview`
- [ ] Verify all features work in production build
- [ ] Choose hosting platform (Netlify/Vercel/etc)
- [ ] Upload `dist` folder
- [ ] Test on mobile devices
- [ ] Share URL with family
- [ ] Remind everyone to bookmark it!

---

## Troubleshooting

### Build Errors
- Check TypeScript errors: `npx tsc --noEmit`
- Ensure all type imports use `import type { ... }`
- Clear `node_modules` and reinstall if needed

### Styling Issues
- Tailwind v4 uses `@import "tailwindcss"` in CSS
- No config files needed
- If styles missing, check `src/index.css`

### Data Loss
- Always export before clearing browser data
- LocalStorage key: `hottest100-app-data`
- Can inspect in browser DevTools → Application → LocalStorage

### Performance
- Max ~1000 songs recommended
- LocalStorage has ~5-10MB limit (plenty for this use case)
- If slow, reduce songs or split into multiple years

---

## Version History

**v1.0 - January 2026**
- Initial release
- All core features implemented
- Triple J-inspired design
- Full TypeScript support
- LocalStorage persistence
- Export/import functionality

---

## Contact / Support

This is a self-contained app with no external dependencies or support.

For issues:
1. Check browser console (F12)
2. Export data as backup
3. Review this documentation
4. Clear localStorage and re-import if needed

---

**Built with ❤️ for family fun during Triple J Hottest 100** 🔥
