const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',isMobile:true,hasTouch:true});
async function boot(page){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
}
test('physical ordinary slots reject out-of-range and overlapping equipment',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const item={name:'33号水上電探',slotIndex:0},make=items=>hdFEMasterValidation({ships:[{ship:'島風改',items}]});
  return {valid:make([item]),outside:make([{...item,slotIndex:99}]),overlap:make([item,{name:'新型高温高圧缶',slotIndex:0}])};
 });expect(r.valid.valid).toBe(true);expect(r.outside.valid).toBe(false);expect(r.overlap.valid).toBe(false);
});
test('owned expansion unlock changes invalidate speed and compatibility on the same plan',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const row={id:'unlock',name:'島風改',gameShipId:8200,masterId:hdShipDbMasterRowFor('島風改').id,level:90,gameSlotEx:0},ship={ship:row.name,rosterId:row.id,gameShipId:row.gameShipId,masterId:row.masterId,items:[{name:'新型高温高圧缶',star:0,slotIndex:0},{name:'13号対空電探',slotIndex:1}],expansion:{name:'改良型艦本式タービン',star:0}};
  const sample=value=>{if(value===undefined)delete row.gameSlotEx;else row.gameSlotEx=value;localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([row]));return {speed:hdFEShipSpeed(ship),goal:hdFESpeedGoal(ship,20),master:hdFEMasterValidation({ships:[ship]})}};
  const states={closed:sample(0),open:sample(-1),unknown:sample(undefined),closedAgain:sample(0)};localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([{name:row.name,gameSlotEx:0}]));states.legacy=hdFEShipSpeed({...ship,rosterId:'',gameShipId:0});return states;
 });expect(r.closed.speed.rank).toBe(10);expect(r.closed.master.invalid.length).toBeGreaterThan(0);expect(r.open.speed.rank).toBe(20);expect(r.open.master.valid).toBe(true);expect(r.unknown.goal).toMatchObject({ok:false,unresolved:true});expect(r.unknown.master.unresolved.length).toBeGreaterThan(0);expect(r.closedAgain.speed.rank).toBe(10);expect(r.legacy.rank).toBe(10);
});
test('incomplete synchronized gear cannot supply a supposedly known naked scouting value',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const row={id:'unknown-los',name:'妙高改二',gameShipId:8300,masterId:hdShipDbMasterRowFor('妙高改二').id,level:80,gameLos:55,gameAswGearKnown:false,gameGearSlots:['零式水上観測機','','',''],gameSlotEx:0},ship={ship:row.name,rosterId:row.id,gameShipId:row.gameShipId,masterId:row.masterId,items:[{name:'零式水上観測機',slotIndex:0}]};
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([row]));const unknown=hdFCProposalShipLos(ship);row.gameAswGearKnown=true;localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([row]));return {unknown,known:hdFCProposalShipLos(ship)};
 });expect(r.unknown).toBeNull();expect(r.known).toBe(49);
});
async function speedFixture(page,expanded){
 await boot(page);await page.evaluate(expanded=>{
  const can='新型高温高圧缶',turbine='改良型艦本式タービン',radar='13号対空電探',sonar='三式水中探信儀',projector='三式爆雷投射機';
  const rows=Array.from({length:6},(_,i)=>({id:'joint-'+i,name:'島風改',masterId:hdShipDbMasterRowFor('島風改').id,gameShipId:8400+i,level:90,gameSlotEx:expanded?-1:0}));
  const ships=rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:[can+(i===5?' ★7':''),...(i<4?[radar,'12.7cm連装砲']:[sonar,projector]),...(i===5?[]:['[増設] '+turbine])].join(' / ')}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:90}));
  localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:can,star:0,count:5},{name:can,star:7,count:1},{name:turbine,count:6},{name:radar,count:4},{name:'33号水上電探',count:1},{name:sonar,count:2},{name:projector,count:2},{name:'12.7cm連装砲',count:4}]));
  saveCustomFleets({'3-2':[{id:'joint',name:'速度と電探と対潜',routeGoal:'fastest',openingAswCount:0,ships}]});
  hdSEChecks=()=>({rows:[{kind:'cap-asw',label:'明示対潜セット2組',minCount:2},{kind:'索敵',label:'索敵装備の推奨',minCount:5,generatedFromMap:true}],adv:{}});
  window.jointRun=()=>{const c=hdOCContext('3-2','joint',0),steps=hdOCSearchSteps(c,{maxExamined:expanded?200:50,maxDepth:6});let n;do{n=steps.next()}while(!n.done);return {c,result:n.value}};
 },expanded);
}
test('speed radar and two ASW sets use confirmed expansion within finite improved stacks through five modes',async({page})=>{
 page.on('console',message=>{if(message.text().startsWith('HD_JOINT_PHASE'))console.log(message.text())});
 // Independent slot argument: each of six HA hulls needs one boiler+turbine;
 // four radar hulls need 3 slots, two ASW hulls need 4. Six expansions suffice.
 await speedFixture(page,true);const r=await page.evaluate(()=>{
  const start=performance.now(),{result}=jointRun(),requirements=hdSEChecks('3-2').rows,check=p=>({goals:hdOCMeasure(p,requirements).goals,speeds:p.ships.map(s=>hdFEShipSpeed(s).rank),usage:hdFOAssignedUsage(p),invalid:hdFEMasterValidation(p).invalid});
  console.log('HD_JOINT_PHASE search '+(performance.now()-start));
  return {base:check(result.plan),stock:[...hdFLInventory().values()].map(x=>({key:x.key,count:x.count})),variants:Object.keys(HD_FO_MODES).map(mode=>{const t=performance.now(),p=hdFOOptimize(result.plan,mode);console.log('HD_JOINT_PHASE '+mode+' '+(performance.now()-t));return {mode,...check(p),changes:p.optimization.changes.length}}),plan:result.plan};
 });for(const p of [r.base,...r.variants]){expect(p.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:2});expect(p.goals.find(g=>g.kind==='radar-ships').ok).toBe(true);expect(p.speeds).toEqual([20,20,20,20,20,20]);expect(p.invalid).toEqual([]);for(const x of r.stock)expect(p.usage[x.key]||0,x.key).toBeLessThanOrEqual(x.count)}
 expect(r.plan.ships[5].expansion?.name).toBe('改良型艦本式タービン');expect(r.variants.some(x=>x.changes>0)).toBe(true);
});

test('owned radar expansion needs actual unlock and respects the checked improvement threshold',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const row={id:'radar-ex',name:'島風改',gameShipId:8600,masterId:hdShipDbMasterRowFor('島風改').id,gameSlotEx:0},ship={ship:row.name,gameShipId:row.gameShipId,masterId:row.masterId,items:[],expansion:{name:'13号対空電探'}};
  const sample=value=>{if(value===undefined)delete row.gameSlotEx;else row.gameSlotEx=value;localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([row]));return hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:1,max:6},hdFERouteShips({ships:[ship]}),{ships:[ship]})};
  const db=hdFEFindShip(row.name),item=hdFLCatalog().find(x=>Number(hdShipDbMasterMeta(x)?.id)===517);
  return {compatible:hdShipDbExpansionInfo(hdFEFind(ship.expansion.name),db).allowed,closed:sample(0),open:sample(-1),unknown:sample(undefined),special:!!item&&{name:item.name,normal:hdShipDbEquipCompatible(item,db),below:hdShipDbExpansionInfo(item,db,3),exact:hdShipDbExpansionInfo(item,db,4)}};
 });expect(r.compatible).toBe(true);expect(r.closed).toMatchObject({status:'missing',count:0});expect(r.open).toMatchObject({status:'ready',count:1});expect(r.unknown.status).toBe('manual');expect(r.special.normal).toBe(true);expect(r.special.below).toMatchObject({allowed:false,reqStar:4});expect(r.special.exact).toMatchObject({allowed:true,reqStar:4});
});
test('closed expansion cannot fake simultaneous speed radar and ASW success or claim proven stock shortage',async({page})=>{
 // Independent lower bound: 12 speed parts+4 radars+4 ASW parts=20>18 slots.
 await speedFixture(page,false);const r=await page.evaluate(()=>{const {c,result}=jointRun();HD_OC_CACHE.set('3-2:joint:0',result);return {complete:result.measure.complete,readiness:hdOCReadiness(result.plan,result.measure),search:result.search,expansions:result.plan.ships.map(s=>s.expansion),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory().values()].map(x=>({key:x.key,count:x.count})),html:hdOCPanel(c.map,c.fleet.id,0)}});
 expect(r.complete).toBe(false);expect(r.readiness.registeredReady).toBe(false);expect(r.search).toMatchObject({status:'incomplete',exhaustive:false});expect(r.expansions.every(x=>!x)).toBe(true);for(const x of r.stock)expect(r.usage[x.key]||0,x.key).toBeLessThanOrEqual(x.count);expect(r.html).toContain('探索未完了');expect(r.html).toContain('必要な組み合わせ');expect(r.html).toContain('タービン');
});

test('real 33 formula uses synchronized observed stats improvement coefficient HQ and saved planner consistently',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
  const names=['扶桑改二','鈴谷改二','熊野改二','妙高改二','羽黒改二','那智改二'];
  const setup=(level,base,star,hq)=>{
   const ships=names.map((ship,i)=>({ship,rosterId:'los-'+i,gameShipId:8500+i,masterId:hdShipDbMasterRowFor({name:ship}).id,gear:'零式水上観測機'+(star?' ★'+star:'')+(i===1||i===2?' / ドラム缶(輸送用)':'')}));
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(ships.map(s=>({id:s.rosterId,name:s.ship,gameShipId:s.gameShipId,masterId:s.masterId,level,gameSlotEx:0,gameLos:base+6,gameAswGearKnown:true,gameGearSlots:[...hdFEGearTokens(s.gear),...Array(4-hdFEGearTokens(s.gear).length).fill('')],gameGearExpansion:''}))));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:ships.map(s=>({gameShipId:s.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:hq}));localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'零式水上観測機',star,count:6},{name:'ドラム缶(輸送用)',count:2}]));
   saveCustomFleets({'2-5':[{id:'real-los',openingAswCount:0,routePreset:MAP_PLANS['2-5'].presets[0],ships}]});
   const c=hdOCContext('2-5','real-los',0),plan=hdFEPlanFromSavedFleet(c.map,c.fleet);return {c,plan,scouting:hdFEScouting(plan,hdFEAssigned(plan)),route:hdFERoute(plan)};
  };
  // These are dedicated API-observation fixtures. Level is not used to invent
  // a max-level naked stat; gameLos supplies the current observed value.
  const plain=setup(80,49,0,120),improved=setup(80,49,4,120),lowHQ=setup(80,49,4,100),lowLevel=setup(30,36,4,120);
  const final=setup(80,49,4,120),other={...final.plan,map:'6-2',preset:MAP_PLANS['6-2'].presets[0]},otherScore=hdFEScouting(other,hdFEAssigned(other));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:6789,ammo:1234,steel:2345,bauxite:3456},memo:'real LOS preservation'}));
  const result={plan:final.plan,measure:hdOCMeasure(final.plan,[]),signature:hdOCSignature(final.c)};const imported=hdFCImportOwnedPlan(final.c,result),state=hdFCState('2-5',hdFCSelection('2-5'));
  const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));const beforeStale=keys.map(k=>localStorage.getItem(k)),stale=hdFCImportOwnedPlan(final.c,result),afterStale=keys.map(k=>localStorage.getItem(k));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120}));
  return {plain:plain.scouting,improved:improved.scouting,lowHQ:lowHQ.scouting,lowLevel:lowLevel.scouting,lowRoute:lowLevel.route.status,other:otherScore,imported,state,calculator:hdFCLOS(state),beforeStale,afterStale,stale,saved:keys.map(k=>localStorage.getItem(k)),stats:{los:hdFEFind('零式水上観測機').stats.索敵,normal:final.plan.ships.map(s=>hdFCProposalShipLos(s))}};
 });
 // Independent 33-formula: six observed naked49, recon LOS6, recon weight1.2,
 // improvement1.2sqrt(star), coefficient1, HQ deduction ceil120*.4, six ships.
 const expected=6*Math.sqrt(49)+6*(6+1.2*Math.sqrt(4))*1.2-Math.ceil(120*.4);
 expect(r.stats).toEqual({los:6,normal:[49,49,49,49,49,49]});expect(r.plain.score).toBeCloseTo(37.2,8);expect(r.improved.score).toBeCloseTo(expected,8);expect(r.improved).toMatchObject({coef:1,hq:120,status:'ready'});expect(r.lowHQ.score).toBeCloseTo(expected+8,8);expect(r.lowLevel.score).toBeCloseTo(48.48,8);expect(r.lowRoute).not.toBe('ready');expect(r.other.coef).toBe(3);expect(r.other.score).toBeCloseTo(6*7+6*(6+1.2*2)*1.2*3-48,8);
 expect(r.imported).toBe(true);expect(r.calculator.score).toBeCloseTo(expected,8);expect(r.state).toMatchObject({hqLevel:120,branchCoef:1,shipCount:6});expect(r.stale).toBe(false);expect(r.afterStale).toEqual(r.beforeStale);expect(r.saved.every(x=>x!==null)).toBe(true);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const restored=await page.evaluate(()=>{const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'],state=hdFCState('2-5',hdFCSelection('2-5'));return {saved:keys.map(k=>localStorage.getItem(k)),score:hdFCLOS(state).score,route:hdFERoute(hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'][0])).status}});
 expect(restored.saved).toEqual(r.saved);expect(restored.score).toBeCloseTo(expected,8);expect(restored.route).toBe('ready');
});
