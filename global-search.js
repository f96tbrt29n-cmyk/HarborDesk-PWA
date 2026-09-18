const HD_GS_HISTORY_KEY='harbordesk-global-search-history-v1';
let hdGSCategory='all';
let hdGSResults=new Map();
let hdGSNavSeq=0;

function hdGSNorm(v){return String(v??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()}
function hdGSEsc(v){return typeof hdEsc==='function'?hdEsc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdGSLoadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdGSHistory(){const v=hdGSLoadJson(HD_GS_HISTORY_KEY,[]);return Array.isArray(v)?v:[]}
function hdGSSaveHistory(q){q=String(q||'').trim();if(q.length<2)return;const rows=hdGSHistory().filter(x=>hdGSNorm(x)!==hdGSNorm(q));rows.unshift(q);localStorage.setItem(HD_GS_HISTORY_KEY,JSON.stringify(rows.slice(0,8)))}
function hdGSSections(){return typeof hdQNSections==='function'?hdQNSections():[...document.querySelectorAll('section[id],#selectedMapCard')].map(el=>({id:el.id,title:el.querySelector('h2,h3,h4')?.textContent?.trim()||el.id})).filter(x=>x.id&&x.title)}
function hdGSRoster(){return hdGSLoadJson('harbordesk-ship-roster-v1',[])}
function hdGSLedger(){return hdGSLoadJson('harbordesk-equipment-v1',[])}
function hdGSOwnedShip(name){const n=hdGSNorm(name);return hdGSRoster().find(x=>{const xn=hdGSNorm(x.name);return xn===n||xn.startsWith(n)||n.startsWith(xn)})||null}
function hdGSOwnedEquipment(name){const n=hdGSNorm(name),rows=hdGSLedger().filter(x=>hdGSNorm(x.name)===n);return rows.reduce((a,x)=>a+Math.max(0,Number(x.count)||0),0)}
function hdGSIndex(){
 const out=[];let seq=0;const add=(type,title,subtitle,text,action,meta={})=>out.push({key:`${type}:${seq++}`,type,title,subtitle,text:`${title} ${subtitle} ${text}`,action,meta});
 for(const s of hdGSSections())add('feature',s.title,'機能',s.id,{kind:'feature',id:s.id});
 if(typeof MAPS!=='undefined')for(const maps of Object.values(MAPS))for(const map of maps){const d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]:null;add('map',`${map} ${d?.name||'攻略'}`,'海域',`${d?.overview||''} ${d?.route||''} ${d?.air||''}`,{kind:'map',map});}
 if(typeof HD_SHIP_DATABASE!=='undefined')for(const s of HD_SHIP_DATABASE){const own=hdGSOwnedShip(s.base)||hdGSOwnedShip(s.final);add('ship',s.final||s.base,`${s.type||'艦娘'}${own?`・所持 Lv${Number(own.level)||'-'}`:'・DB'}`,`${s.base} ${(s.roles||[]).join(' ')} ${s.path||''} ${s.note||''}`,{kind:'ship',name:s.base||s.final},{owned:!!own});}
 const dbShipNames=new Set(typeof HD_SHIP_DATABASE!=='undefined'?HD_SHIP_DATABASE.flatMap(x=>[hdGSNorm(x.base),hdGSNorm(x.final)]):[]);for(const s of hdGSRoster()){if(!s?.name||dbShipNames.has(hdGSNorm(s.name)))continue;add('ship',s.name,`艦隊台帳・Lv${Number(s.level)||'-'}`,`${s.type||''} ${s.memo||''}`,{kind:'roster',name:s.name},{owned:true});}
 if(typeof HD_EQUIPMENT_CATALOG!=='undefined')for(const e of HD_EQUIPMENT_CATALOG){const count=hdGSOwnedEquipment(e.name);add('equipment',e.name,`${e.category||'装備'}${count?`・所持${count}`:'・DB'}`,`${(e.tags||[]).join(' ')} ${e.role||''} ${e.obtain||''}`,{kind:'equipment',name:e.name},{owned:count>0});}
 const dbEqNames=new Set(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG.map(x=>hdGSNorm(x.name)):[]);for(const e of hdGSLedger()){if(!e?.name||dbEqNames.has(hdGSNorm(e.name)))continue;add('equipment',e.name,`装備台帳・所持${Number(e.count)||0}`,`${e.category||''} ${e.assigned||''} ${e.memo||''}`,{kind:'ledger',name:e.name},{owned:true});}
 if(typeof HD_QUESTS!=='undefined')for(const q of HD_QUESTS)add('quest',q.name,`${q.id}・${typeof HD_QUEST_CYCLE_LABEL!=='undefined'?(HD_QUEST_CYCLE_LABEL[q.cycle]||q.cycle):q.cycle}・${q.type}`,`${q.condition||''} ${q.reward||''} ${q.prereq||''}`,{kind:'quest',id:q.id,cycle:q.cycle,name:q.name});
 if(typeof HD_EXPEDITIONS!=='undefined')for(const x of HD_EXPEDITIONS)add('expedition',`${x.id} ${x.name}`,`遠征・${Math.floor(x.minutes/60)}:${String(x.minutes%60).padStart(2,'0')}`,`${x.required||''} ${x.special||''} ${(x.tags||[]).join(' ')}`,{kind:'expedition',id:x.id,name:x.name});
 return out;
}
function hdGSScore(row,q){const title=hdGSNorm(row.title),subtitle=hdGSNorm(row.subtitle),text=hdGSNorm(row.text);if(!q)return 0;if(title===q)return 120;if(title.startsWith(q))return 100;if(title.includes(q))return 80;if(subtitle.includes(q))return 55;if(text.includes(q))return 35;const words=q.split(' ').filter(Boolean);if(words.length>1&&words.every(w=>text.includes(w)))return 25;return -1}
function hdGSLabel(type){return {feature:'機能',map:'海域',ship:'艦娘',equipment:'装備',quest:'任務',expedition:'遠征'}[type]||type}
function hdGSRender(){
 const host=document.getElementById('hdGSResults');if(!host)return;const input=document.getElementById('hdGSSearch'),q=hdGSNorm(input?.value||'');
 if(!q){const history=hdGSHistory();host.innerHTML=history.length?`<div class="hd-gs-history-title">最近の検索</div><div class="hd-gs-history">${history.map(x=>`<button type="button" class="ghost small" data-hd-gs-history="${hdGSEsc(x)}">${hdGSEsc(x)}</button>`).join('')}</div><div class="hd-gs-empty">2文字以上入力すると、HarborDesk全体から探せるよ。</div>`:'<div class="hd-gs-empty">艦娘・装備・海域・任務・遠征・機能名をまとめて検索できるよ。</div>';return}
 const rows=hdGSIndex().filter(r=>hdGSCategory==='all'||r.type===hdGSCategory).map(r=>({...r,score:hdGSScore(r,q)})).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'ja')).slice(0,60);hdGSResults=new Map(rows.map(x=>[x.key,x]));
 host.innerHTML=rows.length?`<div class="hd-gs-count">${rows.length}件${rows.length===60?'（上位60件）':''}</div>${rows.map(r=>`<button type="button" class="hd-gs-result" data-hd-gs-result="${r.key}"><span class="hd-gs-kind">${hdGSLabel(r.type)}</span><span class="hd-gs-main"><b>${hdGSEsc(r.title)}</b><small>${hdGSEsc(r.subtitle)}</small></span><span class="hd-gs-arrow">›</span></button>`).join('')}`:'<div class="hd-gs-empty">一致する項目がないよ。別のキーワードも試してみて。</div>';
}
function hdGSSetCategory(cat){hdGSCategory=cat;document.querySelectorAll('[data-hd-gs-cat]').forEach(b=>b.classList.toggle('active',b.dataset.hdGsCat===cat));hdGSRender()}
function hdGSAttachLaunchers(){
 const qn=document.querySelector('#hdQuickNavDialog .hd-qn-tools');if(qn&&!qn.querySelector('[data-hd-gs-open]')){const b=document.createElement('button');b.type='button';b.className='primary small';b.dataset.hdGsOpen='1';b.textContent='全体検索';qn.appendChild(b)}
 const ph=document.querySelector('#hdPersonalHome .section-head');if(ph&&!ph.querySelector('[data-hd-gs-open]')){const b=document.createElement('button');b.type='button';b.className='ghost small';b.dataset.hdGsOpen='1';b.textContent='⌕ 全体検索';ph.appendChild(b)}
}
function hdGSEnsure(){
 let d=document.getElementById('hdGlobalSearchDialog');
 if(!d){d=document.createElement('dialog');d.id='hdGlobalSearchDialog';d.className='hd-gs-dialog';d.innerHTML=`<div class="hd-gs-head"><div><div class="eyebrow">GLOBAL SEARCH</div><h3>HarborDesk全体検索</h3></div><button type="button" class="ghost small" data-hd-gs-close>閉じる</button></div><div class="hd-gs-searchbox"><span>⌕</span><input id="hdGSSearch" type="search" autocomplete="off" placeholder="例：矢矧 / 6-5 / 東海 / あ号 / 東京急行"></div><div class="hd-gs-cats">${[['all','すべて'],['map','海域'],['ship','艦娘'],['equipment','装備'],['quest','任務'],['expedition','遠征'],['feature','機能']].map(([k,v])=>`<button type="button" class="ghost small${k==='all'?' active':''}" data-hd-gs-cat="${k}">${v}</button>`).join('')}</div><div id="hdGSResults" class="hd-gs-results"></div>`;document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)hdGSClose()});document.getElementById('hdGSSearch')?.addEventListener('input',hdGSRender)}
 hdGSAttachLaunchers();hdGSRender();
}
function hdGSOpen(query=''){hdGSEnsure();if(typeof hdQNClose==='function')hdQNClose();const d=document.getElementById('hdGlobalSearchDialog'),i=document.getElementById('hdGSSearch');if(i)i.value=query;hdGSCategory='all';document.querySelectorAll('[data-hd-gs-cat]').forEach(b=>b.classList.toggle('active',b.dataset.hdGsCat==='all'));hdGSRender();if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');setTimeout(()=>i?.focus(),50)}
function hdGSClose(){hdGSNavSeq++;const d=document.getElementById('hdGlobalSearchDialog');if(!d)return;if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open')}
function hdGSScroll(id){
 const el=document.getElementById(id);if(!el)return false;
 hdGSClose();
 const seq=++hdGSNavSeq;
 if(typeof hdWSShowElement==='function')hdWSShowElement(el,false);
 if(seq!==hdGSNavSeq)return false;
 try{
  el.scrollIntoView({behavior:'smooth',block:'start'});
  el.classList.add('hd-qn-flash');
  setTimeout(()=>{if(seq===hdGSNavSeq)el.classList.remove('hd-qn-flash')},900);
 }catch{}
 return true;
}
function hdGSOpenResult(row){
 if(!row)return;const a=row.action;hdGSSaveHistory(document.getElementById('hdGSSearch')?.value||row.title);
 if(a.kind==='feature'){hdGSScroll(a.id);return}
 if(a.kind==='map'){try{if(typeof hdWSShowElement==='function')hdWSShowElement('guide',false);selectedWorld=String(a.map).split('-')[0];selectedMap=a.map;if(typeof renderMapPicker==='function')renderMapPicker();hdGSClose();setTimeout(()=>document.getElementById('selectedMapCard')?.scrollIntoView({behavior:'smooth',block:'start'}),60)}catch{}return}
 if(a.kind==='ship'){try{if(typeof hdEnsureShipDatabase==='function')hdEnsureShipDatabase();hdShipDbType='すべて';hdShipDbMissingOnly=false;const cb=document.getElementById('hdShipDbMissingOnly');if(cb)cb.checked=false;const i=document.getElementById('hdShipDbSearch');if(i)i.value=a.name;if(typeof hdRenderShipDatabase==='function')hdRenderShipDatabase();hdGSScroll('shipDatabase')}catch{}return}
 if(a.kind==='roster'){hdGSScroll('roster');return}
 if(a.kind==='equipment'){try{if(typeof hdEnsureEquipmentCatalog==='function')hdEnsureEquipmentCatalog();hdEquipCatalogFilter='すべて';const i=document.getElementById('hdEquipCatalogSearch');if(i)i.value=a.name;if(typeof hdRenderEquipmentCatalog==='function')hdRenderEquipmentCatalog();hdGSScroll('equipmentBook')}catch{}return}
 if(a.kind==='ledger'){try{const i=document.getElementById('equipmentSearch');if(i){i.value=a.name;if(typeof renderEquipment==='function')renderEquipment()}hdGSScroll('equipmentBook')}catch{}return}
 if(a.kind==='quest'){try{if(typeof hdEnsureQuestDb==='function')hdEnsureQuestDb();hdQuestCycle=a.cycle;hdQuestType='すべて';document.querySelectorAll('[data-hd-quest-cycle]').forEach(b=>b.classList.toggle('active',b.dataset.hdQuestCycle===a.cycle));document.querySelectorAll('[data-hd-quest-type]').forEach(b=>b.classList.toggle('active',b.dataset.hdQuestType==='すべて'));const i=document.getElementById('hdQuestDbSearch');if(i)i.value=a.id;if(typeof hdRenderQuestDb==='function')hdRenderQuestDb();hdGSScroll('questDatabase')}catch{}return}
 if(a.kind==='expedition'){try{if(typeof hdEnsureExpeditionDb==='function')hdEnsureExpeditionDb();hdExpGoal='all';hdExpSearch=a.id;const i=document.getElementById('hdExpSearch');if(i)i.value=a.id;document.querySelectorAll('[data-hd-exp-goal]').forEach(b=>b.classList.toggle('active',b.dataset.hdExpGoal==='all'));if(typeof hdRenderExpeditionDb==='function')hdRenderExpeditionDb();hdGSScroll('expeditions')}catch{}return}
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-hd-gs-open]')){hdGSOpen();return}if(e.target.closest?.('[data-hd-gs-close]')){hdGSClose();return}const c=e.target.closest?.('[data-hd-gs-cat]');if(c){hdGSSetCategory(c.dataset.hdGsCat);return}const h=e.target.closest?.('[data-hd-gs-history]');if(h){const i=document.getElementById('hdGSSearch');if(i)i.value=h.dataset.hdGsHistory;hdGSRender();return}const r=e.target.closest?.('[data-hd-gs-result]');if(r)hdGSOpenResult(hdGSResults.get(r.dataset.hdGsResult))});
window.addEventListener('hd:quick-nav-updated',()=>hdGSAttachLaunchers());
window.addEventListener('hd:modules-ready',()=>setTimeout(hdGSEnsure,0));
window.addEventListener('load',()=>setTimeout(hdGSEnsure,1100));
setTimeout(hdGSEnsure,1800);
