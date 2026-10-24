const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: { timeout: 12000 },
  fullyParallel: !!process.env.CI,
  workers: process.env.CI ? 2 : 1,
  retries: 1,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ...(process.env.CI ? [['github']] : [])
  ],
  use: {
    viewport: { width: 390, height: 844 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ],
  webServer: {
    command: process.env.HD_RELOAD_BUFFER_SW === '1' ? 'python3 tests/sw-reload-probe-server.py --directory .' : 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: process.env.HD_RELOAD_BUFFER_SW !== '1',
    timeout: 120000
  },
  outputDir: 'test-results'
});
