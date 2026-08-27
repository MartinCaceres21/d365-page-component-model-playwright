import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  // Isolated data is what makes parallel execution safe; see e2e/data.
  workers: process.env.CI ? 2 : undefined,
  // A stray test.only must never turn the pipeline green.
  forbidOnly: !!process.env.CI,
  // One retry only, so a genuine failure still fails and the retry produces the trace.
  retries: process.env.CI ? 1 : 0,
  timeout: 60000,
  expect: {
    timeout: 15000
  },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html']],
  use: {
    // Evidence for the failure, instead of re-running blindly until it passes.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: process.env.D365_BASE_URL
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
