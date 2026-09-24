const HD_CONSTRUCTION_TIMER_KEY='harbordesk-construction-timers-v1';
const HD_CONSTRUCTION_VIEW_KEY='harbordesk-session-construction-view-v1';

const HD_CONSTRUCTION_RECIPES=[
 {id:'n-min',type:'normal',group:'駆逐・軽巡',fuel:30,ammo:30,steel:30,bauxite:30,target:['駆逐艦','軽巡洋艦'],note:'最低値。主に駆逐・軽巡。レア駆逐・レア軽巡・潜水艦は対象外。'},
 {id:'n-rare1',type:'normal',group:'レア駆逐・軽巡・潜水',fuel:250,ammo:30,steel:200,bauxite:30,target:['島風','雪風','伊58','伊168','伊8'],note:'軽巡・重巡が中心。レア駆逐・潜水艦は低確率。'},
 {id:'n-rare2',type:'normal',group:'レア駆逐・重巡',fuel:270,ammo:130,steel:330,bauxite:30,target:['島風','雪風','重巡洋艦'],note:'重巡寄り。潜水艦も候補に入る。'},
 {id:'n-sub',type:'normal',group:'潜水艦',fuel:250,ammo:130,steel:200,bauxite:30,target:['伊58','伊168','伊8'],note:'潜水艦狙いの代表例。島風・雪風の報告もある。'},
 {id:'n-bb1',type:'normal',group:'戦艦',fuel:400,ammo:30,steel:600,bauxite:30,target:['長門','陸奥','金剛型','扶桑型','伊勢型'],note:'基本的な戦艦レシピ。重巡も多く出る。'},
 {id:'n-bb2',type:'normal',group:'戦艦',fuel:400,ammo:100,steel:600,bauxite:30,target:['長門','陸奥','金剛型','扶桑型','伊勢型'],note:'戦艦レシピの代表例。鈴谷・熊野の報告もある。'},
 {id:'n-cv1',type:'normal',group:'空母',fuel:300,ammo:30,steel:400,bauxite:300,target:['正規空母','軽空母'],note:'低コスト空母レシピ。Wiki報告では正規空母割合約10%の目安。'},
 {id:'n-cv2',type:'normal',group:'空母',fuel:300,ammo:30,steel:600,bauxite:400,target:['正規空母','軽空母'],note:'報告数の多い空母レシピ。Wiki報告では正規空母割合約14.3%の目安。'},
 {id:'n-cv3',type:'normal',group:'空母',fuel:400,ammo:200,steel:500,bauxite:400,target:['正規空母','軽空母'],note:'大規模報告のある空母レシピ。報告値は実確率を保証しない。'},
 {id:'l-yamato',type:'large',group:'大和型・大型戦艦',fuel:4000,ammo:6000,steel:6000,bauxite:2000,dev:20,target:['大和','武蔵','Bismarck','伊401','あきつ丸'],secretary:'BismarckはZ1/Z3など個別秘書艦条件あり',note:'大型建造の代表例。報告比率は実確率ではない。資源に十分な余裕がある時だけ推奨。'},
 {id:'l-musashi',type:'large',group:'大和型・大型戦艦',fuel:6000,ammo:5000,steel:7000,bauxite:2000,dev:20,target:['大和','武蔵'],note:'大和型報告が多い高コスト例。結果には大きな偏りがある。'},
 {id:'l-taiho1',type:'large',group:'大鳳・空母',fuel:4000,ammo:2000,steel:5000,bauxite:5500,dev:20,target:['大鳳','翔鶴','瑞鶴','あきつ丸'],note:'大鳳狙いの代表例の一つ。Wiki集計は報告比率であり実確率ではない。'},
 {id:'l-taiho2',type:'large',group:'大鳳・空母',fuel:4000,ammo:2000,steel:5000,bauxite:7000,dev:20,target:['大鳳','翔鶴','瑞鶴','あきつ丸'],note:'ボーキ多めの大型空母レシピ。資源消費が非常に大きい。'},
 {id:'l-min',type:'large',group:'大型最低値',fuel:1500,ammo:1500,steel:2000,bauxite:1000,dev:1,target:['まるゆ','阿賀野型','三隈ほか'],note:'大型艦建造の最低投入量。大型建造限定艦の一部を狙う低コスト運用向け。'}
];

const HD_CONSTRUCTION_TIMES=[
 {min:17,label:'00:17',kind:'潜水艦',ships:[],large:['まるゆ']},
 {min:18,label:'00:18',kind:'駆逐艦',ships:['睦月型'],large:[]},
 {min:20,label:'00:20',kind:'駆逐艦',ships:['吹雪型','綾波型','暁型','初春型'],large:[]},
 {min:22,label:'00:22',kind:'駆逐艦 / 潜水艦',ships:['白露型','朝潮型','伊168','伊58','伊8'],large:[]},
 {min:24,label:'00:24',kind:'駆逐艦',ships:['陽炎','不知火','黒潮','雪風','秋雲','Z1','Z3'],large:[]},
 {min:30,label:'00:30',kind:'駆逐艦',ships:['島風'],large:[]},
 {min:60,label:'01:00',kind:'軽巡 / 重巡',ships:['天龍型','球磨型','長良型','川内型','古鷹型','青葉型'],large:['阿賀野','能代','矢矧']},
 {min:70,label:'01:10',kind:'練巡 / 重巡',ships:['香取'],large:['鹿島','Zara','Pola']},
 {min:75,label:'01:15',kind:'軽巡',ships:['鬼怒','阿武隈'],large:[]},
 {min:80,label:'01:20',kind:'重巡',ships:['妙高型'],large:[]},
 {min:82,label:'01:22',kind:'軽巡',ships:['夕張'],large:[]},
 {min:85,label:'01:25',kind:'重巡',ships:['高雄型'],large:[]},
 {min:90,label:'01:30',kind:'重巡',ships:['利根','筑摩','最上','鈴谷','熊野'],large:['三隈']},
 {min:120,label:'02:00',kind:'軽空母',ships:['鳳翔'],large:[]},
 {min:140,label:'02:20',kind:'水母 / 補給艦',ships:['千歳','千代田'],large:['瑞穂','神威']},
 {min:150,label:'02:30',kind:'強襲揚陸艦',ships:[],large:['あきつ丸']},
 {min:160,label:'02:40',kind:'軽空母',ships:['祥鳳','瑞鳳'],large:[]},
 {min:170,label:'02:50',kind:'軽空母',ships:['龍驤'],large:[]},
 {min:180,label:'03:00',kind:'軽空母',ships:['飛鷹','隼鷹'],large:[]},
 {min:200,label:'03:20',kind:'潜水空母',ships:[],large:['伊400','伊401']},
 {min:210,label:'03:30',kind:'正規空母',ships:[],large:['天城','葛城']},
 {min:220,label:'03:40',kind:'補給艦 / 工作艦',ships:[],large:['速吸','明石']},
 {min:240,label:'04:00',kind:'戦艦 / 正規空母',ships:['金剛','比叡','榛名','霧島'],large:['Aquila']},
 {min:250,label:'04:10',kind:'正規空母',ships:['蒼龍','飛龍'],large:['Ark Royal']},
 {min:260,label:'04:20',kind:'戦艦 / 正規空母',ships:['扶桑','山城','加賀'],large:[]},
 {min:270,label:'04:30',kind:'戦艦 / 正規空母',ships:['伊勢','日向','赤城'],large:['Graf Zeppelin']},
 {min:280,label:'04:40',kind:'戦艦',ships:[],large:['Warspite','Valiant']},
 {min:300,label:'05:00',kind:'戦艦',ships:['長門','陸奥'],large:['Bismarck','Richelieu','Jean Bart']},
 {min:330,label:'05:30',kind:'正規空母',ships:[],large:['Saratoga']},
 {min:360,label:'06:00',kind:'正規空母',ships:['翔鶴','瑞鶴'],large:[]},
 {min:400,label:'06:40',kind:'装甲空母',ships:[],large:['大鳳']},
 {min:480,label:'08:00',kind:'戦艦',ships:[],large:['大和','武蔵']},
 {min:500,label:'08:20',kind:'戦艦',ships:[],large:['Iowa']}
];

let hdConstructionMode='normal';
function hdConstructionViewLoad(){try{return JSON.parse(sessionStorage.getItem(HD_CONSTRUCTION_VIEW_KEY)||'{}')||{}}catch{return {}}}
function hdConstructionViewSave(patch={}){const next={...hdConstructionViewLoad(),...patch};try{sessionStorage.setItem(HD_CONSTRUCTION_VIEW_KEY,JSON.stringify(next))}catch{}return next}
{
 const saved=hdConstructionViewLoad(),mode=String(saved.mode||'');
 if(['normal','large','time'].includes(mode))hdConstructionMode=mode;
}

function hdConstructionEsc(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdConstructionOwnedSet(){
 try{return new Set((JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]).map(x=>String(x.name||x.ship||'').trim()).filter(Boolean))}catch{return new Set()}
}
function hdConstructionTimers(){try{return JSON.parse(localStorage.getItem(HD_CONSTRUCTION_TIMER_KEY)||'[]')||[]}catch{return []}}
function hdSaveConstructionTimers(v){localStorage.setItem(HD_CONSTRUCTION_TIMER_KEY,JSON.stringify(v))}
function hdConstructionNotify(){try{if(typeof hdCCRender==='function')hdCCRender();if(typeof renderHomeDashboard==='function')renderHomeDashboard();window.dispatchEvent(new CustomEvent('hd:workspace-refresh'))}catch{}}
function hdConstructionFmt(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function hdConstructionCost(r){return `${r.fuel}/${r.ammo}/${r.steel}/${r.bauxite}${r.dev!=null?`｜開発資材 ${r.dev}`:''}`}
function hdConstructionTargets(r){
 const owned=hdConstructionOwnedSet();return r.target.map(n=>`<span class="${owned.has(n)?'owned':''}">${hdConstructionEsc(n)}${owned.has(n)?' ✓':''}</span>`).join('');
}
function hdEnsureConstructionSection(){
 if(document.getElementById('constructionDb'))return;
 const anchor=document.getElementById('developmentRecipeBook')||document.getElementById('equipmentBook')||document.getElementById('resources');if(!anchor)return;
 const s=document.createElement('section');s.id='constructionDb';s.className='advanced-section hd-construction-section';
 s.innerHTML=`<div class="section-head"><div><div class="eyebrow">ARSENAL / SHIPBUILDING</div><h2>建造データベース</h2></div><span class="muted">通常建造・大型建造・時間逆引き</span></div>
 <div class="hd-construction-warning">建造レシピは結果を保証しないよ。特に大型建造の集計値は有志報告の比率で、実際の出現確率ではない。資源に余裕を持って使ってね。</div>
 <div class="hd-construction-toolbar"><div class="hd-construction-tabs"><button class="active" data-hd-build-mode="normal">通常建造</button><button data-hd-build-mode="large">大型艦建造</button><button data-hd-build-mode="time">建造時間</button></div><input id="hdConstructionSearch" type="search" placeholder="艦名・艦種・レシピで検索"></div>
 <div id="hdConstructionBody"></div><div id="hdConstructionTimers" class="hd-build-timers"></div>`;
 anchor.insertAdjacentElement('afterend',s);
 const view=hdConstructionViewLoad(),input=s.querySelector('#hdConstructionSearch');
 if(['normal','large','time'].includes(String(view.mode||'')))hdConstructionMode=String(view.mode);
 if(input)input.value=String(view.query||'');
 renderConstructionDb();
}
function hdConstructionOpenSearch(query,mode='normal'){
 hdEnsureConstructionSection();
 if(['normal','large','time'].includes(String(mode||'')))hdConstructionMode=String(mode);
 const input=document.getElementById('hdConstructionSearch'),target=document.getElementById('constructionDb');
 if(!input||!target)return false;
 input.value=String(query||'');
 hdConstructionViewSave({query:input.value,mode:hdConstructionMode});
 renderConstructionDb();
 if(typeof window.hdWSShowElement==='function')window.hdWSShowElement(target,true);
 else target.scrollIntoView?.({behavior:'smooth',block:'start'});
 return true;
}
window.hdConstructionOpenSearch=hdConstructionOpenSearch;
function renderConstructionDb(){
 const body=document.getElementById('hdConstructionBody');if(!body)return;
 const q=(document.getElementById('hdConstructionSearch')?.value||'').trim().toLowerCase();
 document.querySelectorAll('[data-hd-build-mode]').forEach(b=>b.classList.toggle('active',b.dataset.hdBuildMode===hdConstructionMode));
 if(hdConstructionMode==='time'){
  const rows=HD_CONSTRUCTION_TIMES.filter(x=>!q||`${x.label} ${x.kind} ${x.ships.join(' ')} ${x.large.join(' ')}`.toLowerCase().includes(q));
  body.innerHTML=`<div class="hd-build-time-grid">${rows.map(x=>`<article class="hd-build-time-card"><div class="hd-build-time-head"><strong>${x.label}</strong><span>${hdConstructionEsc(x.kind)}</span></div>${x.ships.length?`<p><b>通常:</b> ${hdConstructionEsc(x.ships.join(' / '))}</p>`:''}${x.large.length?`<p><b>大型:</b> ${hdConstructionEsc(x.large.join(' / '))}</p>`:''}<button class="primary small" data-hd-build-timer="${x.min}" data-hd-build-label="${x.label}">この時間でタイマー開始</button></article>`).join('')||'<div class="empty">該当する建造時間がないよ</div>'}</div>`;
 }else{
  const rows=HD_CONSTRUCTION_RECIPES.filter(r=>r.type===hdConstructionMode&&(!q||`${r.group} ${r.target.join(' ')} ${r.note||''} ${r.secretary||''} ${hdConstructionCost(r)}`.toLowerCase().includes(q)));
  body.innerHTML=`<div class="hd-build-grid">${rows.map(r=>`<article class="hd-build-card"><div class="hd-build-card-head"><div><strong>${hdConstructionEsc(r.group)}</strong><span>${r.type==='large'?'大型艦建造':'通常建造'}</span></div><button class="ghost small" data-hd-copy-build="${r.id}">資材をコピー</button></div><div class="hd-build-cost"><span>燃 ${r.fuel}</span><span>弾 ${r.ammo}</span><span>鋼 ${r.steel}</span><span>ボ ${r.bauxite}</span>${r.dev!=null?`<span>開発 ${r.dev}</span>`:''}</div><div class="hd-build-targets">${hdConstructionTargets(r)}</div>${r.secretary?`<p><b>秘書艦:</b> ${hdConstructionEsc(r.secretary)}</p>`:''}<p>${hdConstructionEsc(r.note||'')}</p></article>`).join('')||'<div class="empty">条件に合うレシピがないよ</div>'}</div>`;
 }
 renderConstructionTimers();
}
function renderConstructionTimers(){
 const host=document.getElementById('hdConstructionTimers');if(!host)return;const rows=hdConstructionTimers().sort((a,b)=>a.endsAt-b.endsAt),now=Date.now();
 host.innerHTML=rows.length?`<div class="hd-build-timer-title"><strong>建造タイマー</strong><span>${rows.length}件</span></div>${rows.map(t=>`<div class="hd-build-timer-row ${t.endsAt<=now?'done':''}"><div><strong>${hdConstructionEsc(t.name)}</strong><span data-hd-build-end="${t.endsAt}">${hdConstructionFmt(t.endsAt-now)}</span></div><button class="icon-btn" data-hd-build-delete="${t.id}">×</button></div>`).join('')}`:'';
}
function hdStartConstructionTimer(min,label){
 const rows=hdConstructionTimers();rows.push({id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2),name:`建造 ${label}`,endsAt:Date.now()+Number(min)*60000});hdSaveConstructionTimers(rows);renderConstructionTimers();hdConstructionNotify();
}
async function hdCopyConstructionRecipe(id){
 const r=HD_CONSTRUCTION_RECIPES.find(x=>x.id===id);if(!r)return;const text=hdConstructionCost(r);try{await navigator.clipboard.writeText(text)}catch{};alert(`コピーしたよ: ${text}`)
}
document.addEventListener('click',e=>{
 const mode=e.target.closest?.('[data-hd-build-mode]');if(mode){hdConstructionMode=mode.dataset.hdBuildMode;hdConstructionViewSave({mode:hdConstructionMode});renderConstructionDb();return}
 const copy=e.target.closest?.('[data-hd-copy-build]');if(copy){hdCopyConstructionRecipe(copy.dataset.hdCopyBuild);return}
 const timer=e.target.closest?.('[data-hd-build-timer]');if(timer){hdStartConstructionTimer(timer.dataset.hdBuildTimer,timer.dataset.hdBuildLabel);return}
 const del=e.target.closest?.('[data-hd-build-delete]');if(del){hdSaveConstructionTimers(hdConstructionTimers().filter(x=>x.id!==del.dataset.hdBuildDelete));renderConstructionTimers();hdConstructionNotify();return}
});
document.addEventListener('input',e=>{if(e.target.id==='hdConstructionSearch'){hdConstructionViewSave({query:e.target.value});renderConstructionDb()}});
setInterval(()=>{
 document.querySelectorAll('[data-hd-build-end]').forEach(el=>{const left=Number(el.dataset.hdBuildEnd)-Date.now();el.textContent=hdConstructionFmt(left);el.closest('.hd-build-timer-row')?.classList.toggle('done',left<=0)})
},1000);
window.addEventListener('load',()=>setTimeout(hdEnsureConstructionSection,260));
