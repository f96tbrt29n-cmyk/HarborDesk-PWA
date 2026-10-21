'use strict';
const { expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

// This is observable preparation, not an observer of the register Promise or
// proof of a particular native job. No injected source, writes or extra calls
// to register/update/ready; a controller/registration count alone cannot pass.
async function waitForInitialRegistration(page, testInfo, target, poll = expect.poll) {
  const report = { target, timeout: 12000, limit: 64, dropped: 0, samples: [], outcome: 'running' };
  let documentOrigin, failed = false;
  try {
    await poll(async () => {
      const sample = { nodeEpochMs: Date.now(), nodeMs: performance.now() };
      if (report.samples.length === report.limit) { report.samples.shift(); report.dropped++; }
      report.samples.push(sample);
      const value = await page.evaluate(async scope => {
        const reg = await navigator.serviceWorker.getRegistration(scope);
        return {
          status: window.HD_SERVICE_WORKER_STATUS,
          document: { timeOrigin: performance.timeOrigin, at: performance.now(), readyState: document.readyState,
            url: location.origin + location.pathname },
          registration: reg ? { scope: reg.scope, active: reg.active ? { scriptURL: reg.active.scriptURL, state: reg.active.state } : null } : null
        };
      }, target.scope);
      Object.assign(sample, value, { receivedNodeMs: performance.now() });
      documentOrigin ??= value.document.timeOrigin;
      if (documentOrigin !== value.document.timeOrigin) throw new Error('initial preparation document changed');
      return ['registered', 'ready'].includes(value.status) && value.registration?.scope === target.scope &&
        value.registration?.active?.scriptURL === target.scriptURL && value.registration.active.state === 'activated';
    }, { timeout: 12000, message: 'initial document needs application registration and the target activated worker' }).toBe(true);
    report.outcome = 'passed';
  } catch (error) {
    failed = true;
    report.outcome = 'failed';
    // Keep the original error. Never perform another read after failure.
    report.errorName = error.name;
    throw error;
  } finally {
    const file = testInfo.outputPath('pwa-initial-preparation.json');
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(report, null, 2) + '\n');
      await testInfo.attach('pwa-initial-preparation', { path: file, contentType: 'application/json' });
    } catch (error) { if (!failed) throw error; console.error('PWA initial preparation evidence could not be saved', error.name); }
  }
}
module.exports = { waitForInitialRegistration };
