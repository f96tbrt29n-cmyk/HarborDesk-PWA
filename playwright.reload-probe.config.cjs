// Explicit diagnostic experiment; not the release regression configuration.
const path = require('node:path');
const base = require('./playwright.config.js');
const output = process.env.HD_RELOAD_EVIDENCE_DIR || path.join(__dirname, 'test-results', 'reload-probe-' + Date.now());
module.exports = {
  ...base, testMatch: 'night-policy-reload.spec.js', grep: /carrier night CI policy/,
  retries: 0, workers: 1, outputDir: path.join(output, 'artifacts'),
  reporter: [['line'], ['json', { outputFile: path.join(output, 'summary.json') }]],
  webServer: {
    ...base.webServer,
    command: 'python3 tests/sw-reload-probe-server.py --directory .',
    cwd: __dirname, reuseExistingServer: false,
  },
  projects: ['webkit', 'chromium'].flatMap(browser => ['allow', 'block', 'probe', 'retention'].map(mode => ({
    name: browser + '-' + mode, metadata: { swProbe: mode === 'probe', retentionFixture: mode === 'retention' },
    use: {
      browserName: browser, serviceWorkers: mode === 'block' ? 'block' : 'allow',
      ...(browser === 'chromium' && process.env.HD_CHROMIUM_EXECUTABLE ? { launchOptions: { executablePath: process.env.HD_CHROMIUM_EXECUTABLE } } : {}),
    },
  }))),
};
