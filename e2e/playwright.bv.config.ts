import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('e2e/.env') });

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
    testDir: './tests/bv',
    outputDir: './test-results',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
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
    timeout: 240_000,
    expect: { timeout: 12_000 },
    use: {
        baseURL,
        actionTimeout: 18_000,
        navigationTimeout: 30_000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
