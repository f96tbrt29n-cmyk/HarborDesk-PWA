const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEBranchRoute==='function');
}
test('1-2 AE branches accept confirmed alternatives but reject extra destroyers and six ships',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const dd=['夕立改二','時雨改二','綾波改二','雪風改'];
  const plan=names=>({map:'1-2',routeInfo:hdFSPresetInfo(MAP_PLANS['1-2'].presets[0]),ships:names.map(ship=>({ship,items:[]}))});
  return {low:hdFERoute(plan(['夕張改二特',...dd])),fast:hdFERoute(plan(['最上改',...dd])),four:hdFERoute(plan(dd)),five:hdFERoute(plan([...dd,'島風改'])),six:hdFERoute(plan(['夕張改二特',...dd,'島風改'])),quest:hdFERoute({...plan(['最上改',...dd]),routeInfo:hdFSPresetInfo({ships:'軽巡1＋駆逐4',flagship:'軽巡'})})};
 });
 for(const key of ['low','fast','four'])expect(r[key].status,key).toBe('ready');
 for(const key of ['five','six','quest'])expect(r[key].status,key).toBe('missing');
 expect(r.five.branch.checks[0].detail).toContain('1隻超過');expect(r.six.detail).toContain('固定条件に不足');expect(r.fast.branch.sources).toHaveLength(2);
});
test('unknown facts and disputed low-speed escort variants never prove AE routing',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const dd=['夕立改二','時雨改二','綾波改二'];
  const plan=names=>({map:'1-2',ships:names.map(ship=>({ship,items:[]}))});
  const mixed=hdFERoute(plan(['夕張改二特','占守改',...dd])),unknown=hdFERoute(plan(['未登録艦',...dd,'雪風改']));
  const predicates=[null,{all:[]},{any:[]},{kind:'future-rule'},{kind:'fleetCount',min:0},{kind:'typeCount',types:['未知'],min:0,max:5}].map(c=>hdFEBranchPredicate(c,hdFERouteShips(plan(dd))));
  return {mixed,unknown,predicates,other:hdFEBranchRoute({map:'7-5',ships:[]})};
 });
 expect(r.mixed.status).toBe('manual');expect(r.mixed.detail).toContain('資料の記述が一致しない');expect(r.unknown.status).toBe('manual');expect(r.predicates.every(x=>x.status==='manual')).toBe(true);expect(r.other).toMatchObject({available:false,status:'manual'});
});
test('owned search satisfies AE speed on the actual slow ship without duplicating inventory',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const names=['隼鷹改二','夕立改二','時雨改二','綾波改二','雪風改'];
  const ships=names.map((name,i)=>({id:'branch-'+i,name,gameShipId:500+i,masterId:hdShipDbMasterRowFor(name).id,level:90}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(ships));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:1},{name:'強化型艦本式缶',count:1}]));
  saveCustomFleets({'1-2':[{id:'branch-fleet',name:'AE配備',openingAswCount:0,ships:ships.map(x=>({ship:x.name,gameShipId:x.gameShipId,masterId:x.masterId,rosterId:x.id,gear:''}))}]});
  hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const c=hdOCContext('1-2','branch-fleet',0),result=hdOCSearch(c),goal=result.measure.goals.find(x=>x.kind==='route-branches');
  hdFCImportOwnedPlan(c,result);const state=hdFCState('1-2',hdFCSelection('1-2')),before=localStorage.getItem(HD_FC_KEY);
  MAP_PLANS['1-2'].routeBranches.checkedAt='changed';const stale=hdFCImportOwnedPlan(c,result);
  return {goal,target:hdFEPlanSpeedTarget(result.plan),speed:hdFEShipSpeed(result.plan.ships[0]),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory().values()],plan:result.plan,state,stale,unchanged:before===localStorage.getItem(HD_FC_KEY)};
 });
 expect(r.goal.ok).toBe(true);expect(r.target).toBe(10);expect(r.speed.rank).toBeGreaterThanOrEqual(10);
 for(const x of r.stock)expect(r.usage[x.key]||0).toBeLessThanOrEqual(x.count);
 expect(r.plan.ships[0].items.filter(x=>x.name).map(x=>x.name).sort()).toEqual(['強化型艦本式缶','改良型艦本式タービン'].sort());
 expect(r.state.hqLevel).toBe(75);expect(r.state.ships[0].gameShipId).toBe(500);expect(r.state.proposal.assessment).toBeDefined();expect(r.stale).toBe(false);expect(r.unchanged).toBe(true);
});
test('unmet branch goals remain incomplete and planner retains their reasons after reload',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const names=['隼鷹改二','夕立改二','時雨改二','綾波改二','雪風改'];
  // Complete master IDs avoid the separate legacy-ID migration changing the proposal.
  saveCustomFleets({'1-2':[{id:'shortage',name:'装備不足',openingAswCount:0,ships:names.map(ship=>({ship,masterId:hdShipDbMasterRowFor(ship).id,gear:''}))}]});
  localStorage.setItem('harbordesk-equipment-v1','[]');hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const c=hdOCContext('1-2','shortage',0),result=hdOCSearch(c);hdFCImportOwnedPlan(c,result);
  return {measure:result.measure,readiness:hdOCReadiness(result.plan,result.measure),state:hdFCState('1-2',hdFCSelection('1-2'))};
 });
 expect(r.measure.complete).toBe(false);expect(r.measure.goals.find(x=>x.kind==='route-branches').ok).toBe(false);expect(r.readiness.registeredReady).toBe(false);expect(r.state.proposal.assessment.checks.find(x=>x.id==='route').detail).toContain('隼鷹改二');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const persisted=await page.evaluate(()=>{const s=hdFCState('1-2',hdFCSelection('1-2'));return {assessment:s.proposal.assessment,html:hdFCProposalHtml(s)}});
 expect(persisted.assessment).toEqual(r.state.proposal.assessment);expect(persisted.html).toContain('固定条件に不足');expect(persisted.html).toContain('攻略可能とは判定しません');
});
test('AE search save reload and planner preserve individual IDs slots and unrelated data',async({page})=>{
 await boot(page);await page.evaluate(()=>{
  const rows=['隼鷹改二','夕立改二','時雨改二','綾波改二','雪風改'].map((name,i)=>({id:'save-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:600+i,level:90}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:1,star:0},{name:'強化型艦本式缶',count:1,star:2}]));
  saveCustomFleets({'1-2':[{id:'save-route',name:'AE保存',openingAswCount:0,ships:rows.map(x=>({ship:x.name,gameShipId:x.gameShipId,masterId:x.masterId,rosterId:x.id,gear:''}))}],'1-1':[{id:'untouched',name:'別編成',ships:[{ship:'睦月改',masterId:hdShipDbMasterRowFor('睦月改').id,gear:'12cm単装砲'}]}]});
  hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];hdMSNOpen('1-2');
 });
 const before=await page.evaluate(()=>({ledger:localStorage.getItem('harbordesk-equipment-v1'),roster:localStorage.getItem('harbordesk-ship-roster-v1'),resources:localStorage.getItem('harbordesk-pwa-v1'),other:loadCustomFleets()['1-1']}));
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-apply]')).toBeVisible();
 const proposed=await page.evaluate(()=>({plan:HD_OC_CACHE.get('1-2:save-route:0').plan,state:hdFCState('1-2',hdFCSelection('1-2'))}));
 expect(proposed.plan.ships[0].items.filter(x=>x.name)).toHaveLength(2);
 await panel.locator('[data-hd-oc-apply]').tap();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(()=>{const fleet=loadCustomFleets()['1-2'][0];return {fleet,plan:hdFEPlanFromSavedFleet('1-2',fleet),state:hdFCState('1-2',hdFCSelection('1-2')),ledger:localStorage.getItem('harbordesk-equipment-v1'),roster:localStorage.getItem('harbordesk-ship-roster-v1'),resources:localStorage.getItem('harbordesk-pwa-v1'),other:loadCustomFleets()['1-1']}});
 for(const key of Object.keys(before))expect(after[key],key).toEqual(before[key]);
 expect(after.fleet.ships.map(x=>x.rosterId)).toEqual(proposed.plan.ships.map(x=>x.rosterId));expect(after.plan.ships[0].items).toEqual(proposed.plan.ships[0].items.map(({stackKey,...item})=>item));expect(after.state).toEqual(proposed.state);
 expect(after.state.hqLevel).toBe(75);expect(after.state.proposal.assessment.checks.some(x=>x.id==='route')).toBe(false);
});
test('AE alternatives repair five destroyers using a distinct owned light cruiser',async({page})=>{
 await boot(page);const r=await page.evaluate(async()=>{
  const names=['夕立改二','時雨改二','綾波改二','雪風改','島風改'];
  const roster=['夕張改二特',...names].map((name,i)=>({id:'alt-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:700+i,level:90}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster));localStorage.setItem('harbordesk-equipment-v1','[]');
  saveCustomFleets({'1-2':[{id:'alternative',name:'駆逐5隻',openingAswCount:0,ships:roster.slice(1).map(x=>({ship:x.name,masterId:x.masterId,gameShipId:x.gameShipId,rosterId:x.id,gear:''}))}]});
  hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const c=hdOCContext('1-2','alternative',0),result=hdOCSearch(c),before=localStorage.getItem(CUSTOM_FLEET_KEY),found=await hdOCFindAlternatives(c,result,{maxCandidates:40});
  return {initial:hdFERoute(result.plan),found,unchanged:before===localStorage.getItem(CUSTOM_FLEET_KEY)};
 });
 expect(r.initial.status).toBe('missing');expect(r.found.proposal).not.toBeNull();const p=r.found.proposal;
 expect(p.plan.ships.some(x=>x.ship==='夕張改二特')).toBe(true);expect(new Set(p.plan.ships.map(x=>x.gameShipId)).size).toBe(5);expect(p.alternativeAssessment.registeredReady).toBe(true);expect(p.alternativeAssessment.complete).toBe(false);expect(r.unchanged).toBe(true);
});
