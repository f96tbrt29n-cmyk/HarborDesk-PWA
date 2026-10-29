'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {legacySession}=require('./fixtures/seven-two-legacy-sortie-consumers.cjs');
const SESSION='harbordesk-active-sortie-session-v1',PREF='harbordesk-sortie-objective-pref-v1',LOG='harbordesk-sortie-log-v1';
const CUSTOM='harbordesk-custom-fleets-v1';
const KEYS=[SESSION,PREF,LOG,CUSTOM,'harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1'];
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

function fixture(variant){
 const session=legacySession({target:variant==='mapped'?'G2':'OLD-SESSION'});
 const prefs={'7-2':variant==='mapped'?'G1':'OLD-PREF','1-1':'untouched',metadata:{keep:true}};
 const logs=[{id:'legacy-log-keep',at:1700000000200,map:'7-2',node:'G1',result:'A',boss:false,battles:3,objectiveTarget:'G1',memo:'old log',metadata:{keep:'log'}},{id:'other-log-keep',at:1700000000000,map:'1-1',node:'C',result:'S',boss:true,battles:1,metadata:{keep:'other log'}}];
 const custom={'7-2':[{id:'unrelated-seven-two',name:'別編成保持',metadata:{keep:'other fleet'},ships:[{ship:'夕立改二',gear:'',gameShipId:19841,masterId:144,rosterId:'other-roster',metadata:{keep:'other ship'}}]}],'1-1':[{id:'other-map',metadata:{keep:'other map'},ships:[]}]};
 const raw={[SESSION]:JSON.stringify(session),[PREF]:JSON.stringify(prefs),[LOG]:JSON.stringify(logs),[CUSTOM]:JSON.stringify(custom),'harbordesk-ship-roster-v1':'[]','harbordesk-equipment-v1':'[]','harbordesk-kancolle-sync-v1':JSON.stringify({admiralLevel:120,metadata:{keep:'sync'}})};
 return {session,prefs,logs,raw};
}
async function boot(page,errors){
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url()),version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});return ['127.0.0.1','localhost'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdSMOpen==='function'&&typeof hdMSNOpen==='function');
}
async function read(page){return page.evaluate(keys=>{const raw=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));return {raw,session:JSON.parse(raw['harbordesk-active-sortie-session-v1']||'null'),prefs:JSON.parse(raw['harbordesk-sortie-objective-pref-v1']||'{}'),logs:JSON.parse(raw['harbordesk-sortie-log-v1']||'[]'),documentId:performance.timeOrigin,origin:location.origin,readyState:document.readyState}},KEYS)}
function compare(snapshot,expected,prefs,ref,{timestamp=false,log,label}={}){
 const intended=JSON.parse(JSON.stringify(expected)),actualTime=snapshot.session?.draft?.updatedAt;
 const timestampAllowed=!timestamp||(Number.isFinite(actualTime)&&actualTime>=expected.draft.updatedAt);
 if(timestamp&&snapshot.session?.draft)intended.draft.updatedAt=actualTime;
 const exactField=(a,b,key)=>Object.hasOwn(a||{},key)===Object.hasOwn(b||{},key)&&JSON.stringify(a?.[key])===JSON.stringify(b?.[key]);
 const metadata={label,targetExact:exactField(snapshot.session?.draft,expected.draft,'objectiveTarget'),historyExact:['node','routeNodes','battles','boss','advanceGuard','routeGraph'].every(key=>exactField(snapshot.session?.draft,expected.draft,key)),sessionExactExceptIntended:timestampAllowed&&JSON.stringify(snapshot.session)===JSON.stringify(intended),prefsExact:JSON.stringify(snapshot.prefs)===JSON.stringify(prefs),logsExact:snapshot.raw[LOG]===ref.raw[LOG],othersExact:KEYS.filter(k=>![SESSION,PREF,LOG].includes(k)).every(k=>snapshot.raw[k]===ref.raw[k]),documentId:snapshot.documentId,origin:snapshot.origin,readyState:snapshot.readyState};
 // Record only comparisons from this existing read before an assertion can stop the case.
 log.push(metadata);
 if(timestamp){expect(Number.isFinite(actualTime)).toBe(true);expect(actualTime).toBeGreaterThanOrEqual(expected.draft.updatedAt)}
 expect(snapshot.session).toStrictEqual(intended);expect(snapshot.prefs).toStrictEqual(prefs);expect(snapshot.raw[LOG]).toBe(ref.raw[LOG]);
 for(const key of KEYS.filter(k=>![SESSION,PREF,LOG].includes(k)))expect(snapshot.raw[key]).toBe(ref.raw[key]);
 return {session:intended,metadata};
}

for(const variant of ['mapped','unknown-clear'])test(variant==='mapped'?'7-2 legacy mapped objective preserves raw sortie history through edit load and return':'7-2 legacy unknown objective distinguishes explicit clear without reinterpreting history',async({page},info)=>{
 const ref=fixture(variant),errors=[],evidence={unit:'7-2-compat',variant,scope:'synthetic old sortie session and preferences, not observed user-data loss; old route nodes and metadata are never mapped to real cells',comparisons:[],intendedDifferences:variant==='mapped'?['draft.memo','draft.updatedAt from existing autosave/pagehide','explicit finish clears active session and adds one log']:['draft.memo','draft.updatedAt from existing autosave/pagehide','explicit clear sets own empty draft.objectiveTarget and prefs7-2'],stage:'boot'};
 try{
  await boot(page,errors);
  await page.evaluate(raw=>{for(const [key,value]of Object.entries(raw))localStorage.setItem(key,value);hdSMEnsure();hdSMOpen()},ref.raw);
  let current=compare(await read(page),ref.session,ref.prefs,ref,{log:evidence.comparisons,label:'initial-display'});
  const mode=page.locator('#hdSortieMode');await expect(mode).toBeVisible();
  await expect(mode.locator('[data-hd-sm-legacy-route]')).toBeVisible();
  await expect(mode.locator('[data-hd-sm-objective-status]')).toHaveAttribute('data-hd-sm-objective-status',variant==='mapped'?'legacy':'unknown');
  await expect(mode.locator('[data-hd-sm-legacy-objective]')).toContainText(variant==='mapped'?'G2':'再選択');
  if(variant==='mapped'){await expect(mode.locator('[data-hd-sm-objective="M"]')).toHaveClass(/active/);await expect(mode.locator('[data-hd-sm-objective=""]')).not.toHaveClass(/active/)}
  else await expect(mode.locator('[data-hd-sm-objective=""]')).not.toHaveClass(/active/);
  await expect(mode.locator('#hdSMBattles')).toHaveValue('9');

  // These are existing route controls; opening and changing a candidate is not a target-clear action.
  evidence.stage='candidate-route-switch';await page.evaluate(()=>hdMSNOpen('7-2'));
  await page.locator('#hdMapStrategyRoute').selectOption('1');await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('1');
  await page.locator('#hdMapStrategyRoute').selectOption('0');await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('0');
  await page.evaluate(()=>hdSMOpen());await expect(mode).toBeVisible();
  current=compare(await read(page),ref.session,ref.prefs,ref,{log:evidence.comparisons,label:'candidate-route-switch'});

  evidence.stage='memo-edit';await mode.locator('#hdSMMemo').fill('keep memo / edited');
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1'))?.draft?.memo)).toBe('keep memo / edited');
  let expected=JSON.parse(JSON.stringify(ref.session));expected.draft.memo='keep memo / edited';
  current=compare(await read(page),expected,ref.prefs,ref,{timestamp:true,log:evidence.comparisons,label:'memo-autosave'});expected=current.session;
  let expectedPrefs=ref.prefs;
  if(variant==='unknown-clear'){
   evidence.stage='explicit-clear';await mode.locator('[data-hd-sm-objective=""]').click();
   expected=JSON.parse(JSON.stringify(expected));expected.draft.objectiveTarget='';expectedPrefs={...ref.prefs,'7-2':''};
   const cleared=await read(page);
   current=compare(cleared,expected,expectedPrefs,ref,{timestamp:true,log:evidence.comparisons,label:'explicit-clear-only'});expected=current.session;
   expect(Object.hasOwn(cleared.session.draft,'objectiveTarget')).toBe(true);expect(Object.hasOwn(cleared.prefs,'7-2')).toBe(true);
   await expect(mode.locator('[data-hd-sm-objective-status]')).toHaveAttribute('data-hd-sm-objective-status','cleared');await expect(mode.locator('[data-hd-sm-objective=""]')).toHaveClass(/active/);await expect(mode.locator('[data-hd-sm-legacy-route]')).toBeVisible();
  }

  evidence.stage='reload';const firstDocument=current.metadata.documentId;
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdSMOpen==='function');
  const loadedDocument=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdSMOpen());await expect(mode).toBeVisible();
  const loaded=await read(page);
  // The existing pagehide save may update only its save timestamp; it must not reinterpret the old data.
  current=compare(loaded,expected,expectedPrefs,ref,{timestamp:true,log:evidence.comparisons,label:'same-load-document'});expected=current.session;
  expect(loaded.documentId).toBe(loadedDocument);expect(loaded.documentId).not.toBe(firstDocument);expect(loaded.readyState).toBe('complete');
  await expect(mode.locator('[data-hd-sm-objective-status]')).toHaveAttribute('data-hd-sm-objective-status',variant==='mapped'?'legacy':'cleared');await expect(mode.locator('[data-hd-sm-legacy-route]')).toBeVisible();await expect(mode.locator('#hdSMMemo')).toHaveValue('keep memo / edited');await expect(mode.locator('#hdSMBattles')).toHaveValue('9');
  if(variant==='mapped'){
   await expect(mode.locator('[data-hd-sm-objective="M"]')).toHaveClass(/active/);
   evidence.stage='return';const source=await read(page);await mode.locator('[data-hd-sm-finish]').click();
   await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]').length)).toBe(ref.logs.length+1);
   const finished=await read(page),entry=finished.logs[0];
   evidence.returned={legacySnapshotExact:JSON.stringify(entry?.legacyRouteSnapshot?.session)===JSON.stringify(source.session),priorLogsExact:JSON.stringify(finished.logs.slice(1))===ref.raw[LOG],sourceSessionClearedAsIntended:finished.session===null,rawObjectiveRetained:entry?.objectiveTarget===source.session.draft.objectiveTarget,prefsExact:JSON.stringify(finished.prefs)===JSON.stringify(ref.prefs),standardFieldsExact:entry?.map==='7-2'&&entry?.node==='C'&&entry?.objectiveTarget==='G2'&&entry?.battles===9&&entry?.boss===false&&entry?.legacyRouteSnapshot?.status==='legacy',othersExact:KEYS.filter(k=>![SESSION,PREF,LOG].includes(k)).every(k=>finished.raw[k]===ref.raw[k])};
   expect(finished.session).toBeNull();expect(entry).toMatchObject({map:'7-2',node:'C',objectiveTarget:'G2',battles:9,boss:false,legacyRouteSnapshot:{status:'legacy'}});expect(entry.legacyRouteSnapshot.session).toStrictEqual(source.session);expect(finished.logs.slice(1)).toStrictEqual(ref.logs);expect(JSON.stringify(finished.logs.slice(1))).toBe(ref.raw[LOG]);expect(finished.prefs).toStrictEqual(ref.prefs);
   for(const key of KEYS.filter(k=>![SESSION,PREF,LOG].includes(k)))expect(finished.raw[key]).toBe(ref.raw[key]);
  }
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{evidence.pageerrors=errors;const output=info.outputPath('sortie-compatibility-evidence.json');await require('node:fs/promises').writeFile(output,JSON.stringify(evidence,null,2));await info.attach('sortie-compatibility-evidence',{path:output,contentType:'application/json'})}
});
