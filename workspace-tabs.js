const HD_WS_KEY='harbordesk-workspace-tabs-v1';
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
 home:new Set(['home','personalHomeCenter','dailyOpsCenter','dashboard','resources','resourceHistory','docks']),
 guide:new Set(['guide','eoTracker','sortieReadiness','eventOperationsCenter','eventOperations','landBasePlanner']),
 fleet:new Set(['shipDatabase','roster','trainingPlanner','customFleets','fleetCalculator','supportFleetPlanner']),
 quest:new Set(['questDatabase','quests','exerciseRoutine','activityLogger']),
 expedition:new Set(['expeditions']),
 arsenal:new Set(['equipmentBook','developmentRecipes','constructionDb','improvementWorkshop','materialPlanner']),
 records:new Set(['sortieLog','dropHunting','eventLog','rankingTracker','rankingTrackerCenter','farmAnalysis']),
 settings:new Set(['calculators','backup','diagnosticsCenter'])
};
let hdWSState=hdWSLoad();
let hdWSObserver=null;
let hdWSApplying=false;
let hdWSRefreshTimer=0;

function hdWSLoad(){try{const v=JSON.parse(localStorage.getItem(HD_WS_KEY)||'{}');return {group:v.group||'home',sections:v.sections||{}}}catch{return {group:'home',sections:{}}}}
function hdWSSave(){localStorage.setItem(HD_WS_KEY,JSON.stringify(hdWSState))}
function hdWSEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdWSTitle(el){return el?.querySelector(':scope > .section-head h2,:scope > .section-head h3,:scope > h2,:scope > h3')?.textContent?.trim()||el?.querySelector('h2,h3')?.textContent?.trim()||el?.id||'機能'}
function hdWSGroupForSection(el){
 const id=el.id||'';
 for(const [g,set] of Object.entries(HD_WS_EXPLICIT))if(set.has(id))return g;
 const text=`${id} ${hdWSTitle(el)} ${el.className||''}`.toLowerCase();
 if(/診断|設定|バックアップ|backup|diagnostic|計算ツール|calculator|about|概要/.test(text))return 'settings';
 if(/周回|掘り|戦果|記録|分析|ログ|sortie.?log|drop|ranking|event.?log/.test(text))return 'records';
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
 const rows=[...main.querySelectorAll('section')];
 for(const el of rows){
  if(!el.id){if(el.classList.contains('hero'))el.id='hdWorkspaceHero';else if(el.classList.contains('note'))el.id='hdWorkspaceAbout';else el.id=`hdWorkspaceSection${rows.indexOf(el)}`}
  if(el.id==='hdWorkspaceHero')el.dataset.hdWorkspaceGroup='home';
  else if(el.id==='hdWorkspaceAbout')el.dataset.hdWorkspaceGroup='settings';
  else el.dataset.hdWorkspaceGroup=hdWSGroupForSection(el);
 }
 return rows;
}
function hdWSVisibleSections(group){return hdWSSections().filter(el=>el.dataset.hdWorkspaceGroup===group&&el.id!=='hdWorkspaceHero')}
function hdWSResolveSection(group,preferred){const rows=hdWSVisibleSections(group);if(!rows.length)return null;if(preferred&&rows.some(x=>x.id===preferred))return preferred;const stored=hdWSState.sections?.[group];if(stored&&rows.some(x=>x.id===stored))return stored;const preferredIds={home:'home',guide:'guide',fleet:'roster',quest:'quests',expedition:'expeditions',arsenal:'equipmentBook',records:'sortieLog',settings:'diagnosticsCenter'};return rows.find(x=>x.id===preferredIds[group])?.id||rows[0].id}
function hdWSUpdateTopbarHeight(){const h=document.querySelector('.topbar')?.getBoundingClientRect().height||68;document.documentElement.style.setProperty('--hd-topbar-h',`${Math.ceil(h)}px`)}
function hdWSEnsureUI(){
 if(document.getElementById('hdWorkspaceNav'))return;
 const top=document.querySelector('.topbar');if(!top)return;
 const nav=document.createElement('div');nav.id='hdWorkspaceNav';nav.className='hd-ws-shell';nav.innerHTML=`<div class="hd-ws-primary" role="tablist" aria-label="HarborDeskカテゴリ">${HD_WS_GROUPS.map(g=>`<button type="button" role="tab" data-hd-ws-group="${g.key}">${g.label}</button>`).join('')}</div><div id="hdWorkspaceSubtabs" class="hd-ws-secondary" role="tablist" aria-label="カテゴリ内機能"></div>`;
 top.insertAdjacentElement('afterend',nav);document.body.classList.add('hd-workspace-mode');hdWSUpdateTopbarHeight();
}
function hdWSRenderSubtabs(group,selected){
 const host=document.getElementById('hdWorkspaceSubtabs');if(!host)return;const rows=hdWSVisibleSections(group);
 if(rows.length<=1){host.hidden=true;host.innerHTML='';return}
 host.hidden=false;host.innerHTML=rows.map(el=>`<button type="button" role="tab" class="${el.id===selected?'active':''}" aria-selected="${el.id===selected?'true':'false'}" data-hd-ws-section="${hdWSEsc(el.id)}">${hdWSEsc(hdWSTitle(el))}</button>`).join('');
 const active=host.querySelector('.active');active?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
function hdWSUpdateWrappers(){
 const wrap=document.getElementById('advancedToolsWrap');if(wrap){const sections=[...wrap.querySelectorAll(':scope > section')];wrap.classList.toggle('hd-ws-wrapper-hidden',sections.length>0&&sections.every(x=>x.classList.contains('hd-ws-hidden')))}
}
function hdWSApply(group=hdWSState.group,sectionId=null,opts={}){
 if(hdWSApplying)return;hdWSApplying=true;
 try{
  hdWSEnsureUI();hdWSSections();
  if(!HD_WS_GROUPS.some(x=>x.key===group))group='home';
  const chosen=hdWSResolveSection(group,sectionId);hdWSState.group=group;if(chosen)hdWSState.sections[group]=chosen;hdWSSave();
  document.querySelectorAll('[data-hd-ws-group]').forEach(b=>{const active=b.dataset.hdWsGroup===group;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
  for(const el of hdWSSections()){
   const same=el.dataset.hdWorkspaceGroup===group;
   const hero=el.id==='hdWorkspaceHero';
   const show=same&&(hero||!chosen||el.id===chosen);
   el.classList.toggle('hd-ws-hidden',!show);
  }
  hdWSRenderSubtabs(group,chosen);hdWSUpdateWrappers();
  document.getElementById('hdWorkspaceNav')?.querySelector(`[data-hd-ws-group="${group}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  if(opts.scrollTop){const y=(document.getElementById('hdWorkspaceNav')?.offsetTop||0)-2;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}
  window.dispatchEvent(new CustomEvent('hd:workspace-changed',{detail:{group,section:chosen}}));
 }finally{hdWSApplying=false}
}
function hdWSShowElement(target,scroll=true){
 const el=typeof target==='string'?document.getElementById(target):target;if(!el)return false;
 const section=el.closest('section');if(!section)return false;hdWSSections();const group=section.dataset.hdWorkspaceGroup||hdWSGroupForSection(section);hdWSApply(group,section.id);
 if(scroll)setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),40);return true;
}
function hdWSPatchQuickNav(){if(window.__hdWSQuickPatched||typeof window.hdQNJump!=='function')return;window.__hdWSQuickPatched=true;const old=window.hdQNJump;window.hdQNJump=function(id){const target=document.getElementById(id);if(target){hdWSShowElement(target,false);setTimeout(()=>old(id),30)}else old(id)}}
function hdWSHandleAnchor(a){const href=a?.getAttribute?.('href')||'';if(!href.startsWith('#')||href==='#')return false;let id='';try{id=decodeURIComponent(href.slice(1))}catch{id=href.slice(1)}const target=document.getElementById(id);if(!target)return false;hdWSShowElement(target,false);setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),30);return true}
function hdWSRefresh(){hdWSApply(hdWSState.group,hdWSState.sections?.[hdWSState.group]);hdWSPatchQuickNav()}
function hdWSMutationAddsSection(ms){return ms.some(m=>[...m.addedNodes].some(n=>n?.nodeType===1&&(n.matches?.('section')||n.querySelector?.('section'))))}
function hdWSScheduleRefresh(){clearTimeout(hdWSRefreshTimer);hdWSRefreshTimer=setTimeout(hdWSRefresh,60)}
function hdWSInstall(){
 hdWSEnsureUI();hdWSRefresh();
 if(!hdWSObserver){hdWSObserver=new MutationObserver(ms=>{if(hdWSMutationAddsSection(ms))hdWSScheduleRefresh()});const main=document.querySelector('main');if(main)hdWSObserver.observe(main,{childList:true,subtree:true})}
}

document.addEventListener('click',e=>{
 const g=e.target.closest?.('[data-hd-ws-group]');if(g){hdWSApply(g.dataset.hdWsGroup,null,{scrollTop:true});return}
 const s=e.target.closest?.('[data-hd-ws-section]');if(s){hdWSApply(hdWSState.group,s.dataset.hdWsSection,{scrollTop:true});return}
 const a=e.target.closest?.('a[href^="#"]');if(a&&hdWSHandleAnchor(a)){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}
},true);
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id)setTimeout(()=>hdWSShowElement(id,false),0)});
window.addEventListener('resize',hdWSUpdateTopbarHeight,{passive:true});
window.addEventListener('hd:modules-ready',()=>setTimeout(hdWSInstall,0));
window.addEventListener('load',()=>setTimeout(hdWSInstall,900));
setTimeout(hdWSInstall,1700);
