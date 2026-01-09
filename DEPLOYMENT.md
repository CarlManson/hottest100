# Deployment Guide

This guide will help you deploy your Hottest 100 tracker so your family can access it from anywhere!

---

## Prerequisites

Before deploying, make sure you have:

- ✅ Supabase project set up (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
- ✅ Your Supabase URL and anon key ready
- ✅ Code running locally with `npm run dev`
- ✅ Tested that songs and votes work

---

## Option 1: Netlify (Recommended - Easiest)

**Time:** 5 minutes | **Difficulty:** ⭐ Easy | **Cost:** Free

### Method A: Drag & Drop (Easiest)

1. **Build your app:**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with your app.

2. **Go to Netlify:**
   - Visit [app.netlify.com](https://app.netlify.com/)
   - Sign up with GitHub (or email)
   - Click "Add new site" → "Deploy manually"

3. **Drag the `dist` folder:**
   - Drag your `dist` folder into the upload area
   - Wait ~30 seconds for deployment
   - You'll get a URL like `random-name-123.netlify.app`

4. **Add environment variables:**
   - Click "Site settings" → "Environment variables"
   - Add these two variables:
     ```
     VITE_SUPABASE_URL = your-supabase-url
     VITE_SUPABASE_ANON_KEY = your-anon-key
     ```
   - Click "Trigger deploy" to rebuild with new variables

5. **Test and share:**
   - Visit your Netlify URL
   - Test adding a song or family member
   - Share the URL with your family!

### Method B: GitHub Integration (Auto-deploys)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Add environment variables"
   - Add your Supabase URL and key
   - Click "Deploy site"

4. **Automatic deployments:**
   - Every time you push to GitHub, Netlify auto-deploys
   - Perfect for ongoing updates!

### Custom Domain (Optional)

1. In Netlify, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `hottest100.family`)
4. Follow DNS configuration instructions
5. Netlify automatically provisions HTTPS

---

## Option 2: Vercel

**Time:** 5 minutes | **Difficulty:** ⭐ Easy | **Cost:** Free

### Method A: CLI Deploy

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Follow prompts:**
   - Login to Vercel (creates account if needed)
   - Confirm project settings
   - Add environment variables when prompted:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Get your URL:**
   - Vercel provides a URL like `hottest100.vercel.app`
   - Share with your family!

### Method B: GitHub Integration

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure:**
   - Framework: Vite (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables

4. **Deploy:**
   - Click "Deploy"
   - Vercel auto-deploys on every push!

---

## Option 3: Cloudflare Pages

**Time:** 5 minutes | **Difficulty:** ⭐⭐ Medium | **Cost:** Free

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect Cloudflare Pages:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
   - Click "Pages" → "Create a project"
   - Connect GitHub and select your repo

3. **Configure build:**
   - Framework: Vite
   - Build command: `npm run build`
   - Build output: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click "Save and Deploy"
   - Get URL like `hottest100.pages.dev`

**Why Cloudflare?**
- Extremely fast global CDN
- Great for international families
- Free tier is very generous

---

## Option 4: GitHub Pages

**Time:** 10 minutes | **Difficulty:** ⭐⭐ Medium | **Cost:** Free

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://YOUR-USERNAME.github.io/hottest100",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts:**
   ```typescript
   export default defineConfig({
     base: '/hottest100/',
     plugins: [react()],
   })
   ```

4. **Important: Environment Variables**
   - GitHub Pages doesn't support build-time env vars easily
   - **Option A:** Hardcode your Supabase values in `src/lib/supabase.ts` (not recommended for public repos)
   - **Option B:** Use GitHub Actions to inject env vars during build
   - **Recommendation:** Use Netlify or Vercel instead for easier env var support

5. **Deploy:**
   ```bash
   npm run deploy
   ```

6. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: `gh-pages` branch
   - Wait a few minutes
   - Visit `https://YOUR-USERNAME.github.io/hottest100`

---

## Option 5: Traditional Web Hosting

**Time:** 15 minutes | **Difficulty:** ⭐⭐⭐ Advanced | **Cost:** Varies

If you have your own web hosting (cPanel, shared hosting, VPS):

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload via FTP/SFTP:**
   - Connect to your server
   - Upload contents of `dist` folder
   - Place in your public directory (e.g., `public_html`)

3. **Environment variables:**
   - **Problem:** Can't use build-time env vars after building
   - **Solution:** Edit `dist/assets/*.js` to replace env var references (not recommended)
   - **Better solution:** Use Netlify/Vercel instead

4. **Configure server:**
   - Ensure server serves `index.html` for all routes
   - Enable HTTPS (Let's Encrypt is free)

**Apache .htaccess example:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx configuration example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Environment Variables Reference

Your app needs these environment variables to work:

```bash
# Required
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Optional
# NODE_ENV=production (usually set automatically)
```

**Where to get these:**
1. Go to your Supabase project
2. Click Settings → API
3. Copy "Project URL" and "anon public" key

**Security note:** The anon key is safe to expose publicly. It's designed for client-side use and protected by Row Level Security policies.

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] App loads without errors
- [ ] Can add a song
- [ ] Can add a family member
- [ ] Can cast votes
- [ ] Can enter countdown results
- [ ] Leaderboard updates
- [ ] Works on mobile devices
- [ ] Real-time updates work (open in two tabs)
- [ ] Custom domain works (if configured)
- [ ] HTTPS is enabled (should be automatic)

---

## Custom Domain Setup

Most hosting providers make this easy:

### Netlify/Vercel/Cloudflare

1. Add custom domain in dashboard
2. Update your DNS records:
   ```
   Type: CNAME or A
   Name: @ (or subdomain)
   Value: provided by host
   ```
3. Wait for DNS propagation (5-60 minutes)
4. HTTPS automatically provisioned

### Recommended domains for family apps
- `hottest100.family`
- `familytracks.com`
- `[yourlastname]hottest100.com`

---

## Troubleshooting

### "Failed to fetch" or blank page
- ❌ Missing environment variables
- ✅ Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- ✅ Redeploy after adding variables

### Environment variables not working
- ❌ Variables added after build
- ✅ Trigger new build/deployment
- ✅ Clear build cache and redeploy

### 404 errors on refresh
- ❌ Server not configured for SPA routing
- ✅ Add redirect rules (see platform-specific instructions above)

### Real-time updates don't work
- ❌ Wrong Supabase URL or key
- ✅ Double-check environment variables match your Supabase project
- ✅ Verify Realtime is enabled in Supabase settings

### Mobile app doesn't work
- ❌ HTTP instead of HTTPS
- ✅ Ensure deployment uses HTTPS (usually automatic)

### Changes not appearing
- ❌ Browser cache
- ✅ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Clear browser cache
- ✅ Try incognito/private mode

---

## Updating Your Deployed App

### Netlify/Vercel (GitHub integration)

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Automatic deployment happens!
```

### Manual deploys (drag & drop)

```bash
# Build new version
npm run build

# Drag new dist folder to hosting dashboard
```

---

## Performance Optimization

Your app is already optimized, but here are some tips:

### Already included:
✅ Code splitting (Vite automatic)
✅ Lazy loading for images
✅ Minified production builds
✅ Tree-shaking (removes unused code)

### Optional improvements:
- Enable gzip/brotli compression (usually automatic on hosts)
- Use CDN (Netlify/Vercel/Cloudflare include this)
- Add service worker for offline support (advanced)

---

## Monitoring & Analytics (Optional)

### Free options:
- **Netlify Analytics**: Built-in, privacy-friendly ($9/month)
- **Vercel Analytics**: Built-in, edge-based (free tier available)
- **Cloudflare Web Analytics**: Free, privacy-friendly
- **Supabase Logs**: Monitor database queries

### What to monitor:
- Page views
- Error rates
- Load times
- Real-time connection status

---

## Cost Breakdown

**Typical monthly costs for family use:**

| Service | Cost |
|---------|------|
| Hosting (Netlify/Vercel) | $0 (free tier) |
| Supabase Database | $0 (free tier) |
| Custom Domain | $10-15/year (optional) |
| **Total** | **$0-1.25/month** |

**Free tier limits you won't hit:**
- Netlify: 100GB bandwidth, 300 build minutes/month
- Vercel: 100GB bandwidth, unlimited sites
- Supabase: 500MB database, 2GB bandwidth/month

---

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use environment variables in hosting dashboard

2. **Use HTTPS only**
   - Automatic on Netlify/Vercel/Cloudflare
   - Required for Supabase connections

3. **Row Level Security**
   - Already configured in `supabase-schema.sql`
   - Adjust policies if you add authentication

4. **Backup your database**
   - Supabase does daily backups automatically
   - Export data via app's export feature periodically

---

## Next Steps

1. ✅ Deploy your app
2. ✅ Test all features
3. ✅ Share URL with family
4. ✅ Import your songs
5. ✅ Start voting!

**Questions?** Check the [Troubleshooting](#troubleshooting) section or open a GitHub Issue.

---

**Ready for the Hottest 100?** 🔥

Your app is deployed and your family can start voting from any device!
