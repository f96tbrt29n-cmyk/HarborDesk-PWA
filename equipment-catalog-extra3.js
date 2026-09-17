HD_EQUIPMENT_CATALOG.push(
 {name:'改良型艦本式タービン',category:'機関部強化',stats:{回避:6},tags:['補強増設','高速化','機関'],improve:'改修不可',obtain:'開発可能。初期装備・任務等。',update:'強化缶/新型缶との組み合わせで速力を上げる。',role:'補強増設に搭載できる高速化の中核。',equip:'多くの水上艦。海防艦など一部は不可。',special:'缶系と同時装備すると速力上昇。高速+や最速ルート調整で使う。'},
 {name:'強化型艦本式缶',category:'機関部強化',stats:{回避:10},tags:['高速化','機関','改修'],improve:'改修可',obtain:'開発可能。',update:'新型高温高圧缶へ更新可能。',role:'タービンと組み合わせる高速化用の基本缶。',equip:'多くの水上艦。補強増設は一部艦のみ。',special:'改良型艦本式タービンとの併用で速力を強化。'},
 {name:'新型高温高圧缶',category:'機関部強化',stats:{回避:13},tags:['高速化','機関','高回避'],improve:'改修可',obtain:'開発不可。強化型艦本式缶から更新、初期装備等。',update:'上位の高速化用缶。',role:'強化缶より高回避。高速+・最速調整で重要。',equip:'多くの水上艦。補強増設は一部艦のみ。',special:'タービン併用で速力上昇。★+7以上では一部艦で単独高速化効果もある。'},
 {name:'増設バルジ(中型艦)',category:'増設バルジ',stats:{装甲:7,回避:-2},tags:['補強増設','装甲','耐久'],improve:'改修可',obtain:'開発可能。任務・初期装備等。',update:'艦本新設計 増設バルジ(中型艦)へ更新可。',role:'中型艦の装甲を増やし道中被害を抑える。',equip:'重巡・航巡・軽空母・水母ほか対応艦。',special:'補強増設に搭載可能。回避低下と引き換えに装甲を上げる。'},
 {name:'増設バルジ(大型艦)',category:'増設バルジ',stats:{装甲:9,回避:-3},tags:['補強増設','装甲','戦艦','空母'],improve:'改修可',obtain:'開発可能。任務・初期装備等。',update:'艦本新設計 増設バルジ(大型艦)等へ更新可。',role:'戦艦・正規空母系の装甲補強。',equip:'戦艦・航戦・正規空母・装甲空母など。',special:'補強増設に搭載可能。長丁場の被ダメ軽減に使う。'},
 {name:'艦本新設計 増設バルジ(中型艦)',category:'増設バルジ',stats:{装甲:8,回避:-1},tags:['補強増設','装甲','上位バルジ'],improve:'改修可',obtain:'増設バルジ(中型艦)から更新、任務等。',update:'中型バルジの上位。',role:'回避ペナルティを抑えつつ装甲+8。',equip:'中型バルジ対応艦。',special:'補強増設に搭載可能。'},
 {name:'艦本新設計 増設バルジ(大型艦)',category:'増設バルジ',stats:{装甲:10,回避:-2},tags:['補強増設','装甲','上位バルジ'],improve:'改修可',obtain:'増設バルジ(大型艦)から更新、任務等。',update:'大型バルジの上位。',role:'大型艦用の強力な装甲補強。',equip:'大型バルジ対応艦。',special:'補強増設に搭載可能。'},
 {name:'艦隊司令部施設',category:'司令部施設',stats:{対空:1,索敵:1,命中:1,回避:1},tags:['連合艦隊','護衛退避','イベント'],improve:'改修不可',obtain:'大淀改の初期装備など。',update:'遊撃部隊/水雷戦隊司令部とは用途が別。',role:'連合艦隊の旗艦で護衛退避を使うための司令部。',equip:'軽巡級以上の中大型艦など。',special:'連合艦隊専用。大破艦1隻＋護衛駆逐1隻の2隻を退避させる。'},
 {name:'遊撃部隊 艦隊司令部',category:'司令部施設',stats:{索敵:1,命中:1,回避:1},tags:['遊撃部隊','単艦退避','イベント'],improve:'改修不可',obtain:'任務「「遊撃部隊」艦隊司令部の創設」報酬。',update:'艦隊司令部施設とは退避仕様が異なる。',role:'7隻遊撃部隊で単艦退避を使う司令部。',equip:'司令部施設を搭載可能な中大型艦。',special:'遊撃部隊で大破艦1隻を単艦退避できる。'},
 {name:'精鋭水雷戦隊 司令部',category:'司令部施設',stats:{雷装:3,索敵:1,命中:2},tags:['水雷戦隊','単艦退避','夜戦'],improve:'改修不可',obtain:'イベント・ランキング等。',update:'一部艦では補強増設に搭載可能。',role:'水雷戦隊向けの司令部。戦闘力も補強する。',equip:'軽巡級以上の司令部搭載艦など。',special:'水雷戦隊編成で単艦退避が可能。通常艦隊/遊撃部隊で使用条件が異なる。'},
 {name:'水雷戦隊 熟練見張員',category:'水上艦要員',stats:{雷装:3,対空:1,索敵:2,命中:2,回避:3},range:'中',tags:['補強増設','夜戦','魚雷CI','PT対策'],improve:'改修不可',obtain:'イベント・ランキング等。',update:'水雷戦隊向けの上位見張員。',role:'駆逐・軽巡の夜戦カットインやPT対策に強い。',equip:'駆逐・軽巡など。補強増設に搭載可能。',special:'水雷戦隊系の夜戦カットイン補助に有効。'},
 {name:'96式150cm探照灯',category:'大型探照灯',stats:{対空:1,索敵:3},tags:['夜戦','探照灯','戦艦'],improve:'改修可',obtain:'探照灯から改修更新。',update:'大型探照灯。',role:'夜戦支援効果が強い代わりに装備艦へ攻撃が集中しやすい。',equip:'基本的に戦艦級。',special:'夜戦時に味方を支援。装備艦の被狙撃リスクに注意。'},
 {name:'紫雲',category:'水上偵察機',stats:{爆装:1,対潜:2,索敵:8,命中:1},radius:4,tags:['索敵','水偵','弾着'],improve:'改修可',obtain:'任務・ランキング等。',update:'上位に紫雲(熟練)。',role:'索敵+8の高性能水偵。索敵判定と弾着観測に強い。',equip:'水偵を搭載可能な巡洋艦・戦艦・水母など。',special:'高索敵で2-5等の索敵要求海域に使いやすい。'},
 {name:'紫雲(熟練)',category:'水上偵察機',stats:{爆装:1,対潜:4,索敵:9,命中:2,回避:2},radius:5,tags:['索敵','水偵','上位'],improve:'改修不可',obtain:'ランキング等。',update:'紫雲の上位熟練機。',role:'水偵トップ級の素索敵を持つ。',equip:'水偵搭載可能艦。',special:'索敵・命中・回避をまとめて補強。'},
 {name:'瑞雲改二(六三四空)',category:'水上爆撃機',stats:{火力:2,爆装:10,対空:4,対潜:6,索敵:7,命中:2,回避:1},radius:5,tags:['瑞雲','制空','索敵','航空戦艦'],improve:'改修可',obtain:'瑞雲(六三四空/熟練)から更新、任務等。',update:'試製 夜間瑞雲(攻撃装備)へ更新可能。',role:'制空・爆撃・索敵・対潜を1枠でこなす高性能瑞雲。',equip:'航戦・航巡・水母など水爆搭載艦。',special:'航空戦と索敵を両立。海域により熟練度損耗には注意。'},
 {name:'噴式景雲改',category:'噴式戦闘爆撃機',stats:{爆装:15,対空:6,索敵:3,命中:1},range:'長',radius:3,tags:['噴式','空母','基地航空隊'],improve:'改修不可',obtain:'試製景雲(艦偵型)から更新。',update:'運用時に鋼材を消費。',role:'高爆装の噴式機。噴式強襲を行える。',equip:'一部装甲空母系・基地航空隊。',special:'噴式強襲フェーズに参加。通常航空戦とは別に鋼材を消費する。'},
 {name:'橘花改',category:'噴式戦闘爆撃機',stats:{爆装:11,対空:12,回避:1},range:'長',radius:2,tags:['噴式','空母','制空','基地航空隊'],improve:'改修不可',obtain:'任務「噴式戦闘爆撃機の開発」等。',update:'運用時に鋼材を消費。',role:'対空12を持つ噴式戦闘爆撃機。制空と攻撃を両立。',equip:'翔鶴改二甲・瑞鶴改二甲・加賀改二護・一部空母、基地航空隊。',special:'噴式強襲に参加。高い対空射撃回避力を持つ。'}
);

// v27: render signed values correctly, including bulge evasion penalties.
hdEquipStatText=function(item){
 const parts=Object.entries(item.stats||{}).map(([k,v])=>`${k}${Number(v)>=0?'+':''}${v}`);
 if(item.range)parts.push(`射程 ${item.range}`);
 if(item.radius!=null)parts.push(`半径 ${item.radius}`);
 return parts;
};

// v27: show equipability / special-effect fields when available.
hdRenderEquipmentCatalog=function(){
 const list=document.getElementById('hdEquipCatalogList');if(!list)return;
 const q=(document.getElementById('hdEquipCatalogSearch')?.value||'').trim().toLowerCase();
 const rows=HD_EQUIPMENT_CATALOG.filter(x=>(hdEquipCatalogFilter==='すべて'||x.category===hdEquipCatalogFilter)&&(!q||`${x.name} ${x.category} ${(x.tags||[]).join(' ')} ${x.role} ${x.obtain} ${x.update} ${x.equip||''} ${x.special||''}`.toLowerCase().includes(q)));
 document.getElementById('hdEquipCatalogCount').textContent=`${rows.length}件`;
 list.innerHTML=rows.map(x=>`<article class="hd-equip-ref-card"><div class="hd-equip-ref-head"><div><strong>${hdEsc(x.name)}</strong><div class="muted">${hdEsc(x.category)}</div></div><button class="primary small" type="button" data-hd-equip-add="${hdEsc(x.name)}">台帳へ追加</button></div><div class="hd-equip-stats">${hdEquipStatText(x).map(s=>`<span>${hdEsc(s)}</span>`).join('')||'<span>特殊効果装備</span>'}</div><div class="hd-equip-tags">${(x.tags||[]).map(t=>`<span>${hdEsc(t)}</span>`).join('')}</div><p>${hdEsc(x.role)}</p><div class="hd-equip-ref-grid"><div><span>改修</span><strong>${hdEsc(x.improve)}</strong></div><div><span>入手</span><strong>${hdEsc(x.obtain)}</strong></div>${x.equip?`<div class="wide"><span>主な搭載</span><strong>${hdEsc(x.equip)}</strong></div>`:''}${x.special?`<div class="wide"><span>特殊効果・注意</span><strong>${hdEsc(x.special)}</strong></div>`:''}<div class="wide"><span>更新・補足</span><strong>${hdEsc(x.update)}</strong></div></div><a class="guide-link" href="${hdEquipWikiUrl(x.name)}" target="_blank" rel="noopener">攻略Wikiで詳細 ↗</a></article>`).join('')||'<div class="empty">条件に合う装備がないよ</div>';
};
