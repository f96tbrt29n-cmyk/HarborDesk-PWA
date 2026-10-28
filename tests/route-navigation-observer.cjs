'use strict';

// Test-only, synchronous observation of the two existing workspace entrances.
// Both functions are self-contained so Playwright can serialize them into the
// current document. They never read Storage, arguments, results or error bodies.
function installRouteNavigationObserver(){
 'use strict';
 const key='__HD_ROUTE_NAV_OBSERVER_V1',g=globalThis;
 const existing=g[key];
 if(existing?.version===1)return {installed:{...existing.installed},cap:existing.cap,events:existing.events.length,drop:existing.drop,failures:existing.failures};
 const state={version:1,cap:64,sequence:0,drop:0,failures:0,installed:{},events:[]};
 const id=value=>typeof value==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(value)?value:null;
 const view=()=>id(document.getElementById('hdWorkspaceSectionSelect')?.value);
 const cleanStack=value=>String(value||'').split('\n').slice(0,18).map(line=>line.replace(/(?:https?|file):\/\/[^\s)]+/g,url=>{const tail=(url.match(/:\d+:\d+$/)||url.match(/:\d+$/)||[''])[0];return url.slice(0,tail?-tail.length:undefined).split(/[?#]/)[0]+tail})).join('\n').slice(0,4096);
 const record=(entry,before,stack)=>{
  try{
   const sequence=++state.sequence;
   if(state.events.length>=state.cap){state.drop++;return}
   state.events.push({entry,before,after:view(),doc:performance.timeOrigin,at:performance.now(),stack,sequence,drop:state.drop,failures:state.failures});
  }catch{state.failures++}
 };
 try{g[key]=state}catch{state.failures++;return {installed:{},cap:64,events:0,drop:0,failures:state.failures}}
 for(const name of ['hdWSApply','hdWSRevealElement']){
  try{
   const original=g[name];
   if(typeof original!=='function'){state.installed[name]=false;state.failures++;continue}
   const wrapped=function(...args){
    let before=null,stack=null;
    try{before=view();stack=cleanStack(new Error().stack)}catch{state.failures++}
    try{return Reflect.apply(original,this,args)}finally{record(name,before,stack)}
   };
   g[name]=wrapped;state.installed[name]=g[name]===wrapped;
   if(!state.installed[name])state.failures++;
  }catch{state.installed[name]=false;state.failures++}
 }
 try{record('installed',view(),cleanStack(new Error().stack))}catch{state.failures++}
 return {installed:{...state.installed},cap:state.cap,events:state.events.length,drop:state.drop,failures:state.failures};
}

function snapshotRouteNavigationObserver(){
 'use strict';
 const state=globalThis.__HD_ROUTE_NAV_OBSERVER_V1;
 if(!state||state.version!==1)return {installed:false,events:[],drop:0,failures:1};
 const id=value=>typeof value==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(value)?value:null;
 const read=fn=>{try{return fn()}catch{state.failures++;return null}};
 const ownHidden=el=>{if(!el)return null;const style=getComputedStyle(el);return !!el.hidden||style.display==='none'||['hidden','collapse'].includes(style.visibility)};
 const visible=el=>{for(let p=el;p;p=p.parentElement)if(ownHidden(p))return false;return el.getClientRects().length>0};
 const selected=read(()=>id(document.getElementById('hdWorkspaceSectionSelect')?.value));
 const button=read(()=>document.querySelector('#mapStrategyNavigator .hd-oc-panel [data-hd-oc-search]'));
 const targetSection=read(()=>id(button?.closest('section[id]')?.id));
 const hiddenAncestors=read(()=>{const ids=[];let anonymous=0;for(let p=button;p;p=p.parentElement)if(ownHidden(p)){const value=id(p.id);if(value)ids.push(value);else anonymous++}return {ids:ids.slice(0,16),drop:Math.max(0,ids.length-16),anonymous}});
 const sectionRows=read(()=>[...new Set(['guide','mapStrategyNavigator',selected,targetSection].filter(Boolean))].map(value=>{const el=document.getElementById(value);return {id:value,present:!!el,hidden:ownHidden(el)}}));
 const visibleSections=read(()=>[...document.querySelectorAll('section[data-hd-workspace-group]')].filter(visible).map(el=>id(el.id)).filter(Boolean));
 const buttonHidden=read(()=>button?!visible(button):null),doc=read(()=>performance.timeOrigin),at=read(()=>performance.now());
 return {installed:{...state.installed},cap:state.cap,doc,at,sequence:state.sequence,drop:state.drop,failures:state.failures,events:state.events.map(event=>({...event})),selectedId:selected,sectionStates:sectionRows,visibleSectionIds:visibleSections?.slice(0,16)||[],visibleSectionDrop:Math.max(0,(visibleSections?.length||0)-16),button:{present:!!button,hidden:buttonHidden,targetSectionId:targetSection,hiddenAncestorIds:hiddenAncestors?.ids||[],hiddenAncestorDrop:hiddenAncestors?.drop||0,anonymousHiddenAncestors:hiddenAncestors?.anonymous||0}};
}

module.exports={install:installRouteNavigationObserver,snapshot:snapshotRouteNavigationObserver};
