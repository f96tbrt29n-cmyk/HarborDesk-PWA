const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',hasTouch:true,isMobile:true});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdLBFind==='function');
}
test('land-base lookup returns the same catalogue objects for every supported aircraft',async({page})=>{
 await boot(page);const result=await page.evaluate(()=>{
  const expected=hdLBAircraft();return {count:expected.length,mismatches:expected.filter(row=>hdLBFind(row.name)!==row).map(row=>row.name),missing:hdLBFind('lookup missing aircraft fixture')};
 });expect(result.count).toBeGreaterThan(0);expect(result.mismatches).toEqual([]);expect(result.missing).toBeNull();
});
test('land-base lookup sees same-length master edits and preserves eligible duplicate precedence',async({page})=>{
 await boot(page);const result=await page.evaluate(()=>{
  const rows=HD_EQUIPMENT_CATALOG,original=rows.slice(),sample=hdLBAircraft().find(row=>rows.includes(row)),name='lookup duplicate fixture';
  try{
   const first={...sample,name},second={...sample,name};rows.unshift(first,second);
   const initial=hdLBFind(name)===first;
   first.category='unsupported category fixture';const filtered=hdLBFind(name)===second;
   first.category=sample.category;first.name='lookup renamed fixture';
   const edited=hdLBFind(first.name)===first&&hdLBFind(name)===second;
   rows.splice(0,rows.length,...original);
   const extra=HD_LB_EXTRA_AIRCRAFT[0],override={...sample,name:extra.name};
   rows.unshift(override);const precedence=hdLBFind(extra.name)===override;
   override.category='unsupported category fixture';const fallback=hdLBFind(extra.name)===hdLBAircraft().find(row=>row.name===extra.name);
   return {initial,filtered,edited,precedence,fallback};
  }finally{rows.splice(0,rows.length,...original)}
 });expect(result).toEqual({initial:true,filtered:true,edited:true,precedence:true,fallback:true});
});
test('land-base name lookups avoid rebuilding and sorting a presentation list',async({page})=>{
 await boot(page);const result=await page.evaluate(()=>{
  const names=hdLBAircraft().slice(0,12).map(row=>row.name),compare=String.prototype.localeCompare;
  let comparisons=0;String.prototype.localeCompare=function(...args){comparisons++;return Reflect.apply(compare,this,args)};
  const start=performance.now();try{
   const found=names.map(name=>hdLBFind(name)?.name);return {found,names,comparisons,elapsed:performance.now()-start};
  }finally{String.prototype.localeCompare=compare}
 });console.log('HD_LB_LOOKUP_COST '+JSON.stringify(result));expect(result.found).toEqual(result.names);expect(result.comparisons).toBe(0);
});
