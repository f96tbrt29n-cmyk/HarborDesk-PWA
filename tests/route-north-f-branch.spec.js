'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const northTest=test.extend({trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
northTest.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true});

northTest('2-5 north three fast battleships retain F-to-J through owned equipment save edit and load',async({page},info)=>{
 const evidence={scope:'2-5/index0/BFJO; synthetic synchronized input, not an attainable game-stat or victory claim',samples:[]},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{
   const u=new URL(r.request().url());
   const version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
   if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
   return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
  });
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(()=>{
   const names=['金剛改二','榛名改二','霧島改二','鈴谷改二','熊野改二','妙高改二'];
   const bb='35.6cm連装砲',ca='20.3cm連装砲',recon='零式水上観測機',radar='32号対水上電探',fighter='強風改二',drum='ドラム缶(輸送用)';
   const labels=names.map((_,i)=>i<3?[bb,bb,recon+' ★4',radar]:i<5?[ca,ca,drum,fighter]:[ca,ca,recon,radar]);
   // Base41 follows the existing independent north numeric fixture. It is a
   // synthetic synchronized input, not a claim about these ships in the game.
   const rows=names.map((name,i)=>({id:'north-f-'+i,name,masterId:hdShipDbMasterRowFor({name}).id,gameShipId:16500+i,level:99,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:labels[i],gameGearExpansion:'',gameLos:41+labels[i].reduce((n,s)=>n+(Number(hdFEFind(s.replace(/ ★\d+$/,''))?.stats?.索敵)||0),0),metadata:{keep:i}}));
   const counts=new Map();for(const row of labels)for(const label of row)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([label,count])=>{const m=label.match(/ ★(\d+)$/);return {name:label.replace(/ ★\d+$/,''),star:m?Number(m[1]):0,count}})));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'2-5':[{id:'north-f',name:'合成：高速戦艦3隻の北ルート',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['2-5'].presets[0]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:labels[i].map((s,j)=>i===0&&j===1?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('2-5',0);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['2-5'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['2-5'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  });
  await page.locator('#hdMapStrategyMap').selectOption('2-5');
  await page.locator('#hdMapStrategyRoute').selectOption('0');
  await page.locator('#hdMapStrategyFleet').selectOption('north-f');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  expect(await page.evaluate(()=>hdOCBuild(hdOCContext('2-5','north-f',0)).plan.ships[0].items.filter(x=>x.name==='35.6cm連装砲').length)).toBe(1);
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();
   await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(()=>{
    const r=HD_OC_CACHE.get('2-5:north-f:0'),route=hdFERoute(r.plan);
    return {route,search:r.search,measure:r.measure,readiness:hdOCReadiness(r.plan,r.measure),master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),speeds:r.plan.ships.map(hdFEShipSpeed),names:r.plan.ships.map(s=>s.ship),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),gear:r.plan.ships.map(s=>s.items),shortages:r.shortages.map(s=>({kind:s.goalKind||s.kind,stockGap:hdOCStockGap(s)}))};
   });
   evidence.samples.push(sample);
   expect(sample.names).toEqual(['金剛改二','榛名改二','霧島改二','鈴谷改二','熊野改二','妙高改二']);
   expect(sample.speeds.every(s=>s.known&&s.rank>=10)).toBe(true);
   expect(sample.route.status).toBe('ready');
   const f=sample.measure.requiredChecks.find(x=>x.condition.any?.some(c=>c.kind==='speedCount'));
   expect(f).toMatchObject({status:'ready',ok:true});
   expect(f.children[0].status).toBe('missing');expect(f.children[1].status).toBe('ready');
   expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
   expect(sample.measure.goals.some(g=>g.kind==='low-speed-ships')).toBe(false);
   expect(sample.shortages.some(g=>g.kind==='low-speed-ships')).toBe(false);
   expect(sample.gear[0].filter(x=>x.name==='35.6cm連装砲')).toHaveLength(2);
   expect(sample.gear.filter(items=>items.some(x=>x.name==='ドラム缶(輸送用)'))).toHaveLength(2);
   expect(sample.scouting).toMatchObject({available:true,coef:1,status:'ready'});expect(sample.scouting.score).toBeGreaterThanOrEqual(49);
   expect(sample.master.valid).toBe(true);for(const [k,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[k]||0);
   expect(sample.search.maxExamined).toBe(10000);expect(sample.search.maxDepth).toBe(24);
   // The unselected air goal remains manual; route readiness is not a claim of
   // complete preparation, optimal allocation, arrival or victory in the game.
   expect(sample.readiness.registeredReady).toBe(false);
   await panel.locator('[data-hd-required-route] summary').click();
   await expect(panel.locator('[data-hd-required-route]')).toContainText('F→J');
   await expect(panel.locator('[data-hd-required-route]')).toContainText('戦艦');
   expect(await panel.locator('[data-hd-oc-acquire="low-speed-ships"]').count()).toBe(0);
  }
  evidence.stage='first-search';await search();
  await panel.locator('[data-hd-oc-apply]').click();
  await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();
  await page.locator('#customFleetPanel [data-cf-id="north-f"] [data-cf-edit]').click();
  await page.locator('#customFleetMemo').fill('keep memo / edited');
  await page.locator('#customFleetDialog button[value="default"]').click();
  evidence.preserved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['2-5'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['2-5'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo};
  },ref);
  expect(evidence.preserved).toEqual({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:'keep memo / edited'});
  const saved=await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY));
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('2-5'));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement}),{ref,saved,doc});
  expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true});
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
