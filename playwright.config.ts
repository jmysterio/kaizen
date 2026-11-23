import { defineConfig, devices } from '@playwright/test'

// E2E_PORT lets parallel worktrees each run their own preview server without testing each other's build.
const port = Number(process.env.E2E_PORT ?? 4173)
const url = `http://localhost:${port}/kaizen/`

// Runs against the production build so the service worker is real.
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: url, ...devices['iPhone 15'], browserName: 'chromium' },
  webServer: { command: `npm run build && npx vite preview --port ${port} --strictPort`, url, reuseExistingServer: false },
})
