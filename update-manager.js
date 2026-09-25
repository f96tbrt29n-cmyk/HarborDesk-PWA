const HD_APP_VERSION='1.0.473';
const HD_APP_BUILD=473;
const HD_UPDATE_SNOOZE_KEY='harbordesk-update-snooze-v1';
window.HD_MODULE_STATUS=window.HD_MODULE_STATUS||{};
window.HD_SERVICE_WORKER_STATUS='idle';

async function hdEnsureServiceWorker(){
  if(!('serviceWorker' in navigator)){window.HD_SERVICE_WORKER_STATUS='unsupported';return null}
  try{
    window.HD_SERVICE_WORKER_STATUS='registering';
    const reg=await navigator.serviceWorker.register(`./sw.js?v=${HD_APP_BUILD}`,{scope:'./'});
    window.HD_SERVICE_WORKER_STATUS='registered';
    reg.update().catch(()=>{});
    navigator.serviceWorker.ready.then(()=>{window.HD_SERVICE_WORKER_STATUS='ready'}).catch(()=>{});
    return reg;
  }catch(err){
    window.HD_SERVICE_WORKER_STATUS='error';
    console.warn('HarborDesk Service Worker registration failed',err);
    return null;
  }
}

const HD_RELEASE_META_RAW='https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json';
async function hdFetchVersionMeta(url){
  const res=await fetch(url+(url.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});
  if(!res.ok)throw new Error('version fetch failed');
  return res.json();
}
async function hdFetchLatestVersion(){
  const [sourceResult,publishedResult]=await Promise.allSettled([
    hdFetchVersionMeta(HD_RELEASE_META_RAW),
    hdFetchVersionMeta('./app-version.json')
  ]);
  const source=sourceResult.status==='fulfilled'?sourceResult.value:null;
  const published=publishedResult.status==='fulfilled'?publishedResult.value:null;
  if(!source&&!published)throw new Error('version fetch failed');
  const latest=source||published;
  return {
    ...latest,
    sourceBuild:Number(source?.build??latest?.build)||0,
    sourceVersion:String(source?.version??latest?.version??''),
    publishedBuild:Number(published?.build??0)||0,
    publishedVersion:String(published?.version??''),
    publishedReady:!!published&&Number(published.build||0)>=Number(latest.build||0)
  };
}

function hdBuildAssetUrl(src){
  const s=String(src||'');
  if(!s||/^(?:https?:|data:|blob:)/i.test(s))return s;
  return s+(s.includes('?')?'&':'?')+'v='+HD_APP_BUILD;
}
const HD_SCRIPT_RETRY_LIMIT=1;
const HD_SCRIPT_TIMEOUT_MS=12000;
const HD_SCRIPT_LOADS=window.__HD_SCRIPT_LOADS=window.__HD_SCRIPT_LOADS||{};

function hdAppendStyle(attr,href){
  const old=document.querySelector(`link[${attr}]`);
  if(old&&old.dataset.hdError!=='1')return old;
  if(old)old.remove();
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=hdBuildAssetUrl(href);link.setAttribute(attr,'1');
  link.onload=()=>{link.dataset.hdLoaded='1';delete link.dataset.hdError};
  link.onerror=()=>{link.dataset.hdError='1';link.remove()};
  document.head.appendChild(link);
  return link;
}
function hdScriptAssetUrl(src,attempt=0){
  const base=hdBuildAssetUrl(src);
  if(!attempt)return base;
  return base+(base.includes('?')?'&':'?')+`retry=${attempt}&t=${Date.now()}`;
}
function hdLoadScriptAttempt(attr,src,attempt=0){
  return new Promise(resolve=>{
    const old=document.querySelector(`script[${attr}]`);
    if(old?.dataset.hdLoaded==='1'){
      window.HD_MODULE_STATUS[src]='ok';
      resolve(true);
      return;
    }
    if(old)old.remove();

    const script=document.createElement('script');
    script.src=hdScriptAssetUrl(src,attempt);
    script.async=false;
    script.setAttribute(attr,'1');
    script.dataset.hdAttempt=String(attempt);
    window.HD_MODULE_STATUS[src]=attempt?'retrying':'loading';

    let settled=false;
    let timer=0;
    const finish=ok=>{
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      if(ok){
        script.dataset.hdLoaded='1';
        delete script.dataset.hdError;
        window.HD_MODULE_STATUS[src]='ok';
        resolve(true);
        return;
      }
      script.dataset.hdError='1';
      if(script.isConnected)script.remove();
      if(attempt<HD_SCRIPT_RETRY_LIMIT){
        window.HD_MODULE_STATUS[src]='retrying';
        setTimeout(()=>hdLoadScriptAttempt(attr,src,attempt+1).then(resolve),80);
        return;
      }
      window.HD_MODULE_STATUS[src]='error';
      resolve(false);
    };
    timer=setTimeout(()=>finish(false),HD_SCRIPT_TIMEOUT_MS);
    script.onload=()=>finish(true);
    script.onerror=()=>finish(false);
    document.body.appendChild(script);
  });
}
function hdLoadScript(attr,src){
  const key=`${attr}:${src}`;
  if(HD_SCRIPT_LOADS[key])return HD_SCRIPT_LOADS[key];
  const pending=hdLoadScriptAttempt(attr,src,0).finally(()=>{
    if(HD_SCRIPT_LOADS[key]===pending)delete HD_SCRIPT_LOADS[key];
  });
  HD_SCRIPT_LOADS[key]=pending;
  return pending;
}
window.hdLoadScript=hdLoadScript;
function hdInitLoadedModules(){
  try{if(typeof hdRenderSortieReadiness==='function')hdRenderSortieReadiness()}catch{}
  try{if(typeof hdRenderLandBasePlanner==='function')hdRenderLandBasePlanner()}catch{}
  try{if(typeof hdFCRender==='function')hdFCRender()}catch{}
  try{if(typeof hdEFStatsInstall==='function')hdEFStatsInstall();if(typeof hdEFEnsure==='function')hdEFEnsure()}catch{}
  try{if(typeof hdSPRender==='function')hdSPRender()}catch{}
  try{if(typeof hdQPEnsureCycleButtons==='function')hdQPEnsureCycleButtons();if(typeof hdRenderQuestDb==='function')hdRenderQuestDb()}catch{}
  try{if(typeof hdCCEnsure==='function')hdCCEnsure();if(typeof hdCCRender==='function')hdCCRender()}catch{}
  try{if(typeof hdRBEnsure==='function')hdRBEnsure();if(typeof hdRBInstallCommandCenterPatch==='function')hdRBInstallCommandCenterPatch()}catch{}
  try{if(typeof hdEREnsure==='function')hdEREnsure();if(typeof hdERRender==='function')hdERRender()}catch{}
  try{if(typeof hdALEnsure==='function')hdALEnsure();if(typeof hdALRender==='function')hdALRender()}catch{}
  try{if(typeof hdSLEnsure==='function')hdSLEnsure();if(typeof hdSLRender==='function')hdSLRender()}catch{}
  try{if(typeof hdEOpsEnsure==='function')hdEOpsEnsure();if(typeof hdProfileEnsure==='function')hdProfileEnsure();if(typeof hdVariantEnsure==='function')hdVariantEnsure()}catch{}
  try{if(typeof hdOptImproveEnsure==='function')hdOptImproveEnsure();if(typeof hdOptExpEnsure==='function')hdOptExpEnsure();if(typeof hdOptCostEnsure==='function')hdOptCostEnsure();if(typeof hdOptFarmEnsure==='function')hdOptFarmEnsure();if(typeof hdOptRankEnsure==='function')hdOptRankEnsure()}catch{}
  try{if(typeof hdDOEnsure==='function')hdDOEnsure();if(typeof hdDONotifyEnsure==='function')hdDONotifyEnsure();if(typeof hdDOAuditEnsure==='function')hdDOAuditEnsure()}catch{}
  try{if(typeof hdStabInstall==='function')hdStabInstall()}catch{}
  try{if(typeof hdMRInstall==='function')hdMRInstall()}catch{}
  try{if(typeof hdQNEnsure==='function')hdQNEnsure()}catch{}
  try{if(typeof hdPHEnsure==='function')hdPHEnsure();if(typeof hdPHInstallBackupHooks==='function')hdPHInstallBackupHooks()}catch{}
  try{if(typeof hdGSEnsure==='function')hdGSEnsure()}catch{}
  try{if(typeof hdDXEnsure==='function')hdDXEnsure()}catch{}
  try{if(typeof hdWSInstall==='function')hdWSInstall()}catch{}
  try{if(typeof hdEAensure==='function')hdEAensure();if(typeof hdEArenderCoverage==='function')hdEArenderCoverage()}catch{}
  try{if(typeof hdSEInstall==='function')hdSEInstall();if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations()}catch{}
  try{if(typeof hdAGEnsureDialog==='function')hdAGEnsureDialog();if(typeof hdAGInstall==='function')hdAGInstall()}catch{}
  try{if(typeof hdPLEnsure==='function')hdPLEnsure();if(typeof hdPLInstallSortieButton==='function')hdPLInstallSortieButton();if(typeof hdPLRender==='function')hdPLRender()}catch{}
  try{if(typeof hdSPSEnsure==='function')hdSPSEnsure();if(typeof hdSPSRender==='function')hdSPSRender()}catch{}
  try{if(typeof hdFSEnsure==='function')hdFSEnsure();if(typeof hdFSRender==='function')hdFSRender()}catch{}
  try{if(typeof hdFLInstall==='function')hdFLInstall()}catch{}
  try{if(typeof hdFEInstall==='function')hdFEInstall()}catch{}
  try{if(typeof hdFOInstall==='function')hdFOInstall()}catch{}
  try{if(typeof hdSPMInstall==='function')hdSPMInstall();if(typeof hdSPMRender==='function')hdSPMRender()}catch{}
  try{if(typeof hdSSInstall==='function')hdSSInstall();if(typeof hdSSRender==='function')hdSSRender()}catch{}
  try{if(typeof hdSMInstall==='function')hdSMInstall();if(typeof hdSMRender==='function')hdSMRender()}catch{}
  try{if(typeof hdSPAInstall==='function')hdSPAInstall();if(typeof hdSPARender==='function')hdSPARender()}catch{}
  document.body?.classList.remove('hd-booting');document.body?.setAttribute('data-hd-ready','1');
  window.dispatchEvent(new CustomEvent('hd:modules-ready',{detail:{status:{...window.HD_MODULE_STATUS}}}));
}
let HD_CURRENT_ASSETS_PROMISE=null;
function hdEnsureCurrentAssets(){
  if(HD_CURRENT_ASSETS_PROMISE)return HD_CURRENT_ASSETS_PROMISE;
  const pending=hdLoadCurrentAssets().finally(()=>{
    if(HD_CURRENT_ASSETS_PROMISE===pending)HD_CURRENT_ASSETS_PROMISE=null;
  });
  HD_CURRENT_ASSETS_PROMISE=pending;
  return pending;
}
window.hdEnsureCurrentAssets=hdEnsureCurrentAssets;

async function hdLoadCurrentAssets(){
  [
   ['data-hd-sortie-ready','./sortie-readiness.css'],['data-hd-land-base','./land-base-planner.css'],['data-hd-fleet-calc','./fleet-calculator.css'],
   ['data-hd-exp-fleet','./expedition-fleet-manager.css'],['data-hd-exp-stats','./expedition-stats-extension.css'],['data-hd-support-fleet','./support-fleet-planner.css'],
   ['data-hd-quest-progress','./quest-progress-extension.css'],['data-hd-command-center','./command-center.css'],['data-hd-resource-budget','./resource-budget.css'],
   ['data-hd-exercise-routine','./exercise-routine.css'],['data-hd-activity-logger','./activity-logger.css'],['data-hd-sortie-log','./sortie-log.css'],
   ['data-hd-grand-ops','./grand-operations.css'],['data-hd-quick-nav','./quick-nav.css'],['data-hd-personal-home','./personal-home.css'],['data-hd-global-search','./global-search.css'],
   ['data-hd-diagnostics-center','./diagnostics-center.css'],['data-hd-workspace-tabs','./workspace-tabs.css'],['data-hd-equipment-analyzer','./equipment-analyzer.css'],['data-hd-sortie-equipment-check','./sortie-equipment-check.css'],['data-hd-equipment-acquisition-guide','./equipment-acquisition-guide.css'],['data-hd-equipment-procurement-list','./equipment-procurement-list.css'],['data-hd-sortie-preparation-sheet','./sortie-preparation-sheet.css'],['data-hd-fleet-suggester','./fleet-suggester.css'],['data-hd-fleet-loadout','./fleet-loadout-planner.css'],['data-hd-fleet-evaluator','./fleet-readiness-evaluator.css'],['data-hd-fleet-optimizer','./fleet-loadout-optimizer.css'],['data-hd-sortie-preset-manager','./sortie-preset-manager.css'],['data-hd-sortie-session','./sortie-session.css'],['data-hd-sortie-mode','./sortie-mode.css'],['data-hd-sortie-performance','./sortie-performance-analytics.css']
  ].forEach(([a,h])=>hdAppendStyle(a,h));

  const equipmentAnalyzerP=hdLoadScript('data-hd-equipment-analyzer','./equipment-analyzer.js');
  const sortieEquipmentCheckP=hdLoadScript('data-hd-sortie-equipment-check','./sortie-equipment-check.js');
  // Keep攻略 tools available even when one optional equipment helper fails.
  // Each downstream module already guards optional cross-module calls and can recover missing helpers on demand.
  const equipmentAcquisitionGuideP=sortieEquipmentCheckP.then(()=>hdLoadScript('data-hd-equipment-acquisition-guide','./equipment-acquisition-guide.js'));
  const equipmentProcurementP=equipmentAcquisitionGuideP.then(()=>hdLoadScript('data-hd-equipment-procurement-list','./equipment-procurement-list.js'));
  const sortiePreparationP=equipmentProcurementP.then(()=>hdLoadScript('data-hd-sortie-preparation-sheet','./sortie-preparation-sheet.js'));
  const fleetSuggesterP=sortiePreparationP.then(()=>hdLoadScript('data-hd-fleet-suggester','./fleet-suggester.js'));
  const fleetLoadoutP=fleetSuggesterP.then(()=>hdLoadScript('data-hd-fleet-loadout','./fleet-loadout-planner.js'));
  const fleetEvaluatorP=fleetLoadoutP.then(()=>hdLoadScript('data-hd-fleet-evaluator','./fleet-readiness-evaluator.js'));
  const fleetOptimizerP=fleetEvaluatorP.then(()=>hdLoadScript('data-hd-fleet-optimizer','./fleet-loadout-optimizer.js'));
  const sortiePresetManagerP=fleetOptimizerP.then(()=>hdLoadScript('data-hd-sortie-preset-manager','./sortie-preset-manager.js'));
  const sortieP=hdLoadScript('data-hd-sortie-ready','./sortie-readiness.js');
  const landP=hdLoadScript('data-hd-land-base','./land-base-planner.js');
  const fleetP=hdLoadScript('data-hd-fleet-calc','./fleet-calculator.js').then(ok=>ok?hdLoadScript('data-hd-fleet-calc-fix','./fleet-calculator-fix.js'):false);
  const questP=hdLoadScript('data-hd-quest-progress','./quest-progress-extension.js');
  const commandP=hdLoadScript('data-hd-command-center','./command-center.js');
  const eventP=hdLoadScript('data-hd-event-ops','./event-operations.js');

  const expBaseP=hdLoadScript('data-hd-exp-fleet','./expedition-fleet-manager.js').then(ok=>ok?hdLoadScript('data-hd-exp-fleet-patch','./expedition-fleet-manager-patch.js'):false);
  const expP=expBaseP.then(async ok=>{
    if(!ok)return false;
    const [stats,support]=await Promise.all([
      hdLoadScript('data-hd-exp-stats','./expedition-stats-extension.js'),
      hdLoadScript('data-hd-support-fleet','./support-fleet-planner.js')
    ]);
    return stats&&support;
  });

  const resourceP=commandP.then(()=>hdLoadScript('data-hd-resource-budget','./resource-budget.js'));
  const exerciseP=Promise.all([questP,resourceP]).then(()=>hdLoadScript('data-hd-exercise-routine','./exercise-routine.js'));
  const guardP=exerciseP.then(()=>hdLoadScript('data-hd-quest-acceptance','./quest-acceptance-guard.js'));
  const activityP=Promise.all([guardP,questP]).then(()=>hdLoadScript('data-hd-activity-logger','./activity-logger.js'));
  const sortieLogP=activityP.then(()=>hdLoadScript('data-hd-sortie-log','./sortie-log.js'));
  const sortieSessionP=Promise.all([sortiePresetManagerP,sortieLogP]).then(([presetOk,logOk])=>presetOk&&logOk?hdLoadScript('data-hd-sortie-session','./sortie-session.js'):false);
  const sortieModeP=sortieSessionP.then(ok=>ok?hdLoadScript('data-hd-sortie-mode','./sortie-mode.js'):false);
  const sortiePerformanceP=sortieSessionP.then(ok=>ok?hdLoadScript('data-hd-sortie-performance','./sortie-performance-analytics.js'):false);
  const optimizeP=Promise.all([expP,sortieLogP]).then(()=>hdLoadScript('data-hd-optimization','./optimization-tools.js'));
  const dailyP=Promise.all([commandP,exerciseP,eventP,optimizeP,sortieLogP,landP,fleetP]).then(()=>hdLoadScript('data-hd-daily-ops','./daily-ops.js'));
  const stabilityP=Promise.all([sortieP,landP,fleetP,expP,eventP,optimizeP,dailyP]).then(()=>hdLoadScript('data-hd-stability','./stability-integration.js'));
  const mapRuntimeP=Promise.all([stabilityP,sortieP,landP,fleetP,expP]).then(()=>hdLoadScript('data-hd-map-runtime','./map-runtime.js'));
  const quickNavP=Promise.all([eventP,optimizeP,dailyP]).then(()=>hdLoadScript('data-hd-quick-nav','./quick-nav.js'));
  const personalHomeP=Promise.all([quickNavP,dailyP,stabilityP]).then(()=>hdLoadScript('data-hd-personal-home','./personal-home.js'));
  const globalSearchP=Promise.all([quickNavP,personalHomeP,questP,expP]).then(()=>hdLoadScript('data-hd-global-search','./global-search.js'));
  const diagnosticsP=Promise.all([personalHomeP,globalSearchP]).then(()=>hdLoadScript('data-hd-diagnostics-center','./diagnostics-center.js'));
  const workspaceP=Promise.all([globalSearchP,mapRuntimeP,personalHomeP,diagnosticsP]).then(()=>hdLoadScript('data-hd-workspace-tabs','./workspace-tabs.js'));
  const workspaceCompatP=workspaceP.then(()=>hdLoadScript('data-hd-workspace-compat','./workspace-compat.js'));

  await Promise.all([equipmentAnalyzerP,sortieEquipmentCheckP,equipmentAcquisitionGuideP,equipmentProcurementP,sortiePreparationP,fleetSuggesterP,fleetLoadoutP,fleetEvaluatorP,fleetOptimizerP,sortiePresetManagerP,sortieSessionP,sortieModeP,sortiePerformanceP,sortieP,landP,fleetP,questP,commandP,eventP,expP,resourceP,exerciseP,guardP,activityP,sortieLogP,optimizeP,dailyP,stabilityP,mapRuntimeP,quickNavP,personalHomeP,globalSearchP,diagnosticsP,workspaceP,workspaceCompatP]);
  hdInitLoadedModules();
}

function hdEnsureMobileHeaderMenuRow(){
  const top=document.querySelector('.topbar');if(!top)return null;
  let row=document.getElementById('hdMobileHeaderMenuRow');
  const nav=document.getElementById('hdWorkspaceNav');
  if(!row){
    row=document.createElement('div');
    row.id='hdMobileHeaderMenuRow';
    row.className='hd-mobile-header-menu-row';
    row.hidden=true;
  }
  if(nav){
    if(row.nextElementSibling!==nav)nav.insertAdjacentElement('beforebegin',row);
  }else if(row.previousElementSibling!==top){
    top.insertAdjacentElement('afterend',row);
  }
  return row;
}
function hdRefreshHeaderMenuMetrics(){
  const topH=document.querySelector('.topbar')?.getBoundingClientRect().height||58;
  const row=document.getElementById('hdMobileHeaderMenuRow');
  const rowH=!row?.hidden?(row.getBoundingClientRect().height||0):0;
  document.documentElement.style.setProperty('--hd-topbar-h',`${Math.ceil(topH)}px`);
  if(rowH>0)document.documentElement.style.setProperty('--hd-header-menu-h',`${Math.ceil(rowH)}px`);
  else document.documentElement.style.removeProperty('--hd-header-menu-h');
}
function hdSyncMobileHeaderMenu(){
  const details=document.querySelector('.hd-header-more');
  const menu=document.querySelector('.hd-version-menu');
  if(!details||!menu)return false;
  const mobile=window.matchMedia?.('(max-width:560px)')?.matches??window.innerWidth<=560;
  const row=hdEnsureMobileHeaderMenuRow();
  if(details.open&&mobile&&row){
    row.hidden=false;
    if(menu.parentElement!==row)row.appendChild(menu);
    document.body.classList.add('hd-header-menu-open');
    window.__HD_HEADER_MENU_OPENED_AT=performance.now();
    hdRefreshHeaderMenuMetrics();
    requestAnimationFrame(hdRefreshHeaderMenuMetrics);
    return true;
  }
  if(menu.parentElement!==details)details.appendChild(menu);
  if(row)row.hidden=true;
  document.body.classList.remove('hd-header-menu-open');
  hdRefreshHeaderMenuMetrics();
  requestAnimationFrame(hdRefreshHeaderMenuMetrics);
  return false;
}
function hdBindMobileHeaderMenu(){
  const details=document.querySelector('.hd-header-more');if(!details||details.dataset.hdInlineBound==='1')return;
  details.dataset.hdInlineBound='1';
  details.addEventListener('toggle',hdSyncMobileHeaderMenu);
  if(!window.__HD_HEADER_MENU_RESIZE_BOUND){
    window.__HD_HEADER_MENU_RESIZE_BOUND=true;
    window.addEventListener('resize',()=>{
      const open=document.querySelector('.hd-header-more')?.open;
      if(open&&!window.matchMedia?.('(max-width:560px)')?.matches)document.querySelector('.hd-header-more')?.removeAttribute('open');
      hdSyncMobileHeaderMenu();
    },{passive:true});
  }
  if(!window.__HD_HEADER_MENU_SCROLL_BOUND){
    window.__HD_HEADER_MENU_SCROLL_BOUND=true;
    window.addEventListener('scroll',()=>{
      const d=document.querySelector('.hd-header-more');
      if(!d?.open||!window.matchMedia?.('(max-width:560px)')?.matches)return;
      const opened=Number(window.__HD_HEADER_MENU_OPENED_AT||0);
      if(performance.now()-opened<250)return;
      d.removeAttribute('open');
    },{passive:true});
  }
}
function hdInitUpdateManagerUI(){
  hdEnsureUpdateUI();
  hdEnsureMobileHeaderMenuRow();
  hdBindMobileHeaderMenu();
  hdRefreshHeaderMenuMetrics();
  return !!document.querySelector('.hd-header-more');
}
window.hdEnsureUpdateUI=hdEnsureUpdateUI;
window.hdEnsureMobileHeaderMenuRow=hdEnsureMobileHeaderMenuRow;
window.hdSyncMobileHeaderMenu=hdSyncMobileHeaderMenu;
window.hdInitUpdateManagerUI=hdInitUpdateManagerUI;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hdInitUpdateManagerUI,{once:true});
else queueMicrotask(hdInitUpdateManagerUI);

function hdUpdateSnoozed(){
  try{return Number(sessionStorage.getItem(HD_UPDATE_SNOOZE_KEY)||0)>Date.now()}catch{return false}
}
function hdSnoozeUpdate(ms=2*60*60*1000){
  try{sessionStorage.setItem(HD_UPDATE_SNOOZE_KEY,String(Date.now()+ms))}catch{}
  const banner=document.getElementById('hdUpdateBanner');if(banner)banner.hidden=true;
  window.hdToast?.('更新通知をあとで表示するよ','info',1400);
  return true;
}
function hdClearUpdateSnooze(){try{sessionStorage.removeItem(HD_UPDATE_SNOOZE_KEY)}catch{}}
function hdEnsureUpdateUI(){
  if(document.getElementById('hdUpdateBanner'))return;
  const banner=document.createElement('div');banner.id='hdUpdateBanner';banner.className='hd-update-banner';banner.hidden=true;
  banner.innerHTML=`<div class="hd-update-main"><strong>HarborDeskの最新版があります</strong><div id="hdUpdateText" class="muted"></div><div id="hdUpdateChanges" class="hd-update-changes" hidden></div></div><div class="hd-update-actions"><button id="hdUpdateLater" type="button" class="ghost small">あとで</button><button id="hdUpdateNow" type="button" class="primary small" onclick="hdForceUpdate()">今すぐ更新</button></div>`;
  document.body.appendChild(banner);
  const header=document.querySelector('.topbar');
  if(header&&!document.getElementById('hdUpdateCheck')){
    const controls=document.createElement('details');controls.className='hd-version-controls hd-header-more';
    controls.innerHTML=`<summary aria-label="HarborDeskメニュー" title="バージョン・更新"><span aria-hidden="true">•••</span></summary><div class="hd-version-menu"><button type="button" class="ghost small hd-header-search" data-hd-gs-open aria-label="全体検索"><span aria-hidden="true">⌕</span><b>全体検索</b></button><button type="button" class="ghost small hd-header-share" data-hd-header-share><span aria-hidden="true">↗</span><b>この画面を共有</b></button><span class="hd-version-badge" title="HarborDesk バージョン">v${HD_APP_VERSION}</span><button id="hdUpdateCheck" class="ghost small hd-update-check" aria-label="更新確認"><span aria-hidden="true">↻</span><b>更新確認</b></button><a class="ghost small hd-update-reset" href="./refresh.html"><span aria-hidden="true">⟳</span><b>更新リセット</b></a><button type="button" class="ghost small hd-header-settings" data-hd-header-settings><span aria-hidden="true">⚙</span><b>設定</b></button></div>`;
    header.appendChild(controls)
  }
  const notify=document.getElementById('notifyBtn'),menu=document.querySelector('.hd-header-more .hd-version-menu');
  if(notify&&menu&&notify.parentElement!==menu){notify.classList.add('hd-notify-btn');menu.prepend(notify)}
  hdBindMobileHeaderMenu();
  document.getElementById('hdUpdateNow')?.addEventListener('click',hdForceUpdate);
  document.getElementById('hdUpdateLater')?.addEventListener('click',()=>hdSnoozeUpdate());
  document.getElementById('hdUpdateCheck')?.addEventListener('click',()=>{hdClearUpdateSnooze();hdCheckForUpdate(true);document.querySelector('.hd-header-more')?.removeAttribute('open')});
}
function hdUpdateEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdUpdateMasterChangeView(changes){
 if(!changes||changes.baseline)return null;
 const ships=changes.ships||{},eq=changes.equipment||{},ex=changes.exslot||{},picker=changes.picker||{};
 const shipCount=(ships.added?.length||0)+(ships.removed?.length||0)+(ships.changed?.length||0);
 const eqCount=(eq.added?.length||0)+(eq.removed?.length||0)+(eq.changed?.length||0);
 const parts=[];
 if(shipCount)parts.push(`艦娘 ${shipCount}件`);
 if(eq.added?.length)parts.push(`新装備 ${eq.added.length}件`);
 const eqOther=(eq.removed?.length||0)+(eq.changed?.length||0);if(eqOther)parts.push(`装備変更 ${eqOther}件`);
 const exCount=(ex.itemRulesChanged||0)+(ex.limitShipsChanged||0);if(exCount)parts.push(`増設ルール ${exCount}件`);
 if(picker.changed)parts.push('装備位置制限変更');
 const examples=[
  ...(ships.added||[]).map(x=>`艦追加: ${x}`),
  ...(ships.changed||[]).map(x=>`艦変更: ${x}`),
  ...(ships.removed||[]).map(x=>`艦削除: ${x}`),
  ...(eq.added||[]).map(x=>`装備追加: ${x}`),
  ...(eq.changed||[]).map(x=>`装備変更: ${x}`),
  ...(eq.removed||[]).map(x=>`装備削除: ${x}`)
 ].slice(0,8);
 if(!parts.length&&!examples.length)return null;
 return {summary:parts.join(' / '),examples};
}
async function hdCheckForUpdate(showResult=false){
  hdEnsureUpdateUI();const btn=document.getElementById('hdUpdateCheck'),updateBtn=document.getElementById('hdUpdateNow');
  try{
    if(btn){btn.disabled=true;const b=btn.querySelector('b');if(b)b.textContent='確認中…'}
    const latest=await hdFetchLatestVersion(),sourceBuild=Number(latest.sourceBuild||latest.build||0),publishedBuild=Number(latest.publishedBuild||0),sourceNewer=sourceBuild>HD_APP_BUILD,publishedNewer=publishedBuild>HD_APP_BUILD,banner=document.getElementById('hdUpdateBanner'),text=document.getElementById('hdUpdateText'),changes=document.getElementById('hdUpdateChanges');
    if(sourceNewer){
      document.querySelector('.hd-header-more')?.classList.add('has-update');
      const waiting=!publishedNewer;
      if(updateBtn){updateBtn.disabled=waiting;updateBtn.textContent=waiting?'公開反映待ち':'今すぐ更新'}
      if(text){
        if(waiting)text.textContent=`v${HD_APP_VERSION} → v${latest.sourceVersion||latest.version} はGitHub mainに到着済み。公開サイトへの反映待ちです。`;
        else{
          const lag=sourceBuild>publishedBuild?`｜最新版 v${latest.sourceVersion||latest.version} は公開反映待ち`:'';
          text.textContent=`v${HD_APP_VERSION} → 公開版 v${latest.publishedVersion||latest.version}${lag}${latest.notes?`｜${latest.notes}`:''}`;
        }
      }
      const master=hdUpdateMasterChangeView(latest.masterChanges);
      if(changes){
        if(master){changes.hidden=false;changes.innerHTML=`<b>艦これデータ更新</b><span>${hdUpdateEsc(master.summary)}</span>${master.examples.length?`<small>${master.examples.map(hdUpdateEsc).join(' / ')}</small>`:''}`}
        else{changes.hidden=true;changes.innerHTML=''}
      }
      if(banner)banner.hidden=!showResult&&hdUpdateSnoozed();
      if(showResult&&waiting)alert(`HarborDesk v${latest.sourceVersion||latest.version} はGitHub mainにあるけど、公開サイトはまだ v${latest.publishedVersion||HD_APP_VERSION}。公開反映待ちだよ。`)
    }else{
      document.querySelector('.hd-header-more')?.classList.remove('has-update');
      if(updateBtn){updateBtn.disabled=false;updateBtn.textContent='今すぐ更新'}
      if(banner)banner.hidden=true;
      if(changes){changes.hidden=true;changes.innerHTML=''}
      if(showResult)alert(`HarborDesk v${HD_APP_VERSION} は最新版だよ`)
    }
  }catch{if(showResult)alert('更新情報を確認できなかったよ。通信状態を確認してもう一度試してね。')}
  finally{if(btn){btn.disabled=false;const b=btn.querySelector('b');if(b)b.textContent='更新確認'}}
}
let HD_FORCE_UPDATE_BUSY=false;
async function hdForceUpdate(){
  if(HD_FORCE_UPDATE_BUSY)return false;
  HD_FORCE_UPDATE_BUSY=true;
  const btn=document.getElementById('hdUpdateNow');
  if(!navigator.onLine){HD_FORCE_UPDATE_BUSY=false;alert('オフライン中は更新できないよ。通信できる状態で試してね。');return false}
  try{
    const latest=await hdFetchLatestVersion();
    const sourceBuild=Number(latest.sourceBuild||latest.build||0),publishedBuild=Number(latest.publishedBuild||0);
    if(sourceBuild>HD_APP_BUILD&&publishedBuild<=HD_APP_BUILD){
      HD_FORCE_UPDATE_BUSY=false;
      if(btn){btn.disabled=true;btn.textContent='公開反映待ち'}
      alert(`v${latest.sourceVersion||latest.version} はGitHub mainにあるけど、公開サイトへの反映がまだだよ。反映後に更新できるようになる。`);
      return false;
    }
    if(btn){btn.disabled=true;btn.textContent='強制更新中…'}
    if(typeof hdWSPrepareUpdateReturn==='function')hdWSPrepareUpdateReturn();
    else{
      try{
        const state=JSON.parse(localStorage.getItem('harbordesk-workspace-tabs-v1')||'{}'),group=state.group||'',section=state.sections?.[group]||'';
        if(group&&section)sessionStorage.setItem('harbordesk-update-return-v1',JSON.stringify({group,section,at:Date.now()}));
      }catch{}
    }
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.filter(r=>String(r.scope||'').includes('/HarborDesk-PWA/')).map(async r=>{
        try{await r.update()}catch{}
        try{await r.unregister()}catch{}
      }));
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('harbordesk-pwa-')).map(k=>caches.delete(k)));
    }
  }catch{}
  const url=new URL(location.origin+location.pathname);
  url.searchParams.set('hd_update',String(HD_APP_BUILD));
  url.searchParams.set('_',Date.now().toString());
  location.assign(url.toString());
  setTimeout(()=>{try{location.reload()}catch{}},1200);
  return true;
}
document.addEventListener('click',e=>{
  if(e.target?.closest?.('#hdUpdateNow')){e.preventDefault();hdForceUpdate();return}
  if(e.target?.closest?.('#hdUpdateLater')){e.preventDefault();hdSnoozeUpdate();return}
  if(e.target?.closest?.('[data-hd-header-settings]')){
    document.querySelector('.hd-header-more')?.removeAttribute('open');
    if(typeof hdWSShowElement==='function')hdWSShowElement('diagnosticsCenter',true);
    else location.hash='diagnosticsCenter';
    return;
  }
  const menu=document.querySelector('.hd-header-more');
  if(menu?.open&&!e.target?.closest?.('.hd-header-more,.hd-mobile-header-menu-row'))menu.removeAttribute('open');
},true);
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  const menu=document.querySelector('.hd-header-more');if(!menu?.open)return;
  menu.removeAttribute('open');
  const summary=menu.querySelector(':scope > summary');try{summary?.focus({preventScroll:true})}catch{summary?.focus()}
});
window.addEventListener('load',()=>{
  hdEnsureServiceWorker();hdEnsureCurrentAssets().catch(()=>{});hdInitUpdateManagerUI();
  if(new URL(location.href).searchParams.has('hd_update')){
    setTimeout(()=>{try{history.replaceState(null,'',location.pathname+location.hash)}catch{}},500);
  }
  setTimeout(()=>hdCheckForUpdate(false),1200)
});