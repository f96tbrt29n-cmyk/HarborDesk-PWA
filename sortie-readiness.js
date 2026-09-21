const HD_SORTIE_READY_KEY='harbordesk-sortie-readiness-v1';
const HD_SORTIE_SELECT_KEY='harbordesk-sortie-selection-v1';

const HD_SORTIE_GEAR_PATTERNS={
 '対潜':[/ソナー/i,/爆雷/i,/水中探信/i,/水中聴音/i,/東海/i,/S-51/i,/カ号/i,/オ号/i],
 '制空':[/艦戦/i,/烈風/i,/零戦/i,/岩本/i,/水戦/i,/F6F/i,/紫電/i,/橘花/i],
 '防空':[/高角砲/i,/機銃/i,/噴進砲/i,/対空電探/i,/Bofors/i],
 '対地':[/三式弾/i,/内火艇/i,/陸戦隊/i,/WG/i,/M4A1/i,/大発/i],
 '索敵':[/水偵/i,/偵察/i,/電探/i,/紫雲/i,/彩雲/i,/レーダー/i],
 '夜戦':[/夜偵/i,/照明弾/i,/探照灯/i,/見張員/i],
 '輸送':[/大発/i,/ドラム缶/i,/内火艇/i],
 '電探':[/電探/i,/レーダー/i,/SG/i,/FuMO/i],
 '煙幕':[/煙幕/i,/発煙/i]
};

function hdSortieEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSortieLoad(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdSortieSave(key,value){localStorage.setItem(key,JSON.stringify(value))}
function hdSortieFleets(map){try{return typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]}catch{return []}}
function hdSortieSelection(map){const s=hdSortieLoad(HD_SORTIE_SELECT_KEY,{}),fleets=hdSortieFleets(map);return fleets.find(x=>x.id===s[map])?.id||fleets[0]?.id||''}
function hdSortieSetSelection(map,id){const s=hdSortieLoad(HD_SORTIE_SELECT_KEY,{});s[map]=id;hdSortieSave(HD_SORTIE_SELECT_KEY,s);hdRenderSortieReadiness()}
function hdSortieFleetFingerprint(fleet){
 const rows=(fleet?.ships||[]).map(s=>({
  ship:String(s?.ship||'').trim(),level:Number(s?.level)||0,gear:String(s?.gear||'').trim(),
  nowHp:s?.nowHp==null?null:Number(s.nowHp),maxHp:s?.maxHp==null?null:Number(s.maxHp),cond:s?.cond==null?null:Number(s.cond)
 }));
 const raw=JSON.stringify({source:String(fleet?.source||''),sourceSyncedAt:Number(fleet?.sourceSyncedAt)||0,updatedAt:Number(fleet?.updatedAt)||0,ships:rows});
 let h=2166136261;for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36);
}
function hdSortieFleetById(map,fleetId){return hdSortieFleets(map).find(x=>String(x.id)===String(fleetId))||null}
function hdSortieState(map,fleetId){
 const row=hdSortieLoad(HD_SORTIE_READY_KEY,{})[`${map}:${fleetId}`]||{},fleet=hdSortieFleetById(map,fleetId),fingerprint=hdSortieFleetFingerprint(fleet);
 if(!row.updatedAt)return row;
 if(!row._fingerprint||row._fingerprint!==fingerprint)return {_resetReason:'編成または同期状態が変わったため、手動チェックを再確認してね'};
 if(Date.now()-Number(row.updatedAt)>2*60*60*1000)return {_resetReason:'前回の出撃前確認から2時間以上たったため、現在状態をもう一度確認してね'};
 return row;
}
function hdSortieSetCheck(map,fleetId,id,checked){
 const all=hdSortieLoad(HD_SORTIE_READY_KEY,{}),k=`${map}:${fleetId}`,fleet=hdSortieFleetById(map,fleetId),fingerprint=hdSortieFleetFingerprint(fleet),prev=all[k]||{},base=prev._fingerprint===fingerprint?prev:{};
 all[k]={...base,_fingerprint:fingerprint,[id]:checked,updatedAt:Date.now()};hdSortieSave(HD_SORTIE_READY_KEY,all);hdRenderSortieReadiness()
}
function hdSortieReset(map,fleetId){const all=hdSortieLoad(HD_SORTIE_READY_KEY,{});delete all[`${map}:${fleetId}`];hdSortieSave(HD_SORTIE_READY_KEY,all);hdRenderSortieReadiness()}
function hdSortieRoster(){try{return JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{return []}}
function hdSortieDb(name){if(typeof HD_SHIP_DATABASE==='undefined')return null;const n=String(name||'').trim();return HD_SHIP_DATABASE.find(x=>n===x.base||n===x.final||n.startsWith(x.base))||null}
function hdSortieRosterMatch(name){const n=String(name||'').trim();return hdSortieRoster().find(x=>String(x.name||'').trim()===n)||null}
function hdSortieGearText(fleet){return (fleet?.ships||[]).map(x=>x.gear||'').join(' ')}
function hdSortieAgeLabel(ts){
 const t=Number(ts)||0;if(!t)return '同期時刻不明';
 const d=Math.max(0,Date.now()-t);
 if(d<60000)return 'たった今';
 if(d<3600000)return Math.floor(d/60000)+'分前';
 if(d<86400000)return Math.floor(d/3600000)+'時間前';
 return Math.floor(d/86400000)+'日前';
}
function hdSortieNeeds(map){
 if(typeof hdMapEquipNeeds==='function')return hdMapEquipNeeds(map);
 const d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{};const text=`${d.overview||''} ${d.route||''} ${d.air||''} ${d.note||d.caution||''}`;const needs=[];
 const add=(id)=>{if(!needs.some(x=>x.id===id))needs.push({id,label:id,reason:''})};
 if(/潜水|対潜/.test(text))add('対潜');if(/制空|航空戦|空襲/.test(text)){add('制空');add('防空')}if(/対地|陸上型|集積地|砲台|港湾/.test(text))add('対地');if(/索敵/.test(text))add('索敵');if(/夜戦/.test(text))add('夜戦');if(/高速\+|最速|速力/.test(text))add('高速化');return {needs,adv:{}};
}
function hdSortieGearDetected(kind,text){
 if(kind==='高速化')return /タービン/i.test(text)&&/(缶|高温高圧)/i.test(text);
 return (HD_SORTIE_GEAR_PATTERNS[kind]||[]).some(re=>re.test(text));
}
function hdSortieAutoChecks(map,fleet){
 const ships=(fleet?.ships||[]).filter(x=>String(x.ship||'').trim()),gear=hdSortieGearText(fleet),{needs,adv}=hdSortieNeeds(map);const out=[];
 out.push({label:'編成入力',state:ships.length?'ok':'warn',detail:ships.length?`${ships.length}隻を保存済み`:'艦娘が未入力'});
 const registered=ships.filter(x=>hdSortieRosterMatch(x.ship)).length;
 out.push({label:'艦隊台帳',state:ships.length&&registered===ships.length?'ok':'note',detail:ships.length?`${registered}/${ships.length}隻を台帳で確認`:'編成を先に保存',action:ships.length&&registered===ships.length?'':'roster',actionLabel:'艦隊台帳'});
 if(fleet?.source==='kancolle-import'){
   const syncAt=Number(fleet.sourceSyncedAt)||0,age=syncAt?Math.max(0,Date.now()-syncAt):Infinity;
   out.push({label:'ゲーム同期',state:age<=30*60*1000?'ok':'note',detail:syncAt?`${hdSortieAgeLabel(syncAt)}の艦隊状態`:'同期時刻が不明・ゲーム側で再確認',action:age<=30*60*1000?'':'kancolleImport',actionLabel:'再同期'});
   const hpRows=ships.filter(x=>Number(x.maxHp)>0),hp25=hpRows.filter(x=>Number(x.nowHp)/Number(x.maxHp)<=.25),hp50=hpRows.filter(x=>Number(x.nowHp)/Number(x.maxHp)<=.5&&Number(x.nowHp)/Number(x.maxHp)>.25);
   if(hpRows.length)out.push({label:'耐久',state:hp25.length?'warn':hp50.length?'note':'ok',detail:hp25.length?`HP25%以下: ${hp25.map(x=>x.ship).join('、')}`:hp50.length?`HP50%以下: ${hp50.map(x=>x.ship).join('、')}`:'同期時点でHP50%以下なし',action:(hp25.length||hp50.length)?'home':'',actionLabel:'現在艦隊'});
   const condRows=ships.filter(x=>x.cond!=null&&Number.isFinite(Number(x.cond))),tired=condRows.filter(x=>Number(x.cond)<40);
   if(condRows.length)out.push({label:'疲労',state:tired.length?'warn':'ok',detail:tired.length?`cond40未満: ${tired.map(x=>x.ship).join('、')}`:'同期時点でcond40未満なし',action:tired.length?'home':'',actionLabel:'現在艦隊'});
 }
 for(const n of needs){
   const detected=hdSortieGearDetected(n.id,gear);
   out.push({label:`${n.label||n.id}装備`,state:detected?'ok':'note',detail:detected?'装備メモから候補を検出':'装備メモでは未検出・ゲーム側を確認',action:detected?'':'tab:gear',actionLabel:'装備候補'});
 }
 if(adv?.los)out.push({label:'索敵条件',state:'note',detail:`${adv.los.coef!=null?`分岐点係数${adv.los.coef}・`:''}${adv.los.summary||'必要値を確認'}`,action:'tab:gear',actionLabel:'装備候補'});
 const speedNeeded=needs.some(x=>x.id==='高速化');
 if(speedNeeded){const lows=ships.map(x=>({name:x.ship,db:hdSortieDb(x.ship)})).filter(x=>x.db?.speed==='低速');out.push({label:'速力',state:lows.length?'note':'ok',detail:lows.length?`低速艦 ${lows.map(x=>x.name).join('、')}。缶/タービン構成を確認`:'DB上の低速艦は未検出',action:lows.length?'tab:gear':'',actionLabel:'装備候補'});}
 return {checks:out,needs,adv};
}
function hdSortieManualChecks(map,adv,fleetOverride=null){
 const fleet=fleetOverride||hdSortieFleetById(map,hdSortieSelection(map)),gear=hdSortieGearText(fleet),rows=[
  {id:'supply',label:'燃料・弾薬を満タンまで補給した'},
  {id:'damage',label:'大破艦がいないことを確認した'},
  {id:'morale',label:'オレンジ/赤疲労がないことを確認した'},
  {id:'loadout',label:'ゲーム側の編成・装備をこの予定どおりに合わせた'},
  {id:'mission',label:'任務・編成指定を確認した'}
 ];
 if(/艦戦|艦攻|艦爆|水戦|水爆|偵察機|彩雲|瑞雲|烈風|零戦|飛龍|銀河|東海/i.test(gear))rows.splice(3,0,{id:'aircraft',label:'艦載機を補充して搭載数を確認した'});
 if(adv?.los)rows.push({id:'los',label:'索敵値・分岐条件を確認した'});
 if(adv?.base?.available)rows.push({id:'base',label:`基地航空隊（${adv.base.sorties||1}部隊・半径${adv.base.bossRadius??'要確認'}）を確認した`});
 const text=typeof hdMapEquipText==='function'?hdMapEquipText(map):'';
 if(/支援|決戦支援|道中支援/.test(text)||['5-5','6-5'].includes(map))rows.push({id:'support',label:'必要なら支援艦隊を準備した'});
 return rows;
}
function hdSortieOperationalConfirmation(map,fleetId){
 const fleet=hdSortieFleetById(map,fleetId||hdSortieSelection(map));if(!fleet)return {valid:false,map,fleetId:'',updatedAt:0};
 const state=hdSortieState(map,fleet.id),manual=hdSortieManualChecks(map,hdSortieNeeds(map)?.adv||{},fleet),ids=new Set(manual.map(x=>x.id)),updatedAt=Number(state.updatedAt)||0,ageMinutes=updatedAt?Math.max(0,Math.floor((Date.now()-updatedAt)/60000)):null,valid=!!updatedAt&&!state._resetReason;
 return {
  valid,map,fleetId:fleet.id,updatedAt,ageMinutes,
  supply:valid&&!!state.supply,damage:valid&&!!state.damage,morale:valid&&!!state.morale,
  loadout:valid&&!!state.loadout,aircraft:valid&&(!ids.has('aircraft')||!!state.aircraft),
  aircraftRequired:ids.has('aircraft'),
  completeDynamic:valid&&!!state.supply&&!!state.damage&&!!state.morale&&!!state.loadout&&(!ids.has('aircraft')||!!state.aircraft)
 };
}
function hdSortieSortedChecks(rows=[]){const rank={warn:0,note:1,ok:2};return [...rows].sort((a,b)=>(rank[a.state]??9)-(rank[b.state]??9))}
function hdSortieSummary(manual,state,auto){const done=manual.filter(x=>state[x.id]).length,total=manual.length,autoOk=auto.filter(x=>x.state==='ok').length,autoWarn=auto.filter(x=>x.state==='warn').length,autoNote=auto.filter(x=>x.state==='note').length;return {done,total,pct:total?Math.round(done/total*100):0,autoOk,autoWarn,autoNote,autoTotal:auto.length}}
function hdSortieOpenTab(tab){const btn=document.querySelector(`[data-map-tab="${tab}"]`);if(btn)btn.click()}
function hdSortieOpenAction(action){
 const value=String(action||'');if(!value)return false;
 if(value.startsWith('tab:')){hdSortieOpenTab(value.slice(4));return true}
 if(typeof hdWSShowElement==='function')return hdWSShowElement(value,true);
 const target=document.getElementById(value);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});return true}
 return false;
}
function hdSortieAutoRowHtml(x){
 return `<div class="hd-sortie-auto-row ${x.state}"><span class="hd-sortie-dot"></span><div><b>${hdSortieEsc(x.label)}</b><small>${hdSortieEsc(x.detail)}</small></div>${x.action?`<button type="button" class="ghost small hd-sortie-auto-action" data-hd-sortie-action="${hdSortieEsc(x.action)}">${hdSortieEsc(x.actionLabel||'確認')}</button>`:''}</div>`;
}
function hdSortieNextActionHtml(x){
 if(!x)return '';
 const tone=x.state==='warn'?'warn':'note';
 return `<div class="hd-sortie-next ${tone}"><div class="hd-sortie-next-copy"><span>まず直す</span><strong>${hdSortieEsc(x.label)}</strong><small>${hdSortieEsc(x.detail)}</small></div>${x.action?`<button type="button" class="primary small" data-hd-sortie-action="${hdSortieEsc(x.action)}">${hdSortieEsc(x.actionLabel||'確認')}</button>`:''}</div>`;
}
function hdSortieFinalHtml(sum){
 const manualLeft=Math.max(0,sum.total-sum.done),autoIssues=sum.autoWarn+sum.autoNote,ready=manualLeft===0&&autoIssues===0;
 if(ready)return '<div class="hd-sortie-final ready"><div><span>READY</span><strong>準備チェック完了</strong><small>ゲーム画面で最終確認して出撃できるよ。</small></div><a class="primary small" href="https://play.games.dmm.com/game/kancolle">艦これを開く</a></div>';
 const parts=[];if(autoIssues)parts.push('自動確認 '+autoIssues+'件');if(manualLeft)parts.push('手動確認 '+manualLeft+'件');
 return `<div class="hd-sortie-final pending"><div><span>NEXT</span><strong>あと ${parts.join(' / ')}</strong><small>上から確認していけば出撃準備完了になるよ。</small></div></div>`;
}
function hdSortieManualRowHtml(x,state){
 return `<label class="hd-sortie-check ${state[x.id]?'done':''}"><input type="checkbox" data-hd-sortie-check="${x.id}" ${state[x.id]?'checked':''}><span>${hdSortieEsc(x.label)}</span></label>`;
}
function hdSortieHtml(map){
 const fleets=hdSortieFleets(map);if(!fleets.length)return `<section id="hdSortieReadiness" class="hd-sortie-ready"><div class="hd-sortie-head"><div><div class="eyebrow">SORTIE READY</div><h4>出撃前チェック</h4></div></div><div class="empty">この海域の「自分用編成」を保存すると、編成と海域条件を照合して出撃前チェックを作れるよ。</div></section>`;
 const fleetId=hdSortieSelection(map),fleet=fleets.find(x=>x.id===fleetId)||fleets[0],autoInfo=hdSortieAutoChecks(map,fleet),manual=hdSortieManualChecks(map,autoInfo.adv),state=hdSortieState(map,fleet.id),sum=hdSortieSummary(manual,state,autoInfo.checks),sortedChecks=hdSortieSortedChecks(autoInfo.checks),problemChecks=sortedChecks.filter(x=>x.state!=='ok'),nextCheck=problemChecks[0]||null,remainingProblems=problemChecks.slice(1),okChecks=sortedChecks.filter(x=>x.state==='ok'),manualPending=manual.filter(x=>!state[x.id]),manualDone=manual.filter(x=>state[x.id]),autoState=sum.autoWarn?'warn':sum.autoNote?'note':'ok',autoLabel=sum.autoWarn?`要確認 ${sum.autoWarn}件`:sum.autoNote?`注意 ${sum.autoNote}件`:'自動確認OK';
 return `<section id="hdSortieReadiness" class="hd-sortie-ready"><div class="hd-sortie-head"><div><div class="eyebrow">SORTIE READY</div><h4>出撃前チェック</h4></div><span class="hd-sortie-score">手動 ${sum.done}/${sum.total}</span></div><div class="hd-sortie-overview ${autoState}"><strong>${autoLabel}</strong><span>自動 ${sum.autoOk}/${sum.autoTotal} OK</span></div><p class="muted">同期は艦隊・装備台帳の基準点として使うよ。耐久・疲労・補給・艦載機・ゲーム側の編成/装備は、毎回の同期ではなく下の「出撃直前」チェックを最新状態として優先する。</p><label class="hd-sortie-select">使用編成<select id="hdSortieFleetSelect">${fleets.map(x=>`<option value="${hdSortieEsc(x.id)}" ${x.id===fleet.id?'selected':''}>${hdSortieEsc(x.name)}</option>`).join('')}</select></label><div class="hd-sortie-progress"><progress max="100" value="${sum.pct}"></progress><span>${sum.pct}%</span></div><div class="hd-sortie-auto"><div class="hd-sortie-subhead"><strong>自動確認</strong><span>${sum.autoOk}/${sum.autoTotal}項目検出</span></div>${hdSortieNextActionHtml(nextCheck)}${remainingProblems.length?`<div class="hd-sortie-more-issues"><span>ほかの確認項目 ${remainingProblems.length}件</span>${remainingProblems.map(hdSortieAutoRowHtml).join('')}</div>`:''}${okChecks.length?`<details class="hd-sortie-auto-ok"><summary><span>OK項目</span><b>${okChecks.length}件</b></summary><div>${okChecks.map(hdSortieAutoRowHtml).join('')}</div></details>`:''}</div><div class="hd-sortie-manual"><div class="hd-sortie-subhead"><strong>出撃直前</strong><span>${manualPending.length?`残り ${manualPending.length}件`:'手動チェック完了'}</span></div>${state._resetReason?`<div class="hd-sortie-reset-note"><span>↻</span><div><b>チェックを再確認</b><small>${hdSortieEsc(state._resetReason)}</small></div></div>`:''}${manualPending.map(x=>hdSortieManualRowHtml(x,state)).join('')}${manualDone.length?`<details class="hd-sortie-manual-done"><summary><span>完了済み</span><b>${manualDone.length}件</b></summary><div>${manualDone.map(x=>hdSortieManualRowHtml(x,state)).join('')}</div></details>`:''}</div><div class="hd-sortie-actions"><button type="button" class="ghost small" data-hd-sortie-refresh>再判定</button><button type="button" class="ghost small" data-hd-sortie-gear>装備候補を見る</button><button type="button" class="ghost small" data-hd-sortie-reset>チェックをリセット</button></div>${hdSortieFinalHtml(sum)}</section>`;
}
function hdRenderSortieReadiness(){
 if(typeof selectedMap==='undefined'||!selectedMap)return;const pane=document.querySelector('[data-map-pane="mine"]');if(!pane)return;pane.querySelector('#hdSortieReadiness')?.remove();pane.insertAdjacentHTML('beforeend',hdSortieHtml(selectedMap));
 const sel=document.getElementById('hdSortieFleetSelect');if(sel)sel.addEventListener('change',e=>hdSortieSetSelection(selectedMap,e.target.value));
}

document.addEventListener('change',e=>{const c=e.target.closest?.('[data-hd-sortie-check]');if(c&&typeof selectedMap!=='undefined'&&selectedMap){const id=hdSortieSelection(selectedMap);if(id)hdSortieSetCheck(selectedMap,id,c.dataset.hdSortieCheck,c.checked)}});
document.addEventListener('click',e=>{
 const action=e.target.closest?.('[data-hd-sortie-action]');if(action){hdSortieOpenAction(action.dataset.hdSortieAction);return}
 if(e.target.closest?.('[data-hd-sortie-refresh]')){hdRenderSortieReadiness();return}
 if(e.target.closest?.('[data-hd-sortie-gear]')){hdSortieOpenTab('gear');return}
 if(e.target.closest?.('[data-hd-sortie-reset]')&&typeof selectedMap!=='undefined'&&selectedMap){const id=hdSortieSelection(selectedMap);if(id)hdSortieReset(selectedMap,id);return}
 if(e.target.closest?.('[data-map-tab="mine"]'))setTimeout(hdRenderSortieReadiness,0);
});
if(typeof hdApplyMapTabs==='function'){
 const hdSortiePrevApply=hdApplyMapTabs;
 hdApplyMapTabs=function(){hdSortiePrevApply();setTimeout(hdRenderSortieReadiness,0)};
}
window.addEventListener('load',()=>setTimeout(hdRenderSortieReadiness,260));
