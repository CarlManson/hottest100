import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

// The app icon (browser tab + home screen) lives with the rest of the event branding.
// Swap the file to change it; see src/assets/brand/README.md.
const APP_ICON = 'src/assets/brand/app-icon.png'
const BRAND_CONFIG = 'src/config/brand.ts'
const SERVICE_WORKER = 'pwa/service-worker.js'

// Pull the app name and menu bar colour from the brand config so there's one place to edit them
function readBrand() {
  const source = readFileSync(resolve(__dirname, BRAND_CONFIG), 'utf8')
  const pick = (pattern: RegExp, fallback: string) => source.match(pattern)?.[1] ?? fallback
  return {
    name: pick(/appName:\s*'([^']+)'/, 'Fairest 100'),
    description: pick(/tagline:\s*'([^']+)'/, 'Triple J Hottest 100 predictions tracker'),
    themeColor: pick(/surface:\s*'([^']+)'/, '#292e47'),
  }
}

function buildManifest(iconUrl: string) {
  const { name, description, themeColor } = readBrand()
  return JSON.stringify({
    id: '/',
    name,
    short_name: name,
    description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons: [
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android crops this to its own shape; keep the artwork inside the middle 80% of the icon
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2)
}

// The service worker that makes the site installable. Each build gets a new version so phones
// pick up the new files and drop the old ones.
function buildServiceWorker(precache: string[]) {
  const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)
  return readFileSync(resolve(__dirname, SERVICE_WORKER), 'utf8')
    .replace('__VERSION__', version)
    .replace('__PRECACHE__', JSON.stringify(precache))
}

// Serves /manifest.webmanifest (home screen name + icon) in dev and writes it and /sw.js into the build
function appManifest(): Plugin {
  return {
    name: 'app-manifest',
    configureServer(server) {
      server.middlewares.use('/manifest.webmanifest', (_req, res) => {
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(buildManifest(`/${APP_ICON}`))
      })
    },
    transformIndexHtml() {
      const { name, themeColor } = readBrand()
      const meta = (attrs: Record<string, string>) => ({ tag: 'meta', attrs, injectTo: 'head' as const })
      return [
        meta({ name: 'theme-color', content: themeColor }),
        // Home screen behaviour on iPhone: open full screen, under this name
        meta({ name: 'mobile-web-app-capable', content: 'yes' }),
        meta({ name: 'apple-mobile-web-app-capable', content: 'yes' }),
        meta({ name: 'apple-mobile-web-app-title', content: name }),
        meta({ name: 'apple-mobile-web-app-status-bar-style', content: 'black' }),
      ]
    },
    generateBundle(_options, bundle) {
      const ref = this.emitFile({ type: 'asset', name: 'app-icon.png', source: readFileSync(resolve(__dirname, APP_ICON)) })
      const icon = `/${this.getFileName(ref)}`
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: buildManifest(icon) })
      // Precache the app shell: the page, its scripts and styles, and the icon. Images load as needed.
      const shell = Object.keys(bundle).filter((file) => /\.(js|css)$/.test(file)).map((file) => `/${file}`)
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: buildServiceWorker(['/', '/manifest.webmanifest', icon, ...shell.sort()]),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), appManifest()],
  base: '/',
})
