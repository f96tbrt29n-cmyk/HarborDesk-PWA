'use strict';

// Keep each file (and every serial/beforeAll group in it) on one WebKit job.
// Costs describe one retained run's observed occupancy, not product performance.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const assert = require('node:assert/strict');

const SHARDS = 4;
const ROOT = path.resolve(__dirname, '..');
const COSTS = require('./fixtures/ci-webkit-file-costs.json');
const lex = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const safeFile = file => typeof file === 'string' && /^tests\/[a-zA-Z0-9_-]+\.spec\.js$/.test(file);

function smokeFiles(script) {
  assert.equal(typeof script, 'string', 'A fixed smoke script is required');
  assert.ok(!/[\r\n\t]/.test(script), 'The fixed smoke command must be a single literal argv');
  const argv = script.trim().split(/ +/);
  assert.deepEqual(argv.splice(0, 2), ['playwright', 'test']);
  assert.ok(argv.length > 0 && argv.every(safeFile), 'Only explicit smoke spec files are supported');
  assert.equal(new Set(argv).size, argv.length, 'Duplicate smoke spec');
  return argv;
}

function validateCosts(costs) {
  assert.equal(costs?.schemaVersion, 1);
  assert.ok(costs.observedSecondsByFile && typeof costs.observedSecondsByFile === 'object');
  for (const [file, seconds] of Object.entries(costs.observedSecondsByFile)) {
    assert.ok(safeFile(file));
    assert.ok(Number.isSafeInteger(seconds) && seconds >= 0, 'Invalid observed occupancy weight');
  }
  for (const key of ['routeFile', 'otherFile'])
    assert.ok(Number.isSafeInteger(costs.fallbackSeconds?.[key]) && costs.fallbackSeconds[key] > 0);
  return costs;
}

function fileWeight(file, costs) {
  assert.ok(safeFile(file));
  const fallback = costs.fallbackSeconds[file.startsWith('tests/route-') ? 'routeFile' : 'otherFile'];
  // An unobserved or interrupted file must never receive zero weight.
  return Math.max(fallback, costs.observedSecondsByFile[file] ?? 0);
}

function partition(files, costs = COSTS) {
  validateCosts(costs);
  assert.ok(Array.isArray(files) && files.length >= SHARDS && files.every(safeFile));
  assert.equal(new Set(files).size, files.length);
  const bins = Array.from({ length: SHARDS }, (_, i) => ({ shard: i + 1, files: [], estimatedSeconds: 0 }));
  for (const file of [...files].sort((a, b) => fileWeight(b, costs) - fileWeight(a, costs) || lex(a, b))) {
    const bin = bins.reduce((best, row) => row.estimatedSeconds < best.estimatedSeconds ? row : best);
    bin.files.push(file);
    bin.estimatedSeconds += fileWeight(file, costs);
    assert.ok(Number.isSafeInteger(bin.estimatedSeconds));
  }
  for (const bin of bins) {
    assert.ok(bin.files.length > 0);
    // Stable source-list order inside each job; native Playwright controls execution.
    const selected = new Set(bin.files);
    bin.files = files.filter(file => selected.has(file));
  }
  const all = bins.flatMap(bin => bin.files);
  assert.equal(all.length, files.length);
  assert.equal(new Set(all).size, files.length);
  assert.deepEqual([...all].sort(lex), [...files].sort(lex));
  return bins;
}

function parseArgs(argv) {
  const mode = argv.includes('--plan') ? 'plan' : 'files';
  const shardArg = argv.find(arg => arg.startsWith('--shard='));
  assert.ok(argv.every(arg => arg === '--plan' || /^--shard=[1-4]\/4$/.test(arg)), 'Unsupported CI partition argument');
  assert.ok(argv.filter(arg => arg === '--plan').length <= 1);
  assert.equal(argv.filter(arg => arg.startsWith('--shard=')).length, mode === 'plan' ? 0 : 1);
  const shard = shardArg ? Number(shardArg.match(/^--shard=([1-4])\/4$/)?.[1]) : null;
  assert.ok(mode === 'plan' || Number.isInteger(shard) && shard >= 1 && shard <= SHARDS);
  return { mode, shard };
}

function loadPlan(root = ROOT) {
  const packageBytes = fs.readFileSync(path.join(root, 'package.json'));
  const files = smokeFiles(JSON.parse(packageBytes).scripts['test:browser']);
  for (const file of files) assert.ok(fs.statSync(path.join(root, file)).isFile(), 'Missing fixed smoke spec: ' + file);
  return {
    schemaVersion: 1, project: 'webkit', shards: SHARDS,
    strategy: 'deterministic whole-file LPT; existing file groups stay intact',
    packageSHA256: crypto.createHash('sha256').update(packageBytes).digest('hex'),
    sourceRunForCostEstimate: COSTS.sourceRun,
    estimatesAreFutureRuntimeGuarantees: false,
    fileCount: files.length, bins: partition(files)
  };
}

function main(argv) {
  const args = parseArgs(argv);
  const plan = loadPlan();
  if (args.mode === 'plan') {
    process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
    return;
  }
  const selected = plan.bins[args.shard - 1];
  const directory = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'harbordesk-ci-smoke');
  fs.mkdirSync(directory, { recursive: true });
  // Preserve an earlier invocation instead of replacing its execution selection.
  fs.writeFileSync(path.join(directory, 'webkit-partition.json'), JSON.stringify({
    ...plan, selectedShard: args.shard, selectedFiles: selected.files,
    sourceSHA: /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA || '') ? process.env.GITHUB_SHA : null
  }, null, 2) + '\n', { flag: 'wx' });
  process.stdout.write(selected.files.join('\n') + '\n');
}

module.exports = { SHARDS, safeFile, smokeFiles, validateCosts, fileWeight, partition, parseArgs, loadPlan };
if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error('CI smoke partition setup failed: ' + error.message); process.exitCode = 1; }
}
