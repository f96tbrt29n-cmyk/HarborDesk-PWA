const { test, expect } = require('@playwright/test');
const { observeReload } = require('./reload-evidence.cjs');
// Retain first-attempt network/API evidence for these reload cases.
// Whole-document snapshots previously blocked the main thread for up to 15.9s;
// phases, screenshots, video, source and network evidence remain available.
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 45000 });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 45000 });
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-loadout-planner.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-suggester.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
}


test('night CI policy selection regenerates the quick owned loadout and persists across reloads',async({page},testInfo)=>{
 const retainReloadEvidence=observeReload(page,testInfo);
 try {
 await retainReloadEvidence.installNativeEvents({instrumentSW:!!testInfo.project.metadata?.swProbe||process.env.HD_RELOAD_BUFFER_SW==='1'});
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const db=hdFEFindShip('夕立改二'),masterId=hdShipDbMasterRowFor(db).id;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'12.7cm連装砲',count:3},{name:'61cm四連装(酸素)魚雷',count:2},{name:'水雷戦隊 熟練見張員',count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',masterId,gameShipId:71,level:90,gameSlotEx:0}]));
  hdFSMap=()=> '1-1';hdFSPlans=()=>[{...hdFSGenerate('1-1',{name:'night fixture',ships:'駆逐艦1',gear:''},0),needs:[]}];
  const suggestion=hdFSPlans()[0];if(suggestion.slots.filter(x=>x.profile).length!==1)throw new Error('policy fixture must contain one owned ship');hdFSSuggestionHtml(suggestion);const card=document.createElement('article');card.id='night-policy-test';card.className='hd-fs-card';card.innerHTML='<button data-hd-fl-generate="0">自動配備</button><div class="hd-fl-host"></div>';document.body.appendChild(card);hdFLRender(0,card);
 });
 const card=page.locator('#night-policy-test');await card.locator('[data-hd-night-policy]').selectOption('torpedo');
 await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightCI(p.ships[0]).attack})).toBe('torpedo');await expect(card).toContainText('夜戦汎用CI装備条件：成立');
 const r=await page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return {policy:hdSENightPolicy('1-1'),goal:p.assessment.measure.goals.find(g=>g.kind==='cap-night-torpedo'),usage:hdFOAssignedUsage(p),expansion:p.ships[0].expansion}});expect(r.policy).toBe('torpedo');expect(r.goal.ok).toBe(true);expect(r.usage['61cm四連装(酸素)魚雷@@0']).toBe(2);expect(r.expansion).toBeNull();
 await card.locator('[data-hd-night-policy]').selectOption('dd-water-torpedo');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightDD(p.ships[0]).candidates.some(c=>c.attack==='dd-water-torpedo')})).toBe(true);await expect(card).toContainText('駆逐艦専用CI装備条件：成立');await expect(card).toContainText('Lv90：2回攻撃型のレベル条件を充足');expect(await page.evaluate(()=>HD_FL_CACHE['1-1:0'].ships[0].expansion)).toBeNull();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);retainReloadEvidence.mark('reload-start');await page.reload({waitUntil:'domcontentloaded'});retainReloadEvidence.mark('reload-domcontentloaded');await page.waitForFunction(()=>typeof hdSENightPolicy==='function');expect(await page.evaluate(()=>hdSENightPolicy('1-1'))).toBe('dd-water-torpedo');
 retainReloadEvidence.mark('policy-restored');
 expect(retainReloadEvidence.errors()).toEqual([]);
 } catch(error) { retainReloadEvidence.failure(); throw error; } finally { await retainReloadEvidence(); }
});

test('carrier night CI policy persists and regenerates the mobile loadout',async({page},testInfo)=>{
 const retainReloadEvidence=observeReload(page,testInfo);
 try {
 await retainReloadEvidence.installNativeEvents({instrumentSW:!!testInfo.project.metadata?.swProbe||process.env.HD_RELOAD_BUFFER_SW==='1'});
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 if(testInfo.project.metadata?.retentionFixture)await page.evaluate(()=>{
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,syncedAt:Date.now()}));
  if(!localStorage.getItem('harbordesk-pwa-v1'))localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
  saveCustomFleets({'1-1':[{id:'reload-retention',name:'Dedicated six-key fixture',ships:[{ship:'赤城改',gameShipId:882,masterId:hdShipDbMasterRowFor('赤城改').id,gear:'F6F-3N / TBM-3D / 夜間作戦航空要員 / F6F-3N'}]}]});
  hdFCState('1-1','reload-retention');
 });
 await page.evaluate(()=>{
  const ship='赤城改',masterId=hdShipDbMasterRowFor(hdFEFindShip(ship)).id;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'F6F-3N',count:2},{name:'TBM-3D',count:1},{name:'夜間作戦航空要員',count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,masterId,gameShipId:882,level:90,gameSlotEx:0}]));hdFSMap=()=> '1-1';hdFSPlans=()=>[{...hdFSGenerate('1-1',{name:'carrier fixture',ships:'正規空母1',gear:''},0),needs:[]}];const suggestion=hdFSPlans()[0];if(suggestion.slots.filter(x=>x.profile).length!==1)throw new Error('policy fixture must contain one owned ship');hdFSSuggestionHtml(suggestion);const card=document.createElement('article');card.id='carrier-policy-test';card.className='hd-fs-card';card.innerHTML='<button data-hd-fl-generate="0">自動配備</button><div class="hd-fl-host"></div>';document.body.appendChild(card);hdFLRender(0,card);
 });
 const card=page.locator('#carrier-policy-test');await card.locator('[data-hd-night-policy]').selectOption('cv-fighter2');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightCarrier(p.ships[0]).candidates.some(c=>c.attack==='cv-fighter2')})).toBe(true);await expect(card).toContainText('空母夜戦CI装備条件：成立');await expect(card).toContainText('残機未同期');expect(await page.evaluate(()=>HD_FL_CACHE['1-1:0'].ships[0].expansion)).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const saved=await page.evaluate(()=>{
  const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
  return {keys,values:keys.map(k=>localStorage.getItem(k))};
 });
 if(testInfo.project.metadata?.retentionFixture)expect(saved.values.every(v=>v!==null)).toBe(true);
 await testInfo.attach('pre-reload-six-key-presence',{body:Buffer.from(JSON.stringify(saved.keys.map((key,i)=>({key,present:saved.values[i]!==null})))),contentType:'application/json'});
 retainReloadEvidence.mark('reload-start');await page.reload({waitUntil:'domcontentloaded'});retainReloadEvidence.mark('reload-domcontentloaded');await page.waitForFunction(()=>typeof hdSENightPolicy==='function');expect(await page.evaluate(()=>hdSENightPolicy('1-1'))).toBe('cv-fighter2');
 expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),saved.keys)).toEqual(saved.values);
 retainReloadEvidence.mark('six-keys-restored');
 retainReloadEvidence.mark('policy-restored');
 expect(retainReloadEvidence.errors()).toEqual([]);
 } catch(error) { retainReloadEvidence.failure(); throw error; } finally { await retainReloadEvidence(); }
});

test('carrier bomber CI policy persists and regenerates the mobile loadout',async({page},testInfo)=>{
 const retainReloadEvidence=observeReload(page,testInfo);
 try {
 await retainReloadEvidence.installNativeEvents({instrumentSW:!!testInfo.project.metadata?.swProbe||process.env.HD_RELOAD_BUFFER_SW==='1'});
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const ship='赤城改',masterId=hdShipDbMasterRowFor(hdFEFindShip(ship)).id;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'九九式練爆二二型改(夜間装備実験機)',count:2},{name:'夜間作戦航空要員',count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,masterId,gameShipId:890,level:90,gameSlotEx:0}]));hdFSMap=()=> '1-1';hdFSPlans=()=>[{...hdFSGenerate('1-1',{name:'bomber fixture',ships:'正規空母1',gear:''},0),needs:[]}];const suggestion=hdFSPlans()[0];if(suggestion.slots.filter(x=>x.profile).length!==1)throw new Error('policy fixture must contain one owned ship');hdFSSuggestionHtml(suggestion);const card=document.createElement('article');card.id='bomber-policy-test';card.className='hd-fs-card';card.innerHTML='<button data-hd-fl-generate="0">自動配備</button><div class="hd-fl-host"></div>';document.body.appendChild(card);hdFLRender(0,card);
 });
 const card=page.locator('#bomber-policy-test');await card.locator('[data-hd-night-policy]').selectOption('cv-bomber');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightCarrier(p.ships[0]).candidates.some(c=>c.attack==='cv-bomber')})).toBe(true);await expect(card).toContainText('空母夜戦CI装備条件：成立');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);retainReloadEvidence.mark('reload-start');await page.reload({waitUntil:'domcontentloaded'});retainReloadEvidence.mark('reload-domcontentloaded');await page.waitForFunction(()=>typeof hdSENightPolicy==='function');expect(await page.evaluate(()=>hdSENightPolicy('1-1'))).toBe('cv-bomber');
 retainReloadEvidence.mark('policy-restored');
 expect(retainReloadEvidence.errors()).toEqual([]);
 } catch(error) { retainReloadEvidence.failure(); throw error; } finally { await retainReloadEvidence(); }
});

test('submarine night CI policy regenerates the mobile owned loadout and persists the selected set',async({page},testInfo)=>{
 const retain=observeReload(page,testInfo);
 try{
 await retain.installNativeEvents();
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const masterId=hdShipDbMasterRowFor(hdFEFindShip('伊58改')).id;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'後期型艦首魚雷(6門)',count:2},{name:'潜水艦搭載電探＆逆探(E27)',count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'伊58改',masterId,gameShipId:93,level:90,gameSlotEx:0}]));hdFSMap=()=> '1-1';hdFSPlans=()=>[{index:0,preset:{name:'sub fixture'},needs:[],slots:[{profile:{row:{name:'伊58改',masterId,gameShipId:93,level:90},type:'潜水空母',roles:[]}}]}];const card=document.createElement('article');card.id='sub-policy-test';card.className='hd-fs-card';card.innerHTML='<button data-hd-fl-generate="0">自動配備</button><div class="hd-fl-host"></div>';document.body.appendChild(card);hdFLRender(0,card);
 });
 const card=page.locator('#sub-policy-test');await card.locator('[data-hd-night-policy]').selectOption('sub-radar');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightSub(p.ships[0]).attack})).toBe('sub-radar');await expect(card).toContainText('潜水艦夜戦CI装備条件：成立');await card.locator('[data-hd-night-policy]').selectOption('sub-late');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&hdFENightSub(p.ships[0]).attack})).toBe('sub-late');expect(await page.evaluate(()=>HD_FL_CACHE['1-1:0'].ships[0].expansion)).toBeNull();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);retain.mark('reload-start');await page.reload({waitUntil:'domcontentloaded'});retain.mark('reload-domcontentloaded');await page.waitForFunction(()=>typeof hdSENightPolicy==='function');expect(await page.evaluate(()=>hdSENightPolicy('1-1'))).toBe('sub-late');
 retain.mark('policy-restored');
 }catch(error){retain.failure();throw error}finally{await retain()}
});
