const HD_PROCUREMENT_KEY='harbordesk-equipment-procurement-v1';

function hdPLLoad(){try{const v=JSON.parse(localStorage.getItem(HD_PROCUREMENT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function hdPLSave(v){localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify(v));hdPLRender()}
const HD_PL_METHOD_ORDER={develop:1,improve:2,quest:3,other:4,limited:5};
function hdPLMethodMeta(item){
 const m=item&&typeof hdAGMethod==='function'?hdAGMethod(item):{key:'other',label:'入手情報'};
 return {...m,rank:HD_PL_METHOD_ORDER[m.key]||4};
}
function hdPLWantedKind(wanted){
 return typeof hdShipDbAcquisitionKind==='function'?hdShipDbAcquisitionKind(wanted):
  (/艦戦|制空/.test(wanted)?'制空':/艦攻|艦爆/.test(wanted)?'航空火力':/対潜|ソナー|爆雷/.test(wanted)?'対潜':/電探/.test(wanted)?'電探':/魚雷/.test(wanted)?'魚雷':/主砲|砲/.test(wanted)?'主砲':/内火艇|大発|対地|三式弾/.test(wanted)?'対地':'');
}
function hdPLResolveWanted(wanted){
 const cat=typeof hdAGCatalog==='function'?hdAGCatalog():[],norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・'),key=norm(wanted);
 const exact=cat.find(x=>norm(x.name)===key);
 if(exact)return {item:exact,kind:hdPLWantedKind(wanted),exact:true};
 const kind=hdPLWantedKind(wanted),candidates=kind&&typeof hdAGCandidates==='function'?hdAGCandidates(kind):[];
 const missing=candidates.find(x=>(typeof hdAGOwned==='function'?hdAGOwned(x.name).count:0)<=0)||candidates[0]||null;
 return {item:missing,kind,exact:false};
}
function hdPLMergeGearItems(items=[]){
 const m=new Map();
 for(const x of items){
  const key=[x.map,x.target||x.wanted,x.methodKey||'',x.ship||''].join('|'),cur=m.get(key);
  if(cur){cur.needed=(cur.needed||1)+(x.needed||1);cur.sources=[...new Set([...(cur.sources||[]),...(x.sources||[])])];}
  else m.set(key,{...x,needed:x.needed||1,sources:[...new Set(x.sources||[])]});
 }
 return [...m.values()].sort((a,b)=>(a.rank||9)-(b.rank||9)||(a.target||a.wanted).localeCompare(b.target||b.wanted,'ja'));
}
function hdPLAddShipLoadout(map,shipName,loadoutName){
 if(!map||typeof HD_SHIP_DATABASE==='undefined'||typeof HD_SHIP_LOADOUTS==='undefined'||typeof hdShipDbResolveOwnedLoadout!=='function')return false;
 const ship=HD_SHIP_DATABASE.find(x=>x.final===shipName||x.base===shipName);if(!ship)return false;
 const sets=HD_SHIP_LOADOUTS[ship.final]||[],set=sets.find(x=>x.name===loadoutName)||sets[0];if(!set)return false;
 const plan=hdShipDbResolveOwnedLoadout(ship,set),missing=plan.slots.filter(x=>!x.found);
 if(!missing.length){alert?.(`${ship.final} の「${set.name}」は手持ち装備で埋められるよ`);return false}
 const added=missing.map(slot=>{
  const r=hdPLResolveWanted(slot.wanted),method=hdPLMethodMeta(r.item);
  return {map,ship:ship.final,loadout:set.name,wanted:slot.wanted,target:r.item?.name||'',kind:r.kind||'',exact:r.exact,methodKey:method.key,methodLabel:method.label,rank:method.rank,needed:1,sources:[ship.final],createdAt:Date.now()};
 });
 const list=hdPLLoad(),old=list.find(x=>x.map===map),next={id:old?.id||`pl-${Date.now()}-${Math.random().toString(16).slice(2)}`,map,kinds:old?.kinds||[],gearItems:hdPLMergeGearItems([...(old?.gearItems||[]),...added]),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 hdPLSave(old?list.map(x=>x.map===map?next:x):[next,...list]);return true;
}

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
function hdPLGearItemHtml(map,row){
 const target=row.target||'',method=row.methodLabel||'入手情報',rank=row.rank||4,label=rank===1?'優先1':rank===2?'優先2':rank===3?'優先3':rank===5?'優先5':'優先4';
 return `<article class="hd-pl-gear-item method-${hdPLEsc(row.methodKey||'other')}"><div class="hd-pl-gear-head"><div><strong>${hdPLEsc(target||row.wanted)}</strong><span>${hdPLEsc(row.ship||'')}｜${hdPLEsc(row.loadout||'')}</span></div><div><b>${label}</b><em>${hdPLEsc(method)}</em></div></div><div class="hd-pl-gear-meta"><span>必要枠 <b>${row.needed||1}</b></span>${target&&target!==row.wanted?`<span>元の希望 <b>${hdPLEsc(row.wanted)}</b></span>`:''}</div><div class="hd-pl-actions">${target?`<button type="button" class="ghost small" data-hd-pl-item-guide="${hdPLEsc(target)}" data-hd-pl-map="${hdPLEsc(map)}">この装備の入手方法</button><button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(target)}">図鑑</button>`:(row.kind?`<button type="button" class="ghost small" data-hd-pl-guide="${hdPLEsc(row.kind)}" data-hd-pl-map="${hdPLEsc(map)}">代替候補を見る</button>`:'')}</div></article>`;
}
function hdPLGearPlanHtml(row){
 const items=hdPLMergeGearItems(row.gearItems||[]);if(!items.length)return '';
 const counts={develop:0,improve:0,quest:0,other:0,limited:0};items.forEach(x=>counts[x.methodKey||'other']=(counts[x.methodKey||'other']||0)+(x.needed||1));
 return `<section class="hd-pl-gear-plan"><div class="hd-pl-gear-summary"><div><div class="eyebrow">SHIP LOADOUT PROCUREMENT</div><strong>個艦の不足装備</strong></div><span>開発 ${counts.develop} / 改修 ${counts.improve} / 任務 ${counts.quest} / その他 ${counts.other} / 限定 ${counts.limited}</span></div><div class="hd-pl-gear-list">${items.map(x=>hdPLGearItemHtml(row.map,x)).join('')}</div></section>`;
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
 return `<article class="hd-pl-map-card"><div class="hd-pl-map-head"><div><div class="eyebrow">MAP PROCUREMENT</div><strong>${hdPLEsc(row.map)} 調達リスト</strong><span>${done}/${total} カテゴリ準備完了</span></div><div class="hd-pl-map-actions"><button type="button" class="ghost small" data-hd-pl-prune="${hdPLEsc(row.map)}">完了を整理</button><button type="button" class="ghost small" data-hd-pl-remove="${hdPLEsc(row.map)}">削除</button></div></div>${hdPLGearPlanHtml(row)}<div class="hd-pl-req-grid">${(row.kinds||[]).map(k=>hdPLRequirementHtml(row.map,k)).join('')}</div></article>`;
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
 const itemGuide=e.target.closest?.('[data-hd-pl-item-guide]');if(itemGuide){if(typeof hdAGOpenItem==='function')hdAGOpenItem(itemGuide.dataset.hdPlItemGuide,itemGuide.dataset.hdPlMap||'');return}
 const cat=e.target.closest?.('[data-hd-pl-catalog]');if(cat){if(typeof hdAGOpenCatalog==='function')hdAGOpenCatalog(cat.dataset.hdPlCatalog);return}
 const remove=e.target.closest?.('[data-hd-pl-remove]');if(remove){hdPLRemove(remove.dataset.hdPlRemove);return}
 const prune=e.target.closest?.('[data-hd-pl-prune]');if(prune){hdPLPruneReady(prune.dataset.hdPlPrune);return}
});
window.addEventListener('storage',e=>{if(e.key===HD_PROCUREMENT_KEY||e.key==='harbordesk-equipment-v1')hdPLRender()});
window.addEventListener('hd:workspace-refresh',hdPLRender);
window.addEventListener('hd:map-rendered',hdPLRender);
window.addEventListener('load',()=>setTimeout(()=>{hdPLEnsure();if(!hdPLInstallSortieButton())setTimeout(hdPLInstallSortieButton,500)},380));
hdPLInstallSortieButton();
