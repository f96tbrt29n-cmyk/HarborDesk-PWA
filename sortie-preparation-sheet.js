const HD_SPS_EQUIP_KEY='harbordesk-equipment-v1';

function hdSPSEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSPSMap(){return typeof selectedMap!=='undefined'?selectedMap:''}
function hdSPSMapDetail(map){return typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{}}
function hdSPSFleets(map){try{return typeof hdSortieFleets==='function'?hdSortieFleets(map):(typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[])}catch{return []}}
function hdSPSFleet(map){
 const fleets=hdSPSFleets(map);if(!fleets.length)return null;
 const id=typeof hdSortieSelection==='function'?hdSortieSelection(map):fleets[0].id;
 return fleets.find(x=>x.id===id)||fleets[0];
}
function hdSPSRosterMatch(name){return typeof hdSortieRosterMatch==='function'?hdSortieRosterMatch(name):null}
function hdSPSRosterMatchShip(row){
 const gameId=Number(row?.gameShipId)||0,id=Number(row?.masterId)||0,name=String(row?.ship||'').trim();
 if(typeof rosterLoad==='function'){
  const rows=rosterLoad();if(gameId){const hit=rows.find(x=>Number(x.gameShipId)===gameId);if(hit)return hit}
  if(id){const hit=rows.find(x=>Number(x.masterId)===id);if(hit)return hit}
 }
 return name?hdSPSRosterMatch(name):null;
}
function hdSPSDb(name){return typeof hdSortieDb==='function'?hdSortieDb(name):null}
function hdSPSDbShip(row){
 const name=String(row?.ship||'').trim(),id=Number(row?.masterId)||0;
 if(typeof hdShipDbResolveShip==='function'&&name)return hdShipDbResolveShip({name,masterId:id});
 return name?hdSPSDb(name):null;
}
function hdSPSPlan(map){
 const p=typeof MAP_PLANS!=='undefined'?MAP_PLANS[map]:null;
 return p?.presets?.[0]||null;
}
function hdSPSNeeds(map){return typeof hdSEChecks==='function'?hdSEChecks(map):{rows:[],adv:{}}}
function hdSPSStatusLabel(status){return status==='ready'?'準備あり':status==='partial'?'一部あり':'不足'}
function hdSPSStatusClass(status){return status==='ready'?'ok':status==='partial'?'warn':'bad'}
function hdSPSAssignedEval(map,info){
 if(!info?.fleet||typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return null;
 try{return hdFEEvaluate(hdFEPlanFromSavedFleet(map,info.fleet))}catch{return null}
}
function hdSPSEquipmentInfo(map,fleetInfo){
 const assigned=hdSPSAssignedEval(map,fleetInfo);
 if(assigned&&assigned.items.length)return {rows:assigned.requirements||[],adv:(typeof hdSPSNeeds==='function'?hdSPSNeeds(map).adv:{}),assigned,source:'assigned'};
 const raw=hdSPSNeeds(map);return {rows:raw.rows||[],adv:raw.adv||{},assigned:null,source:'inventory'};
}

function hdSPSFleetInfo(map){
 const fleet=hdSPSFleet(map);
 if(!fleet)return {fleet:null,ships:[],registered:0,gearChecks:[],manual:[],manualState:{},manualDone:0,manualTotal:0};
 const ships=(fleet.ships||[]).filter(x=>String(x.ship||'').trim()||String(x.gear||'').trim());
 const registered=ships.filter(x=>x.ship&&hdSPSRosterMatchShip(x)).length;
 let auto={checks:[],adv:{}};
 try{if(typeof hdSortieAutoChecks==='function')auto=hdSortieAutoChecks(map,fleet)}catch{}
 let manual=[];
 try{if(typeof hdSortieManualChecks==='function')manual=hdSortieManualChecks(map,auto.adv||{})}catch{}
 let manualState={};
 try{if(typeof hdSortieState==='function')manualState=hdSortieState(map,fleet.id)||{}}catch{}
 return {fleet,ships,registered,gearChecks:auto.checks||[],manual,manualState,manualDone:manual.filter(x=>manualState[x.id]).length,manualTotal:manual.length};
}

function hdSPSFleetHtml(map,info){
 if(!info.fleet){
  const preset=hdSPSPlan(map);
  return `<section class="hd-sps-card hd-sps-fleet"><div class="hd-sps-card-head"><div><span>艦隊</span><strong>自分用編成が未登録</strong></div><b class="warn">要準備</b></div>
   ${preset?`<div class="hd-sps-preset"><span>海域の基本案</span><strong>${hdSPSEsc(preset.name)}</strong><p>${hdSPSEsc(preset.ships)}<br>${hdSPSEsc(preset.gear)}</p></div>`:''}
   <button type="button" class="primary small" data-hd-sps-tab="mine">自分用編成を作る</button></section>`;
 }
 const rows=info.ships.map((s,i)=>{
  const roster=s.ship?hdSPSRosterMatchShip(s):null,db=s.ship?hdSPSDbShip(s):null;
  const image=s.ship&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.ship}:s.ship,'sortie-prep-thumb'):'';
  return `<div class="hd-sps-ship ${s.ship&&roster?'ok':s.ship?'warn':'note'}"><span>${i+1}</span>${image}<div><strong>${hdSPSEsc(s.ship||'艦娘未入力')}</strong><small>${roster?`Lv.${hdSPSEsc(roster.level||'?')}${roster.remodel?` ・ ${hdSPSEsc(roster.remodel)}`:''}`:'艦隊台帳に未登録'}${db?.speed?` ・ ${hdSPSEsc(db.speed)}`:''}</small><em>${hdSPSEsc(s.gear||'装備メモなし')}</em></div></div>`;
 }).join('');
 const fleetState=info.ships.length&&info.registered===info.ships.length?'ok':info.ships.length?'warn':'bad';
 return `<section class="hd-sps-card hd-sps-fleet"><div class="hd-sps-card-head"><div><span>艦隊</span><strong>${hdSPSEsc(info.fleet.name)}</strong></div><b class="${fleetState}">${info.registered}/${info.ships.length} 台帳確認</b></div>
  <div class="hd-sps-ships">${rows||'<div class="empty">艦娘が未入力だよ</div>'}</div>
  ${info.fleet.memo?`<p class="hd-sps-memo">${hdSPSEsc(info.fleet.memo)}</p>`:''}
  <div class="hd-sps-card-actions"><button type="button" class="ghost small" data-hd-sps-tab="mine">編成・出撃前チェック</button><button type="button" class="ghost small" data-hd-sps-workspace="roster">艦隊台帳</button></div></section>`;
}

function hdSPSEquipmentHtml(map,fleetInfo){
 const info=hdSPSEquipmentInfo(map,fleetInfo),rows=info.rows||[],assigned=info.assigned;
 if(!rows.length)return `<section class="hd-sps-card"><div class="hd-sps-card-head"><div><span>装備</span><strong>特殊要求は少なめ</strong></div><b class="ok">確認</b></div><p class="muted">${assigned?'選択艦隊の実配備をマスター判定済み。':'海域データ上、強い特殊装備要求は検出されていないよ。'}</p></section>`;
 const ready=rows.filter(x=>x.status==='ready').length,master=assigned?.master||null,validationOk=!master||master.valid;
 const badge=ready===rows.length&&validationOk?'実配備OK':master?.invalid?.length?'装備不可あり':master?.unresolved?.length?'要確認':'不足あり';
 const cls=ready===rows.length&&validationOk?'ok':'warn';
 return `<section class="hd-sps-card"><div class="hd-sps-card-head"><div><span>装備</span><strong>${assigned?'実配備':'所持台帳'} ${ready}/${rows.length} 準備あり</strong></div><b class="${cls}">${badge}</b></div>
  ${assigned?`<div class="hd-sps-master-check ${master?.invalid?.length?'bad':master?.unresolved?.length?'warn':'ok'}"><b>マスター可否 ${master?.valid?'正常':'要確認'}</b><span>通常枠＋増設 ${master?.checked||0}件検証｜違反 ${master?.invalid?.length||0} / 未解決 ${master?.unresolved?.length||0}｜基礎制空 ${assigned.air?.basePower||0}</span></div>`:''}
  <div class="hd-sps-equip-grid">${rows.map(x=>`<div class="hd-sps-equip ${hdSPSStatusClass(x.status)}"><div><strong>${hdSPSEsc(x.label||x.kind)}</strong><small>${hdSPSEsc(x.detail||'')}</small></div><b>${hdSPSStatusLabel(x.status)}</b>${x.status!=='ready'? `<button type="button" class="ghost small" data-hd-sps-acquire="${hdSPSEsc(x.kind)}">入手ルート</button>`:''}</div>`).join('')}</div>
  <div class="hd-sps-card-actions"><button type="button" class="ghost small" data-hd-sps-tab="gear">装備タブ</button><button type="button" class="ghost small" data-hd-sps-workspace="hdEquipmentProcurement">調達リスト</button></div></section>`;
}
function hdSPSGameDiffHtml(match){
 if(!match)return '';
 const rows=[];
 if(match.deckOrderMismatch)rows.push('<div class="warn"><b>艦隊順</b><span>同じ艦は揃っているけど、ゲーム側と並び順が違う</span></div>');
 for(const ship of match.details||[]){
  if(ship.status==='unknown')rows.push(`<div class="warn"><b>${hdSPSEsc(ship.name)}</b><span>ゲーム装備の同期データが不足</span></div>`);
  for(const diff of ship.mismatches||[]){
   const where=diff.slotIndex==='ex'?'補強増設':`第${Number(diff.slotIndex)+1}スロ`,planned=diff.planned||'空き',actual=diff.actual||'空き';
   rows.push(`<div class="bad"><b>${hdSPSEsc(ship.name)}｜${hdSPSEsc(where)}</b><span>予定: ${hdSPSEsc(planned)} → ゲーム: ${hdSPSEsc(actual)}</span></div>`);
  }
 }
 return rows.length?`<div class="hd-sps-game-diffs"><strong>ゲームとの差分</strong>${rows.join('')}</div>`:'';
}
function hdSPSAutoHtml(auto){
 if(!auto)return '';
 const label=typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(auto.status):auto.status==='ready'?'OK':auto.status==='missing'?'不足/不可':'要確認',cls=auto.status==='ready'?'ok':auto.status==='missing'?'bad':'warn',gate=typeof hdFEGateHtml==='function'?hdFEGateHtml(auto):'';
 return `<section class="hd-sps-card hd-sps-auto"><div class="hd-sps-card-head"><div><span>自動判定</span><strong>艦状態・補給・同期鮮度・ゲーム反映・編成・装備・制空・索敵</strong></div><b class="${cls}">${hdSPSEsc(label)}</b></div>${gate}<div class="hd-sps-auto-grid">${(auto.checks||[]).map(x=>`<div class="${x.status}"><span>${hdSPSEsc(x.label)}</span><b>${hdSPSEsc(typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(x.status):x.status)}</b><small>${hdSPSEsc(x.detail||'')}</small></div>`).join('')}</div>${hdSPSGameDiffHtml(auto.gameMatch)}${auto.scouting?.available&&auto.scouting?.checks?.length?`<div class="hd-sps-auto-los">${auto.scouting.checks.map(x=>`<span class="${x.status}">${hdSPSEsc(x.label)}：推定33式 ${Number(auto.scouting.score).toFixed(2)} / 安全域 ${x.safe}</span>`).join('')}</div>`:''}<p class="muted">「要確認」はデータ不足または海域条件が分岐ごとに異なる項目。ゲーム側の最終確認を残すよ。</p></section>`;
}

function hdSPSBaseInfo(map){
 if(typeof hdLBMapInfo!=='function'||typeof hdLBState!=='function')return {available:false};
 const meta=hdLBMapInfo(map);if(!meta?.available)return {available:false};
 const state=hdLBState(map),usage=new Map(),corps=[];
 for(const [i,c] of (state.corps||[]).entries()){
  const squads=c.squads||[];
  for(const s of squads){if(s.name)usage.set(s.name,(usage.get(s.name)||0)+1)}
  const radius=typeof hdLBActionRadius==='function'?hdLBActionRadius(c):{radius:null};
  const target=Math.max(0,Number(c.targetRadius)||Number(meta.bossRadius)||0);
  const configured=squads.filter(s=>s.name).length;
  const reach=radius.radius!=null&&(!target||radius.radius>=target);
  const power=typeof hdLBCorpsPower==='function'?hdLBCorpsPower(c,c.mode==='defense'?'defense':'sortie'):{total:0};
  corps.push({index:i+1,mode:c.mode,configured,radius:radius.radius,target,reach,power:Number(power.total)||0,squads});
 }
 const shortages=[];
 for(const [name,count] of usage){const own=typeof hdLBOwned==='function'?hdLBOwned(name).count:0;if(own<count)shortages.push({name,need:count,own})}
 const sortie=corps.filter(x=>x.mode==='sortie'),limit=Math.max(1,Number(meta.sorties)||1);
 const sortieReady=sortie.length>0&&sortie.length<=limit&&sortie.every(x=>x.configured===4&&x.reach)&&shortages.length===0;
 return {available:true,meta,state,corps,shortages,sortieReady,limit};
}
function hdSPSBaseHtml(map){
 const b=hdSPSBaseInfo(map);if(!b.available)return '';
 const rows=b.corps.map(c=>`<div class="hd-sps-base-corps ${c.mode==='sortie'?(c.configured===4&&c.reach?'ok':'warn'):'note'}"><div><strong>第${c.index}航空隊</strong><small>${c.mode==='sortie'?'出撃':c.mode==='defense'?'防空':'待機'} ・ ${c.configured}/4中隊</small></div><span>半径 ${c.radius??'?'}${c.target?` / ${c.target}`:''}</span><span>制空 ${c.power}</span></div>`).join('');
 return `<section class="hd-sps-card"><div class="hd-sps-card-head"><div><span>基地航空隊</span><strong>出撃可能 ${b.limit}部隊</strong></div><b class="${b.sortieReady?'ok':'warn'}">${b.sortieReady?'設定確認':'要確認'}</b></div>
  <div class="hd-sps-base-list">${rows}</div>
  ${b.shortages.length?`<div class="hd-sps-alert">台帳不足: ${b.shortages.map(x=>`${hdSPSEsc(x.name)} ${x.own}/${x.need}`).join('、')}</div>`:''}
  <div class="hd-sps-card-actions"><button type="button" class="ghost small" data-hd-sps-tab="gear" data-hd-sps-focus-base>基地航空隊を調整</button></div></section>`;
}

function hdSPSManualHtml(map,info){
 if(!info.fleet||!info.manualTotal)return '';
 return `<section class="hd-sps-card"><div class="hd-sps-card-head"><div><span>出撃直前</span><strong>手動チェック ${info.manualDone}/${info.manualTotal}</strong></div><b class="${info.manualDone===info.manualTotal?'ok':'warn'}">${info.manualDone===info.manualTotal?'確認済み':'未確認あり'}</b></div>
  <div class="hd-sps-manual">${info.manual.map(x=>`<div class="${info.manualState[x.id]?'done':''}"><span>${info.manualState[x.id]?'✓':'○'}</span><p>${hdSPSEsc(x.label)}</p></div>`).join('')}</div>
  <div class="hd-sps-card-actions"><button type="button" class="primary small" data-hd-sps-tab="mine">チェックを進める</button></div></section>`;
}

function hdSPSSummaryText(map){
 const d=hdSPSMapDetail(map),fleet=hdSPSFleetInfo(map),eq=hdSPSEquipmentInfo(map,fleet),base=hdSPSBaseInfo(map);
 const lines=[`HarborDesk 出撃準備表｜${map} ${d.name||''}`,fleet.fleet?`艦隊: ${fleet.fleet.name}（台帳確認 ${fleet.registered}/${fleet.ships.length}）`:'艦隊: 自分用編成なし'];
 for(const x of eq.rows||[])lines.push(`装備: ${x.label||x.kind} = ${hdSPSStatusLabel(x.status)}（${x.detail||''}）`);
 if(eq.assigned){lines.push(`装備マスター可否: ${eq.assigned.master?.valid?'正常':`要確認（違反${eq.assigned.master?.invalid?.length||0}/未解決${eq.assigned.master?.unresolved?.length||0}）`}`);lines.push(`基礎制空（熟練度なし）: ${eq.assigned.air?.basePower||0}`);if(eq.assigned.auto){const gate=typeof hdFEGoNoGo==='function'?hdFEGoNoGo(eq.assigned.auto):null;lines.push(`自動判定: ${typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(eq.assigned.auto.status):eq.assigned.auto.status}`);if(gate){lines.push(`出撃判定: ${gate.label}（${gate.detail}）`);for(const x of gate.actions)lines.push(`  次: ${x.action}`)}for(const x of eq.assigned.auto.checks||[])lines.push(`  ${x.label}: ${typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(x.status):x.status}（${x.detail||''}）`);for(const ship of eq.assigned.auto.gameMatch?.details||[])for(const diff of ship.mismatches||[])lines.push(`  差分: ${ship.name} ${diff.slotIndex==='ex'?'補強増設':`第${Number(diff.slotIndex)+1}スロ`}｜予定 ${diff.planned||'空き'} → ゲーム ${diff.actual||'空き'}`)}}
 if(base.available){lines.push(`基地航空隊: ${base.sortieReady?'設定確認':'要確認'}`);for(const c of base.corps)lines.push(`第${c.index}: ${c.mode} ${c.configured}/4中隊 半径${c.radius??'?'} 制空${c.power}`)}
 if(fleet.manualTotal)lines.push(`出撃直前チェック: ${fleet.manualDone}/${fleet.manualTotal}`);
 return lines.join('\n');
}
async function hdSPSCopy(map){
 const text=hdSPSSummaryText(map);
 try{await navigator.clipboard.writeText(text)}catch{try{prompt('出撃準備表をコピーしてね',text)}catch{}}
}

function hdSPSRender(){
 const host=document.getElementById('hdSortiePreparationBody'),title=document.getElementById('hdSortiePreparationMap');if(!host)return;
 const map=hdSPSMap();if(!map){if(title)title.textContent='海域未選択';host.innerHTML='<div class="empty">攻略タブで海域を選ぶと、艦隊・装備・基地航空隊をまとめた準備表を作るよ。</div>';return}
 const d=hdSPSMapDetail(map),fleet=hdSPSFleetInfo(map);
 if(title)title.textContent=`${map} ${d.name||''}`;
 const eq=hdSPSEquipmentInfo(map,fleet),base=hdSPSBaseInfo(map),auto=eq.assigned?.auto||null;
 const fleetReady=!!fleet.fleet&&fleet.ships.length>0&&fleet.registered===fleet.ships.length;
 const eqReady=(eq.rows||[]).every(x=>x.status==='ready')&&(!eq.assigned||eq.assigned.master?.valid);
 const baseReady=!base.available||base.sortieReady;
 const manualReady=!fleet.manualTotal||fleet.manualDone===fleet.manualTotal;
 const score=[fleetReady,eqReady,baseReady,manualReady].filter(Boolean).length,autoLabel=auto?(typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(auto.status):auto.status):'編成保存後に判定';
 host.innerHTML=`<div class="hd-sps-overview"><div><strong>準備状況 ${score}/4</strong><span>艦隊・装備・基地航空隊・出撃直前チェックを統合 ｜ 自動判定 ${hdSPSEsc(autoLabel)}</span></div><div class="hd-sps-actions"><button type="button" class="ghost small" data-hd-sps-refresh>再判定</button><button type="button" class="ghost small" data-hd-sps-copy>準備表をコピー</button><button type="button" class="ghost small" data-hd-sps-guide>海域攻略へ戻る</button></div></div>
  ${hdSPSAutoHtml(auto)}
  <div class="hd-sps-grid">${hdSPSFleetHtml(map,fleet)}${hdSPSEquipmentHtml(map,fleet)}${hdSPSBaseHtml(map)}${hdSPSManualHtml(map,fleet)}</div>
  <div class="hd-sps-foot">※自動判定は同期済み艦状態・保存編成・実配備装備と登録済み海域閾値を照合する補助。敵編成変化、熟練度、イベント固有条件などはゲーム画面で最終確認してね。</div>`;
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
}
function hdSPSEnsure(){
 if(document.getElementById('hdSortiePreparation'))return;
 const guide=document.getElementById('guide');if(!guide)return;
 const sec=document.createElement('section');sec.id='hdSortiePreparation';sec.className='advanced-section hd-sps-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">SORTIE PREPARATION SHEET</div><h2>出撃準備表</h2></div><span id="hdSortiePreparationMap" class="muted">海域未選択</span></div><div id="hdSortiePreparationBody"></div>`;
 guide.insertAdjacentElement('afterend',sec);hdSPSRender();
}
function hdSPSReveal(target){
 if(!target)return false;
 target.classList?.remove('hd-ws-hidden');
 for(let p=target.parentElement;p&&p!==document.body;p=p.parentElement)p.classList?.remove('hd-ws-wrapper-hidden');
 target.scrollIntoView?.({behavior:'smooth',block:'start'});return true;
}
function hdSPSOpen(){
 hdSPSEnsure();const target=document.getElementById('hdSortiePreparation');if(!(typeof hdWSShowElement==='function'&&hdWSShowElement(target||'hdSortiePreparation',true)))hdSPSReveal(target);setTimeout(hdSPSRender,40);
}
function hdSPSOpenWorkspace(id){
 if(typeof hdWSShowElement==='function'&&hdWSShowElement(id,true))return true;
 return hdSPSReveal(document.getElementById(id));
}
function hdSPSOpenMapTab(tab,focusBase=false){
 if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);
 setTimeout(()=>{if(typeof hdSortieOpenTab==='function')hdSortieOpenTab(tab);else if(typeof window.hdCoreMapAction==='function')Promise.resolve(window.hdCoreMapAction(tab)).catch(()=>{});else document.querySelector(`[data-map-tab="${tab}"]`)?.click();if(focusBase)setTimeout(()=>document.getElementById('hdLandBasePlanner')?.scrollIntoView({behavior:'smooth',block:'start'}),120)},80);
}
function hdSPSMapButton(){
 const head=document.querySelector('#selectedMapCard .map-tabs-head');if(!head||head.querySelector('[data-hd-sps-open]'))return;
 const b=document.createElement('button');b.type='button';b.className='primary small hd-sps-open';b.dataset.hdSpsOpen='1';b.textContent='出撃準備表';head.appendChild(b);
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-hd-sps-open]')){hdSPSOpen();return}
 if(e.target.closest?.('[data-hd-sps-refresh]')){hdSPSRender();return}
 if(e.target.closest?.('[data-hd-sps-copy]')){const map=hdSPSMap();if(map)hdSPSCopy(map);return}
 if(e.target.closest?.('[data-hd-sps-guide]')){hdSPSOpenWorkspace('guide');return}
 const tab=e.target.closest?.('[data-hd-sps-tab]');if(tab){hdSPSOpenMapTab(tab.dataset.hdSpsTab,tab.hasAttribute('data-hd-sps-focus-base'));return}
 const ws=e.target.closest?.('[data-hd-sps-workspace]');if(ws){hdSPSOpenWorkspace(ws.dataset.hdSpsWorkspace);return}
 const acq=e.target.closest?.('[data-hd-sps-acquire]');if(acq&&typeof hdAGOpen==='function'){hdAGOpen(acq.dataset.hdSpsAcquire,hdSPSMap());return}
});
window.addEventListener('hd:map-rendered',()=>{hdSPSMapButton();hdSPSRender()});
window.addEventListener('hd:kancolle-sync',hdSPSRender);
window.addEventListener('hd:custom-fleets-changed',hdSPSRender);
window.addEventListener('hd:workspace-refresh',hdSPSRender);
window.addEventListener('hd:ship-images-changed',hdSPSRender);
window.addEventListener('hd:ship-images-ready',hdSPSRender);
window.addEventListener('storage',e=>{if([HD_SPS_EQUIP_KEY,'harbordesk-ship-roster-v1','harbordesk-custom-fleets-v1','harbordesk-land-base-v1','harbordesk-sortie-readiness-v1'].includes(e.key))hdSPSRender()});
window.addEventListener('load',()=>setTimeout(()=>{hdSPSEnsure();hdSPSMapButton();hdSPSRender()},500));
