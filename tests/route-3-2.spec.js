const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEGraphRoute==='function')}
test('3-2 distinguishes normal random H, fast-plus random E/G, and fixed CEFL',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const fleet=(goal,radars,boost=false)=>({map:'3-2',routeGoal:goal,ships:Array.from({length:6},(_,i)=>({ship:'島風改',items:[...(boost?[{name:'改良型艦本式タービン',slotIndex:0},{name:'新型高温高圧缶',slotIndex:1}]:[]),...(i<radars?[{name:'13号対空電探',slotIndex:2}]:[])]}))});
  const normal=hdFEBranchRoute(fleet('normal',1)),plus=hdFEBranchRoute(fleet('fastPlus',1,true)),fixed=hdFEBranchRoute(fleet('fastest',4,true)),short=hdFEBranchRoute(fleet('fastest',3,true));
  const low={map:'3-2',ships:['夕張改二特','夕立改二','時雨改二','綾波改二','雪風改','島風改'].map(ship=>({ship,items:[]}))};
  return {normal,plus,fixed,short,low:hdFEBranchRoute(low),five:hdFEBranchRoute({...low,ships:low.ships.slice(0,5)}),unknown:hdFEBranchRoute({...low,ships:[{ship:'未登録艦',items:[]},...low.ships.slice(1)]}),unknownGoal:hdFEBranchRoute({...low,routeGoal:'future'}),invalidGoal:hdFEBranchRoute({...low,routeGoal:false})};
 });
 expect(r.normal).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.normal.graph.hasRandom).toBe(true);
 expect(r.plus).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.plus.graph.paths.map(p=>p.slice(1).join('')).sort()).toEqual(['CEFL','CGFL']);
 expect(r.fixed).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:true});expect(r.fixed.graph.paths[0].slice(1).join('')).toBe('CEFL');
 expect(r.short).toMatchObject({status:'missing',arrivalGuaranteed:false,fixedPath:false});expect(r.low.status).toBe('ready');expect(r.five.status).toBe('missing');expect(r.unknown.status).toBe('manual');expect(r.unknownGoal.status).toBe('manual');expect(r.unknownGoal.detail).toContain('未登録');expect(r.invalidGoal.status).toBe('manual');
});
test('radars count separate ships and valid slots without a guessed LOS threshold',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const plan={map:'3-2',routeGoal:'fastest',ships:Array.from({length:6},()=>({ship:'島風改',items:[{name:'改良型艦本式タービン',slotIndex:0},{name:'新型高温高圧缶',slotIndex:1}]}))};
  plan.ships[0].items=[{name:'13号対空電探',slotIndex:0},{name:'13号対空電探',slotIndex:1},{name:'13号対空電探',slotIndex:2},{name:'13号対空電探',slotIndex:99}];
  const count=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:4,max:6},hdFERouteShips(plan),plan);plan.ships[0].items=[{name:'13号対空電探',slotIndex:99}];
  const invalid=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:1,max:6},hdFERouteShips(plan),plan),missingNumeric=hdFEBranchPredicate({kind:'scoutingValue',min:10},hdFERouteShips(plan),plan);
  plan.ships[0].items=[{name:'13号対空電探',slotIndex:0},{name:'強化型艦本式缶',slotIndex:0}];const overlapping=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:1,max:6},hdFERouteShips(plan),plan);
  return {count,invalid,overlapping,missingNumeric,notRequired:MAP_PLANS['3-2'].routeBranches.notRequired};
 });expect(r.count).toMatchObject({count:1,status:'missing'});expect(r.invalid).toMatchObject({count:0,status:'missing'});expect(r.overlapping).toMatchObject({count:0,status:'missing'});expect(r.missingNumeric.status).toBe('manual');expect(r.notRequired.scouting).toContain('数値索敵');
});
test('ordered random supply routes that can reach D never guarantee the boss',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const plan={map:'3-2',routeGoal:'normal',ships:['速吸改','阿武隈改二','夕立改二','時雨改二','綾波改二','島風改'].map((ship,i)=>({ship,items:i===0?[{name:'改良型艦本式タービン',slotIndex:0},{name:'強化型艦本式缶',slotIndex:1}]:i===1?[{name:'13号対空電探',slotIndex:0}]:[]}))};
  return hdFEBranchRoute(plan);
 });expect(r.status).toBe('missing');expect(r.arrivalGuaranteed).toBe(false);expect(r.graph.paths.some(p=>p.at(-1)==='D')).toBe(true);expect(r.graph.hasRandom).toBe(true);
});
test('unregistered graph edges and equipment facts stay manual',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const plan={map:'3-2',routeGoal:'normal',ships:Array.from({length:6},()=>({ship:'島風改',items:[]}))},ships=hdFERouteShips(plan);
  const malformed=hdFEGraphRoute({graph:{nodes:{}},checks:[]},ships,plan,null),unknown=hdFEGraphRoute({graph:{start:'start',target:'L',nodes:{start:[{condition:{kind:'always'},to:['pending'],state:'verified'}]}},sources:[]},ships,plan,null);
  plan.ships[0].items=[{name:'未登録の装備',slotIndex:0}];const speed=hdFEBranchPredicate({kind:'minSpeed',rank:10},hdFERouteShips(plan),plan);
  const unsupported=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:0,max:6,minLos:5},ships,plan),slots=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:0,max:6,slotPolicy:'future'},ships,plan);
  const wrongFields=hdFEBranchPredicate({kind:'minSpeed',rank:10,max:20},ships,plan);
  const air=hdFEBranchPredicate({kind:'airValue',min:0},ships,plan);
  return {malformed,unknown,speed,unsupported,slots,wrongFields,air};
 });expect(r.malformed.status).toBe('manual');expect(r.unknown).toMatchObject({status:'manual',arrivalGuaranteed:false,fixedPath:false});expect(r.speed.status).toBe('manual');expect(r.unsupported.status).toBe('manual');expect(r.slots.status).toBe('manual');expect(r.wrongFields.status).toBe('manual');expect(r.air.status).toBe('manual');
});
test('insufficient owned radar ships report a numeric deficit and mode changes invalidate proposals',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const rows=Array.from({length:6},(_,i)=>({id:'radar-'+i,name:'島風改',masterId:hdShipDbMasterRowFor('島風改').id,gameShipId:950+i,level:90}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'13号対空電探',count:1}]));
  saveCustomFleets({'3-2':[{id:'radar',name:'電探不足',routeGoal:'fastest',openingAswCount:0,ships:rows.map(x=>({ship:x.name,masterId:x.masterId,gameShipId:x.gameShipId,rosterId:x.id,gear:''}))}]});hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const c=hdOCContext('3-2','radar',1),result=hdOCSearch(c),before=hdFCImportOwnedPlan(c,result);localStorage.setItem(HD_OC_ROUTE_GOAL_KEY,JSON.stringify({'3-2:radar':'normal'}));
  return {goal:result.measure.goals.find(x=>x.kind==='radar-ships'),shortage:result.shortages.find(x=>x.goalKind==='radar-ships'),readiness:hdOCReadiness(result.plan,result.measure),before,stale:hdFCImportOwnedPlan(c,result)};
 });expect(r.goal).toMatchObject({count:1,minCount:4,ok:false});expect(r.goal.detail).toContain('あと3隻');expect(r.shortage.routeEquipment).toBe(true);expect(r.readiness.registeredReady).toBe(false);expect(r.before).toBe(true);expect(r.stale).toBe(false);
});
test('owned fastest search respects stacks and persists goal reasons identity gear and planner',async({page})=>{
 test.setTimeout(120000);await boot(page);await page.evaluate(()=>{
  const rows=Array.from({length:6},(_,i)=>({id:'3-2-'+i,name:'島風改',masterId:hdShipDbMasterRowFor('島風改').id,gameShipId:900+i,level:90,gameSlotEx:0}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:6,star:0},{name:'新型高温高圧缶',count:6,star:0},{name:'13号対空電探',count:4,star:0}]));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));
  saveCustomFleets({'3-2':[{id:'fastest',name:'CEFL探索',routeGoal:'fastest',openingAswCount:0,ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:''}))}]});hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];hdMSNOpen('3-2');
 });
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await expect(panel.locator('[data-hd-oc-route-goal]')).toHaveValue('fastest');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-apply]')).toBeVisible({timeout:90000});
 const r=await page.evaluate(()=>{const p=HD_OC_CACHE.get('3-2:fastest:0');return {plan:p.plan,branch:hdFEBranchRoute(p.plan),usage:hdFOAssignedUsage(p.plan),stock:[...hdFLInventory().values()],state:hdFCState('3-2',hdFCSelection('3-2'))}});
 expect(r.branch).toMatchObject({status:'ready',fixedPath:true});expect(new Set(r.plan.ships.map(x=>x.gameShipId)).size).toBe(6);for(const x of r.stock)expect(r.usage[x.key]||0).toBeLessThanOrEqual(x.count);expect(r.state.hqLevel).toBe(75);
 await panel.locator('[data-hd-oc-apply]').tap();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(()=>{const f=loadCustomFleets()['3-2'][0],p=hdFEPlanFromSavedFleet('3-2',f);return {fleet:f,branch:hdFEBranchRoute(p),state:hdFCState('3-2',hdFCSelection('3-2'))}});
 expect(after.fleet.routeGoal).toBe('fastest');expect(after.fleet.routeAssessment.branch.fixedPath).toBe(true);expect(after.branch.fixedPath).toBe(true);expect(after.fleet.ships.map(x=>x.gameShipId)).toEqual(r.plan.ships.map(x=>x.gameShipId));expect(after.state.gear).toEqual(r.state.gear);
});
test('automatic fleets prioritize achievable speed and import an assessment without a supplied measure',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const names=['夕張改二特','矢矧改二','島風改','夕立改二','時雨改二','綾波改二','雪風改'];
  const rows=names.map((name,i)=>({id:'automatic-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:1000+i,level:90}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1','[]');localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));
  localStorage.setItem(HD_OC_ROUTE_GOAL_KEY,JSON.stringify({'3-2:auto:3-2:0':'fastest'}));hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
  hdSelectGuideMap('3-2');const suggestion=hdFSGenerate('3-2',MAP_PLANS['3-2'].presets[0],0),plan=hdFLGenerate(0),c=hdFLContext(plan),accepted=hdFCImportOwnedPlan(c,{plan,signature:hdOCSignature(c)}),saved=hdFLSave(0);
  return {suggestion,plan,accepted,state:hdFCState('3-2',hdFCSelection('3-2')),saved};
 });
 expect(r.suggestion.slots.find(x=>x.required==='軽巡').profile.row.name).toBe('矢矧改二');expect(r.plan.routeGoal).toBe('fastest');expect(r.accepted).toBe(true);expect(r.state.proposal.routeGoal).toBe('fastest');expect(r.state.proposal.routeAssessment.arrivalGuaranteed).toBe(false);expect(r.saved.routeGoal).toBe('fastest');expect(r.saved.routeAssessment.status).toBe('missing');
});
test('automatic fleet route selector regenerates and transfers unmet conditions to the calculator',async({page})=>{
 await boot(page);await page.evaluate(()=>{
  const names=['夕張改二特','矢矧改二','島風改','夕立改二','時雨改二','綾波改二','雪風改'];
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(names.map((name,i)=>({id:'ui-auto-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:1100+i,level:90}))));
  localStorage.setItem('harbordesk-equipment-v1','[]');localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:75}));hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];hdSelectGuideMap('3-2');hdFSOpen();
 });
 const card=page.locator('.hd-fs-card').filter({has:page.locator('[data-hd-fl-generate="0"]')});await card.locator('[data-hd-fl-generate]').tap();
 const select=card.locator('[data-hd-oc-route-goal]');await expect(select).toHaveValue('normal');await select.selectOption('fastest');await expect(select).toHaveValue('fastest');
 await expect.poll(()=>page.evaluate(()=>!!HD_FL_CACHE['3-2:0']&&!HD_FL_CACHE['3-2:0'].searching)).toBe(true);
 expect(await page.evaluate(()=>HD_FL_CACHE['3-2:0'].assessment.measure.goals.find(x=>x.kind==='radar-ships').minCount)).toBe(4);
 await card.locator('[data-hd-fl-calculator]').tap();await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('75');
 const p=await page.evaluate(()=>hdFCState('3-2',hdFCSelection('3-2')).proposal);expect(p.routeGoal).toBe('fastest');expect(p.routeAssessment.arrivalGuaranteed).toBe(false);expect(p.assessment.status).not.toBe('ready');
});
