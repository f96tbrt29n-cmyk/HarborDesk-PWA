const path = require('node:path');
const base = require('./playwright.config.js');
const evidence = process.env.HD_CSS_SCRIPT_EVIDENCE_DIR || path.join('/tmp','hd-css-script-'+Date.now());
module.exports = { ...base, testMatch:'css-script-wait.experiment.cjs', fullyParallel:false, workers:1, retries:0,
  reporter:[['line'],['json',{outputFile:path.join(evidence,'summary.json')}]], outputDir:path.join(evidence,'artifacts'),
  webServer:undefined, projects:[{name:'webkit-isolated-parser',metadata:{keepNative:true},use:{browserName:'webkit',serviceWorkers:'block'}}]
};
