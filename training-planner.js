const HD_TRAINING_KEY='harbordesk-training-plans-v1';

const HD_TRAINING_SPOTS=[
 {id:'1-5',name:'1-5 鎮守府近海',tags:['駆逐艦','軽巡洋艦','海防艦'],minLv:1,risk:'低め',role:'序盤・対潜育成',formation:'育成艦1＋対潜随伴3（駆逐・海防・軽巡など、計4隻）',prep:'ソナー・爆雷を装備。先制対潜できる随伴を優先。',note:'4隻以内の対潜編成。戦艦（航空戦艦を除く）・空母系を入れる場合はルートを確認。'},
 {id:'7-2-1',name:'7-2-1 第1ゲージ',tags:['駆逐艦','海防艦'],minLv:1,risk:'低め',role:'旗艦集中・対潜育成',formation:'育成駆逐/海防1＋先制対潜の駆逐/海防2＋護衛空母1（計4隻）',prep:'随伴3隻の対潜と、護衛空母の対潜攻撃を確認。',note:'第1ゲージ向け。育成艦を駆逐・海防以外に替えると編成・ルートが変わる。'},
 {id:'4-4',name:'4-4 カスガダマ島',tags:['戦艦','航空戦艦','正規空母','装甲空母','軽空母','重巡洋艦','航空巡洋艦','軽巡洋艦','駆逐艦'],minLv:35,risk:'中',role:'周回育成・戦果',formation:'駆逐2＋正規/装甲空母2＋重巡級/軽巡1＋自由枠1（計6隻）',prep:'道中の潜水艦に対潜役を用意。制空とボス戦の火力を確保。',note:'育成艦を該当する枠へ配置。自由枠の艦種によっては経路を確認。'},
 {id:'5-3-P',name:'5-3-P 夜戦マス',tags:['戦艦','重巡洋艦','航空巡洋艦','軽巡洋艦','駆逐艦'],minLv:45,risk:'高め',role:'高EXP・夜戦育成',formation:'軽巡1＋駆逐2＋重巡/航巡3（計6隻、育成艦を旗艦へ）',prep:'夜戦装備・被害管理を重視。大破したら撤退。',note:'Pマス基礎経験値700〜750。戦艦育成は重巡枠を戦艦1へ変更可。航空戦艦・空母系・潜水艦は避ける。'},
 {id:'7-1',name:'7-1 ブルネイ泊地沖',tags:['軽巡洋艦','駆逐艦'],minLv:50,risk:'中',role:'対潜周回・戦果',formation:'軽巡1＋駆逐4（計5隻、育成艦は該当枠へ）',prep:'先制対潜を複数用意。水上戦の火力と被害も確認。',note:'軽巡・駆逐の対潜周回向け。海防艦を入れる場合は経路が変わるため確認。'},
 {id:'exercise',name:'演習',tags:['*'],minLv:1,risk:'低',role:'全艦種・毎日',formation:'育成艦を旗艦＋勝利を狙える随伴（最大6隻）',prep:'相手編成を見て制空・対潜を調整。',note:'相手旗艦・2隻目のLvで経験値が変化。出撃しづらい艦にも使いやすい。'}
];

let hdTrainingActiveOnly=false;
let hdTrainingPriority='すべて';

function hdTrainingEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdTrainingLoad(){try{return JSON.parse(localStorage.getItem(HD_TRAINING_KEY)||'{}')||{}}catch{return {}}}
function hdTrainingSave(v){localStorage.setItem(HD_TRAINING_KEY,JSON.stringify(v))}
function hdTrainingRoster(){try{return JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{return []}}
function hdTrainingDbFor(name){if(typeof HD_SHIP_DATABASE==='undefined')return null;const n=String(name||'').trim();return HD_SHIP_DATABASE.find(x=>n===x.base||n===x.final||n.startsWith(x.base))||null}
function hdTrainingPlanFor(ship){
 const all=hdTrainingLoad(),saved=all[ship.id]||{},db=hdTrainingDbFor(ship.name),lv=Math.max(1,Number(ship.level)||1),defaultTarget=db?.targetLv||99;
 const target=Math.max(lv,Number(saved.target)||defaultTarget);
 return {active:!!saved.active,priority:Number(saved.priority)||2,target,runs:Number(saved.runs)||0,exercises:Number(saved.exercises)||0,note:String(saved.note||''),db};
}
function hdTrainingUpdate(shipId,patch){const all=hdTrainingLoad();all[shipId]={...(all[shipId]||{}),...patch};hdTrainingSave(all);hdRenderTrainingPlanner()}
function hdTrainingTypeSafe(ship,plan){
 if(plan.db?.type)return plan.db.type;
 const text=`${ship.name||''} ${ship.remodel||''} ${ship.memo||''}`;
 const types=['航空戦艦','装甲空母','正規空母','軽空母','航空巡洋艦','重巡洋艦','軽巡洋艦','重雷装巡洋艦','駆逐艦','海防艦','戦艦','潜水艦','水上機母艦'];
 return types.find(t=>text.includes(t))||'';
}
function hdTrainingRank(order,id){const i=order.indexOf(id);return i<0?99:i}
function hdTrainingSpots(ship,plan){
 const type=hdTrainingTypeSafe(ship,plan),lv=Math.max(1,Number(ship.level)||1);
 let spots=HD_TRAINING_SPOTS.filter(s=>s.tags.includes('*')||(type&&s.tags.includes(type))).filter(s=>lv>=s.minLv||s.id==='1-5'||s.id==='7-2-1'||s.id==='exercise');
 let order=['4-4','exercise','7-2-1','1-5','5-3-P','7-1'];
 if((type==='駆逐艦'||type==='軽巡洋艦'||type==='海防艦')&&lv<45)order=['1-5','7-2-1','exercise','4-4','7-1','5-3-P'];
 else if(['戦艦','重巡洋艦','航空巡洋艦','軽巡洋艦','駆逐艦'].includes(type)&&lv>=45)order=['5-3-P','4-4','7-1','7-2-1','exercise','1-5'];
 else if(type==='正規空母'||type==='装甲空母'||type==='軽空母'||type==='航空戦艦')order=['4-4','exercise','7-2-1'];
 spots.sort((a,b)=>hdTrainingRank(order,a.id)-hdTrainingRank(order,b.id));
 return spots.slice(0,3);
}
function hdTrainingPriorityLabel(n){return n===3?'高':n===1?'低':'中'}
function hdTrainingSpotDetails(s){return `<div class="hd-training-spot-details"><span><b>編成例</b>${hdTrainingEsc(s.formation)}</span><span><b>準備</b>${hdTrainingEsc(s.prep)}</span><small>${hdTrainingEsc(s.note)}</small></div>`}
function hdTrainingMapCatalog(){return `<div class="hd-training-map-heading"><h3>おすすめ海域・編成例</h3><span class="muted">育成艦は編成例の枠に含む。出撃前に海域情報でルート条件を確認してね。</span></div><div class="hd-training-map-list">${HD_TRAINING_SPOTS.map(s=>`<article class="hd-training-map-card"><div class="hd-training-map-title"><strong>${hdTrainingEsc(s.name)}</strong><span>${hdTrainingEsc(s.role)}・リスク ${hdTrainingEsc(s.risk)}</span></div>${hdTrainingSpotDetails(s)}<button type="button" class="ghost small" data-hd-training-guide="${s.id}">${s.id==='exercise'?'演習の予定を見る':'海域情報を見る'}</button></article>`).join('')}</div>`}
function hdTrainingStatus(ship,plan){
 const lv=Math.max(1,Number(ship.level)||1),gap=Math.max(0,plan.target-lv);
 if(gap===0)return {label:'目標達成',cls:'done',gap:0};
 if(plan.active)return {label:`あと${gap}Lv`,cls:'active',gap};
 return {label:`あと${gap}Lv`,cls:'idle',gap};
}
function hdTrainingRows(){return hdTrainingRoster().map(ship=>({ship,plan:hdTrainingPlanFor(ship)}))}
function hdTrainingSummary(rows){
 const active=rows.filter(x=>x.plan.active),done=active.filter(x=>hdTrainingStatus(x.ship,x.plan).gap===0),remaining=active.reduce((a,x)=>a+hdTrainingStatus(x.ship,x.plan).gap,0);
 const nearest=active.filter(x=>hdTrainingStatus(x.ship,x.plan).gap>0).sort((a,b)=>hdTrainingStatus(a.ship,a.plan).gap-hdTrainingStatus(b.ship,b.plan).gap)[0];
 return {active:active.length,done:done.length,remaining,nearest};
}
function hdTrainingGoGuide(id){
 if(id==='exercise'){if(typeof hdWSShowElement==='function')hdWSShowElement('exerciseRoutine',true);else if(typeof hdQNJump==='function')hdQNJump('exerciseRoutine');else document.getElementById('quests')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 const map=id==='7-2-1'?'7-2':id.replace('-P','');const input=document.getElementById('guideQuery');if(input){input.value=map;document.getElementById('guideSearchBtn')?.click()}if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);else if(typeof hdQNJump==='function')hdQNJump('guide');else document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function hdTrainingEditShip(id){const ship=hdTrainingRoster().find(x=>x.id===id);if(ship&&typeof openShipRosterDialog==='function'){if(typeof hdWSShowElement==='function')hdWSShowElement('roster',false);openShipRosterDialog(ship)}else if(typeof hdWSShowElement==='function')hdWSShowElement('roster',true);else if(typeof hdQNJump==='function')hdQNJump('roster');else document.getElementById('roster')?.scrollIntoView({behavior:'smooth'})}
function hdRenderTrainingPlanner(){
 const host=document.getElementById('hdTrainingList');if(!host)return;let rows=hdTrainingRows();
 const q=(document.getElementById('hdTrainingSearch')?.value||'').trim().toLowerCase();
 if(q)rows=rows.filter(x=>`${x.ship.name} ${x.ship.remodel||''} ${(x.ship.tags||[]).join(' ')} ${x.plan.db?.type||''}`.toLowerCase().includes(q));
 if(hdTrainingActiveOnly)rows=rows.filter(x=>x.plan.active);
 if(hdTrainingPriority!=='すべて')rows=rows.filter(x=>hdTrainingPriorityLabel(x.plan.priority)===hdTrainingPriority);
 rows.sort((a,b)=>Number(b.plan.active)-Number(a.plan.active)||b.plan.priority-a.plan.priority||hdTrainingStatus(a.ship,a.plan).gap-hdTrainingStatus(b.ship,b.plan).gap||String(a.ship.name).localeCompare(String(b.ship.name),'ja'));
 const all=hdTrainingRows(),sum=hdTrainingSummary(all),summary=document.getElementById('hdTrainingSummary');
 if(summary)summary.innerHTML=`<div><span>育成対象</span><strong>${sum.active}</strong></div><div><span>目標達成</span><strong>${sum.done}</strong></div><div><span>残りLv合計</span><strong>${sum.remaining}</strong></div><div><span>次に近い</span><strong>${sum.nearest?`${hdTrainingEsc(sum.nearest.ship.name)} あと${hdTrainingStatus(sum.nearest.ship,sum.nearest.plan).gap}`:'-'}</strong></div>`;
 const count=document.getElementById('hdTrainingCount');if(count)count.textContent=`${rows.length}隻`;
 host.innerHTML=rows.map(({ship,plan})=>{const lv=Math.max(1,Number(ship.level)||1),st=hdTrainingStatus(ship,plan),pct=plan.target>1?Math.max(0,Math.min(100,Math.round((lv-1)/(plan.target-1)*100))):100,spots=hdTrainingSpots(ship,plan);return `<article class="hd-training-card${plan.active?' active':''}${st.gap===0?' done':''}"><div class="hd-training-head"><div><strong>${hdTrainingEsc(ship.name)}</strong><span>Lv.${lv}${plan.db?.type?`・${hdTrainingEsc(plan.db.type)}`:''}</span></div><div class="hd-training-state ${st.cls}"><b>${hdTrainingEsc(st.label)}</b><small>優先度 ${hdTrainingPriorityLabel(plan.priority)}</small></div></div><div class="hd-training-progress"><progress max="100" value="${pct}"></progress><span>Lv.${lv} → <b>${plan.target}</b></span></div><div class="hd-training-controls"><label>目標Lv<input type="number" min="${lv}" max="180" value="${plan.target}" data-hd-training-target="${ship.id}"></label><label>優先度<select data-hd-training-priority="${ship.id}"><option value="3" ${plan.priority===3?'selected':''}>高</option><option value="2" ${plan.priority===2?'selected':''}>中</option><option value="1" ${plan.priority===1?'selected':''}>低</option></select></label><button type="button" class="${plan.active?'primary':'ghost'} small" data-hd-training-active="${ship.id}">${plan.active?'育成対象中':'育成対象にする'}</button></div>${plan.db?`<div class="hd-training-remodel"><span>改装目標</span><strong>${hdTrainingEsc(plan.db.final)} / Lv.${plan.db.targetLv}</strong></div>`:''}<div class="hd-training-spots">${spots.map(s=>`<button type="button" class="hd-training-spot" data-hd-training-guide="${s.id}"><strong>${hdTrainingEsc(s.name)}</strong><span>${hdTrainingEsc(s.role)}・リスク ${hdTrainingEsc(s.risk)}</span><small>${hdTrainingEsc(s.formation)}</small></button>`).join('')||'<div class="muted">艦種が未判定。演習や普段の攻略編成で育成する候補だよ。</div>'}</div><div class="hd-training-record"><button type="button" class="ghost small" data-hd-training-run="${ship.id}">出撃 +1 <b>${plan.runs}</b></button><button type="button" class="ghost small" data-hd-training-exercise="${ship.id}">演習 +1 <b>${plan.exercises}</b></button><button type="button" class="ghost small" data-hd-training-edit="${ship.id}">Lvを更新</button></div></article>`}).join('')||'<div class="empty">条件に合う艦がいないよ。艦隊台帳に艦娘とLvを登録すると育成計画が作れる。</div>';
}
function hdEnsureTrainingPlanner(){
 if(document.getElementById('trainingPlanner'))return;const anchor=document.getElementById('shipDatabase')||document.getElementById('roster');if(!anchor)return;const sec=document.createElement('section');sec.id='trainingPlanner';sec.className='advanced-section hd-training-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">TRAINING PLAN</div><h2>レベリング・育成計画</h2></div><span id="hdTrainingCount" class="muted"></span></div><div class="hd-training-note">艦隊台帳の現在Lvと艦娘DBの改装Lvを照合して育成状況を表示。海域候補は艦種・Lvから出す目安で、装備・ルート・疲労・被害状況に合わせて調整してね。</div><div id="hdTrainingSummary" class="hd-training-summary"></div><div class="hd-training-map-catalog">${hdTrainingMapCatalog()}</div><div class="hd-training-toolbar"><input id="hdTrainingSearch" type="search" placeholder="艦名・艦種・タグで検索"><label><input id="hdTrainingActiveOnly" type="checkbox"> 育成対象だけ</label><div class="hd-training-priority-filter"><button type="button" class="ghost small active" data-hd-training-filter="すべて">すべて</button><button type="button" class="ghost small" data-hd-training-filter="高">高</button><button type="button" class="ghost small" data-hd-training-filter="中">中</button><button type="button" class="ghost small" data-hd-training-filter="低">低</button></div></div><div id="hdTrainingList" class="hd-training-list"></div><div class="hd-training-source"><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E7%B5%8C%E9%A8%93%E5%80%A4" target="_blank" rel="noopener">攻略Wiki 経験値 ↗</a><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E5%8D%97%E6%96%B9%E6%B5%B7%E5%9F%9F/5-3" target="_blank" rel="noopener">5-3-P育成情報 ↗</a></div>`;
 anchor.insertAdjacentElement('afterend',sec);document.getElementById('hdTrainingSearch').addEventListener('input',hdRenderTrainingPlanner);document.getElementById('hdTrainingActiveOnly').addEventListener('change',e=>{hdTrainingActiveOnly=e.target.checked;hdRenderTrainingPlanner()});hdRenderTrainingPlanner();
}
document.addEventListener('change',e=>{const t=e.target.closest?.('[data-hd-training-target]');if(t){hdTrainingUpdate(t.dataset.hdTrainingTarget,{target:Math.max(1,Number(t.value)||1)});return}const p=e.target.closest?.('[data-hd-training-priority]');if(p){hdTrainingUpdate(p.dataset.hdTrainingPriority,{priority:Number(p.value)||2})}});
document.addEventListener('click',e=>{const a=e.target.closest?.('[data-hd-training-active]');if(a){const all=hdTrainingLoad(),cur=all[a.dataset.hdTrainingActive]||{};hdTrainingUpdate(a.dataset.hdTrainingActive,{active:!cur.active});return}const r=e.target.closest?.('[data-hd-training-run]');if(r){const all=hdTrainingLoad(),cur=all[r.dataset.hdTrainingRun]||{};hdTrainingUpdate(r.dataset.hdTrainingRun,{runs:(Number(cur.runs)||0)+1});return}const ex=e.target.closest?.('[data-hd-training-exercise]');if(ex){const all=hdTrainingLoad(),cur=all[ex.dataset.hdTrainingExercise]||{};hdTrainingUpdate(ex.dataset.hdTrainingExercise,{exercises:(Number(cur.exercises)||0)+1});return}const ed=e.target.closest?.('[data-hd-training-edit]');if(ed){hdTrainingEditShip(ed.dataset.hdTrainingEdit);return}const g=e.target.closest?.('[data-hd-training-guide]');if(g){hdTrainingGoGuide(g.dataset.hdTrainingGuide);return}const f=e.target.closest?.('[data-hd-training-filter]');if(f){hdTrainingPriority=f.dataset.hdTrainingFilter;document.querySelectorAll('[data-hd-training-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderTrainingPlanner()}});
window.addEventListener('load',()=>setTimeout(hdEnsureTrainingPlanner,320));setTimeout(hdEnsureTrainingPlanner,620);
