// Positive control for the diagnostic, NOT a reproduction of natural WebKit loss.
const {test,expect}=require('@playwright/test');
const {observeStorage,KEYS}=require('./pwa-storage-audit.cjs');
test.use({serviceWorkers:'block',trace:'retain-on-failure'});
test('isolated storage audit records pre-DCL state and attributes controlled mutations',async({page},info)=>{
 const audit=await observeStorage(page,info);
 let release;const gate=new Promise(resolve=>release=resolve);
 let requested;const arrived=new Promise(resolve=>requested=resolve);
 const origin='http://127.0.0.1:4173/__hd_storage_boundary__/';
 await page.route(origin+'**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').pop();
  if(name==='gate.js'){
   requested();await gate;
   return route.fulfill({contentType:'text/javascript',body:`window.__hdStorageAuditSnapshot('fixture-start');localStorage.setItem(${JSON.stringify(KEYS[0])},'changed-fixture');localStorage.removeItem(${JSON.stringify(KEYS[1])});window.__hdStorageAuditSnapshot('fixture-end');`});
  }
  return route.fulfill({contentType:'text/html',body:name==='pending'?'<script src="./gate.js"></script>':'<!doctype html><title>isolated fixture</title>'});
 });
 try{
  await page.goto(origin+'seed',{waitUntil:'domcontentloaded'});
  const expected=KEYS.map((_,i)=>'isolated-fixture-'+i);
  await page.evaluate(({keys,expected})=>{window.__hdStorageAuditSnapshot('fixture-start');keys.forEach((key,i)=>localStorage.setItem(key,expected[i]));window.__hdStorageAuditSnapshot('fixture-end')},{keys:KEYS,expected});
  await audit.mark('pre-reload');
  await page.goto(origin+'pending',{waitUntil:'commit'});await arrived;
  await expect.poll(()=>audit.timeline().filter(e=>e.stage==='init').length).toBe(2);
  const initial=audit.timeline().filter(e=>e.stage==='init').at(-1);
  expect(initial.readyState).toBe('loading');expect(initial.values.every(x=>x.present)).toBe(true);
  expect(initial.storageIdentitySame).toBe(true);expect(initial.getItemUnchanged).toBe(true);
  expect(await page.evaluate(()=>document.readyState)).toBe('loading');
  expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),KEYS)).toEqual(expected);
  const dcl=page.waitForLoadState('domcontentloaded');release();await dcl;
  await audit.mark('controlled-mutations-complete');
  expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),KEYS)).toEqual(['changed-fixture',null,...expected.slice(2)]);
  const writes=audit.timeline().filter(e=>e.doc===initial.doc&&e.mutation);
  expect(writes.map(e=>e.stage)).toEqual(['mutation-before','mutation','mutation-before','mutation']);
  expect(writes.every(e=>e.scope==='fixture')).toBe(true);
  expect(writes[2].values[1].present).toBe(true);expect(writes[3].values[1].present).toBe(false);
  expect(writes[2].mutation.id).toBe(writes[3].mutation.id);
  expect(new Set(audit.timeline().filter(e=>e.contextId).map(e=>e.contextId)).size).toBe(1);
 }finally{release();await audit.finish()}
});
