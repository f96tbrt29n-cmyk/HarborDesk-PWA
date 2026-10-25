// Environment preflight only: no product data, network requests or browser install.
// Keep the image in browser-regression.yml aligned with the pinned npm package.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const playwright = require('playwright');

async function main() {
  const name = process.argv[2];
  assert.ok(['chromium', 'webkit'].includes(name), 'Expected chromium or webkit');
  const expected = require('../package.json').devDependencies['@playwright/test'];
  const installed = require('@playwright/test/package.json').version;
  const core = require('playwright-core/package.json').version;
  const image = JSON.parse(fs.readFileSync('/ms-playwright/.docker-info', 'utf8'));
  assert.equal(expected, '1.55.0', 'Update the pinned image together with Playwright');
  assert.equal(installed, expected);
  assert.equal(core, expected);
  assert.equal(image.driverVersion, expected, 'Image and npm browser revisions must agree');
  assert.equal(process.versions.node.split('.')[0], '24', 'Keep the existing Node major');
  assert.equal(process.env.PLAYWRIGHT_BROWSERS_PATH, '/ms-playwright');
  const coreRoot = path.dirname(require.resolve('playwright-core/package.json'));
  const metadata = JSON.parse(fs.readFileSync(path.join(coreRoot, 'browsers.json'), 'utf8')).browsers;
  const names = name === 'chromium' ? ['chromium', 'chromium-headless-shell', 'ffmpeg'] : ['webkit', 'ffmpeg'];
  const revisions = Object.fromEntries(names.map(browser => {
    const { revision } = metadata.find(item => item.name === browser);
    const directory = path.join('/ms-playwright', `${browser.replaceAll('-', '_')}-${revision}`);
    assert.ok(fs.statSync(directory).isDirectory(), `Missing browser revision: ${directory}`);
    return [browser, revision];
  }));
  const executable = playwright[name].executablePath();
  fs.accessSync(executable, fs.constants.X_OK);
  const started = performance.now();
  // Default headless launch, as in the unchanged project configuration. This
  // validates shared libraries and actual binaries even on an image-cache hit.
  const browser = await playwright[name].launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<title>Browser environment ready</title><p>ready</p>');
    assert.equal(await page.title(), 'Browser environment ready');
    console.log(JSON.stringify({ node: process.version, playwright: installed,
      image: image.dockerImageName, uid: process.getuid(), platform: process.platform,
      os: fs.readFileSync('/etc/os-release', 'utf8'), browser: name,
      revisions, executable, browserVersion: browser.version(),
      launchOptions: 'Playwright defaults; no added browser arguments',
      launchAndRenderMs: Math.round(performance.now() - started) }));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
