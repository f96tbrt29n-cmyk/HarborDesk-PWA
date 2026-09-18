const HD_MAP_TAB_KEY='harbordesk-map-tab-v1';

function hdMapEsc(s){return typeof esc==='function'?esc(s):String(s??'')}
function hdMapPlan(map){
  if(typeof MAP_PLANS!=='undefined'&&MAP_PLANS[map])return MAP_PLANS[map];
  const d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]:null;
  if(!d)return {presets:[],quests:[]};
  return {presets:[{name:'基本編成',ships:d.fleet||d.formation||'攻略情報を参照',gear:d.air||'装備条件を参照',use:'通常攻略'}],quests:[]};
}
function hdMapTabSaved(map){
  try{return JSON.parse(localStorage.getItem(HD_MAP_TAB_KEY)||'{}')[map]||'overview'}catch{return 'overview'}
}
function hdMapTabSave(map,tab){
  let data={};try{data=JSON.parse(localStorage.getItem(HD_MAP_TAB_KEY)||'{}')}catch{}
  data[map]=tab;localStorage.setItem(HD_MAP_TAB_KEY,JSON.stringify(data));
}
function hdMapEmit(type,detail={}){
  try{window.dispatchEvent(new CustomEvent(type,{detail:{map:typeof selectedMap!=='undefined'?selectedMap:null,tab:typeof selectedMap!=='undefined'&&selectedMap?hdMapTabSaved(selectedMap):null,...detail}}))}catch{}
}
function hdFleetHtml(map){
  const p=hdMapPlan(map);
  if(!(p.presets||[]).length)return '<div class="empty">編成例を準備中</div>';
  return p.presets.map((x,i)=>`<article class="map-tab-card"><div class="map-tab-card-title">編成例 ${i+1}｜${hdMapEsc(x.name)}</div><div><b>艦隊:</b> ${hdMapEsc(x.ships)}</div><div><b>装備:</b> ${hdMapEsc(x.gear)}</div><div><b>用途:</b> ${hdMapEsc(x.use)}</div></article>`).join('');
}
function hdQuestHtml(map){
  const qs=hdMapPlan(map).quests||[];
  return qs.length?qs.map(q=>`<article class="map-tab-card quest-tab-card"><span class="quest-kind">${hdMapEsc(q.kind)}</span><div><b>${hdMapEsc(q.name)}</b><p>${hdMapEsc(q.condition)}</p></div></article>`).join(''):'<div class="empty">この海域の関連任務は現在整理中だよ。</div>';
}
function hdCustomFleetHtml(map){
  if(typeof loadCustomFleets!=='function')return '<div class="empty">自分用編成機能を読み込み中</div>';
  const list=(loadCustomFleets()[map]||[]);
  const saved=list.length?list.map(item=>{
    const rows=(item.ships||[]).map((s,i)=>s.ship||s.gear?`<div class="custom-fleet-saved-row"><span>${i+1}</span><b>${hdMapEsc(s.ship||'未入力')}</b><small>${hdMapEsc(s.gear||'装備メモなし')}</small></div>`:'').join('');
    return `<article class="custom-fleet-card" data-cf-id="${item.id}"><div class="custom-fleet-head"><div><strong>${hdMapEsc(item.name)}</strong><div class="muted">${new Date(item.updatedAt||item.createdAt).toLocaleString('ja-JP')} 更新</div></div><div class="custom-fleet-actions"><button class="ghost small" data-cf-edit="${item.id}">編集</button><button class="ghost small" data-cf-delete="${item.id}">削除</button></div></div><div class="custom-fleet-saved-list">${rows||'<div class="muted">艦娘はまだ未入力</div>'}</div>${item.memo?`<p class="custom-fleet-memo">${hdMapEsc(item.memo)}</p>`:''}</article>`;
  }).join(''):'<div class="empty">この海域の自分用編成はまだ保存されてないよ。</div>';
  return `<div class="custom-fleet-title"><div><div class="eyebrow">MY FLEET</div><h4>自分用編成</h4></div><button class="primary small" id="addCustomFleet">＋ 編成を保存</button></div>${saved}`;
}
function hdApplyMapTabs(){
  const card=document.getElementById('selectedMapCard');
  if(!card||!selectedMap||typeof MAP_DETAILS==='undefined')return;
  const d=MAP_DETAILS[selectedMap];if(!d)return;
  const fleet=d.fleet||d.formation||'';
  const note=d.note||d.caution||'';
  const updated=d.updated||d.sourceDate||'参照日未設定';
  const tabs=[['overview','概要'],['map','マップ'],['fleet','編成'],['route','ルート'],['gear','装備'],['quest','任務'],['drop','ドロップ'],['mine','自分用']];
  const active=hdMapTabSaved(selectedMap);
  const mapHtml=typeof hdMapImageHtml==='function'?hdMapImageHtml(selectedMap,d):'<div class="empty">マップ画像を読み込み中</div>';
  card.innerHTML=`<article class="map-tabs-shell">
    <div class="map-tabs-head"><div><span class="guide-tag">${selectedMap}</span><h3>${hdMapEsc(d.name||selectedMap)}</h3><div class="muted">アプリ内攻略要点・参照 ${hdMapEsc(updated)}</div></div><a class="guide-link map-wiki-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">Wiki ↗</a></div>
    <div class="map-tab-bar" role="tablist">${tabs.map(([id,label])=>`<button class="map-tab-btn ${active===id?'active':''}" data-map-tab="${id}" role="tab">${label}</button>`).join('')}</div>
    <div class="map-tab-pane ${active==='overview'?'active':''}" data-map-pane="overview"><p class="map-overview">${hdMapEsc(d.overview||'')}</p><div class="map-tab-card warn"><b>注意点</b><p>${hdMapEsc(note||'特記事項なし')}</p></div><div class="map-source-note">※攻略条件はアップデートや編成条件で変化する場合があります。</div></div>
    <div class="map-tab-pane ${active==='map'?'active':''}" data-map-pane="map">${mapHtml}</div>
    <div class="map-tab-pane ${active==='fleet'?'active':''}" data-map-pane="fleet">${hdFleetHtml(selectedMap)}${typeof hdShipDbMapRecommendHtml==='function'?hdShipDbMapRecommendHtml(selectedMap,d):''}${fleet?`<div class="map-tab-card"><b>基本方針</b><p>${hdMapEsc(fleet)}</p></div>`:''}</div>
    <div class="map-tab-pane ${active==='route'?'active':''}" data-map-pane="route"><div class="map-tab-card"><b>主なルート</b><p>${hdMapEsc(d.route||'ルート情報を整理中')}</p></div></div>
    <div class="map-tab-pane ${active==='gear'?'active':''}" data-map-pane="gear"><div class="map-tab-card"><b>制空・装備</b><p>${hdMapEsc(d.air||'装備情報を整理中')}</p></div><div id="hdMapEquipRecommend"></div></div>
    <div class="map-tab-pane ${active==='quest'?'active':''}" data-map-pane="quest">${hdQuestHtml(selectedMap)}</div>
    <div class="map-tab-pane ${active==='drop'?'active':''}" data-map-pane="drop">${typeof hdMapDropHtml==='function'?hdMapDropHtml(selectedMap):'<div class="empty">ドロップ情報を読み込み中</div>'}</div>
    <div class="map-tab-pane ${active==='mine'?'active':''}" data-map-pane="mine"><section id="customFleetPanel" class="custom-fleet-section">${hdCustomFleetHtml(selectedMap)}</section></div>
  </article>`;
  const add=document.getElementById('addCustomFleet');if(add&&typeof openCustomFleetDialog==='function')add.onclick=()=>openCustomFleetDialog();
  hdMapEmit('hd:map-rendered',{map:selectedMap,tab:active});
}

window.hdMapTabsCoreApply=hdApplyMapTabs;

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-map-tab]');if(!btn||!selectedMap)return;
  const tab=btn.dataset.mapTab;hdMapTabSave(selectedMap,tab);
  document.querySelectorAll('.map-tab-btn').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('.map-tab-pane').forEach(x=>x.classList.toggle('active',x.dataset.mapPane===tab));
  hdMapEmit('hd:map-tab-changed',{map:selectedMap,tab});
});

const hdPrevRenderMapPicker=renderMapPicker;
renderMapPicker=function(){hdPrevRenderMapPicker();hdApplyMapTabs()};
if(typeof renderGuide==='function')renderGuide();
