const HD_PROCUREMENT_KEY='harbordesk-equipment-procurement-v1';

function hdPLLoad(){try{const v=JSON.parse(localStorage.getItem(HD_PROCUREMENT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function hdPLSave(v){localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify(v));hdPLRender()}
function hdPLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdPLLabel(kind){return typeof hdAGKindLabel==='function'?hdAGKindLabel(kind):kind}
function hdPLCurrentCheck(map,kind){
 const rows=typeof hdSEChecks==='function'?hdSEChecks(map).rows||[]:[];
 return rows.find(x=>x.kind===kind)||{kind,label:hdPLLabel(kind),status:'missing',count:0,minCount:1,detail:'要確認',hint:''};
}
function hdPLRecommendation(kind){
 const rows=typeof hdAGCandidates==='function'?hdAGCandidates(kind):[];
 const missing=rows.find(x=>(typeof hdAGOwned==='function'?hdAGOwned(x.name).count:0)<=0);
 return missing||rows[0]||null;
}
function hdPLAddMap(map){
 if(!map||typeof hdSEChecks!=='function')return false;
 const checks=(hdSEChecks(map).rows||[]).filter(x=>x.status!=='ready');
 if(!checks.length){alert?.(`${map} は現在の装備台帳では主要装備が準備済みだよ`);return false}
 const list=hdPLLoad(),old=list.find(x=>x.map===map);
 const kinds=[...new Set([...(old?.kinds||[]),...checks.map(x=>x.kind)])];
 const next={id:old?.id||`pl-${Date.now()}-${Math.random().toString(16).slice(2)}`,map,kinds,createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 const out=old?list.map(x=>x.map===map?next:x):[next,...list];
 hdPLSave(out);return true;
}
function hdPLRemove(map){hdPLSave(hdPLLoad().filter(x=>x.map!==map))}
function hdPLPruneReady(map){
 const list=hdPLLoad(),row=list.find(x=>x.map===map);if(!row)return;
 const kinds=(row.kinds||[]).filter(k=>hdPLCurrentCheck(map,k).status!=='ready');
 if(!kinds.length){hdPLRemove(map);return}
 row.kinds=kinds;row.updatedAt=Date.now();hdPLSave(list);
}
function hdPLRequirementHtml(map,kind){
 const check=hdPLCurrentCheck(map,kind),rec=hdPLRecommendation(kind),ready=check.status==='ready';
 return `<article class="hd-pl-req ${check.status}">
   <div class="hd-pl-req-head"><div><strong>${hdPLEsc(hdPLLabel(kind))}</strong><span>${hdPLEsc(check.detail||'')}</span></div><b>${ready?'準備完了':check.status==='partial'?'あと少し':'不足'}</b></div>
   <p>${hdPLEsc(check.hint||'')}</p>
   ${rec&&!ready?`<div class="hd-pl-rec"><span>次の候補</span><strong>${hdPLEsc(rec.name)}</strong><small>${hdPLEsc(rec.obtain||'')}</small></div>`:''}
   <div class="hd-pl-actions">${!ready?`<button type="button" class="ghost small" data-hd-pl-guide="${hdPLEsc(kind)}" data-hd-pl-map="${hdPLEsc(map)}">入手ルート</button>`:''}${rec&&!ready?`<button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(rec.name)}">図鑑</button>`:''}</div>
  </article>`;
}
function hdPLMapHtml(row){
 const states=(row.kinds||[]).map(k=>hdPLCurrentCheck(row.map,k)),done=states.filter(x=>x.status==='ready').length,total=states.length;
 return `<article class="hd-pl-map-card"><div class="hd-pl-map-head"><div><div class="eyebrow">MAP PROCUREMENT</div><strong>${hdPLEsc(row.map)} 調達リスト</strong><span>${done}/${total} 準備完了</span></div><div class="hd-pl-map-actions"><button type="button" class="ghost small" data-hd-pl-prune="${hdPLEsc(row.map)}">完了を整理</button><button type="button" class="ghost small" data-hd-pl-remove="${hdPLEsc(row.map)}">削除</button></div></div><div class="hd-pl-req-grid">${(row.kinds||[]).map(k=>hdPLRequirementHtml(row.map,k)).join('')}</div></article>`;
}
function hdPLRender(){
 const host=document.getElementById('hdProcurementList');if(!host)return;
 const rows=hdPLLoad();host.innerHTML=rows.map(hdPLMapHtml).join('')||'<div class="empty">調達リストはまだないよ。海域の装備タブから不足分を追加できる。</div>';
 const count=document.getElementById('hdProcurementCount');if(count)count.textContent=`${rows.length}海域`;
 const add=document.getElementById('hdProcurementAddCurrent');if(add){const map=typeof selectedMap!=='undefined'?selectedMap:'';add.disabled=!map;add.textContent=map?`${map} の不足を追加`:'海域を選んでね'}
}
function hdPLEnsure(){
 if(document.getElementById('hdEquipmentProcurement'))return;
 const anchor=document.getElementById('hdEquipAnalyzer')||document.getElementById('equipmentBook');if(!anchor)return;
 const sec=document.createElement('section');sec.id='hdEquipmentProcurement';sec.className='advanced-section hd-pl-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">PROCUREMENT LIST</div><h2>装備調達リスト</h2></div><span id="hdProcurementCount" class="muted"></span></div><div class="hd-pl-toolbar"><p>攻略予定の海域で足りない装備カテゴリを保存。装備台帳を更新すると準備状況も自動で変わるよ。</p><button id="hdProcurementAddCurrent" type="button" class="primary small">海域を選んでね</button></div><div id="hdProcurementList" class="hd-pl-list"></div>`;
 anchor.insertAdjacentElement('afterend',sec);document.getElementById('hdProcurementAddCurrent')?.addEventListener('click',()=>{if(typeof selectedMap!=='undefined'&&selectedMap)hdPLAddMap(selectedMap)});hdPLRender();
}
function hdPLInstallSortieButton(){
 if(window.__hdProcurementSortiePatched||typeof hdSortieEquipmentCheckHtml!=='function')return false;
 window.__hdProcurementSortiePatched=true;const prev=hdSortieEquipmentCheckHtml;
 hdSortieEquipmentCheckHtml=function(map){
  let html=prev(map);
  if(!html.includes('data-hd-pl-add-current')){
   html=html.replace('<div class="hd-se-footer">',`<div class="hd-se-footer"><button type="button" class="primary small" data-hd-pl-add-current="${hdPLEsc(map)}">不足分を調達リストへ</button>`);
  }
  return html;
 };
 if(typeof hdRenderMapEquipmentRecommendations==='function')setTimeout(hdRenderMapEquipmentRecommendations,0);return true;
}
function hdPLOpenList(){
 hdPLEnsure();const target=document.getElementById('hdEquipmentProcurement');if(!target)return;
 if(typeof hdWSShowElement==='function')hdWSShowElement('hdEquipmentProcurement',true);else target.scrollIntoView({behavior:'smooth',block:'start'});
}
document.addEventListener('click',e=>{
 const add=e.target.closest?.('[data-hd-pl-add-current]');if(add){if(hdPLAddMap(add.dataset.hdPlAddCurrent))hdPLOpenList();return}
 const guide=e.target.closest?.('[data-hd-pl-guide]');if(guide){if(typeof hdAGOpen==='function')hdAGOpen(guide.dataset.hdPlGuide,guide.dataset.hdPlMap||'');return}
 const cat=e.target.closest?.('[data-hd-pl-catalog]');if(cat){if(typeof hdAGOpenCatalog==='function')hdAGOpenCatalog(cat.dataset.hdPlCatalog);return}
 const remove=e.target.closest?.('[data-hd-pl-remove]');if(remove){hdPLRemove(remove.dataset.hdPlRemove);return}
 const prune=e.target.closest?.('[data-hd-pl-prune]');if(prune){hdPLPruneReady(prune.dataset.hdPlPrune);return}
});
window.addEventListener('storage',e=>{if(e.key===HD_PROCUREMENT_KEY||e.key==='harbordesk-equipment-v1')hdPLRender()});
window.addEventListener('hd:workspace-refresh',hdPLRender);
window.addEventListener('hd:map-rendered',hdPLRender);
window.addEventListener('load',()=>setTimeout(()=>{hdPLEnsure();if(!hdPLInstallSortieButton())setTimeout(hdPLInstallSortieButton,500)},380));
hdPLInstallSortieButton();
