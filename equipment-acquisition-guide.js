function hdAGEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdAGCatalog(){return typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]}
function hdAGRecipes(){return typeof HD_DEV_RECIPES!=='undefined'?HD_DEV_RECIPES:[]}
function hdAGImprovements(){return typeof HD_IMPROVEMENTS!=='undefined'?HD_IMPROVEMENTS:[]}
function hdAGOwned(name){return typeof hdSEOwned==='function'?hdSEOwned(name):{owned:false,count:0,maxStar:0}}
function hdAGRecipesFor(name){return hdAGRecipes().filter(r=>(r.targets||[]).includes(name))}
function hdAGItemByName(name){return hdAGCatalog().find(x=>x.name===name)}
function hdAGUpdateSources(name){
 const rows=[];
 for(const x of hdAGCatalog()){
  if(x.name===name)continue;
  if(String(x.update||'').includes(name))rows.push({name:x.name,via:'装備更新'});
 }
 for(const x of hdAGImprovements()){
  if(x.name===name)continue;
  if(String(x.update||'').includes(name)&&!rows.some(r=>r.name===x.name))rows.push({name:x.name,via:'改修更新'});
 }
 return rows.slice(0,4);
}
function hdAGMethod(item){
 const recipes=hdAGRecipesFor(item.name),sources=hdAGUpdateSources(item.name),obtain=String(item.obtain||'');
 if(recipes.length||/開発可能/.test(obtain))return {key:'develop',label:'開発候補'};
 if(sources.length||/改修更新|から更新|更新/.test(obtain))return {key:'improve',label:'改修・更新'};
 if(/任務|初期装備|常設/.test(obtain))return {key:'quest',label:'任務・初期装備'};
 if(/イベント|ランキング|期間限定/.test(obtain))return {key:'limited',label:'限定入手'};
 return {key:'other',label:'入手情報'};
}
function hdAGScore(item){
 const method=hdAGMethod(item);let score=0;
 if(method.key==='develop')score+=50;
 if(method.key==='improve')score+=35;
 if(method.key==='quest')score+=22;
 if(String(item.improve||'').includes('可'))score+=4;
 if(typeof hdEAitemScore==='function')score+=hdEAitemScore(item)/10;
 return score;
}
function hdAGCandidates(kind){
 let rows=[];
 if(kind==='高速化'){
  rows=hdAGCatalog().filter(x=>/タービン|缶$/.test(x.name)||(x.tags||[]).includes('高速化'));
 }else if(kind==='基地航空隊'){
  rows=hdAGCatalog().filter(x=>(x.tags||[]).includes('基地航空隊')||['陸上攻撃機','陸軍戦闘機','局地戦闘機'].includes(x.category));
 }else if(typeof hdSECandidates==='function'){
  rows=hdSECandidates(kind,50);
 }
 const unique=[...new Map(rows.map(x=>[x.name,x])).values()];
 return unique.sort((a,b)=>{
  const ao=hdAGOwned(a.name).count>0,bo=hdAGOwned(b.name).count>0;
  if(ao!==bo)return ao?1:-1;
  return hdAGScore(b)-hdAGScore(a);
 }).slice(0,8);
}
function hdAGRecipeHtml(r,target=''){
 return `<div class="hd-ag-recipe"><strong>${hdAGEsc(r.title)}</strong><span>燃${r.fuel} / 弾${r.ammo} / 鋼${r.steel} / ボ${r.bauxite}</span><small>秘書艦: ${hdAGEsc(r.secretary)}｜${hdAGEsc(r.rates||'')}</small><button type="button" class="ghost small" data-hd-ag-development="${hdAGEsc(target||(r.targets||[])[0]||'')}">開発レシピへ</button></div>`;
}
function hdAGCandidateHtml(item){
 const own=hdAGOwned(item.name),method=hdAGMethod(item),recipes=hdAGRecipesFor(item.name),sources=hdAGUpdateSources(item.name);
 const sourceHtml=sources.length?`<div class="hd-ag-update"><span>更新元</span>${sources.map(s=>`<button type="button" class="ghost small" data-hd-ag-improvement="${hdAGEsc(s.name)}">${hdAGEsc(s.name)} →</button>`).join('')}</div>`:'';
 const action=own.count>0
  ?`<button type="button" class="ghost small" data-hd-ag-ledger="${hdAGEsc(item.name)}">台帳で確認</button>`
  :`<button type="button" class="primary small" data-hd-ag-add="${hdAGEsc(item.name)}">台帳へ追加</button>`;
 return `<article class="hd-ag-card ${own.count>0?'owned':'missing'}">
  <div class="hd-ag-head"><div><strong>${hdAGEsc(item.name)}</strong><span>${hdAGEsc(item.category||'')}</span></div><div class="hd-ag-badges"><b class="${method.key}">${method.label}</b><em>${own.count>0?`所持 ${own.count}${own.maxStar?` / ★${own.maxStar}`:''}`:'未所持'}</em></div></div>
  <p class="hd-ag-role">${hdAGEsc(item.role||'')}</p>
  <div class="hd-ag-info"><div><span>入手</span><strong>${hdAGEsc(item.obtain||'情報整理中')}</strong></div><div><span>更新・補足</span><strong>${hdAGEsc(item.update||'なし')}</strong></div></div>
  ${recipes.map(r=>hdAGRecipeHtml(r,item.name)).join('')}
  ${sourceHtml}
  <div class="hd-ag-actions">${action}<button type="button" class="ghost small" data-hd-ag-catalog="${hdAGEsc(item.name)}">図鑑で詳細</button></div>
 </article>`;
}
function hdAGEnsureDialog(){
 if(document.getElementById('hdAcquisitionDialog'))return;
 const d=document.createElement('dialog');d.id='hdAcquisitionDialog';d.className='hd-ag-dialog';
 d.innerHTML=`<div class="hd-ag-shell"><div class="hd-ag-title"><div><div class="eyebrow">ACQUISITION GUIDE</div><h3 id="hdAcquisitionTitle">不足装備の入手ルート</h3></div><button type="button" class="ghost small" data-hd-ag-close>閉じる</button></div><p id="hdAcquisitionNote" class="muted"></p><div id="hdAcquisitionList" class="hd-ag-list"></div></div>`;
 document.body.appendChild(d);
}
function hdAGKindLabel(kind){if(kind==='高速化')return '高速化セット';if(kind==='基地航空隊')return '基地航空隊';return typeof HD_SORTIE_EQUIP_RULES!=='undefined'&&HD_SORTIE_EQUIP_RULES[kind]?.label?HD_SORTIE_EQUIP_RULES[kind].label:kind}
function hdAGOpen(kind,map=''){
 hdAGEnsureDialog();
 const d=document.getElementById('hdAcquisitionDialog'),list=document.getElementById('hdAcquisitionList'),title=document.getElementById('hdAcquisitionTitle'),note=document.getElementById('hdAcquisitionNote');
 const label=hdAGKindLabel(kind);
 if(title)title.textContent=`${map?map+'｜':''}${label}の入手ルート`;
 if(note)note.textContent='入手しやすい候補を優先して表示。開発率や任務・改修条件は変更されることがあるため、最終確認は装備図鑑/Wikiも使ってね。';
 const rows=hdAGCandidates(kind);
 if(list)list.innerHTML=rows.map(hdAGCandidateHtml).join('')||'<div class="empty">候補装備を整理中だよ</div>';
 if(d&&!d.open)d.showModal();
}
function hdAGShowElement(id){
 const target=document.getElementById(id);if(!target)return false;
 if(typeof hdWSShowElement==='function')return hdWSShowElement(id,true);
 target.scrollIntoView({behavior:'smooth',block:'start'});return true;
}
function hdAGOpenDevelopment(name){
 document.getElementById('hdAcquisitionDialog')?.close();hdAGShowElement('developmentLab');
 setTimeout(()=>{const q=document.getElementById('hdDevelopmentSearch');if(q){q.value=name;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}},180);
}
function hdAGOpenImprovement(name){
 document.getElementById('hdAcquisitionDialog')?.close();hdAGShowElement('improvementWorkshop');
 setTimeout(()=>{const q=document.getElementById('hdImprovementSearch');if(q){q.value=name;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}},180);
}
function hdAGOpenCatalog(name){
 document.getElementById('hdAcquisitionDialog')?.close();
 if(typeof hdOpenEquipmentDb==='function')hdOpenEquipmentDb(name);else hdAGShowElement('equipmentBook');
}
function hdAGAdd(name){
 const item=hdAGItemByName(name);if(!item||typeof openEquipment!=='function')return;
 document.getElementById('hdAcquisitionDialog')?.close();
 openEquipment({name:item.name,category:item.category,count:1,star:0,targetStar:String(item.improve||'').includes('可')?10:0,assigned:'',memo:[`用途: ${item.role||''}`,`入手: ${item.obtain||''}`,item.update||''].filter(Boolean).join('\n')});
}
function hdAGInstall(){
 if(window.__hdAcquisitionGuideInstalled||typeof hdSECard!=='function')return false;
 window.__hdAcquisitionGuideInstalled=true;
 const prev=hdSECard;
 hdSECard=function(row,adv){
  let html=prev(row,adv);
  if(row.status!=='ready'){
   const button=`<div class="hd-ag-inline"><button type="button" class="ghost small" data-hd-ag-kind="${hdAGEsc(row.kind)}">入手方法・代替候補</button></div>`;
   html=html.replace('</article>',`${button}</article>`);
  }
  return html;
 };
 if(typeof hdRenderMapEquipmentRecommendations==='function')setTimeout(hdRenderMapEquipmentRecommendations,0);
 return true;
}
document.addEventListener('click',e=>{
 const kind=e.target.closest?.('[data-hd-ag-kind]');if(kind){hdAGOpen(kind.dataset.hdAgKind,typeof selectedMap!=='undefined'?selectedMap:'');return}
 const dev=e.target.closest?.('[data-hd-ag-development]');if(dev){hdAGOpenDevelopment(dev.dataset.hdAgDevelopment);return}
 const imp=e.target.closest?.('[data-hd-ag-improvement]');if(imp){hdAGOpenImprovement(imp.dataset.hdAgImprovement);return}
 const cat=e.target.closest?.('[data-hd-ag-catalog]');if(cat){hdAGOpenCatalog(cat.dataset.hdAgCatalog);return}
 const add=e.target.closest?.('[data-hd-ag-add]');if(add){hdAGAdd(add.dataset.hdAgAdd);return}
 const led=e.target.closest?.('[data-hd-ag-ledger]');if(led){document.getElementById('hdAcquisitionDialog')?.close();if(typeof hdOwnedOpenLedger==='function')hdOwnedOpenLedger(led.dataset.hdAgLedger);return}
 if(e.target.closest?.('[data-hd-ag-close]'))document.getElementById('hdAcquisitionDialog')?.close();
});
window.addEventListener('load',()=>setTimeout(()=>{hdAGEnsureDialog();if(!hdAGInstall())setTimeout(hdAGInstall,500)},300));
hdAGInstall();
