import { defineConfig, devices } from '@playwright/test';

// The origin of a site deployment (the one the app's /help rewrite points at); the pages live
// under its /help base path. Locally, `pnpm dev` serves it on port 3001.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';

export default defineConfig({
    testDir: './tests/smoke',
    outputDir: './test-results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : undefined,
    reporter: process.env.CI
        ? [
              ['html', { outputFolder: './playwright-report', open: 'never' }],
              ['github'],
              ['json', { outputFile: './test-results/results.json' }],
          ]
        : [
              [
                  'html',
                  { outputFolder: './playwright-report', open: 'on-failure' },
              ],
          ],
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
