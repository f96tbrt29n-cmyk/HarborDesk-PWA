'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {COMPARISON_KEYS,POLICY_KEY,submarineStorageComparison,retainStorageComparison,carrierStorageSnapshotComparison}=require('./submarine-storage-comparison.cjs');
async function fixture(){
 const main={},values=new Map([[COMPARISON_KEYS[1],'PRIVATE_EQUIPMENT'],[COMPARISON_KEYS[2],'PRIVATE_ROSTER'],[POLICY_KEY,'{"1-1":"sub-late"}']]);
 let binding,reads=0,error;const args=[];
 const env={args:null,location:{origin:'http://localhost',pathname:'/'},performance:{timeOrigin:100,now:()=>3},document:{readyState:'complete'},hdSENightPolicy:()=> 'sub-late',localStorage:{getItem:key=>{reads++;if(error)throw error;return values.has(key)?values.get(key):null}}};
 const page={mainFrame:()=>main,exposeBinding:async(name,fn)=>{binding=fn;env.window={[name]:(...input)=>fn({frame:main},...input)}},evaluate:async(fn,arg)=>{args.push(arg);env.args=arg;return vm.runInNewContext('('+fn.toString()+')(args)',env)}};
 const compare=await submarineStorageComparison(page);
 return {compare,values,env,args,reads:()=>reads,binding:()=>binding,main,fail:e=>error=e};
}
test('baseline and after-load use exact seven strings, allow four unseeded nulls, and never return saved bodies',async()=>{
 const f=await fixture(),a=await f.compare('baseline');
 f.env.performance.timeOrigin=200;const b=await f.compare('after-load');
 assert.equal(a.keys.length,7);assert.equal(a.keys.filter(k=>k.present).length,3);assert.equal(b.keys.filter(k=>!k.present).length,4);
 assert.ok(b.keys.every(k=>k.exactMatch));assert.equal(f.reads(),14);
 assert.equal(b.document.timeOrigin,200);assert.equal(b.readyState,'complete');
 assert.ok(!JSON.stringify([a,b,f.args]).includes('PRIVATE'));assert.ok(!JSON.stringify([a,b,f.args]).includes('{"1-1"'));
});
test('whitespace-only differences and a new value for a previously null key both fail exact comparison',async()=>{
 const f=await fixture();await f.compare('baseline');f.values.set(COMPARISON_KEYS[1],'PRIVATE_EQUIPMENT ');f.values.set(COMPARISON_KEYS[0],'{}');
 const result=await f.compare('after-load');assert.equal(result.keys[0].exactMatch,false);assert.equal(result.keys[1].exactMatch,false);assert.equal(result.keys[0].presentBefore,false);
});
test('raw policy mismatch remains visible even if the policy getter still returns the expected selection',async()=>{
 const f=await fixture();await f.compare('baseline');f.values.set(POLICY_KEY,'{"1-1":"auto"}');const b=await f.compare('after-load');
 assert.equal(b.policy,'sub-late');assert.equal(b.keys[6].exactMatch,false);
});
test('read exceptions propagate unchanged and do not invent a baseline or restore storage',async()=>{
 const f=await fixture(),e=new Error('PRIVATE_NATIVE_READ');f.fail(e);
 await assert.rejects(f.compare('baseline'),x=>x===e);assert.equal(f.reads(),1);assert.equal(f.values.get(COMPARISON_KEYS[1]),'PRIVATE_EQUIPMENT');
});
test('binding rejects wrong frame, absent baseline, malformed samples and recapture without returning values',async()=>{
 const f=await fixture();const sample={document:{timeOrigin:1,url:'http://localhost/'},at:1,readyState:'complete',values:COMPARISON_KEYS.map(()=>null),policy:'auto'};
 assert.throws(()=>f.binding()({frame:{}},'baseline',sample),/main frame/);
 assert.throws(()=>f.binding()({frame:f.main},'after-load',sample),/baseline missing/);
 assert.throws(()=>f.binding()({frame:f.main},'baseline',{...sample,values:[42]}),/invalid/);
 await f.compare('baseline');assert.throws(()=>f.binding()({frame:f.main},'baseline',sample),/already captured/);
});
test('submarine retains original filtered assertion and requires same-document load, nullable exact equality and raw policy separately',()=>{
 const source=fs.readFileSync(path.join(__dirname,'night-policy-reload.spec.js'),'utf8');const a=source.indexOf("submarineNightTest('submarine night CI"),b=source.indexOf("\ntest('carrier three-plane",a),s=source.slice(a,b);
 assert.equal((s.match(/expect\(retain.errors\(\).filter\(x=>\/hdFSSuggestionHtml\/.test\(x.stack\|\|''\)\)\).toEqual\(\[\]\);/g)||[]).length,2);
 assert.ok(s.indexOf("compareStorage('baseline')")>s.indexOf("selectOption('sub-late')"));
 assert.ok(s.indexOf("compareStorage('baseline')")<s.indexOf("retain.mark('reload-start')"));
 assert.ok(s.indexOf("waitForLoadState('load')")>s.indexOf("retain.mark('policy-restored')"));
 assert.ok(s.includes('expect(afterLoad.document).toEqual(reloadedDocument)'));
 assert.ok(s.includes("expect(afterLoad.readyState).toBe('complete')"));
 assert.ok(s.includes('afterLoad.keys.slice(0,6)'));assert.ok(s.includes('afterLoad.keys[6].exactMatch'));
 assert.ok(!s.includes('test.setTimeout'));assert.ok(!s.slice(s.indexOf('}catch(error)')).includes('evaluate('));
});

test('comparison verdicts survive as standalone JSON and attachment without saved bodies',async t=>{
 const f=await fixture(),report=await f.compare('baseline');
 const os=require('node:os'),fsp=require('node:fs/promises');const dir=await fsp.mkdtemp(path.join(os.tmpdir(),'submarine-comparison-'));t.after(()=>fsp.rm(dir,{recursive:true}));
 const attachments=[];await retainStorageComparison({outputPath:name=>path.join(dir,name),attach:async(...args)=>attachments.push(args)},'pre-reload-storage-presence',report);
 const body=await fsp.readFile(path.join(dir,'pre-reload-storage-presence.json'),'utf8');assert.ok(!body.includes('PRIVATE'));assert.equal(JSON.parse(body).keys.length,7);assert.equal(attachments[0][1].contentType,'application/json');
});

const CARRIER_KEYS=Object.freeze(['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1']);
test('carrier metadata preserves explicit six-key order and frozen inputs without returning bodies',()=>{
 const before=Object.freeze(['PRIVATE_ROSTER','PRIVATE_EQUIPMENT',null,null,null,null]);
 const values=Object.freeze(['PRIVATE_ROSTER','PRIVATE_EQUIPMENT',null,null,null,null]);
 const document=Object.freeze({timeOrigin:20,url:'http://localhost/'});
 const sample=Object.freeze({document,at:7,readyState:'complete',policy:'cv-fighter2',values,other:'PRIVATE_IGNORED'});
 const result=carrierStorageSnapshotComparison(CARRIER_KEYS,before,sample);
 assert.deepEqual(result,{document:{timeOrigin:20,url:'http://localhost/'},at:7,readyState:'complete',policy:'cv-fighter2',keys:[
  {key:'harbordesk-ship-roster-v1',presentBefore:true,present:true,length:14,exactMatch:true},
  {key:'harbordesk-equipment-v1',presentBefore:true,present:true,length:17,exactMatch:true},
  {key:'harbordesk-kancolle-sync-v1',presentBefore:false,present:false,length:0,exactMatch:true},
  {key:'harbordesk-pwa-v1',presentBefore:false,present:false,length:0,exactMatch:true},
  {key:'harbordesk-custom-fleets-v1',presentBefore:false,present:false,length:0,exactMatch:true},
  {key:'harbordesk-fleet-calculator-v1',presentBefore:false,present:false,length:0,exactMatch:true}
 ]});
 // Evidence projection is a fresh allowlisted object, not the original document.
 assert.notEqual(result.document,document);assert.ok(!Object.hasOwn(result,'values'));
 assert.ok(!JSON.stringify(result).includes('PRIVATE'));
 assert.deepEqual(before,['PRIVATE_ROSTER','PRIVATE_EQUIPMENT',null,null,null,null]);
 assert.deepEqual(values,['PRIVATE_ROSTER','PRIVATE_EQUIPMENT',null,null,null,null]);
 assert.equal(sample.other,'PRIVATE_IGNORED');
});
test('carrier metadata distinguishes null/string transitions, changed strings and empty strings exactly',()=>{
 const before=Object.freeze(['PRIVATE_A',null,'PRIVATE_B','','PRIVATE_CC',null]);
 const values=Object.freeze(['PRIVATE_A','x',null,' ','PRIVATE_C',null]);
 const result=carrierStorageSnapshotComparison(CARRIER_KEYS,before,{document:{timeOrigin:30},readyState:'complete',policy:'cv-fighter2',values});
 assert.deepEqual(result.keys,[
  {key:'harbordesk-ship-roster-v1',presentBefore:true,present:true,length:9,exactMatch:true},
  {key:'harbordesk-equipment-v1',presentBefore:false,present:true,length:1,exactMatch:false},
  {key:'harbordesk-kancolle-sync-v1',presentBefore:true,present:false,length:0,exactMatch:false},
  {key:'harbordesk-pwa-v1',presentBefore:true,present:true,length:1,exactMatch:false},
  {key:'harbordesk-custom-fleets-v1',presentBefore:true,present:true,length:9,exactMatch:false},
  {key:'harbordesk-fleet-calculator-v1',presentBefore:false,present:false,length:0,exactMatch:true}
 ]);
 assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('carrier metadata rejects malformed keys or six-value samples without coercion',()=>{
 const values=Object.freeze([null,null,null,null,null,null]),sample={values};
 for(const keys of [null,CARRIER_KEYS.slice(1),[...CARRIER_KEYS.slice(0,5),CARRIER_KEYS[0]],[...CARRIER_KEYS.slice(0,5),3],[...CARRIER_KEYS.slice(0,5),'unknown-key'],new Array(6)])assert.throws(()=>carrierStorageSnapshotComparison(keys,values,sample),/invalid carrier comparison keys/);
 for(const before of [null,[],[null,null,null,null,null,0],new Array(6)])assert.throws(()=>carrierStorageSnapshotComparison(CARRIER_KEYS,before,sample),/invalid carrier comparison baseline/);
 for(const invalid of [null,{}, {values:[]},{values:[null,null,null,null,null,undefined]},{values:new Array(6)}])assert.throws(()=>carrierStorageSnapshotComparison(CARRIER_KEYS,values,invalid),/invalid carrier comparison (sample|values)/);
});
test('carrier metadata propagates existing input read exceptions unchanged',()=>{
 const sentinel=Object.freeze({kind:'existing-read-exception'}),before=[null,null,null,null,null,null];
 Object.defineProperty(before,0,{get(){throw sentinel}});Object.freeze(before);
 assert.throws(()=>carrierStorageSnapshotComparison(CARRIER_KEYS,before,{values:[null,null,null,null,null,null]}),error=>error===sentinel);
 const sample=Object.freeze(Object.defineProperty({},'values',{get(){throw sentinel}}));
 assert.throws(()=>carrierStorageSnapshotComparison(CARRIER_KEYS,[null,null,null,null,null,null],sample),error=>error===sentinel);
});

test('carrier document evidence excludes query, fragment, credentials and unknown fields',()=>{
 const values=Object.freeze([null,null,null,null,null,null]);
 const document=Object.freeze({timeOrigin:31,url:'https://user:PRIVATE_PASSWORD@fixture.invalid/path/to?q=PRIVATE_QUERY#PRIVATE_FRAGMENT',extra:'PRIVATE_FIELD'});
 const result=carrierStorageSnapshotComparison(CARRIER_KEYS,values,Object.freeze({document,values,readyState:'complete',policy:'cv-fighter2'}));
 assert.deepEqual(result.document,{timeOrigin:31,url:'https://fixture.invalid/path/to'});
 assert.notEqual(result.document,document);
 assert.equal(document.url,'https://user:PRIVATE_PASSWORD@fixture.invalid/path/to?q=PRIVATE_QUERY#PRIVATE_FRAGMENT');
 assert.equal(document.extra,'PRIVATE_FIELD');
 assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});
test('carrier document evidence marks unavailable identity fields as null without exposing non-HTTP bodies',()=>{
 const values=Object.freeze([null,null,null,null,null,null]);
 const unavailable=Object.freeze({get timeOrigin(){throw Error('unavailable document clock')},get url(){throw Error('unavailable document address')}});
 for(const [document,expected]of [
  [undefined,{timeOrigin:null,url:null}],
  [null,{timeOrigin:null,url:null}],
  [42,{timeOrigin:null,url:null}],
  [{timeOrigin:NaN,url:'/relative?PRIVATE_QUERY'},{timeOrigin:null,url:null}],
  [{timeOrigin:Infinity,url:'data:text/plain,PRIVATE_BODY'},{timeOrigin:null,url:null}],
  [{timeOrigin:'42',url:'javascript:PRIVATE_BODY'},{timeOrigin:null,url:null}],
  [unavailable,{timeOrigin:null,url:null}],
  [{timeOrigin:0,url:'http://localhost:4173/safe?PRIVATE_QUERY#PRIVATE_FRAGMENT'},{timeOrigin:0,url:'http://localhost:4173/safe'}]
 ]){
  const result=carrierStorageSnapshotComparison(CARRIER_KEYS,values,{document,values});
  assert.deepEqual(result.document,expected);
  assert.ok(!JSON.stringify(result).includes('PRIVATE'));
 }
});
