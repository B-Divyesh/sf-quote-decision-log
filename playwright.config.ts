import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  // Chromium occasionally exits with SIGSEGV in this constrained worker while
  // opening a fresh context. A single retry recovers that runner failure; a
  // real assertion still has to pass on the retry.
  retries: 1,
  workers: 1,
  use: { baseURL: externalBaseUrl ?? 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: externalBaseUrl ? undefined : { command: 'npm run build && npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
