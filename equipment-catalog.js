const HD_EQUIPMENT_CATALOG=[
 {name:'10cm連装高角砲＋高射装置',category:'小口径主砲',stats:{火力:3,対空:10,命中:1,回避:1},range:'短',tags:['防空','駆逐','対空CI'],improve:'改修可',obtain:'開発不可。秋月型の初期装備や改修更新など。',update:'10cm連装高角砲改＋高射装置改へ更新可。',role:'駆逐艦の主砲と艦隊防空を両立。対空カットイン用の定番。'},
 {name:'零式艦戦53型(岩本隊)',category:'艦上戦闘機',stats:{対空:12,索敵:3,命中:2,回避:4},radius:6,tags:['制空','艦戦','一点物'],improve:'改修可',obtain:'任務「機種転換＆部隊再編」報酬。常設で1個入手可能。',update:'一点物。誤廃棄注意。',role:'高対空の主力艦戦。制空値を稼ぎつつ命中・回避も補える。'},
 {name:'試製烈風 後期型',category:'艦上戦闘機',stats:{対空:10},radius:5,tags:['制空','艦戦','量産'],improve:'改修可',obtain:'開発・初期装備など。',update:'制空用の量産枠。',role:'入手しやすい対空10艦戦。上位艦戦が足りない時の制空要員。'},
 {name:'彩雲',category:'艦上偵察機',stats:{索敵:9,命中:2},radius:8,tags:['索敵','艦偵','T不利回避'],improve:'改修不可',obtain:'開発可能。',update:'上位・派生の彩雲系あり。',role:'T字不利を高確率で回避し、索敵も大きく補う艦偵。'},
 {name:'零式水上偵察機11型乙(熟練)',category:'水上偵察機',stats:{火力:2,対空:1,対潜:8,索敵:8,命中:3},radius:7,tags:['索敵','水偵','弾着'],improve:'本体は改修不可',obtain:'任務・イベント等。常設任務で1機入手可能。',update:'高索敵・高命中の水偵。',role:'弾着観測・索敵判定・触接に強い高性能水偵。'},
 {name:'33号水上電探',category:'小型水上電探',stats:{索敵:7,命中:5},tags:['索敵','電探','ルート'],improve:'改修可',obtain:'開発可能。',update:'索敵値が必要な通常海域で使いやすい。',role:'索敵判定と命中補助の定番小型電探。'},
 {name:'四式水中聴音機',category:'ソナー',stats:{対潜:12,命中:1,装甲:1},tags:['対潜','ソナー','先制対潜'],improve:'改修可',obtain:'開発不可。改修・任務・イベント等。',update:'九三式→三式水中探信儀→四式へ更新ルートあり。',role:'高対潜ソナー。先制対潜ライン調整と対潜火力の中核。'},
 {name:'三式水中探信儀',category:'ソナー',stats:{対潜:10,命中:2},tags:['対潜','ソナー','量産'],improve:'改修可',obtain:'開発・初期装備・任務など。',update:'四式水中聴音機への更新ルートあり。',role:'量産しやすい対潜ソナー。改修・更新の素材としても重要。'},
 {name:'61cm五連装(酸素)魚雷',category:'魚雷',stats:{雷装:12,命中:1},range:'短',tags:['夜戦','魚雷CI','雷装'],improve:'改修可',obtain:'開発不可。北上改二・大井改二・木曾改二の初期装備、改修更新など。',update:'61cm四連装(酸素)魚雷から更新可。',role:'量産可能かつ改修可能な高雷装魚雷。夜戦カットインの基礎装備。'},
 {name:'九一式徹甲弾',category:'対艦強化弾',stats:{火力:8,命中:1},tags:['戦艦','昼戦','徹甲弾'],improve:'改修可',obtain:'開発可能。',update:'一式徹甲弾→一式徹甲弾改へ更新。',role:'大口径主砲と併用して昼戦火力・命中補正を伸ばす戦艦用定番。'},
 {name:'一式徹甲弾',category:'対艦強化弾',stats:{火力:9,命中:2},tags:['戦艦','昼戦','徹甲弾'],improve:'改修可',obtain:'開発不可。九一式徹甲弾から更新など。',update:'一式徹甲弾改へ更新可。',role:'九一式の上位。戦艦の昼戦火力を底上げ。'},
 {name:'三式弾',category:'対空強化弾',stats:{対空:5},tags:['対地','戦艦','重巡'],improve:'改修可',obtain:'開発可能。',update:'三式弾改へ更新可。',role:'陸上型深海棲艦への対地装備として重要。補強増設にも搭載可能。'},
 {name:'大発動艇',category:'上陸用舟艇',stats:{},tags:['遠征','輸送','対地'],improve:'改修可',obtain:'開発可能。任務・初期装備など。',update:'八九式中戦車＆陸戦隊 / 特大発動艇 / 武装大発などへ更新。',role:'遠征報酬+5%（無改修時の累積上限あり）。TP輸送と一部対地でも使用。'},
 {name:'大発動艇(八九式中戦車＆陸戦隊)',category:'上陸用舟艇',stats:{},tags:['対地','輸送','集積地'],improve:'改修可',obtain:'大発動艇から改修更新、イベント等。',update:'特二式内火艇へ更新可能。',role:'対地特効の主力。集積地・砲台などへの対地セットで重要。'},
 {name:'二式水戦改(熟練)',category:'水上戦闘機',stats:{対空:5,対潜:1,索敵:1,命中:1,回避:2},radius:4,tags:['制空','水戦','航巡'],improve:'改修可',obtain:'任務「精鋭「水戦」隊の新編成」「増勢」など。',update:'水戦による制空補助の上位枠。',role:'空母を入れにくい編成で航巡・水母などから制空値を稼ぐ。'},
 {name:'一式陸攻',category:'陸上攻撃機',stats:{雷装:10,爆装:12,対空:2,対潜:2,索敵:3},radius:9,tags:['基地航空隊','陸攻','対艦'],improve:'改修可',obtain:'開発不可。任務・改修更新など。',update:'二二型甲→三四型などへの更新系統あり。',role:'基地航空隊の基本的な陸攻。半径9で対艦・対地攻撃に使いやすい。'},
 {name:'試製東海',category:'陸上攻撃機',stats:{爆装:2,対潜:10,索敵:5},radius:8,tags:['基地航空隊','対潜','東海'],improve:'改修不可',obtain:'開発不可。任務・イベント等。',update:'基地航空隊専用。',role:'基地航空隊の対潜攻撃用。潜水マスへの派遣で非常に有効。'},
 {name:'発煙装置(煙幕)',category:'艦載発煙装置',stats:{回避:1},tags:['煙幕','道中対策','回避'],improve:'改修可',obtain:'開発可能。任務等。',update:'上位の発煙装置改(煙幕)あり。',role:'煙幕システム用。複数搭載で展開成功・煙幕強度を高めやすい。敵電探装備には注意。'}
];

let hdEquipCatalogFilter='すべて';
function hdEquipWikiUrl(name){return `https://wikiwiki.jp/kancolle/${encodeURIComponent(name)}`}
function hdEquipStatText(item){const parts=Object.entries(item.stats||{}).map(([k,v])=>`${k}+${v}`);if(item.range)parts.push(`射程 ${item.range}`);if(item.radius!=null)parts.push(`半径 ${item.radius}`);return parts}
function hdEnsureEquipmentCatalog(){
 const book=document.getElementById('equipmentBook');if(!book||document.getElementById('hdEquipmentCatalog'))return;
 const sec=document.createElement('div');sec.id='hdEquipmentCatalog';sec.className='hd-equipment-catalog';
 sec.innerHTML=`<div class="hd-equip-catalog-head"><div><div class="eyebrow">EQUIPMENT DATABASE</div><h3>攻略装備データベース</h3><p class="muted">性能・用途・改修・入手をまとめて確認。データは攻略Wikiの現行情報を要約。</p></div><span id="hdEquipCatalogCount" class="muted"></span></div><div class="hd-equip-search"><input id="hdEquipCatalogSearch" type="search" placeholder="装備名・用途・カテゴリで検索"></div><div id="hdEquipCatalogFilters" class="hd-equip-filters"></div><div id="hdEquipCatalogList" class="hd-equip-catalog-list"></div>`;
 const toolbar=book.querySelector('.advanced-toolbar');if(toolbar)book.insertBefore(sec,toolbar);else book.appendChild(sec);
 const cats=['すべて',...new Set(HD_EQUIPMENT_CATALOG.map(x=>x.category))];
 document.getElementById('hdEquipCatalogFilters').innerHTML=cats.map(c=>`<button class="ghost small${c==='すべて'?' active':''}" type="button" data-hd-equip-filter="${hdEsc(c)}">${hdEsc(c)}</button>`).join('');
 document.getElementById('hdEquipCatalogSearch').addEventListener('input',hdRenderEquipmentCatalog);
 hdRenderEquipmentCatalog();
}
function hdRenderEquipmentCatalog(){
 const list=document.getElementById('hdEquipCatalogList');if(!list)return;
 const q=(document.getElementById('hdEquipCatalogSearch')?.value||'').trim().toLowerCase();
 const rows=HD_EQUIPMENT_CATALOG.filter(x=>(hdEquipCatalogFilter==='すべて'||x.category===hdEquipCatalogFilter)&&(!q||`${x.name} ${x.category} ${(x.tags||[]).join(' ')} ${x.role} ${x.obtain} ${x.update}`.toLowerCase().includes(q)));
 document.getElementById('hdEquipCatalogCount').textContent=`${rows.length}件`;
 list.innerHTML=rows.map(x=>`<article class="hd-equip-ref-card"><div class="hd-equip-ref-head"><div><strong>${hdEsc(x.name)}</strong><div class="muted">${hdEsc(x.category)}</div></div><button class="primary small" type="button" data-hd-equip-add="${hdEsc(x.name)}">台帳へ追加</button></div><div class="hd-equip-stats">${hdEquipStatText(x).map(s=>`<span>${hdEsc(s)}</span>`).join('')||'<span>特殊効果装備</span>'}</div><div class="hd-equip-tags">${(x.tags||[]).map(t=>`<span>${hdEsc(t)}</span>`).join('')}</div><p>${hdEsc(x.role)}</p><div class="hd-equip-ref-grid"><div><span>改修</span><strong>${hdEsc(x.improve)}</strong></div><div><span>入手</span><strong>${hdEsc(x.obtain)}</strong></div><div class="wide"><span>更新・補足</span><strong>${hdEsc(x.update)}</strong></div></div><a class="guide-link" href="${hdEquipWikiUrl(x.name)}" target="_blank" rel="noopener">攻略Wikiで詳細 ↗</a></article>`).join('')||'<div class="empty">条件に合う装備がないよ</div>';
}
document.addEventListener('click',e=>{
 const f=e.target.closest('[data-hd-equip-filter]');if(f){hdEquipCatalogFilter=f.dataset.hdEquipFilter;document.querySelectorAll('[data-hd-equip-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderEquipmentCatalog();return}
 const a=e.target.closest('[data-hd-equip-add]');if(!a)return;const item=HD_EQUIPMENT_CATALOG.find(x=>x.name===a.dataset.hdEquipAdd);if(!item||typeof openEquipment!=='function')return;openEquipment({name:item.name,category:item.category,count:1,star:0,targetStar:item.improve.includes('可')?10:0,assigned:'',memo:`用途: ${item.role}\n入手: ${item.obtain}\n${item.update}`});
});
window.addEventListener('load',()=>setTimeout(hdEnsureEquipmentCatalog,80));
setTimeout(hdEnsureEquipmentCatalog,300);
