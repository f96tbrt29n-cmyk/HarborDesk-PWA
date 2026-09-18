const HD_SPM_STRATEGIES={
 stable:{label:'安定重視',order:0},
 firepower:{label:'火力重視',order:1},
 route:{label:'道中突破重視',order:2},
 boss:{label:'ボス重視',order:3},
 reserve:{label:'装備温存',order:4},
 manual:{label:'手動編成',order:9}
};

function hdSPMEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSPMMap(){return typeof hdSPSMap==='function'?hdSPSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}
function hdSPMFleets(map){try{return typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]}catch{return []}}
function hdSPMSelected(map){
 try{return typeof hdSortieSelection==='function'?hdSortieSelection(map):''}catch{return ''}
}
function hdSPMStrategy(fleet){
 const raw=String(fleet?.strategy||'').trim();
 if(HD_SPM_STRATEGIES[raw])return raw;
 const text=`${fleet?.strategyLabel||''} ${fleet?.name||''} ${fleet?.memo||''}`;
 if(/安定重視/.test(text))return 'stable';
 if(/火力重視/.test(text))return 'firepower';
 if(/道中突破重視/.test(text))return 'route';
 if(/ボス重視/.test(text))return 'boss';
 if(/装備温存/.test(text))return 'reserve';
 return 'manual';
}
function hdSPMStats(map,fleet){
 const ships=(fleet?.ships||[]).filter(x=>String(x.ship||'').trim()||String(x.gear||'').trim());
 const registered=ships.filter(x=>x.ship&&typeof hdSortieRosterMatch==='function'&&hdSortieRosterMatch(x.ship)).length;
 const gearRows=ships.filter(x=>String(x.gear||'').trim()).length;
 let auto={checks:[],adv:{}};
 try{if(typeof hdSortieAutoChecks==='function')auto=hdSortieAutoChecks(map,fleet)}catch{}
 const checks=auto.checks||[],autoOk=checks.filter(x=>x.state==='ok').length;
 let manual=[];
 try{if(typeof hdSortieManualChecks==='function')manual=hdSortieManualChecks(map,auto.adv||{})}catch{}
 let manualState={};
 try{if(typeof hdSortieState==='function')manualState=hdSortieState(map,fleet.id)||{}}catch{}
 const manualDone=manual.filter(x=>manualState[x.id]).length;
 return {
  ships,shipCount:ships.filter(x=>String(x.ship||'').trim()).length,registered,gearRows,
  auto,autoOk,autoTotal:checks.length,unresolved:checks.filter(x=>x.state!=='ok'),
  manual,manualDone,manualTotal:manual.length
 };
}
function hdSPMRows(map){
 const selected=hdSPMSelected(map);
 return hdSPMFleets(map).map(fleet=>{
  const strategy=hdSPMStrategy(fleet),meta=HD_SPM_STRATEGIES[strategy]||HD_SPM_STRATEGIES.manual,stats=hdSPMStats(map,fleet);
  return {fleet,strategy,strategyLabel:fleet.strategyLabel||meta.label,order:meta.order,stats,selected:fleet.id===selected,updatedAt:Number(fleet.updatedAt||fleet.createdAt)||0};
 }).sort((a,b)=>{
  if(a.selected!==b.selected)return a.selected?-1:1;
  if(a.order!==b.order)return a.order-b.order;
  return b.updatedAt-a.updatedAt;
 });
}
function hdSPMDate(ts){
 if(!ts)return '更新時刻なし';
 try{return new Date(ts).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return ''}
}
function hdSPMShipDetails(row){
 const ships=row.stats.ships;
 if(!ships.length)return '<div class="hd-spm-empty">艦娘・装備メモはまだ未入力</div>';
 return '<details class="hd-spm-details"><summary>編成・装備を見る</summary><div class="hd-spm-ship-list">'+ships.map((s,i)=>`<div><span>${i+1}</span><strong>${hdSPMEsc(s.ship||'艦娘未入力')}</strong><small>${hdSPMEsc(s.gear||'装備メモなし')}</small></div>`).join('')+'</div></details>';
}
function hdSPMCard(row){
 const s=row.stats,unresolved=s.unresolved.length?s.unresolved.map(x=>x.label).join('、'):'自動確認で未解決なし';
 return `<article class="hd-spm-card ${row.selected?'selected':''}" data-hd-spm-card="${hdSPMEsc(row.fleet.id)}">
  <div class="hd-spm-card-head">
   <div><div class="hd-spm-tags"><span>${hdSPMEsc(row.strategyLabel)}</span>${row.selected?'<b>出撃選択中</b>':''}</div><strong>${hdSPMEsc(row.fleet.name||'名称なし')}</strong><small>${hdSPMEsc(hdSPMDate(row.updatedAt))}</small></div>
   <span class="hd-spm-auto">${s.autoOk}/${s.autoTotal}</span>
  </div>
  <div class="hd-spm-metrics">
   <span>艦数 <b>${s.shipCount}</b></span>
   <span>台帳 <b>${s.registered}/${s.shipCount}</b></span>
   <span>装備メモ <b>${s.gearRows}</b></span>
   <span>手動確認 <b>${s.manualDone}/${s.manualTotal}</b></span>
  </div>
  <p class="hd-spm-unresolved">${hdSPMEsc(unresolved)}</p>
  ${hdSPMShipDetails(row)}
  <div class="hd-spm-actions">
   ${row.selected?'<button type="button" class="ghost small" disabled>選択中</button>':`<button type="button" class="primary small" data-hd-spm-select="${hdSPMEsc(row.fleet.id)}">出撃に選択</button>`}
   <button type="button" class="ghost small" data-hd-spm-edit="${hdSPMEsc(row.fleet.id)}">編成タブで確認</button>
  </div>
 </article>`;
}
function hdSPMHtml(map){
 const rows=hdSPMRows(map);
 if(!rows.length)return `<section class="hd-spm"><div class="hd-spm-head"><div><div class="eyebrow">SORTIE PRESET MANAGER</div><strong>保存プリセット比較</strong><span>この海域の保存編成はまだないよ。</span></div><button type="button" class="primary small" data-hd-spm-manage>編成を作る</button></div></section>`;
 return `<section class="hd-spm">
  <div class="hd-spm-head"><div><div class="eyebrow">SORTIE PRESET MANAGER</div><strong>保存プリセット比較</strong><span>${rows.length}件の保存編成を比較して、出撃対象を切り替え</span></div><button type="button" class="ghost small" data-hd-spm-manage>編成タブで管理</button></div>
  <div class="hd-spm-grid">${rows.map(hdSPMCard).join('')}</div>
  <p class="hd-spm-note">※自動確認は保存された艦娘名・装備メモから判定できる範囲。耐久・疲労・補給・実際の索敵値などはゲーム画面で最終確認してね。</p>
 </section>`;
}
function hdSPMRender(){
 const body=document.getElementById('hdSortiePreparationBody');if(!body)return;
 body.querySelector('.hd-spm')?.remove();
 const map=hdSPMMap();if(!map)return;
 const overview=body.querySelector('.hd-sps-overview');if(!overview)return;
 const wrap=document.createElement('div');wrap.innerHTML=hdSPMHtml(map);const sec=wrap.firstElementChild;if(sec)overview.insertAdjacentElement('afterend',sec);
}
function hdSPMSelect(map,id){
 if(!map||!id)return false;
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);
 else{
  try{const all=JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}');all[map]=id;localStorage.setItem('harbordesk-sortie-selection-v1',JSON.stringify(all))}catch{return false}
 }
 if(typeof hdSPSRender==='function')hdSPSRender();else hdSPMRender();
 return true;
}
function hdSPMInstall(){
 if(window.__hdSortiePresetManagerInstalled||typeof hdSPSRender!=='function')return false;
 window.__hdSortiePresetManagerInstalled=true;
 const prev=hdSPSRender;
 hdSPSRender=function(){const value=prev.apply(this,arguments);setTimeout(hdSPMRender,0);return value};
 setTimeout(hdSPMRender,0);return true;
}
document.addEventListener('click',e=>{
 const sel=e.target.closest?.('[data-hd-spm-select]');if(sel){hdSPMSelect(hdSPMMap(),sel.dataset.hdSpmSelect);return}
 const edit=e.target.closest?.('[data-hd-spm-edit]');if(edit){if(typeof hdSPSOpenMapTab==='function')hdSPSOpenMapTab('mine');return}
 if(e.target.closest?.('[data-hd-spm-manage]')){if(typeof hdSPSOpenMapTab==='function')hdSPSOpenMapTab('mine');return}
});
window.addEventListener('storage',e=>{if(['harbordesk-custom-fleets-v1','harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1','harbordesk-ship-roster-v1'].includes(e.key))hdSPMRender()});
window.addEventListener('hd:map-rendered',()=>setTimeout(hdSPMRender,0));
window.addEventListener('load',()=>setTimeout(()=>{if(!hdSPMInstall())setTimeout(hdSPMInstall,500)},900));
hdSPMInstall();
