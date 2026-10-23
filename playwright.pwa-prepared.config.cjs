'use strict';
const base = require('./playwright.config.js');
module.exports = {
  ...base,
  testMatch: 'pwa.spec.js',
  grep: /PWA prepared (registration survives offline update refusal and stopped-origin reload|storage survives stopped-origin reload after load)$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // The test owns an isolated origin and stops it during the test.
  webServer: undefined,
  outputDir: 'test-results/pwa-prepared',
  reporter: [['line'], ['html', { outputFolder: 'playwright-report/pwa-prepared', open: 'never' }]],
  use: { ...base.use, trace: { mode: 'on', snapshots: false, screenshots: true, sources: true }, video: 'on' }
};
