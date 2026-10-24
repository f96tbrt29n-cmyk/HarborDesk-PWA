'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const {KEYS}=require('./pwa-storage-audit.cjs');
const POLICY_KEY='harbordesk-night-ci-policy-v1';
const COMPARISON_KEYS=[...KEYS,POLICY_KEY];
// Public Playwright binding: values stay in Node memory. Unlike returning raw
// getItem strings from evaluate, trace action results contain only verdicts.
async function submarineStorageComparison(page) {
 let reference;
 await page.exposeBinding('__hdSubmarineStorageCompare', ({frame},phase,sample)=>{
  if(frame!==page.mainFrame())throw Error('storage comparison must use the main frame');
  if(!['baseline','after-load'].includes(phase))throw Error('unexpected storage comparison phase');
  if(sample.values.length!==COMPARISON_KEYS.length||sample.values.some(v=>v!==null&&typeof v!=='string'))throw Error('invalid storage comparison values');
  if(phase==='baseline'){
   if(reference)throw Error('baseline already captured');
   reference=sample.values.slice();
  }
  if(!reference)throw Error('storage baseline missing');
  return {document:sample.document,at:sample.at,readyState:sample.readyState,policy:sample.policy,
   keys:COMPARISON_KEYS.map((key,i)=>({key,presentBefore:reference[i]!==null,present:sample.values[i]!==null,length:sample.values[i]?.length??0,exactMatch:sample.values[i]===reference[i]}))};
 });
 return phase=>page.evaluate(async({phase,keys})=>window.__hdSubmarineStorageCompare(phase,{
  document:{timeOrigin:performance.timeOrigin,url:location.origin+location.pathname},at:performance.now(),readyState:document.readyState,
  values:keys.map(key=>localStorage.getItem(key)),policy:hdSENightPolicy('1-1')
 }),{phase,keys:COMPARISON_KEYS});
}
async function retainStorageComparison(info,name,verdict){
 const file=info.outputPath(name+'.json');
 await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,JSON.stringify(verdict,null,2)+'\n');
 await info.attach(name,{path:file,contentType:'application/json'});
}
module.exports={COMPARISON_KEYS,POLICY_KEY,submarineStorageComparison,retainStorageComparison};
