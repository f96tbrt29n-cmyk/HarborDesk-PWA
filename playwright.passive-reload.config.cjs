// Bounded private comparison: identical six-key fixture, one run per engine/mode.
// No release workflow or user profile uses this configuration.
const path = require('node:path');
const base = require('./playwright.reload-probe.config.cjs');
const output = process.env.HD_RELOAD_EVIDENCE_DIR || path.join(__dirname, 'test-results', 'passive-reload-' + Date.now());
module.exports = {
  ...base, retries: 0, workers: 1, outputDir: path.join(output, 'artifacts'),
  reporter: [['line'], ['json', { outputFile: path.join(output, 'summary.json') }]],
  projects: base.projects.filter(p => !p.name.endsWith('-retention')).map(p => ({
    ...p, metadata: { ...p.metadata, retentionFixture: true },
  })),
};
