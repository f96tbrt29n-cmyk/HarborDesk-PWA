const HD_FC_KEY='harbordesk-fleet-calculator-v1';
const HD_FC_SELECT_KEY='harbordesk-fleet-calculator-selection-v1';

const HD_FC_AIR_CATEGORIES=new Set(['艦上戦闘機','艦上攻撃機','艦上爆撃機','水上戦闘機','水上爆撃機','噴式戦闘爆撃機']);

function hdFCEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFCLoadAll(){try{return JSON.parse(localStorage.getItem(HD_FC_KEY)||'{}')||{}}catch{return {}}}
function hdFCSaveAll(v){localStorage.setItem(HD_FC_KEY,JSON.stringify(v))}
function hdFCSyncedHq(){try{const level=Number(JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'{}').admiralLevel);return level>0?level:null}catch{return null}}
function hdFCFleets(map){
 let saved=[];try{saved=typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]}catch{}
 const proposals=Object.values(hdFCLoadAll()).filter(s=>s?.proposal?.map===map).map(s=>({id:s.proposal.id,name:'手持ち配備案：'+s.proposal.name,ships:(s.ships||[]).map(x=>({ship:x.name})),proposal:true}));
 return [...saved,...proposals];
}
function hdFCProposalRoster(ship){
 let rows=[];try{rows=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')}catch{}
 if(!Array.isArray(rows))return null;
 if(Number(ship.gameShipId)>0)return rows.find(r=>Number(r.gameShipId)===Number(ship.gameShipId))||null;
 const matches=rows.filter(r=>Number(ship.masterId)>0?Number(r.masterId)===Number(ship.masterId):r.name===ship.ship);
 return matches.length===1?matches[0]:null;
}
function hdFCProposalShipLos(ship){
 const row=hdFCProposalRoster(ship);if(!row||!(Number(row.gameLos)>0))return null;
 const labels=Array.isArray(row.gameGearSlots)&&row.gameGearSlots.length?[...row.gameGearSlots,row.gameGearExpansion||'']:String(row.gear||'').split(/\s+\/\s+/);
 let equipment=0;
 for(const label of labels){if(!label)continue;const item=hdFCFind(String(label).replace(/^\[増設\]\s*/,'').replace(/\s+★\d+$/,'').trim());if(!item)return null;equipment+=Number(item.stats?.索敵)||0}
 const los=Number(row.gameLos)-equipment;return los>=0?los:null;
}
function hdFCImportOwnedPlan(c,result){
 if(!c?.fleet||!result?.plan||result.signature!==hdOCSignature(c))return false;
 const id=`owned:${c.fleet.id}:${c.index}`,old=hdFCLoadAll()[hdFCMapKey(c.map,id)]||{},hq=hdFCSyncedHq(),ships=(result.plan.ships||[]).filter(x=>x.ship),gear=[];
 for(const ship of ships){
  for(const item of ship.items||[]){if(!item.name)continue;const meta=hdFCFind(item.name),air=HD_FC_AIR_CATEGORIES.has(meta?.category),capacity=item.capacity;
   gear.push({name:item.name,star:Number(item.star)||0,slot:capacity==null?(air?null:0):Number(capacity),maxProf:false,ship:ship.ship,slotIndex:item.slotIndex});
  }
  if(ship.expansion?.name)gear.push({name:ship.expansion.name,star:Number(ship.expansion.star)||0,slot:0,maxProf:false,ship:ship.ship,slotIndex:null});
 }
 const state={...hdFCDefaultState(c.map,c.fleet.id),enemyAir:Number(old.enemyAir)||0,hqLevel:hq??old.hqLevel??120,shipCount:ships.length,ships:ships.map(ship=>({name:ship.ship,gameShipId:Number(ship.gameShipId)||0,masterId:Number(ship.masterId)||0,los:hdFCProposalShipLos(ship)})),gear,proposal:{id,map:c.map,fleetId:c.fleet.id,route:c.index,name:c.fleet.name||'保存編成',at:Date.now(),signature:result.signature,hqMissing:hq==null,edited:false}};
 hdFCSaveState(c.map,id,state);hdFCSetSelection(c.map,id);return true;
}
function hdFCProposalIssues(s){
 if(!s.proposal)return [];
 return [...(s.proposal.hqMissing?['司令部Lvの同期']:[]),...(s.ships||[]).filter(x=>x.los==null).map(x=>x.name+'の素索敵'),...(s.gear||[]).filter(x=>!hdFCFind(x.name)||x.slot==null).map(x=>x.ship+'・'+x.name+'の性能／搭載数')];
}
function hdFCProposalHtml(s){
 if(!s.proposal)return '';
 const issues=hdFCProposalIssues(s),p=s.proposal,c=typeof hdOCContext==='function'?hdOCContext(p.map,p.fleetId,p.route):null,stale=c&&(!c.fleet||hdOCSignature(c)!==p.signature);
 return `<div class="hd-fc-mapnote" data-hd-fc-proposal><b>手持ちで探索した配備案${p.edited?'（手動調整あり）':''}</b><p>${hdFCEsc(p.name)} / ${hdFCEsc(new Date(p.at).toLocaleString('ja-JP'))}。${stale?'台帳・編成・海域条件が変わっています。最新の条件で再探索してね。':'提案された艦娘・装備・★・スロット位置を反映済み。'}</p>${issues.length?`<p>未判定：${hdFCEsc(issues.join('、'))}。同期または不足欄の入力が必要です。</p>`:''}<small>搭載数は配備案の満載値。熟練度は配備する装備個体が未指定のため加算なしで開始。素索敵は現在装備の基本索敵を差し引いた同期値で、配備変更に伴う艦固有ボーナスの差分は手動補正してね。</small></div>`;
}
function hdFCSelection(map){const fleets=hdFCFleets(map);let s={};try{s=JSON.parse(localStorage.getItem(HD_FC_SELECT_KEY)||'{}')||{}}catch{}return s[map]==='manual'?'manual':fleets.find(x=>x.id===s[map])?.id||fleets[0]?.id||'manual'}
function hdFCSetSelection(map,id){let s={};try{s=JSON.parse(localStorage.getItem(HD_FC_SELECT_KEY)||'{}')||{}}catch{}s[map]=id;localStorage.setItem(HD_FC_SELECT_KEY,JSON.stringify(s));hdFCScheduleRender()}
function hdFCMapKey(map,fleetId){return `${map}:${fleetId||'manual'}`}
function hdFCDefaultState(map,fleetId){const fleet=hdFCFleets(map).find(x=>x.id===fleetId);const ships=(fleet?.ships||[]).filter(x=>String(x.ship||'').trim());const coef=Number((typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]?.los?.coef:null))||1;return {hqLevel:hdFCSyncedHq()||120,branchCoef:coef,enemyAir:0,shipCount:ships.length||6,ships:Array.from({length:Math.max(6,ships.length)},(_,i)=>({name:ships[i]?.ship||'',los:0})),gear:[{name:'',slot:0,star:0,maxProf:false}]}}
function hdFCState(map,fleetId){const all=hdFCLoadAll(),key=hdFCMapKey(map,fleetId);if(!all[key]){all[key]=hdFCDefaultState(map,fleetId);hdFCSaveAll(all)}return all[key]}
function hdFCSaveState(map,fleetId,state){const all=hdFCLoadAll();all[hdFCMapKey(map,fleetId)]=state;hdFCSaveAll(all)}
function hdFCCatalog(){return typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]}
function hdFCFind(name){return hdFCCatalog().find(x=>x.name===name)||null}
function hdFCEquipOptions(selected=''){const rows=hdFCCatalog().filter(x=>HD_FC_AIR_CATEGORIES.has(x.category)||Number(x.stats?.索敵)>0);const groups=new Map();for(const x of rows){const cat=x.category||'その他';if(!groups.has(cat))groups.set(cat,[]);groups.get(cat).push(x)}return `<option value="">未設定</option>`+(selected&&!rows.some(x=>x.name===selected)?`<option value="${hdFCEsc(selected)}" selected>${hdFCEsc(selected)}${hdFCFind(selected)?'':'（未登録）'}</option>`:'')+[...groups].map(([cat,items])=>`<optgroup label="${hdFCEsc(cat)}">${items.sort((a,b)=>a.name.localeCompare(b.name,'ja')).map(x=>`<option value="${hdFCEsc(x.name)}" ${x.name===selected?'selected':''}>${hdFCEsc(x.name)}</option>`).join('')}</optgroup>`).join('')}
function hdFCAirImproveCoef(item){if(!item)return 0;if(['艦上戦闘機','水上戦闘機'].includes(item.category))return .2;if(item.category==='艦上爆撃機'&&(item.tags||[]).some(t=>String(t).includes('制空')||String(t).includes('爆戦')))return .25;return 0}
function hdFCAirProfBonus(item,maxProf){if(!item||!maxProf)return 0;if(['艦上戦闘機','水上戦闘機'].includes(item.category))return 25;if(item.category==='水上爆撃機')return 9;if(['艦上攻撃機','艦上爆撃機','噴式戦闘爆撃機'].includes(item.category))return 3;return 0}
function hdFCAirSlotPower(row){const item=hdFCFind(row.name),slot=Math.max(0,Number(row.slot)||0);if(!item||!slot||!HD_FC_AIR_CATEGORIES.has(item.category))return 0;const aa=Number(item.stats?.対空)||0,eff=aa+hdFCAirImproveCoef(item)*(Math.max(0,Math.min(10,Number(row.star)||0))),prof=hdFCAirProfBonus(item,row.maxProf);return Math.floor(eff*Math.sqrt(slot)+prof)}
function hdFCAirPower(state){return (state.gear||[]).reduce((a,r)=>a+hdFCAirSlotPower(r),0)}
function hdFCAirStatus(ours,enemy){enemy=Math.max(0,Number(enemy)||0);if(enemy===0)return {label:'敵制空0',detail:'航空戦が発生する場合は制空権確保扱い',cls:'secure'};const ratio=ours/enemy;if(ratio>=3)return {label:'制空権確保',detail:`確保目安 ${Math.ceil(enemy*3)}`,cls:'secure'};if(ratio>=1.5)return {label:'航空優勢',detail:`優勢 ${Math.ceil(enemy*1.5)} / 確保 ${Math.ceil(enemy*3)}`,cls:'superior'};if(ratio>2/3)return {label:'航空均衡',detail:`優勢まで ${Math.ceil(enemy*1.5)}`,cls:'parity'};if(ratio>1/3)return {label:'航空劣勢',detail:`均衡目安 ${Math.floor(enemy*2/3)+1}`,cls:'disadvantage'};return {label:'制空権喪失',detail:`劣勢目安 ${Math.floor(enemy/3)+1}`,cls:'lost'}}
function hdFCAirLossHtml(state,enemy,target,map=typeof selectedMap==='undefined'?'':selectedMap){
 if(typeof hdMapAirLossBounds!=='function')return '';
 const rows=(state.gear||[]).map(r=>({...r,category:hdFCFind(r.name)?.category})),valid=rows.every(r=>!r.name||hdFCFind(r.name)&&r.slot!=null&&Number.isInteger(Number(r.slot))&&Number(r.slot)>=0&&Number(r.slot)<=99&&Number.isInteger(Number(r.star??0))&&Number(r.star??0)>=0&&Number(r.star??0)<=10),unknown=target?.selected&&!target.known,noAir=target?.known&&!target.hasAir,loss=valid&&!unknown&&!noAir?hdMapAirLossBounds(rows.map(r=>({...r,slot:Number(r.slot)})),Number(enemy),hdFCAirSlotPower):null,required=target?.known?hdMapAirThreshold(target.enemy,target.goal):null;
 const route=target?.selected?hdMapAirRouteHtml(map,valid?hdMapAirRouteLoss(map,rows.map(r=>({...r,slot:Number(r.slot)})),hdFCAirSlotPower):{known:false,reason:'機体・機数・★が未確定。入力を確認してね'}):'';
 return `<div class="hd-fc-mapnote" data-hd-fc-air-loss><b>本隊の制空戦1回の損耗範囲</b><p>${noAir?'選択マスには通常の航空戦がありません。':!loss?'機体・機数・★・選択マスを確認してね。':!loss.active?'計算する航空機が未設定です。':`${loss.label}で ${loss.minLost}〜${loss.maxLost}機減少 / 迎撃後制空 ${loss.lower}〜${loss.upper}${required===null?'':` / ${HD_MAP_AIR_GOALS[target.goal]} ${required}（厳しい側ではあと ${Math.max(0,required-loss.lower)}不足）`}`}</p><small>制空状態による割合撃墜の範囲だけを計算。手入力の機体・★・最大熟練を使用。対空砲火・噴式強襲・熟練度低下・敵機削り・複数マスの累積は含まず、全滅確率やボス到達時の保証ではありません。</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/航空戦" target="_blank" rel="noopener">迎撃割合の仕様 ↗</a></div>${route}`;
}
function hdFCEquipCoef(item){if(!item)return 0;const c=item.category||'';if(c==='艦上攻撃機')return .8;if(c==='艦上偵察機')return 1;if(c==='水上偵察機')return 1.2;if(c==='水上爆撃機')return 1.1;return Number(item.stats?.索敵)>0?.6:0}
function hdFCImproveCoef(item){if(!item)return 0;const c=item.category||'';if(c==='大型飛行艇'||c==='水上偵察機'||c==='艦上偵察機')return 1.2;if(c==='水上爆撃機')return 1.15;if(c==='対潜哨戒機')return 1;if(/小型.*電探|小型水上電探|小型対空電探/.test(c))return 1.25;if(/大型.*電探|大型水上電探|大型対空電探/.test(c))return 1.4;return 0}
function hdFCLOS(state){const shipCount=Math.max(1,Math.min(7,Number(state.shipCount)||6)),sl=(state.ships||[]).slice(0,shipCount).reduce((a,s)=>a+Math.sqrt(Math.max(0,Number(s.los)||0)),0),coef=Math.max(1,Number(state.branchCoef)||1);let equipRaw=0;for(const r of state.gear||[]){const item=hdFCFind(r.name);if(!item)continue;const los=Number(item.stats?.索敵)||0,star=Math.max(0,Math.min(10,Number(r.star)||0)),val=(los+hdFCImproveCoef(item)*Math.sqrt(star))*hdFCEquipCoef(item);equipRaw+=val}const el=equipRaw*coef,hq=Math.ceil(Math.max(1,Number(state.hqLevel)||1)*.4),cq=2*(6-shipCount),score=sl+el-hq+cq;return {score,shipLos:sl,equipRaw,equip:el,hq,cq,coef,shipCount}}
function hdFCMapEnemyAirCandidates(map){const data=typeof hdMapAirData==='function'?hdMapAirData(map):null;if(data)return [...new Set(Object.values(data.nodes).flatMap(n=>n.patterns.map(p=>p.air)).filter(Number.isInteger))].sort((a,b)=>a-b);const vals=new Set();const addText=t=>{for(const m of String(t||'').matchAll(/敵制空(?:値)?\s*(\d+)(?:\s*[〜～~–-]\s*(\d+))?/g)){vals.add(Number(m[1]));if(m[2])vals.add(Number(m[2]))}};try{const nodes=typeof HD_NODE_PATTERN_DATA!=='undefined'?HD_NODE_PATTERN_DATA[map]||{}:{};Object.values(nodes).forEach(n=>(n.patterns||[]).forEach(p=>addText(p.air)))}catch{}try{const ov=typeof HD_NODE_DETAIL_OVERRIDES!=='undefined'?HD_NODE_DETAIL_OVERRIDES[map]||{}:{};Object.values(ov).forEach(n=>{addText(n.air);(n.patterns||[]).forEach(p=>addText(p.air))})}catch{}return [...vals].sort((a,b)=>a-b)}
let hdFCRenderTimer=0;
function hdFCScheduleRender(){clearTimeout(hdFCRenderTimer);hdFCRenderTimer=setTimeout(()=>{hdFCRenderTimer=0;hdFCRender()},0)}
function hdFCMutate(map,fleetId,fn){const s=hdFCState(map,fleetId);fn(s);if(s.proposal)s.proposal.edited=true;hdFCSaveState(map,fleetId,s);hdFCScheduleRender()}
function hdFCAddGear(map,fleetId){hdFCMutate(map,fleetId,s=>{s.gear=s.gear||[];s.gear.push({name:'',slot:0,star:0,maxProf:false})})}
function hdFCRemoveGear(map,fleetId,i){hdFCMutate(map,fleetId,s=>{s.gear=(s.gear||[]).filter((_,idx)=>idx!==i);if(!s.gear.length)s.gear=[{name:'',slot:0,star:0,maxProf:false}]})}
function hdFCReset(map,fleetId){const all=hdFCLoadAll(),key=hdFCMapKey(map,fleetId);if(all[key]?.proposal){delete all[key];hdFCSaveAll(all);hdFCSetSelection(map,'manual');return}all[key]=hdFCDefaultState(map,fleetId);hdFCSaveAll(all);hdFCScheduleRender()}
function hdFCSyncFleet(map,fleetId){const fleet=hdFCFleets(map).find(x=>x.id===fleetId);if(!fleet)return;hdFCMutate(map,fleetId,s=>{const ships=(fleet.ships||[]).filter(x=>String(x.ship||'').trim());s.shipCount=ships.length||6;s.ships=Array.from({length:Math.max(6,ships.length)},(_,i)=>({name:ships[i]?.ship||'',los:Number(s.ships?.[i]?.los)||0}))})}
function hdFCMapNote(map){const los=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]?.los:null;return los?.summary||'この海域の索敵閾値はアプリ内で数値登録されていないため、攻略情報と併用してね。'}
function hdFCHtml(map){const fleets=hdFCFleets(map),fleetId=hdFCSelection(map),s=hdFCState(map,fleetId),issues=hdFCProposalIssues(s),airIncomplete=!!s.proposal&&(s.gear||[]).some(r=>!hdFCFind(r.name)||HD_FC_AIR_CATEGORIES.has(hdFCFind(r.name)?.category)&&r.slot==null),losIncomplete=issues.length>0,air=hdFCAirPower(s),target=typeof hdMapAirTarget==='function'?hdMapAirTarget(map):null,enemy=target?.known?target.enemy:s.enemyAir,airStatus=target?.selected&&!target.known?{label:'未判定',detail:target.detail,cls:'lost'}:target?.known&&!target.hasAir?{label:'航空戦なし',detail:'夜戦・対潜戦の機数は引き継ぎ',cls:'secure'}:hdFCAirStatus(air,enemy),los=hdFCLOS(s),candidates=hdFCMapEnemyAirCandidates(map);return `<section id="hdFleetCalculator" class="hd-fc"><div class="hd-fc-head"><div><div class="eyebrow">FLEET CALCULATOR</div><h4>艦隊制空・索敵プランナー</h4></div><span>${hdFCEsc(map)}</span></div><p class="muted">艦載機の制空値と33式索敵スコアを同時計算。素索敵は装備を外した値＋艦固有の装備ボーナス分を入力してね。</p><div class="hd-fc-top"><label>保存編成<select id="hdFCFleetSelect"><option value="manual" ${fleetId==='manual'?'selected':''}>手動</option>${fleets.map(f=>`<option value="${hdFCEsc(f.id)}" ${fleetId===f.id?'selected':''}>${hdFCEsc(f.name)}</option>`).join('')}</select></label><label>司令部Lv<input type="number" min="1" max="120" value="${Number(s.hqLevel)||120}" data-hd-fc-hq></label><label>分岐点係数<input type="number" min="1" max="10" step="1" value="${Number(s.branchCoef)||1}" data-hd-fc-coef></label><label>分岐到達時の隻数<input type="number" min="1" max="7" value="${Number(s.shipCount)||6}" data-hd-fc-count></label></div>${hdFCProposalHtml(s)}${fleetId!=='manual'&&!s.proposal?'<button type="button" class="ghost small" data-hd-fc-sync>保存編成の艦名を再読込</button>':''}<div class="hd-fc-grid"><article><div class="hd-fc-sub"><strong>艦娘の素索敵</strong><span>Σ√素索敵</span></div><div class="hd-fc-ships">${(s.ships||[]).slice(0,Math.max(6,Number(s.shipCount)||6)).map((x,i)=>`<label><span>${i+1}. ${hdFCEsc(x.name||'艦娘')}</span><input type="number" min="0" max="200" step="1" value="${x.los==null?'':Number(x.los)||0}" data-hd-fc-ship-los="${i}"></label>`).join('')}</div></article><article><div class="hd-fc-sub"><strong>装備</strong><button type="button" class="ghost small" data-hd-fc-add>＋装備</button></div><div class="hd-fc-gear">${(s.gear||[]).map((r,i)=>{const item=hdFCFind(r.name);return `<div class="hd-fc-gear-row"><select data-hd-fc-gear="${i}">${hdFCEquipOptions(r.name)}</select><label>搭載<input type="number" min="0" max="99" value="${r.slot==null?'':Number(r.slot)||0}" data-hd-fc-slot="${i}"></label><label>★<input type="number" min="0" max="10" value="${Number(r.star)||0}" data-hd-fc-star="${i}"></label><label class="hd-fc-prof"><input type="checkbox" data-hd-fc-prof="${i}" ${r.maxProf?'checked':''}> &gt;&gt;</label><button type="button" class="ghost small" data-hd-fc-remove="${i}">×</button>${r.ship?`<small>${hdFCEsc(r.ship)} / ${r.slotIndex==null?'増設':'第'+(r.slotIndex+1)+'スロット'}</small>`:''}${item?`<small>${hdFCEsc(item.category)} / 対空${Number(item.stats?.対空)||0} / 索敵${Number(item.stats?.索敵)||0}</small>`:''}</div>`}).join('')}</div></article></div><div class="hd-fc-results"><div><span>艦隊制空値</span><strong>${airIncomplete?'未判定':air}</strong><small>各スロット切り捨て合計</small></div><div class="${airStatus.cls}"><span>制空状態</span><strong>${airIncomplete?'未判定':hdFCEsc(airStatus.label)}</strong><small>${hdFCEsc(airStatus.detail)}</small></div><div><span>33式索敵</span><strong>${losIncomplete?'未判定':los.score.toFixed(2)}</strong><small>係数 ${los.coef}</small></div></div>${typeof hdMapAirPanelHtml==='function'?hdMapAirPanelHtml(map):''}${hdFCAirLossHtml(s,enemy,target,map)}<div class="hd-fc-enemy"><label>この計算だけの仮の敵制空値<input type="number" min="0" max="9999" value="${Number(s.enemyAir)||0}" ${target?.known?'disabled':''} data-hd-fc-enemy></label>${candidates.length?`<div class="hd-fc-chips"><span>海域データ候補</span>${candidates.map(v=>`<button type="button" class="ghost small" data-hd-fc-enemy-chip="${v}" ${target?.known?'disabled':''}>${v}</button>`).join('')}</div>`:''}</div><details class="hd-fc-breakdown"><summary>索敵計算の内訳</summary><div>艦娘: ${los.shipLos.toFixed(3)}</div><div>装備係数前: ${los.equipRaw.toFixed(3)}</div><div>装備×分岐点係数: ${los.equip.toFixed(3)}</div><div>司令部補正: −${los.hq}</div><div>隻数補正: ${los.cq>=0?'+':''}${los.cq}</div></details><div class="hd-fc-mapnote"><b>この海域の索敵メモ</b><span>${hdFCEsc(hdFCMapNote(map))}</span></div><div class="hd-fc-actions"><button type="button" class="ghost small" data-hd-fc-reset>この編成の計算をリセット</button><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E3%83%AB%E3%83%BC%E3%83%88%E5%88%86%E5%B2%90" target="_blank" rel="noopener">33式の仕様 ↗</a></div><p class="muted hd-fc-foot">※熟練度は「>>」の最大熟練を簡易反映。艦固有の装備ボーナスは装備側では自動判定しないため、その分は艦娘の素索敵入力へ足してね。</p></section>`}
function hdFCGearPane(){
 const fallback=document.getElementById('hdFallbackGearTools'),normal=document.querySelector('.map-tabs-shell [data-map-pane="gear"]');
 if(fallback&&!fallback.hidden&&fallback.classList.contains('active'))return fallback;
 return normal||fallback;
}
function hdFCBindSelect(pane){
 const sel=pane?.querySelector('#hdFCFleetSelect');
 if(sel)sel.addEventListener('change',e=>hdFCSetSelection(selectedMap,e.target.value));
}
function hdFCReplaceSection(pane,selector,html){
 if(!pane||!html)return null;
 const template=document.createElement('template');template.innerHTML=String(html).trim();
 const next=template.content.firstElementChild;if(!next)return null;
 let old=pane.querySelector(selector);
 const focused=document.activeElement;
 if(old&&focused&&old.contains(focused)&&typeof focused.blur==='function'){
  try{focused.blur()}catch{}
  old=pane.querySelector(selector);
 }
 if(old&&old.parentNode){try{old.parentNode.replaceChild(next,old)}catch{old=pane.querySelector(selector);if(old?.parentNode)old.parentNode.replaceChild(next,old);else pane.appendChild(next)}}else pane.appendChild(next);
 return next;
}
function hdFCRender(){
 if(typeof selectedMap==='undefined'||!selectedMap)return;
 const pane=hdFCGearPane();if(!pane)return;
 hdFCReplaceSection(pane,'#hdFleetCalculator',hdFCHtml(selectedMap));
 hdFCBindSelect(pane);
}
function hdFCHydrateFallbackExtras(host,map){
 if(!host||!map)return false;
 let rec=host.querySelector('#hdMapEquipRecommend');
 if(!rec){rec=document.createElement('div');rec.id='hdMapEquipRecommend';host.prepend(rec)}
 if(!rec.querySelector('.hd-map-equip-recommend')&&typeof window.hdRenderMapEquipmentRecommendationsInto==='function'){
  window.hdRenderMapEquipmentRecommendationsInto(rec,map);
 }else if(!rec.querySelector('.hd-map-equip-recommend')&&typeof window.hdMapEquipRecommendationsHtml==='function'){
  try{rec.innerHTML=window.hdMapEquipRecommendationsHtml(map)}catch{}
 }else if(!rec.querySelector('.hd-map-equip-recommend')&&typeof window.hdRenderMapEquipmentRecommendations==='function'){
  window.hdRenderMapEquipmentRecommendations();
 }
 if(!host.querySelector('#hdLandBasePlanner')&&typeof window.hdLBHtml==='function'){
  const html=window.hdLBHtml(map);if(html)host.insertAdjacentHTML('beforeend',html);
 }else if(!host.querySelector('#hdLandBasePlanner')&&typeof window.hdRenderLandBasePlanner==='function')window.hdRenderLandBasePlanner();
 return true;
}
function hdFCRenderFallbackHost(host,map){
 if(!host||!map)return false;
 const d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]:null;
 host.innerHTML=`<div class="map-tab-card"><b>制空・装備</b><p>${hdFCEsc(d?.air||'装備情報を整理中')}</p></div><div id="hdMapEquipRecommend"></div>`;
 host.insertAdjacentHTML('beforeend',hdFCHtml(map));
 hdFCBindSelect(host);
 hdFCHydrateFallbackExtras(host,map);
 return true;
}
function hdFCOpenFallback(){
 if(typeof selectedMap==='undefined'||!selectedMap)return false;
 const map=selectedMap,card=document.getElementById('selectedMapCard');if(!card)return false;
 let host=document.getElementById('hdFallbackGearTools');
 if(!host){host=document.createElement('div');host.id='hdFallbackGearTools';card.appendChild(host)}
 host.className='hd-fc-fallback map-tab-pane active';
 host.dataset.mapPane='gear';host.dataset.hdCoreFallbackPane='1';
 hdFCRenderFallbackHost(host,map);
 const activated=typeof window.hdCoreActivateFallbackPane==='function'
  ?!!window.hdCoreActivateFallbackPane(host)
  :(typeof window.hdWSShowElement==='function'?!!window.hdWSShowElement(host,true):(host.scrollIntoView({behavior:'smooth',block:'start'}),true));
 setTimeout(()=>{
  if(typeof selectedMap==='undefined'||selectedMap!==map)return;
  const current=document.getElementById('hdFallbackGearTools');
  const normal=document.querySelector('.map-tabs-shell [data-map-tab="gear"]');
  if(normal)return;
  if(!current)hdFCOpenFallback();
  else if(!current.querySelector('#hdFleetCalculator')||!current.querySelector('#hdMapEquipRecommend .hd-map-equip-recommend'))hdFCRenderFallbackHost(current,map);
 },120);
 return activated||true;
}
window.hdFCOpenFallback=hdFCOpenFallback;

document.addEventListener('change',e=>{if(typeof selectedMap==='undefined'||!selectedMap)return;const fleetId=hdFCSelection(selectedMap);if(e.target.matches('[data-hd-fc-hq]'))return hdFCMutate(selectedMap,fleetId,s=>{s.hqLevel=Math.max(1,Number(e.target.value)||1);if(s.proposal)s.proposal.hqMissing=false});if(e.target.matches('[data-hd-fc-coef]'))return hdFCMutate(selectedMap,fleetId,s=>s.branchCoef=Math.max(1,Number(e.target.value)||1));if(e.target.matches('[data-hd-fc-count]'))return hdFCMutate(selectedMap,fleetId,s=>s.shipCount=Math.max(1,Math.min(7,Number(e.target.value)||6)));if(e.target.matches('[data-hd-fc-enemy]'))return hdFCMutate(selectedMap,fleetId,s=>s.enemyAir=Math.max(0,Number(e.target.value)||0));let i;if(e.target.matches('[data-hd-fc-ship-los]')){i=Number(e.target.dataset.hdFcShipLos);return hdFCMutate(selectedMap,fleetId,s=>{s.ships[i]=s.ships[i]||{name:'',los:0};s.ships[i].los=Math.max(0,Number(e.target.value)||0)})}if(e.target.matches('[data-hd-fc-gear]')){i=Number(e.target.dataset.hdFcGear);return hdFCMutate(selectedMap,fleetId,s=>{s.gear[i].name=e.target.value})}if(e.target.matches('[data-hd-fc-slot]')){i=Number(e.target.dataset.hdFcSlot);return hdFCMutate(selectedMap,fleetId,s=>{s.gear[i].slot=Math.max(0,Number(e.target.value)||0)})}if(e.target.matches('[data-hd-fc-star]')){i=Number(e.target.dataset.hdFcStar);return hdFCMutate(selectedMap,fleetId,s=>{s.gear[i].star=Math.max(0,Math.min(10,Number(e.target.value)||0))})}if(e.target.matches('[data-hd-fc-prof]')){i=Number(e.target.dataset.hdFcProf);return hdFCMutate(selectedMap,fleetId,s=>{s.gear[i].maxProf=e.target.checked})}});
document.addEventListener('click',e=>{if(typeof selectedMap==='undefined'||!selectedMap)return;const fleetId=hdFCSelection(selectedMap);if(e.target.closest?.('[data-hd-fc-add]'))return hdFCAddGear(selectedMap,fleetId);const rem=e.target.closest?.('[data-hd-fc-remove]');if(rem)return hdFCRemoveGear(selectedMap,fleetId,Number(rem.dataset.hdFcRemove));const chip=e.target.closest?.('[data-hd-fc-enemy-chip]');if(chip)return hdFCMutate(selectedMap,fleetId,s=>s.enemyAir=Number(chip.dataset.hdFcEnemyChip)||0);if(e.target.closest?.('[data-hd-fc-sync]'))return hdFCSyncFleet(selectedMap,fleetId);if(e.target.closest?.('[data-hd-fc-reset]')){if(confirm('この編成の制空・索敵入力をリセットする？'))hdFCReset(selectedMap,fleetId);return}if(e.target.closest?.('[data-map-tab="gear"]'))setTimeout(hdFCRender,0)});
if(typeof hdApplyMapTabs==='function'){const hdFCPrevApply=hdApplyMapTabs;hdApplyMapTabs=function(){hdFCPrevApply();setTimeout(hdFCRender,0)}}
window.addEventListener('load',()=>setTimeout(hdFCRender,420));
window.addEventListener('hd:map-rendered',e=>{const d=e?.detail||{};if(d.mode==='empty'||!d.map)return;hdFCScheduleRender()});
window.addEventListener('hd:modules-ready',()=>{const host=document.getElementById('hdFallbackGearTools');if(host&&!host.hidden&&host.classList.contains('active')&&typeof selectedMap!=='undefined'&&selectedMap)hdFCHydrateFallbackExtras(host,selectedMap)});
window.addEventListener('hd:map-air-changed',hdFCScheduleRender);
function hdFCRefreshSyncedHq(){
 const hq=hdFCSyncedHq();if(hq==null)return;
 const all=hdFCLoadAll();let changed=false;
 for(const s of Object.values(all)){
  if(!s||typeof s!=='object')continue;
  if(s.hqLevel!==hq){s.hqLevel=hq;changed=true}
  if(s.proposal){if(s.proposal.hqMissing){s.proposal.hqMissing=false;changed=true}if(!s.proposal.edited)for(const ship of s.ships||[]){const los=hdFCProposalShipLos({...ship,ship:ship.name});if(ship.los!==los){ship.los=los;changed=true}}}
 }
 if(changed){hdFCSaveAll(all);hdFCScheduleRender()}
}
window.addEventListener('hd:kancolle-sync',hdFCRefreshSyncedHq);
window.addEventListener('storage',e=>{if(e.key==='harbordesk-kancolle-sync-v1')hdFCRefreshSyncedHq()});
window.hdFCHtml=hdFCHtml;
window.hdFCRender=hdFCRender;
