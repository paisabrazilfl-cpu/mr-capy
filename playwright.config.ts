import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Mr. Capy smoke test.
 *
 * Run with:  npm run test:e2e
 * It boots the Vite dev server automatically (see webServer below).
 *
 * NOTE: Playwright + its browser binaries must be installed first:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 * These require outbound network access.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
