const {test,expect}=require('@playwright/test');
const {observeReload}=require('./reload-evidence.cjs');
const {observeStorage}=require('./pwa-storage-audit.cjs');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCFindAlternatives==='function');
}
async function fleet(page,{count=2,base=50,stock=2}={}){
 await boot(page);
 await page.evaluate(({count,base,stock})=>{
  window.__hdStorageAuditSnapshot?.('fixture-start');
  const names=['占守改','国後改','択捉改','松輪改'].slice(0,count);
  const rows=names.map((name,i)=>{const master=hdShipDbMasterRowFor(name),profile=hdShipDbSlotProfile(hdFEFindShip(name));return {id:'asw-'+i,name,masterId:master.id,gameShipId:100+i,level:80,gameAsw:base,gameLos:36,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',gameSlotEx:0}});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:20}));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:stock,star:0},{name:'三式爆雷投射機',count:stock,star:0}]));
  saveCustomFleets({'1-5':[{id:'oasw-fleet',name:'先制対潜統合',openingAswCount:count,ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:''}))}]});
  hdMSNPresets=()=>[{name:'対潜テストルート',ships:'海防艦'+count,openingAswCount:count}];
  hdSEChecks=()=>({rows:[{kind:'cap-asw',label:'対潜シナジー',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  HD_MAP_ADVANCED_DATA['1-5']={los:{coef:1,checks:[{safe:1,failBelow:0}]}};
  hdMSNOpen('1-5');
  window.__hdStorageAuditSnapshot?.('fixture-end');
 },{count,base,stock});
}
test.describe('PWA cached runtime',()=>{
 test('opening ASW and owned planner data survive a cached PWA restart with Chromium offline reload',async({page,context,browserName},testInfo)=>{
  const retain=observeReload(page,testInfo);
  const storageAudit=await observeStorage(page,testInfo,{scriptErrorBoundary:true});
  try{await retain.installNativeEvents({parserBoundary:testInfo.project.metadata?.parserBoundary!==false});
  await fleet(page,{count:4,stock:4});
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const snapshot=await page.evaluate(()=>{
   const c=hdOCContext('1-5','oasw-fleet',0),result=hdOCSearch(c);hdFCImportOwnedPlan(c,result);
   const keys=[CUSTOM_FLEET_KEY,HD_FL_KEY,SHIP_ROSTER_KEY,HD_FC_KEY,'harbordesk-kancolle-sync-v1'];window.offlineOwnedKeys=keys;return {keys,values:keys.map(k=>localStorage.getItem(k)),count:hdOCOaswMeasure(result.plan).count};
  });expect(snapshot.count).toBe(4);
  expect(await page.evaluate(async()=>!!(await caches.match('./index.html'))&&!!(await caches.match('./owned-equipment-planner.js')))).toBe(true);
  // Let the service worker handle same-origin requests during the restart.
  await page.unroute('**/*');
  await page.route(url=>!['127.0.0.1','localhost'].includes(url.hostname),r=>r.fulfill({status:204,body:''}));
  // Playwright's WebKit setOffline/reload produces an engine-internal navigation error
  // even with an active service worker; verify its cache and online restart here.
  if(browserName==='chromium')await context.setOffline(true);
  else test.info().annotations.push({type:'engine-limitation',description:'WebKit cache + online restart tested; offline navigation requires iPhone verification.'});
  await storageAudit.mark('pre-reload');
  retain.mark('reload-start');await page.reload({waitUntil:'domcontentloaded'});retain.mark('reload-domcontentloaded');await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEOpeningAsw==='function');
  await storageAudit.mark('application-ready-before-comparison');
  expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),snapshot.keys)).toEqual(snapshot.values);
  const check=await page.evaluate(()=>{const p=hdFEPlanFromSavedFleet('1-5',loadCustomFleets()['1-5'][0]);return {target:hdOCOaswTarget(hdOCContext('1-5','oasw-fleet',0)),hq:Object.values(hdFCLoadAll()).find(x=>x.proposal).hqLevel,ownership:hdOCShipOwnership(p).every(x=>x.status==='ready')}});
  expect(check).toEqual({target:4,hq:20,ownership:true});retain.mark('five-keys-and-owned-plan-restored');await storageAudit.mark('five-keys-and-owned-plan-restored');await context.setOffline(false);
  }catch(error){retain.failure();throw error}finally{try{await storageAudit.finish()}finally{await retain()}}
 });
});
