import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
