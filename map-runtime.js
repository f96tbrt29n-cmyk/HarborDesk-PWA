const HD_MAP_RUNTIME_VERSION=1;

function hdMRCall(name){
  try{const fn=window[name];if(typeof fn==='function')fn()}catch(err){console.warn(`[HarborDesk] map renderer failed: ${name}`,err)}
}
function hdMRActiveTab(){return document.querySelector('.map-tab-btn.active')?.dataset.mapTab||null}
function hdMRRestoreHeaderActions(){
  hdMRCall('hdSPSMapButton');
  hdMRCall('hdFSMapButton');
}
function hdMRRenderRouteRequirements(){
  const pane=document.querySelector('[data-map-pane="route"]');if(!pane||typeof hdAdvancedHtml!=='function')return;
  let host=pane.querySelector('#hdMapRouteRequirements');
  if(!host){host=document.createElement('div');host.id='hdMapRouteRequirements';pane.appendChild(host)}
  host.innerHTML=hdAdvancedHtml(selectedMap);
}
function hdMRRefresh(tab=hdMRActiveTab(),reason='event'){
  if(typeof selectedMap==='undefined'||!selectedMap)return;
  hdMRRestoreHeaderActions();
  if(tab==='map'){
    hdMRCall('hdEnhanceMapPane');
  }
  if(tab==='route'){
    hdMRRenderRouteRequirements();
  }
  if(tab==='gear'){
    hdMRCall('hdRenderMapEquipmentRecommendations');
    hdMRCall('hdRenderLandBasePlanner');
    hdMRCall('hdFCRender');
  }
  if(tab==='mine'){
    hdMRCall('hdRenderSortieReadiness');
    hdMRCall('hdSPRender');
  }
  window.dispatchEvent(new CustomEvent('hd:map-tools-rendered',{detail:{map:selectedMap,tab,reason}}));
}
function hdMRInstall(){
  if(window.__hdMapRuntimeInstalled)return;
  window.__hdMapRuntimeInstalled=true;

  if(typeof window.hdMapTabsCoreApply==='function'){
    window.hdApplyMapTabs=window.hdMapTabsCoreApply;
  }

  window.addEventListener('hd:map-rendered',e=>{
    requestAnimationFrame(()=>hdMRRefresh(e.detail?.tab||hdMRActiveTab(),'map-rendered'));
  });
  window.addEventListener('hd:map-tab-changed',e=>{
    requestAnimationFrame(()=>hdMRRefresh(e.detail?.tab||hdMRActiveTab(),'tab-changed'));
  });
  window.addEventListener('hd:modules-ready',()=>{
    if(typeof window.hdMapTabsCoreApply==='function')window.hdApplyMapTabs=window.hdMapTabsCoreApply;
    requestAnimationFrame(()=>hdMRRefresh(hdMRActiveTab(),'modules-ready'));
  });

  requestAnimationFrame(()=>hdMRRefresh(hdMRActiveTab(),'install'));
}

window.addEventListener('load',()=>setTimeout(hdMRInstall,250));
setTimeout(hdMRInstall,900);
