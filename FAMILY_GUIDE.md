# Triple J Hottest 100 Family Tracker - User Guide

## Quick Start

1. **Add Songs** - Import the eligible songs for this year's Hottest 100
2. **Add Family Members** - Create profiles for everyone playing
3. **Cast Votes** - Each person picks their top 10 songs
4. **Enter Results** - As the countdown happens, enter the results
5. **Check Leaderboard** - See who predicted best!

---

## Step-by-Step Guide

### 1. Setting Up Songs (Manage Songs Tab)

**Option A: Import from JSON**
1. Go to the "Manage Songs" tab
2. Copy the contents of `sample-songs.json` or create your own list
3. Paste into the import box
4. Click "Import Songs"

Example JSON format:
```json
[
  {"artist": "Billie Eilish", "title": "Birds of a Feather"},
  {"artist": "Sabrina Carpenter", "title": "Espresso"}
]
```

**Option B: Import from CSV**
1. Create a list with format: `Artist Name, Song Title`
2. One song per line
3. Paste into the import box
4. Click "Import Songs"

Example CSV format:
```
Billie Eilish, Birds of a Feather
Sabrina Carpenter, Espresso
```

**Option C: Add Manually**
1. Type artist name and song title in the form
2. Click "Add Song"

### 2. Adding Family Members (Family Votes Tab)

1. Go to "Family Votes" tab
2. Type a name in the input field
3. Click "Add Member" or press Enter
4. Repeat for each person playing

### 3. Casting Votes

1. Click on a family member's name to select them
2. Use the search box to find songs quickly
3. Click the orange **+** button to add a song to their top 10
4. Maximum 10 songs per person
5. Use the up/down arrows to reorder their picks (rank 1-10)
6. Green checkmark (✓) shows selected songs
7. Click a family member to switch between voters

**Tips:**
- You can vote on behalf of family members if they're not present
- Search is instant - just start typing
- Reordering doesn't affect points (only whether the song makes the countdown)

### 4. Entering Countdown Results

**During the Hottest 100 (Jan 25/26)**
1. Go to "Countdown Results" tab
2. Make sure "Hottest 100" tab is selected
3. Enter the position number (1-100)
4. Click on the song from the list
5. The result is saved automatically
6. Check the leaderboard to see scores update!

**After the Hottest 200 (Later)**
1. Click the "Hottest 200 (101-200)" tab
2. Enter positions 101-200 as they're announced
3. Scores will automatically include bonus points from these songs

### 5. Viewing the Leaderboard

1. Go to "Leaderboard" tab
2. See everyone ranked by total points
3. Click on a person to see their matching songs
4. See how many points each matched song earned

---

## Scoring System

### Hottest 100 Points
- **Position #100** = 101 points
- **Position #50** = 151 points
- **Position #1** = 200 points
- Formula: `101 + (100 - position)`

### Hottest 200 Points (Positions 101-200)
- **Position #200** = 1 point
- **Position #150** = 51 points
- **Position #101** = 100 points
- Formula: `101 + (200 - position)`

### Important Notes
- You ONLY score points if your song appears in the countdown
- Your ranking (1-10) doesn't affect points - it's just for your reference
- All points are automatic - no manual calculation needed!

---

## Data Management

### Backup Your Data
1. Go to "Manage Songs" tab
2. Click "Export All Data"
3. Save the JSON file somewhere safe
4. This includes all songs, votes, and results

### Restore Data
1. Open your backup JSON file
2. Copy the entire contents
3. Paste into the "Import Songs" box
4. All your data will be restored

### Clear Everything
1. Go to "Manage Songs" tab
2. Click "Clear All Data"
3. Click again to confirm
4. **Warning:** This deletes everything permanently!

---

## Tips & Tricks

### Best Practices
- **Import songs early** - Do this before family members start voting
- **One person manages results** - Assign someone to enter countdown results
- **Backup before countdown** - Export data before the event starts
- **Mobile friendly** - Everyone can vote on their phones

### Common Issues

**Q: I added a song to the wrong person**
A: Click the green checkmark to remove it, or select the correct person and add it there

**Q: Can I change someone's votes after they've picked?**
A: Yes! Select their name and add/remove songs anytime before the countdown

**Q: What if I close the browser?**
A: All data is saved automatically in your browser's local storage

**Q: Can multiple people vote at the same time?**
A: Not on the same browser. Each person can use their own device, or vote one at a time

**Q: Someone picked the same song twice**
A: Not possible - the app prevents duplicate selections per person

---

## Technical Details

### Browser Compatibility
- Works on Chrome, Firefox, Safari, Edge
- Mobile browsers supported
- Requires JavaScript enabled

### Data Storage
- All data stored locally in browser
- No server required
- No internet needed after loading
- Data persists until you clear browser data or use "Clear All Data"

### Privacy
- Nothing is sent to any server
- All processing happens in your browser
- Your data stays on your device

---

## Getting Ready for Hottest 100 Day

### 1 Week Before
- [ ] Import all eligible songs
- [ ] Add all family members
- [ ] Test that everyone can access the site
- [ ] Export a backup

### 1 Day Before
- [ ] Remind everyone to cast their votes
- [ ] Check all votes are complete (10/10 for each person)
- [ ] Export another backup
- [ ] Assign someone to enter results during countdown

### During the Countdown
- [ ] Have the app open on a laptop/tablet
- [ ] Enter results as they're announced
- [ ] Watch the leaderboard update live!
- [ ] Take screenshots of final standings

### After the Event
- [ ] Export final data with all results
- [ ] Share screenshots with the family
- [ ] Keep data for next year's comparison

---

## Support

If you encounter issues:
1. Try refreshing the browser
2. Check browser console for errors (F12)
3. Export your data as backup
4. Clear browser cache and reload
5. Restore data from backup if needed

Have fun and may the best predictor win! 🔥
