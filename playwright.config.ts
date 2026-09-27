import { defineConfig, devices } from '@playwright/test';

// A dedicated local port avoids taking over the developer's server on 8080.
const port = 4180;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'node tooling/start-e2e.cjs',
    url: `${baseURL}/healthcheck`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PORT: String(port) }
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.platform === 'win32' ? 'msedge' : undefined
      }
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        channel: process.platform === 'win32' ? 'msedge' : undefined
      }
    }
  ]
});
