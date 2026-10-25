'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { initialUpdateSource } = require('./initial-update-fixture.cjs');
const { initialUpdateBoundary } = require('./initial-document-fixture.cjs');
const hash = value => createHash('sha256').update(value).digest('hex');

// Opt-in, real-app pwa.spec delivery only. No replacement HTML or app entry,
// browser API wrapper, Promise observer or storage operation. The default does
// not wait; the initial continuation gate is a separate, opt-in control.
function createApplicationUpdateComparison(probe, info, suppressInitialUpdate) {
  if (!probe || typeof suppressInitialUpdate !== 'boolean') throw Error('isolated continuation probe and boolean policy required');
  let phase = 'initial', closed = false;
  const sources = new Map();
  const report = { schema: 1, suppressInitialUpdate, browser: info.project?.name,
    identity: info.project?.metadata?.comparisonIdentity || 'isolated-real-app',
    clock: 'nodePerformanceMs is Node performance.now; browser document clocks remain separate',
    limits: { marks: 32, deliveries: 32 }, droppedMarks: 0, droppedDeliveries: 0,
    marks: [], deliveries: [], originalTestPassed: false, initialPreparation: null };
  const append = (list, value, limit, drop) => { if (list.length === limit) { list.shift(); report[drop]++; } list.push(value); };
  const now = () => ({ nodePerformanceMs: performance.now(), nodeEpochMs: Date.now() });
  const mark = stage => append(report.marks, { ...now(), stage }, 32, 'droppedMarks');
  return {
    phase: () => phase,
    mark,
    async waitForInitialContinuation(poll) {
      if (suppressInitialUpdate) throw Error('initial continuation control requires current update enabled');
      report.initialGate = { ...now(), outcome: 'running', timeoutMs: 12000 };
      mark('initial-continuation-gate-start');
      let boundary = null;
      try {
        await poll(() => {
          boundary = initialUpdateBoundary(probe.timeline(), false);
          return !!boundary;
        }, { timeout: 12000, message: 'initial document must reach register await continuation and explicit update return before reload' }).toBe(true);
        report.initialGate.outcome = 'passed'; report.initialGate.boundary = boundary;
        mark('initial-continuation-gate-passed');
      } catch (error) {
        report.initialGate.outcome = 'failed';
        report.initialGate.error = { name: typeof error?.name === 'string' ? error.name : 'other',
          messageSHA256: hash(typeof error?.message === 'string' ? error.message : '') };
        mark('initial-continuation-gate-failed'); throw error;
      } finally { report.initialGate.finished = now(); }
    },
    transform(source, requestPhase, response) {
      if (!['initial','reloaded'].includes(requestPhase)) throw Error('invalid request phase');
      const instrumented = probe.transform(source);
      const served = initialUpdateSource(instrumented, requestPhase, requestPhase === 'initial' && suppressInitialUpdate);
      const originalSha256 = hash(source), instrumentedSha256 = hash(instrumented), servedSha256 = hash(served);
      sources.set('product-update-manager.js', source);
      sources.set(requestPhase + '-served-' + servedSha256 + '.js', served);
      const delivery = { phase: requestPhase, suppress: requestPhase === 'initial' && suppressInitialUpdate,
        originalSha256, instrumentedSha256, servedSha256, bytes: Buffer.byteLength(served) };
      const record = stage => append(report.deliveries, { ...now(), ...delivery, stage }, 32, 'droppedDeliveries');
      record('body-prepared');
      response?.once('finish', () => { if (!closed) record('response-finish'); });
      response?.once('close', () => { if (!closed) record(response.writableFinished ? 'response-close-after-finish' : 'response-close-before-finish'); });
      return served;
    },
    beforeOriginalReload() {
      // Inspect only history already received at the original reload point.
      // Missing delivery is not proof that the initial operation did not run.
      const boundary = initialUpdateBoundary(probe.timeline(), suppressInitialUpdate);
      report.initialPreparation = { ...now(), confirmed: !!boundary, boundary,
        rule: report.initialGate ? 'received after opt-in initial gate; changed isolated preparation'
          : 'received before original reload; no added gate or preparation wait' };
      mark('original-reload-request'); phase = 'reloaded';
    },
    passed() { report.originalTestPassed = true; mark('original-test-passed'); },
    async finish() {
      if (closed) return;
      closed = true;
      report.finished = now();
      report.lastStage = report.marks.at(-1)?.stage || 'not-started';
      report.followingBoundaries = probe.timeline().filter(x => x.updateControl?.phase === 'reloaded');
      for (const [name, source] of sources) {
        const file = info.outputPath('pwa-update-sources', name);
        await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, source);
      }
      const file = info.outputPath('pwa-app-update-comparison.json');
      await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(report, null, 2) + '\n');
      if (info.attach) await info.attach('pwa-app-update-comparison', { path: file, contentType: 'application/json' });
    }
  };
}
module.exports = { createApplicationUpdateComparison };
