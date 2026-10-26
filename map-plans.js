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
 const presets=(p.presets||[]).map((x,i)=>`<div class="plan-card"><div class="plan-title">編成例 ${i+1}｜${planEsc(x.name)}</div><div><b>艦隊:</b> ${planEsc(x.ships)}</div><div><b>装備:</b> ${planEsc(x.gear)}</div><div><b>用途:</b> ${planEsc(x.use)}</div>${hdPlanSourceHtml(x)?`<div>${hdPlanSourceHtml(x)}</div>`:''}${hdMapRequirementsHtml(map,x)}</div>`).join('');
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
 // 1-4: restricted six-ship scope. Initial route remains random even when every path reaches L.
 MAP_PLANS['1-4'].routeBranches={schemaVersion:2,path:'BCF(E)HL / AD(EH/GJ)L',checkedAt:'2026-10-13',sources:['https://zekamashi.net/kancolle-kouryaku/1-4/','https://wikiwiki.jp/kancolle/鎮守府海域/1-4','https://zh.kcwiki.cn/wiki/镇守府海域/1-4/带路条件'],coverage:'6隻・駆逐/海防2以上・登録した軽量艦種/空母のボス方面。範囲外・任務固有条件・戦闘勝利は未保証',defaultGoal:'normal',goals:{
  normal:{label:'ボス方面・ランダム経由を許容',path:'BCF(E)HL / AD(EH/GJ)L',checks:[],speed:0,radar:0,allowed:['start','A','B','C','D','E','F','G','H','J','K','L'],next:'駆逐4以上、または軽巡＋水母＋駆逐/海防2以上でJ→L。潜水母艦でD→Eを選べます。始点はランダム。'},
  'j-avoid':{label:'J回避・潜水母艦入り',path:'BCFEHL / ADEHL',checks:[{id:'tender-E',label:'D→Eの潜水母艦',condition:count(['潜水母艦'],1),next:'手持ちの潜水母艦を1隻以上にする。潜水艦・潜水空母は代用できません。'},{id:'north-three',label:'B→Cの駆逐・海防艦',condition:count(['駆逐','海防艦'],3),next:'駆逐と海防艦を合計3隻以上にする。'}],speed:0,radar:0,allowed:['start','A','B','C','D','E','F','H','L'],next:'潜水母艦と駆逐/海防3以上を維持。BCFEHLとADEHLの経由はランダムです。'}
 },notRequired:{scouting:'登録した分岐資料に数値索敵の固定条件なし。制空は航空戦の装備目標として別評価。'},checks:[
  {id:'six-ships',label:'登録した編成の隻数',condition:{kind:'fleetCount',min:6,max:6},next:'この登録範囲は6隻。少数編成は未登録です。'},
  {id:'registered-types',label:'登録した艦種の範囲',condition:count(['空母','軽巡','駆逐','海防艦','水母','潜水母艦','補給艦'],6,6),next:'この登録範囲は空母・軽巡・駆逐・海防・水母・潜水母艦・補給艦。その他の艦種は別途確認する。'},
  {id:'registered-escorts',label:'登録した駆逐・海防艦の範囲',condition:count(['駆逐','海防艦'],2),next:'駆逐・海防を合計2隻以上にする。1隻以下のF→I経路は未登録です。'}
 ],graph:{start:'start',target:'L',terminals:{K:'nonboss'},nodes:{
  start:[rule(always,['A','B'],true)],A:[rule(always,['D'])],
  B:[rule(count(['空母'],3),['D']),rule(count(['駆逐','海防艦'],3),['C']),{condition:all(count(['駆逐','海防艦'],2,2),count(['補給艦'],1)),to:['C'],state:'disputed',reason:'駆逐/海防2＋補給艦のB→Cは資料間で記載が異なるため未判定。'},rule(always,['C','D'],true)],
  C:[rule(always,['F'])],D:[rule(count(['潜水母艦'],1),['E']),rule(count(['水母'],1),['G']),rule(always,['E','G'],true)],
  F:[rule(count(['駆逐','海防艦'],4),['E']),rule(count(['水母','潜水母艦','補給艦'],1),['E']),rule(always,['E','H'],true)],
  E:[rule(always,['H'])],H:[rule(always,['L'])],G:[rule(always,['J'])],
  J:[rule(all(count(['軽巡'],1),count(['水母'],1),count(['駆逐','海防艦'],2)),['L']),rule(count(['駆逐'],4),['L']),rule(always,['K','L'],true)]
 }}};
 MAP_PLANS['3-2'].routeBranches={schemaVersion:2,path:'C…L',checkedAt:'2026-10-13',sources:['https://zekamashi.net/kancolle-kouryaku/3-2/','https://zh.kcwiki.cn/wiki/北方海域/3-2'],coverage:'登録したボス経路の分岐。戦闘勝利・大破進撃の安全性は保証しない',defaultGoal:'normal',goals:{
  normal:{label:'通常・H経由を許容',next:'補給艦を外して軽巡1＋駆逐5または駆逐6へ変更する。H回避を選ぶ場合は全艦が高速＋へ到達できるか確認する。',path:'CG(H)FL / CEFL',checks:[],speed:0,radar:0,allowed:['start','C','E','G','H','F','L']},
  fastPlus:{label:'H回避・高速＋以上',path:'CEFL / CGFL',checks:[{id:'speed-goal',label:'高速＋統一',condition:speed(15),next:'各艦に有効な缶・タービンのセットを配備する。'},{id:'radar-goal',label:'電探装備艦',condition:radar(1),next:'電探を搭載できる艦の有効スロットに1個以上配備する。'}],speed:15,radar:1,airNotRequired:true,allowed:['start','C','E','G','F','L']},
  fastest:{label:'CEFL固定・最速',path:'CEFL',checks:[{id:'speed-goal',label:'最速統一',condition:speed(20),next:'最速に到達できる艦と必要な缶・改修値・スロットを確認する。'},{id:'radar-goal',label:'電探装備艦4隻',condition:radar(4),next:'4隻それぞれの有効スロットに電探を配備する。同じ艦の複数電探は1隻と数える。'}],speed:20,radar:4,airNotRequired:true,allowed:['start','C','E','F','L']}
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

// Route-specific requirements for every shipped regular/EO example. Numerical
// scouting and item-bearing ship counts are never inferred from free-text gear.
const HD_MAP_ROUTE_REQUIREMENTS={};
(()=>{
 const T={bb:['戦艦','高速戦艦','航空戦艦'],cv:['正規空母','装甲空母','軽空母'],cvn:['正規空母','装甲空母'],cvl:['軽空母'],cav:['重巡洋艦','航空巡洋艦'],cl:['軽巡洋艦'],clt:['軽巡洋艦','重雷装巡洋艦','練習巡洋艦'],dd:['駆逐艦'],escort:['駆逐艦','海防艦'],de:['海防艦'],av:['水上機母艦'],as:['潜水母艦'],ao:['補給艦'],ss:['潜水艦','潜水空母'],lha:['揚陸艦'],bbv:['航空戦艦']};
 const types=(...keys)=>[...new Set(keys.flatMap(k=>T[k]||[k]))],count=(keys,min=0,max=7)=>({kind:'typeCount',types:types(...keys),matchPolicy:'exact',min,max}),fleet=n=>({kind:'fleetCount',min:n,max:n}),speed=rank=>({kind:'minSpeed',rank}),named=(name,min=1)=>({kind:'namedCount',names:[name],min,max:7}),los=(coef,safe,failBelow)=>({kind:'required',coef,checks:[{label:'選択経路の索敵分岐',safe,...(failBelow==null?{}:{failBelow})}],marginNote:'司令部Lv120未満では出典が+1以上の余裕を推奨。閾値と余裕は区別して確認。'}),none={kind:'none',note:'この登録経路に数値索敵の条件は掲載されていません。'};
 const add=(map,index,path,conditions=[],extra={})=>{
  const p=MAP_PLANS[map]?.presets?.[index];if(!p)throw Error('Missing route example '+map+':'+index);
  const r={schemaVersion:1,map,index,path,checkedAt:'2026-10-13',source:'https://zekamashi.net/kancolle-kouryaku/'+map+'/',routing:'documented-example',los:none,conditions,notes:[],...extra};
  HD_MAP_ROUTE_REQUIREMENTS[map]??=[];HD_MAP_ROUTE_REQUIREMENTS[map][index]=r;p.source=r.source;
 };
 add('1-1',0,'AC',[{kind:'fleetCount',min:1,max:6}],{useExampleScope:false,routing:'random',notes:['ボス分岐はランダム。編成だけで到達確定とは判定しない。']});
 for(const [m,path] of [['1-2','AE'],['1-3','CFJ / A(DB)EFJ'],['1-4','BCF(E)HL / AD(EH/GJ)L']])add(m,0,path,[],{engine:'verified-graph'});
 add('1-5',0,'ADEJ',[fleet(4),count(['de'],4,4)],{equipmentKinds:['対潜'],airNotRequired:true,equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:4}],notes:['海防艦4隻の経路。先制対潜の可否は艦別に別評価。']});
 for(const i of [1,2])add('1-5',i,'ADFGJ',[fleet(4),count(['戦艦','高速戦艦','cvn','ss'],0,0),count(['cl'],0,2),count(['cvl'],0,1),count(['de'],0,3)],{equipmentKinds:['対潜'],airNotRequired:true,equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:i===1?3:4}],notes:['航空戦艦は採用可能。砲撃二巡型の航空戦艦には対潜攻撃可能な水上爆撃機などを検討。']});
 add('1-6',0,'AEGFBN',[fleet(6),count(['cl'],1,1),count(['escort'],5,5)],{notes:['下ルートでは制空優勢・対空CI発動は通行条件ではない。対潜と防空を推奨。']});
 add('2-1',0,'C(E)DH',[fleet(6),count(['bb','cv'],0,4),count(['cv'],0,2),count(['bbv'],0,0),count(['ao'],0,0)],{routing:'multiple',notes:['経由マスが複数ある登録例。補給艦入り等の別例は対象外。']});
 add('2-2',0,'CE(GH)K',[fleet(6),count(['bb','cv'],0,3),count(['cv'],0,2),count(['bbv'],0,0),count(['av','as'],1)],{routing:'multiple',notes:['水母または潜水母艦を維持。G/Hを通るかはランダム。']});
 add('2-3',0,'ボス方面・経路ランダム',[fleet(6),count(['bb','cv'],0,4)],{routing:'random',notes:['Jからの逸れなどを含む。編成条件の充足でボス到達を保証しない。']});
 add('2-4',0,'ボス方面・経路ランダム',[fleet(6),count(['bb','cv'],0,3),count(['av','as','ao'],0,0)],{routing:'random',notes:['戦艦＋空母は3隻まで。羅針盤による逸れを残す編成例。']});
 add('2-5',0,'BFJO',[fleet(6),count(['bb'],0,3),count(['cv','ss','lha'],0,0),count(['de'],0,2),count(['av'],0,1),{kind:'speedCount',rank:5,min:1,max:7},{kind:'equipmentShips',match:'drum',min:2,max:7,slotPolicy:'valid'}],{useExampleScope:false,selectionAliases:{'航空戦艦':'戦艦級'},keepLow:1,los:los(1,49,42),notes:['実際の編成速力が低速の艦を1隻以上維持。高速化して低速艦がなくなるとF→J条件を満たさない。','ドラム缶(輸送用)は異なる2隻に各1個以上。同じ艦に2個は1隻として数える。']});
 add('2-5',1,'CEIO',[fleet(6),speed(10),count(['bb','ss'],0,0),count(['cvn','cav'],0,1),count(['cv'],1),count(['cl'],1),count(['dd'],3)],{minimumSpeed:10,los:los(1,34,31)});
 add('3-1',0,'CFG',[fleet(6),count(['bb','cv'],0,2),count(['escort'],2),count(['bbv','cl','av','ao'],0,2)]);
 for(const i of [0,1])add('3-2',i,'選択したC…L目標',[],{engine:'verified-graph'});
 add('3-3',0,'ACGM',[fleet(6),count(['cvn'],0,1),count(['bb','cvl'],0,1),count(['dd'],2)]);
 add('3-4',0,'ACEGJP',[fleet(6),count(['bb','cv'],3,4),count(['cvn'],0,2),count(['cl'],1),count(['av','ao'],1)]);
 add('3-5',0,'FGK',[fleet(6),count(['dd'],5),count(['cl','ss','av','ao'],0,1),count(['dd','cl','ss','av','ao'],6,6)],{los:los(4,28),equipmentKinds:['索敵','夜戦'],airNotRequired:true});
 add('3-5',1,'BDHK',[fleet(6),count(['bb','cv'],0,3),count(['cv'],2),count(['lha'],0,0)],{los:los(4,40)});
 add('4-1',0,'CFDGJ / ABDGJ',[fleet(6),count(['bb','cv'],1,2),count(['escort'],1,1),count(['ss'],0,0)],{routing:'multiple',notes:['始点A/Cはランダム。潜水艦なし・護衛1隻の登録例はD→G。']});
 add('4-2',0,'ACL / BDCL',[fleet(6),{any:[{all:[count(['cl'],1),count(['escort'],3)]},count(['escort'],4)]}],{routing:'multiple',notes:['始点A/Bはランダム。海防艦を含む艦種条件と単一経路固定は区別。']});
 add('4-2',1,'ACL / BDCL',[fleet(6),count(['escort'],4)],{routing:'multiple',notes:['始点A/Bはランダム。']});
 add('4-3',0,'CDHN / CFHN',[fleet(6),count(['bb','ss'],0,0),count(['cvn'],1),count(['cv'],2,2),count(['escort'],2),speed(10)],{minimumSpeed:10,routing:'random',notes:['この登録例でもHからIへの逸れがある。対地装備は勝利目的に応じた推奨で、通行条件ではない。']});
 add('4-4',0,'AEIK',[fleet(6),count(['bb','cvn'],0,3),count(['escort'],2),count(['de'],0,2),count(['cl','cav'],1),count(['cvn'],2,2)]);
 add('4-5',0,'ADHT / CDHT',[fleet(6),count(['bb','cv'],0,4),speed(15)],{minimumSpeed:15,routing:'multiple',notes:['高速+統一の最短経路では数値索敵条件なし。対地攻撃の装備は別の推奨目標。']});
 add('4-5',1,'ADHKT / CDHKT',[fleet(6),count(['bb','cvn'],0,3),count(['bb','cv'],0,4)],{los:los(2,71),routing:'multiple'});
 add('4-5',2,'ADHT / CDHT',[fleet(6),count(['cl'],1),count(['escort'],3)],{routing:'multiple',notes:['軽量最短例は高速+不要、数値索敵条件なし。']});
 add('5-1',0,'BCFJ',[fleet(6),count(['cvn'],0,0),count(['bb','cvl'],0,2),count(['cvl'],0,1),count(['cl'],1),count(['dd'],2)]);
 add('5-2',0,'BCEFO',[fleet(6),count(['cv'],0,2),count(['bb'],0,2)],{los:los(2,70)});
 add('5-3',0,'DGIOKEQ',[fleet(6),count(['cv','bbv'],0,0),count(['cl'],0,1),count(['dd'],2),count(['bb'],0,2),{kind:'slowBattleshipCount',min:0,max:1},{any:[count(['bb'],0,1),speed(10)]},
  {...count(['ss'],0,0),reason:'始点D・G→I・E→Q：潜水艦を含めない'},
  {any:[count(['dd'],3),{all:[count(['cl'],1),count(['dd'],2,2)]},{all:[count(['bb'],0,1),count(['dd'],2,2)]}],reason:'I→O：O固定条件。未達の残りはJ/Oランダムで、到達不可能という意味ではありません'},
  {any:[count(['cl'],1),count(['cav'],4),count(['dd'],4)],reason:'E→Q：Q固定条件。未達の残りはB/Qランダム。軽巡または重巡級などの編成を確認'},
  {not:count(['dd'],4),reason:'K→E：駆逐4隻以上ではH経由。DGIOKEQとは別経路'},
  {not:{all:[count(['cl'],1),count(['dd'],3,3)]},reason:'K→E：軽巡1隻以上＋駆逐3隻ではH経由。指定経路と艦種構成を確認'},
  {not:count(['bbv','ao','潜水空母'],1),reason:'K→E：補給艦・航戦・潜水空母を含むとH経由。装備追加ではなく編成を確認'},
  {not:speed(15),reason:'K→E：高速＋統一以上ではH経由。高速化の下限条件とは別'},
  {not:{kind:'equipmentShips',match:'drum',min:2,max:7},reason:'K→E：ドラム缶装備艦2隻以上ではH経由。DGIOKEQを選ぶ場合は1隻以下。装備個数とは別'}
 ],{checkedAt:'2026-10-27',conditionalSpeed:{rank:10,when:count(['bb'],2,7)},scopeIncomplete:true,scopeIncompleteReason:'K→E：大発系装備艦の算入対象が未確認。出典の個別装備一覧は疑問符付き・5-4確認/他海域未確認のため、5-3の経路全体を成立と確定しません。購入で解決する不足ではありません。',notes:['G→Iでは元の艦種「戦艦」（低速戦艦）は1隻まで。高速化しても艦種は変わりません。艦種「高速戦艦」とは別に数えます。','航戦不可。戦艦2隻へ変更する別例では高速統一が必要。能動分岐Oではゲーム内でKを選ぶ。P経由は別の経路で、このアプリは実際の選択操作を観測しません。','I→O・E→Qの固定条件、K→EとK→Hの違いを分けて確認。H経由を避ける条件は戦闘勝利の必須装備ではなく、Hへ進むことをボス到達不可能とは扱いません。','K→Eの大発系対象一覧は5-3への適用が未確認。既知の速力・艦種・ドラム条件を満たしても経路全体は未確認のままです。']});
 MAP_PLANS['5-3'].presets[0].gear+=' G→Iの低速戦艦は元の艦種で1隻まで（高速化しても別枠にはなりません）。I/O/K/Eの分岐条件は別に確認。Kの大発系算入範囲は未確認。';
 add('5-4',0,'ADEHIJMP',[fleet(6),count(['cv'],0,0),count(['bb'],2,2),count(['dd'],2)],{los:los(2,45),notes:['この登録例は中央ルート。上ルートL→Pの索敵値を流用しない。渦潮対策の電探は推奨。']});
 add('5-5',0,'BKPS',[fleet(6),count(['bb','cv'],0,4),count(['dd'],0,1),count(['ss'],0,0)],{los:los(2,80),notes:['戦艦＋空母5隻以上の別例には索敵を満たしても逸れがある。']});
 add('5-5',1,'BFDHNOS',[fleet(6),count(['bb'],0,2),count(['cv','ss'],0,0),count(['dd'],2)],{los:los(2,66),notes:['この登録例は中央下ルート。ACEGIMOSのドラム缶4隻／大発系4隻の条件とは別。']});
 for(const [i,path,safe,conditions] of [[0,'ABC2DEG',65,[count(['bbv'],2,2),count(['dd'],4,4)]],[1,'IJKLN',80,[speed(10),count(['bb','cv'],0,2),count(['cl'],1),count(['dd'],2),count(['av','lha'],0,0)]],[2,'IOQUXZ',88,[speed(10),count(['cl'],1),count(['dd'],2),count(['av','lha'],0,0)]]])add('5-6',i,path,[fleet(6),...conditions],{los:los(4,safe),minimumSpeed:i?10:0,equipmentKinds:i===0?['対潜','制空','防空','輸送','索敵','PT対策']:['対潜','制空','防空','夜戦','索敵'],...(i===0?{equipmentTargets:[{kind:'cap-pt',baseKind:'PT対策',label:'PT小鬼群対策セット',minCount:1,source:'https://zekamashi.net/kancolle-kouryaku/ptboat-taisaku/'}]}:{}),scopeIncomplete:true,notes:['出典が仮更新・検証継続中としている条件。数値は攻略目安として表示し、確定分岐成立とは扱わない。','第1ゲージ後のR到達ギミックと新スタート開放は別途確認。PT小鬼群対策・輸送装備をゲージ別に準備。']});
 add('6-1',0,'AFGHK',[fleet(6),count(['ss'],3),count(['as'],1,1),count(['cl','dd'],1),count(['bb','cv','cav'],0,1)],{los:los(4,25),notes:['潜水母艦を外す別例は必要索敵値とランダム分岐が変わる。']});
 add('6-2',0,'CEJK',[fleet(6),count(['bb'],0,1),count(['cv'],0,1),count(['cl'],0,1),count(['dd'],2)],{los:los(3,50,43),notes:['I経由を狙う別例は40以上43未満。選択したJ経由は50以上を使う。']});
 add('6-3',0,'ACEGHJ',[fleet(6),count(['cl','練習巡洋艦','dd','av'],6,6),count(['cl'],1,1),count(['dd'],3),count(['av'],1,1)],{los:los(3,38,36),notes:['出撃可能な艦種は軽巡・練巡・駆逐・水母。能動分岐はE方面を選ぶ。']});
 add('6-4',0,'BDCFN',[fleet(6),speed(10),count(['cl'],1,1),{kind:'flagshipType',types:types('cl')},count(['bb'],0,1),count(['cv','lha'],0,0),count(['dd'],3)],{minimumSpeed:10,notes:['軽巡旗艦。長門型タッチの別編成と混同しない。対地装備、基地1部隊とボス半径5を別評価。']});
 add('6-5',0,'ACDGM',[fleet(6),count(['bb','cv'],0,3),count(['bb','cv','cav'],0,4),count(['cv'],1),count(['重雷装巡洋艦'],0,1),count(['dd'],1)],{los:los(3,50),notes:['基地航空隊は2部隊まで。ボスへの行動半径5、敵編成・制空・補充を基地計画で確認。']});
 add('6-5',1,'BFIJM',[fleet(6),count(['bb'],0,2),count(['cv','重雷装巡洋艦'],0,0),count(['cl'],1),count(['dd'],2)],{los:los(3,35),notes:['空母・雷巡を使わない下ルート。道中対潜・夜戦と基地航空隊を準備。']});
 add('7-1',0,'DEGHK',[fleet(5),count(['cl'],1,1),count(['dd'],4,4)],{airNotRequired:true,equipmentKinds:['対潜','夜戦'],equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:4}],notes:['先制対潜4〜5隻は攻略用の推奨。通常戦Gへの火力とルート条件は別評価。']});
 add('7-2',0,'CEG',[fleet(4),count(['cvn','bb','ss','ao'],0,0),count(['escort'],3)],{airNotRequired:true,equipmentKinds:['対潜'],equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:4}],notes:['第1ゲージの4隻例では数値索敵不要。対潜攻撃装備を各艦に準備。']});
 add('7-2',1,'BCDIM',[fleet(6),speed(10),count(['bb','cv'],0,3),count(['cvn'],0,1),count(['cl','練習巡洋艦'],0,2),count(['escort'],2),count(['ao','ss'],0,0)],{minimumSpeed:10,los:los(4,69),notes:['第2ゲージ用。敵編成に応じた制空目標と道中対潜を別評価。']});
 add('7-3',0,'ACE',[fleet(4),named('羽黒'),count(['dd'],3),count(['bb','cv'],0,0)],{airNotRequired:true,equipmentKinds:['夜戦'],notes:['第1ゲージ・羽黒入りの例。史実艦の改造段階を含めて識別。数値索敵条件なし。']});
 add('7-3',1,'ACDGJP',[fleet(6),named('羽黒'),named('足柄'),count(['dd'],3),count(['bb','cv'],0,0),speed(10)],{minimumSpeed:10,airNotRequired:true,equipmentKinds:['対潜','夜戦','煙幕'],notes:['第2ゲージの羽黒・足柄・駆逐3例。道中Jの潜水艦に煙幕または対潜対策。数値索敵条件なし。']});
 add('7-4',0,'ABEJLP',[fleet(6),count(['戦艦','高速戦艦','cvn','ss'],0,0),count(['cav'],0,1),count(['clt'],0,1),count(['bbv','cvl','lha'],0,2),{any:[count(['escort'],3),count(['de'],2)]}],{los:los(4,37,33),equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:3}],notes:['登録した6隻の経路例。対潜枠・夜戦フィニッシャー・基地1部隊（ボス半径2）を準備。']});
 const g75=[fleet(6),count(['bb'],0,1),count(['cvn'],0,0),count(['cvl'],0,1),count(['bb','cav'],0,2),count(['cl'],1)];
 add('7-5',0,'ABDFGHK',[...g75,count(['dd'],2)],{equipmentKinds:['制空','防空','対潜','夜戦'],notes:['第1ゲージKへの例では数値索敵不要。M到達ギミックを行う場合は別に33式係数4で59以上必要。']});
 add('7-5',1,'ABDFJOQ',[...g75,count(['dd'],3)],{equipmentKinds:['制空','防空','対潜','対地','PT対策'],equipmentTargets:[{kind:'cap-pt',baseKind:'PT対策',label:'PT小鬼群対策セット',minCount:1,source:'https://zekamashi.net/kancolle-kouryaku/ptboat-taisaku/'}],notes:['第2ゲージQの対地攻略例。第1ゲージ撃破を確認。Mギミックは第3ゲージ開放に必要。']});
 add('7-5',2,'ABDFJOPT',[fleet(6),count(['bb','cvn'],0,0),count(['cvl'],1,1),count(['航空巡洋艦'],2,2),count(['cl'],1,1),count(['dd'],2,2)],{los:los(4,63),equipmentKinds:['制空','防空','対潜','夜戦','索敵'],notes:['軽空母入りの第3ゲージ例は63以上。航空戦艦入りの別例の58を流用しない。低速可。第2ゲージ撃破とMマスS勝利1回が開放条件。']});
 for(const [map,d] of Object.entries(MAP_PLANS)){
  const rows=HD_MAP_ROUTE_REQUIREMENTS[map];if(!rows||rows.length!==d.presets.length||rows.some(x=>!x))throw Error('Incomplete route requirements '+map);
 }
})();
function hdMapPresetRequirements(map,preset){
 const rows=MAP_PLANS[map]?.presets||[],matches=rows.map((p,i)=>({p,i})).filter(x=>x.p===preset||x.p.name===preset?.name&&x.p.ships===preset?.ships),i=matches.length===1?matches[0].i:matches.find(x=>x.p.use===preset?.use)?.i??-1;
 return i<0?null:HD_MAP_ROUTE_REQUIREMENTS[map]?.[i]||null;
}
function hdMapRequirementConditionText(c){
 if(c.reason&&c.kind!=='unverified')return c.reason+'（'+hdMapRequirementConditionText({...c,reason:undefined})+'）';
 if(c.not)return '該当しないこと：'+hdMapRequirementConditionText(c.not);
 if(c.kind==='unverified')return c.reason||'条件の根拠・入力が未確認';
 if(c.all)return c.all.map(hdMapRequirementConditionText).join(' かつ ');if(c.any)return c.any.map(hdMapRequirementConditionText).join(' または ');
 if(c.kind==='fleetCount')return `編成 ${c.min===c.max?c.min:c.min+'〜'+c.max}隻`;
 if(c.kind==='typeCount')return `${c.types.join('＋')} ${c.max===0?'不可':c.min===c.max?c.min+'隻':c.min+'〜'+c.max+'隻'}`;
 if(c.kind==='minSpeed')return `${({10:'高速',15:'高速+',20:'最速'})[c.rank]}統一`;
 if(c.kind==='speedCount')return `配備後の低速艦 ${c.min}隻以上（高速化して低速艦がなくなると不可）`;
 if(c.kind==='equipmentShips')return `別々の${c.min}隻に${({drum:'ドラム缶(輸送用)',radar:'電探'})[c.match]||'未確認の装備'}を各1個以上`;
 if(c.kind==='slowBattleshipCount')return `低速戦艦（元の艦種） ${c.min===c.max?c.min:c.min+'〜'+c.max}隻`;
 if(c.kind==='namedCount')return `${c.names.join('・')} ${c.min}隻以上`;
 if(c.kind==='scoutingValue')return Number.isInteger(c.coef)&&c.coef>=1&&c.coef<=4&&Number.isFinite(c.min)&&c.min>=0?`33式索敵（分岐点係数${c.coef}）${c.min}以上`:'索敵条件（係数・必要値が未確認）';
 if(c.kind==='flagshipType')return `旗艦 ${c.types.join('・')}`;
 return '条件の検証中';
}
function hdMapRequirementsHtml(map,preset){
 const r=hdMapPresetRequirements(map,preset);if(!r)return '';
 const los=r.los.kind==='required'?`33式・分岐点係数${r.los.coef}、必要索敵値${r.los.checks.map(c=>c.safe+'以上').join('・')}`:r.los.note;
 return `<div class="plan-card" data-hd-route-requirements="${planEsc(map+':'+r.index)}"><b>${planEsc(r.path)}の攻略条件${r.scopeIncomplete?'（検証中）':''}</b><ul>${r.conditions.map(c=>`<li>${planEsc(hdMapRequirementConditionText(c))}</li>`).join('')}<li>${planEsc(los)}</li></ul>${r.equipmentTargets?.length?`<p>装備の推奨目標：${planEsc(r.equipmentTargets.map(x=>x.label+' '+x.minCount+'組').join(' / '))}。先制対潜の発動や戦闘勝利とは別判定。</p>`:''}${r.notes.map(n=>`<p>${planEsc(n)}</p>`).join('')}${r.los.kind==='required'?`<small>${planEsc(r.los.marginNote)}</small>`:''}<p><a href="${planEsc(r.source)}" target="_blank" rel="noopener noreferrer">経路条件の出典 ↗</a></p></div>`;
}
// Scope generated recommendations to the documented route, rather than enemy
// names or requirements belonging to another path/stage in the same sea.
(()=>{
 const needs={
  '1-1':['夜戦'],'1-2':['夜戦'],'1-3':['夜戦'],'1-4':['制空','防空','夜戦'],'1-6':['対潜','防空','夜戦'],
  '2-1':['制空','防空','夜戦'],'2-2':['制空','防空','夜戦'],'2-3':['制空','防空','夜戦'],'2-4':['制空','防空','電探','夜戦'],'2-5':['制空','防空','夜戦','索敵'],
  '3-1':['制空','防空','夜戦'],'3-2':['夜戦','電探'],'3-3':['制空','防空','電探','夜戦'],'3-4':['制空','防空','夜戦'],
  '4-1':['対潜','制空','防空','夜戦'],'4-2':['対潜','制空','防空','夜戦'],'4-3':['対潜','制空','防空','対地'],'4-4':['対潜','制空','防空','夜戦'],'4-5':['対潜','制空','防空','対地','索敵'],
  '5-1':['制空','防空','夜戦'],'5-2':['制空','防空','夜戦','索敵'],'5-3':['制空','夜戦','索敵'],'5-4':['制空','電探','夜戦','索敵'],
  '6-1':['制空','夜戦','索敵'],'6-2':['制空','防空','夜戦','索敵'],'6-3':['対潜','夜戦','索敵'],'6-4':['制空','防空','対地'],
  '6-5':['制空','防空','夜戦','索敵'],'7-2':['対潜','制空','防空','夜戦','索敵'],'7-4':['対潜','制空','防空','夜戦','索敵']
 };
 for(const [map,rows] of Object.entries(HD_MAP_ROUTE_REQUIREMENTS))for(const r of rows){
  r.equipmentKinds??=needs[map]||['対潜','制空','防空','夜戦','索敵'];
  r.carrierAttackTarget=MAP_PLANS[map].presets[r.index].ships.includes('空母');
  if(r.carrierAttackTarget)r.notes.push('空母の攻撃機は各艦の搭載枠へ配備する推奨目標。艦戦・偵察機だけの配置と区別。陸上型への攻撃制限・命中・撃破は別評価。');
  if(['1-1','1-2','1-3','6-3'].includes(map))r.airNotRequired=true;
 }
 HD_MAP_ROUTE_REQUIREMENTS['5-5'][0].equipmentKinds=['制空','防空','夜戦','索敵'];
 HD_MAP_ROUTE_REQUIREMENTS['5-5'][0].notes.push('対潜艦を入れない重量例ではBマスの陣形・回避や支援を出典で確認。対潜可能な別編成は別途評価。');
 HD_MAP_ROUTE_REQUIREMENTS['5-5'][1].equipmentKinds=['対潜','制空','防空','夜戦','索敵'];
 HD_MAP_ROUTE_REQUIREMENTS['6-5'][1].equipmentKinds.push('対潜');
 HD_MAP_ROUTE_REQUIREMENTS['6-3'][0].waterAttackTarget=true;
 HD_MAP_ROUTE_REQUIREMENTS['6-3'][0].waterAttackTypes=['水上機母艦'];
 HD_MAP_ROUTE_REQUIREMENTS['1-5'][1].waterAttackTarget=true;
 HD_MAP_ROUTE_REQUIREMENTS['1-5'][1].waterAttackTypes=['航空戦艦'];
 // Strategy targets, never passage predicates. A set count does not imply OASW.
 const asw15={choose:true,source:'https://zekamashi.net/kancolle-kouryaku/1-5/',checkedAt:'2026-10-25'};
 HD_MAP_ROUTE_REQUIREMENTS['1-5'][0].openingAsw={...asw15,note:'海防艦4隻例は「可能な範囲」で先制対潜を準備する攻略案。人数は一意に指定されていません。対潜セット4組とは別に人数を選んでください。'};
 HD_MAP_ROUTE_REQUIREMENTS['1-5'][1].openingAsw={...asw15,note:'航空戦艦を含む二巡型は、先制対潜人数の明記がありません。対潜セット3組・水上爆撃機の推奨とは別に人数を選んでください。'};
 HD_MAP_ROUTE_REQUIREMENTS['1-5'][2].openingAsw={...asw15,recommended:4,fleetSize:4,shipTypes:['駆逐艦'],note:'駆逐4隻のキラ付け編成例で各艦の先制対潜条件を満たす装備案を初期目標に使用。初攻略全般の最低人数ではなく、他の艦種構成へ一律適用しません。'};
 HD_MAP_ROUTE_REQUIREMENTS['7-2'][0].openingAsw={choose:true,source:'https://zekamashi.net/kancolle-kouryaku/7-2/',checkedAt:'2026-10-25',note:'第1ゲージの4隻初攻略例には先制対潜人数の明記がありません。5隻育成例の「先制対潜できる海防艦3隻」はこの編成へ流用せず、人数を選んでください。'};
 MAP_PLANS['7-5'].presets[0].gear='第1ゲージの対潜・制空・夜戦装備を準備。対地とPT対策は第2ゲージ用。';
 MAP_PLANS['3-5'].presets[0].gear='夜戦連撃と索敵装備。33式係数4で28以上を確認。';
})();
