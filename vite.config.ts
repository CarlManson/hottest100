import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The app icon (browser tab + home screen) lives with the rest of the event branding.
// Swap the file to change it; see src/assets/brand/README.md.
const APP_ICON = 'src/assets/brand/app-icon.png'
const BRAND_CONFIG = 'src/config/brand.ts'

// Pull the app name and menu bar colour from the brand config so there's one place to edit them
function readBrand() {
  const source = readFileSync(resolve(__dirname, BRAND_CONFIG), 'utf8')
  const pick = (pattern: RegExp, fallback: string) => source.match(pattern)?.[1] ?? fallback
  return {
    name: pick(/appName:\s*'([^']+)'/, 'Fairest 100'),
    themeColor: pick(/surface:\s*'([^']+)'/, '#292e47'),
  }
}

function buildManifest(iconUrl: string) {
  const { name, themeColor } = readBrand()
  return JSON.stringify({
    name,
    short_name: name,
    start_url: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons: [{ src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any' }],
  }, null, 2)
}

// Serves /manifest.webmanifest (home screen name + icon) in dev and writes it into the build
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
      return [{ tag: 'meta', attrs: { name: 'theme-color', content: readBrand().themeColor }, injectTo: 'head' }]
    },
    generateBundle() {
      const ref = this.emitFile({ type: 'asset', name: 'app-icon.png', source: readFileSync(resolve(__dirname, APP_ICON)) })
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: buildManifest(`/${this.getFileName(ref)}`) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), appManifest()],
  base: '/',
})
