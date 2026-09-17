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

function detailBlock(label,value){return `<div class="map-detail-row"><div class="map-detail-label">${label}</div><div class="map-detail-value">${esc(value??'')}</div></div>`}

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
 card.innerHTML=`<article class="guide-card selected map-detail-card"><div class="guide-card-top"><div><span class="guide-tag">${selectedMap}</span><h3>${esc(d.name||selectedMap)}</h3><div class="muted">アプリ内攻略要点・参照 ${esc(updated)}</div></div></div><p class="map-overview">${esc(d.overview||'')}</p><div class="map-detail-grid">${detailBlock('おすすめ編成',fleet)}${detailBlock('ルート',d.route)}${detailBlock('制空・装備',d.air)}${detailBlock('注意点',note)}</div><div class="map-source-note">※攻略条件はアップデートや編成条件で変化する場合があります。</div><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">元Wikiで最新情報を確認 ↗</a></article>`;
};

renderGuide();