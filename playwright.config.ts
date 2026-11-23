import { defineConfig, devices } from '@playwright/test'

// Runs against the production build so the service worker is real.
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173/kaizen/', ...devices['iPhone 15'], browserName: 'chromium' },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/kaizen/', reuseExistingServer: true },
})
