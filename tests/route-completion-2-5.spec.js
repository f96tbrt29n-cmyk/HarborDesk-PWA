const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true});
async function prepare(page,{base=41}={}){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 await page.evaluate(base=>{
  const names=['扶桑改二','鈴谷改二','熊野改二','妙高改二','羽黒改二','那智改二'];
  const labels=names.map((_,i)=>i===0?['35.6cm連装砲','35.6cm連装砲','零式水上観測機 ★4','強風改二']:i<3?['20.3cm連装砲','20.3cm連装砲','ドラム缶(輸送用)','強風改二']:['20.3cm連装砲','20.3cm連装砲',i===5?'零式水上観測機':'零式水上観測機 ★4','32号対水上電探']);
  const rows=names.map((name,i)=>({id:'completion-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:9600+i,level:90,gameSlotEx:0,gameLos:base+labels[i].reduce((n,label)=>n+(Number(hdFEFind(label.replace(/ ★\d+$/,''))?.stats?.索敵)||0),0),gameGearSlots:labels[i],gameGearExpansion:'',gameAswGearKnown:true,gear:labels[i].join(' / ')}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,syncedAt:Date.now()}));
  localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,name:'専用検証艦隊',ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
  localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'35.6cm連装砲',count:2},{name:'20.3cm連装砲',count:10},{name:'ドラム缶(輸送用)',count:2},{name:'零式水上観測機',star:4,count:3},{name:'零式水上観測機',count:1},{name:'強風改二',count:3},{name:'32号対水上電探',count:3}]));
  localStorage.setItem(HD_MAP_AIR_KEY,JSON.stringify({'2-5':{nodeIds:['B','F','J','O'],goal:'superiority',orderConfirmed:true}}));
  window.completionFleet={id:'completion',name:'北全条件検証用',openingAswCount:0,routePreset:MAP_PLANS['2-5'].presets[0],ships:rows.map(r=>({ship:r.name,gameShipId:r.gameShipId,masterId:r.masterId,rosterId:r.id,gear:r.gear}))};
  saveCustomFleets({'2-5':[completionFleet]});
 },base);
}
// Independent oracle: only seven critical slots vary. Main guns, two drums,
// three large radars and six actual hulls are a fixed, validated foundation.
// No production matcher, formula, or search score is used in this enumeration.
function oracle({fighters=3,improved=3,plain=1,base=41,airTarget=42}={}){
 const capacity=[9,23,11,11,2,2,2],answers=[];
 for(let mask=0;mask<4**7;mask++){
  let value=mask,air=0,los=6*Math.sqrt(base)-48+3*10*.6,counts=[0,0,0],slots=[],valid=true;
  for(let i=0;i<7;i++){const x=value%4;value=Math.floor(value/4);slots.push(x);if(!x)continue;
   if(++counts[x-1]>[fighters,improved,plain][x-1]||x===1&&i>3){valid=false;break}
   if(x===1){air+=Math.floor(6*Math.sqrt(capacity[i]));los+=2*.6}
   else los+=(6+(x===2?1.2*Math.sqrt(4):0))*1.2;
  }
  if(valid&&air>=airTarget&&los>=49)answers.push({slots,air,los});
 }
 return answers;
}
test('north simultaneous finite air scouting speed drums restores a synchronized allocation with independent oracle',async({page})=>{
 const answers=oracle();expect(answers.length).toBeGreaterThan(0);
 await prepare(page);const r=await page.evaluate(()=>{
  const generated=hdFSGenerate('2-5',MAP_PLANS['2-5'].presets[0],0);

  const source={...completionFleet,ships:generated.slots.map(x=>{
   const row=x.profile.row,s=completionFleet.ships.find(s=>s.gameShipId===row.gameShipId),parts=hdFEGearTokens(s.gear);if(row.gameShipId===9605)parts[2]='';return {...s,gear:parts.join(' / ')};
  })};saveCustomFleets({'2-5':[source]});
  const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:1000,maxDepth:8});let n;do{n=steps.next()}while(!n.done);const result=n.value,p=result.plan,items=hdFEAssigned(p);
  return {generated:{filled:generated.filled,ids:generated.slots.map(x=>x.profile.row.gameShipId)},source,plan:p,measure:result.measure,search:result.search,scouting:hdFEScouting(p,items),air:hdFEAirCheck('2-5',hdFEAir(items),p),usage:hdFOAssignedUsage(p),stock:[...hdFLInventory()].map(([key,v])=>[key,v.count]),master:hdFEMasterValidation(p)};
 });await test.info().attach('north-generated-allocation-oracle',{body:Buffer.from(JSON.stringify({answers,...r},null,2)),contentType:'application/json'});
 expect(r.generated.filled).toBe(6);expect(new Set(r.generated.ids).size).toBe(6);expect(r.master.valid).toBe(true);expect(r.measure.requiredChecks.every(x=>x.ok)).toBe(true);expect(r.measure.complete).toBe(true);
 expect(r.scouting.score).toBeCloseTo(answers[0].los,8);expect(r.air.ours).toBeGreaterThanOrEqual(42);expect(r.search.status).toBe('targets-met');
 const stock=Object.fromEntries(r.stock);for(const [key,count] of Object.entries(r.usage))expect(count,key).toBeLessThanOrEqual(stock[key]||0);
});
test('north actual scouting boundaries and missing sync never become a guaranteed route',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const p=hdFEPlanFromSavedFleet('2-5',completionFleet),original=localStorage.getItem(SHIP_ROSTER_KEY),sample=base=>{
   const rows=JSON.parse(original);rows.forEach(row=>{row.gameLos=base+row.gameGearSlots.reduce((n,label)=>n+(Number(hdFEFind(label.replace(/ ★\d+$/,''))?.stats?.索敵)||0),0)});localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));return {base,scouting:hdFEScouting(p,hdFEAssigned(p)),required:hdOCRequiredChecks(p).find(x=>x.condition.kind==='scoutingValue')};
  };
  const rows=[26,27,40,41,49].map(sample);localStorage.setItem(SHIP_ROSTER_KEY,original);
  const sync=localStorage.getItem('harbordesk-kancolle-sync-v1');localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({}));const noHq=hdOCReadiness(p,hdOCMeasure(p,hdSEChecks('2-5').rows));localStorage.setItem('harbordesk-kancolle-sync-v1',sync);
  const incomplete=JSON.parse(original);incomplete[0].gameAswGearKnown=false;localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(incomplete));const unknown=hdOCReadiness(p,hdOCMeasure(p,hdSEChecks('2-5').rows));localStorage.setItem(SHIP_ROSTER_KEY,original);
  const south={...p,preset:MAP_PLANS['2-5'].presets[1],routeInfo:hdFSPresetInfo(MAP_PLANS['2-5'].presets[1])};
  return {rows,noHq,unknown,south:hdOCRequiredChecks(south)};
 });
 for(const x of r.rows){expect(x.scouting.score).toBeCloseTo(6*Math.sqrt(x.base)-48+3*10*.6+3*2*.6+(3*(6+1.2*Math.sqrt(4))+6)*1.2,8);expect(x.required.status).toBe(x.scouting.score>=49?'ready':'missing')}
 expect(r.rows[1].scouting.status).toBe('partial');expect(r.rows[2].scouting.score).toBeLessThan(49);expect(r.rows[3].scouting.score).toBeGreaterThan(49);
 for(const x of [r.noHq,r.unknown]){expect(x.registeredReady).toBe(false);expect(x.checks.some(c=>c.status==='manual')).toBe(true)}
 expect(r.south.find(x=>x.condition.kind==='scoutingValue').condition).toMatchObject({coef:1,min:34});expect(r.south.some(x=>x.condition.kind==='equipmentShips'&&x.condition.match==='drum')).toBe(false);
});
test('north all registered structural predicates have positive negative and boundary partitions',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const p=hdFEPlanFromSavedFleet('2-5',completionFleet),conditions=hdFERouteRequirementData(p).conditions,result=[];
  const replace=(plan,i,name)=>{plan.ships[i]={...plan.ships[i],ship:name,masterId:hdShipDbMasterRowFor(name).id}};
  const check=(condition,q,label,expected)=>result.push({label,condition,expected,...hdFEBranchPredicate(condition,hdFERouteShips(q),q)});
  const fleet=conditions.find(x=>x.kind==='fleetCount');for(const n of [0,5,6,7]){const q=hdFOClone(p);q.ships=Array.from({length:n},(_,i)=>({...q.ships[i%6]}));check(fleet,q,'fleet '+n,n===6?'ready':'missing')}
  for(const c of conditions.filter(x=>x.kind==='typeCount')){
   const name=c.types.includes('戦艦')?'扶桑改二':c.types.includes('海防艦')?'占守改':c.types.includes('水上機母艦')?'千歳甲':null;
   if(name)for(const count of new Set([0,c.max,c.max+1])){const q=hdFOClone(p);for(let i=0;i<6;i++)replace(q,i,i<count?name:'妙高改二');check(c,q,name+' '+count,count<=c.max?'ready':'missing')}
   else {check(c,p,'excluded zero','ready');for(const name of ['赤城改','大鳳改','龍驤改二','伊168改','伊401改','あきつ丸改']){const q=hdFOClone(p);replace(q,5,name);check(c,q,'excluded '+name,'missing')}}
  }
  const slow=conditions.find(x=>x.kind==='speedCount');for(const n of [0,1,6]){const q=hdFOClone(p);for(let i=0;i<6;i++)replace(q,i,i<n?'扶桑改二':'金剛改二');check(slow,q,'slow '+n,n?'ready':'missing')}
  const drum=conditions.find(x=>x.kind==='equipmentShips');for(let count=0;count<=6;count++){const q=hdFOClone(p);q.ships.forEach((s,i)=>{replace(q,i,'鈴谷改二');q.ships[i].items=i<count?[{name:'ドラム缶(輸送用)',slotIndex:0}]:[];q.ships[i].expansion=null});check(drum,q,'drum hulls '+count,count>=2?'ready':'missing')}
  return result;
 });for(const x of r)expect(x.status,x.label).toBe(x.expected);await test.info().attach('north-structural-boundary-partitions',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
});
test('north five modes protect simultaneous air scouting slow and distinct drum hulls through actual save and reload',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const c=hdOCContext('2-5','completion',0),result=hdOCSearch(c),requirements=hdSEChecks('2-5').rows;
  const inspect=p=>{const m=hdOCMeasure(p,requirements),items=hdFEAssigned(p);return {required:m.requiredChecks,goals:m.goals,los:hdFEScouting(p,items),air:hdFEAir(items),usage:hdFOAssignedUsage(p),master:hdFEMasterValidation(p),assessment:hdOCReadiness(p,m)}};
  const variants=Object.keys(HD_FO_MODES).map(mode=>({mode,plan:hdFOOptimize(result.plan,mode)}));
  HD_OC_CACHE.set('2-5:completion:0',result);const host=document.createElement('div');host.id='completion-panel';host.innerHTML=hdOCPanel('2-5','completion',0);document.body.append(host);
  const before=[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-pwa-v1'].map(k=>localStorage.getItem(k));
  return {original:inspect(result.plan),variants:variants.map(x=>({mode:x.mode,checks:inspect(x.plan)})),stock:[...hdFLInventory()].map(([key,v])=>[key,v.count]),before};
 });const stock=Object.fromEntries(r.stock);for(const p of [r.original,...r.variants.map(x=>x.checks)]){expect(p.required.every(x=>x.ok)).toBe(true);expect(p.goals.every(x=>x.ok)).toBe(true);expect(p.los.score).toBeCloseTo(49.45874542459709,8);expect(p.air.basePower).toBe(66);expect(p.master.valid).toBe(true);for(const [key,count] of Object.entries(p.usage))expect(count,key).toBeLessThanOrEqual(stock[key]||0);expect(p.assessment.registeredReady).toBe(false);expect(p.assessment.checks.find(x=>x.id==='air-route-loss').status).toBe('manual')}
 await page.locator('#completion-panel [data-hd-oc-apply]').click();
 const saved=await page.evaluate(()=>{
  const c=hdOCContext('2-5','completion',0),p=hdFEPlanFromSavedFleet('2-5',c.fleet),result={plan:p,measure:hdOCMeasure(p,hdSEChecks('2-5').rows),signature:hdOCSignature(c)},imported=hdFCImportOwnedPlan(c,result),calc=hdFCState('2-5',hdFCSelection('2-5'));
  const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
  return {keys,values:keys.map(k=>localStorage.getItem(k)),unchanged:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-pwa-v1'].map(k=>localStorage.getItem(k)),imported,calc,los:hdFCLOS(calc),air:hdFCAirPower(calc),route:hdFERoute(p)};
 });expect(saved.unchanged).toEqual(r.before);expect(saved.imported).toBe(true);expect(saved.route.status).toBe('ready');expect(saved.calc.proposal.routeRequirements.path).toBe('BFJO');expect(saved.los.score).toBeCloseTo(49.45874542459709,8);expect(saved.air).toBe(66);expect(saved.calc.proposal.assessment.status).toBe('manual');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(keys=>({values:keys.map(k=>localStorage.getItem(k)),route:hdFERoute(hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'][0]))}),saved.keys);expect(after.values).toEqual(saved.values);expect(after.route.status).toBe('ready');
});
test('north destructive swaps concentration and unlocked speed gear never bypass a fulfilled condition',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const p=hdFEPlanFromSavedFleet('2-5',completionFleet),requirements=hdSEChecks('2-5').rows,before=hdOCMeasure(p,requirements),test=(q,kind)=>({kind,regressions:hdOCGoalRegressions(before,hdOCMeasure(q,requirements)),readiness:hdOCReadiness(q,hdOCMeasure(q,requirements))});
  const drum=hdFOClone(p);drum.ships[1].items[0]={name:'ドラム缶(輸送用)',slotIndex:0};drum.ships[2].items=drum.ships[2].items.filter(x=>x.name!=='ドラム缶(輸送用)');
  const improved=hdFOClone(p);improved.ships[0].items.find(x=>x.name==='零式水上観測機').star=0;
  const speed=hdFOClone(p);speed.ships[0].items[0]={name:'新型高温高圧缶',slotIndex:0};speed.ships[0].items[1]={name:'改良型艦本式タービン',slotIndex:1};
  const air=hdFOClone(p);air.ships.forEach(s=>s.items=s.items.filter(x=>x.name!=='強風改二'));
  const hull=hdFOClone(p);hull.ships[0]={...hull.ships[0],ship:'金剛改二',masterId:hdShipDbMasterRowFor('金剛改二').id};
  const expansion=hdFOClone(p);expansion.ships[3].expansion={name:'改良型艦本式タービン'};const expansions=[0,-1,null].map(value=>{const rows=hdFERoster();rows[3].gameSlotEx=value;localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));return {value,master:hdFEMasterValidation(expansion),ready:hdOCReadiness(expansion,hdOCMeasure(expansion,requirements))}});
  return {variants:[test(drum,'drum-ships'),test(improved,'los-value'),test(speed,'low-speed-ships'),test(air,'air-value'),test(hull,'low-speed-ships')],expansions};
 });for(const x of r.variants){expect(x.regressions.some(g=>g.kind===x.kind),x.kind).toBe(true);expect(x.readiness.registeredReady).toBe(false)}expect(r.expansions[0].master.invalid.length).toBeGreaterThan(0);expect(r.expansions[1].master.valid).toBe(true);expect(r.expansions[2].master.unresolved.length).toBeGreaterThan(0);
});
for(const [kind,count] of [['drum',1],['fighter',1],['improved',0]])test(`north finite ${kind} shortage preserves honest numbers candidates and search status`,async({page})=>{
 await prepare(page);const r=await page.evaluate(({kind,count})=>{
  const rows=hdFLRows();rows.forEach(x=>{if(kind==='drum'&&x.name==='ドラム缶(輸送用)'||kind==='fighter'&&x.name==='強風改二'||kind==='improved'&&x.name==='零式水上観測機'&&x.star===4)x.count=count});localStorage.setItem(HD_FL_KEY,JSON.stringify(rows));
  const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;HD_OC_CACHE.set('2-5:completion:0',result);
  return {measure:result.measure,search:result.search,shortages:result.shortages,html:hdOCPanel('2-5','completion',0),ready:hdOCReadiness(result.plan,result.measure),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory()].map(([key,v])=>[key,v.count])};
 },{kind,count});expect(r.ready.registeredReady).toBe(false);expect(r.search.status).toBe('incomplete');expect(r.html).toContain('探索未完了');const stock=Object.fromEntries(r.stock);for(const [key,n] of Object.entries(r.usage))expect(n,key).toBeLessThanOrEqual(stock[key]||0);
 if(kind==='drum'){const g=r.shortages.find(x=>x.goalKind==='drum-ships');expect(g.minCount).toBe(2);expect(g.count).toBe(1);expect(g.candidates).toContain('ドラム缶(輸送用)');expect(r.html).toContain('装備艦があと1隻');}
 else {const g=r.shortages.find(x=>x.goalKind===(kind==='fighter'?'air-value':'los-value'));expect(g.count).toBeLessThan(g.minCount);expect(g.candidates.length).toBeGreaterThan(0);expect(r.html).toContain('あと');}
});
test('north bounded search without synchronized gear is not a proof of shortage when independent inventory enumeration has solutions',async({page})=>{
 expect(oracle().length).toBe(16);expect(oracle({fighters:1}).length).toBe(0);expect(oracle({improved:0}).length).toBe(0);
 await prepare(page);const r=await page.evaluate(()=>{
  const rows=hdFERoster();rows.forEach(row=>{row.gameAswGearKnown=false});localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
  const ships=completionFleet.ships.map((s,i)=>{const parts=hdFEGearTokens(s.gear);for(const slot of i===0?[2,3]:i<3?[3]:[2])parts[slot]='';return {...s,gear:parts.join(' / ')}});saveCustomFleets({'2-5':[{...completionFleet,ships}]});
  const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;
  return {search:result.search,measure:result.measure,status:hdOCSearchStatusHtml(result),ready:hdOCReadiness(result.plan,result.measure)};
 });expect(r.search).toMatchObject({status:'incomplete',exhaustive:false});expect(r.ready.registeredReady).toBe(false);expect(r.status).toContain('不足を証明するものではありません');
});
test('north unsupported jets never become shortage candidates or inflate allocated air power',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const jet=hdFEFind('橘花改'),otherJet=hdFEFind('Ho229');
  const compatibility=['扶桑改二','鈴谷改二','妙高改二','翔鶴改二甲'].map(name=>{const db=hdFEFindShip(name),profile=hdShipDbSlotProfile(db),slot={profile:{type:db.type,row:{name}}};return {name,type57:profile.equipRules['57']??'absent-or-null',hasType57:Object.hasOwn(profile.equipRules,'57'),quick:hdFLCompatible(jet,slot),master:hdShipDbEquipCompatible(jet,db),other:hdShipDbEquipCompatible(otherJet,db),otherType:hdShipDbPickerTypeId(otherJet),otherHasType:Object.hasOwn(profile.equipRules,'91')}});
  const permissionMatrix=['扶桑改二','鈴谷改二','妙高改二','翔鶴改二甲','時雨改二'].flatMap(name=>['橘花改','Ho229','瑞雲','三式水中探信儀','32号対水上電探','12.7cm連装砲','20.3cm連装砲','零式水上観測機','強風改二'].map(equipment=>{const item=hdFEFind(equipment),db=hdFEFindShip(name),profile=hdShipDbSlotProfile(db),type=hdShipDbPickerTypeId(item),rule=profile.equipRules[String(type)],id=hdShipDbMasterMeta(item).id;return {name,equipment,type,expected:Object.hasOwn(profile.equipRules,String(type))&&(rule===null||Array.isArray(rule)&&rule.includes(id)),quick:hdFLCompatible(item,{profile:{type:db.type,row:{name}}}),master:hdShipDbEquipCompatible(item,db)}}));
  const rows=hdFLRows();rows.forEach(x=>{if(x.name==='強風改二')x.count=0});rows.push({name:'橘花改',count:1},{name:'Ho229',count:1});localStorage.setItem(HD_FL_KEY,JSON.stringify(rows));
  const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;
  return {permissionMatrix,compatibility,assigned:hdFEAssigned(result.plan).map(x=>x.name),air:result.measure.goals.find(x=>x.kind==='air-value'),shortage:result.shortages.find(x=>x.goalKind==='air-value'),ready:hdOCReadiness(result.plan,result.measure)};
 });await test.info().attach('north-jet-master-vs-fallback',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
 for(const row of r.compatibility){const allowed=row.name==='翔鶴改二甲';expect(row.hasType57,row.name).toBe(allowed);expect(row.quick,row.name).toBe(allowed);expect(row.master,row.name).toBe(allowed);expect(row.otherType,row.name).toBe(91);expect(row.otherHasType,row.name).toBe(false);expect(row.other,row.name).toBe(false)}
 for(const row of r.permissionMatrix){expect(row.quick,row.name+' / '+row.equipment).toBe(row.expected);expect(row.master,row.name+' / '+row.equipment).toBe(row.expected)}
 expect(r.assigned).not.toContain('橘花改');expect(r.assigned).not.toContain('Ho229');expect(r.air).toMatchObject({count:0,minCount:42,ok:false});expect(r.shortage.candidates).not.toContain('橘花改');expect(r.shortage.candidates).not.toContain('Ho229');expect(r.ready.registeredReady).toBe(false);
});


test('north empty saved slots can select the complete synchronized finite loadout without guessing bonus deltas',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const generated=hdFSGenerate('2-5',MAP_PLANS['2-5'].presets[0],0),empty={...completionFleet,ships:generated.slots.map(x=>({...completionFleet.ships.find(s=>s.gameShipId===x.profile.row.gameShipId),gear:''}))};saveCustomFleets({'2-5':[empty]});
  const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;
  return {measure:result.measure,search:result.search,game:hdFEGameMatch(result.plan),scouting:hdFEScouting(result.plan,hdFEAssigned(result.plan)),air:hdFEAir(hdFEAssigned(result.plan)),master:hdFEMasterValidation(result.plan),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory()].map(([k,x])=>[k,x.count]),positions:result.plan.ships.map(s=>({ship:s.ship,items:s.items,expansion:s.expansion})),ready:hdOCReadiness(result.plan,result.measure)};
 });await test.info().attach('north-empty-source-synchronized-candidate',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
 expect(r.measure.requiredChecks.every(x=>x.ok)).toBe(true);expect(r.measure.goals.every(x=>x.ok)).toBe(true);expect(r.game.status).toBe('ready');expect(r.scouting.score).toBeCloseTo(49.4587454246,6);expect(r.air.basePower).toBe(66);expect(r.master.valid).toBe(true);expect(r.search.status).toBe('targets-met');
 const stock=Object.fromEntries(r.stock);for(const [key,n] of Object.entries(r.usage))expect(n,key).toBeLessThanOrEqual(stock[key]||0);for(const s of r.positions){expect(s.items.map(x=>x.slotIndex)).toEqual([0,1,2,3]);expect(s.expansion).toBe(null)}
 // The route-loss model review is still manual; a candidate is not a sortie guarantee.
 expect(r.ready.registeredReady).toBe(false);
});


test('north synchronized candidate rejects shortage stars missing slots unknown expansion and duplicate hulls atomically',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const originalRows=JSON.stringify(hdFERoster()),originalInventory=JSON.stringify(hdFLRows()),results=[];
  for(const kind of ['valid','opened-expansion','drum-short','wrong-stars','unknown-gear','missing-slot','closed-expansion','unknown-expansion','wrong-id','duplicate-id','duplicate-roster']){
   const rows=JSON.parse(originalRows),inventory=JSON.parse(originalInventory),fleet=JSON.parse(JSON.stringify(completionFleet));
   if(kind==='drum-short')inventory.find(x=>x.name==='ドラム缶(輸送用)').count=1;
   if(kind==='wrong-stars')inventory.find(x=>x.name==='零式水上観測機'&&x.star===4).star=0;
   if(kind==='unknown-gear')rows[0].gameAswGearKnown=false;
   if(kind==='missing-slot')delete rows[0].gameGearSlots[2];
   if(['opened-expansion','closed-expansion','unknown-expansion'].includes(kind)){rows[0].gameSlotEx=kind==='opened-expansion'?-1:kind==='closed-expansion'?0:null;rows[0].gameGearExpansion='改良型艦本式タービン';inventory.push({name:'改良型艦本式タービン',count:1});}
   if(kind==='wrong-id')fleet.ships[0].gameShipId=123456789;
   if(kind==='duplicate-id')fleet.ships[1]={...fleet.ships[0]};
   if(kind==='duplicate-roster')rows.push({...rows[0],gameLos:999});
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));
   const before=JSON.stringify([localStorage.getItem(SHIP_ROSTER_KEY),localStorage.getItem(HD_FL_KEY)]),built=hdOCBuild({map:'2-5',fleet,index:0,preset:fleet.routePreset}),planBefore=JSON.stringify(built.plan),seed=hdOCSynchronizedSeed(built.plan,built.inventory,built.slots);
   results.push({kind,accepted:!!seed,unchanged:planBefore===JSON.stringify(built.plan)&&before===JSON.stringify([localStorage.getItem(SHIP_ROSTER_KEY),localStorage.getItem(HD_FL_KEY)])});
  }
  return results;
 });for(const x of r){expect(x.accepted,x.kind).toBe(['valid','opened-expansion'].includes(x.kind));expect(x.unchanged,x.kind).toBe(true)}
});

test('north actual 33 formula evaluates below exactly on and above 49 with finite star-specific inventory',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const source=hdFERoster();
  // Arithmetic boundary fixture, not a claim that these are the user's observed stats.
  source[0].gameGearSlots[2]='零式水上観測機 ★9';source[3].gameGearSlots[2]='零式水上観測機 ★9';source[5].gameGearSlots[2]='零式水上観測機 ★4';source[5].gameGearSlots[3]='33号対水上電探';
  localStorage.setItem(HD_FL_KEY,JSON.stringify(hdFLRows().filter(x=>!['零式水上観測機','32号対水上電探'].includes(x.name)).concat([{name:'零式水上観測機',star:9,count:2},{name:'零式水上観測機',star:4,count:2},{name:'32号対水上電探',count:2},{name:'33号対水上電探',count:1}])));
  const results=[];
  for(const first of [24,25,26]){
   const bare=[first,25,36,36,36,36],rows=source.map((x,i)=>({...x,gameLos:bare[i]+x.gameGearSlots.reduce((n,label)=>n+(Number(hdFEFind(hdFEParseGearLabel(label).name)?.stats?.索敵)||0),0)}));localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   const fleet={...completionFleet,ships:completionFleet.ships.map(s=>({...s,gear:''}))},built=hdOCBuild({map:'2-5',fleet,index:0,preset:fleet.routePreset}),plan=hdOCSynchronizedSeed(built.plan,built.inventory,built.slots),items=hdFEAssigned(plan),check=hdOCRequiredChecks(plan).find(x=>x.condition.kind==='scoutingValue'),scouting=hdFEScouting(plan,items);
   results.push({first,check,scouting,air:hdFEAir(items),master:hdFEMasterValidation(plan),usage:hdFOAssignedUsage(plan),stock:[...hdFLInventory()].map(([key,x])=>[key,x.count])});
  }return results;
 });for(const [i,x] of r.entries()){const expected=Math.sqrt(x.first)+5+6*4+63-48;expect(x.scouting.score).toBeCloseTo(expected,10);expect(x.check.condition).toMatchObject({min:49,coef:1});expect(x.check.status).toBe(i===0?'missing':'ready');expect(x.air.basePower).toBe(66);expect(x.master.valid).toBe(true);const stock=Object.fromEntries(x.stock);for(const [k,n] of Object.entries(x.usage))expect(n,k).toBeLessThanOrEqual(stock[k]||0)}expect(r[1].scouting.score).toBe(49);
});

test('north synchronized candidate cannot replace fulfilled low speed with synchronized acceleration gear',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const rows=hdFERoster();rows[0].gameGearSlots[0]='新型高温高圧缶';rows[0].gameGearSlots[1]='改良型艦本式タービン';localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(hdFLRows().concat([{name:'新型高温高圧缶',count:1},{name:'改良型艦本式タービン',count:1}])));
  const c=hdOCContext('2-5','completion',0),built=hdOCBuild(c),before=hdOCMeasure(built.plan,[]),seed=hdOCSynchronizedSeed(built.plan,built.inventory,built.slots),after=hdOCMeasure(seed,[]),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;
  return {seed:!!seed,regressions:hdOCGoalRegressions(before,after),required:result.measure.requiredChecks,ready:hdOCReadiness(result.plan,result.measure)};
 });expect(r.seed).toBe(true);expect(r.regressions.some(x=>x.kind==='low-speed-ships'||x.condition?.kind==='speedCount')).toBe(true);expect(r.required.find(x=>x.condition.kind==='speedCount').status).toBe('ready');expect(r.ready.registeredReady).toBe(false);
});

test('north new candidate keeps five modes save reload planner and refuses unverified scouting bonus changes',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const empty={...completionFleet,ships:completionFleet.ships.map(s=>({...s,gear:''}))};saveCustomFleets({'2-5':[empty]});const c=hdOCContext('2-5','completion',0),steps=hdOCSearchSteps(c,{maxExamined:50,maxDepth:1});let n;do{n=steps.next()}while(!n.done);const result=n.value;
  const variants=Object.keys(HD_FO_MODES).map(mode=>{const p=hdFOOptimize(result.plan,mode),m=hdOCMeasure(p,[]);return {mode,checks:m.requiredChecks,stock:hdOCReadiness(p,m).checks.find(x=>x.id==='inventory'),master:hdFEMasterValidation(p)}});
  const imported=hdFCImportOwnedPlan(c,result),calc=hdFCState('2-5',hdFCSelection('2-5')),saved={...empty,ships:result.plan.ships.map(s=>({...empty.ships.find(x=>x.gameShipId===s.gameShipId),gear:hdOCShipGear(s)}))};saveCustomFleets({'2-5':[saved]});
  const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:12345},memo:'north dedicated test only'}));
  const changed=hdFOClone(result.plan);changed.ships[0].items.find(x=>x.name==='零式水上観測機').star=0;const changedCheck=hdOCRequiredChecks(changed).find(x=>x.condition.kind==='scoutingValue');
  return {variants,imported,calc,changedCheck,keys,values:keys.map(k=>localStorage.getItem(k)),ids:result.plan.ships.map(s=>s.gameShipId)};
 });expect(r.variants).toHaveLength(5);for(const x of r.variants){expect(x.checks.every(c=>c.ok),x.mode).toBe(true);expect(x.stock.status,x.mode).toBe('ready');expect(x.master.valid,x.mode).toBe(true)}expect(r.imported).toBe(true);expect(r.changedCheck.status).toBe('manual');expect(r.changedCheck.detail).toContain('ボーナス');expect(new Set(r.ids).size).toBe(6);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCContext==='function');expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),r.keys)).toEqual(r.values);
 const restored=await page.evaluate(()=>{const c=hdOCContext('2-5','completion',0),p=hdFEPlanFromSavedFleet('2-5',c.fleet);return {checks:hdOCRequiredChecks(p),calc:hdFCState('2-5',hdFCSelection('2-5')),ids:p.ships.map(s=>s.gameShipId)}});expect(restored.checks.every(c=>c.ok)).toBe(true);expect(restored.calc).toEqual(r.calc);expect(restored.ids).toEqual(r.ids);
});
