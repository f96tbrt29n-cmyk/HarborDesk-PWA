'use strict';

// Lifecycle observations only. Existing reporters and Playwright's exit status
// remain authoritative; no message, stack, attachment or application value is copied.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const STATUSES = new Set(['passed', 'failed', 'timedOut', 'skipped', 'interrupted']);
const OUTCOMES = new Set(['expected', 'unexpected', 'flaky', 'skipped']);
const FULL_STATUSES = new Set(['passed', 'failed', 'timedout', 'interrupted']);
const ERROR_NAMES = new Set(['Error', 'AssertionError', 'TimeoutError', 'TypeError', 'SyntaxError', 'RangeError', 'ReferenceError']);
const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min ? value : null;
const isoDate = value => value instanceof Date && Number.isFinite(value.getTime()) ? value.toISOString() : null;
const text = value => typeof value === 'string' ? value : null;

function sourceFile(file, root) {
  if (typeof file !== 'string' || file.includes('://')) return null;
  const clean = file.split(/[?#]/)[0];
  const relative = path.isAbsolute(clean) ? path.relative(root, clean) : clean;
  const normalized = relative.replaceAll('\\', '/');
  return /^tests\/[a-zA-Z0-9_./-]+\.(?:[cm]?js|ts)$/.test(normalized) && !normalized.split('/').includes('..') ? normalized : null;
}

function location(value, root) {
  const file = sourceFile(value?.file, root);
  return file ? { file, line: integer(value.line, 1), column: integer(value.column, 1) } : null;
}

function errorProjection(error, status, root) {
  const firstLine = typeof error?.message === 'string' ? error.message.split(/\r?\n/, 1)[0] : '';
  const category = status === 'timedOut' || /^Test timeout of \d+ms exceeded/.test(firstLine) ? 'timeout'
    : /^(?:Error:\s*)?(?:expect\(|expect\.)/.test(firstLine) ? 'assertion'
    : /^(?:Error:\s*)?(?:page|locator)\.[a-zA-Z]+:/.test(firstLine) ? 'page-or-locator'
    : /^(?:Unhandled Promise Rejection:\s*)?(?:TypeError:\s*)?(?:Load failed|Failed to fetch|NetworkError)/.test(firstLine) ? 'network'
    : 'error';
  return {
    name: ERROR_NAMES.has(error?.name) ? error.name : 'Error',
    category,
    location: location(error?.location, root)
  };
}

function attemptProjection(result, root) {
  const errors = Array.isArray(result.errors) ? result.errors : result.error ? [result.error] : [];
  return {
    retry: integer(result.retry),
    startedAt: isoDate(result.startTime),
    status: STATUSES.has(result.status) ? result.status : null,
    durationMs: Number.isFinite(result.duration) && result.duration >= 0 ? result.duration : null,
    workerIndex: integer(result.workerIndex),
    parallelIndex: integer(result.parallelIndex),
    errorCount: errors.length,
    // The first error's category/location is enough for targeted evidence lookup.
    firstError: errors.length ? errorProjection(errors[0], result.status, root) : null
  };
}

class CompactReporter {
  constructor(options = {}) {
    this.root = path.resolve(options.root || process.cwd());
    this.outputFile = options.outputFile || path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'harbordesk-ci-smoke', 'test-outcomes.json');
    this.maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
    this.cases = new Map();
    this.finished = false;
    this.fullStatus = null;
    this.collection = { writeFailures: 0, observationConflicts: 0, projectionFailures: 0, droppedGlobalErrors: 0 };
    this.globalErrors = [];
    this.initialized = false;
    this.disabled = false;
    this.warned = false;
  }

  printsToStdio() { return false; }

  _warn() {
    // Never print a caught error's body, path query or stack.
    if (this.warned) return;
    this.warned = true;
    try { process.stderr.write('CI compact metadata collection failed; original test results remain in standard reporters.\n'); }
    catch { /* A broken diagnostics stream must not rewrite the test result. */ }
  }

  _case(test) {
    if (typeof test.id !== 'string' || !test.id) throw new Error('Missing test identifier');
    const existing = this.cases.get(test.id);
    if (existing) {
      if (JSON.stringify(existing.titlePath) !== JSON.stringify(test.titlePath()) ||
          JSON.stringify(existing.location) !== JSON.stringify(location(test.location, this.root)))
        this.collection.observationConflicts++;
      return existing;
    }
    const titles = test.titlePath();
    if (!Array.isArray(titles) || !titles.every(title => typeof title === 'string')) throw new Error('Invalid public title path');
    const row = {
      id: test.id,
      project: text(test.parent?.project?.()?.name),
      location: location(test.location, this.root),
      titlePath: titles,
      initialExpectedStatus: STATUSES.has(test.expectedStatus) ? test.expectedStatus : null,
      expectedStatus: STATUSES.has(test.expectedStatus) ? test.expectedStatus : null,
      attempts: [], finalOutcome: null, ref: test
    };
    this.cases.set(test.id, row);
    return row;
  }

  _observe(callback) {
    try { callback(); }
    catch { this.collection.projectionFailures++; this._warn(); }
    this._write();
  }

  onBegin(config, suite) {
    this._observe(() => {
      if (this.initialized || fs.existsSync(this.outputFile)) {
        this.disabled = true;
        throw new Error('Earlier summary preserved');
      }
      this.initialized = true;
      for (const test of suite.allTests()) this._case(test);
    });
  }

  onTestBegin(test, result) {
    this._observe(() => {
      const row = this._case(test), retry = integer(result.retry);
      if (retry === null) throw new Error('Invalid retry');
      row.expectedStatus = STATUSES.has(test.expectedStatus) ? test.expectedStatus : null;
      const prior = row.attempts.find(attempt => attempt.retry === retry);
      if (prior) {
        if (prior.startedAt !== isoDate(result.startTime)) this.collection.observationConflicts++;
        return;
      }
      row.attempts.push({ retry, beginEventObserved: true, expectedStatusAtBegin: row.expectedStatus, expectedStatusAtEnd: null,
        startedAt: isoDate(result.startTime), status: null, durationMs: null,
        workerIndex: integer(result.workerIndex), parallelIndex: integer(result.parallelIndex),
        errorCount: null, firstError: null });
    });
  }

  onTestEnd(test, result) {
    this._observe(() => {
      const row = this._case(test), next = attemptProjection(result, this.root);
      if (next.retry === null || next.status === null) throw new Error('Invalid result');
      const index = row.attempts.findIndex(attempt => attempt.retry === next.retry);
      next.beginEventObserved = index >= 0 && row.attempts[index].beginEventObserved === true;
      next.expectedStatusAtBegin = index >= 0 ? row.attempts[index].expectedStatusAtBegin : null;
      next.expectedStatusAtEnd = STATUSES.has(test.expectedStatus) ? test.expectedStatus : null;
      row.expectedStatus = next.expectedStatusAtEnd;
      if (index < 0) row.attempts.push(next);
      else if (row.attempts[index].status === null) row.attempts[index] = next;
      else if (JSON.stringify(row.attempts[index]) !== JSON.stringify(next)) this.collection.observationConflicts++;
      // Same end event is deduplicated. A conflicting end never replaces an error.
    });
  }

  onError(error) {
    this._observe(() => {
      if (this.globalErrors.length < 64) this.globalErrors.push(errorProjection(error, null, this.root));
      else this.collection.droppedGlobalErrors++;
    });
  }

  onEnd(result) {
    this._observe(() => {
      this.finished = true;
      this.fullStatus = FULL_STATUSES.has(result.status) ? result.status : null;
      if (this.fullStatus === null) throw new Error('Unknown full result');
      for (const row of this.cases.values()) {
        row.expectedStatus = STATUSES.has(row.ref.expectedStatus) ? row.ref.expectedStatus : null;
        if (!row.attempts.some(attempt => attempt.status !== null) || row.attempts.some(attempt => attempt.status === null)) continue;
        const outcome = row.ref.outcome();
        row.finalOutcome = OUTCOMES.has(outcome) ? outcome : null;
      }
    });
    // No FullResult override: Playwright and the original reporters retain exit authority.
  }

  _snapshot() {
    const tests = [...this.cases.values()].map(({ ref, ...row }) => ({
      ...row, attempts: [...row.attempts].sort((a, b) => a.retry - b.retry)
    }));
    return {
      schemaVersion: 1,
      sourceSHA: /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || '') ? process.env.GITHUB_SHA : null,
      runId: /^[0-9]+$/.test(process.env.GITHUB_RUN_ID || '') ? process.env.GITHUB_RUN_ID : null,
      runAttempt: /^[0-9]+$/.test(process.env.GITHUB_RUN_ATTEMPT || '') ? process.env.GITHUB_RUN_ATTEMPT : null,
      context: { browser: ['chromium', 'webkit'].includes(process.env.HD_CI_BROWSER) ? process.env.HD_CI_BROWSER : null,
        shard: /^[1-4]\/[1-4]$/.test(process.env.HD_CI_SHARD || '') ? process.env.HD_CI_SHARD : null },
      node: process.version,
      runFinished: this.finished,
      fullStatus: this.fullStatus,
      scheduledCases: tests.length,
      observedAttemptEnds: tests.reduce((sum, test) => sum + test.attempts.filter(attempt => attempt.status !== null).length, 0),
      collection: { ...this.collection },
      globalErrors: this.globalErrors,
      tests
    };
  }

  _write() {
    if (!this.initialized || this.disabled) return;
    const temporary = this.outputFile + '.tmp';
    try {
      const body = JSON.stringify(this._snapshot()) + '\n';
      if (Buffer.byteLength(body) > this.maxBytes) throw new Error('Metadata size bound');
      fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
      fs.writeFileSync(temporary, body);
      fs.renameSync(temporary, this.outputFile);
    } catch {
      this.collection.writeFailures++;
      this._warn();
    }
  }
}

module.exports = CompactReporter;
module.exports.sourceFile = sourceFile;
module.exports.errorProjection = errorProjection;
module.exports.attemptProjection = attemptProjection;
