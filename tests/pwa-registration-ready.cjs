'use strict';
const { expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createHash } = require('node:crypto');

const states = new Set(['idle', 'registering', 'registered', 'ready', 'error', 'unsupported']);
const ids = new WeakMap();
let nextId = 0;
const idFor = object => {
  if (!ids.has(object)) ids.set(object, ++nextId);
  return ids.get(object);
};
const fingerprint = text => ({ length: text.length, sha256: createHash('sha256').update(text).digest('hex') });
function classify(value, valueType = typeof value) {
  if (valueType === 'string' && states.has(value)) return { category: value, type: 'string' };
  if (valueType === 'undefined' && value === undefined) return { category: 'undefined', type: 'undefined' };
  return { category: 'unexpected', type: value === null ? 'null' : valueType,
    ...(typeof value === 'string' ? { string: fingerprint(value) } : {}) };
}
function safeUrl(value) {
  try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.origin + u.pathname.slice(0, 256) : u.protocol; }
  catch { return 'unavailable'; }
}
function errorSummary(error) {
  const name = typeof error?.name === 'string' ? error.name : typeof error;
  return { name: ['Error','TypeError','SecurityError','AbortError','NetworkError','InvalidStateError','Cannot load http'].includes(name) ? name : 'other',
    message: fingerprint(typeof error?.message === 'string' ? error.message : '') };
}

// Installed before navigation, but does not inject page scripts, observe native
// Promises or read storage. Document identity is only timeOrigin correlation.
function observeApplicationRegistration(page, testInfo, { sampleLimit = 64, eventLimit = 32 } = {}) {
  if (![sampleLimit, eventLimit].every(n => Number.isInteger(n) && n > 0 && n <= 64)) throw new Error('invalid registration evidence limit');
  const start = performance.now();
  const report = { schema: 1, nodeStartedAt: Date.now(), nodeStartedPerformanceMs: start, pageId: idFor(page), contextId: idFor(page.context()),
    clock: 'nodeMs is relative Node performance.now; document timeOrigin/at are a separate browser clock',
    documentIdentity: 'timeOrigin correlation, not a native document ID',
    limits: { samples: sampleLimit, events: eventLimit, policy: 'retain newest; drop oldest' },
    droppedSamples: 0, droppedEvents: 0, samples: [], events: [], wait: { outcome: 'not-entered' } };
  let closed = false, sequence = 0;
  const now = () => ({ nodeMs: performance.now() - start, nodeEpochMs: Date.now() });
  const append = (list, value, limit, dropped) => { if (list.length >= limit) { list.shift(); report[dropped]++; } list.push(value); };
  const record = (kind, data = {}) => { if (!closed) append(report.events, { ...now(), kind, ...data }, eventLimit, 'droppedEvents'); };
  const onError = error => record('pageerror', { error: errorSummary(error), document: null });
  const onConsole = message => {
    if (message.type() !== 'warning') return;
    const text = message.text();
    if (text.startsWith('HarborDesk Service Worker registration failed')) record('registration-warning', { text: fingerprint(text), document: null });
  };
  const onNavigation = frame => { if (frame === page.mainFrame()) record('main-frame-navigation', { url: safeUrl(frame.url()), document: null }); };
  const onLoad = () => record('page-load', { document: null });
  const onDCL = () => record('page-domcontentloaded', { document: null });
  const listeners = { pageerror: onError, console: onConsole, framenavigated: onNavigation, load: onLoad, domcontentloaded: onDCL };
  for (const [name, listener] of Object.entries(listeners)) page.on(name, listener);
  return {
    identity: { pageId: report.pageId, contextId: report.contextId },
    begin() { report.wait = { outcome: 'running', ...now() }; },
    outcome(value, error) { report.wait.outcome = value; report.wait.finished = now(); if (value === 'failed') report.wait.error = errorSummary(error); },
    async sample() {
      const sample = { sequence: ++sequence, ...now(), outcome: 'pending', document: null };
      append(report.samples, sample, sampleLimit, 'droppedSamples');
      try {
        // State and document metadata come from the same original poll read.
        const result = await page.evaluate(() => {
          const status = window.HD_SERVICE_WORKER_STATUS;
          return { status, statusType: typeof status,
            document: { timeOrigin: performance.timeOrigin, at: performance.now(), readyState: document.readyState,
            url: location.origin + location.pathname, mainFrame: window === window.top }
          };
        });
        if (!closed) Object.assign(sample, { received: now(), outcome: 'value', state: classify(result.status, result.statusType),
          document: { timeOrigin: result.document.timeOrigin, at: result.document.at,
            readyState: result.document.readyState, url: safeUrl(result.document.url), mainFrame: result.document.mainFrame } });
        return result.status === 'registered' || result.status === 'ready';
      } catch (error) {
        if (!closed) Object.assign(sample, { received: now(), outcome: 'evaluate-error', error: errorSummary(error) });
        throw error;
      }
    },
    async finish() {
      if (closed) return;
      closed = true;
      report.closed = now();
      for (const [name, listener] of Object.entries(listeners)) page.off(name, listener);
      const file = testInfo.outputPath('pwa-registration-state.json');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(report, null, 2) + '\n');
      if (testInfo.attach) await testInfo.attach('pwa-registration-state', { path: file, contentType: 'application/json' });
    }
  };
}

// The third argument is only a dependency seam for deterministic Node contracts.
// Runtime uses the same expect.poll timeout/default intervals/success criterion.
async function waitForApplicationRegistration(page, evidence, poll = expect.poll) {
  let failed = false;
  evidence.begin();
  try {
    await poll(() => evidence.sample(), { timeout: 12000, message: 'this document must complete application SW registration' }).toBe(true);
    evidence.outcome('passed');
  } catch (error) {
    failed = true; evidence.outcome('failed', error); throw error;
  } finally {
    try { await evidence.finish(); }
    catch (error) { if (!failed) throw error; console.error('PWA registration evidence could not be saved', errorSummary(error)); }
  }
}

module.exports = { waitForApplicationRegistration, observeApplicationRegistration };
