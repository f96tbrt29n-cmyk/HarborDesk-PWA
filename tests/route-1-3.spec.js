const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEBranchGoal==='function')}

test('1-3 low speed carriers and confirmed one-carrier alternatives fix CFJ without boilers',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const dd=['夕立改二','時雨改二','綾波改二','島風改'];
  const plan=names=>({map:'1-3',routeGoal:'cfj',ships:names.map(ship=>({ship,items:[]}))});
  const a=plan(['飛鷹改','隼鷹改',...dd]),b=plan(['飛鷹改','夕張改二特',...dd]);
  return {a:hdFERoute(a),b:hdFERoute(b),speed:hdFERouteShips(a)[0].speedInfo.rank,maps:Object.keys(MAP_PLANS).length,examples:Object.values(MAP_PLANS).reduce((n,x)=>n+x.presets.length,0)};
 });for(const x of [r.a,r.b]){expect(x.status).toBe('ready');expect(x.branch).toMatchObject({arrivalGuaranteed:true,fixedPath:true,requiredSpeed:0,requiredRadar:0});expect(x.branch.graph.paths[0].slice(1).join('')).toBe('CFJ');expect(x.branch.sources).toHaveLength(2)}expect(r.speed).toBeLessThan(10);expect(r.maps).toBe(37);expect(r.examples).toBe(53);
});
test('1-3 without carriers proves the registered boss branches but never a fixed CFJ path',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const plan={map:'1-3',routeGoal:'normal',ships:['夕張改二特','阿武隈改二','夕立改二','時雨改二','綾波改二','島風改'].map(ship=>({ship,items:[]}))};
  return {normal:hdFEBranchRoute(plan),fixed:hdFEBranchRoute({...plan,routeGoal:'cfj'})};
 });expect(r.normal).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.normal.graph.hasRandom).toBe(true);expect(r.normal.graph.paths.map(p=>p.slice(1).join('')).sort()).toEqual(['ADBEFJ','AEFJ','CFJ']);expect(r.fixed).toMatchObject({status:'missing',arrivalGuaranteed:false,fixedPath:false});expect(r.fixed.detail).toContain('あと1隻');
});
test('1-3 scope gaps and unregistered reserved goal keys never prove arrival',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const names=['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','島風改'],plan={map:'1-3',ships:names.map(ship=>({ship,items:[]}))};
  return {five:hdFEBranchRoute({...plan,ships:plan.ships.slice(1)}),outside:['赤城改','伊勢改','千歳甲'].map(ship=>hdFEBranchRoute({...plan,ships:[{ship,items:[]},...plan.ships.slice(1)]})),unknown:hdFEBranchRoute({...plan,ships:[{ship:'不明艦',items:[]},...plan.ships.slice(1)]}),goals:['constructor','__proto__','toString','future',false].flatMap(routeGoal=>['1-3','3-2'].map(map=>hdFEBranchRoute({...plan,map,routeGoal,ships:map==='3-2'?['夕立改二','時雨改二','綾波改二','雪風改','島風改','天津風改二'].map(ship=>({ship,items:[]})):plan.ships})))};
 });expect(r.five.arrivalGuaranteed).toBe(false);for(const x of r.outside)expect(x.arrivalGuaranteed).toBe(false);expect(r.unknown.status).toBe('manual');for(const x of r.goals)expect(x).toMatchObject({status:'manual',arrivalGuaranteed:false,fixedPath:false});
});
test('1-3 owned search save reload and planner preserve all six storage families',async({page})=>{
 await boot(page);await page.evaluate(()=>{
  const names=['飛鷹改','夕張改二特','夕立改二','時雨改二','綾波改二','島風改'],rows=names.map((name,i)=>({id:'flow-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:1300+i,level:90,gameSlotEx:0}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1','[]');localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));
  saveCustomFleets({'1-3':[{id:'flow',name:'CFJ保存',routeGoal:'cfj',openingAswCount:0,ships:rows.map(x=>({ship:x.name,gameShipId:x.gameShipId,masterId:x.masterId,rosterId:x.id,gear:''}))}],'1-5':[{id:'other',name:'別編成',ships:[{ship:'占守改',masterId:hdShipDbMasterRowFor('占守改').id,gear:'三式水中探信儀'}]}]});
  const state=hdFCDefaultState('1-5','other');state.hqLevel=75;hdFCSaveState('1-5','other',state);hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];hdMSNOpen('1-3');
 });
 const before=await page.evaluate(()=>({raw:Object.fromEntries(['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)])),otherFleet:loadCustomFleets()['1-5'],otherPlanner:hdFCLoadAll()['1-5:other']}));
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-apply]')).toBeVisible();
 const proposed=await page.evaluate(()=>({plan:HD_OC_CACHE.get('1-3:flow:0').plan,state:hdFCState('1-3',hdFCSelection('1-3'))}));expect(proposed.state.hqLevel).toBe(75);expect(proposed.state.proposal.routeAssessment.fixedPath).toBe(true);
 await panel.locator('[data-hd-oc-apply]').tap();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(keys=>{const fleet=loadCustomFleets()['1-3'][0];return {fleet,route:hdFEBranchRoute(hdFEPlanFromSavedFleet('1-3',fleet)),state:hdFCState('1-3',hdFCSelection('1-3')),raw:Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),otherFleet:loadCustomFleets()['1-5'],otherPlanner:hdFCLoadAll()['1-5:other']}},Object.keys(before.raw));
 for(const key of Object.keys(before))expect(after[key],key).toEqual(before[key]);expect(after.fleet.routeGoal).toBe('cfj');expect(after.fleet.routeAssessment.branch.fixedPath).toBe(true);expect(after.route.fixedPath).toBe(true);expect(after.fleet.ships.map(x=>x.gameShipId)).toEqual(proposed.plan.ships.map(x=>x.gameShipId));expect(after.state).toEqual(proposed.state);
});
test('1-3 owned alternatives recheck CFJ and cannot replace its last carrier with a cruiser',async({page})=>{
 await boot(page);const r=await page.evaluate(async()=>{
  const names=['飛鷹改','夕張改二特','阿武隈改二','夕立改二','時雨改二','綾波改二','島風改'],rows=names.map((name,i)=>({id:'alt-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:1400+i,level:i===1||i===2?20:90,gameSlotEx:0}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1','[]');
  const source={id:'alt',name:'軽空母不足',routeGoal:'cfj',openingAswCount:0,ships:[{ship:'飛鷹改',gameShipId:1400,masterId:rows[0].masterId,rosterId:rows[0].id,gear:''},{ship:'隼鷹改',gear:''},...rows.slice(3).map(x=>({ship:x.name,gameShipId:x.gameShipId,masterId:x.masterId,rosterId:x.id,gear:''}))]};
  saveCustomFleets({'1-3':[source]});hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const c=hdOCContext('1-3','alt',0),initial=hdOCSearch(c),found=await hdOCFindAlternatives(c,initial,{maxCandidates:40,maxExamined:200});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows.slice(1)));const changed=hdOCContext('1-3','alt',0),missing=await hdOCFindAlternatives(changed,hdOCSearch(changed),{maxCandidates:40,maxExamined:200});
  return {found,missing};
 });expect(r.found.proposal).not.toBeNull();const p=r.found.proposal.plan;expect(new Set(p.ships.map(x=>x.gameShipId)).size).toBe(6);expect(p.ships.filter(x=>x.ship==='飛鷹改')).toHaveLength(1);expect(r.found.proposal.alternativeAssessment.complete).toBe(false);expect(r.missing.proposal).toBeNull();
});
test('an unregistered saved goal stays visible and manual until explicitly replaced',async({page})=>{
 await boot(page);await page.evaluate(()=>{
  const names=['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','島風改'];saveCustomFleets({'1-3':[{id:'unknown',name:'未登録目標',routeGoal:'constructor',openingAswCount:0,ships:names.map(ship=>({ship,gear:''}))}]});hdMSNOpen('1-3');
 });const select=page.locator('#mapStrategyNavigator [data-hd-oc-route-goal]');await expect(select).toHaveValue('constructor');await expect(select.locator('option:checked')).toContainText('未登録');expect(await page.evaluate(()=>hdFERoute(hdOCBuild(hdOCContext('1-3','unknown',0)).plan).status)).toBe('manual');await select.selectOption('normal');await expect(select).toHaveValue('normal');expect(await page.evaluate(()=>hdFERoute(hdOCBuild(hdOCContext('1-3','unknown',0)).plan).status)).toBe('ready');
});
test('reserved unknown predicate and ship-type names return manual without throwing',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const plan={map:'1-3',ships:['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','島風改'].map(ship=>({ship,items:[]}))},ships=hdFERouteShips(plan);
  return ['constructor','__proto__','toString'].flatMap(name=>[hdFEBranchPredicate({kind:name},ships,plan),hdFEBranchPredicate({kind:'typeCount',types:[name],min:0,max:6},ships,plan)]);
 });for(const x of r)expect(x.status).toBe('manual');
});
