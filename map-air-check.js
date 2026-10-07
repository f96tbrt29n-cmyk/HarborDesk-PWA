// Map-wide enemy data are not a route guarantee. User selection is shared by
// equipment search/readiness; manual calculator aircraft stay calculator-only.
const HD_MAP_AIR_KEY='harbordesk-map-air-check-v1';
const HD_MAP_AIR_GOALS={disadvantage:'劣勢以上',parity:'均衡以上',superiority:'優勢以上',supremacy:'確保'};
function hdMapAirData(map){return typeof HD_MAP_AIR_DATA!=='undefined'?HD_MAP_AIR_DATA[map]||null:null}
function hdMapAirSelection(map){try{const s=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')?.[map];return s&&typeof s==='object'?s:null}catch{return null}}
function hdMapAirThreshold(enemy,goal){if(enemy===0)return 0;if(goal==='supremacy')return enemy*3;if(goal==='superiority')return Math.ceil(enemy*1.5);if(goal==='parity')return Math.floor(enemy*2/3)+1;return Math.floor(enemy/3)+1}
function hdMapAirTarget(map){
 const data=hdMapAirData(map),s=hdMapAirSelection(map),ids=Array.isArray(s?.nodeIds)?s.nodeIds:[],nodes=ids.map(id=>data?.nodes?.[id]),invalid=ids.some((id,i)=>typeof id!=='string'||!data?.nodes||!Object.hasOwn(data.nodes,id)||!nodes[i]),samples=nodes.filter(Boolean).flatMap(n=>n.patterns||[]),values=samples.map(p=>p.air),goal=Object.hasOwn(HD_MAP_AIR_GOALS,s?.goal)?s.goal:'superiority',known=!!data&&ids.length>0&&!invalid&&values.length>0&&values.every(v=>Number.isInteger(v)&&v>=0);
 return {selected:ids.length>0,known,invalid,ids,goal,enemy:known?Math.max(...values):null,source:data?.source||'',checkedAt:data?.checkedAt||'',detail:!data?'敵編成データ未登録':invalid?'選択マスがこの海域のデータにありません':!ids.length?'通る戦闘マスが未選択':!known?'選択マスの敵制空値に未確定データあり':`選択マス ${ids.join('・')} の全掲載編成最大（司令部Lv・ゲージ段階の差を含む）`};
}
function hdMapAirSave(map,id,checked,goal){
 let all={};try{all=JSON.parse(localStorage.getItem(HD_MAP_AIR_KEY)||'{}')||{}}catch{}
 if(Array.isArray(all)||typeof all!=='object')all={};const old=hdMapAirSelection(map)||{},ids=Array.isArray(old.nodeIds)?old.nodeIds.filter(x=>hdMapAirData(map)?.nodes?.[x]):[];
 if(id&&hdMapAirData(map)?.nodes?.[id]){const at=ids.indexOf(id);if(checked&&at<0)ids.push(id);if(!checked&&at>=0)ids.splice(at,1)}
 all[map]={nodeIds:ids,goal:Object.hasOwn(HD_MAP_AIR_GOALS,goal)?goal:old.goal||'superiority'};localStorage.setItem(HD_MAP_AIR_KEY,JSON.stringify(all));window.dispatchEvent(new CustomEvent('hd:map-air-changed',{detail:{map}}));
}
function hdMapAirLabel(ours,enemy){if(enemy===0)return '確保相当';if(ours>=enemy*3)return '確保';if(ours>=enemy*1.5)return '優勢';if(ours>enemy*2/3)return '均衡';if(ours>enemy/3)return '劣勢';return '喪失'}
function hdMapAirLossBounds(rows,enemy,power){
 if(!Number.isInteger(enemy)||enemy<0)return null;
 const active=(rows||[]).filter(r=>['艦上戦闘機','水上戦闘機','艦上攻撃機','艦上爆撃機','水上爆撃機','噴式戦闘爆撃機'].includes(r.category||r.meta?.category)&&Number(r.slot)>0),ours=active.reduce((n,r)=>n+power(r),0),label=hdMapAirLabel(ours,enemy),rates={'確保相当':[3,7],'確保':[3,7],'優勢':[9,21],'均衡':[15,35],'劣勢':[21,49],'喪失':[30,70]},range=rates[label];
 let minLost=0,maxLost=0;const best=[],worst=[];
 for(const r of active){const denominator=(r.category||r.meta?.category)==='噴式戦闘爆撃機'?200:120,min=Math.floor(r.slot*range[0]/denominator),max=Math.floor(r.slot*range[1]/denominator);minLost+=min;maxLost+=max;best.push({...r,slot:r.slot-min});worst.push({...r,slot:r.slot-max})}
 return {label,minLost,maxLost,lower:worst.reduce((n,r)=>n+power(r),0),upper:best.reduce((n,r)=>n+power(r),0),active:active.length};
}
function hdMapAirNodeHtml(map,id){
 const data=hdMapAirData(map),node=data?.nodes?.[id];if(!node)return '';const esc=typeof hdEsc==='function'?hdEsc:s=>String(s),values=node.patterns.map(p=>p.air),known=values.every(v=>Number.isInteger(v)),max=known?Math.max(...values):null;
 return `<details class="hd-fc-mapnote" data-hd-map-air-node="${esc(id)}"><summary>本隊用敵制空 ${max===null?'未確定':max===0?'0':`最大${max} / 優勢${Math.ceil(max*1.5)}`}・${node.patterns.length}編成</summary><p>全掲載司令部Lv・ゲージ段階を含む比較です。基地用制空値とは異なります。</p>${node.patterns.map(p=>`<p><b>${esc(p.name)}・敵制空 ${p.air===null?'未確定':p.air}</b><br>${esc(p.enemy)}</p>`).join('')}<a class="guide-link" href="${esc(data.source)}" target="_blank" rel="noopener">敵編成表（${esc(data.checkedAt)}確認） ↗</a></details>`;
}
function hdMapAirPanelHtml(map){
 const data=hdMapAirData(map),target=hdMapAirTarget(map),esc=typeof hdFCEsc==='function'?hdFCEsc:s=>String(s);if(!data)return '<p>この海域の敵編成データは未登録です。</p>';
 return `<details class="hd-fc-mapnote" data-hd-map-air-panel open><summary>本隊の攻略マス・目標制空</summary><p>通る戦闘マスを選択。登録済み全編成の最大値で比較します。マス選択はルート固定の保証ではなく、通らないマスの対策は不要です。</p><div class="hd-fc-map-air-nodes">${Object.entries(data.nodes).map(([id,node])=>{const vals=node.patterns.map(p=>p.air),known=vals.every(Number.isInteger),max=known?Math.max(...vals):null;return `<label><input type="checkbox" data-hd-map-air-select="${esc(id)}" data-hd-map-air-map="${esc(map)}" ${target.ids.includes(id)?'checked':''}><span>${esc(node.label.split(' ゲージ')[0])}：${max===null?'敵制空未確定':`敵制空${max}`}</span></label>`}).join('')}</div><label>目標<select data-hd-map-air-goal data-hd-map-air-map="${esc(map)}">${Object.entries(HD_MAP_AIR_GOALS).map(([key,label])=>`<option value="${key}" ${target.goal===key?'selected':''}>${label}</option>`).join('')}</select></label><p>${esc(target.detail)}${target.known?` / 敵 ${target.enemy} / ${HD_MAP_AIR_GOALS[target.goal]} ${hdMapAirThreshold(target.enemy,target.goal)}`:''}</p><small>選択と目標は手持ち装備探索・出撃確認と共通。下の手入力機体・熟練度・敵制空値は、この計算画面内だけの仮定です。未選択の間は海域全体の値だけでルート充足としません。</small><a class="guide-link" href="${esc(data.source)}" target="_blank" rel="noopener">海域の敵編成表 ↗</a><details><summary>登録済み37海域の対応状況</summary><p>${Object.keys(HD_MAP_AIR_DATA).join(' / ')}。本隊のマス別制空を登録。基地航空隊は6-4・6-5・7-4だけ使用可能。索敵・分岐・発動確率などの未判定項目は別途表示します。</p></details></details>`;
}
document.addEventListener('change',e=>{const el=e.target,map=el?.dataset?.hdMapAirMap;if(el?.matches('[data-hd-map-air-select]'))hdMapAirSave(map,el.dataset.hdMapAirSelect,el.checked);else if(el?.matches('[data-hd-map-air-goal]'))hdMapAirSave(map,null,false,el.value)});

window.addEventListener('storage',e=>{if(e.key===HD_MAP_AIR_KEY)window.dispatchEvent(new CustomEvent('hd:map-air-changed'))});
