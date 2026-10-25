// Explicit private source/body experiments; never a release configuration.
const path = require('node:path');
const base = require('./playwright.config.js');
const output = process.env.HD_RELOAD_EVIDENCE_DIR || path.join(__dirname,'test-results','script44-'+Date.now());
module.exports = {
 ...base,retries:0,workers:1,outputDir:path.join(output,'artifacts'),
 reporter:[['line'],['json',{outputFile:path.join(output,'summary.json')}]],
 webServer:{...base.webServer,command:'python3 tests/sw-reload-probe-server.py --directory . --gate-script map-strategy-navigator.js --drop-target-scripts',cwd:__dirname,reuseExistingServer:false},
 projects:['webkit','chromium'].flatMap(browser=>['unmodified','instrumented','body','sw-body'].map(mode=>({
  name:browser+'-'+mode,testMatch:mode.endsWith('body')?'script44-body.experiment.cjs':'script44-source.experiment.cjs',
  metadata:{keepNative:true,swProbe:mode==='instrumented'||mode==='sw-body'},
  use:{browserName:browser,serviceWorkers:mode==='body'?'block':'allow',...(browser==='chromium'&&process.env.HD_CHROMIUM_EXECUTABLE?{launchOptions:{executablePath:process.env.HD_CHROMIUM_EXECUTABLE}}:{})},
 }))),
};
