const HD_APP_VERSION='1.0.61';
const HD_APP_BUILD=61;
window.HD_MODULE_STATUS=window.HD_MODULE_STATUS||{};
window.HD_SERVICE_WORKER_STATUS='idle';

async function hdEnsureServiceWorker(){
  if(!('serviceWorker' in navigator)){window.HD_SERVICE_WORKER_STATUS='unsupported';return null}
  try{
    window.HD_SERVICE_WORKER_STATUS='registering';
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
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

async function hdFetchLatestVersion(){
  const res=await fetch(`./app-version.json?t=${Date.now()}`,{cache:'no-store'});
  if(!res.ok)throw new Error('version fetch failed');
  return res.json();
}

function hdAppendStyle(attr,href){
  if(document.querySelector(`link[${attr}]`))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(attr,'1');document.head.appendChild(link);
}
function hdLoadScript(attr,src){
  return new Promise(resolve=>{
    const old=document.querySelector(`script[${attr}]`);
    if(old){
      if(old.dataset.hdLoaded==='1'){window.HD_MODULE_STATUS[src]='ok';resolve(true);return}
      old.addEventListener('load',()=>{old.dataset.hdLoaded='1';window.HD_MODULE_STATUS[src]='ok';resolve(true)},{once:true});
      old.addEventListener('error',()=>{window.HD_MODULE_STATUS[src]='error';resolve(false)},{once:true});
      return;
    }
    const script=document.createElement('script');script.src=src;script.async=false;script.setAttribute(attr,'1');window.HD_MODULE_STATUS[src]='loading';
    script.onload=()=>{script.dataset.hdLoaded='1';window.HD_MODULE_STATUS[src]='ok';resolve(true)};
    script.onerror=()=>{window.HD_MODULE_STATUS[src]='error';resolve(false)};
    document.body.appendChild(script);
  });
}
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
  try{if(typeof hdWSInstall==='function')hdWSInstall()}catch{}
  window.dispatchEvent(new CustomEvent('hd:modules-ready',{detail:{status:{...window.HD_MODULE_STATUS}}}));
}
async function hdLoadCurrentAssets(){
  [
   ['data-hd-sortie-ready','./sortie-readiness.css'],['data-hd-land-base','./land-base-planner.css'],['data-hd-fleet-calc','./fleet-calculator.css'],
   ['data-hd-exp-fleet','./expedition-fleet-manager.css'],['data-hd-exp-stats','./expedition-stats-extension.css'],['data-hd-support-fleet','./support-fleet-planner.css'],
   ['data-hd-quest-progress','./quest-progress-extension.css'],['data-hd-command-center','./command-center.css'],['data-hd-resource-budget','./resource-budget.css'],
   ['data-hd-exercise-routine','./exercise-routine.css'],['data-hd-activity-logger','./activity-logger.css'],['data-hd-sortie-log','./sortie-log.css'],
   ['data-hd-grand-ops','./grand-operations.css'],['data-hd-quick-nav','./quick-nav.css'],['data-hd-personal-home','./personal-home.css'],['data-hd-global-search','./global-search.css'],
   ['data-hd-workspace-tabs','./workspace-tabs.css']
  ].forEach(([a,h])=>hdAppendStyle(a,h));

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
  const optimizeP=Promise.all([expP,sortieLogP]).then(()=>hdLoadScript('data-hd-optimization','./optimization-tools.js'));
  const dailyP=Promise.all([commandP,exerciseP,eventP,optimizeP,sortieLogP,landP,fleetP]).then(()=>hdLoadScript('data-hd-daily-ops','./daily-ops.js'));
  const stabilityP=Promise.all([sortieP,landP,fleetP,expP,eventP,optimizeP,dailyP]).then(()=>hdLoadScript('data-hd-stability','./stability-integration.js'));
  const mapRuntimeP=Promise.all([stabilityP,sortieP,landP,fleetP,expP]).then(()=>hdLoadScript('data-hd-map-runtime','./map-runtime.js'));
  const quickNavP=Promise.all([eventP,optimizeP,dailyP]).then(()=>hdLoadScript('data-hd-quick-nav','./quick-nav.js'));
  const personalHomeP=Promise.all([quickNavP,dailyP,stabilityP]).then(()=>hdLoadScript('data-hd-personal-home','./personal-home.js'));
  const globalSearchP=Promise.all([quickNavP,personalHomeP,questP,expP]).then(()=>hdLoadScript('data-hd-global-search','./global-search.js'));
  const workspaceP=Promise.all([globalSearchP,mapRuntimeP,personalHomeP]).then(()=>hdLoadScript('data-hd-workspace-tabs','./workspace-tabs.js'));
  const workspaceCompatP=workspaceP.then(()=>hdLoadScript('data-hd-workspace-compat','./workspace-compat.js'));

  await Promise.all([sortieP,landP,fleetP,questP,commandP,eventP,expP,resourceP,exerciseP,guardP,activityP,sortieLogP,optimizeP,dailyP,stabilityP,mapRuntimeP,quickNavP,personalHomeP,globalSearchP,workspaceP,workspaceCompatP]);
  hdInitLoadedModules();
}

function hdEnsureUpdateUI(){
  if(document.getElementById('hdUpdateBanner'))return;
  const banner=document.createElement('div');banner.id='hdUpdateBanner';banner.className='hd-update-banner';banner.hidden=true;
  banner.innerHTML=`<div><strong>HarborDeskの最新版があります</strong><div id="hdUpdateText" class="muted"></div></div><button id="hdUpdateNow" class="primary small">今すぐ更新</button>`;
  document.body.appendChild(banner);
  const header=document.querySelector('.topbar');
  if(header&&!document.getElementById('hdUpdateCheck')){const controls=document.createElement('div');controls.className='hd-version-controls';controls.innerHTML=`<span class="hd-version-badge">v${HD_APP_VERSION}</span><button id="hdUpdateCheck" class="ghost small">更新確認</button>`;header.appendChild(controls)}
  document.getElementById('hdUpdateNow')?.addEventListener('click',hdForceUpdate);
  document.getElementById('hdUpdateCheck')?.addEventListener('click',()=>hdCheckForUpdate(true));
}
async function hdCheckForUpdate(showResult=false){
  hdEnsureUpdateUI();const btn=document.getElementById('hdUpdateCheck');
  try{
    if(btn){btn.disabled=true;btn.textContent='確認中…'}
    const latest=await hdFetchLatestVersion(),newer=Number(latest.build||0)>HD_APP_BUILD,banner=document.getElementById('hdUpdateBanner'),text=document.getElementById('hdUpdateText');
    if(newer){if(text)text.textContent=`v${HD_APP_VERSION} → v${latest.version}${latest.notes?`｜${latest.notes}`:''}`;if(banner)banner.hidden=false}
    else{if(banner)banner.hidden=true;if(showResult)alert(`HarborDesk v${HD_APP_VERSION} は最新版だよ`)}
  }catch{if(showResult)alert('更新情報を確認できなかったよ。通信状態を確認してもう一度試してね。')}
  finally{if(btn){btn.disabled=false;btn.textContent='更新確認'}}
}
async function hdForceUpdate(){
  const btn=document.getElementById('hdUpdateNow');
  if(!navigator.onLine){alert('オフライン中はアプリキャッシュを再構築できないよ。通信できる状態で「更新確認」または「キャッシュ再構築」を使ってね。');return false}
  try{
    if(btn){btn.disabled=true;btn.textContent='更新中…'}
    if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}
    const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('harbordesk-pwa-')).map(k=>caches.delete(k)));
  }catch{}
  const url=new URL(location.href);url.searchParams.set('v',Date.now().toString());location.replace(url.toString());
}
window.addEventListener('load',()=>{hdEnsureServiceWorker();hdLoadCurrentAssets().catch(()=>{});hdEnsureUpdateUI();setTimeout(()=>hdCheckForUpdate(false),1200)});