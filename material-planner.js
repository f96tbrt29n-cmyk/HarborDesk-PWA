const HD_MATERIAL_STOCK_KEY='harbordesk-material-stock-v1';
const HD_MATERIAL_GOALS_KEY='harbordesk-material-goals-v1';

const HD_MATERIALS=[
 {id:'blueprint',name:'改装設計図',group:'改装',aliases:['改装設計図','設計図'],note:'主に改二以降の改装で使用。勲章4個で1枚に交換できる。'},
 {id:'medal',name:'勲章',group:'交換',aliases:['勲章'],note:'勲章4個→改装設計図1枚、1個→改修資材4個に交換可能。'},
 {id:'report',name:'戦闘詳報',group:'改装',aliases:['戦闘詳報'],note:'高性能改装や装備更新で使用。'},
 {id:'catapult',name:'試製甲板カタパルト',group:'改装',aliases:['試製甲板カタパルト'],note:'一部空母・航空戦艦などの大型改装で使用。'},
 {id:'gunmat',name:'新型砲熕兵装資材',group:'兵装',aliases:['新型砲熕兵装資材'],note:'大型主砲系の改装・更新で使用。'},
 {id:'airmat',name:'新型航空兵装資材',group:'兵装',aliases:['新型航空兵装資材'],note:'航空系の改装・装備更新で使用。'},
 {id:'newmat',name:'新型兵装資材',group:'兵装',aliases:['新型兵装資材'],note:'各種新型兵装・艦改装で使用。'},
 {id:'overseas',name:'海外艦最新技術',group:'兵装',aliases:['海外艦最新技術'],note:'海外艦の大型改装・海外兵装更新などで使用。'},
 {id:'factory',name:'工廠資源',group:'兵装',aliases:['工廠資源'],note:'一部の新型装備・改装系コンテンツで使用。'},
 {id:'rocketmat',name:'新型噴進装備開発資材',group:'兵装',aliases:['新型噴進装備開発資材'],note:'新型噴進装備の開発・戦力化に使用。'},
 {id:'crew',name:'熟練搭乗員',group:'航空',aliases:['熟練搭乗員'],note:'航空装備の更新・任務などで使用。'},
 {id:'screw',name:'改修資材',group:'工廠',aliases:['改修資材'],note:'改修工廠で使用するネジ。'},
 {id:'devmat',name:'開発資材',group:'工廠',aliases:['開発資材'],note:'開発・建造・改装・装備更新などで広く使用。'},
 {id:'fastbuild',name:'高速建造材',group:'工廠',aliases:['高速建造材'],note:'建造時間短縮のほか、一部改装でも消費。'},
 {id:'reinforcement',name:'補強増設',group:'その他',aliases:['補強増設'],note:'補強増設スロットの開放に使用。'}
];

let hdMaterialGroup='すべて';
let hdMaterialShortageOnly=false;
let hdMaterialOwnedShipsOnly=false;

function hdMatEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdMatLoadStock(){try{return JSON.parse(localStorage.getItem(HD_MATERIAL_STOCK_KEY)||'{}')||{}}catch{return {}}}
function hdMatSaveStock(stock){localStorage.setItem(HD_MATERIAL_STOCK_KEY,JSON.stringify(stock))}
function hdMatLoadGoals(){try{return JSON.parse(localStorage.getItem(HD_MATERIAL_GOALS_KEY)||'[]')||[]}catch{return []}}
function hdMatSaveGoals(goals){localStorage.setItem(HD_MATERIAL_GOALS_KEY,JSON.stringify(goals))}
function hdMatRoster(){try{return JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{return []}}
function hdMatShipOwned(item){return hdMatRoster().some(x=>{const n=String(x.name||'').trim();return n===item.base||n===item.final||n.startsWith(item.base)})}

function hdMatParse(text){
 const src=String(text||'');const out={};
 for(const m of HD_MATERIALS){
  let count=0;
  for(const alias of m.aliases){
   const esc=alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const re=new RegExp(`${esc}(?:\\s*[×xX]\\s*(\\d+))?`,'g');let match;
   while((match=re.exec(src))){count+=match[1]?Number(match[1]):1}
  }
  if(count>0)out[m.id]=(out[m.id]||0)+count;
 }
 return out;
}
function hdMatMerge(target,src){for(const [k,v] of Object.entries(src||{}))target[k]=(target[k]||0)+(Number(v)||0);return target}
function hdMatReqText(req){return Object.entries(req).map(([id,n])=>`${HD_MATERIALS.find(x=>x.id===id)?.name||id}×${n}`).join(' / ')||'追跡対象の特殊素材なし'}

function hdMatGoalCandidates(){
 const rows=[];
 if(typeof HD_SHIP_DATABASE!=='undefined')for(const x of HD_SHIP_DATABASE){
  if(hdMaterialOwnedShipsOnly&&!hdMatShipOwned(x))continue;
  rows.push({id:`ship:${x.base}`,kind:'ship',title:`${x.final}へ改装`,sub:x.path,raw:x.requirements,req:hdMatParse(x.requirements),owned:hdMatShipOwned(x)});
 }
 if(typeof HD_IMPROVEMENTS!=='undefined')for(const x of HD_IMPROVEMENTS){
  if(!x.update||x.update.includes('更新なし')||x.update.includes('更新不可'))continue;
  const last=x.stages?.[x.stages.length-1];const raw=last?.[3]||'';
  rows.push({id:`equip:${x.name}`,kind:'equip',title:`${x.name} → ${x.update}`,sub:'装備更新時の特殊素材',raw,req:hdMatParse(raw),owned:null});
 }
 return rows;
}
function hdMatSelectedGoals(){const selected=new Set(hdMatLoadGoals());return hdMatGoalCandidates().filter(x=>selected.has(x.id))}
function hdMatNeeded(){const total={};for(const g of hdMatSelectedGoals())hdMatMerge(total,g.req);return total}
function hdMatShortages(){const need=hdMatNeeded(),stock=hdMatLoadStock(),out={};for(const m of HD_MATERIALS){const n=need[m.id]||0,s=Number(stock[m.id])||0;if(n>s)out[m.id]=n-s}return out}

function hdMatRenderInventory(){
 const host=document.getElementById('hdMaterialInventory');if(!host)return;const stock=hdMatLoadStock(),need=hdMatNeeded(),short=hdMatShortages();
 let rows=HD_MATERIALS.filter(m=>hdMaterialGroup==='すべて'||m.group===hdMaterialGroup);if(hdMaterialShortageOnly)rows=rows.filter(m=>(short[m.id]||0)>0);
 host.innerHTML=rows.map(m=>{const s=Number(stock[m.id])||0,n=need[m.id]||0,d=Math.max(0,n-s);return `<article class="hd-mat-card${d>0?' shortage':''}"><div class="hd-mat-head"><div><strong>${hdMatEsc(m.name)}</strong><span>${hdMatEsc(m.group)}</span></div><div class="hd-mat-numbers"><b>${s}</b><small>所持</small></div></div><div class="hd-mat-stepper"><button type="button" class="ghost small" data-hd-mat-step="${m.id}" data-delta="-1">−</button><input data-hd-mat-input="${m.id}" type="number" min="0" inputmode="numeric" value="${s}"><button type="button" class="ghost small" data-hd-mat-step="${m.id}" data-delta="1">＋</button></div><div class="hd-mat-need"><span>目標必要 <b>${n}</b></span><span class="${d>0?'bad':''}">不足 <b>${d}</b></span></div><p>${hdMatEsc(m.note)}</p></article>`}).join('')||'<div class="empty">条件に合う素材がないよ</div>';
 const medal=Number(stock.medal)||0,blue=Number(stock.blueprint)||0;const hint=document.getElementById('hdMaterialExchangeHint');if(hint)hint.innerHTML=`勲章 ${medal}個 → 設計図に最大 <b>${Math.floor(medal/4)}</b>枚分 / 改修資材に最大 <b>${medal*4}</b>個分。現在の設計図は ${blue}枚。交換は自動計算に含めていないよ。`;
 hdMatRenderSummary();
}
function hdMatRenderSummary(){
 const host=document.getElementById('hdMaterialSummary');if(!host)return;const need=hdMatNeeded(),stock=hdMatLoadStock();
 const active=HD_MATERIALS.filter(m=>(need[m.id]||0)>0);host.innerHTML=active.length?active.map(m=>{const n=need[m.id]||0,s=Number(stock[m.id])||0,d=Math.max(0,n-s);return `<div class="hd-mat-summary-row${d>0?' shortage':''}"><span>${hdMatEsc(m.name)}</span><span>所持 <b>${s}</b> / 必要 <b>${n}</b> / 不足 <b>${d}</b></span></div>`}).join(''):'<div class="empty">目標を選ぶと必要素材を集計するよ</div>';
}
function hdMatRenderGoals(){
 const host=document.getElementById('hdMaterialGoals');if(!host)return;const selected=new Set(hdMatLoadGoals());const q=(document.getElementById('hdMaterialGoalSearch')?.value||'').trim().toLowerCase();
 const rows=hdMatGoalCandidates().filter(x=>!q||`${x.title} ${x.sub} ${x.raw}`.toLowerCase().includes(q));
 host.innerHTML=rows.map(g=>`<label class="hd-mat-goal${selected.has(g.id)?' selected':''}"><input type="checkbox" data-hd-mat-goal="${hdMatEsc(g.id)}" ${selected.has(g.id)?'checked':''}><div><strong>${hdMatEsc(g.title)}</strong><span>${g.kind==='ship'?(g.owned?'所持艦':'未所持艦'):'装備更新'}｜${hdMatEsc(g.sub)}</span><small>${hdMatEsc(hdMatReqText(g.req))}</small>${g.raw?`<em>${hdMatEsc(g.raw)}</em>`:''}</div></label>`).join('')||'<div class="empty">条件に合う目標がないよ</div>';
 const c=document.getElementById('hdMaterialGoalCount');if(c)c.textContent=`選択 ${selected.size}件`;
}
function hdMatSetStock(id,value){const s=hdMatLoadStock();s[id]=Math.max(0,Math.floor(Number(value)||0));hdMatSaveStock(s);hdMatRenderInventory()}
function hdMatToggleGoal(id,checked){const g=new Set(hdMatLoadGoals());checked?g.add(id):g.delete(id);hdMatSaveGoals([...g]);hdMatRenderGoals();hdMatRenderInventory()}

function hdEnsureMaterialPlanner(){
 if(document.getElementById('materialPlanner'))return;
 const anchor=document.getElementById('shipDatabase')||document.getElementById('improvementWorkshop')||document.getElementById('roster');if(!anchor)return;
 const sec=document.createElement('section');sec.id='materialPlanner';sec.className='advanced-section hd-material-section';
 const groups=['すべて',...new Set(HD_MATERIALS.map(x=>x.group))];
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">MATERIAL PLANNER</div><h2>改装素材・特殊アイテム管理</h2></div><span class="muted">所持数と不足を自動集計</span></div><div class="hd-mat-note">艦娘DBの改装条件と改修工廠の更新素材をまとめて不足計算するよ。装備更新のネジ・開発資材は途中改修や確実化で変わるため、自動必要数には含めない。</div><div id="hdMaterialExchangeHint" class="hd-mat-exchange"></div><div class="hd-mat-toolbar"><div class="hd-mat-filters">${groups.map((g,i)=>`<button type="button" class="ghost small${i===0?' active':''}" data-hd-mat-filter="${hdMatEsc(g)}">${hdMatEsc(g)}</button>`).join('')}</div><label><input id="hdMaterialShortageOnly" type="checkbox"> 不足だけ</label></div><div id="hdMaterialInventory" class="hd-mat-grid"></div><div class="hd-mat-plan"><div class="section-head"><div><div class="eyebrow">GOALS</div><h3>改装・更新目標</h3></div><span id="hdMaterialGoalCount" class="muted"></span></div><div class="hd-mat-goal-toolbar"><input id="hdMaterialGoalSearch" type="search" placeholder="艦名・装備名・素材で検索"><label><input id="hdMaterialOwnedShipsOnly" type="checkbox"> 所持艦だけ</label><button type="button" class="ghost small" id="hdMaterialClearGoals">目標を全解除</button></div><div id="hdMaterialGoals" class="hd-mat-goals"></div></div><div class="hd-mat-total"><div class="eyebrow">SHORTAGE SUMMARY</div><h3>選択目標の不足素材</h3><div id="hdMaterialSummary"></div></div><div class="hd-mat-source"><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0" target="_blank" rel="noopener">攻略Wiki アイテム一覧 ↗</a><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E6%94%B9%E9%80%A0" target="_blank" rel="noopener">攻略Wiki 改造一覧 ↗</a></div>`;
 anchor.insertAdjacentElement('afterend',sec);
 document.getElementById('hdMaterialGoalSearch').addEventListener('input',hdMatRenderGoals);
 document.getElementById('hdMaterialShortageOnly').addEventListener('change',e=>{hdMaterialShortageOnly=e.target.checked;hdMatRenderInventory()});
 document.getElementById('hdMaterialOwnedShipsOnly').addEventListener('change',e=>{hdMaterialOwnedShipsOnly=e.target.checked;hdMatRenderGoals()});
 document.getElementById('hdMaterialClearGoals').addEventListener('click',()=>{hdMatSaveGoals([]);hdMatRenderGoals();hdMatRenderInventory()});
 hdMatRenderGoals();hdMatRenderInventory();
}

document.addEventListener('input',e=>{const i=e.target.closest?.('[data-hd-mat-input]');if(i)hdMatSetStock(i.dataset.hdMatInput,i.value)});
document.addEventListener('change',e=>{const g=e.target.closest?.('[data-hd-mat-goal]');if(g)hdMatToggleGoal(g.dataset.hdMatGoal,g.checked)});
document.addEventListener('click',e=>{const s=e.target.closest?.('[data-hd-mat-step]');if(s){const stock=hdMatLoadStock(),id=s.dataset.hdMatStep,delta=Number(s.dataset.delta)||0;hdMatSetStock(id,(Number(stock[id])||0)+delta);return}const f=e.target.closest?.('[data-hd-mat-filter]');if(f){hdMaterialGroup=f.dataset.hdMatFilter;document.querySelectorAll('[data-hd-mat-filter]').forEach(b=>b.classList.toggle('active',b===f));hdMatRenderInventory()}});
window.addEventListener('load',()=>setTimeout(hdEnsureMaterialPlanner,500));setTimeout(hdEnsureMaterialPlanner,700);
