import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
    testDir: './tests',
    outputDir: './test-results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI
        ? [
              ['html', { outputFolder: './playwright-report', open: 'never' }],
              ['github'],
          ]
        : [
              [
                  'html',
                  { outputFolder: './playwright-report', open: 'on-failure' },
              ],
          ],
    timeout: 60_000,
    expect: { timeout: 10_000 },
    use: {
        baseURL,
        navigationTimeout: 30_000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
