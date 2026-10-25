// Controlled streaming experiment only; never used for release regressions.
const path = require('node:path');
const base = require('./playwright.config.js');
const output = process.env.HD_RELOAD_EVIDENCE_DIR || path.join(__dirname, 'test-results', 'script-gate-' + Date.now());
module.exports = {
 ...base, testMatch:'reload-script-gate.experiment.cjs', retries:0, workers:1,
 outputDir:path.join(output,'artifacts'),reporter:[['line'],['json',{outputFile:path.join(output,'summary.json')}]],
 webServer:{...base.webServer,command:'python3 tests/sw-reload-probe-server.py --directory . --gate-script equipment-catalog-extra4.js',cwd:__dirname,reuseExistingServer:false},
 projects:['webkit','chromium'].map(browser=>({name:browser,metadata:{keepNative:true},use:{browserName:browser,...(browser==='chromium'&&process.env.HD_CHROMIUM_EXECUTABLE?{launchOptions:{executablePath:process.env.HD_CHROMIUM_EXECUTABLE}}:{})}})),
};
