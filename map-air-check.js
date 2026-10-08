// Map-wide enemy data are not a route guarantee. User selection is shared by
// equipment search/readiness; manual calculator aircraft stay calculator-only.
const HD_MAP_AIR_KEY='harbordesk-map-air-check-v1';
const HD_MAP_AIR_GOALS={disadvantage:'劣勢以上',parity:'均衡以上',superiority:'優勢以上',supremacy:'確保'};
function hdMapAirData(map){return typeof HD_MAP_AIR_DATA!=='undefined'?HD_MAP_AIR_DATA[map]||null:null}
function hdMapAirSelection(map){try{const s=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')?.[map];return s&&typeof s==='object'?s:null}catch{return null}}
function hdMapAirThreshold(enemy,goal){if(enemy===0)return 0;if(goal==='supremacy')return enemy*3;if(goal==='superiority')return Math.ceil(enemy*1.5);if(goal==='parity')return Math.floor(enemy*2/3)+1;return Math.floor(enemy/3)+1}
function hdMapAirNodeProfile(map,id){
 const node=hdMapAirData(map)?.nodes?.[id];if(!node)return {known:false,rounds:null,kind:'未登録',min:null,max:null};
 const label=node.label||'',patterns=node.patterns||[],subOnly=patterns.length>0&&patterns.every(p=>String(p.enemy||'').split(/[、,]/).every(ship=>/^(潜水|潜母)/.test(ship.trim()))),special=/払暁|夜戦.*昼戦|対潜空襲/.test(label),skip=!special&&(/夜戦|対潜戦/.test(label)||subOnly),rounds=special?null:skip?0:/空襲戦/.test(label)?1:/航空戦/.test(label)?2:1,kind=special?'特殊戦闘':/夜戦/.test(label)?'夜戦':skip?'対潜戦':rounds===2?'航空戦2回':/空襲戦/.test(label)?'空襲戦':'通常戦',values=patterns.map(p=>p.air),known=rounds!==null&&(skip||values.length>0&&values.every(v=>Number.isInteger(v)&&v>=0));
 return {known,rounds,kind,min:known?(skip?0:Math.min(...values)):null,max:known?(skip?0:Math.max(...values)):null};
}
function hdMapAirTarget(map){
 const data=hdMapAirData(map),s=hdMapAirSelection(map),ids=Array.isArray(s?.nodeIds)?s.nodeIds:[],nodes=ids.map(id=>data?.nodes?.[id]),invalid=new Set(ids).size!==ids.length||ids.some((id,i)=>typeof id!=='string'||!data?.nodes||!Object.hasOwn(data.nodes,id)||!nodes[i]),profiles=ids.map(id=>hdMapAirNodeProfile(map,id)),values=profiles.map(p=>p.max),goal=Object.hasOwn(HD_MAP_AIR_GOALS,s?.goal)?s.goal:'superiority',known=!!data&&ids.length>0&&!invalid&&profiles.every(p=>p.known);
 return {selected:ids.length>0,known,invalid,ids,goal,hasAir:known&&profiles.some(p=>p.rounds>0),enemy:known?Math.max(...values):null,source:data?.source||'',checkedAt:data?.checkedAt||'',detail:!data?'敵編成データ未登録':invalid?'選択マスがこの海域のデータにありません':!ids.length?'通る戦闘マスが未選択':!known?'選択マスの敵制空値に未確定データあり':`選択マス ${ids.join('・')} の全掲載編成最大（司令部Lv・ゲージ段階の差を含む）`};
}
function hdMapAirSave(map,id,checked,goal){
 let all={};try{all=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')||{}}catch{}
 if(Array.isArray(all)||typeof all!=='object')all={};const old=hdMapAirSelection(map)||{},ids=Array.isArray(old.nodeIds)?old.nodeIds.filter(x=>hdMapAirData(map)?.nodes?.[x]):[];
 if(id&&hdMapAirData(map)?.nodes?.[id]){const at=ids.indexOf(id);if(checked&&at<0)ids.push(id);if(!checked&&at>=0)ids.splice(at,1)}
 all[map]={nodeIds:ids,goal:Object.hasOwn(HD_MAP_AIR_GOALS,goal)?goal:old.goal||'superiority',orderConfirmed:!id&&old.orderConfirmed===true};return hdMapAirWrite(all,map);
}
function hdMapAirWrite(all,map){try{localStorage.setItem(HD_MAP_AIR_KEY,JSON.stringify(all))}catch{if(typeof hdToast==='function')hdToast('制空条件を保存できなかったよ。保存領域を確認してね','warn');return false}window.dispatchEvent(new CustomEvent('hd:map-air-changed',{detail:{map}}));return true}
function hdMapAirMove(map,id,direction){
 if(![-1,1].includes(direction))return false;const target=hdMapAirTarget(map),at=target.ids.indexOf(id),next=at+direction;if(target.invalid||at<0||next<0||next>=target.ids.length)return false;
 const ids=[...target.ids];[ids[at],ids[next]]=[ids[next],ids[at]];let all;try{all=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')}catch{return false}if(!all||Array.isArray(all)||typeof all!=='object')return false;all[map]={nodeIds:ids,goal:target.goal,orderConfirmed:false};return hdMapAirWrite(all,map);
}
function hdMapAirConfirmOrder(map){const target=hdMapAirTarget(map);if(!target.known)return false;let all;try{all=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')}catch{return false}if(!all||Array.isArray(all)||typeof all!=='object')return false;all[map]={nodeIds:[...target.ids],goal:target.goal,orderConfirmed:true};return hdMapAirWrite(all,map)}
function hdMapAirLabel(ours,enemy){if(enemy===0)return '確保相当';if(ours>=enemy*3)return '確保';if(ours>=enemy*1.5)return '優勢';if(ours>enemy*2/3)return '均衡';if(ours>enemy/3)return '劣勢';return '喪失'}
function hdMapAirLossBounds(rows,enemy,power){
 if(!Number.isInteger(enemy)||enemy<0)return null;
 const active=(rows||[]).filter(r=>['艦上戦闘機','水上戦闘機','艦上攻撃機','艦上爆撃機','水上爆撃機','噴式戦闘爆撃機'].includes(r.category||r.meta?.category)&&Number(r.slot)>0),ours=active.reduce((n,r)=>n+power(r),0),label=hdMapAirLabel(ours,enemy),rates={'確保相当':[3,7],'確保':[3,7],'優勢':[9,21],'均衡':[15,35],'劣勢':[21,49],'喪失':[30,70]},range=rates[label];
 let minLost=0,maxLost=0;const best=[],worst=[];
 for(const r of active){const denominator=(r.category||r.meta?.category)==='噴式戦闘爆撃機'?200:120,min=Math.floor(r.slot*range[0]/denominator),max=Math.floor(r.slot*range[1]/denominator);minLost+=min;maxLost+=max;best.push({...r,slot:r.slot-min});worst.push({...r,slot:r.slot-max})}
 return {label,minLost,maxLost,lower:worst.reduce((n,r)=>n+power(r),0),upper:best.reduce((n,r)=>n+power(r),0),active:active.length,bestRows:best,worstRows:worst};
}
// These bounds belong to the simplified stage-one + ordinary enemy AA model, not to actual sortie losses.
// Enemy air stays fixed within a two-round aviation battle; no enemy erosion.
function hdMapAirRouteLoss(map,rows,power){
 const target=hdMapAirTarget(map),unknown=reason=>({known:false,reason,steps:[]});if(!target.known)return unknown(target.detail);if(hdMapAirSelection(map)?.orderConfirmed!==true)return unknown('通る順番が未確認。マスを並べて「この順で進む」を押してね');
 if(!Array.isArray(rows))return unknown('機体・残機数が未確定');const categories=['艦上戦闘機','水上戦闘機','艦上攻撃機','艦上爆撃機','水上爆撃機','噴式戦闘爆撃機'],active=rows.filter(r=>categories.includes(r?.category||r?.meta?.category));
 if(typeof power!=='function'||active.some(r=>!Number.isInteger(Number(r.slot))||Number(r.slot)<0||Number(r.slot)>99))return unknown('機体・残機数が未確定');
 let lower=active.map((r,i)=>({...r,slot:Number(r.slot),_aaSlot:i})),upper=lower.map(r=>({...r}));if(lower.some(r=>!Number.isFinite(power(r))||power(r)<0))return unknown('機体の制空性能が未確定');
 const initialRows=lower.map(r=>({...r})),sum=rs=>rs.reduce((n,r)=>n+power(r),0),initial=sum(lower),initialSlots=lower.reduce((n,r)=>n+r.slot,0),steps=[];let stage2Complete=true,stage2MaxLost=0;
 for(const id of target.ids){const profile=hdMapAirNodeProfile(map,id),required=hdMapAirThreshold(profile.max,target.goal);
  if(profile.rounds===0){steps.push({id,round:0,kind:profile.kind,enemyMin:0,enemyMax:0,required:0,beforeLower:sum(lower),beforeUpper:sum(upper),afterLower:sum(lower),afterUpper:sum(upper),gap:0,upperGap:0,lowerLabel:'航空戦なし',upperLabel:'航空戦なし'});continue}
  for(let round=1;round<=profile.rounds;round++){
   const beforeLower=sum(lower),beforeUpper=sum(upper),lo=hdMapAirLossBounds(lower,profile.max,power),hi=hdMapAirLossBounds(upper,profile.min,power);lower=lo.worstRows;upper=hi.bestRows;
   // A slot can survive in the small-loss path after dying in the large-loss path.
   // Its later enemy AA data are still required to claim a complete model.
   const stageOneLower=sum(lower),stageOneUpper=sum(upper),antiAir=typeof hdEnemyAATarget==='function'?hdEnemyAATarget(map,id,upper):{known:false,missing:['対空砲火計算を読み込めない']},aa=antiAir.known&&typeof hdEnemyAALossBounds==='function'?hdEnemyAALossBounds(lower,antiAir,power):null;
   if(!antiAir.known||!aa){stage2Complete=false;if(antiAir.known){antiAir.known=false;antiAir.missing=['対空砲火の機数・性能が未確定']}}else{lower=aa.worstRows;stage2MaxLost+=aa.maxLost}
   steps.push({id,round,kind:profile.kind,enemyMin:profile.min,enemyMax:profile.max,required,beforeLower,beforeUpper,stageOneLower,stageOneUpper,afterLower:sum(lower),afterUpper:sum(upper),gap:Math.max(0,required-beforeLower),upperGap:Math.max(0,required-beforeUpper),lowerLabel:lo.label,upperLabel:hi.label,antiAir:{...antiAir,minLost:aa?.minLost??null,maxLost:aa?.maxLost??null,shots:aa?.shots||[]}});
  }
 }
 const relevant=steps.filter(s=>s.required>0),firstGap=steps.find(s=>s.gap>0)||null;
 const slotResults=initialRows.map(r=>({name:r.name||r.meta?.name||r.category,ship:r.ship||'',initial:r.slot,evasion:typeof hdEnemyAAEvasion==='function'&&HD_ENEMY_AA_ATTACK_CATS.has(r.category||r.meta?.category)?hdEnemyAAEvasion(r):null,min:lower.find(x=>x._aaSlot===r._aaSlot)?.slot||0,max:upper.find(x=>x._aaSlot===r._aaSlot)?.slot||0})),stage2Missing=[...new Set(steps.filter(s=>s.antiAir&&!s.antiAir.known).flatMap(s=>(s.antiAir.missing||[]).map(reason=>s.id+'：'+reason)))];
 return {known:true,steps,slotResults,stage2Complete,stage2MaxLost,stage2Missing,initial,active:active.filter(r=>r.slot>0).length,lower:sum(lower),upper:sum(upper),minLost:initialSlots-upper.reduce((n,r)=>n+r.slot,0),maxLost:initialSlots-lower.reduce((n,r)=>n+r.slot,0),maxGap:Math.max(0,...steps.map(s=>s.gap)),minimumRatio:relevant.length?Math.min(1,...relevant.map(s=>s.beforeLower/s.required)):1,firstGap};
}
function hdMapAirRouteHtml(map,result){
 const esc=typeof hdFCEsc==='function'?hdFCEsc:hdEsc;
 if(!result?.known)return `<div class="hd-fc-mapnote" data-hd-map-air-route-loss><b>通る順番での航空機損耗</b><p>${esc(result?.reason||'機体・残機数を確認してね')}</p></div>`;
 const complete=result.stage2Complete!==false;
 return `<details class="hd-fc-mapnote" data-hd-map-air-route-loss open><summary>通る順番での航空機損耗（${complete?'制空戦＋対空砲火':'部分計算・敵防空情報不足'}）</summary><p>合計 ${result.minLost}〜${result.maxLost}機減少 / 最終制空 ${result.lower}〜${result.upper}${result.firstGap?` / 最初の不足：${esc(result.firstGap.id)}・${result.firstGap.round}回目（大損耗側であと${result.firstGap.gap}）`:complete?' / このモデル内では目標値以上':' / 未計算の対空砲火があり、充足は未判定'}</p>${!complete?`<p data-hd-map-air-aa-missing>不足情報：${esc((result.stage2Missing||[]).join(' / '))}。未計算箇所の対空砲火は残機へ反映できず、表示値は部分計算の参考です。</p>`:''}<div class="hd-fc-air-route-steps">${result.steps.map(s=>`<article data-hd-map-air-route-step="${esc(s.id)}-${s.round}"><b>${esc(s.id)}・${esc(s.kind)}${s.round?` ${s.round}回目`:''}</b><span>${s.round?`敵 ${s.enemyMin}〜${s.enemyMax} / 目標 ${s.required}<br>戦闘前 ${s.beforeLower}〜${s.beforeUpper} → 戦闘後 ${s.afterLower}〜${s.afterUpper}<br>${s.gap?`大損耗側であと ${s.gap}不足${s.upperGap?'（多い側でも最大編成に不足）':''}`:complete?'モデル内では充足':'部分計算の参考値'}`:'通常の制空戦は数えず、機数を引き継ぎ'}</span>${s.antiAir?`<span data-hd-map-air-aa-step>${!s.antiAir.known?'敵対空砲火未判定：'+esc((s.antiAir.missing||[]).join(' / ')):!s.antiAir.applicable?esc(s.antiAir.reason):`制空戦後 ${s.stageOneLower}〜${s.stageOneUpper} / 対空砲火対象 ${s.antiAir.affected}スロ：0〜${s.antiAir.maxLost}機減少（加重対空最大 ${s.antiAir.maxWeighted} / 艦隊防空最大 ${s.antiAir.maxFleet}）`}</span>`:''}</article>`).join('')}</div><div data-hd-map-air-residual-slots>${(result.slotResults||[]).filter(r=>r.initial>0).map(r=>`<p>${esc([r.ship,r.name].filter(Boolean).join('・'))}：開始${r.initial} → 最終${r.min}〜${r.max}機${r.min===0?' / 0機になるモデル経路あり':''}${r.evasion?` / ${r.evasion.registered?`射撃回避：加重×${r.evasion.weightedPercent/100}・防空×${r.evasion.fleetPercent/100}`:esc(r.evasion.reason)}`:''}</p>`).join('')}</div><small>掲載敵制空の最大＋大損耗側と、最小＋小損耗側を順に計算したモデルです。通常敵艦隊の対空砲火は全掲載編成・陣形・同名候補の最大値で割合・固定撃墜がともに成功する側と、ともに失敗する側を比較。登録30機種の射撃回避補正を反映・未登録機は回避なし・敵全艦生存を仮定し、敵対空CI・敵連合艦隊・噴式強襲は未対応。順番はルート固定の保証ではありません。熟練度低下・敵機削りも未計算。航空戦2回マスも敵制空を固定しており、実際の残機や全滅確率・攻略成功を保証しません。</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/対空砲火#enemy_AAfire" target="_blank" rel="noopener">敵対空砲火の仕様 ↗</a></details>`;
}
function hdMapAirOrderHtml(map){
 const target=hdMapAirTarget(map),esc=typeof hdFCEsc==='function'?hdFCEsc:hdEsc;if(!target.selected)return '';
 return `<div data-hd-map-air-order><b>通る順番 ${hdMapAirSelection(map)?.orderConfirmed===true?'確認済み':'未確認'}</b><p>選んだ順に仮登録。実際のルート順に並べて確認してね。選択・順番の変更後は再確認が必要です。</p>${target.ids.map((id,i)=>`<div class="hd-fc-air-order-row"><span>${i+1}. ${esc(id)}・${esc(hdMapAirNodeProfile(map,id).kind)}</span><button type="button" class="ghost small" data-hd-map-air-move="${esc(id)}" data-direction="-1" data-hd-map-air-map="${esc(map)}" ${i===0?'disabled':''}>前へ</button><button type="button" class="ghost small" data-hd-map-air-move="${esc(id)}" data-direction="1" data-hd-map-air-map="${esc(map)}" ${i===target.ids.length-1?'disabled':''}>後へ</button></div>`).join('')}<button type="button" class="ghost small" data-hd-map-air-confirm data-hd-map-air-map="${esc(map)}" ${target.known?'':'disabled'}>この順で進む</button></div>`;
}
function hdMapAirNodeHtml(map,id){
 const data=hdMapAirData(map),node=data?.nodes?.[id];if(!node)return '';const esc=typeof hdEsc==='function'?hdEsc:s=>String(s),values=node.patterns.map(p=>p.air),known=values.every(v=>Number.isInteger(v)),max=known?Math.max(...values):null,profile=hdMapAirNodeProfile(map,id);
 return `<details class="hd-fc-mapnote" data-hd-map-air-node="${esc(id)}"><summary>本隊用敵制空 ${profile.rounds===0?`${esc(profile.kind)}・通常の航空戦なし`:max===null?'未確定':max===0?'0':`最大${max} / 優勢${Math.ceil(max*1.5)}`}・${node.patterns.length}編成</summary><p>全掲載司令部Lv・ゲージ段階を含む比較です。基地用制空値とは異なります。</p>${node.patterns.map(p=>`<p><b>${esc(p.name)}・敵制空 ${p.air===null?'未確定':p.air}</b><br>${esc(p.enemy)}</p>`).join('')}${typeof hdEnemyAANodeHtml==='function'?hdEnemyAANodeHtml(map,id):''}<a class="guide-link" href="${esc(data.source)}" target="_blank" rel="noopener">敵編成表（${esc(data.checkedAt)}確認） ↗</a></details>`;
}
function hdMapAirPanelHtml(map){
 const data=hdMapAirData(map),target=hdMapAirTarget(map),esc=typeof hdFCEsc==='function'?hdFCEsc:s=>String(s);if(!data)return '<p>この海域の敵編成データは未登録です。</p>';
 return `<details class="hd-fc-mapnote" data-hd-map-air-panel open><summary>本隊の攻略マス・目標制空</summary><p>通る戦闘マスを選択。登録済み全編成の最大値で比較します。マス選択はルート固定の保証ではなく、通らないマスの対策は不要です。</p><div class="hd-fc-map-air-nodes">${Object.entries(data.nodes).map(([id,node])=>{const profile=hdMapAirNodeProfile(map,id),known=profile.known,max=profile.max;return `<label><input type="checkbox" data-hd-map-air-select="${esc(id)}" data-hd-map-air-map="${esc(map)}" ${target.ids.includes(id)?'checked':''}><span>${esc(node.label.split(' ゲージ')[0])}：${profile.rounds===0?`${esc(profile.kind)}・通常の航空戦なし`:max===null?'敵制空未確定':`敵制空${max}・${esc(profile.kind)}`}</span></label>`}).join('')}</div>${hdMapAirOrderHtml(map)}<label>目標<select data-hd-map-air-goal data-hd-map-air-map="${esc(map)}">${Object.entries(HD_MAP_AIR_GOALS).map(([key,label])=>`<option value="${key}" ${target.goal===key?'selected':''}>${label}</option>`).join('')}</select></label><p>${esc(target.detail)}${target.known?` / 敵 ${target.enemy} / ${HD_MAP_AIR_GOALS[target.goal]} ${hdMapAirThreshold(target.enemy,target.goal)}`:''}</p><small>選択と目標は手持ち装備探索・出撃確認と共通。下の手入力機体・熟練度・敵制空値は、この計算画面内だけの仮定です。未選択の間は海域全体の値だけでルート充足としません。</small><a class="guide-link" href="${esc(data.source)}" target="_blank" rel="noopener">海域の敵編成表 ↗</a><details><summary>登録済み37海域の対応状況</summary><p>${Object.keys(HD_MAP_AIR_DATA).join(' / ')}。本隊のマス別制空を登録。基地航空隊は6-4・6-5・7-4だけ使用可能。索敵・分岐・発動確率などの未判定項目は別途表示します。</p></details></details>`;
}
document.addEventListener('change',e=>{const el=e.target,map=el?.dataset?.hdMapAirMap;if(el?.matches('[data-hd-map-air-select]'))hdMapAirSave(map,el.dataset.hdMapAirSelect,el.checked);else if(el?.matches('[data-hd-map-air-goal]'))hdMapAirSave(map,null,false,el.value)});
document.addEventListener('click',e=>{const move=e.target.closest?.('[data-hd-map-air-move]');if(move)return hdMapAirMove(move.dataset.hdMapAirMap,move.dataset.hdMapAirMove,Number(move.dataset.direction));const confirm=e.target.closest?.('[data-hd-map-air-confirm]');if(confirm)hdMapAirConfirmOrder(confirm.dataset.hdMapAirMap)});

window.addEventListener('storage',e=>{if(e.key===HD_MAP_AIR_KEY)window.dispatchEvent(new CustomEvent('hd:map-air-changed'))});
