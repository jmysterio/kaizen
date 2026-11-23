/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app at /kaizen/
export default defineConfig({
  base: '/kaizen/',
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Latin font files and photos are precached so the app looks right offline.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webp}', '**/*-latin-*.woff2'] },
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Kaizen',
        short_name: 'Kaizen',
        description: 'Journal, habits, time and reflection — stored only on this device.',
        display: 'standalone',
        start_url: '/kaizen/',
        scope: '/kaizen/',
        background_color: '#F1EFE9',
        theme_color: '#F1EFE9',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
})
