const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCFindAlternatives==='function');
}
async function fleet(page,{count=2,base=50,stock=2}={}){
 await boot(page);
 await page.evaluate(({count,base,stock})=>{
  const names=['占守改','国後改','択捉改','松輪改'].slice(0,count);
  const rows=names.map((name,i)=>{const master=hdShipDbMasterRowFor(name),profile=hdShipDbSlotProfile(hdFEFindShip(name));return {id:'asw-'+i,name,masterId:master.id,gameShipId:100+i,level:80,gameAsw:base,gameLos:36,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',gameSlotEx:0}});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:20}));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:stock,star:0},{name:'三式爆雷投射機',count:stock,star:0}]));
  saveCustomFleets({'1-5':[{id:'oasw-fleet',name:'先制対潜統合',openingAswCount:count,ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:''}))}]});
  hdMSNPresets=()=>[{name:'対潜テストルート',ships:'海防艦'+count,openingAswCount:count}];
  hdSEChecks=()=>({rows:[{kind:'cap-asw',label:'対潜シナジー',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  HD_MAP_ADVANCED_DATA['1-5']={los:{coef:1,checks:[{safe:1,failBelow:0}]}};
  hdMSNOpen('1-5');
 },{count,base,stock});
}
test('opening ASW search equips two distinct ships from owned stacks and counts real capabilities',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(()=>{const c=hdOCContext('1-5','oasw-fleet',0),result=hdOCSearch(c);return {result,readiness:hdOCReadiness(result.plan,result.measure),stock:[...hdFLInventory().values()],usage:hdFOAssignedUsage(result.plan)}});
 const goal=r.result.measure.goals.find(x=>x.kind==='opening-asw');expect(goal).toMatchObject({count:2,minCount:2,ok:true});expect(goal.ships.every(x=>x.state.status==='ready')).toBe(true);
 expect(r.readiness.registeredReady).toBe(true);expect(r.readiness.complete).toBe(false);
 for(const row of r.stock)expect(r.usage[row.key]||0).toBeLessThanOrEqual(row.count);
});
test('opening ASW positive target remains unmet when synced ASW and baseline are absent',async({page})=>{
 await fleet(page,{count:1,stock:1});
 const r=await page.evaluate(()=>{
  const rows=hdFERoster();for(const row of rows){delete row.gameAsw;delete row.gameAswBaseline;}
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));
  return {goal:result.measure.goals.find(x=>x.kind==='opening-asw'),readiness:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.goal).toMatchObject({minCount:1,count:0,ok:false,unresolved:true});
 expect(r.goal.ships).toHaveLength(1);expect(r.goal.ships[0].state.status).toBe('manual');
 expect(r.readiness.registeredReady).toBe(false);
});
test('opening ASW positive target cannot reuse one owned sonar for two ships',async({page})=>{
 await fleet(page,{count:2,base:60,stock:1});
 const r=await page.evaluate(()=>{
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));
  return {goal:result.measure.goals.find(x=>x.kind==='opening-asw'),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory().values()],readiness:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.goal).toMatchObject({minCount:2,count:1,ok:false});
 for(const row of r.stock)expect(r.usage[row.key]||0).toBeLessThanOrEqual(row.count);
 expect(r.readiness.registeredReady).toBe(false);
});
test('opening ASW lower bounds never turn unverified bonus deficits or missing gear into success',async({page})=>{
 await fleet(page,{base:49,stock:1});
 const r=await page.evaluate(()=>{
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));const row=hdFERoster()[0],profile=hdShipDbSlotProfile(hdFEFindShip(row.name)),ship={ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0}]};
  const low=hdFEOpeningAsw(ship);row.gameAsw=60;row.gameGearSlots=Array.from({length:profile.count},(_,i)=>i?'':'三式水中探信儀');localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));const exact=hdFEOpeningAsw(ship);ship.items[0].name='四式水中聴音機';const swapped=hdFEOpeningAsw(ship);return {result,low,exact,swapped};
 });
 expect(r.result.measure.goals.find(x=>x.kind==='opening-asw').ok).toBe(false);expect(r.low).toMatchObject({status:'manual',lowerBound:true,value:59,shortfall:1});expect(r.exact.status).toBe('ready');expect(r.swapped.status).toBe('manual');
});
test('opening ASW importer retains a naked baseline only across matching level remodel and modernization',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,-1,-1],api_slot_ex:0,api_taisen:[90,130],api_kyouka:[0,0,0,0,0,0,0]};parsed.ships.set(71,ship);hdKcMergeRoster(parsed);
  ship.api_slot=[10,-1,-1];ship.api_taisen=[100,130];parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);const kept=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  const proposed={ship:'夕立改二',masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]},state=hdFEOpeningAsw(proposed);
  ship.api_lv=91;hdKcMergeRoster(parsed);const leveled=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  ship.api_lv=90;ship.api_slot=[-1,-1,-1];ship.api_taisen=[90,130];hdKcMergeRoster(parsed);ship.api_slot=[10,-1,-1];ship.api_kyouka[6]=1;hdKcMergeRoster(parsed);const modernized=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  return {kept,state,leveled,modernized};
 });
 expect(r.kept.value).toBe(90);expect(r.state).toMatchObject({status:'ready',value:102,lowerBound:true});expect(r.leveled).toBeNull();expect(r.modernized).toBeNull();
});
test('opening ASW importer rejects incomplete slot arrays as evidence for a naked baseline',async({page})=>{
 await boot(page);
 const results=await page.evaluate(()=>{
  const mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  return [[],[-1],[null,null,null],['','',''],[-2,-1,-1]].map(api_slot=>{
   localStorage.setItem('harbordesk-ship-roster-v1','[]');const parsed=hdKcImportEmpty();
   const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot,api_slot_ex:0,api_taisen:[90,130],api_kyouka:[0,0,0,0,0,0,0]};parsed.ships.set(71,ship);hdKcMergeRoster(parsed);
   const row=hdFERoster()[0],before={known:row.gameAswGearKnown,baseline:row.gameAswBaseline};
   ship.api_slot=[10,-1,-1];ship.api_taisen=[100,130];parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
   const state=hdFEOpeningAsw({ship:'夕立改二',masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]});return {before,state};
  });
 });
 for(const r of results){expect(r.before).toEqual({known:false,baseline:null});expect(r.state.status).toBe('manual');expect(r.state.value??null).toBeNull();}
});
test('incomplete ship slots preserve previous equipment identity and unrelated ledgers even with a complete inventory',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,10,-1],api_slot_ex:0,api_taisen:[100,130]};parsed.ships.set(71,ship);parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
  const row=hdFERoster()[0];row.memo='保持するメモ';localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1}]));localStorage.setItem('harbordesk-kancolle-materials-v1',JSON.stringify({fuel:12345}));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:12345,ammo:23456,steel:34567,bauxite:45678}}));
  hdFCSaveState('1-5','preserved',{hqLevel:75,ships:[{name:row.name,gameShipId:71}],gear:[{name:'三式水中探信儀',slotIndex:1,star:0,slot:0}]});
  saveCustomFleets({'1-5':[{id:'preserved',ships:[{ship:row.name,rosterId:row.id,gameShipId:71,masterId:mid,gear:row.gear}]}]});
  const keys=['harbordesk-equipment-v1','harbordesk-kancolle-materials-v1','harbordesk-pwa-v1',CUSTOM_FLEET_KEY,HD_FC_KEY],values=keys.map(k=>localStorage.getItem(k));
  ship.api_slot=[];ship.api_taisen=[90,130];parsed.completeSlotItems=true;hdKcMergeRoster(parsed);const after=hdFERoster()[0];
  return {before:row,after,unrelatedPreserved:JSON.stringify(values)===JSON.stringify(keys.map(k=>localStorage.getItem(k))),state:hdFEOpeningAsw({ship:row.name,masterId:mid,gameShipId:71,items:[{name:'三式水中探信儀',slotIndex:1,capacity:0}]})};
 });
 expect(r.after).toMatchObject({id:r.before.id,gameShipId:71,gear:r.before.gear,gameGearSlots:r.before.gameGearSlots,gameGearExpansion:r.before.gameGearExpansion,memo:'保持するメモ',gameAswGearKnown:false});
 expect(r.unrelatedPreserved).toBe(true);expect(r.state.status).toBe('manual');
});
test('documented 37 maps and 53 presets remain available to the existing route selector',async({page})=>{
 const doc=fs.readFileSync(path.join(__dirname,'../docs/route-condition-coverage-ja.md'),'utf8');
 const documented=[...doc.matchAll(/^\| (\d+-\d+) \| (\d+) \|/gm)].map(m=>({map:m[1],count:Number(m[2])})).sort((a,b)=>a.map.localeCompare(b.map));
 await boot(page);
 const actual=await page.evaluate(()=>Object.keys(MAP_PLANS).map(map=>({map,count:hdMSNPresets(map).length})).sort((a,b)=>a.map.localeCompare(b.map)));
 expect(actual).toEqual(documented);expect(actual).toHaveLength(37);expect(actual.reduce((n,r)=>n+r.count,0)).toBe(53);
});
test('linked fleet sync retains sparse slots expansion and saved individual IDs when ship slots are missing',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0],gun=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='25mm連装機銃')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,10,-1],api_slot_ex:11,api_taisen:[100,130]};parsed.ships.set(71,ship);parsed.decks.set(1,{api_id:1,api_name:'保持テスト',api_ship:[71]});
  parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});parsed.slotItems.set(11,{api_id:11,api_slotitem_id:gun});hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);
  const roster=hdFERoster()[0],fleet=hdKcCopyFleetToCustom(1,'1-5');fleet.ships[0].rosterId=roster.id;saveCustomFleets({'1-5':[fleet]});
  const before=hdKcCurrentFleets()[0].ships[0],savedBefore=loadCustomFleets()['1-5'][0].ships[0],planBefore=hdFEPlanFromSavedFleet('1-5',fleet);
  ship.api_slot=[];ship.api_slot_ex=null;parsed.completeSlotItems=true;hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);
  const after=hdKcCurrentFleets()[0].ships[0],savedAfter=loadCustomFleets()['1-5'][0].ships[0],match=hdFEGameMatch(planBefore);
  ship.api_slot=[-1,-1,-1];ship.api_slot_ex=0;hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);const cleared=loadCustomFleets()['1-5'][0].ships[0];
  return {before,after,savedBefore,savedAfter,planBefore,match,cleared};
 });
 expect(r.planBefore.ships[0].items).toEqual([expect.objectContaining({name:'三式水中探信儀',slotIndex:1})]);expect(r.planBefore.ships[0].expansion.name).toBe('25mm連装機銃');
 expect(r.after).toMatchObject({gearSlots:r.before.gearSlots,gearExpansion:r.before.gearExpansion,gearKnown:false});
 expect(r.savedAfter).toMatchObject({gameShipId:71,rosterId:r.savedBefore.rosterId,gear:r.savedBefore.gear});expect(r.match.status).toBe('manual');expect(r.match.detail).toContain('装備情報未確認');
 expect(r.cleared.gear).toBe('');expect(r.cleared.gameShipId).toBe(71);
});
test('opening ASW legacy baseline without complete slot evidence stays unverified without deleting saved data',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  parsed.ships.set(71,{api_id:71,api_ship_id:mid,api_lv:90,api_slot:[10,-1,-1],api_slot_ex:0,api_taisen:[100,130],api_kyouka:[0,0,0,0,0,0,0]});parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
  const row=hdFERoster()[0];row.memo='旧データを保持';row.gameAswBaseline={value:90,level:90,masterId:mid,mods:row.gameAswMods};localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));
  const before=localStorage.getItem('harbordesk-ship-roster-v1'),ship={ship:row.name,masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]},changed=hdFEOpeningAsw(ship);
  ship.items[0].name='三式水中探信儀';const exact=hdFEOpeningAsw(ship);return {changed,exact,unchanged:before===localStorage.getItem('harbordesk-ship-roster-v1')};
 });
 expect(r.changed.status).toBe('manual');expect(r.exact).toMatchObject({status:'ready',value:100,source:'同じ装備での同期値'});expect(r.unchanged).toBe(true);
});
test('opening ASW goal edits invalidate proposals and confirmed values update the integrated result',async({page})=>{
 await fleet(page,{base:49,stock:1});const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();
 await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('先制対潜');await expect(panel.locator('[data-hd-oc-readiness]')).not.toContainText('登録範囲の条件を充足');
 const input=panel.locator('[data-hd-oc-oasw-ship][data-hd-oasw-value]').first();await input.fill('60');
 expect(await page.evaluate(()=>{const active=document.activeElement;hdMSNRender();return active===document.activeElement&&active.isConnected})).toBe(true);
 await input.press('Tab');
 await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('入力したゲーム表示値 60');
 await panel.locator('[data-hd-oc-asw-target]').fill('1');await panel.locator('[data-hd-oc-asw-target]').press('Tab');await expect(panel.locator('[data-hd-oc-apply]')).toHaveCount(0);
 expect(await page.evaluate(()=>hdOCOaswTarget(hdOCContext('1-5','oasw-fleet',0)))).toBe(1);
});
test('opening ASW saves individual IDs and gear then reloads and reflects synchronized HQ in the planner',async({page})=>{
 await fleet(page);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-readiness]')).toContainText('登録範囲の条件を充足');
 const proposed=await page.evaluate(()=>HD_OC_CACHE.get('1-5:oasw-fleet:0').plan.ships);
 await panel.locator('[data-hd-oc-calculator]').tap();await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('20');
 await page.evaluate(()=>hdMSNOpen('1-5'));await panel.locator('[data-hd-oc-apply]').tap();
 const saved=await page.evaluate(()=>loadCustomFleets()['1-5'][0]);expect(saved.openingAswCount).toBe(2);expect(saved.ships.map(x=>x.gameShipId)).toEqual(proposed.map(x=>x.gameShipId));expect(saved.ships.every(x=>x.gear.includes('三式水中探信儀'))).toBe(true);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEOpeningAsw==='function');
 const actual=await page.evaluate(()=>{const p=hdFEPlanFromSavedFleet('1-5',loadCustomFleets()['1-5'][0]);return {ids:p.ships.map(x=>x.rosterId),states:p.ships.map(x=>hdFEOpeningAsw(x).status),calculator:hdFCLoadAll()}});
 expect(actual.ids).toEqual(saved.ships.map(x=>x.rosterId));expect(actual.states).toEqual(['ready','ready']);expect(Object.values(actual.calculator).find(x=>x.proposal).hqLevel).toBe(20);
});
test('owned alternatives select distinct matching ships near the recommended level and refuse stale data',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(async()=>{
  const all=loadCustomFleets();all['1-5'][0].ships[0]={ship:'択捉改',gear:''};saveCustomFleets(all);
  const rows=hdFERoster();rows.push({...rows[0],id:'low',gameShipId:999,level:1});localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
  const c=hdOCContext('1-5','oasw-fleet',0),result=hdOCSearch(c),before=localStorage.getItem(CUSTOM_FLEET_KEY),found=await hdOCFindAlternatives(c,result,{maxCandidates:8,maxExamined:350});
  const unchanged=before===localStorage.getItem(CUSTOM_FLEET_KEY);localStorage.setItem('harbordesk-equipment-v1','[]');let stale=false;try{await hdOCFindAlternatives(c,result)}catch(e){stale=e.code==='HD_OC_STALE'}return {found,unchanged,stale};
 });
 expect(r.found.proposal).not.toBeNull();expect(r.found.proposal.plan.ships.map(x=>x.gameShipId)).toEqual([100,101]);expect(r.found.proposal.replacements[0].level).toBe(80);expect(r.found.proposal.alternativeAssessment.registeredReady).toBe(true);expect(r.unchanged).toBe(true);expect(r.stale).toBe(true);
});
test('all registered maps expose unknown conditions and reject inventory overflow in the integrated gate',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(()=>{
  const maps=Object.keys(MAP_PLANS),coverage=maps.map(map=>hdOCReadiness({map,ships:[]},{goals:[],complete:false}).registeredReady);
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));localStorage.setItem('harbordesk-equipment-v1','[]');return {count:maps.length,coverage,overflow:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.count).toBeGreaterThanOrEqual(37);expect(r.coverage.every(x=>x===false)).toBe(true);expect(r.overflow.status).toBe('missing');expect(r.overflow.checks.find(x=>x.id==='inventory').detail).toContain('所持0');
});

test('owned alternative UI preserves chosen identities through save reload and planner reflection',async({page})=>{
 await fleet(page);await page.evaluate(()=>{const all=loadCustomFleets();all['1-5'][0].ships[0]={ship:'択捉改',gear:''};saveCustomFleets(all);hdMSNRender()});
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-missing-ships]')).toContainText('入手方法');
 await panel.locator('[data-hd-oc-alternatives]').tap();await expect(panel.locator('[data-hd-oc-replacements]')).toContainText('択捉改 → 占守改');
 expect(await page.evaluate(()=>Object.values(hdFCLoadAll()).find(x=>x.proposal).ships[0].gameShipId)).toBe(100);
 await panel.locator('[data-hd-oc-apply]').tap();expect(await page.evaluate(()=>loadCustomFleets()['1-5'][0].ships[0])).toMatchObject({ship:'占守改',rosterId:'asw-0',gameShipId:100});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCShipOwnership==='function');
 expect(await page.evaluate(()=>hdOCShipOwnership(hdFEPlanFromSavedFleet('1-5',loadCustomFleets()['1-5'][0])).every(x=>x.status==='ready'))).toBe(true);
});
