const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('planner read exceptions cannot overwrite existing plans or six stored keys',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/app-version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:'1.0.580',build:580})});return ['127.0.0.1','localhost'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const result=await page.evaluate(()=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  keys.forEach((k,i)=>localStorage.setItem(k,JSON.stringify(i===1||i===2?[]:i===5?blankState():{})));
  const plan={...hdFCDefaultState('2-5','saved'),gear:[{name:'零式水上観測機',star:4,slot:9}]};hdFCSaveAll({'2-5:saved':plan});
  const original=Storage.prototype.getItem,before=keys.map(k=>localStorage.getItem(k)),cases=[];
  let readOnlyFallback=false;Storage.prototype.getItem=function(key){if(key===HD_FC_KEY)throw Error('isolated listing read unavailable');return original.call(this,key)};
  try{readOnlyFallback=Object.keys(hdFCLoadAll()).length===0}finally{Storage.prototype.getItem=original}
  const actions=[()=>hdFCState('1-1','manual'),()=>hdFCSaveState('1-1','manual',{gear:[]}),()=>hdFCReset('2-5','saved')];
  for(const action of actions){
   const error=new Error('isolated planner read unavailable');let sameError=false;
   Storage.prototype.getItem=function(key){if(key===HD_FC_KEY)throw error;return original.call(this,key)};
   try{action()}catch(e){sameError=e===error}finally{Storage.prototype.getItem=original}
   cases.push({sameError,unchanged:keys.every((k,i)=>localStorage.getItem(k)===before[i])});
  }
  hdFCSaveState('1-1','new',hdFCDefaultState('1-1','new'));
  return {readOnlyFallback,nonNull:before.every(v=>v!==null),cases,originalPlan:JSON.stringify(hdFCLoadAll()['2-5:saved'])===JSON.stringify(plan),newPlan:!!hdFCLoadAll()['1-1:new'],otherKeys:keys.every((k,i)=>k===HD_FC_KEY||localStorage.getItem(k)===before[i])};
 });
 expect(result).toEqual({readOnlyFallback:true,nonNull:true,cases:[{sameError:true,unchanged:true},{sameError:true,unchanged:true},{sameError:true,unchanged:true}],originalPlan:true,newPlan:true,otherKeys:true});expect(errors).toEqual([]);
});

// Same legal Akagi proposal as owned-plan-calculator.spec.js; only Storage
// reads are faulted. Original getItem is used to compare the underlying bytes.
async function proposalFixture(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await require('./sync-version-fixture.cjs').syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'試製烈風 後期型',count:1,star:6},{name:'彩雲',count:1,star:0}]));
  saveCustomFleets({'1-1':[{id:'proposal-fleet',name:'配備候補テスト',ships:[{ship:'赤城改',gameShipId:11,gear:'33号水上電探'}]}]});
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:88}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'赤城改',gameShipId:11,gameLos:80,gameGearSlots:['33号水上電探'],gameOnslot:[0,0,0,0]}]));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
  hdSEChecks=()=>({rows:[{kind:'制空',label:'艦戦',minCount:1},{kind:'索敵',label:'索敵装備',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  hdFCSaveAll({'2-5:other':{...hdFCDefaultState('2-5','other'),enemyAir:77},'1-1:manual':hdFCDefaultState('1-1','manual')});
  hdFCSetSelection('1-1','manual');
  const c=hdOCContext('1-1','proposal-fleet',0),result=hdOCSearch(c);if(result.signature!==hdOCSignature(c)||!result.plan)throw Error('invalid proposal fixture');
  HD_OC_CACHE.set('1-1:proposal-fleet:0',result);hdMSNOpen('1-1');
  window.storageFault={mode:'none',original:Storage.prototype.getItem,keys:['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1',HD_FC_SELECT_KEY],error:new Error('isolated planner read failure')};
  Storage.prototype.getItem=function(key){if(key===HD_FC_KEY){if(storageFault.mode==='throw'){storageFault.error.stack=new Error('isolated planner read failure').stack;throw storageFault.error;}if(storageFault.mode==='json')return '{"invalid":';if(storageFault.mode==='null')return null}return storageFault.original.call(this,key)};
 });
 await expect(page.locator('#mapStrategyNavigator [data-hd-oc-calculator]')).toBeVisible();
 return errors;
}
async function bytes(page){return page.evaluate(()=>{const values=storageFault.keys.map(k=>storageFault.original.call(localStorage,k));storageFault.reference??=values;return values.map((value,i)=>({present:value!==null,length:value?.length??0,unchanged:value===storageFault.reference[i]}))})}
async function fault(page,mode){await page.evaluate(mode=>storageFault.mode=mode,mode)}
// Fault the real operation, not an earlier scheduled navigation/render. No
// event cancellation, synthetic click, or change to the production listeners.
async function faultOnClick(page,mode,selector){await page.evaluate(({mode,selector})=>{document.addEventListener('click',function arm(e){if(!e.target.closest(selector))return;document.removeEventListener('click',arm,true);storageFault.mode=mode},true)},{mode,selector})}

test('proposal import rejects read and JSON faults before saving or selecting',async({page})=>{
 const errors=await proposalFixture(page),before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 for(const mode of ['throw','json']){
  await fault(page,mode);
  const r=await page.evaluate(()=>{const c=hdOCContext('1-1','proposal-fleet',0),result=HD_OC_CACHE.get('1-1:proposal-fleet:0');let accepted=false,error;try{accepted=hdFCImportOwnedPlan(c,result)}catch(e){error={same:e===storageFault.error,name:e.name}}return {accepted,error}});
  expect(r.accepted).toBe(false);expect(mode==='throw'?r.error.same:r.error.name==='SyntaxError').toBe(true);
  expect(await bytes(page)).toEqual(before);
 }
 await fault(page,'none');
 expect(await page.evaluate(()=>hdFCImportOwnedPlan(hdOCContext('1-1','proposal-fleet',0),HD_OC_CACHE.get('1-1:proposal-fleet:0')))).toBe(true);
 expect(await page.evaluate(()=>hdFCLoadAll()['2-5:other'].enemyAir)).toBe(77);expect(errors).toEqual([]);
});

for(const mode of ['throw','json','null'])test(`proposal import UI reports ${mode} failure and resumes without losing other plans`,async({page})=>{
 const errors=await proposalFixture(page),before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 await faultOnClick(page,mode,'#mapStrategyNavigator [data-hd-oc-calculator]');await page.locator('#mapStrategyNavigator [data-hd-oc-calculator]').click();
 expect(errors).toEqual([]);await expect(page.locator('#hdToastRegion.warn').filter({hasText:'プランナー'})).toBeVisible();if(mode==='throw'){expect(await page.evaluate(()=>hdDXLocalHealth().unavailable)).toBe(true);await page.evaluate(()=>hdPHRender());await expect(page.locator('#hdPersonalHome .hd-ph-metric').filter({hasText:'端末内データ'})).toContainText('未確認');await expect(page.locator('#hdPersonalHome .hd-ph-metric').filter({hasText:'JSON整合性'})).toContainText('未確認')}
 expect(await bytes(page)).toEqual(before);await expect(page.locator('[data-hd-fc-proposal]')).toHaveCount(0);
 await fault(page,'none');await page.locator('#mapStrategyNavigator [data-hd-oc-calculator]').click();
 await expect(page.locator('[data-hd-fc-proposal]')).toContainText('提案された艦娘・装備・★・スロット位置を反映済み');
 const after=await bytes(page);expect(after.every(v=>v.present)).toBe(true);expect(after.filter((_,i)=>![3,6].includes(i))).toEqual(before.filter((_,i)=>![3,6].includes(i)));
 expect(await page.evaluate(()=>hdFCLoadAll()['2-5:other'].enemyAir)).toBe(77);expect(errors).toEqual([]);
});

for(const mode of ['throw','json','null'])test(`planner UI edit reset and render survive ${mode} reads without empty-state success`,async({page})=>{
 const errors=await proposalFixture(page);await page.locator('#mapStrategyNavigator [data-hd-oc-calculator]').click();await expect(page.locator('[data-hd-fc-add]')).toBeVisible();
 const before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 for(const action of ['edit','reset','render']){
  const selector=action==='edit'?'[data-hd-fc-add]':action==='reset'?'[data-hd-fc-reset]':'[data-map-tab="gear"]';
  await faultOnClick(page,mode,selector);
  if(action==='edit')await page.locator('[data-hd-fc-add]').click();
  else if(action==='reset'){page.once('dialog',d=>d.accept());await page.locator('[data-hd-fc-reset]').click()}
  else await page.locator('[data-map-tab="gear"]').click();
  expect(errors).toEqual([]);await expect(page.locator('[data-hd-fc-storage-error]')).toBeVisible();expect(await bytes(page)).toEqual(before);
  await faultOnClick(page,'none','[data-hd-fc-storage-retry]');await page.locator('[data-hd-fc-storage-retry]').click();await expect(page.locator('[data-hd-fc-storage-error]')).toHaveCount(0);await expect(page.locator('[data-hd-fc-proposal]')).toBeVisible();expect(await bytes(page)).toEqual(before);
 }
 await page.locator('[data-hd-fc-add]').click();await expect(page.locator('[data-hd-fc-gear]')).toHaveCount((await page.evaluate(()=>hdFCLoadAll()['1-1:owned:proposal-fleet:0'].gear.length)));
 const after=await bytes(page);expect(after.every(v=>v.present)).toBe(true);expect(after.filter((_,i)=>i!==3)).toEqual(before.filter((_,i)=>i!==3));expect(await page.evaluate(()=>hdFCLoadAll()['2-5:other'].enemyAir)).toBe(77);expect(errors).toEqual([]);
});

for(const operation of ['state','save','reset','import'])test(`enumerable planner null read refuses ${operation} without overwriting the stored strings`,async({page},info)=>{
 const errors=await proposalFixture(page),before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 const result=await page.evaluate(operation=>{
  // A real nonnull read in this document precedes the controlled null read.
  const prior=hdFCLoadAll(true),reference=storageFault.original.call(localStorage,HD_FC_KEY);
  const listed=Object.prototype.hasOwnProperty.call(localStorage,HD_FC_KEY);
  storageFault.mode='null';let blocked=false,classified=false,writes=0;
  const nativeSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){if(key===HD_FC_KEY)writes++;return nativeSet.call(this,key,value)};
  try{
   try{
    if(operation==='state')hdFCState('1-1','new-null-read');
    if(operation==='save')hdFCSaveState('1-1','manual',{gear:[]});
    if(operation==='reset')hdFCReset('2-5','other');
    if(operation==='import')hdFCImportOwnedPlan(hdOCContext('1-1','proposal-fleet',0),HD_OC_CACHE.get('1-1:proposal-fleet:0'));
   }catch(error){blocked=true;classified=HD_FC_READ_FAILURES.has(error)}
   return {priorKnown:!!prior['2-5:other']&&reference!==null,listed,readIsNull:localStorage.getItem(HD_FC_KEY)===null,
    blocked,classified,writes,unchanged:storageFault.original.call(localStorage,HD_FC_KEY)===reference};
  }finally{Storage.prototype.setItem=nativeSet;storageFault.mode='none'}
 },operation);
 await info.attach('null-read-operation',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({priorKnown:true,listed:true,readIsNull:true,blocked:true,classified:true,writes:0,unchanged:true});
 expect(await bytes(page)).toEqual(before);
 expect(await page.evaluate(()=>hdFCImportOwnedPlan(hdOCContext('1-1','proposal-fleet',0),HD_OC_CACHE.get('1-1:proposal-fleet:0')))).toBe(true);
 expect(await page.evaluate(()=>hdFCLoadAll()['2-5:other'].enemyAir)).toBe(77);expect(errors).toEqual([]);
});

test('genuinely absent planner storage still permits first creation and normal save',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await require('./sync-version-fixture.cjs').syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFCState==='function');
 const result=await page.evaluate(()=>{
  const absent=localStorage.getItem(HD_FC_KEY)===null,listed=Object.prototype.hasOwnProperty.call(localStorage,HD_FC_KEY);
  const state=hdFCState('1-1','first');state.enemyAir=23;hdFCSaveState('1-1','first',state);
  const stored=localStorage.getItem(HD_FC_KEY);return {absent,listed,created:stored!==null,saved:hdFCLoadAll(true)['1-1:first'].enemyAir};
 });
 expect(result).toEqual({absent:true,listed:false,created:true,saved:23});expect(errors).toEqual([]);
});

test('snapshot UI refuses enumerated null without replacing good backups and resumes after recovery',async({page})=>{
 const errors=await proposalFixture(page);await page.waitForLoadState('load');await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 const before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 expect(await page.evaluate(()=>hdPHCreateSnapshot('検証用・初回正常'))).toBe(true);
 await page.locator('#hdWorkspaceNav [data-hd-ws-group="settings"]').click();await page.locator('#hdWorkspaceSectionSelect').selectOption('personalHomeCenter');
 await expect(page.locator('[data-ph-snapshot]')).toBeVisible();
 await faultOnClick(page,'null','[data-ph-snapshot]');await page.locator('[data-ph-snapshot]').click();
 await expect(page.locator('[data-ph-snapshot-read-error]')).toBeVisible();
 const blocked=await page.evaluate(async()=>{const rows=await hdPHGetSnapshots();return {baseline:rows.some(x=>x.reason==='検証用・初回正常'),badManual:rows.some(x=>x.reason==='手動')}});
 expect(blocked).toEqual({baseline:true,badManual:false});expect(await bytes(page)).toEqual(before);expect(errors).toEqual([]);
 await fault(page,'none');await page.locator('[data-ph-snapshot]').click();
 await expect.poll(()=>page.evaluate(async()=>{const row=(await hdPHGetSnapshots()).find(x=>x.reason==='手動');return !!row&&storageFault.keys.every((k,i)=>row.payload[k]!==null&&row.payload[k]===storageFault.reference[i])})).toBe(true);
 await expect(page.locator('[data-ph-snapshot-read-error]')).toHaveCount(0);expect(await bytes(page)).toEqual(before);expect(errors).toEqual([]);
});

test('export UI refuses enumerated null without a download or success marker then resumes',async({page})=>{
 const errors=await proposalFixture(page);await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 const before=await bytes(page);expect(before.every(v=>v.present)).toBe(true);
 await page.evaluate(()=>{storageFault.exportMark=storageFault.original.call(localStorage,HD_PH_LAST_EXPORT_KEY)});
 let downloads=0;page.on('download',()=>downloads++);
 await page.locator('#hdWorkspaceNav [data-hd-ws-group="settings"]').click();await page.locator('#hdWorkspaceSectionSelect').selectOption('backup');
 await faultOnClick(page,'null','#exportBackup');await page.locator('#exportBackup').click();
 await expect(page.locator('#hdToastRegion.warn').filter({hasText:'バックアップを中止'})).toBeVisible();
 expect(downloads).toBe(0);expect(await page.evaluate(()=>storageFault.original.call(localStorage,HD_PH_LAST_EXPORT_KEY)===storageFault.exportMark)).toBe(true);
 expect(await bytes(page)).toEqual(before);expect(errors).toEqual([]);
 await fault(page,'none');const download=page.waitForEvent('download');await page.locator('#exportBackup').click();await download;
 expect(downloads).toBe(1);expect(await bytes(page)).toEqual(before);expect(errors).toEqual([]);
});
