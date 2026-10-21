'use strict';
const { expect } = require('@playwright/test');

// An existing native controller/ready registration need not be the registration
// that update-manager started for this document. Wait for its application state,
// without observing or replacing the native registration Promise.
async function waitForApplicationRegistration(page) {
  await expect.poll(() => page.evaluate(() =>
    ['registered', 'ready'].includes(window.HD_SERVICE_WORKER_STATUS)
  ), { timeout: 12000, message: 'this document must complete application SW registration' }).toBe(true);
}

module.exports = { waitForApplicationRegistration };
