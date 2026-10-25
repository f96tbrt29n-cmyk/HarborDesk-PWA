// Reproduce only the two declared isolated controls; no production SW rewrite.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function controlledSource(){
 let source=fs.readFileSync(path.join(__dirname,'night-policy-reload.spec.js'),'utf8');
 source=source.replace("require('@playwright/test')",`require(${JSON.stringify(require.resolve('@playwright/test'))})`);
 for(const name of ['reload-evidence.cjs','pwa-storage-audit.cjs'])source=source.replace(`require('./${name}')`,`require(${JSON.stringify(path.join(__dirname,name))})`);
 const build=require('../app-version.json').build;
 const needle="test('carrier night CI policy persists and regenerates the mobile loadout',async({page},testInfo)=>{";
 if(!source.includes(needle))throw Error('source case changed; inspect before regenerating');
 return source.replace(needle,needle+`
 if(testInfo.project.metadata?.canonicalRegistration)await page.addInitScript(()=>{
  const sw=navigator.serviceWorker,original=sw.register;
  sw.register=function(url,options){const u=new URL(url,location.href);if(u.origin===location.origin&&u.pathname.endsWith('/sw.js')){u.search='?v=${build}';return Reflect.apply(original,this,[u.href,options])}return Reflect.apply(original,this,arguments)};
 });
`);
}
if(require.main===module){
 const target=process.argv[2];if(!target||!path.isAbsolute(target))throw Error('provide a fresh absolute evidence directory');
 fs.mkdirSync(target); // Refuse to overwrite an existing evidence directory.
 const source=controlledSource();fs.writeFileSync(path.join(target,'night-registration.spec.js'),source);
 const config=`const base=require(${JSON.stringify(path.join(root,'playwright.config.js'))});module.exports={...base,testDir:__dirname,testMatch:'night-registration.spec.js',grep:/carrier night CI policy persists and regenerates the mobile loadout/,retries:0,workers:1,outputDir:__dirname+'/artifacts',reporter:[['line'],['json',{outputFile:__dirname+'/summary.json'}]],webServer:{...base.webServer,cwd:${JSON.stringify(root)},reuseExistingServer:false},projects:[false,true].map(canonicalRegistration=>({name:'webkit-'+(canonicalRegistration?'canonical':'baseline'),metadata:{canonicalRegistration,retentionFixture:true,keepNative:true},use:{browserName:'webkit'}}))};`;
 fs.writeFileSync(path.join(target,'config.cjs'),config);
 fs.writeFileSync(path.join(target,'protocol.json'),JSON.stringify({hypothesis:'registration URL churn contributes to DCL stop',engine:'WebKit',baseline:1,canonical:1,retries:0,sw:'unmodified',sourceSha256:crypto.createHash('sha256').update(source).digest('hex')}));
}
module.exports={controlledSource};
