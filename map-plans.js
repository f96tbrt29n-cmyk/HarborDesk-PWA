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
   {name:'北ルート型',ships:'航巡2＋重巡級/戦艦級など',gear:'偵察機・電探で索敵を確保。',use:'夜戦ルートを含む北側攻略'},
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
