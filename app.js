const KEY='harbordesk-pwa-v1';
const FAV_KEY='harbordesk-guide-favs-v1';
const state=load();
let timerKind='expedition';
let timerEditId='';
let questEditId='';
let notified=new Set();
const GUIDE_VIEW_KEY='harbordesk-session-guide-view-v1';
const TIMER_LAST_KEY='harbordesk-timer-last-v1';
const TIMER_RECENT_KEY='harbordesk-timer-recent-v1';
function timerRecentLoad(){try{return JSON.parse(localStorage.getItem(TIMER_RECENT_KEY)||'{}')||{}}catch{return {}}}
function timerDurationLabel(minutes){
 const m=Number(minutes)||0;if(m>0&&m%60===0)return (m/60)+'時間';if(m>=60)return Math.floor(m/60)+'時間'+(m%60)+'分';return m+'分';
}
function timerRecentSave(kind,name,minutes){
 const all=timerRecentLoad(),rows=Array.isArray(all[kind])?all[kind]:[],n=String(name||'').trim(),m=Number(minutes)||0;
 if(!n||m<=0)return rows;
 const next=[{name:n,minutes:m},...rows.filter(x=>String(x?.name)!==n||Number(x?.minutes)!==m)].slice(0,6);
 all[kind]=next;try{localStorage.setItem(TIMER_RECENT_KEY,JSON.stringify(all))}catch{}return next;
}
function timerRecentRemove(kind,index){
 const all=timerRecentLoad(),rows=Array.isArray(all[kind])?[...all[kind]]:[],i=Number(index);
 if(!Number.isInteger(i)||i<0||i>=rows.length)return rows;
 const [item]=rows.splice(i,1);all[kind]=rows;try{localStorage.setItem(TIMER_RECENT_KEY,JSON.stringify(all))}catch{}renderTimerRecent(kind);
 hdToastAction?.(`${item?.name||'候補'} を候補から削除したよ`,'元に戻す',()=>{const cur=timerRecentLoad(),list=Array.isArray(cur[kind])?[...cur[kind]]:[];if(!list.some(x=>x?.name===item?.name&&Number(x?.minutes)===Number(item?.minutes))){list.splice(Math.min(i,list.length),0,item);cur[kind]=list;try{localStorage.setItem(TIMER_RECENT_KEY,JSON.stringify(cur))}catch{}renderTimerRecent(kind);hdToast('元に戻したよ')}},6500);
 return rows;
}
function renderTimerRecent(kind){
 const host=document.getElementById('timerRecent');if(!host)return;
 const rows=Array.isArray(timerRecentLoad()[kind])?timerRecentLoad()[kind]:[];
 host.innerHTML=rows.map((x,i)=>`<span class="timer-recent-item"><button type="button" class="ghost small" data-timer-recent="${i}"><span>${esc(x.name)}</span><small>${timerDurationLabel(x.minutes)}</small></button><button type="button" class="timer-recent-run" data-timer-recent-run="${i}" aria-label="${esc(x.name)}を同じ時間で開始">＋</button><button type="button" class="timer-recent-remove" data-timer-recent-remove="${i}" aria-label="${esc(x.name)}を候補から削除">×</button></span>`).join('');
 host.hidden=!rows.length;
}
const QUEST_RECENT_KEY='harbordesk-quest-recent-v1';
function questRecentLoad(){try{return JSON.parse(localStorage.getItem(QUEST_RECENT_KEY)||'[]')||[]}catch{return []}}
function questRecentSave(name){
 const value=String(name||'').trim();if(!value)return questRecentLoad();
 const rows=questRecentLoad().filter(x=>x!==value);rows.unshift(value);
 const next=rows.slice(0,6);try{localStorage.setItem(QUEST_RECENT_KEY,JSON.stringify(next))}catch{}return next;
}
function questRecentRemove(name){
 const value=String(name||''),before=questRecentLoad(),i=before.indexOf(value),rows=before.filter(x=>x!==value);try{localStorage.setItem(QUEST_RECENT_KEY,JSON.stringify(rows))}catch{}renderQuestRecent();
 if(i>=0)hdToastAction?.(`${value} を候補から削除したよ`,'元に戻す',()=>{const cur=questRecentLoad();if(!cur.includes(value)){cur.splice(Math.min(i,cur.length),0,value);try{localStorage.setItem(QUEST_RECENT_KEY,JSON.stringify(cur))}catch{}renderQuestRecent();hdToast('元に戻したよ')}},6500);
 return rows;
}
function renderQuestRecent(){
 const host=document.getElementById('questRecent');if(!host)return;
 const rows=questRecentLoad();host.innerHTML=rows.length?rows.map(x=>`<span class="quest-recent-item"><button type="button" class="ghost small" data-quest-recent="${esc(x)}">${esc(x)}</button><button type="button" class="quest-recent-run" data-quest-recent-run="${esc(x)}" aria-label="${esc(x)}を追加">＋</button><button type="button" class="quest-recent-remove" data-quest-recent-remove="${esc(x)}" aria-label="${esc(x)}を候補から削除">×</button></span>`).join(''):'';
 host.hidden=!rows.length;
}
function openQuestDialog(editId=''){
 const input=document.getElementById('questName'),dialog=document.getElementById('questDialog'),title=document.getElementById('questDialogTitle'),saveBtn=document.getElementById('questSave');if(!input||!dialog)return;
 questEditId=String(editId||'');const item=questEditId?state.quests.find(x=>String(x.id)===questEditId):null;if(!item)questEditId='';
 input.value=item?String(item.name||''):'';
 renderQuestRecent();const recent=document.getElementById('questRecent');if(recent&&item)recent.hidden=true;
 if(title)title.textContent=item?'任務を編集':'任務を追加';if(saveBtn)saveBtn.textContent=item?'保存':'追加';
 dialog.showModal();try{input.focus({preventScroll:true});if(item)input.select()}catch{input.focus()}
}
function timerLastLoad(){try{return JSON.parse(localStorage.getItem(TIMER_LAST_KEY)||'{}')||{}}catch{return {}}}
function timerLastSave(kind,name,minutes){
 const all=timerLastLoad();all[kind]={name:String(name||''),minutes:Number(minutes)||30};
 try{localStorage.setItem(TIMER_LAST_KEY,JSON.stringify(all))}catch{}
 timerRecentSave(kind,name,minutes);
 return all[kind];
}
function guideViewLoad(){try{return JSON.parse(sessionStorage.getItem(GUIDE_VIEW_KEY)||'{}')||{}}catch{return {}}}
function guideViewSave(patch={}){const next={...guideViewLoad(),...patch};try{sessionStorage.setItem(GUIDE_VIEW_KEY,JSON.stringify(next))}catch{}return next}
const guideView=guideViewLoad();
let guideFilter=['all','map','quest','expedition','fav'].includes(guideView.filter)?guideView.filter:'all';
let selectedWorld=/^[1-7]$/.test(String(guideView.world||''))?String(guideView.world):'1';
let selectedMap=/^[1-7]-[1-9]$/.test(String(guideView.map||''))?String(guideView.map):'';
const guideFavs=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));

const MAPS={
 '1':['1-1','1-2','1-3','1-4','1-5','1-6'],
 '2':['2-1','2-2','2-3','2-4','2-5'],
 '3':['3-1','3-2','3-3','3-4','3-5'],
 '4':['4-1','4-2','4-3','4-4','4-5'],
 '5':['5-1','5-2','5-3','5-4','5-5'],
 '6':['6-1','6-2','6-3','6-4','6-5'],
 '7':['7-1','7-2','7-3','7-4','7-5']
};
const WORLD_NAMES={'1':'鎮守府海域','2':'南西諸島海域','3':'北方海域','4':'西方海域','5':'南方海域','6':'中部海域','7':'南西海域'};

const MAP_DETAILS={
 '3-2':{
  name:'キス島撤退作戦',
  overview:'駆逐艦主体の特殊な海域。ボス到達には艦種条件が厳しく、基本は6隻編成で挑む。',
  formation:'軽巡1＋駆逐5、または駆逐6が基本候補。駆逐4を必須とするボス到達編成もある。',
  route:'代表例は CEFL / CGFL。G経由ではうずしおがあり、高速統一＋電探搭載艦がいる場合はF/H分岐。',
  air:'通常攻略では制空より、道中突破・電探・速度条件を優先。',
  caution:'Hマスの戦艦ル級eliteなどで大破撤退が起きやすい。Gうずしお対策として複数艦への電探搭載も有効。',
  sourceDate:'攻略Wiki 最終更新 2026-08-12'
 },
 '5-5':{
  name:'第二次サーモン海戦',
  overview:'高難度のExtra Operation。ボス旗艦撃沈でゲージが20%減少し、5回撃沈でクリア。',
  formation:'編成は目的・ルート・任務条件で大きく変わるため、重量編成や中央/下ルート系などから手持ちに合わせて選ぶ。',
  route:'複数の実用ルートがあり、任務条件やゲージ破壊前後で最適解が変わる。',
  air:'空母を使う編成では制空調整が重要。ボス編成やゲージ状態により要求が変化するため、出撃前に最新値を確認。',
  caution:'道中・ボスとも強力。必要に応じて道中支援/決戦支援、キラ付け、装備調整を検討。',
  sourceDate:'攻略Wiki 最終更新 2026-09-06'
 },
 '6-5':{
  name:'空母機動部隊迎撃戦',
  overview:'基地航空隊と協同するExtra Operation。ボス旗艦撃沈でゲージが1/6減少し、6回撃沈でクリア。',
  formation:'上ルート・下ルートなど複数の攻略形があり、基地航空隊と本隊の役割分担が重要。',
  route:'出撃には6-4クリアに加え、基地航空隊の開放が必要。',
  air:'敵航空戦力が強いため、本隊制空と基地航空隊の配分を合わせて調整する。',
  caution:'ボスは連合艦隊12隻。夜戦で主力艦隊を狙うためにも護衛部隊を昼戦までに減らす意識が重要。',
  sourceDate:'攻略Wiki 最終更新 2026-09-05'
 },
 '7-5':{
  name:'スラバヤ沖海戦・バタビア沖海戦',
  overview:'複数ゲージ＋ギミック式の海域。第1→ギミック→第2→第3ゲージと段階的に進む。',
  formation:'ゲージごとに敵性質が違うため、同じ編成を使い続けるより段階ごとに組み替える前提で考える。',
  route:'第1ゲージ破壊後にL〜Qが出現。MマスS勝利1回で第三ゲージ出現ギミックを進める。',
  air:'段階により航空戦・対地の比重が変わるため、選択中のゲージに合わせて装備を変更。',
  caution:'第2ゲージ旗艦は陸上型。対地装備を忘れず、現在どのゲージを攻略中か確認して出撃する。',
  sourceDate:'攻略Wiki 2026-09-17参照'
 }
};

const GUIDE=[
{id:'maps',type:'map',title:'通常海域 攻略入口',subtitle:'海域',summary:'通常海域の攻略情報を確認。上の海域セレクタから個別海域を選択できる。',keywords:'海域 1-1 2-4 3-2 5-5 6-5 7-5 攻略',url:'https://wikiwiki.jp/kancolle/'},
{id:'early',type:'map',title:'序盤海域攻略指南',subtitle:'初心者向け',summary:'序盤の進め方、遠征開放、任務消化などをまとめて確認。',keywords:'序盤 初心者 海域 遠征 任務',url:'https://wikiwiki.jp/kancolle/%E5%BA%8F%E7%9B%A4%E6%B5%B7%E5%9F%9F%E6%94%BB%E7%95%A5%E6%8C%87%E5%8D%97'},
{id:'exp-main',type:'expedition',title:'遠征 総合ガイド',subtitle:'遠征',summary:'遠征の概要、開放条件、海域別一覧への入口。',keywords:'遠征 資源 燃料 弾薬 鋼材 ボーキ 開放',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81'},
{id:'exp-detail',type:'expedition',title:'遠征 詳細一覧表',subtitle:'時間・条件・報酬',summary:'遠征時間、必要編成、必要Lv、消費、獲得資源などを一覧で確認。',keywords:'遠征 時間 編成 報酬 大成功 旗艦 レベル',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81/%E8%A9%B3%E7%B4%B0%E4%B8%80%E8%A6%A7%E8%A1%A8'},
{id:'exp-05',type:'expedition',title:'05 海上護衛任務',subtitle:'鎮守府海域',summary:'資源回収でよく参照される遠征。詳細条件と報酬は一覧表から確認。',keywords:'05 海上護衛任務 燃料 弾薬 資源',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81/%E8%A9%B3%E7%B4%B0%E4%B8%80%E8%A6%A7%E8%A1%A8'},
{id:'quest-exp',type:'quest',title:'遠征任務一覧',subtitle:'任務',summary:'単発・デイリー・ウィークリー・マンスリーなどの遠征任務を確認。',keywords:'任務 遠征 デイリー ウィークリー マンスリー クォータリー イヤーリー',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E9%81%A0%E5%BE%81%E4%BB%BB%E5%8B%99'},
{id:'quest-main',type:'quest',title:'任務 攻略入口',subtitle:'任務',summary:'任務の条件、前提任務、報酬を探す入口。',keywords:'任務 デイリー ウィークリー マンスリー 単発 あ号 ろ号',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99'}
];
const guideLabels={all:'すべて',map:'海域',quest:'任務',expedition:'遠征',fav:'★ お気に入り'};

function load(){try{return JSON.parse(localStorage.getItem(KEY))||blankState()}catch{return blankState()}}
function blankState(){return{expeditions:[],docks:[],quests:[],resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}}}
function hdAppStateSnapshot(){
 return {
  expeditions:Array.isArray(state.expeditions)?state.expeditions.map(x=>({...x})):[],
  docks:Array.isArray(state.docks)?state.docks.map(x=>({...x})):[],
  quests:Array.isArray(state.quests)?state.quests.map(x=>({...x})):[],
  resources:{...(state.resources||{})}
 };
}
window.hdGetAppState=hdAppStateSnapshot;
function save(){
 localStorage.setItem(KEY,JSON.stringify(state));
 window.dispatchEvent(new CustomEvent('hd:state-changed',{detail:hdAppStateSnapshot()}));
}
function esc(s){return String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]||c))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
let HD_TOAST_TIMER=0;
function hdToast(message,type='ok',ms=1800){
 let host=document.getElementById('hdToastRegion');
 if(!host){host=document.createElement('div');host.id='hdToastRegion';host.className='hd-toast-region';host.setAttribute('role','status');host.setAttribute('aria-live','polite');host.setAttribute('aria-atomic','true');document.body.appendChild(host)}
 clearTimeout(HD_TOAST_TIMER);host.className='hd-toast-region '+String(type||'ok');host.textContent=String(message||'');host.classList.add('show');
 HD_TOAST_TIMER=setTimeout(()=>host.classList.remove('show'),Math.max(900,Number(ms)||1800));
 return host;
}
window.hdToast=hdToast;
function hdToastAction(message,label,onAction,ms=5000){
 let host=document.getElementById('hdToastRegion');
 if(!host){host=document.createElement('div');host.id='hdToastRegion';host.className='hd-toast-region';host.setAttribute('role','status');host.setAttribute('aria-live','polite');host.setAttribute('aria-atomic','true');document.body.appendChild(host)}
 clearTimeout(HD_TOAST_TIMER);host.className='hd-toast-region action warn';host.textContent='';
 const text=document.createElement('span');text.textContent=String(message||'');
 const btn=document.createElement('button');btn.type='button';btn.className='hd-toast-action';btn.textContent=String(label||'元に戻す');
 btn.addEventListener('click',()=>{clearTimeout(HD_TOAST_TIMER);try{onAction?.()}finally{host.classList.remove('show')}},{once:true});
 host.append(text,btn);host.classList.add('show');
 HD_TOAST_TIMER=setTimeout(()=>host.classList.remove('show'),Math.max(1800,Number(ms)||5000));
 return host;
}
window.hdToastAction=hdToastAction;
function fmt(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}
function wikiMapUrl(map){const world=map.split('-')[0];return `https://wikiwiki.jp/kancolle/${encodeURIComponent(WORLD_NAMES[world])}/${map}`}

function hdCoreMapToolsHtml(){
 return `<section class="hd-core-map-tools" data-hd-core-map-tools>
  <div class="hd-core-map-tools-head"><div><span class="eyebrow">攻略ツール</span><strong>この海域で使える機能</strong></div><small>必ず表示される基本入口</small></div>
  <div class="hd-core-map-tools-grid">
   <button type="button" data-hd-core-map-action="map">マップ詳細</button>
   <button type="button" data-hd-core-map-action="fleet">編成</button>
   <button type="button" data-hd-core-map-action="suggest">編成候補</button>
   <button type="button" data-hd-core-map-action="prep">出撃準備</button>
   <button type="button" data-hd-core-map-action="gear">装備・計算</button>
   <button type="button" data-hd-core-map-action="drop">ドロップ</button>
   <button type="button" data-hd-core-map-action="mine">自分用</button>
  </div>
 </section>`;
}
async function hdCoreMapAction(action){
 if(!action)return false;
 if(typeof window.hdMapOpenTool==='function'){
  try{if(await window.hdMapOpenTool(action))return true}catch{}
 }
 const lazy=action==='suggest'?['hdFSOpen','編成候補']:action==='prep'?['hdSPSOpen','出撃準備']:null;
 if(lazy){
  const [fn,label]=lazy;
  const button=document.querySelector(`[data-hd-core-map-action="${action}"]`);
  if(typeof window[fn]!=='function'&&typeof window.hdEnsureCurrentAssets==='function'){
   button?.setAttribute('aria-busy','true');
   try{await window.hdEnsureCurrentAssets()}catch{}
   finally{button?.removeAttribute('aria-busy')}
  }
  if(typeof window[fn]==='function'){window[fn]();return true}
  window.hdToast?.(`${label}を読み込めなかったよ。アプリ更新を試してね`,'warn');
  return false;
 }
 const tab=document.querySelector(`[data-map-tab="${action}"]`);
 if(tab){tab.click();return true}
 const targets={map:'selectedMapCard',fleet:'selectedMapCard',gear:'hdFleetCalculator',drop:'dropHuntingDb',mine:'customFleetPanel'};
 const id=targets[action],el=id&&document.getElementById(id);
 if(el){
  if(typeof window.hdWSShowElement==='function'&&window.hdWSShowElement(el,true))return true;
  el.scrollIntoView({behavior:'smooth',block:'start'});return true;
 }
 return false;
}
window.hdCoreMapToolsHtml=hdCoreMapToolsHtml;
window.hdCoreMapAction=hdCoreMapAction;

function renderMapPicker(){
 document.getElementById('worldPicker').innerHTML=Object.keys(MAPS).map(w=>`<button class="world-chip ${selectedWorld===w?'active':''}" data-world="${w}">${w}海域</button>`).join('');
 document.getElementById('mapPicker').innerHTML=MAPS[selectedWorld].map(m=>`<button class="map-button ${selectedMap===m?'active':''}" data-map="${m}">${m}</button>`).join('');
 const card=document.getElementById('selectedMapCard');
 if(!selectedMap){card.innerHTML='<div class="empty">海域を選ぶとここに攻略情報が出るよ</div>';return}
 const d=MAP_DETAILS[selectedMap];
 if(!d){
  card.innerHTML=`<article class="guide-card selected"><div class="guide-card-top"><div><span class="guide-tag">${WORLD_NAMES[selectedWorld]}</span><h3>${selectedMap} 攻略</h3><div class="muted">攻略データ拡充中</div></div></div><p>${selectedMap} の詳細攻略データは順次追加中。現在は元Wikiからルート・敵編成・制空・ドロップを確認できるよ。</p><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">${selectedMap} の攻略Wikiを見る ↗</a></article>`;
  return;
 }
 card.innerHTML=`<article class="map-detail-card"><div class="map-detail-title"><div><span class="guide-tag">${WORLD_NAMES[selectedWorld]}</span><h3>${selectedMap} ${esc(d.name)}</h3><div class="muted">${esc(d.sourceDate)}</div></div></div><div class="map-detail-section"><strong>概要</strong><p>${esc(d.overview)}</p></div>${hdCoreMapToolsHtml()}<div class="map-detail-grid"><div class="map-detail-section"><strong>おすすめ編成</strong><p>${esc(d.formation)}</p></div><div class="map-detail-section"><strong>主なルート</strong><p>${esc(d.route)}</p></div><div class="map-detail-section"><strong>制空・航空</strong><p>${esc(d.air)}</p></div><div class="map-detail-section warn"><strong>注意点</strong><p>${esc(d.caution)}</p></div></div><div class="map-detail-actions"><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">最新の攻略Wikiを確認 ↗</a></div></article>`;
}

window.hdMapBaseRenderPicker=renderMapPicker;

function renderGuide(){
 renderMapPicker();
 const filters=document.getElementById('guideFilters');
 filters.innerHTML=Object.entries(guideLabels).map(([k,v])=>`<button class="guide-chip ${guideFilter===k?'active':''}" data-guide-filter="${k}">${v}</button>`).join('');
 const input=document.getElementById('guideQuery'),q=input.value.trim().toLowerCase(),reset=document.getElementById('guideResetBtn');
 if(reset)reset.hidden=!q&&guideFilter==='all'&&!selectedMap;
 guideViewSave({query:input.value,filter:guideFilter,world:selectedWorld,map:selectedMap});

 const rows=GUIDE.filter(x=>(guideFilter==='all'||(guideFilter==='fav'?guideFavs.has(x.id):x.type===guideFilter))&&(!q||`${x.title} ${x.subtitle} ${x.summary} ${x.keywords}`.toLowerCase().includes(q)));
 document.getElementById('guideResults').innerHTML=rows.length?rows.map(x=>`<article class="guide-card"><div class="guide-card-top"><div><span class="guide-tag">${guideLabels[x.type]}</span><h3>${esc(x.title)}</h3><div class="muted">${esc(x.subtitle)}</div></div><button class="guide-fav" data-guide-fav="${x.id}" aria-label="お気に入り">${guideFavs.has(x.id)?'★':'☆'}</button></div><p>${esc(x.summary)}</p><a class="guide-link" href="${x.url}" target="_blank" rel="noopener">攻略Wikiで詳しく見る ↗</a></article>`).join(''):`<div class="empty empty-action"><strong>該当する攻略情報がないよ</strong><p>${q?`「${esc(q)}」の検索結果は0件`:guideFilter==='fav'?'お気に入り登録した攻略情報がまだないよ':`${guideLabels[guideFilter]||'現在の条件'}では0件`}</p><div class="empty-action-buttons">${q?'<button type="button" class="ghost small" data-guide-clear-query>検索をクリア</button>':''}${guideFilter!=='all'?'<button type="button" class="ghost small" data-guide-show-all>すべて表示</button>':''}</div></div>`;
}

document.addEventListener('click',e=>{
 const filter=e.target.closest('[data-core-filter-kind]');if(filter){const kind=filter.dataset.coreFilterKind,value=filter.dataset.coreFilter;coreListFilterSave(kind,value);kind==='quest'?renderQuests():renderTimers(kind);return}
 const showAll=e.target.closest('[data-core-filter-show-all]');if(showAll){const kind=showAll.dataset.coreFilterShowAll;coreListFilterSave(kind,'all');kind==='quest'?renderQuests():renderTimers(kind);return}
 const cleanup=e.target.closest('[data-core-cleanup]');if(cleanup){coreCleanupDone(cleanup.dataset.coreCleanup);return}

 const world=e.target.closest('[data-world]');if(world){selectedWorld=world.dataset.world;selectedMap='';guideViewSave({world:selectedWorld,map:''});renderGuide();return}
 const map=e.target.closest('[data-map]');if(map){selectedMap=map.dataset.map;selectedWorld=selectedMap.split('-')[0];guideViewSave({world:selectedWorld,map:selectedMap});renderGuide();document.getElementById('selectedMapCard').scrollIntoView({behavior:'smooth',block:'center'});return}
 const coreMapAction=e.target.closest('[data-hd-core-map-action]');if(coreMapAction){hdCoreMapAction(coreMapAction.dataset.hdCoreMapAction).catch(()=>{});return}
 const clearGuideQuery=e.target.closest('[data-guide-clear-query]');if(clearGuideQuery){const input=document.getElementById('guideQuery');if(input)input.value='';guideViewSave({query:''});renderGuide();input?.focus();return}
 if(e.target.closest('[data-guide-show-all]')){guideFilter='all';guideViewSave({filter:'all'});renderGuide();return}
 const gf=e.target.closest('[data-guide-filter]');if(gf){guideFilter=gf.dataset.guideFilter;guideViewSave({filter:guideFilter});renderGuide();return}
 const fav=e.target.closest('[data-guide-fav]');if(fav){const id=fav.dataset.guideFav;guideFavs.has(id)?guideFavs.delete(id):guideFavs.add(id);localStorage.setItem(FAV_KEY,JSON.stringify([...guideFavs]));renderGuide();return}
 const emptyTimer=e.target.closest('[data-empty-add-timer]');if(emptyTimer){openTimer(emptyTimer.dataset.emptyAddTimer);return}
 if(e.target.closest('[data-empty-add-quest]')){openQuestDialog();return}
 const editTimer=e.target.closest('[data-edit-timer]');if(editTimer){openTimer(editTimer.dataset.kind,editTimer.dataset.editTimer);return}
 const editQuest=e.target.closest('[data-edit-quest]');if(editQuest){openQuestDialog(editQuest.dataset.editQuest);return}
 const adjust=e.target.closest('[data-adjust-timer]');if(adjust){
  const k=adjust.dataset.kind==='dock'?'dock':'expedition',arr=k==='expedition'?state.expeditions:state.docks,item=arr.find(x=>String(x.id)===String(adjust.dataset.adjustTimer)),delta=Number(adjust.dataset.minutes)||0;
  if(!item||delta<=0)return;
  const before=Number(item.endsAt)||Date.now();item.endsAt=before+delta*60000;save();renderTimers(k);tick();try{if(typeof renderHomeDashboard==='function')renderHomeDashboard()}catch{}
  hdToastAction(`${item.name} を ${delta}分延長したよ`,'元に戻す',()=>{item.endsAt=before;save();renderTimers(k);tick();try{if(typeof renderHomeDashboard==='function')renderHomeDashboard()}catch{};hdToast('元に戻したよ')});
  return
 }
 const restart=e.target.closest('[data-restart-timer]');if(restart){
  const k=restart.dataset.kind==='dock'?'dock':'expedition',arr=k==='expedition'?state.expeditions:state.docks,item=arr.find(x=>String(x.id)===String(restart.dataset.restartTimer));
  if(!item)return;
  const mins=Number(item.durationMinutes)||0;if(mins<=0)return;
  const startedAt=Date.now();item.startedAt=startedAt;item.endsAt=startedAt+mins*60000;
  timerLastSave(k,item.name,mins);save();renderTimers(k);tick();
  hdToast(`${item.name} をもう一度開始したよ`);return
 }
 const del=e.target.closest('[data-delete-timer]');if(del){const k=del.dataset.kind,arr=k==='expedition'?state.expeditions:state.docks,i=arr.findIndex(x=>x.id===del.dataset.deleteTimer);if(i<0)return;const [item]=arr.splice(i,1);save();renderTimers(k);hdToastAction(`${item.name} を削除したよ`,'元に戻す',()=>{const target=k==='expedition'?state.expeditions:state.docks;if(!target.some(x=>x.id===item.id)){target.splice(Math.min(i,target.length),0,item);save();renderTimers(k);hdToast('元に戻したよ')}});return}
 const qd=e.target.closest('[data-delete-quest]');if(qd){const i=state.quests.findIndex(x=>x.id===qd.dataset.deleteQuest);if(i<0)return;const [item]=state.quests.splice(i,1);save();renderQuests();hdToastAction(`${item.name} を削除したよ`,'元に戻す',()=>{if(!state.quests.some(x=>x.id===item.id)){state.quests.splice(Math.min(i,state.quests.length),0,item);save();renderQuests();hdToast('元に戻したよ')}});return}
});
const guideQueryInput=document.getElementById('guideQuery');
if(guideQueryInput){guideQueryInput.value=String(guideView.query||'');guideQueryInput.addEventListener('input',()=>{guideViewSave({query:guideQueryInput.value});renderGuide()})}
document.getElementById('guideSearchBtn').onclick=renderGuide;
document.getElementById('guideResetBtn').onclick=()=>{guideFilter='all';selectedMap='';selectedWorld='1';if(guideQueryInput)guideQueryInput.value='';guideViewSave({query:'',filter:'all',world:'1',map:''});renderGuide()};

const CORE_LIST_FILTER_KEY='harbordesk-core-list-filters-v1';
function coreListFiltersLoad(){try{const v=JSON.parse(localStorage.getItem(CORE_LIST_FILTER_KEY)||'{}')||{};return {expedition:v.expedition||'active',dock:v.dock||'active',quest:v.quest||'active'}}catch{return {expedition:'active',dock:'active',quest:'active'}}}
let coreListFilters=coreListFiltersLoad();
function coreListFilterSave(kind,value){
 if(!['expedition','dock','quest'].includes(kind)||!['active','all','done'].includes(value))return;
 coreListFilters={...coreListFilters,[kind]:value};try{localStorage.setItem(CORE_LIST_FILTER_KEY,JSON.stringify(coreListFilters))}catch{}
}
function coreListFilterRender(kind,shown,total){
 const bar=document.querySelector(`[data-core-filter-bar="${kind}"]`);if(!bar)return;
 bar.querySelectorAll('[data-core-filter]').forEach(b=>b.classList.toggle('active',b.dataset.coreFilter===coreListFilters[kind]));
 const count=document.getElementById(kind==='expedition'?'expeditionFilterCount':kind==='dock'?'dockFilterCount':'questFilterCount');
 if(count)count.textContent=shown===total?`${total}件`:`${shown} / ${total}件`;
 const now=Date.now(),arr=kind==='expedition'?state.expeditions:kind==='dock'?state.docks:state.quests;
 const doneCount=kind==='quest'?arr.filter(x=>x.done).length:arr.filter(x=>Number(x.endsAt)<=now).length;
 const cleanup=bar.querySelector('[data-core-cleanup]');if(cleanup){cleanup.hidden=doneCount===0;cleanup.textContent=doneCount?`完了を整理 ${doneCount}`:'完了を整理'}
}
function coreCleanupDone(kind){
 const now=Date.now(),arr=kind==='expedition'?state.expeditions:kind==='dock'?state.docks:kind==='quest'?state.quests:null;if(!arr)return false;
 const isDone=kind==='quest'?(x=>!!x.done):(x=>Number(x.endsAt)<=now);
 const removed=arr.map((item,index)=>({item,index})).filter(x=>isDone(x.item));if(!removed.length)return false;
 const keep=arr.filter(x=>!isDone(x));
 if(kind==='expedition')state.expeditions=keep;else if(kind==='dock')state.docks=keep;else state.quests=keep;
 save();kind==='quest'?renderQuests():renderTimers(kind);
 const label=kind==='expedition'?'遠征':kind==='dock'?'入渠':'任務';
 hdToastAction(`${label}の完了済み ${removed.length}件を整理したよ`,'元に戻す',()=>{
  const target=kind==='expedition'?state.expeditions:kind==='dock'?state.docks:state.quests;
  for(const row of removed.sort((a,b)=>a.index-b.index)){if(!target.some(x=>x.id===row.item.id))target.splice(Math.min(row.index,target.length),0,row.item)}
  save();kind==='quest'?renderQuests():renderTimers(kind);hdToast('元に戻したよ');
 });
 return true;
}
function coreFilteredEmpty(kind,label){
 const mode=coreListFilters[kind],text=mode==='done'?'完了済み':kind==='quest'?'未完了':'稼働中';
 return `<div class="empty empty-action"><strong>${label}の${text}はないよ</strong><p>保存済みの項目は「すべて」で確認できるよ。</p><button type="button" class="ghost small" data-core-filter-show-all="${kind}">すべて表示</button></div>`;
}
function renderTimers(kind){
 const arr=kind==='expedition'?state.expeditions:state.docks,el=document.getElementById(kind==='expedition'?'expeditionList':'dockList'),label=kind==='expedition'?'遠征':'入渠';
 if(!arr.length){coreListFilterRender(kind,0,0);el.innerHTML=`<div class="empty empty-action"><strong>${label}タイマーはまだないよ</strong><p>必要になったらここからすぐ追加できるよ。</p><button type="button" class="primary small" data-empty-add-timer="${kind}">＋ ${label}タイマーを追加</button></div>`;return}
 const now=Date.now(),mode=coreListFilters[kind]||'active';
 const rows=[...arr].filter(t=>mode==='all'||(mode==='active'?Number(t.endsAt)>now:Number(t.endsAt)<=now)).sort((a,b)=>a.endsAt-b.endsAt);
 coreListFilterRender(kind,rows.length,arr.length);
 if(!rows.length){el.innerHTML=coreFilteredEmpty(kind,label+'タイマー');return}
 el.innerHTML=rows.map(t=>{const done=Number(t.endsAt)<=now,duration=Number(t.durationMinutes)||0;return `<div class="timer ${done?'done':''}"><div class="timer-main"><div class="timer-name">${esc(t.name)}</div><div class="timer-time" data-end="${t.endsAt}">${fmt(t.endsAt-now)}</div></div><div class="timer-actions">${!done?`<button type="button" class="ghost small" data-edit-timer="${t.id}" data-kind="${kind}">編集</button><button type="button" class="ghost small timer-adjust" data-adjust-timer="${t.id}" data-kind="${kind}" data-minutes="15">+15</button><button type="button" class="ghost small timer-adjust" data-adjust-timer="${t.id}" data-kind="${kind}" data-minutes="30">+30</button>`:''}${done&&duration>0?`<button type="button" class="ghost small" data-restart-timer="${t.id}" data-kind="${kind}">もう一度</button>`:''}<button class="icon-btn" data-delete-timer="${t.id}" data-kind="${kind}" aria-label="削除">×</button></div></div>`}).join('');
}
function renderQuests(){
 const el=document.getElementById('questList');
 if(!state.quests.length){coreListFilterRender('quest',0,0);el.innerHTML='<div class="empty empty-action"><strong>任務はまだないよ</strong><p>手動で残したい任務をここから追加できるよ。</p><button type="button" class="primary small" data-empty-add-quest>＋ 任務を追加</button></div>';return}
 const mode=coreListFilters.quest||'active',rows=state.quests.filter(q=>mode==='all'||(mode==='active'?!q.done:!!q.done));
 coreListFilterRender('quest',rows.length,state.quests.length);
 if(!rows.length){el.innerHTML=coreFilteredEmpty('quest','任務');return}
 el.innerHTML=rows.map(q=>`<div class="quest"><input type="checkbox" data-quest-check="${q.id}" ${q.done?'checked':''}><div class="quest-main"><div class="quest-name" style="${q.done?'text-decoration:line-through;opacity:.6':''}">${esc(q.name)}</div></div><button type="button" class="ghost small" data-edit-quest="${q.id}">編集</button><button class="icon-btn" data-delete-quest="${q.id}">×</button></div>`).join('');
}
function renderResources(){['fuel','ammo','steel','bauxite'].forEach(k=>document.getElementById(k).value=state.resources[k]??'');document.getElementById('resourceSaved').textContent=state.resources.savedAt?`最終保存: ${new Date(state.resources.savedAt).toLocaleString('ja-JP')}`:''}
function render(){renderGuide();renderTimers('expedition');renderTimers('dock');renderQuests();renderResources()}
function timerStartRecent(kind,index){
 const rows=Array.isArray(timerRecentLoad()[kind])?timerRecentLoad()[kind]:[],row=rows[Number(index)];
 if(!row?.name||!(Number(row.minutes)>0))return false;
 const startedAt=Date.now(),target=kind==='expedition'?state.expeditions:state.docks,item={id:uid(),name:String(row.name),startedAt,durationMinutes:Number(row.minutes),endsAt:startedAt+Number(row.minutes)*60000};
 timerLastSave(kind,row.name,row.minutes);target.push(item);
 save();render();document.getElementById('timerDialog')?.close();
 hdToastAction(`${row.name} を開始したよ`,'元に戻す',()=>{const i=target.findIndex(x=>String(x.id)===String(item.id));if(i>=0)target.splice(i,1);save();render();hdToast('元に戻したよ')},6500);return true;
}
function questAddRecent(name){
 const value=String(name||'').trim();if(!value)return false;
 if(state.quests.some(q=>!q.done&&String(q.name||'').trim()===value)){hdToast(`${value} は未完了で登録済みだよ`,'warn',2400);return false}
 const item={id:uid(),name:value,done:false};questRecentSave(value);state.quests.push(item);save();renderQuests();document.getElementById('questDialog')?.close();
 hdToastAction(`${value} を追加したよ`,'元に戻す',()=>{const i=state.quests.findIndex(x=>String(x.id)===String(item.id));if(i>=0)state.quests.splice(i,1);save();renderQuests();hdToast('元に戻したよ')},6500);return true;
}
function openTimer(kind,editId=''){
 timerKind=kind==='dock'?'dock':'expedition';timerEditId=String(editId||'');
 const arr=timerKind==='expedition'?state.expeditions:state.docks,item=timerEditId?arr.find(x=>String(x.id)===timerEditId):null,saved=timerLastLoad()[timerKind]||{};
 if(!item)timerEditId='';
 const title=document.getElementById('timerDialogTitle'),saveBtn=document.getElementById('timerSave'),name=document.getElementById('timerName'),mins=document.getElementById('timerMinutes');
 if(title)title.textContent=item?(timerKind==='expedition'?'遠征タイマー編集':'入渠タイマー編集'):(timerKind==='expedition'?'遠征タイマー追加':'入渠タイマー追加');
 if(name)name.value=item?String(item.name||''):String(saved.name||'');
 const remaining=item?Math.max(1,Math.ceil((Number(item.endsAt||0)-Date.now())/60000)):Number(saved.minutes)||30;if(mins)mins.value=String(remaining);
 renderTimerRecent(timerKind);const recent=document.getElementById('timerRecent');if(recent&&item)recent.hidden=true;
 if(saveBtn)saveBtn.textContent=item?'保存':'開始';
 const dialog=document.getElementById('timerDialog');dialog.showModal();
 try{name?.focus({preventScroll:true});if(name?.value)name.select()}catch{}
}

document.addEventListener('click',e=>{
 const timerRun=e.target.closest?.('[data-timer-recent-run]');if(timerRun){timerStartRecent(timerKind,timerRun.dataset.timerRecentRun);return}
 const questRun=e.target.closest?.('[data-quest-recent-run]');if(questRun){questAddRecent(questRun.dataset.questRecentRun);return}
 const timerRemove=e.target.closest?.('[data-timer-recent-remove]');if(timerRemove){timerRecentRemove(timerKind,timerRemove.dataset.timerRecentRemove);return}
 const questRemove=e.target.closest?.('[data-quest-recent-remove]');if(questRemove){questRecentRemove(questRemove.dataset.questRecentRemove);return}
 const timerRecent=e.target.closest?.('[data-timer-recent]');if(timerRecent){
  const rows=timerRecentLoad()[timerKind]||[],row=rows[Number(timerRecent.dataset.timerRecent)];
  if(row){const name=document.getElementById('timerName'),mins=document.getElementById('timerMinutes');if(name)name.value=String(row.name||'');if(mins)mins.value=String(Number(row.minutes)||30);try{name?.focus({preventScroll:true});name?.select()}catch{}}
  return;
 }
 const preset=e.target.closest?.('[data-timer-minutes]');if(preset){const input=document.getElementById('timerMinutes');if(input){input.value=preset.dataset.timerMinutes;try{input.focus({preventScroll:true})}catch{input.focus()}}return}
 const recent=e.target.closest?.('[data-quest-recent]');if(recent){const input=document.getElementById('questName');if(input){input.value=recent.dataset.questRecent||recent.textContent||'';try{input.focus({preventScroll:true});input.select()}catch{input.focus()}}}
});
document.getElementById('addExpedition').onclick=()=>openTimer('expedition');document.getElementById('addDock').onclick=()=>openTimer('dock');document.getElementById('addQuest').onclick=openQuestDialog;
document.getElementById('timerForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel'){timerEditId='';return}const name=document.getElementById('timerName').value.trim(),mins=Number(document.getElementById('timerMinutes').value);if(!name||!mins)return;const target=timerKind==='expedition'?state.expeditions:state.docks,editing=timerEditId?target.find(x=>String(x.id)===String(timerEditId)):null;if(editing){const before={...editing};const startedAt=Date.now();editing.name=name;editing.startedAt=startedAt;editing.durationMinutes=mins;editing.endsAt=startedAt+mins*60000;timerLastSave(timerKind,name,mins);timerEditId='';save();render();hdToastAction(`${name} を更新したよ`,'元に戻す',()=>{Object.assign(editing,before);save();render();hdToast('元に戻したよ')},6500);return}const startedAt=Date.now(),item={id:uid(),name,startedAt,durationMinutes:mins,endsAt:startedAt+mins*60000};timerLastSave(timerKind,name,mins);target.push(item);save();render();hdToastAction(`${name} を開始したよ`,'元に戻す',()=>{const i=target.findIndex(x=>String(x.id)===String(item.id));if(i>=0)target.splice(i,1);save();render();hdToast('元に戻したよ')},6500)});
document.getElementById('questForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel'){questEditId='';return}const name=document.getElementById('questName').value.trim();if(!name)return;const editing=questEditId?state.quests.find(x=>String(x.id)===String(questEditId)):null;if(state.quests.some(q=>q!==editing&&!q.done&&String(q.name||'').trim()===name)){e.preventDefault();hdToast(`${name} は未完了で登録済みだよ`,'warn',2400);return}if(editing){const before=editing.name;editing.name=name;questRecentSave(name);questEditId='';save();renderQuests();hdToastAction(`${name} に変更したよ`,'元に戻す',()=>{editing.name=before;save();renderQuests();hdToast('元に戻したよ')},6500);return}const item={id:uid(),name,done:false};questRecentSave(name);state.quests.push(item);save();renderQuests();hdToastAction(`${name} を追加したよ`,'元に戻す',()=>{const i=state.quests.findIndex(x=>String(x.id)===String(item.id));if(i>=0)state.quests.splice(i,1);save();renderQuests();hdToast('元に戻したよ')},6500)});
document.addEventListener('change',e=>{if(e.target.matches('[data-quest-check]')){const q=state.quests.find(x=>x.id===e.target.dataset.questCheck);if(q){q.done=e.target.checked;save();renderQuests()}}});
document.getElementById('saveResources').onclick=()=>{['fuel','ammo','steel','bauxite'].forEach(k=>state.resources[k]=document.getElementById(k).value);state.resources.savedAt=Date.now();save();renderResources();hdToast('資源を保存したよ')};

const secretaryLines=['提督、3-2・5-5・6-5・7-5はアプリ内で攻略要点まで見られるようにしたよ。','攻略で迷ったら上の海域ボタンから選んで。必要なところだけ一緒に見よ。','遠征の帰投時刻はこっちで見てるよ。焦らずいこう。','任務、ひとつずつ片付けよ。全部いっぺんにやらなくていいから。','資源の記録、あとで効いてくるよ。今日の分だけ残しておこ。'];
document.getElementById('secretaryRefresh').onclick=()=>{document.getElementById('secretaryText').textContent=secretaryLines[Math.floor(Math.random()*secretaryLines.length)]};
function hdNotifyIsIOS(ua=String(navigator.userAgent||''),touch=Number(navigator.maxTouchPoints)||0){
 return /iPhone|iPad|iPod/i.test(String(ua||''))||(/Macintosh/i.test(String(ua||''))&&Number(touch)>1);
}
function hdNotifyIsStandalone(matches=window.matchMedia?.('(display-mode: standalone)')?.matches,standalone=navigator.standalone){
 return matches===true||standalone===true;
}
function hdNotifyUiState({ios=hdNotifyIsIOS(),standalone=hdNotifyIsStandalone(),supported=('Notification'in window),permission=(supported?Notification.permission:'unsupported')}={}){
 if(ios&&!standalone)return 'needs-install';
 if(!supported)return 'unsupported';
 if(permission==='granted')return 'granted';
 if(permission==='denied')return 'denied';
 return 'default';
}
function updateNotifyButton(){
 const btn=document.getElementById('notifyBtn');if(!btn)return;
 const state=hdNotifyUiState();btn.dataset.notifyState=state;
 const map={
  granted:['🔔','通知ON','通知は許可済み'],
  denied:['🔕','通知OFF','通知がブロックされています。設定を確認'],
  'needs-install':['＋','通知設定','iPhoneではホーム画面追加後に通知を設定'],
  unsupported:['🔕','通知不可','この環境では通知を利用できません'],
  default:['🔔','通知','通知を設定']
 };
 const row=map[state]||map.default;
 btn.innerHTML=`<span aria-hidden="true">${row[0]}</span><b>${row[1]}</b>`;btn.setAttribute('aria-label',row[2]);btn.title=row[2];
}
document.getElementById('notifyBtn').onclick=async()=>{
 const state=hdNotifyUiState();
 if(state==='needs-install'){alert('iPhoneで通知を使うには、Safariの共有ボタン →「ホーム画面に追加」→ ホーム画面のHarborDeskから開いて、もう一度「通知設定」を押してね。');return}
 if(state==='unsupported'){alert('このブラウザでは通知APIが使えないみたい');return}
 if(state==='denied'){alert('通知がブロックされてるよ。iPhoneの「設定」→「通知」からHarborDeskの通知を許可してね。');return}
 if(state==='granted'){alert('HarborDeskの通知はONだよ。遠征・入渠の完了時に通知するね。');return}
 try{await Notification.requestPermission()}catch{}
 updateNotifyButton();
};
updateNotifyButton();
function tick(){const now=Date.now();document.querySelectorAll('.timer-time').forEach(el=>{const end=Number(el.dataset.end);el.textContent=fmt(end-now);el.closest('.timer')?.classList.toggle('done',end<=now)});for(const [kind,arr] of [['遠征',state.expeditions],['入渠',state.docks]])for(const t of arr){if(t.endsAt<=now&&!notified.has(t.id)){notified.add(t.id);if(Notification.permission==='granted')new Notification(`HarborDesk: ${kind}完了`,{body:`${t.name} が完了したよ`})}}}
setInterval(tick,1000);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();tick();setTimeout(()=>{document.body?.classList.remove('hd-booting');document.body?.setAttribute('data-hd-boot-fallback','1')},8000);
