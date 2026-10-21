'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { initialUpdateBoundary, openFollowingPage, scopedInfo, retainInitialDocumentResult } = require('./initial-document-fixture.cjs');
const { PREFIX, observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const stages=['await-resumed','registered-assigned','explicit-update-site','explicit-update-expression-returned'];
const event=(stage,overrides={})=>({stage,callId:1,document:{timeOrigin:1000,at:1,readyState:'complete',url:'http://fixture.invalid/'},updateControl:{phase:'initial',suppress:false},...overrides});

test('initial gate requires ordered await/assignment/update/return in one document and call',()=>{
  const events=stages.map(stage=>event(stage));
  assert.equal(initialUpdateBoundary(events).callId,1);
  assert.deepEqual(initialUpdateBoundary(events).boundaries.map(x=>x.stage),stages);
  assert.equal(initialUpdateBoundary(events.slice(0,3)),null);
  assert.equal(initialUpdateBoundary([...events].reverse()),null);
  for(const field of ['document','callId','updateControl']) {
    const broken=events.map(x=>({...x}));
    broken[3][field]=field==='document'?{...broken[3].document,timeOrigin:2000}:field==='callId'?2:{phase:'reloaded',suppress:false};
    assert.equal(initialUpdateBoundary(broken),null);
  }
  assert.equal(initialUpdateBoundary(events.map(x=>({...x,updateControl:{phase:'initial',suppress:true}}))),null);
});

test('suppression gate completes on suppression, never waits for a nonexistent update return',()=>{
  const suppressed=stages.map(stage=>event(stage==='explicit-update-expression-returned'?'explicit-update-suppressed':stage,{updateControl:{phase:'initial',suppress:true}}));
  assert.deepEqual(initialUpdateBoundary(suppressed,true).boundaries.map(x=>x.stage),['await-resumed','registered-assigned','explicit-update-site','explicit-update-suppressed']);
  assert.equal(initialUpdateBoundary(suppressed),null);
  assert.equal(initialUpdateBoundary(stages.map(stage=>event(stage)),true),null);
  assert.equal(initialUpdateBoundary(suppressed.slice(0,3),true),null);
  const wrongReturn=suppressed.map(x=>x.stage==='explicit-update-suppressed'?{...x,stage:'explicit-update-expression-returned'}:x);
  assert.equal(initialUpdateBoundary(wrongReturn,true),null);
});

test('suppression gate still requires matching document, call, initial phase and policy',()=>{
  const original=stages.map(stage=>event(stage==='explicit-update-expression-returned'?'explicit-update-suppressed':stage,{updateControl:{phase:'initial',suppress:true}}));
  for (const replacement of [{callId:2},{document:{...original[3].document,timeOrigin:2000}},{updateControl:{phase:'reloaded',suppress:true}},{updateControl:{phase:'initial',suppress:false}}]) {
    const mixed=original.map((x,i)=>i===3?{...x,...replacement}:x);
    assert.equal(initialUpdateBoundary(mixed,true),null);
  }
  assert.throws(()=>initialUpdateBoundary(original,'true'),/invalid/);
});

function pages(closeError) {
  const calls=[];let closed=false;
  const context={async newPage(...args){calls.push({kind:'newPage',receiver:this,args});return following;}};
  const following={context:()=>context};
  const initial={context:()=>context,isClosed:()=>closed,async close(...args){calls.push({kind:'close',receiver:this,args});if(closeError)throw closeError;closed=true;},reload(){throw Error('must not reload');}};
  return {initial,following,context,calls};
}
for(const disposition of ['keep','close'])test('both paths use the same context.newPage: '+disposition,async()=>{
  const f=pages(),events=[];
  const result=await openFollowingPage(f.initial,disposition,(kind,data)=>events.push({kind,...data}));
  assert.equal(result,f.following);assert.equal(result.context(),f.context);
  assert.deepEqual(f.calls.map(x=>x.kind),disposition==='keep'?['newPage']:['close','newPage']);
  assert.equal(f.initial.isClosed(),disposition==='close');
  assert.ok(f.calls.every(x=>x.args.length===0));
  assert.equal(f.calls.at(-1).receiver,f.context);
  if(disposition==='close')assert.equal(f.calls[0].receiver,f.initial);
  assert.equal(events.at(-1).sharedContext,true);
  assert.equal(events.at(-1).initialClosed,disposition==='close');
});

test('close failure is propagated without opening or retrying a following page',async()=>{
  const error=Error('close failure'),f=pages(error);
  await assert.rejects(openFollowingPage(f.initial,'close',()=>{}),value=>value===error);
  assert.deepEqual(f.calls.map(x=>x.kind),['close']);
  await assert.rejects(openFollowingPage(f.initial,'invalid',()=>{}),/invalid/);
  assert.deepEqual(f.calls.map(x=>x.kind),['close']);
});

test('existing recorder history is a bounded Node-only copy and both pages persist separately',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'initial-document-'));t.after(()=>fs.rm(dir,{recursive:true}));
  const info={outputPath:name=>path.join(dir,name),attach:async()=>{}};
  for(const label of ['initial','following']) {
    const page=new EventEmitter();page.evaluate=()=>{throw Error('unexpected browser read');};
    const probe=observeRegistrationContinuation(page,scopedInfo(info,label),{page:label,context:'isolated'},{limit:2});
    for(const stage of ['register-before','register-returned','await-resumed'])page.emit('console',{text:()=>PREFIX+JSON.stringify({...event(stage),registrationURL:'./sw.js?v=580',scope:'./',status:'registering',controller:null})});
    const copy=probe.timeline();assert.equal(copy.length,2);copy.shift();
    assert.equal(probe.timeline().length,2);
    await probe.finish();
    const saved=JSON.parse(await fs.readFile(path.join(dir,label+'-pwa-registration-continuation.json'),'utf8'));
    assert.equal(saved.droppedEvents,1);assert.equal(saved.events.length,2);assert.equal(saved.identity.page,label);
  }
});

test('failed comparison report is retained without browser access or changing its classification',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'initial-document-result-'));t.after(()=>fs.rm(dir,{recursive:true}));
  const report={stage:'following-registration-wait',failureStage:'following-registration-wait',validComparison:true,samples:[{versioned:'registering',outcome:'value'}]};
  const attached=[];await retainInitialDocumentResult({outputPath:name=>path.join(dir,name),attach:async(name,options)=>attached.push({name,...options})},report);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(dir,'initial-document-result.json'),'utf8')),report);
  assert.equal(attached[0].name,'initial-document-result');
});
