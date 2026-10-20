const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('planner read exceptions cannot overwrite existing plans or six stored keys',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/app-version.json'))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:'1.0.580',build:580})});return ['127.0.0.1','localhost'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const result=await page.evaluate(()=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  keys.forEach((k,i)=>localStorage.setItem(k,JSON.stringify(i===1||i===2?[]:i===5?blankState():{})));
  const plan={...hdFCDefaultState('2-5','saved'),gear:[{name:'零式水上観測機',star:4,slot:9}]};hdFCSaveAll({'2-5:saved':plan});
  const original=Storage.prototype.getItem,before=keys.map(k=>localStorage.getItem(k)),cases=[];
  let readOnlyFallback=false;Storage.prototype.getItem=function(key){if(key===HD_FC_KEY)throw Error('isolated listing read unavailable');return original.call(this,key)};
  try{readOnlyFallback=Object.keys(hdFCLoadAll()).length===0}finally{Storage.prototype.getItem=original}
  const actions=[()=>hdFCState('1-1','manual'),()=>hdFCSaveState('1-1','manual',{gear:[]}),()=>hdFCReset('2-5','saved')];
  for(const action of actions){
   const error=new Error('isolated planner read unavailable');let sameError=false;
   Storage.prototype.getItem=function(key){if(key===HD_FC_KEY)throw error;return original.call(this,key)};
   try{action()}catch(e){sameError=e===error}finally{Storage.prototype.getItem=original}
   cases.push({sameError,unchanged:keys.every((k,i)=>localStorage.getItem(k)===before[i])});
  }
  hdFCSaveState('1-1','new',hdFCDefaultState('1-1','new'));
  return {readOnlyFallback,nonNull:before.every(v=>v!==null),cases,originalPlan:JSON.stringify(hdFCLoadAll()['2-5:saved'])===JSON.stringify(plan),newPlan:!!hdFCLoadAll()['1-1:new'],otherKeys:keys.every((k,i)=>k===HD_FC_KEY||localStorage.getItem(k)===before[i])};
 });
 expect(result).toEqual({readOnlyFallback:true,nonNull:true,cases:[{sameError:true,unchanged:true},{sameError:true,unchanged:true},{sameError:true,unchanged:true}],originalPlan:true,newPlan:true,otherKeys:true});expect(errors).toEqual([]);
});
