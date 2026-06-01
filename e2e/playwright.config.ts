import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

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
    // Proposals navigate waits up to PROPOSALS_API_TIMEOUT for API + list render.
    timeout: 90_000,
    expect: { timeout: process.env.CI ? 15_000 : 10_000 },
    use: {
        baseURL,
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
