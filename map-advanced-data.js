// Advanced map metadata: scouting thresholds, land-base aviation, and verified enemy pattern samples.
// Values are summarized from the current Kancolle Strategy Wiki. Unknown/uncertain values stay explicitly marked as such.
const HD_MAP_ADVANCED_DATA={
  '2-5':{los:{coef:1,summary:'ボス前の索敵判定あり。司令部Lv120基準で索敵スコア33以上ならボス到達確定、31未満は逸れ確定、31〜33未満はランダム域。'},base:{available:false}},
  '3-5':{los:{coef:4,summary:'ボス方面で索敵判定あり。ルートごとの必要値は編成条件と合わせて確認。'},base:{available:false}},
  '4-5':{los:{coef:2,summary:'ボス方面で索敵判定あり。司令部Lv120未満では表示閾値より+1以上の余裕を推奨。'},base:{available:false}},
  '5-2':{los:{coef:2,summary:'ボス方面で索敵判定あり。司令部Lv120未満では+1以上の余裕を推奨。'},base:{available:false}},
  '5-4':{los:{coef:2,summary:'上ルートL→Pは索敵60前後、中央M→Pは45以上が主要目安。ランダム域あり。'},base:{available:false}},
  '5-5':{los:{coef:2,summary:'ボス方面で索敵判定あり。ルートごとに必要値が異なるためルートタブと併用。'},base:{available:false}},
  '5-6':{los:{coef:null,summary:'L→N、Q1→T、X→Zなどに索敵判定あり。2026年実装の新海域で検証継続中のため、数値閾値は確定値のみ順次登録。'},base:{available:false,note:'現行Wikiでは「対地戦や基地要素こそ無い」とされ、基地航空隊は使用しない。'}},
  '6-1':{los:{coef:4,summary:'G分岐は12未満で逸れ、潜水母艦入りで16以上ならH。H分岐は20未満でE、潜水母艦入り25以上でK、通常編成では36以上でK。'},base:{available:false}},
  '6-2':{los:{coef:3,summary:'E分岐は43未満でI、43〜50未満はI/Jランダム、50以上でJ。Hは32以上でK。Iは40以上でK、35前後〜40未満はランダム域。'},base:{available:false}},
  '6-3':{los:{coef:3,summary:'H分岐は36未満で逸れ、36〜38未満はランダム、38以上がボス方面の安全域目安。'},base:{available:false}},
  '6-4':{los:{coef:null,summary:'主要攻略ルートは艦種・速力条件が中心。'},base:{available:true,sorties:1,bossRadius:5,note:'空襲なし。ボスは通常半径5。噴式機（橘花改/噴式景雲改）配備時は特殊仕様で半径2扱い。右側遠方マスは最大半径8。'}},
  '6-5':{los:{coef:null,summary:'主なボス到達は艦種・速力・ルート条件中心。'},base:{available:true,sorties:2,bossRadius:5,note:'2部隊まで出撃可能。ボス必要半径5。ボス集中が基本。'}},
  '7-4':{los:{coef:4,summary:'J分岐は33未満でK、33〜37未満はK/Lランダム、37以上でL/P条件へ。M分岐は45未満でN、45〜47未満はN/Oランダム、47以上でO（特定重量条件時）。'},base:{available:true,sorties:1,bossRadius:2,note:'1部隊出撃可能・空襲なし。最寄りの潜水Cマスでも必要半径7。Pボスの必要半径は2。'}},
  '7-5':{los:{coef:4,summary:'I分岐は59以上でM、53〜58はL/Mランダム、52以下でL。ほかにも段階ゲージごとに索敵分岐あり。'},base:{available:false}}
};

// Extra verified enemy patterns. These augment HD_NODE_DETAIL_OVERRIDES without replacing existing summaries.
const HD_NODE_PATTERN_DATA={
  '6-1':{
    'C':{patterns:[
      {name:'パターン1',enemy:'戦艦ル級flagship、軽母ヌ級flagship、重巡リ級elite、軽巡ツ級、駆逐イ級後期型×2',formation:'複縦',air:'敵制空値23 / 優勢35 / 確保69'},
      {name:'パターン2',enemy:'戦艦ル級flagship、軽母ヌ級flagship、重巡リ級flagship、軽巡ツ級、駆逐ロ級後期型×2',formation:'単縦',air:'敵制空値23前後'}
    ],source:'攻略Wiki 6-1（2026-08-31確認）'}
  },
  '6-2':{
    'B':{patterns:[
      {name:'代表例',enemy:'重巡リ級flagship、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型×3',formation:'複縦',air:'空母を含むため制空・対空砲火に注意'}
    ],source:'攻略Wiki 6-2（2026-09-17確認）'}
  },
  '7-4':{
    'P':{patterns:[
      {name:'削りA',enemy:'ヒ船団棲姫(A)、駆逐イ級後期型×2、潜水ソ級elite×3',formation:'輪形',air:'敵制空93 / 優勢140 / 確保279 / 半径2'},
      {name:'削りB',enemy:'ヒ船団棲姫(B)、駆逐イ級後期型×2、潜水ソ級elite×3',formation:'輪形',air:'敵制空97 / 優勢146 / 確保291 / 半径2'},
      {name:'最終A',enemy:'ヒ船団棲姫-壊(A)、軽巡ツ級elite、駆逐イ級後期型×2、潜水ソ級flagship、潜水ソ級elite',formation:'輪形',air:'敵制空154 / 優勢231 / 確保462 / 半径2'},
      {name:'最終B',enemy:'ヒ船団棲姫-壊(B)、軽巡ツ級elite、駆逐ロ級後期型elite×2、潜水ソ級flagship、潜水ソ級elite',formation:'輪形',air:'敵制空157 / 優勢234 / 確保471 / 半径2'}
    ],source:'攻略Wiki 7-4（2026-09-17確認）'}
  },
  '7-5':{
    'A':{patterns:[
      {name:'空襲・弱',enemy:'飛行場姫(陸爆中)',formation:'輪形',air:'敵制空48 / 優勢72 / 確保144'},
      {name:'空襲・強',enemy:'飛行場姫(鳥黒弱)＋飛行場姫(陸爆弱)',formation:'輪形',air:'敵制空169 / 優勢254 / 確保507'}
    ],source:'攻略Wiki 7-5（2026-09-17確認）'}
  }
};

Object.entries(HD_NODE_PATTERN_DATA).forEach(([map,nodes])=>{
  HD_NODE_DETAIL_OVERRIDES[map]??={};
  Object.entries(nodes).forEach(([node,data])=>{
    HD_NODE_DETAIL_OVERRIDES[map][node]={...(HD_NODE_DETAIL_OVERRIDES[map][node]||{}),...data};
  });
});
