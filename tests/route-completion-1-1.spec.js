const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true});
async function prepare(page){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 await page.evaluate(()=>{
  const names=['時雨改二','夕立改二','綾波改二','島風改','雪風改','吹雪改二'];
  const gear=['12.7cm連装砲','12.7cm連装砲',''];
  const rows=names.map((name,i)=>({id:'complete11-'+i,name,gameShipId:9700+i,masterId:hdShipDbMasterRowFor(name).id,level:80,gameSlotEx:0,gear:gear.join(' / '),gameGearSlots:gear,gameGearExpansion:'',gameAswGearKnown:true}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,syncedAt:Date.now()}));
  localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
  localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'12.7cm連装砲',count:12},{name:'12.7cm連装砲',star:6,count:1}]));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:4567,ammo:5678,steel:6789,bauxite:7890},memo:'registered 1-1 verification only'}));
  hdFCSaveAll({'1-1:manual':{...hdFCDefaultState('1-1','manual'),memo:'preserve'}});
  window.complete11={id:'complete11',name:'1-1登録条件検証',openingAswCount:0,routePreset:MAP_PLANS['1-1'].presets[0],ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:r.gear}))};
  saveCustomFleets({'1-1':[complete11]});
  window.completeKeys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
 });
}
test('registered 1-1 logical domain covers every fleet-count boundary and never guarantees the random boss branch',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const data=hdMapPresetRequirements('1-1',MAP_PLANS['1-1'].presets[0]);
  const sample=count=>{const p=hdFEPlanFromSavedFleet('1-1',{...complete11,ships:Array.from({length:count},(_,i)=>({...complete11.ships[i%6]}))});return {count,contract:hdFERouteContract(p),scouting:hdFEScouting(p,hdFEAssigned(p)),required:hdOCRequiredChecks(p)}};
  const rows=Array.from({length:8},(_,i)=>sample(i)),unknown=hdFEPlanFromSavedFleet('1-1',{...complete11,ships:[{ship:'未登録の艦娘'}]});
  return {data,rows,unknown:hdFERouteContract(unknown)};
 });expect(r.data.conditions).toEqual([{kind:'fleetCount',min:1,max:6}]);expect(r.data.los.kind).toBe('none');expect(r.data.equipmentTargets||[]).toEqual([]);expect(r.data.routing).toBe('random');
 for(const x of r.rows){expect(x.contract.status,x.count+' ships').toBe(x.count>=1&&x.count<=6?'ready':'missing');expect(x.required[0].ok).toBe(x.count>=1&&x.count<=6);expect(x.contract.detail).toContain('ボス到達は未保証');expect(x.scouting.notRequired).toBe(true)}
 expect(r.unknown.status).toBe('manual');
 await test.info().attach('1-1-registered-domain',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
});
test('registered 1-1 auto generation finite stock five modes ship and gear exchange save sync planner preserve the complete contract',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const s=hdFSGenerate('1-1',MAP_PLANS['1-1'].presets[0],0),source={...complete11,ships:s.slots.map(x=>{const row=x.profile.row;return {ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,rosterId:row.id,gear:row.gear}})};
  saveCustomFleets({'1-1':[source]});const c=hdOCContext('1-1','complete11',0),result=hdOCSearch(c),requirements=hdSEChecks('1-1').rows;
  const inspect=p=>{const m=hdOCMeasure(p,requirements);return {checks:m.requiredChecks,complete:m.complete,ready:hdOCReadiness(p,m),master:hdFEMasterValidation(p),usage:hdFOAssignedUsage(p)}};
  const variants=Object.keys(HD_FO_MODES).map(mode=>({mode,result:inspect(hdFOOptimize(result.plan,mode))}));
  const exchange=hdFOClone(result.plan);[exchange.ships[0],exchange.ships[1]]=[exchange.ships[1],exchange.ships[0]];
  const gear=hdFOClone(exchange),donor=gear.ships.flatMap(s=>s.items).find(x=>x.star===6),target=gear.ships[0].items[0];[donor.star,target.star]=[target.star,donor.star];
  const saved={...source,ships:gear.ships.map(x=>({ship:x.ship,masterId:x.masterId,gameShipId:x.gameShipId,rosterId:x.rosterId,gear:hdOCShipGear(x)}))};saveCustomFleets({'1-1':[saved]});
  const next=hdOCContext('1-1','complete11',0),restored=hdFEPlanFromSavedFleet('1-1',next.fleet),proposal={plan:restored,measure:hdOCMeasure(restored,requirements),signature:hdOCSignature(next)};
  const imported=hdFCImportOwnedPlan(next,proposal),calc=hdFCState('1-1',hdFCSelection('1-1'));
  const rows=hdFERoster();rows.forEach(row=>{const ship=restored.ships.find(s=>s.gameShipId===row.gameShipId);if(ship){row.gear=hdOCShipGear(ship);row.gameGearSlots=Array.from({length:3},(_,i)=>{const item=ship.items.find(x=>x.slotIndex===i);return item?item.name+(item.star?' ★'+item.star:''):''});}});localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
  return {generated:s.slots.map(x=>x.profile.row.id),initial:inspect(result.plan),variants,exchanged:inspect(exchange),gear:inspect(gear),restored:inspect(restored),imported,calc,stock:[...hdFLInventory()].map(([key,v])=>[key,v.count]),saved:completeKeys.map(k=>localStorage.getItem(k)),keys:completeKeys};
 });await test.info().attach('1-1-complete-operation-sequence',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});expect(r.generated.length).toBeGreaterThan(0);expect(new Set(r.generated).size).toBe(r.generated.length);expect(r.imported).toBe(true);
 const stock=Object.fromEntries(r.stock);for(const x of [r.initial,...r.variants.map(x=>x.result),r.exchanged,r.gear,r.restored]){expect(x.checks.every(c=>c.ok)).toBe(true);expect(x.complete).toBe(true);expect(x.ready.registeredReady).toBe(true);expect(x.master.valid).toBe(true);for(const [key,count] of Object.entries(x.usage))expect(count,key).toBeLessThanOrEqual(stock[key]||0)}
 expect(r.saved.every(x=>x!==null)).toBe(true);expect(r.calc.proposal.routeRequirements.path).toBe('AC');expect(r.calc.proposal.assessment.status).toBe('ready');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(keys=>({saved:keys.map(k=>localStorage.getItem(k)),route:hdFERoute(hdFEPlanFromSavedFleet('1-1',loadCustomFleets()['1-1'][0])).status}),r.keys);expect(after.saved).toEqual(r.saved);expect(after.route).toBe('ready');
});
test('registered 1-1 unavailable stock duplicated individual and invalid slots remain failures even with a ready route',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const source=hdFEPlanFromSavedFleet('1-1',complete11),requirements=hdSEChecks('1-1').rows,check=p=>hdOCReadiness(p,hdOCMeasure(p,requirements));
  const duplicate=hdFOClone(source);duplicate.ships[1]={...duplicate.ships[0]};
  const overlap=hdFOClone(source);overlap.ships[0].items[1].slotIndex=0;
  const outside=hdFOClone(source);outside.ships[0].items[0].slotIndex=99;
  const unavailable=hdFOClone(source);unavailable.ships[0].items[0].star=6;unavailable.ships[1].items[0].star=6;
  return {duplicate:check(duplicate),overlap:check(overlap),outside:check(outside),unavailable:check(unavailable)};
 });for(const x of Object.values(r)){expect(x.registeredReady).toBe(false);expect(x.status).toBe('missing')}
 expect(r.duplicate.checks.some(x=>x.id==='owned-ships-missing')).toBe(true);expect(r.unavailable.checks.find(x=>x.id==='inventory').detail).toContain('必要2 / 所持1');
});
test('finite inventory never trusts a stale cached stack key after improvement or equipment edits',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const c=hdOCContext('1-1','complete11',0),p=hdOCSearch(c).plan;
  const item=p.ships.flatMap(s=>s.items).find(x=>x.star===0);item.star=6;
  const improved={usage:hdFOAssignedUsage(p),readiness:hdOCReadiness(p,hdOCMeasure(p,hdSEChecks('1-1').rows))};
  item.name='三式水中探信儀';item.star=0;
  return {improved,renamed:{usage:hdFOAssignedUsage(p),readiness:hdOCReadiness(p,hdOCMeasure(p,hdSEChecks('1-1').rows))}};
 });expect(r.improved.usage['12.7cm連装砲@@6']).toBe(2);expect(r.improved.readiness.registeredReady).toBe(false);expect(r.improved.readiness.checks.find(x=>x.id==='inventory').status).toBe('missing');expect(r.renamed.usage['三式水中探信儀@@0']).toBe(1);expect(r.renamed.readiness.registeredReady).toBe(false);
});
test('registered 1-1 finite ordinary-slot quantity classes match an independent improvement inventory oracle',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const p=hdFEPlanFromSavedFleet('1-1',complete11),samples=[];
  // Six identical three-slot DD profiles; identical guns are interchangeable
  // within each improvement stack. Enumerating all (plain, improved) totals
  // covers every quantity class of the 3^18 empty/plain/improved assignments.
  for(let plain=0;plain<=18;plain++)for(let improved=0;improved<=18-plain;improved++){
   const q=hdFOClone(p);q.ships.forEach((s,i)=>{s.items=[];for(let slot=0;slot<3;slot++){const n=i*3+slot;if(n<plain+improved)s.items.push({name:'12.7cm連装砲',star:n<plain?0:6,slotIndex:slot})}});
   const assessment=hdOCReadiness(q,hdOCMeasure(q,[]));samples.push({plain,improved,expected:plain<=12&&improved<=1,actual:assessment.registeredReady,inventory:assessment.checks.find(x=>x.id==='inventory').status});
  }
  return samples;
 });expect(r).toHaveLength(190);for(const x of r){expect(x.actual,JSON.stringify(x)).toBe(x.expected);expect(x.inventory).toBe(x.expected?'ready':'missing')}
 await test.info().attach('1-1-190-finite-quantity-classes',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
});
