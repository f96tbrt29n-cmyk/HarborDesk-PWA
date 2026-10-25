const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',hasTouch:true,isMobile:true});
async function prepare(page,map,index,names,gear=[]){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCRequiredChecks==='function');
 await page.evaluate(({map,index,names,gear})=>{
  const rows=names.map((name,i)=>({id:'boundary-'+i,name,gameShipId:8500+i,masterId:hdShipDbMasterRowFor({name}).id,level:99,gameSlotEx:0,gameLos:100,gameGearSlots:gear,gameGearExpansion:'',gameAswGearKnown:true}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120}));
  localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
  const fleet={id:'boundary',openingAswCount:0,routePreset:{...MAP_PLANS[map].presets[index]},ships:rows.map(r=>({ship:r.name,rosterId:r.id,gameShipId:r.gameShipId,masterId:r.masterId,gear:gear.join(' / ')}))};
  window.boundaryPlan=hdFEPlanFromSavedFleet(map,fleet);boundaryPlan.openingAswCount=0;
 },{map,index,names,gear});
}
test('5-3 conditional speed accepts either one slow battleship or two fast battleships without ANDing both branches',async({page})=>{
 await prepare(page,'5-3',0,['長門改二','妙高改二','矢矧改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{
  const status=p=>hdOCRequiredChecks(p).find(x=>x.condition.any)?.status;
  const one=hdFOClone(boundaryPlan),twoFast=hdFOClone(one);twoFast.ships[0].ship='金剛改二';twoFast.ships[0].masterId=hdShipDbMasterRowFor({name:'金剛改二'}).id;twoFast.ships[1].ship='榛名改二';twoFast.ships[1].masterId=hdShipDbMasterRowFor({name:'榛名改二'}).id;
  const mixed=hdFOClone(twoFast);mixed.ships[0].ship=one.ships[0].ship;mixed.ships[0].masterId=one.ships[0].masterId;
  return {one:status(one),fast:status(twoFast),mixed:status(mixed),lost:hdOCGoalRegressions(hdOCMeasure(one,[]),hdOCMeasure(mixed,[])).filter(x=>x.mandatory).length};
 });expect(r).toEqual({one:'ready',fast:'ready',mixed:'missing',lost:1});
});
test('4-5 fast-plus route and coefficient2 scouting71 route never inherit each other requirements',async({page})=>{
 await prepare(page,'4-5',0,['金剛改二','榛名改二','鈴谷改二','熊野改二','矢矧改二','時雨改二'],['改良型艦本式タービン','新型高温高圧缶']);
 const r=await page.evaluate(()=>{
  const a=hdOCRequiredChecks(boundaryPlan),long=hdFOClone(boundaryPlan);long.preset={...MAP_PLANS['4-5'].presets[1]};long.routeInfo=hdFSPresetInfo(long.preset);long.sourceFleet.routePreset=long.preset;
  const b=hdOCRequiredChecks(long);return {shortSpeed:a.find(x=>x.condition.kind==='minSpeed'),shortLos:a.some(x=>x.condition.kind==='scoutingValue'),longSpeed:b.some(x=>x.condition.kind==='minSpeed'),longLos:b.find(x=>x.condition.kind==='scoutingValue')?.condition};
 });expect(r.shortSpeed).toMatchObject({status:'ready',condition:{rank:15}});expect(r.shortLos).toBe(false);expect(r.longSpeed).toBe(false);expect(r.longLos).toMatchObject({coef:2,min:71});
});
test('6-4 light cruiser flagship remains independently protected when the route still has other unmet goals',async({page})=>{
 await prepare(page,'6-4',0,['矢矧改二','金剛改二','鈴谷改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{const p=boundaryPlan,q=hdFOClone(p);[q.ships[0],q.ships[1]]=[q.ships[1],q.ships[0]];return {before:hdOCRequiredChecks(p).find(x=>x.condition.kind==='flagshipType').status,after:hdOCRequiredChecks(q).find(x=>x.condition.kind==='flagshipType').status,lost:hdOCGoalRegressions(hdOCMeasure(p,[]),hdOCMeasure(q,[])).filter(x=>x.condition?.kind==='flagshipType').length};});
 expect(r).toEqual({before:'ready',after:'missing',lost:1});
});
test('7-3 second route checks each historical hull and rejects replacing only Ashigara',async({page})=>{
 await prepare(page,'7-3',1,['羽黒改二','足柄改二','神風改','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{const p=boundaryPlan,q=hdFOClone(p);q.ships[1].ship='妙高改二';q.ships[1].masterId=hdShipDbMasterRowFor({name:'妙高改二'}).id;return {before:hdOCRequiredChecks(p).filter(x=>x.condition.kind==='namedCount').map(x=>x.status),lost:hdOCGoalRegressions(hdOCMeasure(p,[]),hdOCMeasure(q,[])).filter(x=>x.condition?.kind==='namedCount').length};});
 expect(r.before.length).toBeGreaterThan(0);expect(r.before.every(x=>x==='ready')).toBe(true);expect(r.lost).toBeGreaterThan(0);
});
// Registered safe thresholds are route-specific. Scores below these targets
// do not prove that random or partially documented routes are unreachable.
for(const [map,index,coef,min] of [
 ['2-5',1,1,34],['4-5',1,2,71],['7-2',1,4,69],['7-5',2,4,63],
 ['3-5',0,4,28],['3-5',1,4,40],['5-5',0,2,80],['5-5',1,2,66],
 ['6-1',0,4,25],['6-2',0,3,50],['6-3',0,3,38],['6-5',0,3,50],['6-5',1,3,35]
])test(`${map} example${index+1} exact numeric route boundary uses coefficient${coef} threshold${min}`,async({page})=>{
 await prepare(page,map,index,['矢矧改二','鈴谷改二','熊野改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(({coef,min})=>{
  const p=boundaryPlan,condition=hdOCRequiredChecks(p).find(x=>x.condition.kind==='scoutingValue').condition,ships=hdFERouteShips(p);
  // Isolate threshold/unknown/coef comparison from the separately tested 33-formula.
  // These are numeric-layer fixtures, not claims of attainable ship stats or full route readiness.
  const scouting=hdFEScouting,match=hdFEGameMatch;let sample={available:true,coef,score:min};
  hdFEGameMatch=()=>({status:'ready'});hdFEScouting=()=>sample;
  const check=()=>hdFEBranchPredicate(condition,ships,p);
  try{const exact=check();sample={...sample,score:min-.01};const below=check();sample={...sample,score:min+.01};const above=check();sample={...sample,coef:coef===4?1:4};const wrongCoef=check();sample={available:false,coef,score:null};const unknown=check();return {condition,exact,below,above,wrongCoef,unknown};}finally{hdFEScouting=scouting;hdFEGameMatch=match;}
 },{coef,min});
 expect(r.condition).toMatchObject({coef,min});expect(r.exact.status).toBe('ready');expect(r.below.status).toBe('missing');expect(r.below.detail).toContain('あと');expect(r.above.status).toBe('ready');expect(r.wrongCoef.status).toBe('manual');expect(r.unknown.status).toBe('manual');
});
test('small finite sonar inventory has an independent exhaustive oracle and bounded search never proves shortage',async({page})=>{
 await prepare(page,'1-2',0,['時雨改二','夕立改二','綾波改二','島風改']);
 const r=await page.evaluate(()=>{
  // Four known three-slot destroyers, one compatible item kind, target two items.
  // Exhaust all 2^12 assignments independently of search candidates/scoring.
  const oracle=stock=>{for(let mask=0;mask<(1<<12);mask++){let used=0;for(let i=0;i<12;i++)used+=(mask>>i)&1;if(used<=stock&&used>=2)return true}return false};
  // Occupy all twelve slots: otherwise the ordinary-slot fill legitimately
  // completes this tiny fixture even after the bounded search stops.
  const guns=Array(3).fill('12.7cm連装砲');boundaryPlan.sourceFleet.ships.forEach(s=>s.gear=guns.join(' / '));
  const roster=hdFERoster();roster.forEach(s=>s.gameGearSlots=guns);localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(roster));
  hdSEChecks=()=>({rows:[{kind:'対潜',label:'有限在庫の装備数fixture',minCount:2}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const run=(stock,depth)=>{
   localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'三式水中探信儀',count:stock},{name:'12.7cm連装砲',count:12}]));const c={map:'1-2',index:0,preset:MAP_PLANS['1-2'].presets[0],fleet:boundaryPlan.sourceFleet};
   const steps=hdOCSearchSteps(c,{maxExamined:200,maxDepth:depth});let next;do{next=steps.next()}while(!next.done);const out=next.value;
   return {oracle:oracle(stock),goal:out.measure.goals.find(g=>g.kind==='対潜'),search:out.search,usage:hdFOAssignedUsage(out.plan),html:hdOCSearchStatusHtml(out)};
  };
  return {enough:run(2,2),short:run(1,2),bounded:run(2,1)};
 });
 expect(r.enough.oracle).toBe(true);expect(r.enough.goal.ok).toBe(true);expect(r.enough.goal.count).toBe(2);
 expect(r.short.oracle).toBe(false);expect(r.short.goal.ok).toBe(false);expect(r.short.goal.count).toBeLessThanOrEqual(1);
 expect(r.bounded.oracle).toBe(true);expect(r.bounded.goal.ok).toBe(false);expect(r.bounded.search).toMatchObject({status:'incomplete',exhaustive:false});expect(r.bounded.html).toContain('不足を証明するものではありません');
});
