import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

// The home screen app itself (name, icons, colours) is public/manifest.webmanifest + public/icons/.
const SERVICE_WORKER = 'pwa/service-worker.js'

// Writes /sw.js from pwa/service-worker.js. Each build gets a new version so phones pick up the new
// files and drop the old ones. Only the main app's shell is precached; the /tv/ page is left alone.
function serviceWorker(): Plugin {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = new Set<string>()
      const visit = (fileName: string) => {
        const chunk = bundle[fileName]
        if (!chunk || chunk.type !== 'chunk' || files.has(fileName)) return
        files.add(fileName)
        chunk.viteMetadata?.importedCss.forEach((css) => files.add(css))
        chunk.imports.forEach(visit)
      }
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry && chunk.name === 'main') visit(chunk.fileName)
      }
      const precache = ['/', '/manifest.webmanifest', '/icons/icon-192.png', ...[...files].sort().map((file) => `/${file}`)]
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)
      const source = readFileSync(resolve(__dirname, SERVICE_WORKER), 'utf8')
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace('__PRECACHE__', JSON.stringify(precache))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // fairest100.au/tv: short TV address with a lightweight view for old smart-TV browsers
        tv: resolve(__dirname, 'tv/index.html'),
      },
    },
  },
})
