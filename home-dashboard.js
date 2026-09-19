const HD_RECENT_MAPS_KEY='harbordesk-recent-maps-v1';
const HOME_INSTALL_TIP_KEY='harbordesk-install-tip-dismissed-v1';
function homeIsStandalone(){
 return !!(window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true);
}
function homeIsIOS(){
 const ua=String(navigator.userAgent||'');return /iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&Number(navigator.maxTouchPoints)>1);
}
function homeShowInstallTip(){
 if(homeIsStandalone()||!homeIsIOS())return false;
 try{return localStorage.getItem(HOME_INSTALL_TIP_KEY)!=='1'}catch{return true}
}
const HD_HOME_PANELS_KEY='harbordesk-home-panels-v1';
const HD_HOME_ORDER_KEY='harbordesk-home-order-v1';
const HD_HOME_ORDER_DEFAULT=['fleet','resources','procurement','quick','recent'];
const HD_HOME_FLEET_KEY='harbordesk-home-current-fleet-v1';
const HD_HOME_FLEET_GEAR_KEY='harbordesk-home-current-fleet-gear-v1';

function homeEsc(s){return typeof esc==='function'?esc(s):String(s??'')}
function loadRecentMaps(){try{return JSON.parse(localStorage.getItem(HD_RECENT_MAPS_KEY))||[]}catch{return []}}
function saveRecentMap(map){if(!map)return;const rows=loadRecentMaps().filter(x=>x!==map);rows.unshift(map);localStorage.setItem(HD_RECENT_MAPS_KEY,JSON.stringify(rows.slice(0,6)))}
function homePanelState(){try{return JSON.parse(localStorage.getItem(HD_HOME_PANELS_KEY)||'{}')||{}}catch{return {}}}
function homePanelSave(name,collapsed){const next={...homePanelState(),[name]:!!collapsed};try{localStorage.setItem(HD_HOME_PANELS_KEY,JSON.stringify(next))}catch{}}
function homeOrderLoad(){
 let rows=[];try{rows=JSON.parse(localStorage.getItem(HD_HOME_ORDER_KEY)||'[]')||[]}catch{}
 rows=rows.filter(x=>HD_HOME_ORDER_DEFAULT.includes(x));
 for(const id of HD_HOME_ORDER_DEFAULT)if(!rows.includes(id))rows.push(id);
 return rows;
}
function homeOrderSave(rows){try{localStorage.setItem(HD_HOME_ORDER_KEY,JSON.stringify(rows))}catch{}}
function homeApplyOrder(){
 const root=document.getElementById('home');if(!root)return;
 const items=[...root.querySelectorAll('[data-home-order-item]')];if(!items.length)return;
 const byId=new Map(items.map(el=>[el.dataset.homeOrderItem,el]));
 const after=items[items.length-1].nextSibling;
 for(const id of homeOrderLoad()){const el=byId.get(id);if(el)root.insertBefore(el,after)}
}
function homeMoveOrder(id,dir){
 const rows=homeOrderLoad(),i=rows.indexOf(id);if(i<0)return false;
 const j=dir==='up'?i-1:i+1;if(j<0||j>=rows.length)return false;
 [rows[i],rows[j]]=[rows[j],rows[i]];homeOrderSave(rows);homeApplyOrder();return true;
}
function homeSetEditing(editing){
 const root=document.getElementById('home'),btn=root?.querySelector('[data-home-edit-toggle]'),reset=root?.querySelector('[data-home-order-reset]'),on=!!editing;
 root?.classList.toggle('home-editing',on);
 if(btn){btn.textContent=on?'編集完了':'ホーム編集';btn.setAttribute('aria-pressed',on?'true':'false')}
 if(reset)reset.hidden=!on;
 return on;
}
function homeResetOrder(){
 homeOrderSave([...HD_HOME_ORDER_DEFAULT]);homeApplyOrder();window.hdToast?.('ホーム配置を初期状態に戻したよ','info',1400);return true;
}
function homeApplyPanelState(){
 const state=homePanelState();
 document.querySelectorAll('[data-home-panel]').forEach(card=>{
  const name=card.dataset.homePanel,collapsed=!!state[name],body=card.querySelector('[data-home-panel-body]'),btn=card.querySelector('[data-home-collapse]');
  card.classList.toggle('is-collapsed',collapsed);if(body)body.hidden=collapsed;
  if(btn){btn.textContent=collapsed?'＋':'−';btn.setAttribute('aria-expanded',collapsed?'false':'true')}
 });
}
function homeJson(key,fallback=null){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function homeRelative(ts){
 const d=Math.max(0,Date.now()-Number(ts||0));
 if(!ts)return '未同期';
 if(d<60000)return 'たった今';
 if(d<3600000)return Math.floor(d/60000)+'分前';
 if(d<86400000)return Math.floor(d/3600000)+'時間前';
 return Math.floor(d/86400000)+'日前';
}
function homeSyncInfo(){
 const s=homeJson('harbordesk-kancolle-sync-v1',null);
 if(!s)return {sync:null,label:'未同期',state:'missing',age:Infinity,missing:['艦娘','装備','資源','艦隊','任務','入渠']};
 const age=Date.now()-Number(s.syncedAt||0),coverage=s.coverage&&typeof s.coverage==='object'?s.coverage:null;
 const required=[['ships','艦娘'],['equipment','装備'],['resources','資源'],['fleets','艦隊'],['quests','任務'],['docks','入渠']];
 const missing=coverage?required.filter(([key])=>coverage[key]===false).map(([,label])=>label):[];
 const state=missing.length?'partial':age>21600000?'warn':'ok';
 return {sync:s,label:state==='partial'?'一部未取得・'+homeRelative(s.syncedAt):homeRelative(s.syncedAt),state,age,missing};
}
function homeSyncMissingGuide(missing=[]){
 const set=new Set(missing||[]),steps=[];
 if(set.has('艦娘')||set.has('資源')||set.has('艦隊'))steps.push('母港');
 if(set.has('装備'))steps.push('装備・改装');
 if(set.has('任務'))steps.push('任務');
 if(set.has('入渠'))steps.push('入渠');
 return [...new Set(steps)];
}
function homeFunctionTitleMap(){
 const sections=typeof hdQNSections==='function'?hdQNSections():[...document.querySelectorAll('section[id]')].map(el=>({id:el.id,title:el.querySelector('h2,h3')?.textContent?.trim()||el.id}));
 return new Map(sections.map(x=>[x.id,x.title]));
}
function homePinnedFunctionRows(){
 let pins=[];try{pins=JSON.parse(localStorage.getItem('harbordesk-quick-nav-pins-v1')||'[]')||[]}catch{}
 const titleMap=homeFunctionTitleMap();
 return pins.filter(id=>id&&id!=='home'&&titleMap.has(id)).slice(0,6).map(id=>({id,title:titleMap.get(id)}));
}
function homeRecentFunctionRows(exclude=new Set()){
 let recent=[];try{recent=JSON.parse(localStorage.getItem('harbordesk-quick-nav-recent-v1')||'[]')||[]}catch{}
 const titleMap=homeFunctionTitleMap();
 return recent.filter(x=>x?.id&&x.id!=='home'&&!exclude.has(x.id)&&titleMap.has(x.id)).slice(0,4).map(x=>({id:x.id,title:titleMap.get(x.id)}));
}
function homeRecentTimerRows(kind='expedition'){
 try{
  const all=JSON.parse(localStorage.getItem('harbordesk-timer-recent-v1')||'{}')||{},rows=Array.isArray(all[kind])?all[kind]:[];
  return rows.filter(x=>String(x?.name||'').trim()&&Number(x?.minutes)>0).slice(0,3).map(x=>({name:String(x.name),minutes:Number(x.minutes)}));
 }catch{return []}
}
function homeRecentQuestRows(){
 try{
  const rows=JSON.parse(localStorage.getItem('harbordesk-quest-recent-v1')||'[]')||[];
  return (Array.isArray(rows)?rows:[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,3);
 }catch{return []}
}
function homeTimerDurationLabel(minutes){
 if(typeof timerDurationLabel==='function')return timerDurationLabel(minutes);
 const m=Number(minutes)||0;if(m>0&&m%60===0)return (m/60)+'時間';if(m>=60)return Math.floor(m/60)+'時間'+(m%60)+'分';return m+'分';
}

function homeCurrentFleetRows(){
 const rows=homeJson('harbordesk-kancolle-fleets-v1',[]);
 return Array.isArray(rows)?rows.filter(x=>x&&Number(x.deckId)>0).sort((a,b)=>Number(a.deckId)-Number(b.deckId)):[];
}
function homeCurrentFleetId(rows=homeCurrentFleetRows()){
 let id=0;try{id=Number(localStorage.getItem(HD_HOME_FLEET_KEY)||0)}catch{}
 if(!rows.some(x=>Number(x.deckId)===id))id=Number(rows[0]?.deckId)||0;
 return id;
}
function homeCurrentFleetSave(id){try{localStorage.setItem(HD_HOME_FLEET_KEY,String(Number(id)||0))}catch{}}
function homeCurrentFleetGearVisible(){try{return localStorage.getItem(HD_HOME_FLEET_GEAR_KEY)==='1'}catch{return false}}
function homeCurrentFleetGearSave(show){try{localStorage.setItem(HD_HOME_FLEET_GEAR_KEY,show?'1':'0')}catch{}}
function homeFleetCondMeta(value){
 if(value==null||value==='')return {known:false,value:null,label:'',cls:''};
 const n=Number(value);if(!Number.isFinite(n))return {known:false,value:null,label:'',cls:''};
 if(n>=50)return {known:true,value:n,label:'キラ',cls:'kira'};
 if(n<40)return {known:true,value:n,label:'疲労',cls:'fatigue'};
 return {known:true,value:n,label:'',cls:'normal'};
}
function homeFleetReadinessMeta({away=false,hp25=0,hp50=0,fatigue=0}={}){
 const reasons=[];
 if(away)reasons.push('遠征中');
 if(hp25)reasons.push('HP25%以下 '+hp25+'隻');
 if(hp50)reasons.push('HP50%以下 '+hp50+'隻');
 if(fatigue)reasons.push('疲労 '+fatigue+'隻');
 if(away||hp25||fatigue)return {cls:'check',label:'要確認',detail:reasons.join('・')};
 if(hp50)return {cls:'warn',label:'HP注意',detail:reasons.join('・')};
 return {cls:'ok',label:'簡易チェックOK',detail:'HP・疲労に大きな注意なし'};
}
function homeSelectedMap(){try{return typeof selectedMap!=='undefined'?String(selectedMap||'').trim():''}catch{return ''}}
function homeSortieReadiness(map){
 const target=String(map||'').trim();if(!target)return null;
 try{
  if(typeof hdSortieFleets!=='function'||typeof hdSortieSelection!=='function'||typeof hdSortieAutoChecks!=='function'||typeof hdSortieManualChecks!=='function'||typeof hdSortieState!=='function'||typeof hdSortieSummary!=='function')return null;
  const fleets=hdSortieFleets(target),id=hdSortieSelection(target),fleet=fleets.find(x=>x.id===id)||fleets[0];if(!fleet)return null;
  const autoInfo=hdSortieAutoChecks(target,fleet),manual=hdSortieManualChecks(target,autoInfo.adv),state=hdSortieState(target,fleet.id),sum=hdSortieSummary(manual,state,autoInfo.checks);
  return {map:target,fleetId:fleet.id,name:fleet.name||'',...sum};
 }catch{return null}
}
function homeOpenFleetShip(name){
 const ship=String(name||'').trim();if(!ship)return false;
 if(typeof hdKcOpenShipFromFleet==='function')return hdKcOpenShipFromFleet(ship);
 try{sessionStorage.setItem('harbordesk-session-shipdb-view-v1',JSON.stringify({query:ship}))}catch{}
 if(typeof hdWSShowElement==='function')hdWSShowElement('shipDatabase',true);
 else document.getElementById('shipDatabase')?.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>{const input=document.getElementById('hdShipDbSearch');if(input){input.value=ship;input.dispatchEvent(new Event('input',{bubbles:true}))}},80);
 return true;
}
function homeSyncDeltaHtml(sync){
 const d=sync?.delta;if(!d?.baseline)return '';
 const labels={fuel:'燃料',ammo:'弾薬',steel:'鋼材',bauxite:'ボーキ',instantBuild:'高速建造',bucket:'バケツ',devMaterial:'開発資材',screw:'ネジ'};
 const signed=n=>{const v=Number(n)||0;return v>0?'+'+v.toLocaleString('ja-JP'):v.toLocaleString('ja-JP')};
 const parts=[];if(Number(d.ships))parts.push('艦娘 '+signed(d.ships));if(Number(d.equipment))parts.push('装備 '+signed(d.equipment));
 for(const k of ['fuel','ammo','steel','bauxite','bucket','devMaterial','screw'])if(Number(d.resources?.[k]))parts.push(labels[k]+' '+signed(d.resources[k]));
 return parts.length?'<div class="home-sync-delta"><span>前回から</span>'+parts.slice(0,5).map(x=>'<b>'+homeEsc(x)+'</b>').join('')+'</div>':'';
}

function ensureHomeDashboard(){
 const main=document.querySelector('main');
 const hero=document.querySelector('.hero');
 if(!main||!hero||document.getElementById('home'))return;
 const section=document.createElement('section');
 section.id='home';
 section.className='home-dashboard';
 section.innerHTML=`
  <div class="section-head"><div><div class="eyebrow">HOME</div><h2>今日の司令部</h2></div><div class="home-head-actions"><span class="muted" id="homeUpdated"></span><button type="button" class="ghost small" data-home-edit-toggle aria-pressed="false">ホーム編集</button><button type="button" class="ghost small" data-home-order-reset hidden>配置を戻す</button></div></div>
  <article id="homeGameSync" class="home-sync-card"></article>
  <article id="homeInstallTip" class="home-install-tip" hidden><div><span>iPhoneでさらに使いやすく</span><strong>HarborDeskをホーム画面に追加</strong><small>Safariの共有ボタン →「ホーム画面に追加」で、アプリみたいにすぐ開けるよ。</small></div><button type="button" class="ghost small" data-home-install-dismiss>閉じる</button></article>
  <article id="homeNextAction" class="home-next-action"></article>
  <div id="homeSummary" class="home-summary"></div>
  <div class="home-grid">
   <article class="home-card"><div class="home-card-title"><strong>今日やること</strong><a href="#quests">任務へ</a></div><div id="homeTodo"></div></article>
   <article class="home-card"><div class="home-card-title"><strong>進行中タイマー</strong><a href="#expeditions">遠征へ</a></div><div id="homeTimers"></div></article>
  </div>
  <article class="home-card home-collapsible home-current-fleet-card" data-home-panel="fleet" data-home-order-item="fleet"><div class="home-card-title"><strong>現在艦隊</strong><div class="home-card-actions"><button type="button" class="ghost small" data-home-jump="kancolleImport">同期画面</button><span class="home-order-controls"><button type="button" class="ghost small home-move-btn" data-home-move="up" aria-label="現在艦隊を上へ">↑</button><button type="button" class="ghost small home-move-btn" data-home-move="down" aria-label="現在艦隊を下へ">↓</button></span><button type="button" class="ghost small home-collapse-btn" data-home-collapse="fleet" aria-label="現在艦隊カードを折りたたむ" aria-expanded="true">−</button></div></div><div data-home-panel-body><div id="homeCurrentFleet"></div></div></article>
  <article class="home-card home-collapsible" data-home-panel="resources" data-home-order-item="resources"><div class="home-card-title"><strong>資源</strong><div class="home-card-actions"><button type="button" class="ghost small" data-home-jump="kancolleImport">ゲーム同期</button><a href="#resources">記録へ</a><span class="home-order-controls"><button type="button" class="ghost small home-move-btn" data-home-move="up" aria-label="資源を上へ">↑</button><button type="button" class="ghost small home-move-btn" data-home-move="down" aria-label="資源を下へ">↓</button></span><button type="button" class="ghost small home-collapse-btn" data-home-collapse="resources" aria-label="資源カードを折りたたむ" aria-expanded="true">−</button></div></div><div data-home-panel-body><div id="homeResources" class="home-resource-grid"></div></div></article>
  <article class="home-card home-collapsible" data-home-panel="procurement" data-home-order-item="procurement"><div class="home-card-title"><strong>次の装備調達</strong><div class="home-card-actions"><button type="button" class="ghost small" data-home-procurement-open>調達リストへ</button><span class="home-order-controls"><button type="button" class="ghost small home-move-btn" data-home-move="up" aria-label="装備調達を上へ">↑</button><button type="button" class="ghost small home-move-btn" data-home-move="down" aria-label="装備調達を下へ">↓</button></span><button type="button" class="ghost small home-collapse-btn" data-home-collapse="procurement" aria-label="装備調達カードを折りたたむ" aria-expanded="true">−</button></div></div><div data-home-panel-body><div id="homeProcurement"></div></div></article>
  <article class="home-card" data-home-order-item="quick"><div class="home-card-title"><strong>クイックアクセス</strong><div class="home-card-actions"><span class="muted">1〜2タップで移動</span><span class="home-order-controls"><button type="button" class="ghost small home-move-btn" data-home-move="up" aria-label="クイックアクセスを上へ">↑</button><button type="button" class="ghost small home-move-btn" data-home-move="down" aria-label="クイックアクセスを下へ">↓</button></span></div></div><div class="home-shortcuts">
    <a href="#kancolleImport">🎮 ゲーム同期</a><a href="#guide">🗺️ 攻略</a><a href="#roster">⚓ 艦隊</a><a href="#equipmentBook">🧰 装備</a><a href="#quests">✅ 任務</a><a href="#expeditions">⏱️ 遠征</a>
  </div><div id="homeRecentFunctions" class="home-recent-functions"></div></article>
  <article class="home-card home-collapsible" data-home-panel="recent" data-home-order-item="recent"><div class="home-card-title"><strong>最近見た海域</strong><div class="home-card-actions"><span class="muted">タップで攻略</span><span class="home-order-controls"><button type="button" class="ghost small home-move-btn" data-home-move="up" aria-label="最近見た海域を上へ">↑</button><button type="button" class="ghost small home-move-btn" data-home-move="down" aria-label="最近見た海域を下へ">↓</button></span><button type="button" class="ghost small home-collapse-btn" data-home-collapse="recent" aria-label="最近見た海域を折りたたむ" aria-expanded="true">−</button></div></div><div data-home-panel-body><div id="homeRecentMaps" class="home-recent-maps"></div></div></article>`;
 hero.insertAdjacentElement('afterend',section);
 homeApplyOrder();renderHomeDashboard();homeApplyPanelState();
}

function renderHomeDashboard(){
 if(!document.getElementById('home'))return;
 const now=Date.now();
 let expeditions=[],docks=[],quests=[],resources={fuel:'',ammo:'',steel:'',bauxite:''};
 try{if(typeof state!=='undefined'){expeditions=state.expeditions||[];docks=state.docks||[];quests=state.quests||[];resources=state.resources||resources}}catch{}
 const running=[...expeditions.map(x=>({...x,kind:'遠征',sourceKind:'expedition'})),...docks.map(x=>({...x,kind:'入渠',sourceKind:'dock'}))].filter(x=>x.endsAt>now).sort((a,b)=>a.endsAt-b.endsAt);
 const todo=quests.filter(x=>!x.done);
 const nextTimer=running[0]||null,nextMs=nextTimer?Math.max(0,nextTimer.endsAt-now):Infinity;
 const nextState=nextTimer?(nextMs<=15*60*1000?'urgent':nextMs<=60*60*1000?'soon':'normal'):(todo.length?'task':'clear');
 let rosterCount=0,equipCount=0,eventCount=0;
 try{rosterCount=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]').length}catch{}
 try{equipCount=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]').length}catch{}
 try{eventCount=JSON.parse(localStorage.getItem('harbordesk-events-v1')||'[]').length}catch{}
 document.getElementById('homeUpdated').textContent=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
 const installTip=document.getElementById('homeInstallTip');if(installTip)installTip.hidden=!homeShowInstallTip();
 const syncInfo=homeSyncInfo(),sync=syncInfo.sync;
 const syncHost=document.getElementById('homeGameSync');
 if(syncHost){
  syncHost.className='home-sync-card '+syncInfo.state;
  const syncNote=syncInfo.state==='partial'
   ?`<div class="home-sync-note">未取得: ${homeEsc(syncInfo.missing.join('・'))}。次は艦これで <b>${homeEsc(homeSyncMissingGuide(syncInfo.missing).join(' → ')||'母港')}</b> を開いてから、もう一度HarborDeskへ送ると補完できるよ。</div>`
   :syncInfo.state==='warn'?'<div class="home-sync-note">少し時間が空いてるよ。艦これを開いた時にもう一度同期すると最新状態になる。</div>':'';
  syncHost.innerHTML=sync?`<div class="home-sync-main"><div><span>ゲーム同期</span><strong>${homeEsc(syncInfo.label)}</strong><small>艦娘 ${Number(sync.ships)||0} / 装備 ${Number(sync.equipment)||0} / 艦隊 ${Number(sync.decks)||0}</small></div><div class="home-sync-actions"><a class="ghost small" href="https://play.games.dmm.com/game/kancolle">艦これを開く</a><button type="button" class="ghost small" data-home-jump="kancolleImport">同期画面へ</button></div></div>${homeSyncDeltaHtml(sync)}${syncNote}`:`<div class="home-sync-main"><div><span>ゲーム同期</span><strong>まだ同期してないよ</strong><small>艦娘・装備・資源・現在艦隊をまとめて取り込める</small></div><div class="home-sync-actions"><a class="primary small" href="https://play.games.dmm.com/game/kancolle">艦これを開く</a><button type="button" class="ghost small" data-home-jump="kancolleImport">同期画面</button></div></div>`;
 }
 const nextHost=document.getElementById('homeNextAction');
 if(nextHost){
  const urgentTimer=nextTimer&&nextMs<=60*60*1000;
  const syncNeedsAttention=syncInfo.state==='missing'||syncInfo.state==='partial'||syncInfo.state==='warn';
  const actionState=urgentTimer?(nextMs<=15*60*1000?'urgent':'soon'):syncNeedsAttention?'sync':todo.length?'task':nextTimer?'normal':'clear';
  nextHost.className='home-next-action '+actionState;
  if(urgentTimer){
   const mins=Math.ceil(nextMs/60000),timeText=typeof fmt==='function'?fmt(nextMs):(mins<60?mins+'分':Math.floor(mins/60)+'時間');
   nextHost.innerHTML=`<button type="button" class="home-next-main" data-home-jump="expeditions"><span>もうすぐ終わる</span><strong>${homeEsc(nextTimer.kind)}・${homeEsc(nextTimer.name||'タイマー')}</strong><small>あと ${homeEsc(timeText)}</small></button><button type="button" class="ghost small" data-home-jump="expeditions">タイマーを見る</button>`;
  }else if(syncNeedsAttention){
   const missingText=syncInfo.state==='partial'&&syncInfo.missing.length?`次に開く: ${homeSyncMissingGuide(syncInfo.missing).join(' → ')||'母港'}`:'艦娘・装備・資源を最新状態にしよう';
   nextHost.innerHTML=`<button type="button" class="home-next-main" data-home-jump="kancolleImport"><span>${syncInfo.state==='partial'?'同期を補完する':'先に更新しておく'}</span><strong>ゲーム同期 ${homeEsc(syncInfo.label)}</strong><small>${homeEsc(missingText)}</small></button><a class="ghost small home-next-game" href="https://play.games.dmm.com/game/kancolle">艦これを開く</a>`;
  }else if(todo.length){
   const first=todo[0];
   nextHost.innerHTML=`<button type="button" class="home-next-main" data-home-jump="quests"><span>次にやること・残り ${todo.length}件</span><strong>${homeEsc(first.name||'任務を確認')}</strong><small>タップで任務一覧へ</small></button><button type="button" class="ghost small home-next-done" data-home-quest-done="${homeEsc(first.id)}">完了</button>`;
  }else if(nextTimer){
   const mins=Math.ceil(nextMs/60000),timeText=typeof fmt==='function'?fmt(nextMs):(mins<60?mins+'分':Math.floor(mins/60)+'時間');
   nextHost.innerHTML=`<button type="button" class="home-next-main" data-home-jump="expeditions"><span>次の予定</span><strong>${homeEsc(nextTimer.kind)}・${homeEsc(nextTimer.name||'タイマー')}</strong><small>あと ${homeEsc(timeText)}</small></button><button type="button" class="ghost small" data-home-jump="expeditions">タイマーを見る</button>`;
  }else{
   nextHost.innerHTML='<div class="home-next-main"><span>次にやること</span><strong>急ぎの項目はないよ</strong><small>ホームから各機能へすぐ移動できる</small></div>';
  }
 }
 document.getElementById('homeSummary').innerHTML=`
   <button type="button" class="home-summary-item" data-home-jump="quests"><span>未完了任務</span><strong>${todo.length}</strong><small>任務へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="expeditions"><span>稼働中</span><strong>${running.length}</strong><small>タイマーへ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="roster"><span>艦娘</span><strong>${rosterCount}</strong><small>艦隊へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="equipmentBook"><span>装備</span><strong>${equipCount}</strong><small>装備へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="kancolleImport"><span>最終同期</span><strong class="home-sync-age">${homeEsc(syncInfo.label)}</strong><small>更新</small></button>`;
 const recentQuests=homeRecentQuestRows();
 const todoHtml=todo.length?todo.slice(0,5).map(q=>`<div class="home-row home-task-row"><span>${homeEsc(q.name)}</span><button type="button" class="ghost small home-task-done" data-home-quest-done="${homeEsc(q.id)}">完了</button></div>`).join(''):'<div class="home-empty home-empty-action"><span>未完了の任務はないよ</span><button type="button" class="ghost small" data-home-add-quest>＋ 任務を追加</button></div>';
 const recentQuestHtml=recentQuests.length?`<div class="home-quest-recent"><small>最近の任務</small><div>${recentQuests.map((x,i)=>`<button type="button" class="ghost small" data-home-quest-start="${i}"><b>${homeEsc(x)}</b><span>＋</span></button>`).join('')}</div></div>`:'';
 document.getElementById('homeTodo').innerHTML=todoHtml+recentQuestHtml;
 const recentExpeditions=homeRecentTimerRows('expedition'),recentDocks=homeRecentTimerRows('dock');
 const runningHtml=running.length?running.slice(0,5).map(t=>`<div class="home-row home-timer-row"><span><b>${t.kind}</b> ${homeEsc(t.name)}</span><div class="home-timer-actions"><small>${typeof fmt==='function'?fmt(t.endsAt-now):''}</small><button type="button" class="ghost small" data-home-timer-cancel="${homeEsc(t.id)}" data-kind="${homeEsc(t.sourceKind)}">取消</button></div></div>`).join(''):'<div class="home-empty home-empty-action"><span>動いているタイマーはないよ</span><div><button type="button" class="ghost small" data-home-add-timer="expedition">＋ 遠征</button><button type="button" class="ghost small" data-home-add-timer="dock">＋ 入渠</button></div></div>';
 const recentExpHtml=recentExpeditions.length?`<div class="home-timer-recent"><small>最近の遠征</small><div>${recentExpeditions.map((x,i)=>`<button type="button" class="ghost small" data-home-timer-start="${i}" data-kind="expedition"><b>${homeEsc(x.name)}</b><span>${homeEsc(homeTimerDurationLabel(x.minutes))}</span></button>`).join('')}</div></div>`:'';
 const recentDockHtml=recentDocks.length?`<div class="home-timer-recent home-dock-recent"><small>最近の入渠</small><div>${recentDocks.map((x,i)=>`<button type="button" class="ghost small" data-home-timer-start="${i}" data-kind="dock"><b>${homeEsc(x.name)}</b><span>${homeEsc(homeTimerDurationLabel(x.minutes))}</span></button>`).join('')}</div></div>`:'';
 document.getElementById('homeTimers').innerHTML=runningHtml+recentExpHtml+recentDockHtml;
 const fleetHost=document.getElementById('homeCurrentFleet'),fleetRows=homeCurrentFleetRows();
 if(fleetHost){
  if(!fleetRows.length){
   fleetHost.innerHTML='<div class="home-empty home-empty-action"><span>現在艦隊はまだ同期されてないよ</span><button type="button" class="ghost small" data-home-jump="kancolleImport">ゲーム同期へ</button></div>';
  }else{
   const selectedId=homeCurrentFleetId(fleetRows),deck=fleetRows.find(x=>Number(x.deckId)===selectedId)||fleetRows[0],mission=Array.isArray(deck?.mission)?deck.mission:[],away=Number(mission[0])>0,ships=Array.isArray(deck.ships)?deck.ships:[];
   const hp25=ships.filter(s=>Number(s.maxHp)>0&&Number(s.nowHp)/Number(s.maxHp)<=.25).length,hp50=ships.filter(s=>Number(s.maxHp)>0&&Number(s.nowHp)/Number(s.maxHp)<=.5&&Number(s.nowHp)/Number(s.maxHp)>.25).length;
   const conds=ships.map(s=>homeFleetCondMeta(s.cond)),kira=conds.filter(x=>x.cls==='kira').length,fatigue=conds.filter(x=>x.cls==='fatigue').length;
   const hpAlert=hp25?`・HP25%以下 ${hp25}隻`:hp50?`・HP50%以下 ${hp50}隻`:'',moodAlert=`${fatigue?`・疲労 ${fatigue}隻`:''}${kira?`・キラ ${kira}隻`:''}`,showGear=homeCurrentFleetGearVisible(),ready=homeFleetReadinessMeta({away,hp25,hp50,fatigue});
   fleetHost.innerHTML=`<div class="home-fleet-tabs">${fleetRows.map(x=>`<button type="button" class="${Number(x.deckId)===Number(deck.deckId)?'active':''}" data-home-fleet-tab="${Number(x.deckId)}">第${Number(x.deckId)}艦隊</button>`).join('')}</div><div class="home-fleet-meta"><div><strong>${homeEsc(deck.name||('第'+deck.deckId+'艦隊'))}</strong><small class="${hp25?'danger':hp50?'warn':fatigue?'warn':''}">${ships.length}隻${away?'・遠征中':''}${hpAlert}${moodAlert}</small><span class="home-fleet-readiness ${ready.cls}"><b>${ready.label}</b><i>${homeEsc(ready.detail)}</i></span></div><div class="home-fleet-meta-actions">${homeSelectedMap()?`<button type="button" class="primary small" data-home-fleet-copy="${Number(deck.deckId)}">${homeEsc(homeSelectedMap())} 出撃準備</button>`:'<button type="button" class="ghost small" data-home-jump="guide">海域を選ぶ</button>'}<button type="button" class="ghost small" data-home-fleet-gear-toggle aria-pressed="${showGear?'true':'false'}">${showGear?'装備を隠す':'装備を表示'}</button><button type="button" class="ghost small" data-home-jump="roster">艦隊台帳</button></div></div><div class="home-fleet-ships ${showGear?'show-gear':''}">${ships.map((s,i)=>{const max=Number(s.maxHp)||0,now=Number(s.nowHp)||0,ratio=max>0?now/max:1,cls=max>0?(ratio<=.25?'danger':ratio<=.5?'warn':''):'',hp=max>0?`・HP ${now}/${max}`:'',gear=String(s.gear||'').trim(),cond=homeFleetCondMeta(s.cond),condText=cond.known?`・cond ${cond.value}`:'';return `<button type="button" class="${cls}" data-home-fleet-ship="${homeEsc(s.name||'')}" title="${homeEsc(gear)}"><span>${i+1}</span><div><b>${homeEsc(s.name||'未解決')}</b><small class="home-fleet-state-line">Lv.${Number(s.level)||0}${hp}${condText}${cond.label?`<mark class="${cond.cls}">${cond.label}</mark>`:''}</small>${showGear?`<em>${homeEsc(gear||'装備データなし')}</em>`:''}</div><i aria-hidden="true">›</i></button>`}).join('')||'<div class="home-empty">艦娘データなし</div>'}</div>`;
  }
 }
 const res=[['燃料',resources.fuel],['弾薬',resources.ammo],['鋼材',resources.steel],['ボーキ',resources.bauxite]];
 document.getElementById('homeResources').innerHTML=res.map(([name,val])=>`<div><span>${name}</span><strong>${val!==''&&val!=null?Number(val).toLocaleString():'-'}</strong></div>`).join('');
 const procurement=document.getElementById('homeProcurement');
 if(procurement){
  let html='<div class="home-empty">不足装備を調達リストへ追加すると、次に揃える装備がここに出るよ</div>';
  if(typeof hdPLPriorityRows==='function'&&typeof hdPLNextActionMeta==='function'){
   const row=hdPLPriorityRows(undefined,1)?.[0],action=row?hdPLNextActionMeta(row):null;
   if(row&&action)html=`<div class="home-procurement-next"><div><small>${homeEsc(action.label)}</small><strong>${homeEsc(action.title||row.target||row.wanted)}</strong><span>${homeEsc(action.sub||'')}</span></div><b>あと ${Number(row.shortfall)||0}</b></div><p class="home-procurement-reason">${(row.priority?.reasons||[]).map(homeEsc).join('・')}</p>`;
  }
  procurement.innerHTML=html;
 }
 const recentFunctions=document.getElementById('homeRecentFunctions'),pinnedRows=homePinnedFunctionRows(),pinnedSet=new Set(pinnedRows.map(x=>x.id)),recentRows=homeRecentFunctionRows(pinnedSet);
 if(recentFunctions){
  const parts=[];
  if(pinnedRows.length)parts.push(`<div class="home-recent-label home-pinned-label"><span>★ ピン留め</span><button type="button" class="ghost small" data-home-pins-manage>編集</button></div><div class="home-recent-function-list home-pinned-function-list">${pinnedRows.map(x=>`<button type="button" data-home-jump="${homeEsc(x.id)}">${homeEsc(x.title)}</button>`).join('')}</div>`);
  if(recentRows.length)parts.push(`<div class="home-recent-label">最近使った機能</div><div class="home-recent-function-list">${recentRows.map(x=>`<button type="button" data-home-jump="${homeEsc(x.id)}">${homeEsc(x.title)}</button>`).join('')}</div>`);
  recentFunctions.innerHTML=parts.join('');
 }
 const recent=loadRecentMaps();
 document.getElementById('homeRecentMaps').innerHTML=recent.length?recent.map(m=>`<button class="recent-map-btn" data-home-map="${m}">${m}</button>`).join(''):'<div class="home-empty">海域を見るとここに履歴が出るよ</div>';
}

document.addEventListener('click',e=>{
 const fleetTab=e.target.closest('[data-home-fleet-tab]');if(fleetTab){homeCurrentFleetSave(fleetTab.dataset.homeFleetTab);renderHomeDashboard();return}
 const fleetGear=e.target.closest('[data-home-fleet-gear-toggle]');if(fleetGear){homeCurrentFleetGearSave(!homeCurrentFleetGearVisible());renderHomeDashboard();return}
 const sortieOpen=e.target.closest('[data-home-sortie-open]');if(sortieOpen){
  const map=homeSelectedMap();if(!map){if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);return}
  if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);else document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{const mine=document.querySelector('[data-map-tab="mine"]');if(mine)mine.click();if(typeof hdRenderSortieReadiness==='function')hdRenderSortieReadiness()},90);
  return;
 }
 const fleetCopy=e.target.closest('[data-home-fleet-copy]');if(fleetCopy){
  const map=homeSelectedMap();if(!map){if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);return}
  try{
   if(typeof hdKcCopyFleetToCustom!=='function')throw new Error('艦隊コピー機能がまだ読み込まれていない');
   const row=hdKcCopyFleetToCustom(fleetCopy.dataset.homeFleetCopy,map);
   if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,row.id);
   if(typeof hdToast==='function')hdToast(`${row.name} を ${map} の出撃準備へセットしたよ`,'success',2200);
   if(typeof hdQNRecordRecent==='function')hdQNRecordRecent('guide');
   if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);else document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'});
   setTimeout(()=>{const mine=document.querySelector('[data-map-tab="mine"]');if(mine)mine.click();if(typeof hdRenderSortieReadiness==='function')hdRenderSortieReadiness()},90);
  }catch(err){if(typeof hdToast==='function')hdToast('コピーできなかった: '+String(err?.message||err),'warn',2600)}
  return;
 }
 const fleetShip=e.target.closest('[data-home-fleet-ship]');if(fleetShip){homeOpenFleetShip(fleetShip.dataset.homeFleetShip);return}
 const edit=e.target.closest('[data-home-edit-toggle]');if(edit){homeSetEditing(!document.getElementById('home')?.classList.contains('home-editing'));return}
 const dismissInstall=e.target.closest('[data-home-install-dismiss]');if(dismissInstall){try{localStorage.setItem(HOME_INSTALL_TIP_KEY,'1')}catch{};const tip=document.getElementById('homeInstallTip');if(tip)tip.hidden=true;return}
 const addQuest=e.target.closest('[data-home-add-quest]');if(addQuest){if(typeof openQuestDialog==='function')openQuestDialog();else{const input=document.getElementById('questName');if(input)input.value='';document.getElementById('questDialog')?.showModal()}return}
 const quickQuest=e.target.closest('[data-home-quest-start]');if(quickQuest){
  const rows=homeRecentQuestRows(),name=rows[Number(quickQuest.dataset.homeQuestStart)],arr=(typeof state!=='undefined'&&Array.isArray(state.quests))?state.quests:null;
  if(!name||!arr)return;
  if(arr.some(q=>!q.done&&String(q.name||'').trim()===name)){if(typeof hdToast==='function')hdToast(`${name} は未完了で登録済みだよ`,'warn',2400);return}
  const item={id:typeof uid==='function'?uid():String(Date.now()),name,done:false};arr.push(item);
  try{if(typeof questRecentSave==='function')questRecentSave(name)}catch{};try{if(typeof save==='function')save()}catch{};
  try{if(typeof renderQuests==='function')renderQuests()}catch{};renderHomeDashboard();
  if(typeof hdToastAction==='function')hdToastAction(`${name} を追加したよ`,'元に戻す',()=>{const i=arr.findIndex(x=>String(x.id)===String(item.id));if(i>=0)arr.splice(i,1);try{if(typeof save==='function')save()}catch{};try{if(typeof renderQuests==='function')renderQuests()}catch{};renderHomeDashboard()},6500);
  else if(typeof hdToast==='function')hdToast(`${name} を追加したよ`);
  return;
 }
 const quickTimer=e.target.closest('[data-home-timer-start]');if(quickTimer){
  const kind=quickTimer.dataset.kind==='dock'?'dock':'expedition',rows=homeRecentTimerRows(kind),row=rows[Number(quickTimer.dataset.homeTimerStart)];
  const arr=(typeof state!=='undefined')?(kind==='dock'?state.docks:state.expeditions):null;if(!row||!Array.isArray(arr))return;
  const startedAt=Date.now();if(arr.some(x=>x.name===row.name&&Math.abs(Number(x.startedAt||0)-startedAt)<3000))return;
  const item={id:typeof uid==='function'?uid():String(startedAt),name:row.name,startedAt,durationMinutes:row.minutes,endsAt:startedAt+row.minutes*60000};
  arr.push(item);try{if(typeof timerLastSave==='function')timerLastSave(kind,row.name,row.minutes)}catch{};try{if(typeof save==='function')save()}catch{};
  try{if(typeof renderTimers==='function')renderTimers(kind)}catch{};renderHomeDashboard();
  const label=kind==='dock'?'入渠':'遠征';
  if(typeof hdToastAction==='function')hdToastAction(`${label}「${row.name}」を開始したよ`,'元に戻す',()=>{
   const i=arr.findIndex(x=>String(x.id)===String(item.id));if(i>=0)arr.splice(i,1);
   try{if(typeof save==='function')save()}catch{};try{if(typeof renderTimers==='function')renderTimers(kind)}catch{};renderHomeDashboard();
   if(typeof hdToast==='function')hdToast('元に戻したよ');
  },6500);
  else if(typeof hdToast==='function')hdToast(`${label}「${row.name}」を開始したよ`);
  return;
 }
 const addTimer=e.target.closest('[data-home-add-timer]');if(addTimer){if(typeof openTimer==='function')openTimer(addTimer.dataset.homeAddTimer);return}
 const cancelTimer=e.target.closest('[data-home-timer-cancel]');if(cancelTimer){
  const kind=cancelTimer.dataset.kind==='dock'?'dock':'expedition',arr=(typeof state!=='undefined')?(kind==='dock'?state.docks:state.expeditions):null;
  if(!Array.isArray(arr))return;
  const i=arr.findIndex(x=>String(x.id)===String(cancelTimer.dataset.homeTimerCancel));if(i<0)return;
  const [item]=arr.splice(i,1);
  try{if(typeof save==='function')save()}catch{}
  try{if(typeof renderTimers==='function')renderTimers(kind)}catch{}
  renderHomeDashboard();
  const label=kind==='dock'?'入渠':'遠征';
  if(typeof hdToastAction==='function')hdToastAction(`${label}「${item.name}」を取り消したよ`,'元に戻す',()=>{
   const target=kind==='dock'?state.docks:state.expeditions;
   if(!target.some(x=>String(x.id)===String(item.id)))target.splice(Math.min(i,target.length),0,item);
   try{if(typeof save==='function')save()}catch{}
   try{if(typeof renderTimers==='function')renderTimers(kind)}catch{}
   renderHomeDashboard();
   if(typeof hdToast==='function')hdToast('元に戻したよ');
  },6500);
  else if(typeof hdToast==='function')hdToast(`${label}を取り消したよ`);
  return;
 }
  const done=e.target.closest('[data-home-quest-done]');if(done){
  const id=done.dataset.homeQuestDone,q=(typeof state!=='undefined'&&Array.isArray(state.quests))?state.quests.find(x=>String(x.id)===String(id)):null;
  if(!q)return;
  const prev=!!q.done;q.done=true;
  try{if(typeof save==='function')save()}catch{}
  try{if(typeof renderQuests==='function')renderQuests()}catch{}
  renderHomeDashboard();
  if(typeof hdToastAction==='function')hdToastAction(`${q.name} を完了にしたよ`,'元に戻す',()=>{q.done=prev;try{if(typeof save==='function')save()}catch{};try{if(typeof renderQuests==='function')renderQuests()}catch{};renderHomeDashboard();if(typeof hdToast==='function')hdToast('元に戻したよ')},6500);
  else if(typeof hdToast==='function')hdToast(`${q.name} を完了にしたよ`);
  return;
 }
 const resetOrder=e.target.closest('[data-home-order-reset]');if(resetOrder){homeResetOrder();return}
 const move=e.target.closest('[data-home-move]');if(move){const card=move.closest('[data-home-order-item]');if(card)homeMoveOrder(card.dataset.homeOrderItem,move.dataset.homeMove);return}
 const managePins=e.target.closest('[data-home-pins-manage]');if(managePins){if(typeof hdQNOpen==='function')hdQNOpen();return}
 const collapse=e.target.closest('[data-home-collapse]');
 if(collapse){
  const card=collapse.closest('[data-home-panel]'),name=card?.dataset.homePanel;if(!card||!name)return;
  const next=!card.classList.contains('is-collapsed');homePanelSave(name,next);homeApplyPanelState();return;
 }
 const jump=e.target.closest('[data-home-jump]');
 if(jump){
  const id=jump.dataset.homeJump;
  if(typeof hdQNRecordRecent==='function')hdQNRecordRecent(id);
  if(typeof hdWSShowElement==='function')hdWSShowElement(id,true);
  else{const target=document.getElementById(id);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});else location.hash=id}
  return;
 }
 const mapButton=e.target.closest('[data-map]');
 if(mapButton?.dataset.map){saveRecentMap(mapButton.dataset.map);setTimeout(renderHomeDashboard,0)}
 const recent=e.target.closest('[data-home-map]');
 if(recent){const map=recent.dataset.homeMap;try{selectedWorld=map.split('-')[0];selectedMap=map;guideFilter='map';const q=document.getElementById('guideQuery');if(q)q.value=map;renderGuide();saveRecentMap(map);if(typeof hdWSShowElement==='function')hdWSShowElement('guide',false);else location.hash='guide';setTimeout(()=>document.getElementById('selectedMapCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}catch{location.hash='guide'}}
 if(e.target.closest('[data-home-procurement-open]')){if(typeof hdPLOpenList==='function')hdPLOpenList();else location.hash='equipmentBook'}
});

window.addEventListener('storage',renderHomeDashboard);
window.addEventListener('hd:modules-ready',renderHomeDashboard);
window.addEventListener('hd:equipment-changed',renderHomeDashboard);
window.addEventListener('hd:procurement-changed',renderHomeDashboard);
window.addEventListener('hd:kancolle-sync',renderHomeDashboard);
window.addEventListener('hd:workspace-refresh',renderHomeDashboard);
window.addEventListener('hd:quick-nav-updated',renderHomeDashboard);
window.addEventListener('hd:workspace-changed',e=>{if(e.detail?.group!=='home')homeSetEditing(false);renderHomeDashboard()});
setInterval(renderHomeDashboard,5000);
window.addEventListener('load',()=>setTimeout(renderHomeDashboard,300));
ensureHomeDashboard();
