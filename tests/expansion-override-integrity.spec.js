const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
test('explicit expansion-only master permissions survive strict normal compatibility and preserve required improvements',async({page})=>{
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const rows=await page.evaluate(()=>{
  const snap=window.HD_KANCOLLE_MASTER_SNAPSHOT,metas=Object.fromEntries(Object.entries(snap.equipment).map(([name,m])=>[m.id,{...m,name,category:m.typeName}])),result=[];
  for(const row of Object.values(snap.allShips))for(const [id,rule] of Object.entries(snap.exslotItemRules)){
   const applicable=(rule.shipIds||[]).includes(row.id)||(rule.stypes||[]).includes(row.stype)||(rule.stypes||[]).includes(99)||(rule.ctypes||[]).includes(row.ctype);if(!applicable)continue;
   const meta=metas[id],type=Number(snap.clientRules.pickerTypeOverrides[id]??snap.clientRules.equipTypeSpOverrides[id]??meta.typeId),normalRules=snap.shipEquipOverrides[String(row.id)]||snap.stypeEquipRules[String(row.stype)]||{},normal=Object.hasOwn(normalRules,String(type))&&(normalRules[type]===null||Array.isArray(normalRules[type])&&normalRules[type].includes(Number(id)));if(normal)continue;
   const ship=hdShipDbResolveShip({name:row.name,masterId:row.id}),star=Number(rule.reqStar)||0;
   result.push({ship:row.name,id:row.id,equipment:meta.name,reqStar:star,resolvedId:hdShipDbMasterRowFor(ship)?.id,slots:hdShipDbSlotProfile(ship)?.count,expectedSlots:row.slots.length,normal:hdShipDbMasterCompatible(meta,ship),at:hdShipDbExpansionInfo(meta,ship,star),below:star?hdShipDbExpansionInfo(meta,ship,star-1):null,strict:hdShipDbMasterExslotCheck(row,meta.name,star)});
  }
  return result;
 });await test.info().attach('all-explicit-expansion-only-permissions',{body:Buffer.from(JSON.stringify(rows,null,2)),contentType:'application/json'});
 expect(rows).toHaveLength(181);for(const row of rows){const label=row.ship+' / '+row.equipment;expect(row.resolvedId,label+' exact ID').toBe(row.id);expect(row.slots,label+' exact slots').toBe(row.expectedSlots);expect(row.normal,label).toBe(false);expect(row.strict.allowed,label+' strict').toBe(true);expect(row.at.allowed,label+' expansion').toBe(true);if(row.below)expect(row.below.allowed,label+' below required improvement').toBe(false)}
});
