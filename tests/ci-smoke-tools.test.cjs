'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const { smokeFiles, partition, fileWeight, validateCosts, parseArgs, loadPlan } = require('./ci-smoke-shards.cjs');
const Reporter = require('./ci-compact-reporter.cjs');
const { errorProjection, sourceFile } = Reporter;
const ROOT = path.resolve(__dirname, '..');

function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'hd-ci-tools-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function fakeTest(id = 'test-a', title = 'public source title') {
  const test = { id, location: { file: path.join(ROOT, 'tests/example.spec.js'), line: 3, column: 1 },
    expectedStatus: 'passed', parent: { project: () => ({ name: 'webkit' }) },
    titlePath() { return ['', 'webkit', 'example.spec.js', title]; },
    outcome() { assert.equal(this, test); return 'flaky'; } };
  return test;
}
function attempt(retry, status = 'passed') {
  return { retry, startTime: new Date('2026-11-06T00:00:00Z'), status,
    duration: 12, workerIndex: 0, parallelIndex: 0, errors: [] };
}
function newReporter(t, tests = [fakeTest()]) {
  const directory = temporary(t), outputFile = path.join(directory, 'summary.json');
  const reporter = new Reporter({ root: ROOT, outputFile });
  reporter.onBegin({}, { allTests: () => tests });
  return { reporter, tests, outputFile, read: () => JSON.parse(fs.readFileSync(outputFile, 'utf8')) };
}

test('smoke file parser accepts only the exact literal suite and rejects unsafe or duplicate selection', () => {
  assert.deepEqual(smokeFiles('playwright test tests/a.spec.js tests/b.spec.js'), ['tests/a.spec.js', 'tests/b.spec.js']);
  for (const script of ['playwright test', 'playwright test tests/a.spec.js tests/a.spec.js',
    'playwright test tests/*.spec.js', 'playwright test tests/a.spec.js --grep ready',
    'playwright test tests/../a.spec.js', 'playwright test tests/a.spec.js\necho bad', 'echo playwright test tests/a.spec.js'])
    assert.throws(() => smokeFiles(script));
});

test('whole-file partition is deterministic, exactly once, source ordered and keeps heavy groups separate', () => {
  const files = ['tests/a.spec.js', 'tests/b.spec.js', 'tests/c.spec.js', 'tests/d.spec.js', 'tests/e.spec.js', 'tests/f.spec.js'];
  const costs = { schemaVersion: 1, fallbackSeconds: { routeFile: 90, otherFile: 30 },
    observedSecondsByFile: { 'tests/a.spec.js': 1000, 'tests/b.spec.js': 900, 'tests/c.spec.js': 800, 'tests/d.spec.js': 700 } };
  const bins = partition(files, costs);
  assert.deepEqual(bins, partition(files, costs));
  assert.deepEqual(bins.flatMap(bin => bin.files).sort(), [...files].sort());
  assert.equal(new Set(bins.flatMap(bin => bin.files)).size, files.length);
  for (const bin of bins) {
    assert.equal(bin.files.filter(file => ['a', 'b', 'c', 'd'].some(name => file === `tests/${name}.spec.js`)).length, 1);
    assert.deepEqual(bin.files, files.filter(file => bin.files.includes(file)));
  }
  assert.throws(() => partition([...files, files[0]], costs));
});

test('partial and unobserved file costs have positive conservative floors, never skipped or zero cost', () => {
  const costs = { schemaVersion: 1, fallbackSeconds: { routeFile: 90, otherFile: 30 }, observedSecondsByFile: { 'tests/route-new.spec.js': 1 } };
  validateCosts(costs);
  assert.equal(fileWeight('tests/route-new.spec.js', costs), 90);
  assert.equal(fileWeight('tests/optional-anti-air-hints.spec.js', costs), 30);
  for (const value of [-1, Infinity, NaN, '30', Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => validateCosts({ ...costs, observedSecondsByFile: { 'tests/x.spec.js': value } }));
});

test('partition CLI refuses filtering deadline retry worker and unsupported shard overrides', () => {
  assert.deepEqual(parseArgs(['--plan']), { mode: 'plan', shard: null });
  assert.deepEqual(parseArgs(['--shard=4/4']), { mode: 'files', shard: 4 });
  for (const args of [[], ['--shard=0/4'], ['--shard=1/5'], ['--shard=1/4', '--shard=2/4'],
    ['--plan', '--shard=1/4'], ['--shard=1/4', '--grep=ready'], ['--shard=1/4', '--timeout=60000'],
    ['--shard=1/4', '--retries=0'], ['--shard=1/4', '--workers=2']]) assert.throws(() => parseArgs(args));
});

test('actual fixed smoke list including new specs is partitioned once without changing package order', () => {
  const files = smokeFiles(require('../package.json').scripts['test:browser']), plan = loadPlan(ROOT);
  assert.equal(plan.project, 'webkit');
  assert.equal(plan.fileCount, files.length);
  assert.ok(files.includes('tests/optional-anti-air-hints.spec.js'));
  assert.deepEqual(plan.bins.flatMap(bin => bin.files).sort(), [...files].sort());
  assert.equal(plan.estimatesAreFutureRuntimeGuarantees, false);
});

test('CI configuration adds a reporter while retaining every original runtime and assertion setting', () => {
  const base = require('../playwright.config.js'), ci = require('../playwright.ci.config.cjs');
  assert.deepEqual(new Set(Reflect.ownKeys(ci)), new Set(Reflect.ownKeys(base)));
  for (const key of Reflect.ownKeys(base)) if (key !== 'reporter') assert.equal(ci[key], base[key]);
  assert.deepEqual(ci.reporter.slice(0, -1), base.reporter);
  assert.deepEqual(ci.reporter.at(-1), ['./tests/ci-compact-reporter.cjs']);
  assert.equal(ci.timeout, 45000);assert.equal(ci.expect.timeout, 12000);assert.equal(ci.retries, 1);
});

test('partial snapshots distinguish planned active ended and retry observations without inferring final success', t => {
  const a = fakeTest('a'), b = fakeTest('b'), f = newReporter(t, [a, b]);
  assert.equal(f.read().runFinished, false);
  assert.equal(f.read().tests[0].attempts.length, 0);
  f.reporter.onTestBegin(a, attempt(0));
  assert.equal(f.read().tests[0].attempts[0].status, null);
  f.reporter.onTestEnd(a, attempt(0, 'failed'));
  f.reporter.onTestBegin(a, attempt(1));
  let data = f.read();assert.equal(data.runFinished, false);assert.equal(data.tests[0].finalOutcome, null);
  assert.deepEqual(data.tests[0].attempts.map(row => row.status), ['failed', null]);
  f.reporter.onEnd({ status: 'interrupted' });
  data = f.read();assert.equal(data.fullStatus, 'interrupted');
  assert.equal(data.tests[0].finalOutcome, null);assert.equal(data.tests[1].finalOutcome, null);
});

test('completed retry results retain the first error and original result status and expose outcome only after onEnd', t => {
  const f = newReporter(t), test = f.tests[0], first = attempt(0, 'failed'), retry = attempt(1);
  first.errors = [{ name: 'Error', message: 'Error: expect(received).toEqual(expected)\nPRIVATE VALUE', stack: 'PRIVATE STACK' }];
  const original = JSON.stringify(first);
  f.reporter.onTestBegin(test, first);f.reporter.onTestEnd(test, first);
  f.reporter.onTestBegin(test, retry);f.reporter.onTestEnd(test, retry);
  assert.equal(f.read().tests[0].finalOutcome, null);
  assert.equal(f.reporter.onEnd({ status: 'passed' }), undefined);
  const data = f.read();assert.deepEqual(data.tests[0].attempts.map(row => row.status), ['failed', 'passed']);
  assert.deepEqual(data.tests[0].attempts.map(row => row.expectedStatusAtEnd), ['passed', 'passed']);
  assert.equal(data.tests[0].finalOutcome, 'flaky');
  assert.equal(JSON.stringify(first), original);
  assert.equal(fs.existsSync(f.outputFile + '.tmp'), false);
});

test('dynamic expected failure and skip are observed at the proper lifecycle point without becoming unexpected failures', t => {
  const expectedFailure = fakeTest('expected-failure'), skipped = fakeTest('dynamic-skip');
  expectedFailure.outcome = function () { assert.equal(this, expectedFailure); return 'expected'; };
  skipped.outcome = function () { assert.equal(this, skipped); return 'skipped'; };
  const f = newReporter(t, [expectedFailure, skipped]), failedResult = attempt(0, 'failed'), skippedResult = attempt(0, 'skipped');
  const originalFailed = JSON.stringify(failedResult), originalSkipped = JSON.stringify(skippedResult);
  f.reporter.onTestBegin(expectedFailure, failedResult);
  expectedFailure.expectedStatus = 'failed'; // test.fail() can change this in the body.
  f.reporter.onTestEnd(expectedFailure, failedResult);
  f.reporter.onTestBegin(skipped, skippedResult);
  skipped.expectedStatus = 'skipped'; // Likewise for a body-level test.skip().
  f.reporter.onTestEnd(skipped, skippedResult);
  let data = f.read();
  assert.deepEqual(data.tests.map(row => row.initialExpectedStatus), ['passed', 'passed']);
  assert.deepEqual(data.tests.map(row => row.expectedStatus), ['failed', 'skipped']);
  assert.deepEqual(data.tests.map(row => row.attempts[0].expectedStatusAtBegin), ['passed', 'passed']);
  assert.deepEqual(data.tests.map(row => row.attempts[0].expectedStatusAtEnd), ['failed', 'skipped']);
  assert.ok(data.tests.every(row => row.finalOutcome === null));
  assert.equal(f.reporter.onEnd({ status: 'passed' }), undefined);
  data = f.read();assert.deepEqual(data.tests.map(row => row.finalOutcome), ['expected', 'skipped']);
  assert.deepEqual(data.tests.map(row => row.attempts[0].status), ['failed', 'skipped']);
  assert.equal(JSON.stringify(failedResult), originalFailed);assert.equal(JSON.stringify(skippedResult), originalSkipped);
});

test('same end callback is deduplicated and conflicting callbacks cannot overwrite a failed attempt', t => {
  const f = newReporter(t), test = f.tests[0], failed = attempt(0, 'failed');
  f.reporter.onTestEnd(test, failed);f.reporter.onTestEnd(test, failed);
  assert.equal(f.read().observedAttemptEnds, 1);assert.equal(f.read().collection.observationConflicts, 0);
  f.reporter.onTestEnd(test, attempt(0, 'passed'));
  const data = f.read();assert.equal(data.tests[0].attempts[0].status, 'failed');
  assert.equal(data.collection.observationConflicts, 1);
});

test('error projection excludes messages stacks values URL queries and non-source paths', () => {
  const error = { name: 'TypeError', message: 'Load failed SECRET-BODY', stack: 'SECRET-STACK', value: 'SECRET-VALUE',
    location: { file: path.join(ROOT, 'tests/example.spec.js') + '?token=SECRET-QUERY', line: 4, column: 2 } };
  const projected = errorProjection(error, 'failed', ROOT);
  assert.equal(projected.category, 'network');assert.equal(projected.location.file, 'tests/example.spec.js');
  assert.ok(!JSON.stringify(projected).includes('SECRET'));
  assert.equal(sourceFile('https://example.invalid/a.js?token=SECRET', ROOT), null);
  assert.equal(sourceFile('../outside.js', ROOT), null);
  assert.equal(errorProjection({ ...error, location: { file: '/outside/private.js' } }, 'failed', ROOT).location, null);
});

test('summary collection failure preserves the previous valid snapshot and never rewrites test results', t => {
  const f = newReporter(t), initial = fs.readFileSync(f.outputFile, 'utf8'), result = attempt(0, 'failed');
  f.reporter.maxBytes = 1;
  assert.doesNotThrow(() => f.reporter.onTestEnd(f.tests[0], result));
  assert.equal(fs.readFileSync(f.outputFile, 'utf8'), initial);
  assert.equal(f.reporter.collection.writeFailures, 1);assert.equal(result.status, 'failed');
});

test('a prior summary is preserved and bounded global errors cannot leak original error bodies', t => {
  const directory = temporary(t), outputFile = path.join(directory, 'previous.json');fs.writeFileSync(outputFile, 'EARLIER');
  const prior = new Reporter({ outputFile, root: ROOT });prior.onBegin({}, { allTests: () => [] });
  assert.equal(fs.readFileSync(outputFile, 'utf8'), 'EARLIER');assert.equal(prior.disabled, true);
  const f = newReporter(t);
  for (let i = 0; i < 65; i++) f.reporter.onError({ message: 'SECRET-ERROR', value: 'SECRET-VALUE', stack: 'SECRET-STACK' });
  const data = f.read();assert.equal(data.globalErrors.length, 64);assert.equal(data.collection.droppedGlobalErrors, 1);
  assert.ok(!JSON.stringify(data).includes('SECRET'));
});

function workflowScript(browser) {
  const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/browser-regression.yml'), 'utf8');
  const block = workflow.split('      - name: Run smoke browser regression\n')[1].split('\n      # Small lifecycle')[0];
  const script = block.split('        run: |\n')[1].split('\n').map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');
  const values = { browser, workers: browser === 'webkit' ? '1' : '2', shard: '1', shards: browser === 'webkit' ? '4' : '2' };
  return script.replace(/\$\{\{ matrix\.(browser|workers|shard|shards) \}\}/g, (_, key) => values[key]);
}
function fakeRunner(t, plannerMode = 'normal') {
  const directory = temporary(t), bin = path.join(directory, 'bin');fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'node'), '#!/bin/sh\nif [ "$1" = "tests/ci-smoke-shards.cjs" ]; then\n' +
    (plannerMode === 'fail' ? ' exit 71\n' : plannerMode === 'empty' ? ' exit 0\n' : ' printf "%s\\n" tests/a.spec.js tests/b.spec.js\n exit 0\n') +
    'fi\nprintf "%s\\n" "$@" > "$CAPTURE"\nexit 19\n', { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'npm'), '#!/bin/sh\nprintf "%s\\n" "$@" > "$CAPTURE"\nexit 23\n', { mode: 0o755 });
  return { directory, capture: path.join(directory, 'argv'), env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH,
    RUNNER_TEMP: directory, CAPTURE: path.join(directory, 'argv') } };
}

test('workflow keeps native arguments and exits and cannot fall through to all tests after planner failure', t => {
  const w = fakeRunner(t), c = fakeRunner(t);
  const wr = cp.spawnSync('bash', ['-c', workflowScript('webkit')], { cwd: ROOT, env: w.env });
  const cr = cp.spawnSync('bash', ['-c', workflowScript('chromium')], { cwd: ROOT, env: c.env });
  assert.equal(wr.status, 19);assert.equal(cr.status, 23);
  assert.deepEqual(fs.readFileSync(w.capture, 'utf8').trim().split('\n'), ['node_modules/playwright/cli.js', 'test',
    'tests/a.spec.js', 'tests/b.spec.js', '--config=playwright.ci.config.cjs', '--project=webkit', '--workers=1']);
  assert.deepEqual(fs.readFileSync(c.capture, 'utf8').trim().split('\n'), ['run', 'test:browser', '--',
    '--config=playwright.ci.config.cjs', '--project=chromium', '--workers=2', '--shard=1/2']);
  for (const mode of ['fail', 'empty']) {
    const f = fakeRunner(t, mode), r = cp.spawnSync('bash', ['-c', workflowScript('webkit')], { cwd: ROOT, env: f.env });
    assert.notEqual(r.status, 0);assert.equal(fs.existsSync(f.capture), false);
  }
});
