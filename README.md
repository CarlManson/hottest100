# Triple J Hottest 100 Family Tracker

A beautiful, real-time web app for tracking your family's predictions for the Triple J Hottest 100 countdown. Built with love for family fun! 🔥

**Live Features:** Real-time sync, multi-device support, beautiful mobile-optimized UI
**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Supabase
**Status:** Production-ready and fully tested

---

## 🎯 Why This Exists

Every year, families across Australia gather to listen to the Triple J Hottest 100. This app makes it fun to:
- Compete with family members to see who predicts best
- Track scores in real-time as the countdown happens
- Vote from any device (phone, tablet, laptop)
- Never lose your data with cloud storage

**Perfect for:** Families, friend groups, office competitions, house parties

---

## 🚀 Fork This Project

**Want to build your own?** This project is designed to be copied and customized!

### Quick Fork & Deploy (15 minutes)

1. **Fork this repository** (click Fork button on GitHub)
2. **Set up Supabase database** (free tier, 5 minutes)
   - Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. **Deploy to Netlify or Vercel** (drag & drop, 2 minutes)
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Share with your family** and start voting!

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
- **Dashboard**: Live leaderboard and countdown progress
- **Mobile Optimized**: Beautiful UI on phones and tablets
- **Song Management**: Import songs via JSON, CSV, or manual entry
- **Family Voting**: Everyone picks their top 10 songs
- **Countdown Entry**: Enter results as they're announced
- **Live Scoring**: Watch scores update in real-time
- **Multi-Device**: Vote on phone, view on TV, enter on laptop

### For Developers
- **TypeScript**: Full type safety
- **Real-time Sync**: Supabase subscriptions for live updates
- **Modern Stack**: React 18, Vite, Tailwind CSS v4
- **Mobile-First**: Responsive design with careful attention to mobile UX
- **Well Documented**: Clear code comments and comprehensive docs
- **Easy Deploy**: Static build works anywhere

---

## 🎮 How to Use

### Setup (Before Hottest 100)
1. **Add Songs**: Import the ~100-200 eligible songs
2. **Add Family**: Create profiles for everyone playing
3. **Vote**: Each person picks their top 10 songs

### During the Countdown
1. **Enter Results**: One person enters positions as announced
2. **Watch Live**: Everyone sees the leaderboard update instantly
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

**Note:** You only score points if your song appears in the countdown. Your ranking (1-10) is just for your reference.

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
# Edit .env and add your Supabase URL and key

# Run development server
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build       # Creates dist/ folder
npm run preview     # Test production build locally
npm run lint        # Check for issues
```

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
- Add your family name to the header
- Customize scoring rules
- Add custom badges or achievements
- Change language/translations

### Medium Complexity
- Add authentication (family members login)
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

### Privacy
- No analytics or tracking
- No ads or external scripts
- Your family's data stays in your Supabase project
- You control everything

### Backup & Export
- Export all data as JSON anytime
- Manual database backups via Supabase dashboard
- Download leaderboard results

---

## 🤝 Contributing

This project was built for personal/family use, but contributions are welcome!

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

Built with ❤️ for families who love music and friendly competition.

**May the best predictor win!** 🏆

---

## ⭐ Star This Repo

If you found this useful, consider giving it a star! It helps others discover the project.

**Ready to build your own?** → [Fork this repository](../../fork) and get started! 
