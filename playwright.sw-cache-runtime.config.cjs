// Explicit isolated runtime diagnostic, including unresolved navigation failures.
// It does not replace or skip any normal regression assertion.
const path = require('node:path');
const base = require('./playwright.config.js');
const output = process.env.HD_SW_CACHE_RUNTIME_EVIDENCE_DIR || path.join('/tmp','hd-sw-cache-runtime-'+Date.now());
module.exports = { ...base, testMatch:'sw-cache-runtime.experiment.cjs', retries:0, workers:1, fullyParallel:false,
  webServer:undefined, outputDir:path.join(output,'artifacts'), reporter:[['line'],['json',{outputFile:path.join(output,'summary.json')}]],
  projects:['chromium','webkit'].map(browser=>({name:browser+'-real-cache',metadata:{swSource:process.env.HD_SW_CACHE_SOURCE},use:{browserName:browser,serviceWorkers:'allow'}}))
};
