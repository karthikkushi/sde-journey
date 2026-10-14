/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The site lives at https://karthikkushi.github.io/sde-journey/
// so every file path must start with /sde-journey/.
export default defineConfig({
  base: '/sde-journey/',
  plugins: [
    react(),
    // Makes the site installable on a phone and usable offline.
    // The service worker caches every built file, so all pages and notes work without internet.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SDE Journey',
        short_name: 'SDE Journey',
        description: '15-month study plan: Python, DSA, backend, interviews.',
        theme_color: '#0f1419',
        background_color: '#0f1419',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Notes are bundled into JS, so the bundle can be big. Allow up to 5 MB per file.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    // The "notes" chunk is the text of every note (for search and offline use). It loads only
    // on note pages and is cached once, so its size is expected. Code chunks stay far below this.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
