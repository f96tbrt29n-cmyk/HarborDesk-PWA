'use strict';

// Reporting only: use the same projects, deadlines, retries, fixtures and server.
const base = require('./playwright.config.js');
module.exports = {
  ...base,
  reporter: [...base.reporter, ['./tests/ci-compact-reporter.cjs']]
};
