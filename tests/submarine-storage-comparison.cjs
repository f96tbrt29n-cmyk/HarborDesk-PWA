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
// Consume the carrier test's existing read results, in its explicit key order.
// Do not reread Storage or expose either side of the exact string comparison.
function carrierStorageSnapshotComparison(keys,before,sample){
 if(!Array.isArray(keys)||keys.length!==6||new Set(keys).size!==6||!Array.from(keys).every(key=>typeof key==='string'&&KEYS.includes(key)))throw new TypeError('invalid carrier comparison keys');
 const valid=values=>Array.isArray(values)&&values.length===6&&Array.from(values).every(value=>value===null||typeof value==='string');
 if(!valid(before))throw new TypeError('invalid carrier comparison baseline');
 if(!sample||typeof sample!=='object')throw new TypeError('invalid carrier comparison sample');
 const values=sample.values;
 if(!valid(values))throw new TypeError('invalid carrier comparison values');
 // Auxiliary evidence keeps only document identity and the public HTTP(S) path.
 // The original assertion still compares its complete document object separately.
 const sourceDocument=sample.document,document={timeOrigin:null,url:null};
 if(sourceDocument&&typeof sourceDocument==='object'){
  try{const value=sourceDocument.timeOrigin;if(Number.isFinite(value))document.timeOrigin=value}catch{}
  try{const value=sourceDocument.url;if(typeof value==='string'){const parsed=new URL(value);if(['http:','https:'].includes(parsed.protocol))document.url=parsed.origin+parsed.pathname}}catch{}
 }
 return {document,at:sample.at,readyState:sample.readyState,policy:sample.policy,
  keys:keys.map((key,i)=>({key,presentBefore:before[i]!==null,present:values[i]!==null,length:values[i]?.length??0,exactMatch:values[i]===before[i]}))};
}
module.exports={COMPARISON_KEYS,POLICY_KEY,submarineStorageComparison,retainStorageComparison,carrierStorageSnapshotComparison};
