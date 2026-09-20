const HD_QN_PIN_KEY='harbordesk-quick-nav-pins-v1';
const HD_QN_RECENT_KEY='harbordesk-quick-nav-recent-v1';
const HD_QN_HISTORY_KEY='harbordesk-session-quick-nav-history-v1';
let hdQNHistoryLock=false;

function hdQNLoadPins(){try{return JSON.parse(localStorage.getItem(HD_QN_PIN_KEY)||'[]')||[]}catch{return []}}
function hdQNSavePins(v){localStorage.setItem(HD_QN_PIN_KEY,JSON.stringify(v))}
function hdQNLoadRecent(){try{return JSON.parse(localStorage.getItem(HD_QN_RECENT_KEY)||'[]')||[]}catch{return []}}
function hdQNSaveRecent(v){localStorage.setItem(HD_QN_RECENT_KEY,JSON.stringify(v))}
function hdQNLoadHistory(){try{return JSON.parse(sessionStorage.getItem(HD_QN_HISTORY_KEY)||'[]')||[]}catch{return []}}
function hdQNSaveHistory(v){try{sessionStorage.setItem(HD_QN_HISTORY_KEY,JSON.stringify(v.slice(-20)))}catch{}}
function hdQNRecordHistory(id){if(hdQNHistoryLock||!id)return;const rows=hdQNLoadHistory();if(rows[rows.length-1]===id)return;rows.push(id);hdQNSaveHistory(rows)}
function hdQNBack(){const rows=hdQNLoadHistory();if(rows.length<2)return false;rows.pop();const prev=rows.pop();hdQNSaveHistory(rows);hdQNHistoryLock=true;hdQNClose();const ok=typeof hdWSShowElement==='function'?hdWSShowElement(prev,true):false;setTimeout(()=>{hdQNHistoryLock=false;if(ok)hdQNRecordHistory(prev)},120);return !!ok}
function hdQNRecordRecent(id){const rows=hdQNLoadRecent().filter(x=>x&&x.id!==id);rows.unshift({id,at:Date.now()});hdQNSaveRecent(rows.slice(0,12));window.dispatchEvent(new CustomEvent('hd:quick-nav-updated'))}
function hdQNEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdQNSections(){
  const seen=new Set(),rows=[];
  for(const el of document.querySelectorAll('section[id], #selectedMapCard')){
    if(!el.id||seen.has(el.id))continue;
    const title=el.querySelector(':scope > .section-head h2, :scope h2, :scope h3, :scope h4')?.textContent?.trim();
    if(!title)continue;
    seen.add(el.id);rows.push({id:el.id,title});
  }
  return rows;
}
function hdQNContextRows(){
 const group=document.querySelector('[data-hd-ws-group].active')?.dataset.hdWsGroup||'';
 if(!group||group==='home')return [];
 try{
  const rows=typeof hdWSVisibleSections==='function'?hdWSVisibleSections(group):[...document.querySelectorAll(`section[data-hd-workspace-group="${group}"]`)];
  return rows.filter(x=>x?.id).map(x=>({id:x.id,title:typeof hdWSTitle==='function'?hdWSTitle(x):(x.querySelector('h2,h3')?.textContent?.trim()||x.id)}));
 }catch{return []}
}
function hdQNRenderContext(){
 const host=document.getElementById('hdQNContext');if(!host)return;
 const rows=hdQNContextRows(),group=document.querySelector('[data-hd-ws-group].active')?.dataset.hdWsGroup||'',meta=hdQNMobileGroupMeta(group);
 if(!rows.length){host.hidden=true;host.innerHTML='';return}
 const selected=window.hdWSState?.sections?.[group]||'';
 host.hidden=false;
 host.innerHTML=`<div class="hd-qn-context-head"><span>このカテゴリ</span><b>${hdQNEsc(meta.label)}</b></div><div class="hd-qn-context-grid">${rows.map(x=>`<button type="button" class="${x.id===selected?'active':''}" data-hd-qn-context="${hdQNEsc(x.id)}">${hdQNEsc(x.title)}</button>`).join('')}</div>`;
}
function hdQNRecentRows(limit=5){
 const active=window.hdWSState?.sections?.[window.hdWSState?.group]||'';
 const sections=new Map(hdQNSections().map(x=>[x.id,x])),all=hdQNLoadRecent(),valid=all.filter(x=>x?.id&&sections.has(x.id));
 if(valid.length!==all.length)hdQNSaveRecent(valid.slice(0,12));
 return valid.filter(x=>x.id!==active).slice(0,limit).map(x=>({...x,title:sections.get(x.id).title}));
}
function hdQNClearRecent(){
 try{localStorage.removeItem(HD_QN_RECENT_KEY)}catch{hdQNSaveRecent([])}
 hdQNRenderRecent();
 if(document.getElementById('hdQuickNavDialog')?.open)hdQNRenderList(document.getElementById('hdQNSearch')?.value||'');
 window.hdToast?.('最近使った機能を消去したよ','info',1200);
 window.dispatchEvent(new CustomEvent('hd:quick-nav-updated'));
 return true;
}
function hdQNRenderRecent(){
 const host=document.getElementById('hdQNRecent');if(!host)return;
 const rows=hdQNRecentRows();
 if(!rows.length){host.hidden=true;host.innerHTML='';return}
 host.hidden=false;
 host.innerHTML=`<div class="hd-qn-recent-head"><span>最近使った機能</span><div><small>タップですぐ戻れるよ</small><button type="button" data-hd-qn-clear-recent aria-label="最近使った機能の履歴を消去">消去</button></div></div><div class="hd-qn-recent-grid">${rows.map(x=>`<button type="button" data-hd-qn-jump="${hdQNEsc(x.id)}" title="${hdQNEsc(x.title)}"><span>↶</span><b>${hdQNEsc(x.title)}</b></button>`).join('')}</div>`;
}
function hdQNRenderList(filter=''){
  const host=document.getElementById('hdQNList');if(!host)return;
  const q=String(filter||'').trim().toLowerCase(),pins=hdQNLoadPins(),pinSet=new Set(pins),recent=hdQNLoadRecent(),recentMap=new Map(recent.map(x=>[x.id,Number(x.at)||0])),rows=hdQNSections().filter(x=>!q||x.title.toLowerCase().includes(q)||x.id.toLowerCase().includes(q));
  rows.sort((a,b)=>{const ap=pinSet.has(a.id),bp=pinSet.has(b.id);if(ap!==bp)return bp-ap;const ar=recentMap.get(a.id)||0,br=recentMap.get(b.id)||0;if(ar!==br)return br-ar;return a.title.localeCompare(b.title,'ja')});
  host.innerHTML=rows.length?rows.map(x=>`<div class="hd-qn-row ${pinSet.has(x.id)?'pinned':''}"><button type="button" class="hd-qn-jump" data-hd-qn-jump="${hdQNEsc(x.id)}"><span>${hdQNEsc(x.title)}</span><small>${hdQNEsc(x.id)}${recentMap.has(x.id)?' ・ 最近使用':''}</small></button><button type="button" class="hd-qn-pin" data-hd-qn-pin="${hdQNEsc(x.id)}" aria-label="${pinSet.has(x.id)?'ピン解除':'ピン留め'}">${pinSet.has(x.id)?'★':'☆'}</button></div>`).join(''):'<div class="empty">該当する機能がないよ。</div>';
}
function hdQNUpdateHistoryActions(){
 const back=document.querySelector('[data-hd-qn-back]'),forward=document.querySelector('[data-hd-qn-forward]');
 const meta=typeof hdWSHistoryMeta==='function'?hdWSHistoryMeta():{backCount:Math.max(0,hdQNLoadHistory().length-1),forwardCount:0,backTarget:null,forwardTarget:null};
 const backLabel=String(meta.backTarget?.label||''),forwardLabel=String(meta.forwardTarget?.label||'');
 if(back){
  back.disabled=!meta.backTarget&&meta.backCount<=0;
  back.setAttribute('aria-label',backLabel?`${backLabel}へ戻る・履歴 ${meta.backCount}件`:meta.backCount>0?`前の機能へ戻る・履歴 ${meta.backCount}件`:'戻れる履歴なし');
  back.title=backLabel?`戻る: ${backLabel}`:'戻る履歴なし';
  const target=back.querySelector('[data-hd-qn-back-target]');if(target)target.textContent=backLabel||'履歴なし';
 }
 if(forward){
  forward.disabled=!meta.forwardTarget&&meta.forwardCount<=0;
  forward.setAttribute('aria-label',forwardLabel?`${forwardLabel}へ進む・履歴 ${meta.forwardCount}件`:meta.forwardCount>0?`次の機能へ進む・履歴 ${meta.forwardCount}件`:'進める履歴なし');
  forward.title=forwardLabel?`進む: ${forwardLabel}`:'進む履歴なし';
  const target=forward.querySelector('[data-hd-qn-forward-target]');if(target)target.textContent=forwardLabel||'履歴なし';
 }
}
function hdQNOpen(){
  hdQNEnsure();const d=document.getElementById('hdQuickNavDialog');if(!d)return;
  const input=document.getElementById('hdQNSearch');if(input)input.value='';hdQNRenderContext();hdQNRenderRecent();hdQNRenderList('');hdQNUpdateHistoryActions();
  if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
  hdQNUpdateMobileDock();
  setTimeout(()=>input?.focus(),50);
}
function hdQNClose(){const d=document.getElementById('hdQuickNavDialog');if(!d)return;if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open');hdQNUpdateMobileDock()}
function hdQNJump(id){
 const target=document.getElementById(id);if(!target)return false;
 hdQNRecordRecent(id);hdQNClose();
 if(typeof hdGSClose==='function')hdGSClose();
 if(typeof hdWSShowElement==='function')hdWSShowElement(target,false);
 target.scrollIntoView({behavior:'smooth',block:'start'});
 target.classList.add('hd-qn-flash');setTimeout(()=>target.classList.remove('hd-qn-flash'),900);
 return true;
}
function hdQNTogglePin(id){const pins=hdQNLoadPins(),set=new Set(pins);set.has(id)?set.delete(id):set.add(id);hdQNSavePins([...set]);hdQNRenderList(document.getElementById('hdQNSearch')?.value||'');window.dispatchEvent(new CustomEvent('hd:quick-nav-updated'))}
function hdQNEnsureMobileDock(){
 if(document.getElementById('hdMobileDock'))return;
 const dock=document.createElement('nav');dock.id='hdMobileDock';dock.className='hd-mobile-dock';dock.setAttribute('aria-label','主要操作');
 dock.innerHTML='<button type="button" class="hd-mobile-back" data-hd-mobile-back aria-label="ひとつ前の機能へ戻る">‹</button><button type="button" class="hd-mobile-location" data-hd-mobile-location><span data-hd-mobile-location-group>ホーム</span><b data-hd-mobile-location-section>今日の司令部</b><i>›</i></button><button type="button" data-hd-mobile-home><span>⌂</span><b>ホーム</b><em data-hd-mobile-home-badge hidden>0</em></button><button type="button" data-hd-mobile-search><span>⌕</span><b>検索</b></button><button type="button" data-hd-mobile-sync><span>↻</span><b>同期</b><i aria-hidden="true"></i></button><button type="button" data-hd-mobile-menu><span>☰</span><b>機能</b></button>';
 document.body.appendChild(dock);hdQNEnsureAttentionDialog();hdQNUpdateMobileDock();
}
function hdQNMobileAttentionItems(){
 const items=[],now=Date.now(),RECENT_DONE=2*60*60*1000;
 try{
  const appState=typeof window.hdGetAppState==='function'?window.hdGetAppState():{};
  const quests=Array.isArray(appState.quests)?appState.quests:[];
  const expeditions=Array.isArray(appState.expeditions)?appState.expeditions:[];
  const docks=Array.isArray(appState.docks)?appState.docks:[];
  const doneExp=expeditions.filter(x=>Number(x.endsAt)>0&&Number(x.endsAt)<=now&&now-Number(x.endsAt)<=RECENT_DONE).sort((a,b)=>Number(b.endsAt)-Number(a.endsAt));
  if(doneExp.length)items.push({id:'expeditions',priority:100,tone:'urgent',reason:'遠征帰投済み',icon:'!',title:`遠征が帰投済み ${doneExp.length}件`,detail:String(doneExp[0]?.name||'遠征結果を確認')});
  const doneDock=docks.filter(x=>Number(x.endsAt)>0&&Number(x.endsAt)<=now&&now-Number(x.endsAt)<=RECENT_DONE).sort((a,b)=>Number(b.endsAt)-Number(a.endsAt));
  if(doneDock.length)items.push({id:'docks',priority:95,tone:'urgent',reason:'入渠完了',icon:'✓',title:`入渠が完了 ${doneDock.length}件`,detail:String(doneDock[0]?.name||'入渠一覧を確認')});
  const nearExp=expeditions.filter(x=>Number(x.endsAt)>now&&Number(x.endsAt)-now<=15*60*1000).sort((a,b)=>Number(a.endsAt)-Number(b.endsAt));
  if(nearExp.length){const m=Math.max(1,Math.ceil((Number(nearExp[0].endsAt)-now)/60000));items.push({id:'expeditions',priority:80,tone:'soon',reason:'遠征まもなく終了',icon:'↗',title:`遠征まもなく帰投 ${nearExp.length}件`,detail:`${nearExp[0].name||'遠征'}・あと約${m}分`})}
  const nearDock=docks.filter(x=>Number(x.endsAt)>now&&Number(x.endsAt)-now<=15*60*1000).sort((a,b)=>Number(a.endsAt)-Number(b.endsAt));
  if(nearDock.length){const m=Math.max(1,Math.ceil((Number(nearDock[0].endsAt)-now)/60000));items.push({id:'docks',priority:75,tone:'soon',reason:'入渠まもなく終了',icon:'♨',title:`入渠まもなく完了 ${nearDock.length}件`,detail:`${nearDock[0].name||'入渠'}・あと約${m}分`})}
  const todo=quests.filter(x=>!x.done);
  if(todo.length)items.push({id:'quests',priority:20,tone:'normal',reason:'未完了任務',icon:'✓',title:`未完了任務 ${todo.length}件`,detail:String(todo[0]?.name||'任務一覧を確認')});
 }catch{}
 try{
  const info=typeof hdWSSyncInfo==='function'?hdWSSyncInfo():{state:'missing',label:'未同期'};
  if(info.state&&info.state!=='fresh'){
   const missing=info.state==='missing',partial=info.state==='partial';
   const title=missing?'ゲームデータ未同期':partial?'ゲーム同期を補完':'ゲーム同期が古い';
   items.push({id:'kancolleImport',priority:missing?65:partial?55:45,tone:'sync',reason:'ゲーム同期確認',icon:'↻',title,detail:String(info.label||'同期画面を確認')});
  }
 }catch{items.push({id:'kancolleImport',priority:45,tone:'sync',reason:'ゲーム同期確認',icon:'↻',title:'ゲーム同期を確認',detail:'同期画面を開く'})}
 return items.sort((a,b)=>Number(b.priority||0)-Number(a.priority||0));
}
function hdQNMobileAttentionMeta(){const items=hdQNMobileAttentionItems();return {count:Math.min(9,items.length),reasons:items.map(x=>x.reason),items}}
function hdQNMobileAttentionCount(){return hdQNMobileAttentionMeta().count}
function hdQNMobileGroupMeta(group){
 const map={
  guide:{icon:'🗺',label:'攻略'},
  fleet:{icon:'⚓',label:'艦隊'},
  quest:{icon:'✓',label:'任務'},
  expedition:{icon:'⏱',label:'遠征'},
  arsenal:{icon:'⚒',label:'工廠'},
  records:{icon:'▤',label:'記録'},
  settings:{icon:'⚙',label:'設定'}
 };
 return map[group]||{icon:'☰',label:'機能'};
}
function hdQNEnsureAttentionDialog(){
 if(document.getElementById('hdMobileAttentionDialog'))return;
 const d=document.createElement('dialog');d.id='hdMobileAttentionDialog';d.className='hd-mobile-attention-dialog';
 d.innerHTML='<div class="hd-mobile-attention-head"><div><div class="eyebrow">ATTENTION</div><h3>要対応</h3></div><button type="button" class="ghost small" data-hd-attention-close>閉じる</button></div><div id="hdMobileAttentionList" class="hd-mobile-attention-list"></div>';
 document.body.appendChild(d);
 d.addEventListener('click',e=>{if(e.target===d)hdQNCloseAttention()});
}
function hdQNOpenAttention(){
 hdQNEnsureAttentionDialog();
 const d=document.getElementById('hdMobileAttentionDialog'),host=document.getElementById('hdMobileAttentionList');if(!d||!host)return false;
 const items=hdQNMobileAttentionItems();
 host.innerHTML=items.length?items.map(x=>`<button type="button" class="tone-${hdQNEsc(x.tone||'normal')}" data-hd-attention-jump="${hdQNEsc(x.id)}"><span>${hdQNEsc(x.icon)}</span><div><strong>${hdQNEsc(x.title)}</strong><small>${hdQNEsc(x.detail)}</small></div><i>›</i></button>`).join(''):'<div class="empty">今すぐ対応が必要な項目はないよ。</div>';
 if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
 return true;
}
function hdQNCloseAttention(){const d=document.getElementById('hdMobileAttentionDialog');if(!d)return;if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open')}
function hdQNMobileHome(){
 const active=document.querySelector('[data-hd-ws-group].active')?.dataset.hdWsGroup==='home',attention=hdQNMobileAttentionMeta();
 if(active&&attention.count>0)return hdQNOpenAttention();
 if(typeof hdWSShowElement==='function')return hdWSShowElement('home',true);
 const home=document.getElementById('home');if(home){home.scrollIntoView({behavior:'smooth',block:'start'});return true}
 return false;
}
function hdQNUpdateMobileDock(){
 const dock=document.getElementById('hdMobileDock');if(!dock)return;
 const home=dock.querySelector('[data-hd-mobile-home]'),search=dock.querySelector('[data-hd-mobile-search]'),sync=dock.querySelector('[data-hd-mobile-sync]'),menu=dock.querySelector('[data-hd-mobile-menu]'),badge=dock.querySelector('[data-hd-mobile-home-badge]'),back=dock.querySelector('[data-hd-mobile-back]'),locationBtn=dock.querySelector('[data-hd-mobile-location]'),activeGroup=document.querySelector('[data-hd-ws-group].active')?.dataset.hdWsGroup||'';
 const searchOpen=!!document.getElementById('hdGlobalSearchDialog')?.open,menuOpen=!!document.getElementById('hdQuickNavDialog')?.open;
 home?.classList.toggle('active',activeGroup==='home'&&!searchOpen&&!menuOpen);
 search?.classList.toggle('active',searchOpen);
 menu?.classList.toggle('active',menuOpen);
 if(menu){
  const meta=hdQNMobileGroupMeta(activeGroup),icon=menu.querySelector('span'),label=menu.querySelector('b');
  if(icon)icon.textContent=meta.icon;if(label)label.textContent=meta.label;
  menu.classList.toggle('has-context',!!activeGroup&&activeGroup!=='home');
  menu.setAttribute('aria-label',activeGroup&&activeGroup!=='home'?`${meta.label}・機能一覧を開く`:'機能一覧を開く');
 }
 if(locationBtn){
  const meta=hdQNMobileGroupMeta(activeGroup);
  const select=document.getElementById('hdWorkspaceSectionSelect');
  const option=select?.selectedOptions?.[0];
  const activeTab=document.querySelector('[data-hd-ws-section].active');
  const sectionLabel=String(option?.textContent||activeTab?.textContent||meta.label||'機能').trim();
  const groupLabel=meta.label||'機能';
  const g=locationBtn.querySelector('[data-hd-mobile-location-group]'),s=locationBtn.querySelector('[data-hd-mobile-location-section]');
  if(g)g.textContent=groupLabel;if(s)s.textContent=sectionLabel;
  locationBtn.setAttribute('aria-label',`${groupLabel}、${sectionLabel}。カテゴリ内機能を開く`);
  locationBtn.title=`${groupLabel} › ${sectionLabel}`;
 }
 if(back){
  let meta={backCount:0,backTarget:null};try{meta=typeof hdWSHistoryMeta==='function'?hdWSHistoryMeta():meta}catch{}
  const canBack=!!meta.backTarget||meta.backCount>0,label=String(meta.backTarget?.label||'');
  back.disabled=!canBack;back.classList.toggle('available',canBack);
  back.title=canBack?(label?`戻る: ${label}`:'ひとつ前の機能へ戻る'):'戻る履歴なし';
  back.setAttribute('aria-label',canBack?(label?`${label}へ戻る`:'ひとつ前の機能へ戻る'):'戻る履歴なし');
 }
 const attention=hdQNMobileAttentionMeta();if(badge){badge.textContent=String(attention.count);badge.hidden=attention.count<=0;badge.setAttribute('aria-label',attention.count?`要対応 ${attention.count}件`:'要対応なし')}
 if(home){const detail=attention.reasons.join('・');home.setAttribute('aria-label',attention.count?('ホーム・確認項目 '+detail):'ホーム');home.title=detail}
 if(sync){
  sync.classList.remove('fresh','stale','partial','missing','return-game');
  const returnReady=typeof hdWSCanReturnGame==='function'&&hdWSCanReturnGame();
  const icon=sync.querySelector('span'),label=sync.querySelector('b'),dot=sync.querySelector('i');
  if(returnReady){
    sync.classList.add('return-game');if(icon)icon.textContent='⚓';if(label)label.textContent='艦これ';if(dot)dot.hidden=true;
    sync.setAttribute('aria-label','艦これへ戻る');sync.title='同期元の艦これへ戻る';
  }else{
    let info={state:'missing',label:'未同期'};try{info=typeof hdWSSyncInfo==='function'?hdWSSyncInfo():info}catch{}
    const state=info.state||'missing',meta={
      fresh:{icon:'✓',label:'最新',aria:'ゲーム同期は最新。状態を開く'},
      stale:{icon:'↻',label:'更新',aria:'ゲーム同期が古い。更新手順を開く'},
      partial:{icon:'＋',label:'補完',aria:'ゲーム同期に未取得項目がある。補完手順を開く'},
      missing:{icon:'↻',label:'同期',aria:'ゲームデータが未同期。同期手順を開く'}
    }[state]||{icon:'↻',label:'同期',aria:'ゲーム同期の状態を開く'};
    sync.classList.add(state);if(icon)icon.textContent=meta.icon;if(label)label.textContent=meta.label;if(dot)dot.hidden=state==='fresh';
    sync.setAttribute('aria-label',meta.aria);sync.title=state==='fresh'?String(info.label||'最新'):meta.aria;
  }
 }
}
function hdQNEnsure(){
  if(document.getElementById('hdQuickNavButton')){hdQNEnsureMobileDock();return;}
  const btn=document.createElement('button');btn.id='hdQuickNavButton';btn.type='button';btn.className='hd-qn-fab';btn.innerHTML='<span>☰</span><b>機能</b>';btn.addEventListener('click',hdQNOpen);document.body.appendChild(btn);
  const d=document.createElement('dialog');d.id='hdQuickNavDialog';d.className='hd-qn-dialog';d.innerHTML=`<div class="hd-qn-head"><div><div class="eyebrow">QUICK NAV</div><h3>機能をすぐ開く</h3></div><button type="button" class="ghost small" data-hd-qn-close>閉じる</button></div><div class="hd-qn-actions"><button type="button" data-hd-qn-back><span>‹</span><b>戻る</b><small data-hd-qn-back-target>履歴なし</small></button><button type="button" data-hd-qn-forward><span>›</span><b>進む</b><small data-hd-qn-forward-target>履歴なし</small></button><button type="button" data-hd-qn-home><span>⌂</span><b>ホーム</b></button><button type="button" data-hd-gs-open><span>⌕</span><b>検索</b></button><button type="button" data-hd-qn-sync><span>↻</span><b>同期</b></button><a href="https://play.games.dmm.com/game/kancolle"><span>⚓</span><b>艦これ</b></a><button type="button" data-hd-qn-top><span>↑</span><b>上へ</b></button></div><div id="hdQNContext" class="hd-qn-context" hidden></div><div id="hdQNRecent" class="hd-qn-recent" hidden></div><div class="hd-qn-tools"><input id="hdQNSearch" type="search" placeholder="機能名で検索"></div><div id="hdQNList" class="hd-qn-list"></div><div class="hd-qn-foot">★を付けた機能は上に固定するよ。</div>`;document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target===d)hdQNClose()});
  document.getElementById('hdQNSearch')?.addEventListener('input',e=>hdQNRenderList(e.target.value));
  hdQNRenderList();hdQNEnsureMobileDock();
}
function hdQNLoadDiagnostics(){
  if(!document.querySelector('link[data-hd-diagnostics-css]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./diagnostics-center.css';l.dataset.hdDiagnosticsCss='1';document.head.appendChild(l)}
  if(document.querySelector('script[data-hd-diagnostics]'))return;
  const s=document.createElement('script');s.src='./diagnostics-center.js';s.dataset.hdDiagnostics='1';if(window.HD_MODULE_STATUS)window.HD_MODULE_STATUS['./diagnostics-center.js']='loading';
  s.onload=()=>{if(window.HD_MODULE_STATUS)window.HD_MODULE_STATUS['./diagnostics-center.js']='ok';try{if(typeof hdDXEnsure==='function')hdDXEnsure()}catch{}};
  s.onerror=()=>{if(window.HD_MODULE_STATUS)window.HD_MODULE_STATUS['./diagnostics-center.js']='error'};
  document.body.appendChild(s);
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-hd-mobile-home-badge]')){hdQNOpenAttention();return}
  if(e.target.closest?.('[data-hd-attention-close]')){hdQNCloseAttention();return}
  const attentionJump=e.target.closest?.('[data-hd-attention-jump]');if(attentionJump){const id=attentionJump.dataset.hdAttentionJump;hdQNCloseAttention();if(typeof hdWSShowElement==='function')hdWSShowElement(id,true);else document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest?.('[data-hd-mobile-back]')){if(typeof hdWSGoBack==='function'&&hdWSGoBack()){setTimeout(hdQNUpdateMobileDock,0)}return}
  if(e.target.closest?.('[data-hd-mobile-location]')){hdQNOpen();return}
  if(e.target.closest?.('[data-hd-mobile-home]')){hdQNMobileHome();return}
  if(e.target.closest?.('[data-hd-mobile-search]')){if(typeof hdGSOpen==='function')hdGSOpen();return}
  if(e.target.closest?.('[data-hd-mobile-sync]')){
    if(typeof hdWSCanReturnGame==='function'&&hdWSCanReturnGame()&&typeof hdWSReturnToGame==='function'){hdWSReturnToGame();setTimeout(hdQNUpdateMobileDock,0);return}
    if(typeof hdWSOpenSyncStatus==='function')hdWSOpenSyncStatus();else hdQNJump('kancolleImport');return
  }
  if(e.target.closest?.('[data-hd-mobile-menu]')){hdQNOpen();return}
  if(e.target.closest?.('[data-hd-qn-close]')){hdQNClose();return}
  if(e.target.closest?.('[data-hd-qn-back]')){const ok=typeof hdWSGoBack==='function'?hdWSGoBack():hdQNBack();hdQNUpdateHistoryActions();if(!ok)hdQNClose();return}
  if(e.target.closest?.('[data-hd-qn-forward]')){const ok=typeof hdWSGoForward==='function'&&hdWSGoForward();hdQNUpdateHistoryActions();if(!ok)hdQNClose();return}
  if(e.target.closest?.('[data-hd-qn-home]')){hdQNClose();if(typeof hdWSShowElement==='function')hdWSShowElement('home',true);else document.getElementById('home')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest?.('[data-hd-qn-sync]')){hdQNJump('kancolleImport');return}
  if(e.target.closest?.('[data-hd-qn-top]')){hdQNClose();window.scrollTo({top:0,behavior:'smooth'});return}
  if(e.target.closest?.('[data-hd-qn-clear-recent]')){hdQNClearRecent();return}
  const context=e.target.closest?.('[data-hd-qn-context]');if(context){hdQNJump(context.dataset.hdQnContext);return}
  const jump=e.target.closest?.('[data-hd-qn-jump]');if(jump){hdQNJump(jump.dataset.hdQnJump);return}
  const pin=e.target.closest?.('[data-hd-qn-pin]');if(pin){hdQNTogglePin(pin.dataset.hdQnPin);return}
});
window.addEventListener('load',()=>setTimeout(()=>{hdQNEnsure();hdQNLoadDiagnostics()},500));
setTimeout(()=>{hdQNEnsure();hdQNLoadDiagnostics()},1200);

window.addEventListener('hd:workspace-changed',e=>{const id=e.detail?.section;if(id){hdQNRecordHistory(id);hdQNRecordRecent(id)}});
window.addEventListener('load',()=>setTimeout(()=>{const id=window.hdWSState?.sections?.[window.hdWSState?.group];if(id)hdQNRecordHistory(id)},1300));

window.addEventListener('hd:workspace-changed',()=>{hdQNUpdateMobileDock();if(document.getElementById('hdQuickNavDialog')?.open)hdQNRenderContext()});
window.addEventListener('hd:kancolle-sync',hdQNUpdateMobileDock);
window.addEventListener('hd:kancolle-return-ready',hdQNUpdateMobileDock);
window.addEventListener('storage',e=>{if(!e||e.key==='harbordesk-kancolle-sync-v1')hdQNUpdateMobileDock()});

window.addEventListener('hd:state-changed',hdQNUpdateMobileDock);
window.addEventListener('hd:quest-changed',hdQNUpdateMobileDock);
window.addEventListener('hd:timer-changed',hdQNUpdateMobileDock);
setInterval(hdQNUpdateMobileDock,60000);

window.addEventListener('hd:global-search-open',hdQNUpdateMobileDock);
window.addEventListener('hd:global-search-close',hdQNUpdateMobileDock);

window.addEventListener('pageshow',hdQNUpdateMobileDock);

window.addEventListener('hd:workspace-history',()=>{hdQNUpdateHistoryActions();hdQNUpdateMobileDock()});
window.addEventListener('hd:quick-nav-updated',()=>{if(document.getElementById('hdQuickNavDialog')?.open){hdQNRenderRecent();hdQNRenderList(document.getElementById('hdQNSearch')?.value||'')}});
