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
   {name:'北ルート型',ships:'航空戦艦1＋航巡2＋重巡3',gear:'この編成例では低速艦を含める（高速化しない）。戦艦級3隻で駆逐3隻以上・軽巡1隻以上かつ駆逐2隻以上の上位E条件に該当しない編成は、高速でもF→J。別々の2隻にドラム缶を1個ずつ。索敵33式係数1で49以上を確認。',use:'北ルート・BFJO（F分岐の編成・速力条件とドラム缶2隻を確認）',source:'https://zekamashi.net/kancolle-kouryaku/2-5/'},
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
 '7-3':[['羽黒1＋駆逐3','第1ゲージ・ACE（羽黒必須）'],['羽黒1＋足柄1＋航巡1＋駆逐3','第2ゲージ・G分岐未確認（P開放後）']],
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
 const T={bb:['戦艦','高速戦艦','航空戦艦'],cv:['正規空母','装甲空母','軽空母'],cvn:['正規空母','装甲空母'],cvl:['軽空母'],cav:['重巡洋艦','航空巡洋艦'],cl:['軽巡洋艦'],ct:['練習巡洋艦'],clt:['軽巡洋艦','重雷装巡洋艦','練習巡洋艦'],dd:['駆逐艦'],escort:['駆逐艦','海防艦'],de:['海防艦'],av:['水上機母艦'],as:['潜水母艦'],ao:['補給艦'],ss:['潜水艦','潜水空母'],lha:['揚陸艦'],bbv:['航空戦艦']};
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
 const northFast={all:[count(['bb'],3),count(['dd'],0,2),{not:{all:[count(['cl'],1),count(['dd'],2)]}}]};
 add('2-5',0,'BFJO',[fleet(6),count(['bb'],0,3),count(['cv','ss','lha'],0,0),count(['de'],0,2),count(['av'],0,1),{any:[{kind:'speedCount',rank:5,min:1,max:7},northFast],reason:'F→J：低速艦が1隻以上なら先にJ。全高速では駆逐3隻以上、軽巡1隻以上かつ駆逐2隻以上が先にE、それ以外の戦艦級3隻はJ。残りはE/Jランダム。速力・艦種情報が不足する条件は未判定とし、別の既知不一致は保持。装備購入ではなく編成・速力を確認'},{kind:'equipmentShips',match:'drum',min:2,max:7,slotPolicy:'valid'}],{useExampleScope:false,selectionAliases:{'航空戦艦':'戦艦級'},keepLow:1,keepLowUnless:northFast,los:los(1,49,42),notes:['Fでは低速艦1隻以上なら先にJ。全高速では駆逐3隻以上、軽巡1隻以上かつ駆逐2隻以上が先にE、その後の戦艦級3隻はJ。軽巡は軽巡洋艦で、重雷装巡洋艦はこの数に含めない。この1戦艦級の編成例では低速艦を維持する。','固定J条件の未成立はボス到達不可能や購入必須を意味しない。速力・艦種情報が不足する場合は未判定とし、既知の不一致は別に表示する。','ドラム缶(輸送用)は異なる2隻に各1個以上。同じ艦に2個は1隻として数える。']});
 add('2-5',1,'CEIO',[fleet(6),speed(10),count(['bb','ss'],0,0),count(['cvn','cav'],0,1),count(['cv'],1),count(['cl'],1),count(['dd'],3)],{minimumSpeed:10,los:los(1,34,31)});
 add('3-1',0,'CFG',[fleet(6),count(['bb','cv'],0,2),count(['escort'],2),count(['bbv','cl','av','ao'],0,2)]);
 for(const i of [0,1])add('3-2',i,'選択したC…L目標',[],{engine:'verified-graph'});
 const threeThreeLight={all:[count(['bb','cv'],1,1),count(['cl'],1,1),count(['dd'],4,4)]};
 add('3-3',0,'ACGM',[fleet(6),
  {any:[count(['cvn'],1),count(['bb','cv'],4),threeThreeLight],reason:'A→C：正規空母・装甲空母1隻以上、次に戦艦級＋空母系4隻以上、次に同1隻＋軽巡1隻＋駆逐4隻。それ以外はBへ進むため編成を見直す'},
  {all:[count(['escort'],2),count(['cvn'],0,1),count(['bb','cv'],0,2),{any:[count(['bb','cv'],2,2),threeThreeLight]}],reason:'C→G：駆逐＋海防1隻以下、正規空母・装甲空母2隻以上、戦艦級＋空母系3隻以上は先にE。残る同2隻、または同1隻＋軽巡1隻＋駆逐4隻はG。それ以外はEへ進むため編成を見直す'},
  {...count(['ss'],0,0),reason:'G→M：潜水艦・潜水空母が1隻以上なら、戦艦級＋空母系3隻以下のM条件より先にI/Mランダム。ACGM固定条件から外れるため編成を見直す。潜水母艦はこの潜水艦数に含めない'},
  {any:[count(['bb','cv','cav','cl','重雷装巡洋艦','dd','de'],6,6),{kind:'unverified',reason:'揚陸艦・潜水母艦・水母・補給艦・練習巡洋艦・工作艦などの特殊艦種は、3-3固有の算入範囲が未照合のため未判定。編成や出典を確認する。装備の不足数量には換算しない'}],reason:'登録した艦種の判定範囲'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,sources:['https://zekamashi.net/kancolle-kouryaku/3-3/','https://wikiwiki.jp/kancolle/北方海域/3-3'],notes:['A/C/Gの条件は順番に適用。Aの戦艦級＋空母系4隻以上はCへ進んでも、CでEへ進むためACGMにはならない。戦艦級は戦艦・高速戦艦・航空戦艦、空母系は正規空母・装甲空母・軽空母を数える。','軽巡1隻＋駆逐4隻の別条件では、重雷装巡洋艦・練習巡洋艦を軽巡、海防艦を駆逐の代わりに数えない。Cの先行する護衛隻数だけは駆逐＋海防の合計。速力はこの登録経路の必須条件ではない。','数値索敵・電探装備艦数はこの登録経路の必須条件ではない。電探はCのうずしお軽減用の任意推奨。艦戦・各空母の攻撃機・対空装備・夜戦装備は戦闘上の推奨で、分岐成立や勝利を保証しない。','艦種・隻数による経路不一致は編成を見直す。手持ち装備の配備とは別に表示し、探索未完了を装備の購入が必要という判定にしない。']});
 MAP_PLANS['3-3'].presets[0].gear='艦戦と各空母の搭載可能な枠に攻撃機を配備。電探はCのうずしお軽減、対空・夜戦装備は任意推奨。A/C/Gの艦種・隻数条件とは別で、数値索敵・高速統一・電探装備艦数の一律必須指定はない。';
 add('3-4',0,'ACEGJP',[fleet(6),
  {any:[count(['cl','dd','de'],0,0),count(['bb','cv'],3)],reason:'始点→A：軽巡・駆逐・海防0隻、次に戦艦級＋空母系3隻以上でA。残る潜水艦・潜水空母入り、次に同2隻はA/Bランダム。同1隻はB。同0隻では駆逐3隻以上ならD、それ以外はB/Dランダム。固定A条件から外れる場合は編成を見直す'},
  {all:[count(['cl','dd','de'],1),count(['cvn'],0,2),count(['bb','cv'],0,4),{not:count(['bb','cv'],2,2)},count(['av','ao'],1)],reason:'C→E：軽巡・駆逐・海防0隻、正規空母・装甲空母3隻以上、戦艦級＋空母系5隻以上は先にB。残る同2隻はF。その後に水母・補給艦1隻以上でE。潜水母艦だけではE/Fランダム、それ以外はF。装備調達ではなく艦種・隻数を見直す'},
  {any:[count(['bb','cv','cav','cl','重雷装巡洋艦','dd','de','av','as','ao','ss'],6,6),{kind:'unverified',reason:'揚陸艦・練習巡洋艦・工作艦などは、3-4固有の算入範囲が未照合のため未判定。編成や出典を確認する。装備の不足数量には換算しない'}],reason:'登録した艦種の判定範囲'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,sources:['https://zekamashi.net/kancolle-kouryaku/3-4/','https://wikiwiki.jp/kancolle/北方海域/3-4'],notes:['始点とCの条件は上から優先する。ACEGJP固定には両方が成立する必要があり、この6隻の登録範囲では戦艦級＋空母系3〜4隻、正規・装甲空母2隻以下、軽巡・駆逐・海防1隻以上、水母・補給艦1隻以上となる。軽巡1隻だけに限定しない。','戦艦級は戦艦・高速戦艦・航空戦艦。空母系は正規空母・装甲空母・軽空母。軽巡の数に重雷装巡洋艦・練習巡洋艦を含めない。潜水母艦は水母・補給艦の代わりではない。水母・補給艦がいれば、その先行条件が潜水母艦のE/Fランダムより優先する。','A→C、E→Gは登録出典の海域図の接続。G→J、J→Pは固定の接続。構造図の線は接続を示し、その線へ進む編成条件の充足とは別。登録経路に速力統一・数値索敵・電探や特定装備の個数/装備艦数の必須条件はない。ドラム缶・大発動艇は資源獲得量の任意装備で、分岐条件とは別。艦戦・各空母の攻撃機・対空・夜戦装備は戦闘上の推奨であり、分岐成立や勝利を保証しない。','固定経路条件を外れた案や探索未完了は、ボス到達不可能・手持ちでは不可能・購入必須の証明ではない。艦種/隻数、装備在庫、情報不足を分けて確認する。']});
 MAP_PLANS['3-4'].presets[0].gear='艦戦と各空母の攻撃機、対空・夜戦装備は戦闘上の推奨。ドラム缶・大発は資源増加の任意装備。ACEGJPの艦種・隻数条件と分け、数値索敵・速力統一・装備艦数の一律必須指定はない。';
 add('3-5',0,'FGK',[fleet(6),count(['dd'],5),count(['cl','ss','av','ao'],0,1),count(['dd','cl','ss','av','ao'],6,6)],{los:los(4,28),equipmentKinds:['索敵','夜戦'],airNotRequired:true});
 add('3-5',1,'BDHK',[fleet(6),count(['bb','cv'],0,3),count(['cv'],2),count(['lha'],0,0)],{los:los(4,40)});
 add('4-1',0,'CFDGJ / ABDGJ',[fleet(6),
  {...count(['bb','cv'],0,2),reason:'C→F：戦艦級＋空母系2隻以下でF。3隻はE/Fランダム、4隻もE/Fランダム、5隻以上はE。始点A/CはランダムなのでCFDGJだけ・ABDGJだけには固定しない'},
  {...count(['ss'],0,0),reason:'D→G：潜水艦・潜水空母を含むと、戦艦級＋空母系5隻以上のH条件の後、その他の艦種・隻数より先にG/Hランダム。潜水母艦は別艦種。固定G条件から外れた場合は装備調達ではなく編成を見直す'},
  {any:[count(['escort'],0,1),{all:[count(['bb','cv'],1),{any:[count(['escort'],3,3),{all:[count(['escort'],2,2),count(['cl'],0,0)]}]}]}],reason:'D→G：このC→Fの範囲では駆逐＋海防1隻以下、または戦艦級＋空母系1〜2隻で駆逐＋海防3隻、または同1〜2隻で駆逐＋海防2隻かつ軽巡0隻ならG。残る同1〜2隻で護衛4隻以上はH、護衛2隻かつ軽巡ありは重巡級等の内訳によりHまたはG/Hランダム。同0隻で護衛2隻以上はH。編成を見直す'},
  {any:[count(['bb','cv','cav','cl','重雷装巡洋艦','練習巡洋艦','dd','de','av','as','ao','ss'],6,6),{kind:'unverified',reason:'揚陸艦・工作艦などは、4-1固有の算入範囲が未照合のため未判定。出典・艦種を確認し、装備の不足数量には換算しない'}],reason:'登録した艦種の判定範囲'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,routing:'multiple',sources:['https://zekamashi.net/kancolle-kouryaku/4-1/','https://wikiwiki.jp/kancolle/西方海域/4-1','https://zh.kcwiki.cn/wiki/西方海域/4-1'],notes:['始点A/Cはランダム。A→B→DとC→F→Dは共通のD→G→Jへ合流する。条件を満たしてもCFDGJかABDGJの片方へ固定する判定ではない。G→Jは固定の接続。','戦艦級は戦艦・高速戦艦・航空戦艦、空母系は正規空母・装甲空母・軽空母、護衛数は駆逐＋海防。軽巡は軽巡洋艦のみで重雷装巡洋艦・練習巡洋艦を含めない。重巡級は重巡＋航巡。潜水艦数は潜水艦＋潜水空母で、潜水母艦は別。','Dでは戦艦級＋空母系5隻以上のH、潜水艦入りのG/Hランダム、同4隻のGが先行する。その後、同1〜3隻では護衛4隻以上→H、3隻→G、2隻かつ軽巡0→G、2隻かつ重巡級1以上・重巡級＋軽巡＋練巡ちょうど3→H、残り2隻→G/Hランダム、1隻以下→G。同0隻では護衛2以上→H、残り→G。この登録群はC→F条件も満たす同2隻以下に限定する。','F→Dは戦艦級＋空母系1隻以上なら先行して成立。同0隻でもこの登録群がD→Gになる護衛1隻以下ならD。範囲外の軽量艦隊に関する出典差を、この群の成立根拠へ流用しない。','登録経路に速力統一・数値索敵・電探装備艦数・特定装備の必須条件はない。Dの潜水艦対策セット、先制対潜、艦戦、各空母の攻撃機、対空・夜戦装備は戦闘上の推奨で、経路成立・発動・命中・勝利を保証しない。先制対潜人数・制空値は利用者が目標を選び、未選択は未判定として残す。','艦種・隻数で別経路やランダムになった場合は編成見直しへ案内する。装備在庫・搭載可否・枠競合・情報不足・探索打切りと分け、ボス到達不可能・手持ちでは不可能・購入必須とは断定しない。']});
 MAP_PLANS['4-1'].presets[0].gear='Dの潜水艦対策に同じ艦へソナー＋爆雷投射機の推奨セット。先制対潜人数と制空値は別に選択。艦戦・各空母の攻撃機・対空・夜戦装備も戦闘上の推奨で、速力統一・数値索敵・電探装備艦数の一律必須指定はない。始点A/Cはランダム、両経路はD→G→Jへ合流する。';
 for(const i of [0,1])add('4-2',i,'ACL / BDCL',[fleet(6),
  {...count(['ss'],0,0),reason:'A→C：潜水艦・潜水空母を含むと、駆逐＋海防1隻以下のE条件の後、軽巡・護衛数による固定Cより先にC/Eランダム。潜水母艦は別艦種。登録した両始点群から外れる場合は装備調達ではなく編成を見直す'},
  {...(i===0?{any:[{all:[count(['cl'],1),count(['escort'],3)]},count(['escort'],4)]}:count(['escort'],4)),reason:'A→C・D→C・C→L：'+(i===0?'軽巡1隻以上＋駆逐・海防3隻以上、または駆逐・海防4隻以上':'この登録例は駆逐・海防4隻以上')+'。6隻では戦艦級＋空母系は2隻以下になり、DとCの先行条件も満たす。軽巡は軽巡洋艦のみ。艦種・隻数は編成見直しへ案内する'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,routing:'multiple',sources:['https://zekamashi.net/kancolle-kouryaku/4-2/','https://wikiwiki.jp/kancolle/西方海域/4-2','https://zh.kcwiki.cn/wiki/西方海域/4-2'],notes:['始点A/Bはランダム。駆逐・海防や軽巡の数は分岐の偏りに関係するが、ACLだけ・BDCLだけには固定しない。A→C→LとB→D→C→Lの両方が登録群。B→Dは固定接続。','Aでは駆逐＋海防1隻以下→E、次に潜水艦・潜水空母入り→C/Eランダムが先行する。その後は駆逐＋海防4隻以上、または軽巡1隻以上＋同3隻以上でC。軽巡入り・護衛2隻等はランダムを残し、別経路へ進む可能性がある。','Dは軽巡＋駆逐＋海防4隻以上→Cが先行する資料と、この行を省略する資料がある。この6隻登録群は戦艦級＋空母系2隻以下でもあり、両資料ともCになる。対象外の重量艦や軽量艦だけの条件を推測で解決しない。','Cでは駆逐＋海防1隻以下、次に戦艦級＋空母系4隻以上でG。同3隻はG/Lランダム。その後、軽巡1隻以上、または駆逐＋海防4隻以上ならL、それ以外はG/Lランダム。軽巡と重雷装巡洋艦・練習巡洋艦は区別する。','潜水艦数は潜水艦＋潜水空母で、潜水母艦は含めない。戦艦級は戦艦・高速戦艦・航空戦艦、空母系は正規空母・装甲空母・軽空母。6隻の条件を満たす他の既知艦種や空母0隻を、元の編成例だけで不成立にしない。','ACLは通常戦A/CからL、BDCLは潜水艦編成のBと通常戦D/CからL。Bは潜水艦相手でも通常戦闘扱いの燃料・弾薬消費で、Hの潜水戦とは区別する。Bへ進む可能性に備える対潜セット・先制対潜は戦闘上の推奨で、経路必須の装備個数・人数ではない。','速力統一・数値索敵・電探/ドラム缶の装備艦数を一律通行必須にしない。制空値・先制対潜人数は利用者が目標を選び、未選択・情報不足を未判定として残す。艦戦、各空母の攻撃機、対空・夜戦装備も戦闘上の推奨で、経路成立と勝利保証は別。','既知の潜水艦系入りや護衛不足は、別の未知艦で消さない。編成不一致、在庫不足、搭載不可、枠競合、情報不足、探索打切りを区別し、未発見の案を手持ちでは不可能・購入必須とは断定しない。']});
 for(const p of MAP_PLANS['4-2'].presets)p.gear='始点A/Bはランダム、ACLとBDCLはC→Lへ合流。Bの潜水艦対策セットと先制対潜、艦戦・各空母の攻撃機・対空・夜戦装備は戦闘上の推奨。先制対潜人数と制空値は別に選択する。速力統一・数値索敵・電探装備艦数の一律必須指定はない。';
 add('4-3',0,'CDHN / CFHN',[fleet(6),count(['bb','ss'],0,0),count(['cvn'],1),count(['cv'],2,2),count(['escort'],2),speed(10)],{minimumSpeed:10,routing:'random',notes:['この登録例でもHからIへの逸れがある。対地装備は勝利目的に応じた推奨で、通行条件ではない。']});
 const i44={any:[count(['cvn'],2,2),count(['cav'],2,2),{all:[count(['cvn'],0,0),count(['cl'],1)]}]};
 add('4-4',0,'AEIK',[fleet(6),
  {...count(['escort'],2),reason:'S→A：駆逐＋海防2隻以上でA。1隻以下はA/Bランダムで、装備ではなく編成を見直す'},
  {...count(['bb','cvn'],0,3),reason:'E→I：戦艦級＋正規・装甲空母4隻以上は先にG。軽空母はこの合計に含めない'},
  {...count(['cl','cav'],1),reason:'E→I：軽巡または重巡・航巡1隻以上でI。軽巡は軽巡洋艦だけで、雷巡・練巡とは別。残るランダム分岐を固定Iとは扱わない'},
  {any:[count(['de'],0,1),{all:[count(['de'],2,2),count(['ao','as'],0,0)]},{kind:'unverified',reason:'Eの海防3隻以上、または海防2隻＋補給艦/潜水母艦入りは、軽巡・重巡級より先にCとする出典と後にCとする出典が不一致。この範囲は未判定で、編成・出典を確認する'}],reason:'E→I：海防艦条件の優先順は出典不一致を残す'},
  {any:[{all:[i44,{any:[count(['lha'],0,0),count(['cav'],2,2)]}]},{all:[count(['lha'],1),{any:[i44,{all:[count(['cvn'],0,1),count(['cvn','lha'],2)]}]},{kind:'unverified',reason:'揚陸艦を4-4の正規空母数へ算入するかは未確認。算入によってI→Kの成否が変わり得る場合は未判定を残す。重巡・航巡ちょうど2などで独立に決まる結果は保持する'}]}],reason:'I→K：駆逐・海防2以上に加え、正規・装甲空母ちょうど2、重巡・航巡ちょうど2、または正規・装甲空母0＋軽巡1以上のいずれか。他の編成はH/Kランダムなので編成見直しへ'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,sources:['https://zekamashi.net/kancolle-kouryaku/4-4/','https://wikiwiki.jp/kancolle/西方海域/4-4','https://zh.kcwiki.cn/wiki/西方海域/4-4'],notes:['始点は駆逐＋海防2隻以上でA、それ以外はA/Bランダム。A→Eは固定接続。この6隻登録範囲ではS→A、E→I、I→Kを順に確認する。','Eでは戦艦級＋正規/装甲空母4隻以上のGが先行する。その後の海防3以上・海防2＋補給/潜水母艦のCと、軽巡/重巡級のIの優先順は出典不一致のため該当範囲を未判定にする。既知の重量艦過多やI不一致はこの未判定で消さない。','I→Kは駆逐/海防2隻以上と、正規/装甲空母ちょうど2、重巡/航巡ちょうど2、正規/装甲空母0＋軽巡1以上のいずれか。正規空母2は元の編成例であり一律必須ではない。重巡級は2隻ちょうどで、3隻以上へ読み替えない。','軽巡は軽巡洋艦、重巡級は重巡＋航巡、正空は正規＋装甲空母。潜水艦と潜水空母は潜水母艦とは別。駆逐2＋重巡級2＋潜水艦系2のように前の条件でIとKが決まる編成へ、潜水艦一律除外を追加しない。','速力統一・数値索敵・電探/ドラム缶の装備艦数の一律通行必須指定はない。Eの対潜セット、ボスに混ざる潜水艦対策、制空と空母の攻撃機、対空・夜戦装備は戦闘上の推奨。先制対潜人数と制空値は利用者が別に選び、未選択・情報不足を未判定にする。','艦種・隻数は編成見直しへ、在庫不足・搭載不可・枠競合・情報不足・探索打切りは区別する。経路成立は勝利保証ではなく、探索未発見を手持ちでは不可能・購入必須・最適とは断定しない。']});
 MAP_PLANS['4-4'].presets[0].gear='AEIKの分岐は艦種・隻数で確認。Eの潜水艦やボス随伴潜水艦への対潜セット、艦戦・各空母の攻撃機・対空・夜戦装備は戦闘上の推奨。先制対潜人数と制空値は別に選択し、速力統一・数値索敵・装備艦数の一律必須指定はない。';
 add('4-5',0,'ADHT / CDHT',[fleet(6),count(['bb','cv'],0,4),speed(15)],{minimumSpeed:15,routing:'multiple',notes:['高速+統一の最短経路では数値索敵条件なし。対地攻撃の装備は別の推奨目標。']});
 add('4-5',1,'ADHKT / CDHKT',[fleet(6),count(['bb','cvn'],0,3),count(['bb','cv'],0,4),
  {not:{all:[speed(15),count(['bb','cv'],0,4)]},reason:'H→K：高速＋以上統一かつ戦艦級＋空母系4以下なら先にH→Tへ進み、選択したK経由とは別。既知の有効な高速以下の艦、または重量艦5以上ならこの高速＋近道には該当しない。速力未判定だけでK経由成立にせず、他の分岐条件も確認する'},
  {not:{all:[count(['cl'],1),count(['escort'],3)]},reason:'H→K：軽巡洋艦1以上＋駆逐・海防3以上ならH→Tへ進むため、このK経由とは別。雷巡・練巡は軽巡洋艦に数えない。装備購入ではなく編成と選択経路を見直す'},
  {...count(['ss'],0,0),reason:'K→T：潜水艦・潜水空母を含めない。1隻以上は索敵判定より前にMへ逸れる可能性があるため、索敵装備の追加だけで固定できない。潜水母艦とは別で、装備購入ではなく編成を見直す'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,los:los(2,71),routing:'multiple',sources:['https://zekamashi.net/kancolle-kouryaku/4-5/','https://zh.kcwiki.cn/wiki/西方海域/4-5'],notes:['始点A/Cはランダム。どちらも能動分岐でDを選び、D→H→K→Tを確認する登録経路。H→Tの高速＋最短・軽量最短は別の登録例。','Hは高速＋以上統一かつ戦艦級＋空母系4以下、次に軽巡洋艦1以上＋駆逐/海防3以上ならT。この直接D→H経路には、F経由時だけの軽巡＋駆逐/海防2隻の近道条件を適用しない。','Kは戦艦級＋正規/装甲空母4以上、戦艦級＋空母系5以上が先にM。潜水艦・潜水空母入りのM逸れ判定も索敵より先。Eから入る別経路の条件はこのD→H→K経路へ混ぜない。','索敵は33式係数2。出典の70以上に対し、既存登録の安全側目標71以上を維持する。71未満をゲーム上の到達不可能とは断定しない。','戦艦級は戦艦・高速戦艦・航空戦艦、正規空母数は正規・装甲空母、空母系はこれらと軽空母。元の戦艦2・重巡2・正規空母1・軽空母1は編成例で、確認済み分岐を満たす別の6隻編成も扱う。','対地セット・各空母の攻撃機・Dの対潜セットは戦闘上の推奨。艦種や隻数の不一致は編成見直しへ案内し、在庫不足・搭載不可・枠競合・情報不足・探索打切りを区別する。経路成立は勝利保証ではなく、未完了探索を手持ちでは不可能・購入必須・最適とは断定しない。']});
 add('4-5',2,'ADHT / CDHT',[fleet(6),count(['cl'],1),count(['escort'],3)],{routing:'multiple',notes:['軽量最短例は高速+不要、数値索敵条件なし。']});
 add('5-1',0,'BCFJ',[fleet(6),
  {all:[count(['bb','cv'],0,4),{any:[{all:[count(['cav'],4),count(['cl'],1)]},{all:[count(['cav'],2),count(['cl'],1,1),count(['ct'],0,0)]},{all:[count(['bb','cv'],0,2),count(['dd'],2)]},{all:[count(['ct'],1),{any:[{all:[count(['cav'],4),count(['cl','ct'],1)]},{all:[count(['cav'],2),count(['cl'],0,1),count(['cl','ct'],1)]}]},{kind:'unverified',reason:'練巡をこの開始分岐の軽巡条件へ代替できるかは未確認。算入によりB固定が変わり得る範囲だけ未判定にし、独立した駆逐数などの条件は保持する'}]}]}],reason:'S→B：戦艦級＋空母系5以上のAが先行。重巡・航巡4以上＋軽巡1以上、重巡・航巡2以上＋軽巡ちょうど1、または戦艦級＋空母系2以下＋駆逐2以上でB。それ以外はA/Bランダムなので編成を見直す'},
  {...count(['cvn'],0,0),reason:'B→C：正規・装甲空母を含むと先にE。軽空母1隻とは区別し、装備購入ではなく編成を見直す'},
  {...count(['cvl'],0,1),reason:'B→C：軽空母は1隻以下。2隻以上は先にE。護衛空母も軽空母に数え、装備購入ではなく編成を見直す'},
  {any:[count(['bb'],0,2),{all:[{any:[count(['cl'],2),{all:[count(['ct'],0,0),{not:count(['cl'],1,1)}]},{all:[count(['ct'],1),{kind:'unverified',reason:'Bの軽巡ちょうど1への練巡代替は未確認。戦艦級2以下のCなど別条件で決まる結果は保持する'}]}]},count(['dd'],2)]}],reason:'B→C：戦艦級2以下ならC。それを超える場合は軽巡ちょうど1のEが先行し、残りは駆逐2以上でC。それ以外はC/Eランダムの未確認域'},
  {...count(['bb'],0,2),reason:'6隻のBCFJ固定範囲：開始BとB→Cを同時に固定するには戦艦級2以下。戦艦級3以上で開始を重巡級2＋軽巡ちょうど1によりBへ固定すると、Bでは軽巡ちょうど1のEが先行する。練巡の代替可否を別々に組み合わせて成立とせず、編成を見直す'},
  {any:[{all:[count(['bb','cvl'],0,2),{any:[{all:[{any:[count(['cl'],1),{all:[count(['ct'],1),{kind:'unverified',reason:'5-1のFで練巡を軽巡の代替にできる直接根拠は未確認。代替可否でJ固定が変わる場合は未判定にし、駆逐4などの独立条件は保持する'}]}]},count(['dd'],2)]},count(['dd'],4)]}]},{all:[speed(20),{kind:'unverified',reason:'Fの最速統一によるJ優先は出典で優先度要確認。通常条件ではF→G/Hやランダムになる編成を、この最速候補だけでBCFJ成立にしない。高速＋は最速とは別'}]}],reason:'F→J：戦艦級＋軽空母2以下で、軽巡洋艦1以上＋駆逐2以上、または駆逐4以上。通常速力の軽巡なし駆逐2/3はG/Jランダムで、重巡級2を軽巡の代用にしない。別経路BCFGJの可能性と区別し、編成見直しへ案内する'},
  {any:[count(['lha'],0,0),{kind:'unverified',reason:'揚陸艦の当該B分岐への空母相当の算入範囲は未確認。名称や甲板だけで正規・軽空母または非空母へ断定せず、影響する編成は未判定にする。別の既知不一致は保持する'}]}
 ],{checkedAt:'2026-10-28',useExampleScope:false,sources:['https://zekamashi.net/kancolle-kouryaku/5-1/','https://wikiwiki.jp/kancolle/南方海域/5-1','https://zh.kcwiki.cn/wiki/南方海域/5-1'],notes:['BCFJは開始B→Cの鋼材→F→Jボス。開始A/Bのランダムを含む編成を固定扱いにしない。重巡・航巡2以上＋軽巡ちょうど1などの開始条件も、後のB/F条件とは別に確認する。','通常の固定域は正規/装甲空母0・軽空母1以下・戦艦級＋軽空母2以下で、軽巡1以上＋駆逐2以上または駆逐4以上。軽巡の分類は軽巡洋艦で雷巡は別。練巡は分類上別で、当該分岐での代替可否が結果を変える範囲だけ未判定にする。駆逐は駆逐艦だけで、海防艦・潜水母艦は駆逐数に数えない。','軽巡なしでも駆逐4以上なら同じBCFJを固定できる。潜水艦・潜水空母と駆逐4の混成を潜水艦だけの編成と混同せず、一律除外しない。元の戦艦・軽空母・重巡・軽巡各1＋駆逐2は編成例。','Fの最速20によるJ優先は適用順の根拠待ち。通常固定域は最速かどうかによらずJなので、不要な速力条件を追加しない。通常条件で固定できず最速だけで変わり得る場合に未判定を残し、既知の非最速艦がいればその候補を除く。','索敵値・装備艦数・一律の速力下限を通行必須条件にしない。各空母の攻撃機、制空・防空・夜戦CIは戦闘上の推奨または利用者目標で、経路成立も勝利保証ではない。','艦種や隻数の不一致は編成見直しへ案内し、装備購入で解決する不足にはしない。在庫不足・搭載不可・枠競合・情報不足・探索打切りを区別し、探索未発見を手持ちでは不可能・購入必須・最適とは断定しない。']});
 // E/D rows are checked in source order. Agreement across the two documented
 // CA readings and the unresolved LHA carrier readings is required; disagreement
 // is source-wait, never a guessed destination or an equipment shortage.
 const fiveTwoAgree=(conditions,reason)=>({any:[{all:conditions},{all:[{any:conditions},{kind:'unverified',reason}]}]});
 const fiveTwoC=({carrier='none'}={})=>{
  const cv=['cv',...(carrier==='none'?[]:['lha'])],cvn=['cvn',...(carrier==='cvn'?['lha']:[])],cvl=['cvl',...(carrier==='cvl'?['lha']:[])],identity=name=>({...named(name),matchPolicy:'masterName'}),pair={all:[identity('翔鶴'),identity('瑞鶴')]},both=(...conditions)=>({all:conditions});
  const caReading=conditions=>fiveTwoAgree(conditions,'Cの一部に登録記事の「重巡」と参照先の「重巡級」の表記差があり、航巡の算入でD/Eが変わるため未確認。独立した先行条件で決まる結果は保持する');
  const pairCruisers=caReading(['重巡洋艦','cav'].map(ca=>count([ca],2)));
  const fastCruisers=caReading(['重巡洋艦','cav'].map(ca=>({any:[count([ca],1,1),both(count([ca],0,0),count(cvl,2,2))]})));
  const rows=[
   [both(pair,count(['dd'],0,1)),'E'],
   [both(pair,pairCruisers),'D'],
   [both(pair,speed(10)),'D'],
   [pair,'E'],
   [count(['bb','重雷装巡洋艦'],1),'E'],
   [both(count(['dd'],2),count(cv,0,0)),'E'],
   [both(count(['dd'],2),count(['cav'],2)),'D'],
   [both(count(['dd'],2),count(cvn,1)),'E'],
   [both(count(['dd'],2),count(cvl,3)),'E'],
   [both(count(['dd'],2),speed(10),fastCruisers),'D'],
   [both(count(['dd'],0,1),count(cvn,1)),'E'],
   [both(count(['dd'],0,1),count(cvl,4)),'E'],
   [both(identity('夕張'),count([...cvl,'cav','dd','ao'],5,5)),'D'],
   [both(identity('祥鳳'),count(['cav','cl','ct','dd','ao'],5,5)),'D']
  ];
  return rows.reduceRight((next,[condition,to])=>to==='E'?{any:[condition,next]}:{all:[{not:condition},next]},{kind:'always'});
 };
 const fiveTwoCarrierReadings=['none','cvn','cvl'];
 const fiveTwoCE=fiveTwoAgree(fiveTwoCarrierReadings.map(carrier=>fiveTwoC({carrier})),'揚陸艦の5-2での空母相当算入は未確認。非空母・正規空母相当・軽空母相当で結果が変わる場合だけ未判定とし、装備購入で解決する不足にはしない');
 add('5-2',0,'BCEFO',[fleet(6),
  {...count(['ss'],0,0),reason:'S→B：潜水艦・潜水空母が1隻以上なら先にAへ進む確率があるためB固定にはならない。潜水母艦とは区別し、装備購入ではなく編成を見直す'},
  {...fiveTwoAgree(fiveTwoCarrierReadings.map(carrier=>count(['bb','cv',...(carrier==='none'?[]:['lha'])],0,4)),'Sの戦艦級＋空母系への揚陸艦算入がB固定を変えるため未確認'),reason:'S→B：戦艦級＋空母系5隻以上、正規・装甲空母3隻以上、戦艦級4隻以上のA確率がある範囲を除く。それぞれ順次判定され、確率を単純加算しない'},
  {...fiveTwoAgree(fiveTwoCarrierReadings.map(carrier=>count(['cvn',...(carrier==='cvn'?['lha']:[])],0,2)),'Sの正規空母相当への揚陸艦算入がB固定を変えるため未確認'),reason:'S→B：正規空母・装甲空母は2隻以下。3隻以上ではAへ進む確率がある'},
  {...count(['bb'],0,3),reason:'S→B：戦艦級は3隻以下。4隻以上のA確率は出典で未確定だがB固定とは扱わない'},
  {...fiveTwoCE,reason:'C→E：翔鶴と瑞鶴の両方がいる特例を先に適用し、その後に戦艦級・雷巡、駆逐数と空母・重巡級・速力、夕張/祥鳳の過不足5隻条件を順に確認する。Dへ進む編成は別経路BCDFOとして見直す。全艦高速をBCEFOへ一律必須にしない'},
  {...count(['bb'],0,2),reason:'F→O：索敵判定後、戦艦級2隻以下かつ空母系2隻以下でO。条件を外れたI/Oランダム等はO固定へ格上げせず、装備購入ではなく編成を見直す'},
  {...fiveTwoAgree(fiveTwoCarrierReadings.map(carrier=>count(['cv',...(carrier==='none'?[]:['lha'])],0,2)),'Fの空母系への揚陸艦算入がO固定を変えるため未確認'),reason:'F→O：空母系は正規・装甲・軽空母（護衛空母を含む）の合計2隻以下。揚陸艦の算入範囲は結果を変える場合だけ未判定にする'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,los:los(2,70,63),sources:['https://zekamashi.net/kancolle-kouryaku/5-2/','https://zh.kcwiki.cn/wiki/南方海域/5-2'],notes:['登録はB→C空襲→E通常戦→F通常戦→OボスのBCEFO。E→Fは固定接続で、翔鶴・瑞鶴を使う高速BCDFOは別経路。元の戦艦2・空母系2・航巡1・重巡1は編成例で、根拠のある重巡2などの代替も扱う。','開始の潜水系・重量艦・正規空母過多のA確率は、B固定の不成立として扱う。潜水艦は潜水空母を含み、潜水母艦は含めない。戦艦級は戦艦・高速戦艦・航空戦艦、空母系は正規・装甲・軽空母。駆逐に海防艦を足さず、雷巡と普通の軽巡・練巡を区別する。','Cでは翔鶴と瑞鶴が両方いる場合、駆逐1以下で先にE、次に重巡2以上・高速以上でD、低速艦ありでE。名指し艦は実艦DBの同一艦・改装系譜で照合し、無関係な艦名の部分一致で成立にしない。','それ以外のCは戦艦級＋雷巡1以上で先にE。駆逐2以上では空母0のE、重巡級2以上のD、正規・装甲空母1以上のE、軽空母3以上のE、高速かつ重巡1または重巡0＋軽空母2のDが先行する。駆逐1以下では正規・装甲空母1以上、軽空母4以上で先にE。その後、夕張あり＋軽空母/重巡級/駆逐/補給の合計過不足5、祥鳳あり＋重巡級/軽巡/練巡/駆逐/補給の合計過不足5でD、それ以外はE。','Cの特例と高速下位行には重巡/重巡級の出典表記差がある。航巡を数えるかによってD/Eが変わる範囲は出典待ちとし、別の既知条件で確定した結果を消さない。揚陸艦の空母算入も結果に影響するときだけ未確認にする。','F索敵は33式係数2、登録分岐表の70以上を維持。登録は63未満でH、63以上70未満はHへランダム。参照先の63境界重複や本文71/別係数76を混ぜて閾値を変更せず、未取得を0や充足へ置換しない。','制空・各空母の攻撃機・対空CI・夜戦装備は戦闘推奨または利用者目標で、固定電探個数や購入必須の条件ではない。D経由の対潜推奨をE経由へ必須として加えない。編成不一致、在庫不足、搭載不可、枠競合、情報不足、探索未完了を区別し、成立や探索未完了を勝利・最適・手持ちでは不可能の保証へ変えない。']});
 MAP_PLANS['5-2'].presets[0].gear+=' BCEFOの索敵はFで33式係数2・70以上を確認。通常経路へ一律高速や固定の電探個数を求めず、制空・各空母の攻撃機は戦闘上の推奨として分ける。';
 add('5-3',0,'DGIOKEQ',[fleet(6),count(['cv','bbv'],0,0),count(['cl'],0,1),count(['dd'],2),count(['bb'],0,2),{kind:'slowBattleshipCount',min:0,max:1},{any:[count(['bb'],0,1),speed(10)]},
  {...count(['ss'],0,0),reason:'始点D・G→I・E→Q：潜水艦を含めない'},
  {any:[count(['dd'],3),{all:[count(['cl'],1),count(['dd'],2,2)]},{all:[count(['bb'],0,1),count(['dd'],2,2)]}],reason:'I→O：O固定条件。未達の残りはJ/Oランダムで、到達不可能という意味ではありません'},
  {any:[count(['cl'],1),count(['cav'],4),count(['dd'],4)],reason:'E→Q：Q固定条件。未達の残りはB/Qランダム。軽巡または重巡級などの編成を確認'},
  {not:count(['dd'],4),reason:'K→E：駆逐4隻以上ではH経由。DGIOKEQとは別経路'},
  {not:{all:[count(['cl'],1),count(['dd'],3,3)]},reason:'K→E：軽巡1隻以上＋駆逐3隻ではH経由。指定経路と艦種構成を確認'},
  {not:count(['bbv','ao','as'],1),reason:'K→E：補給艦・航戦・潜水母艦を含むとH経由。装備追加ではなく編成を確認'},
  {not:speed(15),reason:'K→E：高速＋統一以上ではH経由。高速化の下限条件とは別'},
  {not:{kind:'equipmentShips',match:'drum',min:2,max:7},reason:'K→E：ドラム缶装備艦2隻以上ではH経由。DGIOKEQを選ぶ場合は1隻以下。装備個数とは別'}
 ],{checkedAt:'2026-10-27',conditionalSpeed:{rank:10,when:count(['bb'],2,7)},scopeIncomplete:true,scopeIncompleteReason:'K→E：大発系装備艦の算入対象が未確認。出典の個別装備一覧は疑問符付き・5-4確認/他海域未確認のため、5-3の経路全体を成立と確定しません。購入で解決する不足ではありません。',notes:['G→Iでは元の艦種「戦艦」（低速戦艦）は1隻まで。高速化しても艦種は変わりません。艦種「高速戦艦」とは別に数えます。','航戦不可。戦艦2隻へ変更する別例では高速統一が必要。能動分岐Oではゲーム内でKを選ぶ。P経由は別の経路で、このアプリは実際の選択操作を観測しません。','I→O・E→Qの固定条件、K→EとK→Hの違いを分けて確認。H経由を避ける条件は戦闘勝利の必須装備ではなく、Hへ進むことをボス到達不可能とは扱いません。','K→Eの大発系対象一覧は5-3への適用が未確認。既知の速力・艦種・ドラム条件を満たしても経路全体は未確認のままです。']});
 MAP_PLANS['5-3'].presets[0].gear+=' G→Iの低速戦艦は元の艦種で1隻まで（高速化しても別枠にはなりません）。I/O/K/Eの分岐条件は別に確認。Kの潜母は潜水母艦（潜水空母ではありません）。Kの大発系算入範囲は未確認。';
 add('5-4',0,'ADEHIJMP',[fleet(6),count(['cv'],0,0),{...count(['ss'],0,0),reason:'D→E：潜水艦・潜水空母を含めない。潜水母艦はこの数に含めない。1隻以上は低速戦艦数や駆逐数の条件より先にFへ進むため、装備購入ではなく編成を見直す'},count(['bb'],2,2),count(['dd'],2),{kind:'slowBattleshipCount',min:0,max:1,reason:'D→E：元の艦種が低速戦艦の艦は1隻以下。2隻以上はF経由。装備購入ではなく編成を見直す。別経路のためボス到達不可能や購入必須を意味しない'}],{checkedAt:'2026-10-27',los:{...los(2,45),exemptWhen:{all:[count(['ss'],0,0),speed(15)]},exemptNote:'M→P：潜水艦・潜水空母なしの高速＋以上統一時は索敵条件を非適用。それ以外は33式係数2で45以上。速力未判定では免除を確定しない。'},notes:['この登録例は中央ルート。上ルートL→Pや他海域の索敵条件は免除しない。渦潮対策の電探は任意の推奨で、M→Pの索敵必須装備数ではない。','Dでは潜水艦・潜水空母が1隻以上なら、元の低速戦艦2隻以上・戦艦級3隻以上・駆逐数の条件より先にFへ進む。潜水母艦はこの潜水艦数に含めない。他の条件まで成立するという意味ではない。艦種不明は未判定だが、別の既知艦で確定した不一致は維持する。装備購入ではなく編成を見直す。F経由は登録したADEHIJMPとは別経路で、ボス到達不可能や購入必須を意味しない。','D→Eでは元の艦種が低速戦艦の艦は1隻まで。高速化しても艦種は変わらないため、装備購入ではなく編成を見直す。航空戦艦・高速戦艦とは別に数える。2隻以上のF経由は登録したADEHIJMPとは別経路で、ボス到達不可能や購入必須を意味しない。']});
 MAP_PLANS['5-4'].presets[0].gear+=' M→Pは潜水艦・潜水空母なしの高速＋以上統一なら索敵条件非適用。それ以外は33式係数2で45以上。渦潮対策の電探は任意推奨。';
 MAP_PLANS['5-4'].presets[0].gear+=' D→Eでは潜水艦・潜水空母なし（潜水母艦は別艦種）。含む場合は先にFへ進むため編成を見直す。';
 MAP_PLANS['5-4'].presets[0].gear+=' D→Eの低速戦艦（元の艦種）は1隻まで。高速化装備では艦種は変わらない。2隻以上のF経由は別経路として確認。';
 const fiveFiveAgree=(conditions,reason)=>({any:[{all:conditions},{all:[{any:conditions},{kind:'unverified',reason}]}]});
 // Keep each possible carrier reading consistent across B and P. KC's generic
 // carrier definition includes CVL, but its P-row abbreviation can exclude it;
 // the LHA treatment also lacks a 5-5-specific complete definition.
 const fiveFiveReadings=['cv','cvn'].flatMap(heavy=>['none','cvn','cvl'].map(lha=>({heavy,lha})));
 const fiveFiveSpeedPass=({heavy,lha})=>({any:[speed(20),{all:[speed(15),count(['bb',heavy,...(lha==='cvn'||heavy==='cv'&&lha==='cvl'?['lha']:[])],0,5)]}]});
 const fiveFiveBP=reading=>{
  const regular=['cvn',...(reading.lha==='cvn'?['lha']:[])],heavy=['bb',reading.heavy,...(reading.lha==='cvn'||reading.heavy==='cv'&&reading.lha==='cvl'?['lha']:[])];
  const b={any:[{not:count(regular,0,2)},{not:count(['bb','重雷装巡洋艦'],0,3)},count(['dd'],0,1),{all:[{not:count(['重雷装巡洋艦'],0,2)},{kind:'unverified',reason:'Bの雷巡3隻以上→Kは登録記事にあるが参照先では駆逐2隻以上→Fが先行する。上位条件で確定しない範囲は出典待ちとし、装備購入で解決する不足にはしない'}]}]};
  const p={any:[fiveFiveSpeedPass(reading),{all:[count(heavy,0,4),count(['ss'],0,0)]}]};
  return {all:[b,p]};
 };
 const fiveFiveSourceReason='B→K・P→S：揚陸艦の空母算入、またはPの空母系/CV系の略記で軽空母を数えるかが結論を変えるため未確認。出典の複数の読みで同じ結果になる条件は保持し、購入必須へ変換しない';
 const fiveFiveExempt=fiveFiveAgree(fiveFiveReadings.map(fiveFiveSpeedPass),fiveFiveSourceReason);
 add('5-5',0,'BKPS',[fleet(6),
  {...count(['dd'],0,3),reason:'始点→B：駆逐4隻以上は先にAへ進む。海防艦は駆逐数に含めず、装備購入ではなく編成を見直す'},
  {not:{kind:'equipmentShips',match:'drum',min:4,max:7,slotPolicy:'valid'},reason:'始点→B：ドラム缶を有効に装備した艦は3隻以下。異なる4隻以上ならA。1隻の複数個を装備艦数へ足さない'},
  {any:[{kind:'equipmentShips',match:'landingCandidates',min:0,max:3,slotPolicy:'valid'},{kind:'unverified',reason:'始点の大発系4装備艦の個別算入対象は5-5で未確認。候補が4隻以上になり得る場合はA/Bを断定せず、編成・出典を確認する'}],reason:'始点→B：大発系の候補装備艦が3隻以下なら4隻条件に該当しない。候補4隻以上・情報不足では個別算入の未確認を残す'},
  {...fiveFiveAgree(fiveFiveReadings.map(fiveFiveBP),fiveFiveSourceReason),reason:'B→K・P→S：Bでは正規・装甲空母3以上、戦艦級＋雷巡4以上、駆逐1以下の共通K条件を先に確認。Pでは最速、次に高速＋かつ重量艦5以下のSを先に適用し、その後の重量艦5以上・潜水艦系入りのQ確率と区別する'}
 ],{checkedAt:'2026-10-28',useExampleScope:false,los:{...los(2,80,73),exemptWhen:fiveFiveExempt,exemptLabel:'P→S',exemptNote:'P→S：最速統一、または高速＋以上統一かつ戦艦級＋空母系5隻以下なら、後続の索敵条件は非適用。速力・空母系算入が不明なら免除を断定しない。',exemptUnknownNote:'P→Sの先行する速力・重量艦数による索敵免除は未確認。索敵安全域も未充足のため、この分岐は未判定です。速力・装備可否・艦種と索敵情報を確認してください。'},sources:['https://zekamashi.net/kancolle-kouryaku/5-5/','https://zh.kcwiki.cn/wiki/南方海域/5-5'],notes:['登録はB対潜→K通常戦→P通常戦→Sボス。Pは夜戦マスではない。始点の駆逐4・ドラム缶装備艦4・大発系装備艦4のAが先行し、経路の線と編成条件は別に確認する。','戦艦級は戦艦・高速戦艦・航空戦艦、正規空母は正規・装甲空母。潜水系は潜水艦・潜水空母で、潜水母艦は含まない。軽巡・練巡を雷巡へ足さず、海防艦を駆逐へ足さない。','Bの正規・装甲空母3以上、戦艦級＋雷巡4以上は駆逐2以上のF条件より先にK。記事だけの雷巡3以上→Kと参照先の優先順の差は、別の既知条件で結果が決まらない範囲だけ未確認。','Pは最速統一で先にS。次に高速＋以上統一かつ戦艦級＋空母系5以下でS。このとき索敵は0や充足ではなく非適用。速力未判定でも免除対象外の安全域80が既知で成立するなど、どの候補でも同じ結果になる条件は保持する。','先行速力条件を満たさない戦艦級＋空母系5以上、潜水艦・潜水空母入りには各Q確率がある。固定BKPS条件の不成立で、ボス到達不可能を意味しない。確率を加算したり、索敵80でこの先行分岐を消したりしない。','免除対象外のP索敵は33式係数2・司令部係数0.4の80以上。73未満はQ、73以上80未満はQ/Sランダム。別司令部係数0.35の86や古い別係数の例43を流用しない。HQ120未満の余裕推奨と分岐閾値を区別する。','Pの空母系/CV系の略記と軽空母算入、揚陸艦の算入、大発系個別対象は影響域だけ未確認。軽空母を含むだけで一律不成立にせず、最速や重量艦上限をどの読みでも満たす場合の成立を保持する。','各空母の攻撃機・制空・防空・夜戦・Bの対潜対策は戦闘上の推奨または利用者指定で、経路の固定装備数や勝利保証ではない。編成不一致、在庫不足、搭載不可、枠競合、情報不足、探索未完了を区別し、未発見を手持ちでは不可能・購入必須・最適と断定しない。']});
 MAP_PLANS['5-5'].presets[0].gear+=' BKPSのP→Sは最速、または高速＋かつ戦艦級＋空母系5以下なら索敵非適用。それ以外は33式係数2・80以上と先行する逸れ条件を確認。軽空母算入などの出典差は影響域のみ未判定。';
 add('5-5',1,'BFDHNOS',[fleet(6),count(['bb'],0,2),count(['cv','ss'],0,0),count(['dd'],2)],{los:los(2,66),notes:['この登録例は中央下ルート。ACEGIMOSのドラム缶4隻／大発系4隻の条件とは別。']});
 for(const [i,path,safe,conditions] of [[0,'ABC2DEG',65,[count(['bbv'],2,2),count(['dd'],4,4)]],[1,'IJKLN',80,[speed(10),count(['bb','cv'],0,2),count(['cl'],1),count(['dd'],2),count(['av','lha'],0,0)]],[2,'IOQUXZ',88,[speed(10),count(['cl'],1),count(['dd'],2),count(['av','lha'],0,0)]]])add('5-6',i,path,[fleet(6),...conditions],{los:los(4,safe),minimumSpeed:i?10:0,equipmentKinds:i===0?['対潜','制空','防空','輸送','索敵','PT対策']:['対潜','制空','防空','夜戦','索敵'],...(i===0?{equipmentTargets:[{kind:'cap-pt',baseKind:'PT対策',label:'PT小鬼群対策セット',minCount:1,source:'https://zekamashi.net/kancolle-kouryaku/ptboat-taisaku/'}]}:{}),scopeIncomplete:true,notes:['出典が仮更新・検証継続中としている条件。数値は攻略目安として表示し、確定分岐成立とは扱わない。','第1ゲージ後のR到達ギミックと新スタート開放は別途確認。PT小鬼群対策・輸送装備をゲージ別に準備。']});
 // START's A cases are exact fleet families, not a universal CL/DD need.
 // Count all hulls within each family's allowed types so one unknown cannot
 // hide a known CV/other hull that is outside every documented A family.
 const sixOneAsFamily=(n,sub,extra=[],countExtra=0)=>({all:[fleet(n),count(['as'],1,1),count(['ss'],sub,sub),count(['as','ss',...extra],n,n),...(countExtra?[count(extra,countExtra,countExtra)]:[])]});
 const sixOneStartA={any:[...[3,4,5,6].map(n=>({all:[fleet(n),count(['ss'],n,n)]})),sixOneAsFamily(4,3),sixOneAsFamily(5,4),sixOneAsFamily(6,5),sixOneAsFamily(6,3,['dd'],2),sixOneAsFamily(6,4,['cl','dd'],1)]};
 add('6-1',0,'AFGHK',[
  {kind:'fleetCount',min:4,max:6},
  {...sixOneStartA,reason:'始点→A：潜水母艦1＋潜水3〜5のみの4〜6隻、同1＋潜水3＋駆逐2、同1＋潜水4＋軽巡/駆逐1。潜水のみのAは次でDへ進む別経路。編成不一致は装備購入ではなく艦種・隻数を見直す'},
  {...count(['as'],1),reason:'A→F：潜水母艦1隻以上でF。潜水艦・潜水空母は潜水母艦へ数えず、潜水母艦なしはD経由の別経路'},
  {...count(['ss'],3),reason:'G→H：潜水艦・潜水空母3隻以上。選択した始点Aの潜水母艦入り固定群は重量艦0・潜水母艦ありで、先行する潜水2以下/重量艦過多/潜水母艦なしの逸れを避ける'},
  {kind:'scoutingValue',min:16,coef:4,reason:'G→H：先行する編成条件を満たした後の33式係数4で16以上。12付近の詳細な逸れ先は出典差を留保し、16未満を到達不可能とはしない'}
 ],{checkedAt:'2026-10-29',useExampleScope:false,los:los(4,25,20),sources:['https://zekamashi.net/kancolle-kouryaku/6-1/','https://zh.kcwiki.cn/wiki/中部海域/6-1'],notes:['登録は始点A→F通常戦→G非戦闘→H通常戦→Kボス。元の軽巡1・潜水4・潜水母艦1は編成例で、出典にある潜水母艦1＋潜水のみ4〜6隻や駆逐2の代替も確認する。','始点の重量艦によるBが先行するが、AFGHK固定群は重量艦0。記事の重量2以上と参照先の3以上、空母系/CV系略称・揚陸艦算入の差は、この固定群の成立へ流用しない。空母1＋軽巡1＋潜水3＋潜水母艦1はCFGHKの別経路。','潜水は潜水艦＋潜水空母、潜水母艦は別艦種。軽巡は軽巡洋艦で雷巡・練巡を含めず、駆逐へ海防艦を加えない。艦種・隻数不一致は編成を見直し、装備調達で解決する不足にしない。','Gは潜水2以下/重量艦過多のI、次に潜水母艦なしの15%Iが先行し、その後に係数4の索敵16以上でH。ちょうど12は資料の重複表記を留保する。H20未満など別の既知不一致は、この留保で消さない。','Hは潜水母艦ありの33式係数4・25以上でK、20以上25未満はE/Kランダム、20未満はE。25以上は先のG16も満たす。潜水母艦なしの36や司令部減算0.35用31/42は別条件として流用しない。HQ120未満の余裕推奨は閾値変更と区別する。','一律の速力統一や装備個数を通行必須にしない。魚雷・偵察機・制空/夜戦の目標は戦闘推奨または利用者指定と区別し、索敵ポイントを装備の購入数量へ換算しない。','情報不足・在庫不足・搭載不可・枠競合・探索未完了を区別し、未発見を手持ちでは不可能・購入必須・最適と断定しない。固定経路成立は到達や勝利の保証ではない。']});
 MAP_PLANS['6-1'].presets[0].gear+=' AFGHKは潜水母艦1＋潜水のみ4〜6隻、潜水3＋駆逐2、潜水4＋軽巡/駆逐1の代替も扱う。Gは係数4の16以上、Hは潜水母艦あり25以上。潜水母艦なしや空母入りCFGHKは別経路。';
 // CEJK's all-carrier cap is explicit in the linked route summary, including
 // CVL/CVE. Keep LHA's unconfirmed carrier treatment only where it changes E.
 const sixTwoCarrierCap=extra=>count(['cv',...extra],0,1);
 const sixTwoCarriers={any:[{all:[sixTwoCarrierCap([]),sixTwoCarrierCap(['lha'])]},{all:[{any:[sixTwoCarrierCap([]),sixTwoCarrierCap(['lha'])]},{kind:'unverified',reason:'6-2の揚陸艦を空母へ算入するかでE→Jの結論が変わるため未確認。全空母に軽空母を含める上限1は別に保持し、既知の空母2隻をこの留保で消さない'}]}]};
 add('6-2',0,'CEJK',[
  {any:[fleet(6),{kind:'unverified',reason:'この登録経路の確認対象は6隻。少数隻など別の艦数は取得出典で成立範囲が未確認のため、成立にも確定不一致にも一般化しない。艦数だけを装備購入の不足へ変換しない'}]},
  {...count(['cl','dd'],0,3),reason:'始点→C：軽巡＋駆逐は3隻以下。4隻以上のBが航戦・航巡・水母・揚陸2隻のCより先行する。雷巡・練巡を軽巡へ、海防艦を駆逐へ足さない'},
  {...count(['bb'],0,1),reason:'C→E・E→J：戦艦級は1隻以下。戦艦・高速戦艦・航空戦艦を数え、速度装備で艦種は変わらない。Eの戦艦2以上→Fは索敵より先'},
  {...sixTwoCarriers,reason:'C→E・E→J：空母系は1隻以下。正規・装甲・軽空母を数える。揚陸艦の算入は結論に影響するときだけ未確認。Eの空母2以上→Fは索敵より先'},
  {...count(['cl'],0,1),reason:'CEJKの軽巡は1隻以下。駆逐2以上と始点の軽巡＋駆逐3以下からも導かれる上限で、雷巡2隻という元の例編成へ限定しない'},
  {...count(['dd'],2),reason:'E→J：駆逐艦2隻以上。海防艦では代用せず、駆逐1以下のFが先行する。艦種・隻数の不一致は編成見直しへ案内し、装備購入で直す不足にしない'}
 ],{checkedAt:'2026-10-29',useExampleScope:false,los:los(3,50,43),sources:['https://zekamashi.net/kancolle-kouryaku/6-2/','https://zh.kcwiki.cn/wiki/中部海域/6-2'],notes:['登録は始点C→E非戦闘→J通常戦→Kボス。Cも通常戦。J→Kは図の固定接続で、新しい艦種条件ではない。元の戦艦1・空母1・雷巡2・駆逐2は編成例で、出典の重巡・航巡を使う6隻代替も扱う。','始点は軽巡＋駆逐4以上→Bが最優先。次に航戦＋航巡＋水母＋揚陸2以上→C、その後に戦艦級＋空母系5以上B、4でB/C確率、3以下C。この選択群は軽巡＋駆逐3以下かつ重量2以下なのでCへ固定する。確率を別行で加算しない。','Cは重量5以上、重量＋重巡級6、重量＋潜水系6のAが先で、次に重量3以上D、それ以外E。選択群は戦艦級1以下・全空母1以下・駆逐2以上なので、これらの先行逸れを避ける。潜水系は潜水艦＋潜水空母で、潜水母艦は別。','Eは駆逐1以下、戦艦2以上、空母2以上のFが索敵より先。その後の33式係数3は50以上J、43以上50未満I/Jランダム、43未満I。索敵を増やしても先行する艦種不一致は消えない。','軽巡は軽巡洋艦で、雷巡・練巡を含めず、駆逐へ海防艦を足さない。戦艦級は元の艦種、空母系は正規・装甲・軽空母。揚陸艦の海域固有算入は出典不足の影響域だけ未判定にする。既知の軽巡＋駆逐4・空母2などの不一致を他の未知で消さない。','別のCEIKはEの40以上43未満でIを選ぶ経路。Iの潜水4以上→Gは数値より先で、Hの40以上K?は未確認。選択Jの50を40、別HQ減算0.35用56/49や旧記事のI表記で置換しない。HQ120未満の+1余裕推奨は閾値変更ではない。','6隻は確認済み入力の範囲で、実ゲームの最低隻数を確定した意味ではない。別の艦数は未確認として残し、一律の速力統一や索敵装備の固定個数を通行必須にしない。艦戦・空母の攻撃機・対空・夜戦やDの渦潮電探は戦闘推奨または利用者指定で、CEJKの経路必須と分ける。','編成不一致、在庫不足、搭載不可、枠競合、情報不足、探索未完了を区別する。索敵不足ポイントを装備の購入数量へ換算せず、未発見を手持ちでは不可能・購入必須・最適と断定しない。経路条件成立は実到達や勝利の保証ではない。']});
 MAP_PLANS['6-2'].presets[0].gear+=' CEJKの始点は軽巡＋駆逐3隻以下が必要。戦艦級・全空母各1以下、駆逐2以上とEの係数3・50以上を確認し、雷巡2は元の編成例として扱う。';
 // Count every hull within the admitted types for its actual size. This keeps
 // a known excluded hull decisive even when another hull is unknown, without
 // claiming that a smaller fleet is game-valid or requires six ships.
 const sixThreeAllowed={any:Array.from({length:7},(_,i)=>({all:[fleet(i+1),count(['cl','ct','dd','av'],i+1,i+1)]}))};
 add('6-3',0,'ACEGHJ',[
  {any:[fleet(6),{kind:'unverified',reason:'この登録経路の確認対象は6隻。少数隻など別の艦数の実ゲーム成立範囲は未確認で、最低6隻とも成立とも断定しない。別の既知の艦種不一致は保持する'}]},
  {...sixThreeAllowed,reason:'出撃可能な艦種は軽巡・練巡・駆逐・水母のみ。艦数に合わせて全艦を数え、既知の雷巡・海防・潜水母艦などの混入を別の未知艦で消さない。艦種不一致は編成見直しへ案内する'},
  {...count(['cl','ct'],1,3),reason:'出撃制限：軽巡＋練巡は1〜3隻。練巡はここで軽巡と合算するが、Eの軽巡数には合算しない。雷巡は出撃可能な軽巡へ含めない'},
  {...count(['cl'],0,1),reason:'E→G：軽巡洋艦は1隻以下。軽巡3以上のFが最優先で、軽巡2の場合はF60%/G40%となるため固定ACEGHJ条件とは区別する。練巡を軽巡数へ足さない'},
  {...count(['av'],1,1),reason:'E→G：水母は1隻。出撃制限は1〜2隻だが、水母2以上のFが軽巡1以下・駆逐3以上のGより先行する。潜水母艦・潜水空母・補給艦は水母へ数えない'},
  {...count(['dd'],3),reason:'E→G：駆逐艦3隻以上。出撃制限の駆逐1以上だけではG固定にならず、海防艦は代用しない。軽巡3以上・水母2以上のFを先に除外する'}
 ],{checkedAt:'2026-10-29',useExampleScope:false,los:los(3,38,36),sources:['https://zekamashi.net/kancolle-kouryaku/6-3/','https://zh.kcwiki.cn/wiki/中部海域/6-3'],notes:['登録は始点A→C潜水戦→E通常戦→G/H航空偵察→Jボス。Aは能動分岐B/CのうちCを選ぶ。Eを直接選ぶ操作ではなく、航空偵察は航空戦とは別。','出撃可能な艦種は軽巡・練巡・駆逐・水母のみ。水母1以上、軽巡＋練巡1〜3、駆逐1以上、水母2以下の出撃制限と、選択ACEGHJの固定条件を区別する。雷巡・海防・潜水母艦・潜水空母を名称だけで代用しない。','Eは軽巡3以上→F、次に水母2以上→F、その後に軽巡1以下かつ駆逐3以上→G、その他F60%/G40%の順。軽巡2はGへ到達不可能ではなく固定しない。確率を別々に加算しない。','練巡は出撃制限では軽巡と合算し、Eの軽巡数へは加えない。出典の軽巡1＋駆逐4＋水母1、軽巡1＋練巡1＋駆逐3＋水母1を扱う。軽巡0＋練巡1/2の代替は出撃制限とE表からの導出で、取得済み出撃記録の証明ではない。元の駆逐4隻だけへ拘束しない。','H→Jは33式係数3・司令部減算0.4の38以上。36以上38未満はI/Jランダム、36未満I。先行する38以上を含む曖昧な36〜38表記より優先する。別の司令部係数0.35の44を流用せず、HQ120未満の+1余裕推奨を閾値変更にしない。','6隻はこの登録経路の確認済み入力の範囲で、実ゲームの最低隻数を新しく決めた意味ではない。別の艦数は未判定として残し、既知の水母2・軽巡2などの固定経路不一致を消さない。速力統一や装備固定個数、速力による索敵免除は一律の通行必須条件にしない。','G/Hの航空偵察成功は水偵・水爆・大型飛行艇の別計算で、H通行の33式38や本体索敵・電探を成功値へ流用しない。損耗と偵察資源、ボスB勝利以上の資源獲得条件は未計算で、経路成立から報酬や勝利を保証しない。','水爆1枠・C対潜セット・夜戦・索敵装備の目安は戦闘上の推奨または利用者指定で、経路固定の購入数量ではない。索敵ポイントを装備個数へ換算しない。','艦種・隻数不一致、在庫不足、搭載不可、枠競合、情報不足、探索未完了を区別する。編成不一致は編成見直しへ案内し、未発見を手持ちでは不可能・購入必須・最適と断定しない。経路条件成立は到達や勝利の保証ではない。']});
 MAP_PLANS['6-3'].presets[0].gear+=' ACEGHJはAでCを選び、Eは軽巡1以下・水母1・駆逐3以上。練巡は出撃制限の軽巡へ合算するがEの軽巡数へ足さず、練巡入り代替も扱う。Hは33式係数3の38以上、G/H航空偵察の成功値とは別。';
 add('6-4',0,'BDCFN',[fleet(6),speed(10),count(['cl'],1,1),{kind:'flagshipType',types:types('cl')},count(['bb'],0,1),count(['cv','lha'],0,0),count(['dd'],3)],{minimumSpeed:10,notes:['軽巡旗艦。長門型タッチの別編成と混同しない。対地装備、基地1部隊とボス半径5を別評価。']});
 add('6-5',0,'ACDGM',[fleet(6),count(['bb','cv'],0,3),count(['bb','cv','cav'],0,4),count(['cv'],1),count(['重雷装巡洋艦'],0,1),count(['dd'],1)],{los:los(3,50),notes:['基地航空隊は2部隊まで。ボスへの行動半径5、敵編成・制空・補充を基地計画で確認。']});
 add('6-5',1,'BFIJM',[fleet(6),count(['bb'],0,2),count(['cv','重雷装巡洋艦'],0,0),count(['cl'],1),count(['dd'],2)],{los:los(3,35),notes:['空母・雷巡を使わない下ルート。道中対潜・夜戦と基地航空隊を準備。']});
 add('7-1',0,'DEGHK',[fleet(5),count(['cl'],1,1),count(['dd'],4,4)],{airNotRequired:true,equipmentKinds:['対潜','夜戦'],equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:4}],notes:['先制対潜4〜5隻は攻略用の推奨。通常戦Gへの火力とルート条件は別評価。']});
 add('7-2',0,'CEG',[fleet(4),count(['cvn','bb','ss','ao'],0,0),count(['escort'],3)],{airNotRequired:true,equipmentKinds:['対潜'],equipmentTargets:[{kind:'cap-asw',label:'対潜シナジー',minCount:4}],notes:['第1ゲージの4隻例では数値索敵不要。対潜攻撃装備を各艦に準備。']});
 add('7-2',1,'BCDIM',[fleet(6),speed(10),count(['bb','cv'],0,3),count(['cvn'],0,1),count(['cl','練習巡洋艦'],0,2),count(['escort'],2),count(['ao','ss'],0,0)],{minimumSpeed:10,los:los(4,69),notes:['第2ゲージ用。敵編成に応じた制空目標と道中対潜を別評価。']});
 add('7-3',0,'ACE',[fleet(4),named('羽黒'),count(['dd'],3),count(['bb','cv'],0,0)],{airNotRequired:true,equipmentKinds:['夜戦'],notes:['第1ゲージ・羽黒入りの例。史実艦の改造段階を含めて識別。数値索敵条件なし。']});
 add('7-3',1,'ACDGJP / ACDGIJP（G分岐未確認）',[fleet(6),named('羽黒'),named('足柄'),count(['dd'],3),count(['bb','cv'],0,0),speed(10),{...count(['cav'],3),reason:'I→J：この登録例では重巡級（重巡＋航巡）3隻以上。最速などの別条件は対象外'}],{checkedAt:'2026-10-27',minimumSpeed:10,airNotRequired:true,equipmentKinds:['対潜','夜戦','煙幕'],sources:['https://zekamashi.net/kancolle-kouryaku/7-3/','https://wikiwiki.jp/kancolle/南西海域/7-3','https://zh.kcwiki.cn/wiki/南西海域/7-3'],scopeIncomplete:true,scopeIncompleteReason:'Gの重巡3隻（航巡を除く）と重巡級3隻（航巡を含む）の記載が出典間で一致せず、G→J/G→Iは未確認。固定・ランダムとは判定しません。神風を加えた編成や全艦最速化等の上位条件は別途確認。艦種・編成や根拠の問題を、装備購入で解決する不足とは扱いません。',notes:['第2ゲージ（P開放後）の羽黒・足柄・航巡1・駆逐3例。重巡は重巡洋艦のみ、重巡級は重巡洋艦＋航空巡洋艦。軽巡・雷巡・水母は算入しない。','Gは補給/水母・潜水・戦艦/空母・羽黒＋神風の条件が先。羽黒のみの高速・駆逐3例でも、ぜかましの重巡3隻と艦これwiki/舰娘百科の重巡級3隻でJ直行かI経由かが異なるため未確認。2経路表記は出典別候補でありランダムの証明ではない。','Iを通る場合は、潜水・戦艦/空母・重巡級3隻以上等を史実艦条件より優先してJへ判定。Jは戦艦/空母・低速・駆逐数を先に確認し、この登録例の駆逐3＋羽黒/足柄は後段の重巡級条件より優先してP。全経路固定・到達・勝利を保証しない。','重巡級が足りない場合は登録例の艦種・編成を見直す。未登録艦は艦情報を確認する。装備の購入数量へ換算しない。道中Jの潜水艦に煙幕または対潜対策を推奨。数値索敵条件なし。']});
 MAP_PLANS['7-3'].presets[1].gear='第2ゲージ（P開放後）の羽黒・足柄・航巡・駆逐3例。高速統一。GからJ直行かI経由かは出典が一致せず未確認。I経由時は重巡級（重巡＋航巡）3隻以上でJ、Jは駆逐3＋羽黒/足柄を後段の重巡級条件より優先。対潜・夜戦・煙幕を推奨。';
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
 if(c.kind==='equipmentShips'&&c.match==='landingCandidates')return `大発系の候補装備艦は${c.max}隻以下（個別装備の分岐算入は未確定）`;
 if(c.kind==='equipmentShips')return `別々の${c.min}隻に${({drum:'ドラム缶(輸送用)',radar:'電探'})[c.match]||'未確認の装備'}を各1個以上`;
 if(c.kind==='slowBattleshipCount')return `低速戦艦（元の艦種） ${c.min===c.max?c.min:c.min+'〜'+c.max}隻`;
 if(c.kind==='namedCount')return `${c.names.join('・')} ${c.min}隻以上`;
 if(c.kind==='scoutingValue')return Number.isInteger(c.coef)&&c.coef>=1&&c.coef<=4&&Number.isFinite(c.min)&&c.min>=0?`33式索敵（分岐点係数${c.coef}）${c.min}以上`:'索敵条件（係数・必要値が未確認）';
 if(c.kind==='flagshipType')return `旗艦 ${c.types.join('・')}`;
 return '条件の検証中';
}
function hdMapRequirementsHtml(map,preset){
 const r=hdMapPresetRequirements(map,preset);if(!r)return '';
 const los=r.los.kind==='required'?`${r.los.exemptNote?r.los.exemptNote+' ':''}33式・分岐点係数${r.los.coef}、${r.los.exemptWhen?'免除対象外の':''}必要索敵値${r.los.checks.map(c=>c.safe+'以上').join('・')}`:r.los.note;
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
