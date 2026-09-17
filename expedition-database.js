const HD_EXPEDITIONS=[
{id:'01',name:'練習航海',minutes:15,flagLv:1,totalLv:null,minShips:2,required:'指定なし',resources:{fuel:0,ammo:30,steel:0,bauxite:0},items:'-',fuelUse:30,ammoUse:0,tags:['短時間','弾薬']},
{id:'02',name:'長距離練習航海',minutes:30,flagLv:2,totalLv:null,minShips:4,required:'指定なし',resources:{fuel:0,ammo:100,steel:30,bauxite:0},items:'高速修復材 0～1',fuelUse:50,ammoUse:0,tags:['短時間','弾薬','バケツ']},
{id:'03',name:'警備任務',minutes:20,flagLv:3,totalLv:null,minShips:3,required:'指定なし',resources:{fuel:30,ammo:30,steel:40,bauxite:0},items:'-',fuelUse:30,ammoUse:20,tags:['短時間','鋼材']},
{id:'04',name:'対潜警戒任務',minutes:50,flagLv:3,totalLv:null,minShips:3,required:'軽1＋(駆/海防)2',resources:{fuel:0,ammo:70,steel:0,bauxite:0},items:'高速修復材 0～1 / 家具箱(小) 0～1',fuelUse:50,ammoUse:0,tags:['対潜','バケツ','弾薬']},
{id:'05',name:'海上護衛任務',minutes:90,flagLv:3,totalLv:null,minShips:4,required:'軽1＋(駆/海防)2＋他1',resources:{fuel:200,ammo:200,steel:20,bauxite:20},items:'-',fuelUse:50,ammoUse:0,tags:['燃料','弾薬','定番']},
{id:'06',name:'防空射撃演習',minutes:40,flagLv:4,totalLv:null,minShips:4,required:'指定なし',resources:{fuel:0,ammo:0,steel:0,bauxite:80},items:'家具箱(小) 0～1',fuelUse:30,ammoUse:20,tags:['短時間','ボーキ']},
{id:'07',name:'観艦式予行',minutes:60,flagLv:5,totalLv:null,minShips:6,required:'指定なし',resources:{fuel:0,ammo:0,steel:50,bauxite:30},items:'高速建造材 0～1',fuelUse:50,ammoUse:0,tags:['鋼材']},
{id:'08',name:'観艦式',minutes:180,flagLv:6,totalLv:null,minShips:6,required:'指定なし',resources:{fuel:50,ammo:100,steel:50,bauxite:50},items:'高速建造材 0～2 / 開発資材 0～1',fuelUse:50,ammoUse:20,tags:['総合']},
{id:'09',name:'タンカー護衛任務',minutes:240,flagLv:3,totalLv:null,minShips:4,required:'軽1＋(駆/海防)2＋他1',resources:{fuel:350,ammo:0,steel:0,bauxite:0},items:'高速修復材 0～2 / 家具箱(小) 0～1',fuelUse:50,ammoUse:0,tags:['燃料','バケツ']},
{id:'10',name:'強行偵察任務',minutes:90,flagLv:3,totalLv:null,minShips:3,required:'軽2＋他1',resources:{fuel:0,ammo:50,steel:0,bauxite:40},items:'高速修復材 0～1 / 高速建造材 0～1',fuelUse:30,ammoUse:0,tags:['弾薬','ボーキ']},
{id:'11',name:'ボーキサイト輸送任務',minutes:300,flagLv:6,totalLv:null,minShips:4,required:'(駆/海防)2＋他2',resources:{fuel:0,ammo:0,steel:0,bauxite:250},items:'高速修復材 0～1 / 家具箱(小) 0～1',fuelUse:50,ammoUse:0,tags:['ボーキ','バケツ']},
{id:'12',name:'資源輸送任務',minutes:480,flagLv:4,totalLv:null,minShips:4,required:'(駆/海防)2＋他2',resources:{fuel:50,ammo:250,steel:200,bauxite:50},items:'開発資材 0～1 / 家具箱(中) 0～1',fuelUse:50,ammoUse:0,tags:['総合','長時間']},
{id:'13',name:'鼠輸送作戦',minutes:240,flagLv:5,totalLv:null,minShips:6,required:'軽1＋駆4＋他1',resources:{fuel:240,ammo:300,steel:0,bauxite:0},items:'高速修復材 0～2 / 家具箱(小) 0～1',fuelUse:50,ammoUse:40,tags:['燃料','弾薬','バケツ']},
{id:'14',name:'包囲陸戦隊撤収作戦',minutes:360,flagLv:6,totalLv:null,minShips:6,required:'軽1＋駆3＋他2',resources:{fuel:0,ammo:280,steel:200,bauxite:30},items:'高速修復材 0～1 / 開発資材 0～1',fuelUse:50,ammoUse:0,tags:['弾薬','鋼材']},
{id:'15',name:'囮機動部隊支援作戦',minutes:720,flagLv:8,totalLv:null,minShips:6,required:'空母2＋駆2＋他2',resources:{fuel:0,ammo:0,steel:300,bauxite:400},items:'開発資材 0～1 / 家具箱(大) 0～1',fuelUse:50,ammoUse:40,tags:['鋼材','ボーキ','長時間']},
{id:'16',name:'艦隊決戦援護作戦',minutes:900,flagLv:10,totalLv:null,minShips:6,required:'軽1＋駆2＋他3',resources:{fuel:500,ammo:500,steel:200,bauxite:200},items:'高速建造材 0～2 / 開発資材 0～2',fuelUse:50,ammoUse:40,tags:['燃料','弾薬','長時間']},
{id:'17',name:'敵地偵察作戦',minutes:45,flagLv:20,totalLv:null,minShips:6,required:'軽1＋駆3＋他2',resources:{fuel:70,ammo:90,steel:50,bauxite:0},items:'-',fuelUse:30,ammoUse:40,tags:['短時間','燃料','弾薬']},
{id:'18',name:'航空機輸送作戦',minutes:300,flagLv:15,totalLv:null,minShips:6,required:'空母3＋駆2＋他1',resources:{fuel:0,ammo:0,steel:300,bauxite:150},items:'高速修復材 0～1',fuelUse:50,ammoUse:20,tags:['鋼材','ボーキ']},
{id:'19',name:'北号作戦',minutes:360,flagLv:20,totalLv:null,minShips:6,required:'航戦2＋駆2＋他2',resources:{fuel:400,ammo:50,steel:50,bauxite:30},items:'開発資材 0～1 / 家具箱(小) 0～1',fuelUse:50,ammoUse:40,tags:['燃料']},
{id:'20',name:'潜水艦哨戒任務',minutes:120,flagLv:1,totalLv:null,minShips:2,required:'潜1＋軽1',resources:{fuel:0,ammo:0,steel:150,bauxite:0},items:'開発資材 0～1 / 家具箱(中) 0～1',fuelUse:50,ammoUse:40,tags:['鋼材','潜水艦']},
{id:'21',name:'北方鼠輸送作戦',minutes:140,flagLv:15,totalLv:30,minShips:5,required:'軽1＋駆4',resources:{fuel:320,ammo:270,steel:0,bauxite:0},items:'家具箱(小) 0～1',fuelUse:80,ammoUse:70,special:'ドラム缶条件あり。大成功はキラ4隻＋ドラム缶3隻4個が目安。',tags:['燃料','弾薬','ドラム缶','定番']},
{id:'22',name:'艦隊演習',minutes:180,flagLv:30,totalLv:45,minShips:6,required:'重1＋軽1＋駆2＋他2',resources:{fuel:0,ammo:10,steel:0,bauxite:0},items:'-',fuelUse:80,ammoUse:70,tags:['経験値']},
{id:'23',name:'航空戦艦運用演習',minutes:240,flagLv:50,totalLv:200,minShips:6,required:'航戦2＋駆2＋他2',resources:{fuel:0,ammo:50,steel:0,bauxite:130},items:'家具箱(中) 0～1',fuelUse:80,ammoUse:80,tags:['経験値','ボーキ']},
{id:'24',name:'北方航路海上護衛',minutes:500,flagLv:50,totalLv:200,minShips:6,required:'軽1＋(駆/海防)4＋他1',resources:{fuel:500,ammo:0,steel:0,bauxite:150},items:'高速修復材 0～1 / 開発資材 0～2',fuelUse:90,ammoUse:60,special:'ドラム缶は大成功条件に関与。キラ4隻＋ドラム缶1隻2個が目安。',tags:['燃料','ボーキ','長時間']},
{id:'35',name:'MO作戦',minutes:420,flagLv:40,totalLv:null,minShips:6,required:'空母2＋重1＋駆1＋他2',resources:{fuel:0,ammo:0,steel:240,bauxite:280},items:'開発資材 0～1 / 家具箱(小) 0～2',fuelUse:80,ammoUse:80,tags:['鋼材','ボーキ']},
{id:'36',name:'水上機基地建設',minutes:540,flagLv:30,totalLv:null,minShips:6,required:'水母2＋軽1＋駆1＋他2',resources:{fuel:480,ammo:0,steel:200,bauxite:200},items:'高速修復材 0～1 / 家具箱(中) 0～2',fuelUse:80,ammoUse:80,tags:['燃料','鋼材','ボーキ','長時間']},
{id:'37',name:'東京急行',minutes:165,flagLv:50,totalLv:200,minShips:6,required:'軽1＋駆5',resources:{fuel:0,ammo:380,steel:270,bauxite:0},items:'家具箱(小) 0～1',fuelUse:80,ammoUse:80,special:'成功: 任意3隻にドラム缶計4個以上。大成功: キラ4隻＋任意3隻に計5個以上が目安。',tags:['弾薬','鋼材','ドラム缶','定番']},
{id:'38',name:'東京急行(弐)',minutes:175,flagLv:65,totalLv:240,minShips:6,required:'駆5＋他1',resources:{fuel:420,ammo:0,steel:200,bauxite:0},items:'家具箱(小) 0～1',fuelUse:80,ammoUse:80,special:'成功: 任意4隻にドラム缶計8個以上。大成功: キラ4隻＋任意4隻に計10個以上が目安。',tags:['燃料','鋼材','ドラム缶','定番']},
{id:'41',name:'ブルネイ泊地沖哨戒',minutes:60,flagLv:30,totalLv:100,minShips:3,required:'(駆/海防)3',resources:{fuel:100,ammo:0,steel:0,bauxite:20},items:'高速修復材 0～1 / 開発資材 0～1',fuelUse:50,ammoUse:50,special:'ステータス条件あり。詳細値はWikiで確認。',tags:['燃料','短時間','バケツ']},
{id:'42',name:'ミ船団護衛(一号船団)',minutes:480,flagLv:45,totalLv:200,minShips:4,required:'軽1＋駆2＋他1',resources:{fuel:800,ammo:0,steel:0,bauxite:200},items:'高速建造材 0～3 / 家具箱(大) 0～1',fuelUse:80,ammoUse:65,monthly:true,tags:['燃料','マンスリー','長時間']},
{id:'43',name:'ミ船団護衛(二号船団)',minutes:720,flagLv:55,totalLv:300,minShips:6,required:'護衛空母1＋(駆2または海防2)＋他3',resources:{fuel:2000,ammo:0,steel:0,bauxite:400},items:'開発資材 0～4 / 改修資材 0～1',fuelUse:85,ammoUse:90,monthly:true,special:'ステータス条件あり。護衛空母の艦種判定に注意。',tags:['燃料','マンスリー','長時間']},
{id:'44',name:'航空装備輸送任務',minutes:600,flagLv:35,totalLv:210,minShips:6,required:'空母1＋水母1＋軽1＋(駆/海防)2＋他1',resources:{fuel:0,ammo:200,steel:0,bauxite:800},items:'開発資材 0～4 / 家具箱(大) 0～2',fuelUse:80,ammoUse:40,monthly:true,special:'ステータス＋ドラム缶条件あり。大成功はキラ4隻＋ドラム缶3隻8個が目安。',tags:['ボーキ','マンスリー','ドラム缶']},
{id:'45',name:'ボーキサイト船団護衛',minutes:200,flagLv:50,totalLv:240,minShips:5,required:'軽母1＋(駆/海防)4',resources:{fuel:40,ammo:0,steel:0,bauxite:220},items:'家具箱(中) 0～1',fuelUse:60,ammoUse:40,special:'ステータス条件あり。',tags:['ボーキ']},
{id:'46',name:'南西海域戦闘哨戒',minutes:210,flagLv:60,totalLv:300,minShips:5,required:'重2＋軽1＋駆2',resources:{fuel:300,ammo:0,steel:150,bauxite:380},items:'開発資材 0～3 / 改修資材 0～1',fuelUse:75,ammoUse:95,monthly:true,special:'ステータス条件あり。交戦遠征。',tags:['ボーキ','マンスリー','交戦']}
];

const HD_EXP_KEY='harbordesk-expedition-db-v1';
let hdExpGoal='all';
let hdExpSearch='';
let hdExpBigSuccess=false;

function hdExpLoadPref(){try{return JSON.parse(localStorage.getItem(HD_EXP_KEY)||'{}')}catch{return {}}}
function hdExpSavePref(){localStorage.setItem(HD_EXP_KEY,JSON.stringify({goal:hdExpGoal,big:hdExpBigSuccess}))}
function hdExpEsc(s){return typeof esc==='function'?esc(s):String(s??'')}
function hdExpTime(min){const h=Math.floor(min/60),m=min%60;return h?`${h}時間${m?`${m}分`:''}`:`${m}分`}
function hdExpMult(){return hdExpBigSuccess?1.5:1}
function hdExpResVal(x,k){return Math.round((x.resources?.[k]||0)*hdExpMult())}
function hdExpPerHour(x,k){return Math.round(hdExpResVal(x,k)*60/x.minutes)}
function hdExpGoalValue(x){if(hdExpGoal==='short')return -x.minutes;if(hdExpGoal==='monthly')return x.monthly?1:0;if(['fuel','ammo','steel','bauxite'].includes(hdExpGoal))return hdExpPerHour(x,hdExpGoal);return 0}
function hdExpResourceHtml(x){const map=[['fuel','燃'],['ammo','弾'],['steel','鋼'],['bauxite','ボ']];return map.filter(([k])=>(x.resources?.[k]||0)>0).map(([k,l])=>`<span>${l} ${hdExpResVal(x,k)}</span>`).join('')||'<span>資源報酬なし</span>'}
function hdExpEfficiencyHtml(x){if(!['fuel','ammo','steel','bauxite'].includes(hdExpGoal))return '';const label={fuel:'燃料',ammo:'弾薬',steel:'鋼材',bauxite:'ボーキ'}[hdExpGoal];return `<div class="hd-exp-eff"><b>${label} ${hdExpPerHour(x,hdExpGoal)}/h</b><span>補給消費・大発補正を含まない単純時給</span></div>`}
function hdExpMatches(x){
 const q=hdExpSearch.trim().toLowerCase();
 if(q&&!`${x.id} ${x.name} ${x.required} ${x.special||''} ${(x.tags||[]).join(' ')}`.toLowerCase().includes(q))return false;
 if(hdExpGoal==='monthly'&&!x.monthly)return false;
 if(hdExpGoal==='short'&&x.minutes>120)return false;
 if(['fuel','ammo','steel','bauxite'].includes(hdExpGoal)&&(x.resources?.[hdExpGoal]||0)<=0)return false;
 return true;
}
function hdExpWiki(){return 'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81'}
function hdExpStart(id){
 const x=HD_EXPEDITIONS.find(e=>e.id===id);if(!x)return;
 if(typeof state==='undefined'||typeof save!=='function'||typeof renderTimers!=='function'||typeof uid!=='function')return;
 state.expeditions.push({id:uid(),name:`${x.id} ${x.name}`,endsAt:Date.now()+x.minutes*60000,expeditionId:x.id});
 save();renderTimers('expedition');
 document.getElementById('expeditionList')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function hdExpCard(x){
 const level=`旗艦Lv${x.flagLv}${x.totalLv!=null?` / 合計Lv${x.totalLv}`:''}`;
 return `<article class="hd-exp-card"><div class="hd-exp-head"><div><span class="guide-tag">${hdExpEsc(x.id)}</span><strong>${hdExpEsc(x.name)}</strong>${x.monthly?'<em>月1</em>':''}</div><span class="hd-exp-time">${hdExpTime(x.minutes)}</span></div><div class="hd-exp-res">${hdExpResourceHtml(x)}</div>${hdExpEfficiencyHtml(x)}<div class="hd-exp-meta"><div><span>成功条件</span><b>${hdExpEsc(level)} / ${x.minShips}隻以上</b></div><div><span>必須艦</span><b>${hdExpEsc(x.required)}</b></div><div><span>燃弾消費</span><b>${x.fuelUse}% / ${x.ammoUse}%</b></div><div><span>アイテム</span><b>${hdExpEsc(x.items||'-')}</b></div></div>${x.special?`<div class="hd-exp-special">${hdExpEsc(x.special)}</div>`:''}<div class="hd-exp-actions"><button class="primary small" type="button" data-hd-exp-start="${x.id}">この遠征を開始</button><a class="guide-link" href="${hdExpWiki()}" target="_blank" rel="noopener">Wiki ↗</a></div></article>`
}
function hdRenderExpeditionDb(){
 const list=document.getElementById('hdExpDbList');if(!list)return;
 let rows=HD_EXPEDITIONS.filter(hdExpMatches);
 if(['fuel','ammo','steel','bauxite'].includes(hdExpGoal))rows.sort((a,b)=>hdExpGoalValue(b)-hdExpGoalValue(a)||a.minutes-b.minutes);
 else if(hdExpGoal==='short')rows.sort((a,b)=>a.minutes-b.minutes);
 else rows.sort((a,b)=>a.minutes-b.minutes);
 document.getElementById('hdExpDbCount').textContent=`${rows.length}件 / 全${HD_EXPEDITIONS.length}件`;
 list.innerHTML=rows.map(hdExpCard).join('')||'<div class="empty">条件に合う遠征がないよ</div>';
}
function hdEnsureExpeditionDb(){
 const section=document.getElementById('expeditions');if(!section||document.getElementById('hdExpeditionDb'))return;
 const pref=hdExpLoadPref();hdExpGoal=pref.goal||'all';hdExpBigSuccess=!!pref.big;
 const box=document.createElement('div');box.id='hdExpeditionDb';box.className='hd-exp-db card';
 box.innerHTML=`<div class="hd-exp-title"><div><div class="eyebrow">EXPEDITION DATABASE</div><h3>遠征データベース</h3><p class="muted">条件・時間・報酬・資源時給を確認して、そのままタイマー開始。</p></div><span id="hdExpDbCount" class="muted"></span></div><div class="hd-exp-tools"><input id="hdExpSearch" type="search" placeholder="遠征名 / ID / 艦種 / ドラム缶で検索"><label class="hd-exp-big"><input id="hdExpBig" type="checkbox" ${hdExpBigSuccess?'checked':''}> 大成功報酬で計算</label></div><div id="hdExpGoals" class="hd-exp-goals">${[['all','すべて'],['fuel','燃料'],['ammo','弾薬'],['steel','鋼材'],['bauxite','ボーキ'],['short','2時間以内'],['monthly','マンスリー']].map(([k,l])=>`<button type="button" class="ghost small${hdExpGoal===k?' active':''}" data-hd-exp-goal="${k}">${l}</button>`).join('')}</div><div class="hd-exp-note">時給は基本報酬÷時間の単純計算。艦隊の補給消費、大発・特大発などの報酬補正、ランダムアイテム期待値は含めていないよ。</div><div id="hdExpDbList" class="hd-exp-list"></div>`;
 const head=section.querySelector('.section-head');head?.after(box);
 document.getElementById('hdExpSearch').addEventListener('input',e=>{hdExpSearch=e.target.value;hdRenderExpeditionDb()});
 document.getElementById('hdExpBig').addEventListener('change',e=>{hdExpBigSuccess=e.target.checked;hdExpSavePref();hdRenderExpeditionDb()});
 hdRenderExpeditionDb();
}
document.addEventListener('click',e=>{
 const g=e.target.closest?.('[data-hd-exp-goal]');if(g){hdExpGoal=g.dataset.hdExpGoal;document.querySelectorAll('[data-hd-exp-goal]').forEach(b=>b.classList.toggle('active',b===g));hdExpSavePref();hdRenderExpeditionDb();return}
 const s=e.target.closest?.('[data-hd-exp-start]');if(s){hdExpStart(s.dataset.hdExpStart);return}
});
window.addEventListener('load',()=>setTimeout(hdEnsureExpeditionDb,120));
setTimeout(hdEnsureExpeditionDb,350);
