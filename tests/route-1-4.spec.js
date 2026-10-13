const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEBranchGoal==='function')}
test('1-4 four destroyers guarantee registered boss paths but never a single fixed route',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{const p={map:'1-4',ships:['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','島風改'].map(ship=>({ship,items:[]}))};return {normal:hdFERoute(p),avoid:hdFEBranchRoute({...p,routeGoal:'j-avoid'}),maps:Object.keys(MAP_PLANS).length,examples:Object.values(MAP_PLANS).reduce((n,x)=>n+x.presets.length,0)}});
 expect(r.normal.status).toBe('ready');expect(r.normal.branch).toMatchObject({arrivalGuaranteed:true,fixedPath:false,requiredSpeed:0,requiredRadar:0});expect(r.normal.branch.graph.paths.map(p=>p.slice(1).join('')).sort()).toEqual(['ADEHL','ADGJL','BCFEHL']);expect(r.avoid.arrivalGuaranteed).toBe(false);expect(r.avoid.detail).toContain('潜水母艦');expect(r.maps).toBe(37);expect(r.examples).toBe(53);
});
test('1-4 escort destroyers are not interchangeable with coastal defense ships at J',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{const p={map:'1-4',ships:['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','占守改'].map(ship=>({ship,items:[]}))};return hdFEBranchRoute(p)});
 expect(r).toMatchObject({status:'missing',arrivalGuaranteed:false,fixedPath:false});expect(r.graph.paths.some(p=>p.at(-1)==='K')).toBe(true);
});
test('1-4 submarine tender takes precedence over seaplane tender and avoids J on both starts',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>hdFEBranchRoute({map:'1-4',routeGoal:'j-avoid',ships:['大鯨','千歳甲','夕立改二','時雨改二','綾波改二','占守改'].map(ship=>({ship,items:[]}))}));
 expect(r).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.graph.paths.map(p=>p.slice(1).join('')).sort()).toEqual(['ADEHL','BCFEHL']);expect(r.graph.trace.find(x=>x.from==='D').to).toEqual(['E']);
});
test('1-4 carrier priority and random boss deviation cannot be described as boss fixed',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>hdFEBranchRoute({map:'1-4',ships:['飛鷹改','隼鷹改','赤城改','夕立改二','時雨改二','綾波改二'].map(ship=>({ship,items:[]}))}));
 expect(r.arrivalGuaranteed).toBe(false);expect(r.graph.trace.find(x=>x.from==='B').to).toEqual(['D']);expect(r.graph.paths.some(p=>p.at(-1)==='K')).toBe(true);
});
test('1-4 seaplane tender with light cruiser and two escorts fixes J to boss but initial paths stay random',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>hdFEBranchRoute({map:'1-4',ships:['飛鷹改','隼鷹改','千歳甲','夕張改二特','夕立改二','占守改'].map(ship=>({ship,items:[]}))}));
 expect(r).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.graph.trace.find(x=>x.from==='J').to).toEqual(['L']);expect(r.graph.paths.length).toBeGreaterThan(1);
});
test('1-4 disputed supply rule unknown hulls scope gaps and unknown goals stay unproven',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{const names=['飛鷹改','隼鷹改','夕張改二特','速吸改','夕立改二','時雨改二'],p={map:'1-4',ships:names.map(ship=>({ship,items:[]}))};return {disputed:hdFEBranchRoute(p),unknown:hdFEBranchRoute({...p,ships:[{ship:'不明艦',items:[]},...p.ships.slice(1)]}),outside:hdFEBranchRoute({...p,ships:[{ship:'伊勢改',items:[]},...p.ships.slice(1)]}),five:hdFEBranchRoute({...p,ships:p.ships.slice(1)}),goal:hdFEBranchRoute({...p,routeGoal:'constructor'})}});
 expect(r.disputed.status).toBe('manual');expect(r.disputed.graph.trace.some(x=>x.state==='disputed')).toBe(true);for(const x of Object.values(r))expect(x.arrivalGuaranteed).toBe(false);expect(r.unknown.status).toBe('manual');expect(r.goal.status).toBe('manual');
});
test('1-4 route readiness does not satisfy a missing air equipment objective',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{const p={map:'1-4',ships:['飛鷹改','隼鷹改','夕立改二','時雨改二','綾波改二','島風改'].map(ship=>({ship,items:[]}))};return {route:hdFEBranchRoute(p),air:hdOCMeasure(p,[]).goals.find(x=>x.kind==='air-value')}});
 expect(r.route.arrivalGuaranteed).toBe(true);expect(r.air).toMatchObject({count:0,ok:false});expect(r.air.minCount).toBeGreaterThan(0);
});
test('1-4 owned alternatives obtain a tender and preserve selected goal in saved fleet and planner',async({page})=>{
 test.setTimeout(120000);await boot(page);await page.evaluate(()=>{
  const names=['飛鷹改','大鯨','夕立改二','時雨改二','綾波改二','島風改'],rows=names.map((name,i)=>({id:'r14-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:1500+i,level:90,gameSlotEx:0}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,'[]');localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));state.resources={fuel:'12345',ammo:'23456',steel:'34567',bauxite:'45678',savedAt:1700000000000};save();
  const ships=rows.map(x=>({ship:x.name,masterId:x.masterId,gameShipId:x.gameShipId,rosterId:x.id,gear:''}));ships[1]={ship:'隼鷹改',gear:''};saveCustomFleets({'1-4':[{id:'r14',name:'J回避保存',routeGoal:'j-avoid',openingAswCount:0,ships}],'1-5':[{id:'keep',name:'維持する編成',ships:[{ship:'占守改',masterId:hdShipDbMasterRowFor('占守改').id,gear:'三式水中探信儀'}]}]});const other=hdFCDefaultState('1-5','keep');other.hqLevel=80;hdFCSaveState('1-5','keep',other);hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
 });
 const before=await page.evaluate(()=>({raw:Object.fromEntries([SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)])),otherFleet:loadCustomFleets()['1-5'],otherPlanner:hdFCLoadAll()['1-5:keep']}));
 const result=await page.evaluate(async()=>{const c=hdOCContext('1-4','r14',0),found=await hdOCFindAlternatives(c,hdOCSearch(c),{maxCandidates:40,maxExamined:200});if(!found.proposal)throw Error('No tender alternative');const p=found.proposal;const imported=hdFCImportOwnedPlan(c,p);HD_OC_CACHE.set('1-4:r14:0',p);hdMSNOpen('1-4');return {imported,ships:p.plan.ships,branch:hdFEBranchRoute(p.plan),state:hdFCState('1-4',hdFCSelection('1-4'))}});
 expect(result.imported).not.toBe(false);expect(result.branch).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false,goal:'j-avoid'});expect(result.ships.some(x=>x.ship==='大鯨')).toBe(true);expect(new Set(result.ships.map(x=>x.gameShipId)).size).toBe(6);expect(result.state.hqLevel).toBe(75);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await expect(panel.locator('[data-hd-oc-apply]')).toBeVisible();await panel.locator('[data-hd-oc-apply]').tap();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');const after=await page.evaluate(keys=>({fleet:loadCustomFleets()['1-4'][0],state:hdFCState('1-4',hdFCSelection('1-4')),raw:Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),otherFleet:loadCustomFleets()['1-5'],otherPlanner:hdFCLoadAll()['1-5:keep']}),Object.keys(before.raw));
 for(const key of Object.keys(before))expect(after[key],key).toEqual(before[key]);expect(after.fleet.routeGoal).toBe('j-avoid');expect(after.fleet.routeAssessment.branch.arrivalGuaranteed).toBe(true);expect(after.fleet.ships.map(x=>x.gameShipId)).toEqual(result.ships.map(x=>x.gameShipId));expect(after.state.gear).toEqual(result.state.gear);expect(after.state.proposal.routeAssessment.goal).toBe('j-avoid');
});
