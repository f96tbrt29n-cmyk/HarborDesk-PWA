const MAP_PLANS={
 '1-2':{presets:[{name:'軽量5隻・軽巡1＋駆逐4',ships:'軽巡1＋駆逐4',gear:'主砲2本で夜戦連撃を準備。5隻編成を維持。',use:'通常攻略・AE（この編成では低速可）',source:'https://zekamashi.net/kancolle-kouryaku/1-2/'}],quests:[],routeBranches:{path:'AE',checkedAt:'2026-10-13',sources:['https://zekamashi.net/kancolle-kouryaku/1-2/','https://zh.kcwiki.cn/wiki/镇守府海域/1-2'],checks:[
  {id:'start-A',label:'始点→A',condition:{all:[{kind:'fleetCount',min:4,max:5},{kind:'typeCount',types:['駆逐','海防艦'],min:4,max:4}]},next:'4〜5隻にし、駆逐＋海防をちょうど4隻にする。自由枠には駆逐・海防以外を選ぶ。'},
  {id:'A-E',label:'A→E',condition:{any:[{kind:'minSpeed',rank:10},{all:[{kind:'typeCount',types:['軽巡'],min:1,max:1},{kind:'typeCount',types:['駆逐'],min:4,max:4}]},{all:[{kind:'typeCount',types:['軽巡'],min:1,max:1},{kind:'typeCount',types:['駆逐','海防艦'],min:4,max:4},{kind:'unverified',reason:'低速の軽巡＋海防混在編成は資料の記述が一致しないため未判定'}]}]},next:'高速統一、または軽巡1＋駆逐4へ変更する。高速化装備は艦別の必要セットと所持数を確認する。'}
 ],speedFallback:{rank:10,unless:[{all:[{kind:'typeCount',types:['軽巡'],min:1,max:1},{kind:'typeCount',types:['駆逐'],min:4,max:4}]},{all:[{kind:'typeCount',types:['軽巡'],min:1,max:1},{kind:'typeCount',types:['駆逐','海防艦'],min:4,max:4}]}]}}},
 '1-3':{presets:[{name:'軽空母2＋駆逐4',ships:'軽空母2＋駆逐4',gear:'艦戦と攻撃機を準備。駆逐は夜戦連撃。',use:'通常攻略・CFJ',source:'https://zekamashi.net/kancolle-kouryaku/1-3/'}],quests:[]},
 '1-4':{presets:[{name:'空母2＋駆逐4',ships:'空母系2＋駆逐4',gear:'艦戦と攻撃機で制空を確保。駆逐4隻を維持。',use:'通常攻略・ボス方面（経由マスは複数）',source:'https://zekamashi.net/kancolle-kouryaku/1-4/'}],quests:[]},
 '1-6':{presets:[{name:'下ルート・軽巡1＋駆逐5',ships:'軽巡1＋駆逐5',gear:'対空カットイン・対潜装備を準備。航空戦と旗艦の損傷を確認。',use:'通常攻略・下ルート AEGFBN',source:'https://zekamashi.net/kancolle-kouryaku/1-6/'}],quests:[]},
 '1-5':{
  presets:[
   {name:'海防艦4隻',ships:'海防艦4',gear:'ソナー＋爆雷系。先制対潜の可否は装備と対潜値で確認。',use:'月次EO・ADEJ',source:'https://zekamashi.net/kancolle-kouryaku/1-5/'},
   {name:'砲撃二巡型',ships:'航空戦艦1＋駆逐3',gear:'航空戦艦は瑞雲系など、他3隻は対潜装備。',use:'月次EO・ADFGJ（航空戦艦で砲撃二巡）',source:'https://zekamashi.net/kancolle-kouryaku/1-5/'},
   {name:'駆逐4隻',ships:'駆逐4',gear:'ソナー＋爆雷系。先制対潜の可否は装備と対潜値で確認。',use:'月次EO・ADFGJ',source:'https://zekamashi.net/kancolle-kouryaku/1-5/'}
  ],
  quests:[
   {name:'海上輸送路の安全確保に努めよ！',kind:'ウィークリー',condition:'1-5ボスA勝利以上×3'},
   {name:'海上護衛強化月間',kind:'マンスリー',condition:'1-5ボスA勝利以上×10'}
  ]
 },
 '2-5':{
  presets:[
   {name:'北ルート型',ships:'航空戦艦1＋航巡2＋重巡3',gear:'低速艦を含める（高速化しない）。別々の2隻にドラム缶を1個ずつ。索敵33式係数1で49以上を確認。',use:'北ルート・BFJO（低速艦・ドラム缶2隻が必要）',source:'https://zekamashi.net/kancolle-kouryaku/2-5/'},
   {name:'南ルート型',ships:'正規空母1＋軽空母1＋軽巡1＋駆逐3（高速統一）',gear:'艦戦＋偵察機・電探。高速統一、索敵33式係数1で34以上を確認（司令部Lv119以下は余裕を取る）。',use:'通常攻略・CEIO',source:'https://zekamashi.net/kancolle-kouryaku/2-5/'}
  ],
  quests:[
   {name:'第五戦隊出撃せよ！',kind:'マンスリー',condition:'指定重巡を含む艦隊で2-5ボスS勝利'},
   {name:'「水上反撃部隊」突入せよ！',kind:'マンスリー',condition:'指定艦種編成で2-5ボスS勝利'}
  ]
 },
 '3-2':{
  presets:[
   {name:'軽巡1＋駆逐5',ships:'軽巡1＋駆逐5',gear:'電探を複数艦に。高速以上を意識。',use:'代表的な通常攻略'},
   {name:'駆逐6',ships:'駆逐6',gear:'火力・雷装・回避を重視。必要に応じ電探。',use:'軽巡を使わない水雷戦隊'}
  ],quests:[]
 },
 '4-3':{
  presets:[
   {name:'対地攻略型',ships:'重巡級/航巡・空母系・軽巡/駆逐を組み合わせる',gear:'三式弾、WG系、内火艇など対地装備。',use:'港湾棲姫対策'},
   {name:'任務兼用型',ships:'任務指定艦＋自由枠で火力と制空を補う',gear:'対地装備を必ず準備。',use:'4-3指定の出撃任務'}
  ],quests:[]
 },
 '4-5':{
  presets:[
   {name:'高速+中央最短',ships:'戦艦級・空母系・重巡級などを高速+統一',gear:'缶＋タービンで高速+化。対地装備も用意。',use:'中央最短ルート候補'},
   {name:'通常速度・重量型',ships:'戦艦級・空母系を中心に編成',gear:'艦戦で制空、三式弾など対地装備。',use:'補強増設や高速+装備が不足している場合'}
  ],quests:[]
 },
 '5-5':{
  presets:[
   {name:'重量編成',ships:'戦艦級＋空母系を軸に高火力6隻',gear:'艦戦・偵察機・索敵装備。特殊砲撃も候補。',use:'EO攻略の火力重視'},
   {name:'中央/下ルート型',ships:'任務条件や手持ちに合わせた軽量寄り編成',gear:'索敵値を必ず確認。',use:'重量ルートを避けたい場合'}
  ],quests:[]
 },
 '6-5':{
  presets:[
   {name:'上ルート型',ships:'戦艦級1＋空母系2＋航巡1＋軽巡1＋駆逐1',gear:'艦戦・偵察機・電探・対空装備。本隊制空と基地航空隊2部隊を準備。索敵33式係数3で50以上を確認。',use:'通常攻略・ACDGM',source:'https://zekamashi.net/kancolle-kouryaku/6-5/'},
   {name:'下ルート型',ships:'戦艦級2＋航巡1＋軽巡1＋駆逐2',gear:'水戦・偵察機・夜戦装備・対潜・対空装備と基地航空隊2部隊を準備。索敵33式係数3で35以上を確認。空母・雷巡は採用しない。',use:'通常攻略・BFIJM',source:'https://zekamashi.net/kancolle-kouryaku/6-5/'}
  ],quests:[]
 },
 '7-5':{
  presets:[
   {name:'段階別攻略',ships:'ギミック/第1/第2/第3ゲージごとに編成を切替',gear:'対潜・対地・制空など各段階に合わせる。',use:'7-5通常攻略'},
   {name:'任務対応',ships:'任務指定艦を満たしつつ不足火力を自由枠で補う',gear:'現在のゲージ段階に必要な装備を優先。',use:'7-5指定任務'}
  ],quests:[]
 }
};

// Explicit examples for automatic selection. Descriptive fleet prose is not a count specification.
const HD_MAP_FLEET_EXAMPLES={
 '1-1':[['駆逐4','通常攻略・AC（ボス分岐はランダム）']],
 '2-1':[['正規空母1＋空母系1＋重巡2＋軽巡2','通常攻略・C(E)DH']],
 '2-2':[['正規空母1＋軽空母1＋重巡2＋軽巡1＋水母1','通常攻略・CE(GH)K']],
 '2-3':[['戦艦級1＋正規空母1＋軽空母1＋重巡2＋水母1','通常攻略・ルート固定なし']],
 '2-4':[['戦艦級1＋正規空母1＋軽空母1＋重巡2＋軽巡1','通常攻略・ルートにランダム分岐あり']],
 '3-1':[['正規空母2＋重巡1＋雷巡1＋駆逐2','通常攻略・CFG']],
 '3-3':[['正規空母1＋軽空母1＋重巡2＋駆逐2','通常攻略・ACGM']],
 '3-4':[['戦艦級1＋正規空母2＋軽空母1＋軽巡1＋水母1','通常攻略・ACEGJP']],
 '3-5':[['軽巡1＋駆逐5','下ルート・FGK'],['正規空母3＋重巡1＋雷巡1＋駆逐1','上ルート・BDHK']],
 '4-1':[['正規空母2＋重巡3＋駆逐1','通常攻略・CFDGJ/ABDGJ']],
 '4-2':[['正規空母2＋軽巡1＋駆逐3','通常攻略・ACL/BDCL（初手ランダム）'],['空母系2＋駆逐4','駆逐4隻型・ACL/BDCL（初手ランダム）']],
 '4-3':[['正規空母2＋重巡2＋駆逐2','対地攻略・CDHN/CFHN（ボス前逸れあり）']],
 '4-4':[['戦艦級1＋正規空母2＋重巡1＋駆逐2','通常攻略・AEIK']],
 '4-5':[['戦艦級1＋正規空母2＋軽空母1＋航巡2（高速+統一）','高速+最短・ADHT/CDHT'],['戦艦級2＋重巡2＋正規空母1＋軽空母1','中央ルート・ADHKT/CDHKT'],['正規空母1＋軽空母1＋軽巡1＋駆逐3','軽量最短・ADHT/CDHT']],
 '5-1':[['戦艦級1＋軽空母1＋重巡1＋軽巡1＋駆逐2','通常攻略・BCFJ']],
 '5-2':[['空母系2＋戦艦級2＋航巡1＋重巡1','通常攻略・BCEFO（索敵要確認）']],
 '5-3':[['高速戦艦1＋重巡1＋雷巡1＋軽巡1＋駆逐2','通常攻略・DGIOKEQ']],
 '5-4':[['高速戦艦2＋航巡2＋駆逐2','通常攻略・索敵と電探を確認']],
 '5-5':[['戦艦級2＋正規空母2＋重巡級2','上ルート・索敵要確認'],['戦艦級2＋航巡1＋軽巡1＋駆逐2','中央下ルート・索敵要確認']],
 '5-6':[['航空戦艦2＋駆逐4','第1輸送ゲージ・G（輸送装備と索敵を確認）'],['正規空母2＋航巡1＋軽巡1＋駆逐2（高速統一）','第2戦力ゲージ・N'],['戦艦級2＋正規空母1＋軽巡1＋駆逐2（高速統一）','第3戦力ゲージ・Z（R到達ギミックは別編成）']],
 '6-1':[['軽巡1＋潜水艦4＋潜水母艦1','通常攻略・AFGHK（索敵要確認）']],
 '6-2':[['戦艦級1＋正規空母1＋雷巡2＋駆逐2','通常攻略・索敵で分岐']],
 '6-3':[['軽巡1＋駆逐4＋水母1','通常攻略・ACEGHJ']],
 '6-4':[['軽巡1＋高速戦艦1＋航巡1＋駆逐3（高速統一）','左ルート・BDCFN（軽巡旗艦）','軽巡']],
 '7-1':[['軽巡1＋駆逐4','通常攻略・DEGHK']],
 '7-2':[['軽巡1＋駆逐3','第1ゲージ・CEG'],['高速戦艦1＋正規空母1＋軽空母1＋雷巡1＋駆逐2（高速統一）','第2ゲージ・BCDIM']],
 '7-3':[['羽黒1＋駆逐3','第1ゲージ・ACE（羽黒必須）'],['羽黒1＋足柄1＋航巡1＋駆逐3','第2ゲージ・史実艦ルート（索敵要確認）']],
 '7-4':[['航空戦艦1＋重巡1＋雷巡1＋駆逐2＋海防艦1','通常攻略・ABEJLP（索敵・対潜・基地を確認）']],
 '7-5':[['航巡1＋雷巡1＋軽巡1＋駆逐2＋水母1','第1ゲージ・K'],['戦艦級1＋航巡1＋軽巡1＋駆逐3','第2ゲージ・Q（対地装備）'],['軽空母1＋航巡2＋軽巡1＋駆逐2','第3ゲージ・T（この編成は低速可）']]
};
Object.entries(HD_MAP_FLEET_EXAMPLES).forEach(([map,examples])=>{
 const detail=(typeof MAP_DETAILS!=='undefined'&&MAP_DETAILS[map])||(typeof MAP_DETAILS_34!=='undefined'&&MAP_DETAILS_34[map])||(typeof MAP_DETAILS_57!=='undefined'&&MAP_DETAILS_57[map])||{};
 const old=MAP_PLANS[map]||{};
 MAP_PLANS[map]={...old,presets:examples.map(([ships,use,flagship],i)=>({name:use.split('・')[0]+' '+(i+1),ships,use,flagship,gear:(map==='3-5'?(i===0?'対潜・夜戦装備。索敵33式係数4で28以上を確認。':'空母の艦戦で制空を確保。索敵33式係数4で40以上を確認。'):old.presets?.[i]?.gear)||detail.air||'制空・索敵と海域別の必要装備を確認。',source:'https://zekamashi.net/kancolle-kouryaku/'+map+'/'})),quests:old.quests||[]};
});

function hdPlanSourceHtml(preset){try{const url=new URL(preset?.source||'');if(!['https:','http:'].includes(url.protocol))return '';return '<a href="'+planEsc(url.href)+'" target="_blank" rel="noopener noreferrer">編成条件の出典</a>'}catch{return ''}}
function planEsc(s){return typeof esc==='function'?esc(s):String(s)}
function genericPlan(map){
 const d=(typeof MAP_DETAILS!=='undefined'&&MAP_DETAILS[map])||(typeof MAP_DETAILS_34!=='undefined'&&MAP_DETAILS_34[map])||(typeof MAP_DETAILS_57!=='undefined'&&MAP_DETAILS_57[map]);
 if(!d)return null;
 return {presets:[{name:'基本編成',ships:d.fleet||d.formation||'海域攻略情報を参照',gear:d.air||'装備条件は海域攻略情報を参照',use:'通常攻略'}],quests:[]};
}
function renderPlans(map){
 const host=document.getElementById('mapExtraPanel'); if(!host)return;
 const p=MAP_PLANS[map]||genericPlan(map); if(!p){host.innerHTML='';return}
 const presets=(p.presets||[]).map((x,i)=>`<div class="plan-card"><div class="plan-title">編成例 ${i+1}｜${planEsc(x.name)}</div><div><b>艦隊:</b> ${planEsc(x.ships)}</div><div><b>装備:</b> ${planEsc(x.gear)}</div><div><b>用途:</b> ${planEsc(x.use)}</div>${hdPlanSourceHtml(x)?`<div>${hdPlanSourceHtml(x)}</div>`:''}</div>`).join('');
 const quests=(p.quests||[]).length?(p.quests||[]).map(q=>`<div class="quest-related"><span class="quest-kind">${planEsc(q.kind)}</span><div><b>${planEsc(q.name)}</b><div>${planEsc(q.condition)}</div></div></div>`).join(''):'<div class="muted">この海域の関連任務は、現在アプリ内データを整理中。</div>';
 host.innerHTML=`<section class="map-extra-section"><h4>編成例</h4>${presets}<h4>関連任務</h4>${quests}</section>`;
}

window.hdRenderMapPlans=renderPlans;

// Share explicit route choices across the guide and owned-fleet tools.
// Verified route graphs are separate from the unchanged 37-map / 53-example registry.
(()=>{
 const ae=MAP_PLANS['1-2'].routeBranches;
 ae.schemaVersion=2;ae.graph={start:'start',target:'E',nodes:{start:[{conditionRef:'start-A',to:['A']}],A:[{conditionRef:'A-E',to:['E']}]}};
 ae.checks[0].from='start';ae.checks[0].to=['A'];ae.checks[1].from='A';ae.checks[1].to=['E'];
 const count=(types,min,max=6)=>({kind:'typeCount',types,min,max}),speed=rank=>({kind:'minSpeed',rank}),radar=min=>({kind:'equipmentShips',match:'radar',slotPolicy:'valid',min,max:6}),all=(...xs)=>({all:xs}),not=x=>({not:x});
 const rule=(condition,to,random=false)=>({condition,to,random,state:'verified'}),always={kind:'always'};
 MAP_PLANS['1-3'].routeBranches={schemaVersion:2,path:'CFJ / A(DB)EFJ',checkedAt:'2026-10-13',sources:['https://zekamashi.net/kancolle-kouryaku/1-3/','https://wikiwiki.jp/kancolle/鎮守府海域/1-3'],coverage:'6隻・軽空母/軽巡/駆逐のみ・駆逐4以上のボス経路。その他の編成と戦闘勝利は未保証',defaultGoal:'normal',goals:{
  normal:{label:'ボス方面・ランダム経由を許容',path:'CFJ / A(DB)EFJ',checks:[],speed:0,radar:0,allowed:['start','A','B','C','D','E','F','J'],next:'軽空母を1隻以上含めるとCFJ。空母なしでは始点とAの経由がランダム。'},
  cfj:{label:'CFJ固定・軽空母入り',path:'CFJ',checks:[{id:'carrier-start',label:'始点→Cの軽空母',condition:count(['軽空母'],1),next:'軽空母を1隻以上編成する。低速でも可。手持ちで無理ならランダム経由を許容する目標を選び直す。'}],speed:0,radar:0,allowed:['start','C','F','J']}
 },notRequired:{scouting:'この登録経路に数値索敵の分岐条件なし。',air:'この登録経路に敵航空機なし。航空戦力・戦闘勝利の判定とは区別する。'},checks:[
  {id:'six-ships',label:'登録した編成の隻数',condition:{kind:'fleetCount',min:6,max:6},next:'この登録範囲は6隻。少数編成の別経路は未登録のため別途確認する。'},
  {id:'registered-types',label:'登録した艦種の範囲',condition:count(['軽空母','軽巡','駆逐'],6,6),next:'軽空母・軽巡・駆逐のみの6隻へ変更する。他艦種の経路は別途確認する。'},
  {id:'boss-dd',label:'F→Jの駆逐艦',from:'F',to:['J'],condition:count(['駆逐'],4),next:'駆逐を4隻以上にする。他の固定条件・H経由は未登録のため別途確認する。'}
 ],graph:{start:'start',target:'J',nodes:{
  start:[rule(count(['空母'],1),['C']),rule(always,['A','C'],true)],
  A:[rule(count(['駆逐'],4),['D','E'],true)],C:[rule(always,['F'])],D:[rule(always,['B'])],B:[rule(always,['E'])],E:[rule(always,['F'])],F:[{conditionRef:'boss-dd',to:['J'],state:'verified'}]
 }}};
 MAP_PLANS['3-2'].routeBranches={schemaVersion:2,path:'C…L',checkedAt:'2026-10-13',sources:['https://zekamashi.net/kancolle-kouryaku/3-2/','https://zh.kcwiki.cn/wiki/北方海域/3-2'],coverage:'登録したボス経路の分岐。戦闘勝利・大破進撃の安全性は保証しない',defaultGoal:'normal',goals:{
  normal:{label:'通常・H経由を許容',next:'補給艦を外して軽巡1＋駆逐5または駆逐6へ変更する。H回避を選ぶ場合は全艦が高速＋へ到達できるか確認する。',path:'CG(H)FL / CEFL',checks:[],speed:0,radar:0,allowed:['start','C','E','G','H','F','L']},
  fastPlus:{label:'H回避・高速＋以上',path:'CEFL / CGFL',checks:[{id:'speed-goal',label:'高速＋統一',condition:speed(15),next:'各艦に有効な缶・タービンのセットを配備する。'},{id:'radar-goal',label:'電探装備艦',condition:radar(1),next:'電探を搭載できる艦の有効スロットに1個以上配備する。'}],speed:15,radar:1,allowed:['start','C','E','G','F','L']},
  fastest:{label:'CEFL固定・最速',path:'CEFL',checks:[{id:'speed-goal',label:'最速統一',condition:speed(20),next:'最速に到達できる艦と必要な缶・改修値・スロットを確認する。'},{id:'radar-goal',label:'電探装備艦4隻',condition:radar(4),next:'4隻それぞれの有効スロットに電探を配備する。同じ艦の複数電探は1隻と数える。'}],speed:20,radar:4,allowed:['start','C','E','F','L']}
 },notRequired:{scouting:'この登録経路には数値索敵の分岐条件なし。電探装備艦数とは区別する。',air:'この登録ボス経路に航空戦なし。別経路は対象外。'},checks:[
  {id:'six-ships',label:'ボス経路の隻数',condition:{kind:'fleetCount',min:6,max:6},next:'6隻にする。5隻以下ではHからIへ逸れる。'},
  {id:'boss-types',label:'登録ボス経路の艦種',condition:all(count(['軽巡','駆逐','補給艦'],6,6),count(['軽巡'],0,1),count(['駆逐'],4,6)),next:'軽巡1＋駆逐5、または駆逐6を基本にする。補給艦を使う場合はランダムな逸れ先も再確認する。'}
 ],graph:{start:'start',target:'L',terminals:{A:'nonboss',D:'nonboss',I:'nonboss',J:'nonboss',L:'boss'},nodes:{
  start:[rule(count(['戦艦','空母'],1),['C']),rule(count(['駆逐'],6,6),['C']),rule(all(count(['軽巡'],1,1),count(['駆逐'],4)),['C']),rule(always,['A'])],
  C:[rule(count(['駆逐'],0,3),['A']),rule(count(['戦艦','正規空母'],2),['A']),rule(count(['潜水艦'],1),['A','G'],true),rule(not(speed(10)),['G']),rule({...radar(0),max:0},['G']),rule(count(['軽巡','駆逐','補給艦'],0,5),['G']),rule(all(speed(20),radar(4)),['E']),rule(speed(15),['E','G'],true),rule(count(['補給艦'],1),['E','G'],true),rule(always,['G'])],
  E:[rule(speed(15),['F']),rule(always,['D','F'],true)],
  G:[rule(count(['正規空母'],1),['J']),rule(count(['戦艦','軽空母'],2),['J']),rule(count(['潜水艦'],1),['H','J'],true),rule(count(['軽巡','駆逐','補給艦'],0,5),['H']),rule(not(speed(10)),['H']),rule({...radar(0),max:0},['H']),rule(speed(15),['F']),rule(count(['補給艦'],1),['H','F'],true),rule(always,['H','F'],true)],
  H:[rule(count(['軽巡','駆逐','補給艦'],6,6),['F']),rule(count(['軽巡','駆逐','補給艦'],0,5),['I']),{...rule(always,['I','F']),state:'unverified',reason:'6隻を超える範囲は資料表記が一致しない'}],F:[rule(always,['L'])]
 }}};
})();
const HD_MAP_ROUTE_STORAGE='harbordesk-map-routes-v1';
function hdMapRouteStored(map){
 try{const saved=JSON.parse(localStorage.getItem(HD_MAP_ROUTE_STORAGE)||'{}')[map];if(!saved)return null;const rows=MAP_PLANS[map]?.presets||[];const index=rows.findIndex(p=>p.name===saved.name&&p.ships===saved.ships);return index<0?null:index}catch{return null}
}
function hdMapRouteSet(map,index){
 const preset=MAP_PLANS[map]?.presets?.[Number(index)];if(index!==null&&!preset)return false;
 try{const saved=JSON.parse(localStorage.getItem(HD_MAP_ROUTE_STORAGE)||'{}');if(index===null)delete saved[map];else saved[map]={name:preset.name,ships:preset.ships};localStorage.setItem(HD_MAP_ROUTE_STORAGE,JSON.stringify(saved))}catch{return false}
 window.dispatchEvent(new CustomEvent('hd:map-route-changed',{detail:{map,index}}));return true;
}
