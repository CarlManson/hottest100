# Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Easiest)

1. Build the project:
   ```bash
   npm run build
   ```

2. Go to [Netlify](https://app.netlify.com/)
3. Drag and drop the `dist` folder into Netlify
4. Your app will be live in seconds!

### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/hottest100-app",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts`:
   ```ts
   export default defineConfig({
     base: '/hottest100-app/',
     plugins: [react()],
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Traditional Web Hosting

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist` folder to your web host via:
   - FTP
   - cPanel File Manager
   - SSH/SCP

3. Point your domain to the uploaded folder

## Important Notes

- All data is stored in browser local storage
- Each user/browser will have their own data
- Use the Export Data feature to backup before clearing browser data
- The app is 100% client-side, no server required

## Custom Domain

Most hosting providers allow you to add a custom domain:

1. Add your domain in the hosting provider's settings
2. Update your domain's DNS records to point to the host
3. Enable HTTPS (usually automatic)

## Environment Variables

This app doesn't require any environment variables or API keys.
