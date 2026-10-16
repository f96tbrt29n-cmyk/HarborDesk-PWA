const fs=require('node:fs/promises');
const path=require('node:path');

// Installed only by the prerequisite-import test. Keep records in the runner,
// so navigation, a closed page, or the next retry cannot overwrite a first failure.
async function strategyImportDiagnostics(page,info){
 const records=[];let failure=null;
 const id=require('node:crypto').createHash('sha256').update(info.testId).digest('hex').slice(0,16);
 const archiveFile=path.resolve('test-results/strategy-import-diagnostics',`${info.project.name}-${id}-${info.workerIndex}-${info.retry}.json`);
 await page.exposeBinding('__hdImportDiagnosticEmit',(_,entry)=>records.push(entry));
 await page.addInitScript(()=>{
  const selector='[data-hd-strategy-import-all="6-5"]',ids=new WeakMap();let serial=0,tracked=null,pressing=false;
  const pending=new Set();
  const node=el=>{
   if(!el||el.nodeType!==1)return el===window?'window':el===document?'document':null;
   if(!ids.has(el))ids.set(el,++serial);
   const r=el.getBoundingClientRect(),css=getComputedStyle(el);
   return {node:ids.get(el),tag:el.tagName,id:el.id,className:el.getAttribute('class'),data:{...el.dataset},connected:el.isConnected,disabled:!!el.disabled,pointerEvents:css.pointerEvents,visibility:css.visibility,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
  };
  const state=()=>{try{return {map:document.querySelector('#homeGuideMapSelect')?.value,raw:typeof HD_HOME_GUIDE_KEY==='string'?localStorage.getItem(HD_HOME_GUIDE_KEY):null}}catch(e){return {stateError:String(e)}}};
  const emit=(kind,data={})=>{
   const entry={kind,timeOrigin:performance.timeOrigin,t:performance.now(),scrollY,viewport:{width:innerWidth,height:innerHeight,visualY:visualViewport?.offsetTop,visualHeight:visualViewport?.height},header:{compact:document.body?.classList.contains('hd-header-compact'),topbar:document.querySelector('.topbar')?.getBoundingClientRect().height},...data};
   const p=window.__hdImportDiagnosticEmit(entry).catch(()=>{});pending.add(p);p.finally(()=>pending.delete(p));
  };
  const snapshot=()=>({bodyClass:document.body?.className,layout:Object.fromEntries(['hdWorkspaceNav','hdWorkspaceMobilePicker','hdWorkspaceSwipeHint','home','homeResume','homeGameSync','homeNextAction','hdCommandCenter','homeGuideSteps'].map(id=>[id,node(document.getElementById(id))])),button:node(document.querySelector(selector)),tracked:node(tracked),...state()});
  const event=(e,phase)=>emit(e.type,{phase,pointerId:e.pointerId,defaultPrevented:e.defaultPrevented,target:node(e.target),currentTarget:node(e.currentTarget),hit:node(document.elementFromPoint(e.clientX,e.clientY)),x:e.clientX,y:e.clientY,...snapshot()});
  for(const type of ['pointerdown','pointerup','pointercancel','click']){
   window.addEventListener(type,e=>{if(type==='pointerdown')pressing=true;event(e,'capture');if(type==='click'){const p=new Promise(resolve=>setTimeout(()=>{event(e,'after-task');pressing=false;resolve()},0));pending.add(p);p.finally(()=>pending.delete(p))}},true);
   document.addEventListener(type,e=>event(e,'bubble'));
  }
  for(const name of ['scrollTo','scrollBy']){
   const original=window[name];window[name]=function(...args){emit(name,{args,stack:new Error().stack,...snapshot()});return original.apply(this,args)};
  }
  const scroll=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(...args){emit('scrollIntoView',{target:node(this),args,stack:new Error().stack,...snapshot()});return scroll.apply(this,args)};
  document.addEventListener('transitionrun',e=>{if(e.target.closest?.('.topbar,#hdWorkspaceNav'))emit('transitionrun',{target:node(e.target),property:e.propertyName})},true);
  document.addEventListener('transitionend',e=>{if(e.target.closest?.('.topbar,#hdWorkspaceNav'))emit('transitionend',{target:node(e.target),property:e.propertyName})},true);
  for(const type of ['focusin','focusout'])document.addEventListener(type,e=>emit(type,{target:node(e.target),active:node(document.activeElement),...snapshot()}),true);
  let observer;
  const install=()=>{
   const host=document.querySelector('#homeGuideSteps');
   if(host&&!observer){observer=new MutationObserver(ms=>{if(pressing)emit('press-mutations',{changes:ms.slice(0,20).map(m=>({type:m.type,attribute:m.attributeName,target:node(m.target)})),...snapshot()});const current=document.querySelector(selector);if(tracked&&current!==tracked)emit('button-replaced',snapshot())});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','style']})}
   for(const name of ['hdStrategyImportMap','homeGuideSave','homeGuideRenderNow','hdWSRestoreStartupContext','hdWSApply','hdWSRenderSubtabs','hdWSUpdateKeyboardState','hdSyncMobileHeaderMenu','renderHomeDashboard','hdCCRender','hdCCEnsure']){
    const original=window[name];if(typeof original!=='function'||original.__hdImportDiagnosticWrapped)continue;
    const wrapped=function(...args){emit(name+':enter',{args:name==='hdStrategyImportMap'?args:undefined,...snapshot()});try{const result=original.apply(this,args);if(!tracked)tracked=document.querySelector(selector);emit(name+':return',{result,...snapshot()});return result}catch(e){emit(name+':throw',{error:String(e)});throw e}};
    wrapped.__hdImportDiagnosticWrapped=true;window[name]=wrapped;
   }
  };
  document.addEventListener('change',e=>{if(e.target.id==='homeGuideMapSelect'){install();emit('map-change-before-app',snapshot())}},true);
  window.__hdImportDiagnostic={mark(label){install();if(!tracked)tracked=document.querySelector(selector);emit('mark',{label,...snapshot()})},async flush(){while(pending.size)await Promise.all([...pending])}};
 });
 return {records,archiveFile,failed(error){failure=String(error)},mark:label=>page.evaluate(label=>window.__hdImportDiagnostic.mark(label),label),async finish(){
  await page.evaluate(()=>window.__hdImportDiagnostic?.flush()).catch(e=>records.push({kind:'flush-unavailable',error:e.message}));
  const data=JSON.stringify({title:info.title,project:info.project.name,retry:info.retry,status:failure?'failed':info.status,failure,records},null,2);
  const file=info.outputPath('prerequisite-import-diagnostics.json');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,data);
  await info.attach('prerequisite-import-diagnostics',{path:file,contentType:'application/json'});
  // A successful retry normally deletes its output and hides a first failure.
  // Preserve a distinct record outside those per-test directories as well.
  await fs.mkdir(path.dirname(archiveFile),{recursive:true});await fs.writeFile(archiveFile,data);
 }};
}
module.exports={strategyImportDiagnostics};
