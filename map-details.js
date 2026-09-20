Object.assign(MAP_DETAILS,{
'1-1':{name:'鎮守府正面海域',overview:'最初から開放されている海域。敵は駆逐・軽巡中心で、序盤の艦隊でも攻略しやすい。',fleet:'駆逐艦を中心に2〜4隻程度から。戦力が整えば少数編成でも周回しやすい。',route:'どちらのルートでも戦闘は2回。編成数が少ないほどボス側へ進みやすい傾向がある。',air:'敵空母は出ないため、制空を意識する必要はほぼない。',note:'序盤のキラ付け・任務消化でもよく使う海域。',updated:'2026-08-11'},
'1-2':{name:'南西諸島沖',overview:'序盤の小規模海域。軽量な水雷戦隊で進めやすい。',fleet:'5隻以下の軽量編成を基本に、駆逐・海防艦を多めにするとルートを制御しやすい。',route:'少数かつ駆逐・海防艦を多く含む編成でボス方面を狙いやすい。',air:'航空戦力への依存は小さく、砲撃・雷撃中心で十分。',note:'低速艦や重い編成を増やすより、序盤は軽い編成が扱いやすい。',updated:'2026-09'},
'1-3':{name:'製油所地帯沿岸',overview:'敵重巡・戦艦が初登場し、序盤では被害が急に増えやすい海域。',fleet:'軽巡・駆逐を軸にしつつ、戦力不足なら空母系や重巡を加えて火力を補う。',route:'空母系を含むと開始分岐が変化。ルートによってはうずしおを通る。',air:'空母を使う場合は艦戦も載せて制空を確保。',note:'大破した艦が出たら進軍しない。うずしお対策には電探が有効。',updated:'2026-08-12'},
'1-4':{name:'南西諸島防衛線',overview:'序盤で敵空母が本格的に登場する海域。ここから制空権を意識した編成が重要になる。',fleet:'軽空母・空母を1〜2隻、巡洋艦や駆逐艦を合わせる編成が扱いやすい。',route:'駆逐・海防艦を複数入れた軽めの編成はルート制御に使いやすい。',air:'艦戦を装備し、航空優勢以上を狙う。',note:'敵空母への対策として対空装備も少し意識すると安定しやすい。',updated:'2026-08-07'},
'1-5':{name:'鎮守府近海',overview:'潜水艦が中心のExtra Operation。ボス旗艦を4回撃沈するとゲージ破壊。',fleet:'対潜できる艦を中心に4隻程度の小編成。海防艦・駆逐・軽巡・航空戦艦などを用途に応じて組む。',route:'小編成での対潜攻略が基本。',air:'通常の制空より対潜装備を優先。ソナー・爆雷系を用意する。',note:'可能なら先制対潜を使える艦を揃えると安定。月ごとにゲージが復活する。',updated:'2026-09-06'},
'1-6':{name:'鎮守府近海航路',overview:'ボス撃破ではなく、ゴール地点へ7回到達してゲージを破壊するEO。',fleet:'軽巡・駆逐中心の軽量編成が定番。航路護衛を意識した防空・対潜装備が有効。',route:'ゴールN到達ごとにゲージが1/7減少。',air:'航空戦マスがあるため対空カットインなどの防空対策が役立つ。',note:'戦艦・高速戦艦・正規空母・装甲空母・雷巡・潜水艦系は出撃不可。航空戦艦は出撃可能。',updated:'2026-09'},
'2-1':{name:'南西諸島近海',overview:'南西諸島海域の入口。空母を含む敵編成が増え、デイリー任務でも使いやすい。',fleet:'空母系を含めた6隻編成で火力と制空を確保すると攻略しやすい。',route:'編成によって複数の分岐があるため、任務条件がなければ火力重視でも進めやすい。',air:'敵空母が出るため艦戦を準備し、制空権を渡さないことを優先。',note:'南西諸島方面の任務消化候補として使いやすい。',updated:'2026-09-16'},
'2-2':{name:'バシー海峡',overview:'ボーキサイト回収や補給艦関連任務でよく使われる海域。',fleet:'通常攻略は空母系を含む編成が扱いやすい。補給艦狙いでは戦艦級0・空母3以上の編成でBマス固定が可能。',route:'目的がボス攻略か補給艦狩りかで編成を切り替えると便利。',air:'敵空母が出る場合に備えて艦戦を搭載。',note:'デイリーの補給艦撃破任務消化に向く。',updated:'2026-09-14'},
'2-3':{name:'東部オリョール海',overview:'任務対象になることが非常に多い海域。燃料・弾薬の資源マスもある。',fleet:'初攻略は戦艦・空母を含む主力編成でOK。戦艦+空母系を4隻以下にするとボスへ向かいやすい。',route:'軽巡1+駆逐4以上、または軽巡1+重巡5でボス固定が可能だが、初攻略では火力不足に注意。',air:'ボスに空母がいるため制空権を確保できるよう艦戦を用意。',note:'ボスには戦艦ル級flagshipが出るため、制空を失うと危険。',updated:'2026-07-29'},
'2-4':{name:'沖ノ島海域',overview:'序盤の大きな壁になりやすい海域。ルートが複雑で、敵戦力もそれまでより強い。',fleet:'初回攻略例：戦艦1・正規空母1・軽空母1・重巡/雷巡2・駆逐1。大型艦だけで固めない。',route:'戦艦・正規空母ばかりにすると遠回りや逸れが起きやすい。',air:'空母2隻前後を使い、艦戦を載せてボスまで制空を維持する。',note:'改造済み・近代化改修済みの主力艦を揃えてから挑戦すると安定。',updated:'2026-08-20'},
'2-5':{name:'沖ノ島沖',overview:'南西諸島のEO。ボス旗艦を4回撃沈してゲージ破壊。勲章と特別戦果を獲得できる。',fleet:'北ルート例：航巡2を含む重巡級・戦艦級中心。南ルートでは空母系を含む編成も選択肢。',route:'大きく北ルート・北から南へ転進するルート・南ルートの3系統。',air:'南ルートなど空母系を使う場合は制空を確保。',note:'ボス到達には索敵値が重要。偵察機や電探不足に注意。月初にゲージが復活する。',updated:'2026-09-12'}

});

const HD_MAP_LEVEL_GUIDE={
 '1-1':{min:'Lv1〜',recommended:'平均Lv5〜10',note:'未改造でも攻略可能。まず操作と編成に慣れる海域。'},
 '1-2':{min:'Lv5〜',recommended:'平均Lv10〜15',note:'駆逐・海防艦中心。改造前でも進行可能。'},
 '1-3':{min:'Lv10〜',recommended:'平均Lv15〜20',note:'敵重巡・戦艦対策で火力と装甲を少し強化。'},
 '1-4':{min:'Lv15〜',recommended:'平均Lv20〜25',note:'空母系を使うなら艦戦を準備。改造艦が混ざると安定。'},
 '1-5':{min:'Lv20〜',recommended:'平均Lv30〜40',note:'Lvより対潜装備が重要。先制対潜可能艦がいると大幅に安定。'},
 '1-6':{min:'Lv30〜',recommended:'平均Lv40〜50',note:'駆逐・軽巡の改造と近代化改修、防空・対潜装備を推奨。'},
 '2-1':{min:'Lv20〜',recommended:'平均Lv25〜35',note:'空母・巡洋艦を含め、主要艦の改造を進めると安定。'},
 '2-2':{min:'Lv20〜',recommended:'平均Lv30〜40',note:'目的別編成が中心。改造済み艦を増やすと事故が減る。'},
 '2-3':{min:'Lv25〜',recommended:'平均Lv35〜45',note:'戦艦・空母を使う主力艦は改造・火力/装甲改修を進めたい。'},
 '2-4':{min:'Lv30〜35',recommended:'平均Lv40〜50',note:'主力は改造済み＋火力/装甲の近代化改修MAX級を推奨。'},
 '2-5':{min:'Lv40〜',recommended:'平均Lv55〜70',note:'改造・近代化済みを前提に、索敵装備と夜戦火力も確保。'},
 '3-1':{min:'Lv35〜',recommended:'平均Lv45〜55',note:'2-4突破艦隊を土台に、主力艦の近代化改修を進める。'},
 '3-2':{min:'Lv35〜',recommended:'平均Lv50〜65',note:'軽巡・駆逐の練度が重要。改造・近代化済み＋電探を推奨。'},
 '3-3':{min:'Lv40〜',recommended:'平均Lv55〜70',note:'空母系・巡洋艦を改造済みにし、制空と開幕火力を整える。'},
 '3-4':{min:'Lv45〜',recommended:'平均Lv60〜75',note:'敵戦艦・空母が強力。主力の改造・近代化MAXと装備更新を推奨。'},
 '3-5':{min:'Lv50〜',recommended:'平均Lv65〜80',note:'上下ルートとも役割艦の育成が重要。EO向け装備も整える。'},
 '4-1':{min:'Lv35〜',recommended:'平均Lv45〜60',note:'水上・対潜の両対応。駆逐/軽巡も改造済みだと安定。'},
 '4-2':{min:'Lv40〜',recommended:'平均Lv50〜65',note:'制空を確保しつつ、軽量艦の装甲・回避不足を育成で補う。'},
 '4-3':{min:'Lv45〜',recommended:'平均Lv60〜70',note:'対地装備が最優先。重巡級など主力は近代化MAX推奨。'},
 '4-4':{min:'Lv50〜',recommended:'平均Lv65〜80',note:'ゲージ攻略を見据え、駆逐を含む固定要員も十分育成する。'},
 '4-5':{min:'Lv60〜',recommended:'平均Lv75〜90',note:'高難度EO。対地・制空・速力条件を満たせる主力艦隊向け。'},
 '5-1':{min:'Lv50〜',recommended:'平均Lv65〜80',note:'南方海域以降は改造・近代化MAXを基本に、任務指定艦も育成。'},
 '5-2':{min:'Lv55〜',recommended:'平均Lv70〜85',note:'制空・索敵・火力を両立。空母系を中心に主力を十分育成。'},
 '5-3':{min:'Lv60〜',recommended:'平均Lv75〜90',note:'夜戦回避・命中のため練度が効きやすい。夜戦装備も重要。'},
 '5-4':{min:'Lv60〜',recommended:'平均Lv75〜90',note:'上・下ルートの役割艦を改造・近代化済みにして挑戦。'},
 '5-5':{min:'Lv70〜',recommended:'平均Lv85〜100',note:'高難度EO。Lvだけでなく支援・制空・索敵・特殊砲撃の準備も重要。'},
 '5-6':{min:'Lv80〜',recommended:'平均Lv90〜110',note:'複数段階の高難度EO。主力・対空・輸送要員を広く高練度で揃える。'},
 '6-1':{min:'Lv60〜',recommended:'平均Lv75〜90',note:'潜水艦主体の特殊海域。潜水艦の改造・装備・回避力を重視。'},
 '6-2':{min:'Lv65〜',recommended:'平均Lv80〜95',note:'軽量ルートでは被弾リスクが高い。索敵と主力艦の練度を両立。'},
 '6-3':{min:'Lv65〜',recommended:'平均Lv80〜95',note:'出撃艦種が限定。水母・軽巡・駆逐の高練度化が安定に直結。'},
 '6-4':{min:'Lv70〜',recommended:'平均Lv85〜100',note:'対地装備の質がLv以上に重要。基地航空隊と対地艦を整える。'},
 '6-5':{min:'Lv75〜',recommended:'平均Lv90〜105',note:'高難度EO。基地航空隊・制空・対空・夜戦火力まで総合力が必要。'},
 '7-1':{min:'Lv50〜',recommended:'平均Lv60〜75',note:'先制対潜の可否が最重要。対潜値と装備条件を優先。'},
 '7-2':{min:'Lv55〜',recommended:'平均Lv70〜85',note:'第1ゲージは対潜、第2ゲージは制空と水上火力を重視。'},
 '7-3':{min:'Lv50〜',recommended:'平均Lv65〜80',note:'史実艦ルート固定が重要。指定艦を優先して育成。'},
 '7-4':{min:'Lv70〜',recommended:'平均Lv85〜100',note:'強力な潜水艦対策が必要。先制対潜艦を複数高練度で用意。'},
 '7-5':{min:'Lv70〜',recommended:'平均Lv85〜100',note:'複数ゲージ対応。対潜・対地・水上戦の役割艦を幅広く育成。'}
};
function hdMapLevelGuide(map){return HD_MAP_LEVEL_GUIDE[String(map||'')]||{min:'目安なし',recommended:'個別確認',note:'編成・装備・改造状況を優先して判断。'}}
window.hdMapLevelGuide=hdMapLevelGuide;

function detailBlock(label,value){return `<div class="map-detail-row"><div class="map-detail-label">${label}</div><div class="map-detail-value">${esc(value??'')}</div></div>`}

function hdMapFallbackToolsHtml(){
 if(typeof window.hdCoreMapToolsHtml==='function')return window.hdCoreMapToolsHtml();
 return `<section class="hd-core-map-tools" data-hd-core-map-tools>
  <div class="hd-core-map-tools-head"><div><span class="eyebrow">攻略ツール</span><strong>この海域で使える機能</strong></div><small>基本入口</small></div>
  <div class="hd-core-map-tools-grid">
   <button type="button" data-hd-core-map-action="map">マップ詳細</button>
   <button type="button" data-hd-core-map-action="fleet">編成</button>
   <button type="button" data-hd-core-map-action="suggest">編成候補</button>
   <button type="button" data-hd-core-map-action="prep">出撃準備</button>
   <button type="button" data-hd-core-map-action="gear">装備・計算</button>
   <button type="button" data-hd-core-map-action="drop">ドロップ</button>
   <button type="button" data-hd-core-map-action="mine">自分用</button>
  </div>
 </section>`;
}

renderMapPicker=function(){
 const world=document.getElementById('worldPicker'), maps=document.getElementById('mapPicker'), card=document.getElementById('selectedMapCard');
 if(!world||!maps||!card)return;
 world.innerHTML=Object.keys(MAPS).map(w=>`<button class="world-chip ${selectedWorld===w?'active':''}" data-world="${w}">${w}海域</button>`).join('');
 maps.innerHTML=MAPS[selectedWorld].map(m=>`<button class="map-button ${selectedMap===m?'active':''}" data-map="${m}">${m}</button>`).join('');
 if(!selectedMap){card.innerHTML='<div class="empty">海域を選ぶとここに攻略情報が出るよ</div>';return}
 const d=MAP_DETAILS[selectedMap];
 if(!d){card.innerHTML=`<article class="guide-card selected"><div class="guide-card-top"><div><span class="guide-tag">海域</span><h3>${selectedMap} 攻略</h3><div class="muted">攻略データ拡充中</div></div></div><p>この海域は現在アプリ内データを整備中。元Wikiでは最新のルート・敵編成・制空値を確認できるよ。</p><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">${selectedMap} の攻略Wikiを見る ↗</a></article>`;return}
 const fleet=d.fleet||d.formation||'';
 const note=d.note||d.caution||'';
 const updated=d.updated||d.sourceDate||'参照日未設定';
 card.innerHTML=`<article class="guide-card selected map-detail-card"><div class="guide-card-top"><div><span class="guide-tag">${selectedMap}</span><h3>${esc(d.name||selectedMap)}</h3><div class="muted">アプリ内攻略要点・参照 ${esc(updated)}</div></div></div><p class="map-overview">${esc(d.overview||'')}</p>${hdMapFallbackToolsHtml()}<div class="map-detail-grid">${detailBlock('推奨練度',(()=>{const lv=hdMapLevelGuide(selectedMap);return lv.recommended+' / 最低目安 '+lv.min+'。'+lv.note})())}${detailBlock('おすすめ編成',fleet)}${detailBlock('ルート',d.route)}${detailBlock('制空・装備',d.air)}${detailBlock('注意点',note)}</div><div class="map-source-note">※推奨練度はHarborDeskの攻略目安。艦種・改造・近代化改修・装備・ルート条件によって必要Lvは変わります。攻略条件はアップデートで変化する場合があります。</div><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">元Wikiで最新情報を確認 ↗</a></article>`;
};

renderGuide();