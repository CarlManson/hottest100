# Triple J Hottest 100 Tracker

A beautiful, real-time web app for tracking your mates' predictions for the Triple J Hottest 100 countdown. Built with love for friends and music! 🔥

**Live Features:** Real-time sync, multi-device support, installable app, TV mode with Cast, beautiful mobile-optimized UI
**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Supabase
**Status:** Production-ready and fully tested

---

## 🎯 Why This Exists

Every year, mates across Australia gather to listen to the Triple J Hottest 100. This app makes it fun to:
- Compete with friends to see who predicts best
- Track scores in real-time as the countdown happens
- Vote from any device (phone, tablet, laptop)
- Never lose your data with cloud storage

**Perfect for:** Friend groups, mates, office competitions, house parties

---

## 🚀 Fork This Project

**Want to build your own?** This project is designed to be copied and customized!

### Quick Fork & Deploy (15 minutes)

1. **Fork this repository** (click Fork button on GitHub)
2. **Set up Supabase database** (free tier, 5 minutes)
   - Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. **Deploy to Netlify or Vercel** (drag & drop, 2 minutes)
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Create your logins**: add an Admin (and optionally a Host) user in Supabase Auth, then run `supabase-add-roles.sql` and `supabase-lock-writes.sql` (see Logins & Roles below)
5. **Share with your mates** and start voting!
6. **Optional**: Set up AI profiles (requires Anthropic API key - see AI Member Profiles section below)

### What You'll Need

- GitHub account (free)
- Supabase account (free - no credit card required)
- Netlify or Vercel account (free)
- 15 minutes of your time

**Total Cost:** $0 forever (Supabase free tier is generous)

---

## 📚 Documentation

Perfect for first-time forkers:

- **[⚡ Quick Start](QUICKSTART.md)** - Get running in 10 minutes
- **[🗄️ Supabase Setup](SUPABASE_SETUP.md)** - Step-by-step database setup
- **[📦 Deployment Guide](DEPLOYMENT.md)** - Host your app for free
- **[📖 User Guide](FAMILY_GUIDE.md)** - How to use the app
- **[🔧 Developer Notes](PROJECT_NOTES.md)** - Technical deep dive

---

## ✨ Features

### For Users
- **Admin and Host logins**: Real Supabase Auth logins with two roles, enforced in the database (see Logins & Roles below). Visitors can watch everything without logging in
- **Home**: Live leaderboard with countdown progress widget (also where you land after logging in). Before the countdown it shows a big countdown timer
- **Hero Display**: Featured #1 song as large square tile with podium
- **Pick the Winner**: Each mate picks one song to finish #1 for a +50 point bonus
- **Parties**: Split your mates into parties (family, work, friends) and switch the home page, leaderboard and TV mode between them. Each party gets its own shareable link
- **TV Mode**: A full-screen leaderboard for the telly that builds in intensity through the broadcast, with Cast, full screen and a "Show on your TV" guide. Old smart TVs can open `/tv` for a lightweight version
- **Installable App**: Add it to your phone's home screen and it opens like an app, even on bad signal
- **Song Alerts**: Opt-in alerts on phones and tablets every 10 songs, when your picks come in, and when the countdown starts (tap the bell next to the menu)
- **AI Member Profiles**: Claude AI-powered personality labels and music taste analysis with cheeky Aussie commentary (requires Anthropic API key)
- **Awards System**: Hottest 100 awards and achievements
- **Mobile Optimized**: Beautiful responsive UI on phones, tablets, and desktop
- **Song Management**: Import songs via JSON, CSV, or manual entry
- **Member Management**: Rename and delete mates with confirmation
- **Mates & Picks**: Everyone picks their top 10 songs and their winner; parties are managed on the same page
- **Countdown Entry**: Enter results as they're announced (supports Hottest 100 & 200)
- **Detailed Breakdown**: Comprehensive scoring table showing all vote matches
- **Live Scoring**: Watch scores update in real-time across all devices
- **Multi-Device**: Vote on phone, view on TV, enter on laptop
- **Custom Look**: Event branding in `src/config/brand.ts`, a custom Riso-style icon set, and an app icon you can upload in Settings → Style

### For Developers
- **TypeScript**: Full type safety
- **Real-time Sync**: Supabase subscriptions for live updates
- **Modern Stack**: React 18, Vite, Tailwind CSS v4, SCSS modular library
- **Responsive Grid**: Advanced tablet/desktop layout system
- **Mobile-First**: Responsive design with refined breakpoints and careful UX
- **Well Documented**: Clear code comments and comprehensive docs
- **Easy Deploy**: Static build works anywhere

---

## 🎮 How to Use

### Setup (Before Hottest 100)
1. **Log in**: Admin or Host, from the menu or the Log in button on Home
2. **Set the date**: Settings → Event sets the countdown date for everyone
3. **Add Songs** (Admin): Import the ~100-200 eligible songs
4. **Add Mates**: Create profiles for everyone playing on Mates & Picks
5. **Vote**: Each person picks their top 10 songs and one song to win
6. **Optional - Parties**: Once you have more than two mates, group them into parties on Mates & Picks
7. **Optional - AI Profiles**: Generate AI nicknames/profiles for members (click ✎ next to member name - see AI Member Profiles section)

Votes and winner picks lock automatically when the countdown starts or the first result is entered.

### During the Countdown
1. **Enter Results**: One person enters positions as announced
2. **Watch Live**: Everyone sees the leaderboard update instantly, on Home, in TV mode or in the installed app
3. **Celebrate**: Winner gets bragging rights for the year!

---

## 📊 Scoring System

### Hottest 100
- Position #100 = **101 points**
- Position #50 = **151 points**
- Position #1 = **200 points**

### Hottest 200 (positions 101-200)
- Position #200 = **1 point**
- Position #150 = **51 points**
- Position #101 = **100 points**

### Winner pick bonus
- Pick the song that finishes **#1** and get a flat **+50 points**, whether or not it's in your top 10

**Note:** You only score points if your song appears in the countdown. Your ranking (1-10) is just for your reference.

---

## 🔐 Logins & Roles

Logins are real Supabase Auth users (email + password). Turn sign-ups off and create the users by hand in the Supabase dashboard. The login box takes a username: `host` becomes `host@fairest100.au` (change `LOGIN_EMAIL_DOMAIN` in `src/context/AuthContext.tsx`), or type a full email.

| Role | Can do |
|------|--------|
| **Visitor** (not logged in) | Home, TV mode, song alerts, install the app |
| **Host** (one shared login) | Mates & Picks (mates, picks, parties, AI nicknames/profiles), Countdown results, Leaderboard, Archive, and the countdown date in Settings → Event |
| **Admin** | Everything, including songs, archives and all settings |

Roles live in the `user_roles` table. Row-level security (`supabase-lock-writes.sql`) lets everyone read but only a signed-in role write. `supabase-unlock-writes.sql` is the emergency undo.

For the Host, Countdown and Leaderboard stay out of the menu until the countdown starts; the Admin always sees them.

---

## 🤖 AI Member Profiles (Optional)

The app includes AI-powered member profiles that analyze music taste with cheeky Aussie personality. This feature is **optional** and requires an Anthropic API key.

### What the AI Does

- **Profile Labels**: Generates creative 2-3 word labels like "Chart Chaser", "Bandcamp Browser", "Pub Rock Warrior" based on their specific picks
- **Music Taste Analysis**: Analyzes each member's song picks to identify genre preferences, mainstream vs indie leanings, and artist origin patterns (Australian-heavy, international mix, etc.) with cheeky Aussie commentary

### How to Use

1. **Access**: Log in as Admin or Host and click the **✎ (edit)** button next to any member name on the Mates & Picks page
2. **Choose Generation Type**:
   - **🏷️ Re/generate Nickname**: Generates creative label only (e.g., "Pub Rock Warrior")
   - **✨ Re/generate Profile**: Generates music taste description only (3-4 sentence analysis)
3. **Independent Cooldowns**: Each generation type has a separate 24-hour cooldown per member to prevent excessive API usage
4. **Requirement**: Member must have at least one vote to enable AI generation

### Setup Requirements

1. **Anthropic API Key**: Get one from [console.anthropic.com](https://console.anthropic.com/)
2. **Supabase Edge Function**: Deploy the included `generate-profile` function
3. **Store API Key**: Add it as a Supabase secret (not in your .env file)

### Deployment Steps

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Login to Supabase
supabase login

# 3. Link your project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set your Anthropic API key as a secret
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 5. Deploy the function
supabase functions deploy generate-profile
```

The function checks the caller's login, so only a signed-in Admin or Host can spend API credit.

Detailed instructions are in [supabase/functions/README.md](supabase/functions/README.md)

### Cost & Usage

- Uses Claude 3 Haiku (fast, cost-effective model)
- Typical cost: ~$0.01-0.05 per profile generation
- Only runs when you click "Generate AI Profile" buttons
- **The app works perfectly without this feature** - it's just a fun addition!

---

## 🛠️ Development

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/hottest100.git
cd hottest100

# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Edit .env and add:
# - Supabase URL and anonymous key
# - Optional: VITE_STREAM_URL (Listen live button), VITE_CAST_APP_ID (Cast button)

# Run development server
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build       # Creates dist/ folder
npm run preview     # Test production build locally
npm run lint        # Check for issues
npm test            # Scoring and awards tests (Vitest)
```

The production build also writes the service worker (`/sw.js`) and the `/tv` page for old smart TVs.

### Tech Stack Details

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Supabase** - PostgreSQL database with real-time subscriptions

---

## 🎨 Customization Ideas

This app is built to be customized! Here are some ideas:

### Easy Customizations
- Change color scheme (edit Tailwind classes)
- Add your group name to the header
- Customize scoring rules
- Add custom badges or achievements
- Change language/translations

### Medium Complexity
- Add authentication (member login)
- Create historical year-over-year stats
- Add Spotify integration for song previews
- Create printable leaderboard PDFs
- Add social sharing features

### Advanced Features
- Integrate with Triple J's API (if available)
- Add real-time chat during countdown
- Create predictive analytics
- Build mobile apps (React Native)
- Add voice control for countdown entry

---

## 🌍 Deployment Options

This is a static web app that works with any host:

### Recommended (Easiest)
- **Netlify**: Drag & drop deploy, automatic HTTPS
- **Vercel**: GitHub integration, automatic deploys
- **Cloudflare Pages**: Fast global CDN

### Other Options
- **GitHub Pages**: Free hosting for public repos
- **AWS S3 + CloudFront**: Scalable and cheap
- **Your own server**: Apache, Nginx, any static host

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 💾 Data & Privacy

### Where Data Lives
- **Database**: Supabase (cloud PostgreSQL)
- **Real-time**: WebSocket subscriptions
- **Backups**: Automatic daily backups (7-day retention on free tier)

### Privacy & Security
- **Authentication**: Supabase Auth logins with Admin and Host roles; no passwords in the site's code
- **Database rules**: Row-level security lets anyone read but only a signed-in role write
- **Session Management**: Supabase keeps the session in localStorage and refreshes it
- **Song alerts**: The "which mate are you" pick is saved on that device only
- No analytics or tracking
- No ads or external scripts
- Your group's data stays in your Supabase project
- You control everything

### Backup & Export
- Export all data as JSON anytime
- Manual database backups via Supabase dashboard
- Download leaderboard results

---

## 🤝 Contributing

This project was built for personal and group use, but contributions are welcome!

**Ways to contribute:**
- Report bugs via GitHub Issues
- Suggest features or improvements
- Submit pull requests
- Share your customizations
- Improve documentation

**No contribution is too small!** Even fixing typos helps.

---

## 📝 License

MIT License - Feel free to fork, modify, and use for any purpose!

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Triple J** for the iconic Hottest 100 countdown
- **Supabase** for the amazing free tier
- **Australian music fans** everywhere

---

## 📞 Support

### For Users
- Check the [User Guide](FAMILY_GUIDE.md)
- Review [Troubleshooting](SUPABASE_SETUP.md#troubleshooting) section

### For Developers
- Read [Developer Notes](PROJECT_NOTES.md)
- Check browser console for errors (F12)
- Review Supabase logs in dashboard

### Need Help?
- Open a GitHub Issue
- Check existing issues for solutions
- Fork and customize as needed

---

## 🎉 Have Fun!

Built with ❤️ for mates who love music and friendly competition.

**May the best predictor win!** 🏆

---

## ⭐ Star This Repo

If you found this useful, consider giving it a star! It helps others discover the project.

**Ready to build your own?** → [Fork this repository](../../fork) and get started! 
