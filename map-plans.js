const MAP_PLANS={
 '1-2':{presets:[{name:'軽量5隻・軽巡1＋駆逐4',ships:'軽巡1＋駆逐4',gear:'主砲2本で夜戦連撃を準備。5隻編成を維持。',use:'通常攻略・AE（この編成では低速可）',source:'https://zekamashi.net/kancolle-kouryaku/1-2/'}],quests:[]},
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
const HD_MAP_ROUTE_STORAGE='harbordesk-map-routes-v1';
function hdMapRouteStored(map){
 try{const saved=JSON.parse(localStorage.getItem(HD_MAP_ROUTE_STORAGE)||'{}')[map];if(!saved)return null;const rows=MAP_PLANS[map]?.presets||[];const index=rows.findIndex(p=>p.name===saved.name&&p.ships===saved.ships);return index<0?null:index}catch{return null}
}
function hdMapRouteSet(map,index){
 const preset=MAP_PLANS[map]?.presets?.[Number(index)];if(index!==null&&!preset)return false;
 try{const saved=JSON.parse(localStorage.getItem(HD_MAP_ROUTE_STORAGE)||'{}');if(index===null)delete saved[map];else saved[map]={name:preset.name,ships:preset.ships};localStorage.setItem(HD_MAP_ROUTE_STORAGE,JSON.stringify(saved))}catch{return false}
 window.dispatchEvent(new CustomEvent('hd:map-route-changed',{detail:{map,index}}));return true;
}
