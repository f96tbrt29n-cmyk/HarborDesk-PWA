const HD_WS_KEY='harbordesk-workspace-tabs-v1';
const HD_WS_SCROLL_KEY='harbordesk-session-workspace-scroll-v1';
const HD_WS_GROUPS=[
 {key:'home',label:'ホーム'},
 {key:'guide',label:'攻略'},
 {key:'fleet',label:'艦隊'},
 {key:'quest',label:'任務'},
 {key:'expedition',label:'遠征'},
 {key:'arsenal',label:'工廠'},
 {key:'records',label:'記録'},
 {key:'settings',label:'設定'}
];
const HD_WS_EXPLICIT={
 home:new Set(['home','dailyOpsCenter','dashboard','resources','resourceHistory','docks','resourceBudget']),
 guide:new Set(['guide','hdSortiePreparation','hdFleetSuggester','eoTracker','sortieReadiness','eventOperationsCenter','eventOperations','grandOperations','landBasePlanner']),
 fleet:new Set(['shipDatabase','roster','shipProfilesPlus','trainingPlanner','customFleets','fleetCalculator','supportFleetPlanner']),
 quest:new Set(['questDatabase','quests','exerciseRoutine','activityLogger']),
 expedition:new Set(['expeditions','hdExpeditionDb','expeditionFleetManager','expeditionOptimizer']),
 arsenal:new Set(['equipmentBook','hdEquipAnalyzer','hdEquipmentProcurement','equipmentVariants','developmentLab','developmentRecipes','constructionDb','improvementWorkshop','optimizationImprovement','materialPlanner']),
 records:new Set(['sortieLog','sortieCostForecast','dropHunting','dropHuntingDb','farmingAnalytics','eventLog','rankingTracker','rankingTrackerCenter','farmAnalysis']),
 settings:new Set(['personalHomeCenter','calculators','backup','diagnosticsCenter','notificationCenter','dataQualityAudit'])
};
let hdWSState=hdWSLoad();
let hdWSObserver=null;
let hdWSApplying=false;
let hdWSRefreshTimer=0;
let hdWSNavLockUntil=0;
let hdWSNavSeq=0;
let hdWSPin={group:'',sectionId:'',until:0};
let hdWSTouch=null;
function hdWSSetPin(group,sectionId,ms=1600){hdWSPin={group,sectionId,until:Date.now()+ms}}
function hdWSClearPin(){hdWSPin={group:'',sectionId:'',until:0}}
function hdWSActivePin(){
 if(!hdWSPin.sectionId||Date.now()>=hdWSPin.until){if(hdWSPin.sectionId)hdWSClearPin();return null}
 return hdWSPin;
}

function hdWSLoad(){try{const v=JSON.parse(localStorage.getItem(HD_WS_KEY)||'{}');return {group:v.group||'home',sections:v.sections||{}}}catch{return {group:'home',sections:{}}}}
function hdWSSave(){localStorage.setItem(HD_WS_KEY,JSON.stringify(hdWSState))}
function hdWSScrollLoad(){try{return JSON.parse(sessionStorage.getItem(HD_WS_SCROLL_KEY)||'{}')||{}}catch{return {}}}
function hdWSSaveCurrentScroll(){
 const section=hdWSVisibleSections(hdWSState.group).find(x=>!x.classList.contains('hd-ws-hidden'));if(!section)return;
 const top=section.getBoundingClientRect().top+window.scrollY,offset=Math.max(0,Math.round(window.scrollY-top));
 const all=hdWSScrollLoad();all[section.id]=offset;try{sessionStorage.setItem(HD_WS_SCROLL_KEY,JSON.stringify(all))}catch{}
}
function hdWSRestoreScroll(sectionId){
 const section=document.getElementById(sectionId),saved=Number(hdWSScrollLoad()[sectionId]);if(!section||!Number.isFinite(saved))return false;
 const top=section.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:Math.max(0,top+saved),behavior:'auto'});return true;
}
function hdWSEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdWSJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdWSSyncInfo(){
 const sync=hdWSJson('harbordesk-kancolle-sync-v1',null);
 if(!sync?.syncedAt)return {sync:null,state:'missing',label:'未同期',detail:'ゲームデータ未同期'};
 const age=Math.max(0,Date.now()-Number(sync.syncedAt||0));
 let label='たった今';
 if(age>=86400000)label=Math.floor(age/86400000)+'日前';
 else if(age>=3600000)label=Math.floor(age/3600000)+'時間前';
 else if(age>=60000)label=Math.floor(age/60000)+'分前';
 return {sync,state:age>21600000?'stale':'fresh',label,detail:`艦娘 ${Number(sync.ships)||0} / 装備 ${Number(sync.equipment)||0} / 艦隊 ${Number(sync.decks)||0}`};
}
function hdWSEnsureNetworkStatus(){
 if(document.getElementById('hdNetworkStatus'))return;
 const bar=document.createElement('div');bar.id='hdNetworkStatus';bar.className='hd-network-status';bar.hidden=true;
 bar.innerHTML='<span aria-hidden="true">◌</span><b>オフライン</b><small>更新確認・艦これ同期は通信復帰後に使えるよ</small>';
 const nav=document.getElementById('hdWorkspaceNav');nav?nav.insertAdjacentElement('afterend',bar):document.body.prepend(bar);
 hdWSUpdateNetworkStatus();
}
function hdWSUpdateNetworkStatus(){
 const bar=document.getElementById('hdNetworkStatus');if(!bar)return;
 const online=navigator.onLine!==false;bar.hidden=online;document.body.classList.toggle('hd-offline',!online);
 if(online&&window.hdToast&&bar.dataset.wasOffline==='1')window.hdToast('オンラインに戻ったよ','info',1400);
 bar.dataset.wasOffline=online?'0':'1';
}
function hdWSEnsureSyncStatus(){
 if(document.getElementById('hdGlobalSyncStatus'))return;
 const top=document.querySelector('.topbar');if(!top)return;
 const btn=document.createElement('button');btn.id='hdGlobalSyncStatus';btn.type='button';btn.className='hd-global-sync-status';btn.innerHTML='<span>同期</span><b>確認中</b>';
 btn.addEventListener('click',()=>{if(typeof hdWSShowElement==='function'&&hdWSShowElement('kancolleImport',true))return;document.getElementById('kancolleImport')?.scrollIntoView({behavior:'smooth',block:'start'})});
 const anchor=top.querySelector('.hd-header-more')||top.querySelector('#notifyBtn');
 if(anchor&&anchor.parentElement===top)top.insertBefore(btn,anchor);else top.appendChild(btn);
 hdWSUpdateSyncStatus();
}
function hdWSUpdateSyncStatus(){
 const btn=document.getElementById('hdGlobalSyncStatus');if(!btn)return;
 const info=hdWSSyncInfo();btn.classList.remove('fresh','stale','missing');btn.classList.add(info.state);
 btn.innerHTML=`<span>ゲーム同期</span><b>${hdWSEsc(info.label)}</b>`;
 btn.title=info.detail;btn.setAttribute('aria-label',`ゲーム同期 ${info.label}。タップで同期画面を開く`);
}
function hdWSTitle(el){return el?.querySelector(':scope > .section-head h2,:scope > .section-head h3,:scope > h2,:scope > h3')?.textContent?.trim()||el?.querySelector('h2,h3')?.textContent?.trim()||el?.id||'機能'}
function hdWSGroupForSection(el){
 const id=el.id||'';
 for(const [g,set] of Object.entries(HD_WS_EXPLICIT))if(set.has(id))return g;
 const text=`${id} ${hdWSTitle(el)} ${el.className||''}`.toLowerCase();
 if(/診断|設定|通知|監査|データ品質|バックアップ|backup|diagnostic|計算ツール|calculator|about|概要/.test(text))return 'settings';
 if(/周回|掘り|戦果|記録|分析|ログ|予測|sortie.?log|drop|ranking|event.?log/.test(text))return 'records';
 if(/装備|工廠|開発|建造|改修|素材|equipment|development|construction|improvement|material/.test(text))return 'arsenal';
 if(/遠征|expedition/.test(text))return 'expedition';
 if(/任務|演習|activity|quest|exercise/.test(text))return 'quest';
 if(/艦隊|艦娘|育成|編成|fleet|roster|ship|training|support/.test(text))return 'fleet';
 if(/攻略|海域|出撃前|基地航空|eo|map|sortie|operation/.test(text))return 'guide';
 if(/ホーム|司令|資源|入渠|home|dashboard|resource|dock/.test(text))return 'home';
 return 'home';
}
function hdWSSections(){
 const main=document.querySelector('main');if(!main)return [];
 const all=[...main.querySelectorAll('section')];
 const rows=all.filter(el=>!el.parentElement?.closest('section'));
 for(const el of rows){
  if(!el.id){if(el.classList.contains('hero'))el.id='hdWorkspaceHero';else if(el.classList.contains('note'))el.id='hdWorkspaceAbout';else el.id=`hdWorkspaceSection${all.indexOf(el)}`}
  if(el.id==='hdWorkspaceHero')el.dataset.hdWorkspaceGroup='home';
  else if(el.id==='hdWorkspaceAbout')el.dataset.hdWorkspaceGroup='settings';
  else el.dataset.hdWorkspaceGroup=hdWSGroupForSection(el);
 }
 return rows;
}
function hdWSManagedSectionFor(el){
 if(!el)return null;const rows=hdWSSections();let section=el.closest?.('section')||null;
 while(section){if(rows.includes(section))return section;section=section.parentElement?.closest('section')||null}
 return null;
}
function hdWSVisibleSections(group){return hdWSSections().filter(el=>el.dataset.hdWorkspaceGroup===group&&el.id!=='hdWorkspaceHero')}
function hdWSDefaultSection(group){
 const rows=hdWSVisibleSections(group),preferredIds={home:'home',guide:'guide',fleet:'roster',quest:'quests',expedition:'expeditions',arsenal:'equipmentBook',records:'sortieLog',settings:'diagnosticsCenter'};
 return rows.find(x=>x.id===preferredIds[group])?.id||rows[0]?.id||null;
}
function hdWSGroupLabel(group){return HD_WS_GROUPS.find(x=>x.key===group)?.label||group}
function hdWSResolveSection(group,preferred){const rows=hdWSVisibleSections(group);if(!rows.length)return null;if(preferred&&rows.some(x=>x.id===preferred))return preferred;const stored=hdWSState.sections?.[group];if(stored&&rows.some(x=>x.id===stored))return stored;return hdWSDefaultSection(group)}
function hdWSUpdateTopbarHeight(){
 const h=document.querySelector('.topbar')?.getBoundingClientRect().height||68,nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect().height||0;
 document.documentElement.style.setProperty('--hd-topbar-h',`${Math.ceil(h)}px`);
 document.documentElement.style.setProperty('--hd-workspace-nav-h',`${Math.ceil(nav)}px`);
}
function hdWSBadgeCounts(){
 const now=Date.now();let expeditions=0,docks=0,quests=0,construction=0,errors=0;
 try{if(typeof state!=='undefined'){
  expeditions=(state.expeditions||[]).filter(x=>Number(x.endsAt)>now).length;
  docks=(state.docks||[]).filter(x=>Number(x.endsAt)>now).length;
  quests=(state.quests||[]).filter(x=>!x.done).length;
 }}catch{}
 const builds=hdWSJson('harbordesk-construction-timers-v1',[]);if(Array.isArray(builds))construction=builds.filter(x=>Number(x.endsAt||x.endAt||x.finishAt)>now).length;
 try{errors=Object.values(window.HD_MODULE_STATUS||{}).filter(x=>x==='error').length}catch{}
 return {home:docks+construction,guide:0,fleet:0,quest:quests,expedition:expeditions,arsenal:0,records:0,settings:errors};
}
function hdWSUpdateBadges(){const counts=hdWSBadgeCounts();for(const g of HD_WS_GROUPS){const b=document.querySelector(`[data-hd-ws-group="${g.key}"]`),badge=b?.querySelector('[data-hd-ws-badge]');if(!badge)continue;const n=Number(counts[g.key])||0;badge.textContent=n>99?'99+':String(n);badge.hidden=n<=0;b?.classList.toggle('has-badge',n>0)}}
function hdWSEnsureUI(){
 if(document.getElementById('hdWorkspaceNav'))return;
 const top=document.querySelector('.topbar');if(!top)return;
 const nav=document.createElement('div');nav.id='hdWorkspaceNav';nav.className='hd-ws-shell';nav.innerHTML=`<div class="hd-ws-primary" role="tablist" aria-label="HarborDeskカテゴリ">${HD_WS_GROUPS.map(g=>`<button type="button" role="tab" data-hd-ws-group="${g.key}"><span>${g.label}</span><em data-hd-ws-badge hidden>0</em></button>`).join('')}</div><div id="hdWorkspaceMobilePicker" class="hd-ws-mobile-picker" hidden><span id="hdWorkspaceContextGroup">ホーム</span><select id="hdWorkspaceSectionSelect" aria-label="カテゴリ内機能"></select><button type="button" class="ghost small" data-hd-ws-group-top>先頭</button></div><div id="hdWorkspaceSubtabs" class="hd-ws-secondary" role="tablist" aria-label="カテゴリ内機能"></div>`;
 top.insertAdjacentElement('afterend',nav);document.body.classList.add('hd-workspace-mode');hdWSEnsureSyncStatus();hdWSEnsureNetworkStatus();hdWSUpdateTopbarHeight();hdWSUpdateBadges();hdWSUpdateSyncStatus();
}
function hdWSRenderSubtabs(group,selected){
 const host=document.getElementById('hdWorkspaceSubtabs'),picker=document.getElementById('hdWorkspaceMobilePicker'),select=document.getElementById('hdWorkspaceSectionSelect'),context=document.getElementById('hdWorkspaceContextGroup');if(!host)return;const rows=hdWSVisibleSections(group);
 if(context)context.textContent=hdWSGroupLabel(group);
 if(select){select.innerHTML=rows.map(el=>`<option value="${hdWSEsc(el.id)}">${hdWSEsc(hdWSTitle(el))}</option>`).join('');if(selected)select.value=selected}
 if(picker)picker.hidden=rows.length===0;
 if(rows.length<=1){host.hidden=true;host.innerHTML='';return}
 host.hidden=false;host.innerHTML=rows.map(el=>`<button type="button" role="tab" class="${el.id===selected?'active':''}" aria-selected="${el.id===selected?'true':'false'}" data-hd-ws-section="${hdWSEsc(el.id)}">${hdWSEsc(hdWSTitle(el))}</button>`).join('');
 const active=host.querySelector('.active');active?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
 requestAnimationFrame(hdWSUpdateTopbarHeight);
}
function hdWSUpdateWrappers(){
 const wrap=document.getElementById('advancedToolsWrap');if(wrap){const sections=[...wrap.querySelectorAll(':scope > section')];wrap.classList.toggle('hd-ws-wrapper-hidden',sections.length>0&&sections.every(x=>x.classList.contains('hd-ws-hidden')))}
}
function hdWSUnhideAncestors(el){for(let p=el?.parentElement;p&&p!==document.body;p=p.parentElement){if(p.classList?.contains('hd-ws-wrapper-hidden'))p.classList.remove('hd-ws-wrapper-hidden')}}
function hdWSApply(group=hdWSState.group,sectionId=null,opts={}){
 if(!opts.preserveNavSeq)hdWSNavSeq++;
 if(hdWSApplying)return;hdWSApplying=true;
 try{
  hdWSEnsureUI();hdWSSections();
  const pin=!opts.ignorePin?hdWSActivePin():null;
  if(pin){group=pin.group;sectionId=pin.sectionId}
  if(!HD_WS_GROUPS.some(x=>x.key===group))group='home';
  const chosen=hdWSResolveSection(group,sectionId);hdWSState.group=group;if(chosen)hdWSState.sections[group]=chosen;hdWSSave();
  document.querySelectorAll('[data-hd-ws-group]').forEach(b=>{const active=b.dataset.hdWsGroup===group;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
  for(const el of hdWSSections()){
   const same=el.dataset.hdWorkspaceGroup===group;
   const hero=el.id==='hdWorkspaceHero';
   const show=same&&(hero||!chosen||el.id===chosen);
   el.classList.toggle('hd-ws-hidden',!show);
  }
  hdWSRenderSubtabs(group,chosen);hdWSUpdateWrappers();hdWSUpdateBadges();
  document.getElementById('hdWorkspaceNav')?.querySelector(`[data-hd-ws-group="${group}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  if(opts.restoreScroll){setTimeout(()=>{if(!hdWSRestoreScroll(chosen)){const y=(document.getElementById('hdWorkspaceNav')?.offsetTop||0)-2;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}},0)}
  else if(opts.scrollTop){const y=(document.getElementById('hdWorkspaceNav')?.offsetTop||0)-2;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}
  window.dispatchEvent(new CustomEvent('hd:workspace-changed',{detail:{group,section:chosen}}));
 }finally{hdWSApplying=false}
}
function hdWSShowElement(target,scroll=true){
 hdWSSaveCurrentScroll();
 const el=typeof target==='string'?document.getElementById(target):target;if(!el)return false;
 const section=hdWSManagedSectionFor(el);if(!section)return false;
 const group=section.dataset.hdWorkspaceGroup||hdWSGroupForSection(section);
 clearTimeout(hdWSRefreshTimer);
 hdWSNavLockUntil=Date.now()+900;hdWSSetPin(group,section.id,900);const navSeq=++hdWSNavSeq;
 const showNow=()=>{
  if(navSeq!==hdWSNavSeq)return false;
  hdWSState.group=group;hdWSState.sections[group]=section.id;hdWSSave();
  document.querySelectorAll('[data-hd-ws-group]').forEach(b=>{const active=b.dataset.hdWsGroup===group;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
  for(const row of hdWSSections()){
   const same=row.dataset.hdWorkspaceGroup===group,hero=row.id==='hdWorkspaceHero';
   row.classList.toggle('hd-ws-hidden',!(same&&(hero||row.id===section.id)));
  }
  section.classList.remove('hd-ws-hidden');hdWSUnhideAncestors(section);
  hdWSRenderSubtabs(group,section.id);hdWSUpdateWrappers();hdWSUpdateBadges();
  return true;
 };
 showNow();
 if(!hdWSApplying)hdWSApply(group,section.id,{preserveNavSeq:true});
 showNow();
 if(scroll)el.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>{if(navSeq===hdWSNavSeq){showNow();hdWSScheduleRefresh()}},120);
 return true;
}
function hdWSPatchQuickNav(){
 window.__hdWSQuickPatched=true;
}
function hdWSHandleAnchor(a){const href=a?.getAttribute?.('href')||'';if(!href.startsWith('#')||href==='#')return false;let id='';try{id=decodeURIComponent(href.slice(1))}catch{id=href.slice(1)}const target=document.getElementById(id);if(!target)return false;hdWSShowElement(target,false);setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),70);return true}
function hdWSRefresh(){if(Date.now()<hdWSNavLockUntil){hdWSScheduleRefresh();return}hdWSApply(hdWSState.group,hdWSState.sections?.[hdWSState.group]);hdWSPatchQuickNav();hdWSUpdateBadges()}
function hdWSMutationAddsSection(ms){return ms.some(m=>[...m.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('section')||n.querySelector?.('section'))))}
function hdWSScheduleRefresh(){clearTimeout(hdWSRefreshTimer);const delay=Math.max(60,hdWSNavLockUntil-Date.now()+20);hdWSRefreshTimer=setTimeout(hdWSRefresh,delay)}
function hdWSInstall(){
 hdWSEnsureUI();hdWSRefresh();
 if(!hdWSObserver){hdWSObserver=new MutationObserver(ms=>{if(hdWSMutationAddsSection(ms))hdWSScheduleRefresh()});const main=document.querySelector('main');if(main)hdWSObserver.observe(main,{childList:true,subtree:true})}
}
function hdWSHorizontalScroller(el){for(let n=el;n&&n!==document.body;n=n.parentElement){if(n.scrollWidth>n.clientWidth+12){const s=getComputedStyle(n);if(['auto','scroll'].includes(s.overflowX))return true}}return false}
function hdWSSwipeBlocked(target){return !!target?.closest?.('input,textarea,select,button,a,dialog,[contenteditable="true"],.hd-ws-primary,.hd-ws-secondary')||hdWSHorizontalScroller(target)}
function hdWSMoveGroup(dir){const i=HD_WS_GROUPS.findIndex(x=>x.key===hdWSState.group),next=HD_WS_GROUPS[i+dir];if(!next)return false;hdWSSaveCurrentScroll();hdWSClearPin();hdWSApply(next.key,null,{restoreScroll:true,ignorePin:true});return true}
function hdWSTouchStart(e){if(e.touches?.length!==1||hdWSSwipeBlocked(e.target))return;const t=e.touches[0];if(t.clientX<24||t.clientX>window.innerWidth-24)return;hdWSTouch={x:t.clientX,y:t.clientY,at:Date.now()}}
function hdWSTouchEnd(e){if(!hdWSTouch)return;const t=e.changedTouches?.[0],start=hdWSTouch;hdWSTouch=null;if(!t)return;const dx=t.clientX-start.x,dy=t.clientY-start.y,dt=Date.now()-start.at;if(dt>800||Math.abs(dx)<72||Math.abs(dx)<Math.abs(dy)*1.35)return;hdWSMoveGroup(dx<0?1:-1)}

document.addEventListener('click',e=>{
 const top=e.target.closest?.('[data-hd-ws-group-top]');if(top){hdWSSaveCurrentScroll();hdWSClearPin();const target=hdWSDefaultSection(hdWSState.group);hdWSApply(hdWSState.group,target,{scrollTop:true,ignorePin:true});return}
 const g=e.target.closest?.('[data-hd-ws-group]');if(g){hdWSSaveCurrentScroll();hdWSClearPin();hdWSApply(g.dataset.hdWsGroup,null,{restoreScroll:true,ignorePin:true});return}
 const s=e.target.closest?.('[data-hd-ws-section]');if(s){hdWSSaveCurrentScroll();hdWSClearPin();hdWSApply(hdWSState.group,s.dataset.hdWsSection,{restoreScroll:true,ignorePin:true});return}
 const a=e.target.closest?.('a[href^="#"]');if(a&&hdWSHandleAnchor(a)){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}
},true);
document.addEventListener('change',e=>{
 const select=e.target.closest?.('#hdWorkspaceSectionSelect');if(!select)return;
 hdWSSaveCurrentScroll();hdWSClearPin();hdWSApply(hdWSState.group,select.value,{restoreScroll:true,ignorePin:true});
});
document.addEventListener('touchstart',hdWSTouchStart,{passive:true});
document.addEventListener('touchend',hdWSTouchEnd,{passive:true});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id)setTimeout(()=>hdWSShowElement(id,false),0)});
window.addEventListener('resize',hdWSUpdateTopbarHeight,{passive:true});
window.addEventListener('storage',e=>{hdWSUpdateBadges();if(!e||e.key==='harbordesk-kancolle-sync-v1')hdWSUpdateSyncStatus()});
window.addEventListener('hd:kancolle-sync',hdWSUpdateSyncStatus);
window.addEventListener('online',hdWSUpdateNetworkStatus);
window.addEventListener('offline',hdWSUpdateNetworkStatus);
window.addEventListener('hd:modules-ready',()=>setTimeout(hdWSInstall,0));
window.addEventListener('hd:workspace-refresh',hdWSUpdateBadges);
window.addEventListener('load',()=>setTimeout(hdWSInstall,900));
setInterval(hdWSUpdateBadges,10000);
setInterval(hdWSUpdateSyncStatus,60000);
setTimeout(hdWSInstall,1700);