const HD_WS_KEY='harbordesk-workspace-tabs-v1';
const HD_WS_SCROLL_KEY='harbordesk-session-workspace-scroll-v1';
const HD_WS_UPDATE_RETURN_KEY='harbordesk-update-return-v1';
const HD_WS_HISTORY_KEY='harbordesk-session-workspace-history-v1';
const HD_WS_SWIPE_HINT_KEY='harbordesk-workspace-swipe-hint-v1';
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
function hdWSHistoryLoad(){try{return JSON.parse(sessionStorage.getItem(HD_WS_HISTORY_KEY)||'[]')||[]}catch{return []}}
function hdWSHistorySave(rows){try{sessionStorage.setItem(HD_WS_HISTORY_KEY,JSON.stringify(rows.slice(-20)))}catch{}}
function hdWSCurrentLocation(){const group=hdWSState.group,section=hdWSState.sections?.[group]||hdWSDefaultSection(group);return section?{group,section}:null}
function hdWSPushHistory(){
 hdWSSaveCurrentScroll();const cur=hdWSCurrentLocation();if(!cur)return;
 const rows=hdWSHistoryLoad(),last=rows[rows.length-1];
 if(last?.group===cur.group&&last?.section===cur.section)return;
 rows.push(cur);hdWSHistorySave(rows);hdWSUpdateBackButton();
}
function hdWSUpdateBackButton(){const b=document.querySelector('[data-hd-ws-back]');if(b)b.disabled=hdWSHistoryLoad().length===0}
function hdWSGoBack(){
 const rows=hdWSHistoryLoad();let prev=null;
 while(rows.length&&!prev){const x=rows.pop(),el=document.getElementById(x?.section||'');if(x&&el)prev=x}
 hdWSHistorySave(rows);hdWSUpdateBackButton();if(!prev)return false;
 hdWSSaveCurrentScroll();hdWSClearPin();hdWSApply(prev.group,prev.section,{restoreScroll:true,ignorePin:true});return true;
}
function hdWSSaveCurrentScroll(){
 const section=hdWSVisibleSections(hdWSState.group).find(x=>!x.classList.contains('hd-ws-hidden'));if(!section)return;
 const top=section.getBoundingClientRect().top+window.scrollY,offset=Math.max(0,Math.round(window.scrollY-top));
 const all=hdWSScrollLoad();all[section.id]=offset;try{sessionStorage.setItem(HD_WS_SCROLL_KEY,JSON.stringify(all))}catch{}
}
function hdWSPrepareUpdateReturn(){
 hdWSSaveCurrentScroll();
 const loc=hdWSCurrentLocation();if(!loc)return false;
 try{sessionStorage.setItem(HD_WS_UPDATE_RETURN_KEY,JSON.stringify({...loc,at:Date.now()}));return true}catch{return false}
}
function hdWSConsumeUpdateReturn(){
 let saved=null;try{saved=JSON.parse(sessionStorage.getItem(HD_WS_UPDATE_RETURN_KEY)||'null')}catch{}
 try{sessionStorage.removeItem(HD_WS_UPDATE_RETURN_KEY)}catch{}
 if(!saved?.section||!saved?.group||Date.now()-Number(saved.at||0)>10*60*1000)return false;
 if(!document.getElementById(saved.section))return false;
 hdWSClearPin();hdWSApply(saved.group,saved.section,{restoreScroll:true,ignorePin:true});
 return true;
}
let hdWSStartupContextHandled=false;
function hdWSOpenAnchorId(id,scroll=true){
 id=String(id||'').trim();if(!id||id.startsWith('kcimport='))return false;
 const el=document.getElementById(id);if(!el)return false;
 const section=hdWSManagedSectionFor(el);if(!section)return false;
 const group=section.dataset.hdWorkspaceGroup||hdWSGroupForSection(section);
 hdWSClearPin();hdWSApply(group,section.id,{ignorePin:true});
 if(scroll)setTimeout(()=>el.scrollIntoView({behavior:'auto',block:'start'}),0);
 return true;
}
function hdWSInitialAnchorId(){
 const raw=String(location.hash||'').replace(/^#/,'');if(!raw||raw.startsWith('kcimport='))return '';
 try{return decodeURIComponent(raw)}catch{return raw}
}
function hdWSReflectLocationHash(sectionId){
 sectionId=String(sectionId||'').trim();if(!sectionId||!hdWSStartupContextHandled)return false;
 const hash='#'+encodeURIComponent(sectionId);if(location.hash===hash)return true;
 try{history.replaceState(null,'',location.pathname+location.search+hash);return true}catch{return false}
}
function hdWSCurrentShareUrl(){
 const id=hdWSCurrentSectionId();if(id)hdWSReflectLocationHash(id);
 return location.origin+location.pathname+location.search+location.hash;
}
async function hdWSShareCurrentLocation(){
 const url=hdWSCurrentShareUrl(),section=document.getElementById(hdWSCurrentSectionId()),title=section?hdWSTitle(section):'HarborDesk';
 document.querySelector('.hd-header-more')?.removeAttribute('open');
 try{
  if(typeof navigator.share==='function'){await navigator.share({title:`HarborDesk - ${title}`,text:title,url});return true}
 }catch(err){if(err?.name==='AbortError')return false}
 try{
  await navigator.clipboard.writeText(url);
  window.hdToast?.('この画面のリンクをコピーしたよ','success',1500);
  return true;
 }catch{}
 try{prompt('この画面のリンクをコピーしてね',url);return true}catch{return false}
}
function hdWSRestoreStartupContext(){
 if(hdWSStartupContextHandled)return false;hdWSStartupContextHandled=true;
 const anchor=hdWSInitialAnchorId();
 if(anchor&&hdWSOpenAnchorId(anchor,true)){try{sessionStorage.removeItem(HD_WS_UPDATE_RETURN_KEY)}catch{}hdWSReflectLocationHash(hdWSCurrentSectionId());return true}
 if(hdWSConsumeUpdateReturn()){hdWSReflectLocationHash(hdWSCurrentSectionId());return true}
 const id=hdWSCurrentSectionId(),restored=!!id&&hdWSRestoreScroll(id);if(id)hdWSReflectLocationHash(id);return restored;
}

function hdWSRestoreScroll(sectionId){
 const section=document.getElementById(sectionId),saved=Number(hdWSScrollLoad()[sectionId]);if(!section||!Number.isFinite(saved))return false;
 const top=section.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:Math.max(0,top+saved),behavior:'auto'});return true;
}
function hdWSEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdWSQuickPinIds(){try{return JSON.parse(localStorage.getItem('harbordesk-quick-nav-pins-v1')||'[]')||[]}catch{return []}}
function hdWSCurrentSectionId(){return hdWSState.sections?.[hdWSState.group]||hdWSDefaultSection(hdWSState.group)||''}
function hdWSUpdatePinButton(){
 const b=document.querySelector('[data-hd-ws-pin]');if(!b)return;
 const id=hdWSCurrentSectionId(),pinned=!!id&&hdWSQuickPinIds().includes(id);
 b.textContent=pinned?'★':'☆';b.classList.toggle('active',pinned);
 b.setAttribute('aria-label',pinned?'この機能の固定を外す':'この機能を固定');
 b.title=pinned?'固定済み・タップで解除':'クイックナビに固定';
}
function hdWSToggleCurrentPin(){
 const id=hdWSCurrentSectionId();if(!id)return false;
 if(typeof hdQNTogglePin==='function')hdQNTogglePin(id);
 else{
  const rows=hdWSQuickPinIds(),set=new Set(rows);set.has(id)?set.delete(id):set.add(id);
  try{localStorage.setItem('harbordesk-quick-nav-pins-v1',JSON.stringify([...set]))}catch{}
  window.dispatchEvent(new CustomEvent('hd:quick-nav-updated'));
 }
 hdWSUpdatePinButton();return true;
}
function hdWSCanReturnGame(){try{return sessionStorage.getItem('harbordesk-kc-return-game-v1')==='1'}catch{return false}}
function hdWSUpdateGameReturnAction(){
 const btn=document.querySelector('[data-hd-header-game-return]');if(btn)btn.hidden=!hdWSCanReturnGame();
}
function hdWSReturnToGame(){
 try{sessionStorage.removeItem('harbordesk-kc-return-game-v1')}catch{}
 hdWSUpdateGameReturnAction();
 const host=location.hostname;
 try{history.back()}catch{}
 setTimeout(()=>{if(location.hostname===host&&/github\.io$/.test(location.hostname))location.href='https://play.games.dmm.com/game/kancolle'},700);
}
function hdWSEnsureGameReturnAction(){
 const menu=document.querySelector('.hd-header-more .hd-version-menu');if(!menu)return false;
 let btn=menu.querySelector('[data-hd-header-game-return]');
 if(!btn){
  btn=document.createElement('button');btn.type='button';btn.className='ghost small hd-header-game-return';btn.dataset.hdHeaderGameReturn='1';
  btn.innerHTML='<span aria-hidden="true">⚓</span><b>艦これへ戻る</b>';
  btn.addEventListener('click',()=>{document.querySelector('.hd-header-more')?.removeAttribute('open');hdWSReturnToGame()});
  menu.prepend(btn);
 }
 hdWSUpdateGameReturnAction();return true;
}
function hdWSJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdWSShouldShowSwipeHint(){
 if(window.matchMedia?.('(min-width:561px)')?.matches)return false;
 try{return localStorage.getItem(HD_WS_SWIPE_HINT_KEY)!=='1'}catch{return false}
}
function hdWSDismissSwipeHint(){
 try{localStorage.setItem(HD_WS_SWIPE_HINT_KEY,'1')}catch{}
 document.getElementById('hdWorkspaceSwipeHint')?.remove();
 requestAnimationFrame(hdWSUpdateTopbarHeight);
}
function hdWSEnsureSwipeHint(){
 if(!hdWSShouldShowSwipeHint()||document.getElementById('hdWorkspaceSwipeHint'))return;
 const nav=document.getElementById('hdWorkspaceNav');if(!nav)return;
 const hint=document.createElement('button');hint.id='hdWorkspaceSwipeHint';hint.type='button';hint.className='hd-ws-swipe-hint';
 hint.innerHTML='<span aria-hidden="true">↔</span><b>左右スワイプでカテゴリ移動</b><small>×</small>';
 hint.addEventListener('click',hdWSDismissSwipeHint);nav.appendChild(hint);requestAnimationFrame(hdWSUpdateTopbarHeight);
}
function hdWSSyncInfo(){
 const sync=hdWSJson('harbordesk-kancolle-sync-v1',null);
 if(!sync?.syncedAt)return {sync:null,state:'missing',label:'未同期',shortLabel:'未同期',detail:'ゲームデータ未同期',missing:[]};
 const age=Math.max(0,Date.now()-Number(sync.syncedAt||0));
 let ageLabel='たった今';
 if(age>=86400000)ageLabel=Math.floor(age/86400000)+'日前';
 else if(age>=3600000)ageLabel=Math.floor(age/3600000)+'時間前';
 else if(age>=60000)ageLabel=Math.floor(age/60000)+'分前';
 const labels={ships:'艦娘',equipment:'装備',resources:'資源',fleets:'艦隊',quests:'任務',docks:'入渠'};
 const coverage=sync.coverage&&typeof sync.coverage==='object'?sync.coverage:null;
 const missing=coverage?Object.keys(labels).filter(k=>!coverage[k]):[];
 const partial=missing.length>0,state=partial?'partial':(age>21600000?'stale':'fresh');
 const label=ageLabel+(partial?'・一部未取得':'');
 const shortLabel=ageLabel+(partial?'・一部':'');
 const detail=(partial?'未取得: '+missing.map(k=>labels[k]).join(' / ')+' ｜ ':'')+`艦娘 ${Number(sync.ships)||0} / 装備 ${Number(sync.equipment)||0} / 艦隊 ${Number(sync.decks)||0}`;
 return {sync,state,label,shortLabel,detail,missing};
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
function hdWSSyncMissingGuide(missing=[]){
 const set=new Set(missing||[]),steps=[];
 if(set.has('ships')||set.has('resources')||set.has('fleets'))steps.push('母港');
 if(set.has('equipment'))steps.push('装備・改装');
 if(set.has('quests'))steps.push('任務');
 if(set.has('docks'))steps.push('入渠');
 return [...new Set(steps)];
}
function hdWSSyncChecklistRows(info){
 const labels={ships:'艦娘',equipment:'装備',resources:'資源',fleets:'艦隊',quests:'任務',docks:'入渠'};
 if(info?.state==='fresh')return [];
 if(info?.state==='missing')return [
  {screen:'母港',gets:'艦娘・資源・現在艦隊'},
  {screen:'装備・改装',gets:'装備'},
  {screen:'任務',gets:'任務'},
  {screen:'入渠',gets:'入渠'}
 ];
 const missing=Array.isArray(info?.missing)?info.missing:[],set=new Set(missing),rows=[];
 if(set.has('ships')||set.has('resources')||set.has('fleets')){
  const gets=['ships','resources','fleets'].filter(k=>set.has(k)).map(k=>labels[k]);rows.push({screen:'母港',gets:gets.join('・')||'艦娘・資源・現在艦隊'});
 }
 if(set.has('equipment'))rows.push({screen:'装備・改装',gets:'装備'});
 if(set.has('quests'))rows.push({screen:'任務',gets:'任務'});
 if(set.has('docks'))rows.push({screen:'入渠',gets:'入渠'});
 if(info?.state==='stale'&&!rows.length)rows.push({screen:'母港',gets:'現在の艦隊・資源状態'});
 return rows;
}
function hdWSSyncChecklistHtml(info){
 const rows=hdWSSyncChecklistRows(info);if(!rows.length)return '';
 const items=rows.map((x,i)=>`<li><span>${i+1}</span><div><b>${hdWSEsc(x.screen)}を開く</b><small>${hdWSEsc(x.gets)}を更新</small></div></li>`).join('');
 const last=rows.length+1;
 return `<div class="hd-sync-checklist"><b>同期を完了する手順</b><ol>${items}<li class="send"><span>${last}</span><div><b>HarborDeskへ送る</b><small>艦これ右下のボタンを押せば完了</small></div></li></ol></div>`;
}
function hdWSEnsureSyncDialog(){
 if(document.getElementById('hdSyncStatusDialog'))return document.getElementById('hdSyncStatusDialog');
 const d=document.createElement('dialog');d.id='hdSyncStatusDialog';d.className='hd-sync-status-dialog';
 d.innerHTML='<div class="hd-sync-status-head"><div><div class="eyebrow">GAME SYNC</div><h3>ゲーム同期の状態</h3></div><button type="button" class="ghost small" data-hd-sync-close>閉じる</button></div><div id="hdSyncStatusBody" class="hd-sync-status-body"></div><div class="hd-sync-status-actions"><a class="primary" href="https://play.games.dmm.com/game/kancolle">艦これを開く</a><button type="button" class="ghost" data-hd-sync-import>取込画面へ</button></div>';
 document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close?.()});return d;
}
function hdWSOpenSyncStatus(){
 const info=hdWSSyncInfo();
 const d=hdWSEnsureSyncDialog(),body=document.getElementById('hdSyncStatusBody'),labels={ships:'艦娘',equipment:'装備',resources:'資源',fleets:'艦隊',quests:'任務',docks:'入渠'};
 const missingHtml=info.missing?.length?'<div class="hd-sync-missing"><b>未取得</b><div>'+info.missing.map(k=>'<span>'+hdWSEsc(labels[k]||k)+'</span>').join('')+'</div></div>':'';
 const checklistHtml=hdWSSyncChecklistHtml(info);
 const statusText=info.state==='missing'?'まだゲームデータを同期してないよ':info.state==='stale'?'前回同期から時間が空いてるよ':info.state==='partial'?'一部のデータがまだ取れてないよ':'ゲームデータは最新だよ';
 const freshHtml=info.state==='fresh'?'<div class="hd-sync-guide"><b>最新状態</b><p>このまま使ってOK</p><small>艦これでプレイを進めたあと、必要な時だけ再同期してね。</small></div>':'';
 if(body)body.innerHTML='<strong>'+hdWSEsc(statusText)+'</strong><p>'+hdWSEsc(info.detail||'')+'</p>'+missingHtml+checklistHtml+freshHtml;
 if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');return true;
}
function hdWSEnsureSyncStatus(){
 if(document.getElementById('hdGlobalSyncStatus'))return;
 const top=document.querySelector('.topbar');if(!top)return;
 const btn=document.createElement('button');btn.id='hdGlobalSyncStatus';btn.type='button';btn.className='hd-global-sync-status';btn.innerHTML='<span>同期</span><b>確認中</b>';
 btn.addEventListener('click',hdWSOpenSyncStatus);
 const anchor=top.querySelector('.hd-header-more')||top.querySelector('#notifyBtn');
 if(anchor&&anchor.parentElement===top)top.insertBefore(btn,anchor);else top.appendChild(btn);
 hdWSUpdateSyncStatus();
}
function hdWSUpdateSyncStatus(){
 const btn=document.getElementById('hdGlobalSyncStatus');if(!btn)return;
 const info=hdWSSyncInfo();btn.classList.remove('fresh','stale','partial','missing');btn.classList.add(info.state);
 btn.innerHTML=`<span>ゲーム同期</span><b>${hdWSEsc(info.shortLabel||info.label)}</b>`;
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
let hdWSViewportBaseline=window.visualViewport?.height||window.innerHeight||0;
function hdWSShouldTreatKeyboardOpen(base,current,editable){
 return !!editable&&Number(base)>0&&Number(current)>0&&(Number(base)-Number(current))>120;
}
function hdWSUpdateKeyboardState(){
 const vv=window.visualViewport;if(!vv)return false;
 const active=document.activeElement,editable=!!active?.matches?.('input,textarea,select,[contenteditable="true"]');
 if(!editable)hdWSViewportBaseline=vv.height||window.innerHeight||hdWSViewportBaseline;
 const open=hdWSShouldTreatKeyboardOpen(hdWSViewportBaseline,vv.height,editable);
 document.body.classList.toggle('hd-keyboard-open',open);
 return open;
}
function hdWSInstallKeyboardTracking(){
 if(window.__HD_WS_KEYBOARD_TRACKING)return;window.__HD_WS_KEYBOARD_TRACKING=true;
 const update=()=>requestAnimationFrame(hdWSUpdateKeyboardState);
 window.visualViewport?.addEventListener('resize',update,{passive:true});
 window.visualViewport?.addEventListener('scroll',update,{passive:true});
 document.addEventListener('focusin',()=>setTimeout(update,60),true);
 document.addEventListener('focusout',()=>setTimeout(update,120),true);
 window.addEventListener('orientationchange',()=>setTimeout(()=>{hdWSViewportBaseline=window.visualViewport?.height||window.innerHeight||hdWSViewportBaseline;update()},250),{passive:true});
}
let hdWSLastScrollY=Math.max(0,window.scrollY||0),hdWSScrollTick=false;
function hdWSSetHeaderCompact(compact){
 const mobile=window.matchMedia?.('(max-width:560px)')?.matches!==false;
 const blocked=document.body.classList.contains('hd-keyboard-open')||document.querySelector('.hd-header-more[open]');
 const next=!!compact&&mobile&&!blocked&&Math.max(0,window.scrollY||0)>100;
 if(document.body.classList.contains('hd-header-compact')===next)return next;
 document.body.classList.toggle('hd-header-compact',next);
 requestAnimationFrame(hdWSUpdateTopbarHeight);
 return next;
}
function hdWSUpdateScrollCompact(){
 hdWSScrollTick=false;
 const y=Math.max(0,window.scrollY||0),delta=y-hdWSLastScrollY;
 if(y<72)hdWSSetHeaderCompact(false);
 else if(delta>12)hdWSSetHeaderCompact(true);
 else if(delta<-6)hdWSSetHeaderCompact(false);
 hdWSLastScrollY=y;
}
function hdWSInstallScrollCompact(){
 if(window.__HD_WS_SCROLL_COMPACT)return;window.__HD_WS_SCROLL_COMPACT=true;
 hdWSLastScrollY=Math.max(0,window.scrollY||0);
 window.addEventListener('scroll',()=>{
  if(hdWSScrollTick)return;hdWSScrollTick=true;requestAnimationFrame(hdWSUpdateScrollCompact);
 },{passive:true});
 document.addEventListener('focusin',()=>hdWSSetHeaderCompact(false),true);
 document.addEventListener('toggle',e=>{if(e.target?.matches?.('.hd-header-more')&&e.target.open)hdWSSetHeaderCompact(false)},true);
 window.addEventListener('resize',()=>{if(window.matchMedia?.('(min-width:561px)')?.matches)hdWSSetHeaderCompact(false)},{passive:true});
}
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
 const nav=document.createElement('div');nav.id='hdWorkspaceNav';nav.className='hd-ws-shell';nav.innerHTML=`<div class="hd-ws-primary" role="tablist" aria-label="HarborDeskカテゴリ">${HD_WS_GROUPS.map(g=>`<button type="button" role="tab" data-hd-ws-group="${g.key}"><span>${g.label}</span><em data-hd-ws-badge hidden>0</em></button>`).join('')}</div><div id="hdWorkspaceMobilePicker" class="hd-ws-mobile-picker" hidden><button type="button" class="ghost small hd-ws-back" data-hd-ws-back aria-label="ひとつ前の機能へ戻る" title="戻る">←</button><span id="hdWorkspaceContextGroup">ホーム</span><select id="hdWorkspaceSectionSelect" aria-label="カテゴリ内機能"></select><button type="button" class="ghost small hd-ws-pin" data-hd-ws-pin aria-label="この機能を固定" title="クイックナビに固定">☆</button><button type="button" class="ghost small" data-hd-ws-group-top>先頭</button></div><div id="hdWorkspaceSubtabs" class="hd-ws-secondary" role="tablist" aria-label="カテゴリ内機能"></div>`;
 top.insertAdjacentElement('afterend',nav);document.body.classList.add('hd-workspace-mode');hdWSEnsureSyncStatus();hdWSEnsureNetworkStatus();hdWSEnsureSwipeHint();hdWSEnsureGameReturnAction();hdWSUpdateTopbarHeight();hdWSUpdateBadges();hdWSUpdateSyncStatus();
}
function hdWSRenderSubtabs(group,selected){
 const host=document.getElementById('hdWorkspaceSubtabs'),picker=document.getElementById('hdWorkspaceMobilePicker'),select=document.getElementById('hdWorkspaceSectionSelect'),context=document.getElementById('hdWorkspaceContextGroup');if(!host)return;const rows=hdWSVisibleSections(group);
 if(context)context.textContent=hdWSGroupLabel(group);
 if(select){select.innerHTML=rows.map(el=>`<option value="${hdWSEsc(el.id)}">${hdWSEsc(hdWSTitle(el))}</option>`).join('');if(selected)select.value=selected}
 if(picker)picker.hidden=rows.length===0;
 hdWSUpdateBackButton();hdWSUpdatePinButton();
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
  const chosen=hdWSResolveSection(group,sectionId);hdWSState.group=group;if(chosen)hdWSState.sections[group]=chosen;hdWSSave();if(chosen)hdWSReflectLocationHash(chosen);
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
 hdWSPushHistory();
 const el=typeof target==='string'?document.getElementById(target):target;if(!el)return false;
 const section=hdWSManagedSectionFor(el);if(!section)return false;
 const group=section.dataset.hdWorkspaceGroup||hdWSGroupForSection(section);
 clearTimeout(hdWSRefreshTimer);
 hdWSNavLockUntil=Date.now()+900;hdWSSetPin(group,section.id,900);const navSeq=++hdWSNavSeq;
 const showNow=()=>{
  if(navSeq!==hdWSNavSeq)return false;
  hdWSState.group=group;hdWSState.sections[group]=section.id;hdWSSave();hdWSReflectLocationHash(section.id);
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
 hdWSEnsureUI();hdWSInstallKeyboardTracking();hdWSInstallScrollCompact();hdWSRefresh();
 setTimeout(()=>hdWSRestoreStartupContext(),80);
 if(!hdWSObserver){hdWSObserver=new MutationObserver(ms=>{if(hdWSMutationAddsSection(ms))hdWSScheduleRefresh()});const main=document.querySelector('main');if(main)hdWSObserver.observe(main,{childList:true,subtree:true})}
}
function hdWSHorizontalScroller(el){for(let n=el;n&&n!==document.body;n=n.parentElement){if(n.scrollWidth>n.clientWidth+12){const s=getComputedStyle(n);if(['auto','scroll'].includes(s.overflowX))return true}}return false}
function hdWSSwipeBlocked(target){return !!target?.closest?.('input,textarea,select,button,a,dialog,[contenteditable="true"],.hd-ws-primary,.hd-ws-secondary')||hdWSHorizontalScroller(target)}
function hdWSMoveGroup(dir){const i=HD_WS_GROUPS.findIndex(x=>x.key===hdWSState.group),next=HD_WS_GROUPS[i+dir];if(!next)return false;hdWSDismissSwipeHint();hdWSPushHistory();hdWSClearPin();hdWSApply(next.key,null,{restoreScroll:true,ignorePin:true});window.hdToast?.(next.label,'info',900);return true}
function hdWSTouchStart(e){if(e.touches?.length!==1||hdWSSwipeBlocked(e.target))return;const t=e.touches[0];if(t.clientX<24||t.clientX>window.innerWidth-24)return;hdWSTouch={x:t.clientX,y:t.clientY,at:Date.now()}}
function hdWSTouchEnd(e){if(!hdWSTouch)return;const t=e.changedTouches?.[0],start=hdWSTouch;hdWSTouch=null;if(!t)return;const dx=t.clientX-start.x,dy=t.clientY-start.y,dt=Date.now()-start.at;if(dt>800||Math.abs(dx)<72||Math.abs(dx)<Math.abs(dy)*1.35)return;hdWSMoveGroup(dx<0?1:-1)}

document.addEventListener('click',e=>{
 const share=e.target.closest?.('[data-hd-header-share]');if(share){hdWSShareCurrentLocation();return}
 const pin=e.target.closest?.('[data-hd-ws-pin]');if(pin){hdWSToggleCurrentPin();return}
 const back=e.target.closest?.('[data-hd-ws-back]');if(back){hdWSGoBack();return}
 const top=e.target.closest?.('[data-hd-ws-group-top]');if(top){hdWSPushHistory();hdWSClearPin();const target=hdWSDefaultSection(hdWSState.group);hdWSApply(hdWSState.group,target,{scrollTop:true,ignorePin:true});return}
 const g=e.target.closest?.('[data-hd-ws-group]');if(g){hdWSDismissSwipeHint();hdWSPushHistory();hdWSClearPin();hdWSApply(g.dataset.hdWsGroup,null,{restoreScroll:true,ignorePin:true});return}
 const s=e.target.closest?.('[data-hd-ws-section]');if(s){hdWSPushHistory();hdWSClearPin();hdWSApply(hdWSState.group,s.dataset.hdWsSection,{restoreScroll:true,ignorePin:true});return}
 const a=e.target.closest?.('a[href^="#"]');if(a&&hdWSHandleAnchor(a)){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}
},true);
document.addEventListener('change',e=>{
 const select=e.target.closest?.('#hdWorkspaceSectionSelect');if(!select)return;
 hdWSPushHistory();hdWSClearPin();hdWSApply(hdWSState.group,select.value,{restoreScroll:true,ignorePin:true});
});
document.addEventListener('touchstart',hdWSTouchStart,{passive:true});
document.addEventListener('touchend',hdWSTouchEnd,{passive:true});
window.addEventListener('hashchange',()=>{const id=hdWSInitialAnchorId();if(id)setTimeout(()=>hdWSOpenAnchorId(id,true),0)});
window.addEventListener('resize',hdWSUpdateTopbarHeight,{passive:true});
window.addEventListener('storage',e=>{hdWSUpdateBadges();if(!e||e.key==='harbordesk-kancolle-sync-v1')hdWSUpdateSyncStatus()});
window.addEventListener('hd:kancolle-sync',hdWSUpdateSyncStatus);
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-hd-sync-close]')){const d=document.getElementById('hdSyncStatusDialog');if(d?.open)d.close();else d?.removeAttribute('open');return}
 if(e.target.closest?.('[data-hd-sync-import]')){const d=document.getElementById('hdSyncStatusDialog');if(d?.open)d.close();else d?.removeAttribute('open');if(typeof hdWSShowElement==='function')hdWSShowElement('kancolleImport',true);else document.getElementById('kancolleImport')?.scrollIntoView({behavior:'smooth',block:'start'});return}
});
window.addEventListener('hd:kancolle-return-ready',()=>{hdWSEnsureGameReturnAction();hdWSUpdateGameReturnAction()});
window.addEventListener('online',hdWSUpdateNetworkStatus);
window.addEventListener('offline',hdWSUpdateNetworkStatus);
window.addEventListener('hd:modules-ready',()=>setTimeout(()=>{hdWSInstall();hdWSEnsureGameReturnAction();hdWSUpdateGameReturnAction()},0));
window.addEventListener('hd:workspace-refresh',hdWSUpdateBadges);
window.addEventListener('hd:quick-nav-updated',hdWSUpdatePinButton);
window.addEventListener('load',()=>setTimeout(()=>{hdWSInstall();hdWSEnsureGameReturnAction();hdWSUpdateGameReturnAction()},900));
window.addEventListener('pageshow',hdWSUpdateGameReturnAction);
window.addEventListener('pagehide',hdWSSaveCurrentScroll,{passive:true});
setInterval(hdWSUpdateBadges,10000);
setInterval(hdWSUpdateSyncStatus,60000);
setTimeout(hdWSInstall,1700);