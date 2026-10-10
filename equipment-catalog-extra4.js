HD_EQUIPMENT_CATALOG.push(
 {name:'10cm連装高角砲',category:'小口径主砲',stats:{火力:2,対空:7},range:'短',tags:['高角砲','防空'],improve:'改修可',obtain:'開発・初期装備など。',role:'基本の高角砲。秋月型の対空カットイン用高角砲として使用できる。',equip:'小口径主砲搭載可能艦。',special:'汎用の特殊高角砲（素対空8以上）には該当しない。'},
 {name:'三式爆雷投射機',category:'爆雷',stats:{対潜:8},tags:['対潜','爆雷投射機'],improve:'改修可',obtain:'開発・初期装備・改修更新など。',role:'ソナーと同じ艦に載せる対潜シナジー用の爆雷投射機。',equip:'爆雷投射機搭載可能艦。',special:'装備可能艦と補強増設の可否は最新マスターで確認。'},
 {name:'九四式爆雷投射機',category:'爆雷',stats:{対潜:5},tags:['対潜','爆雷投射機'],improve:'改修可',obtain:'開発・初期装備など。',role:'基本の爆雷投射機。ソナーと併用して対潜シナジーを得る。',equip:'爆雷投射機搭載可能艦。',special:'補強増設には装備できない。'},
 {name:'21号対空電探',category:'大型電探',stats:{対空:4,索敵:4,命中:2},tags:['対空電探','防空','索敵'],improve:'改修可',obtain:'開発・初期装備など。',role:'対空カットインに使用できる大型対空電探。',equip:'大型電探搭載可能艦。',special:'一般的な駆逐艦には載せられない。素索敵5未満のため水上電探条件には含めない。'},
 {name:'応急修理要員',category:'応急修理要員',stats:{},tags:['ダメコン','補強増設','消耗品'],improve:'改修不可',obtain:'開発不可。初期所持、任務・イベント・ランキング・アイテム屋など。',update:'発動すると消滅。',role:'一度だけ轟沈を回避する消耗品。',equip:'全艦種。補強増設にも装備可能。',special:'発動後は消費される。載せ忘れ・積み替え忘れに注意。'},
 {name:'応急修理女神',category:'応急修理要員',stats:{},tags:['ダメコン','補強増設','消耗品'],improve:'改修不可',obtain:'開発不可。任務・イベント・ランキング・アイテム屋など。',update:'発動すると消滅。',role:'轟沈を一度回避し、装備艦の耐久・燃料・弾薬を全回復する上位ダメコン。',equip:'全艦種。補強増設にも装備可能。',special:'発動後は消費される。効果は装備艦のみ。'},
 {name:'洋上補給',category:'補給物資',stats:{装甲:-2},tags:['補給艦','長期戦','消耗品','補強増設'],improve:'改修不可',obtain:'開発不可。速吸/改・日枝丸改初期装備、マンスリー/クォータリー任務、イベント等。',update:'発動すると消費。',role:'長期戦で燃料・弾薬を洋上補給する。',equip:'主に補給艦運用。補強増設にも装備可能。',special:'燃料・弾薬が欠乏した航海で補給を発動。装備時は装甲-2。'},
 {name:'夜間作戦航空要員',category:'航空要員',stats:{火力:1,装甲:1},range:'中',tags:['夜戦空母','夜間航空','夜襲CI'],improve:'改修不可',obtain:'開発不可。任務等。',update:'上位に夜間作戦航空要員＋熟練甲板員。',role:'対応空母で夜間航空攻撃を可能にする航空要員。',equip:'軽空母・正規空母など対応艦。',special:'夜間戦闘機/夜間攻撃機との組み合わせで空母夜戦・夜襲カットインに使用。'},
 {name:'夜間作戦航空要員＋熟練甲板員',category:'航空要員',stats:{火力:3,命中:2,回避:1,装甲:1},range:'長',tags:['夜戦空母','夜間航空','夜襲CI','射程延長'],improve:'改修不可',obtain:'開発不可。任務等。',update:'夜間作戦航空要員の上位。',role:'空母の夜間航空攻撃支援と射程延長を両立。',equip:'軽空母・正規空母など対応艦。',special:'夜間航空攻撃を可能にし、射程を長へ延長する。'},
 {name:'F6F-3N',category:'艦上戦闘機',stats:{対空:8,対潜:4,索敵:2,命中:2,回避:3},radius:5,tags:['夜戦','夜間戦闘機','制空','夜襲CI'],improve:'改修不可',obtain:'開発不可。任務による機種転換など。',update:'F6F-5N入手任務の前提系統。',role:'夜戦空母用の夜間戦闘機。昼は通常艦戦として制空参加。',equip:'空母系。',special:'夜間航空要員などと併用して空母夜戦・夜襲カットインを構成。'},
 {name:'F6F-5N',category:'艦上戦闘機',stats:{対空:10,対潜:5,索敵:3,命中:3,回避:3},radius:5,tags:['夜戦','夜間戦闘機','制空','夜襲CI'],improve:'改修不可',obtain:'開発不可。任務による機種転換など。',update:'高性能夜間戦闘機。',role:'対空10を持つ主力夜間戦闘機。昼夜両方で使いやすい。',equip:'空母系。',special:'夜間航空要員などと併用して夜間航空攻撃を支援。'},
 {name:'TBM-3D',category:'艦上攻撃機',stats:{火力:2,雷装:9,対空:1,対潜:8,索敵:4,命中:2},radius:6,tags:['夜戦','夜間攻撃機','夜襲CI'],improve:'改修不可',obtain:'開発不可。TBFから任務機種転換。',update:'TBM-3W＋3Sへ機種転換可能。',role:'空母夜戦用の夜間攻撃機。昼戦でも通常艦攻として攻撃する。',equip:'空母系。',special:'空母夜間航空攻撃・夜襲カットイン条件の一部。'},
 {name:'TBM-3W＋3S',category:'艦上攻撃機',stats:{火力:3,雷装:10,爆装:7,対潜:13,索敵:10,命中:3},radius:5,tags:['対潜','艦攻','哨戒','高索敵'],improve:'改修不可',obtain:'開発不可。TBM-3Dから任務機種転換など。',update:'高対潜・高索敵の攻撃哨戒機。',role:'対潜13・索敵10を持つ高性能艦攻。対潜支援や索敵補助にも強い。',equip:'空母系。',special:'夜攻ではなく攻撃哨戒機。夜襲装備の組み方はTBM-3Dと区別。'},
 {name:'SKレーダー',category:'大型電探',stats:{対空:8,索敵:10,命中:1,回避:2},tags:['対空電探','水上電探','索敵','うずしお'],improve:'改修可',obtain:'開発不可。初期装備・イベント・ランキング・任務等。',update:'SK＋SGレーダーへ更新可能。',role:'高索敵の大型対空/水上電探。',equip:'大型電探搭載可能艦。',special:'対空電探・水上電探の両方として扱われ、うずしお軽減にも有効。'},
 {name:'SK＋SGレーダー',category:'大型電探',stats:{火力:1,対空:9,索敵:12,命中:4,回避:4},range:'中',tags:['対空電探','水上電探','索敵','うずしお'],improve:'改修可',obtain:'開発不可。イベント・ランキング・SKレーダーから改修更新。',update:'SKレーダーの上位。',role:'索敵12・命中4・回避4を持つ高性能大型電探。',equip:'大型電探搭載可能艦。',special:'対空/水上電探扱い。射程が中になる点に注意。'},
 {name:'42号対空電探改二',category:'大型電探',stats:{対空:7,索敵:6,命中:8,回避:-1},tags:['対空電探','水上電探','命中','補強増設'],improve:'改修可',obtain:'開発不可。ランキング・改修など。',update:'特定艦で装備ボーナスあり。',role:'命中+8が特徴の高性能大型対空電探。',equip:'大型電探搭載艦。特定艦では補強増設にも装備可能。',special:'対空/水上電探扱い。回避-1。'},
 {name:'FuMO25 レーダー',category:'大型電探',stats:{火力:3,対空:7,索敵:9,命中:10},tags:['対空電探','水上電探','命中','火力'],improve:'改修可',obtain:'開発不可。Prinz Eugen改初期装備、イベント等。',update:'高火力・高命中の大型レーダー。',role:'火力+3・命中+10で砲撃支援や命中補助に強い。',equip:'大型電探搭載可能艦。',special:'対空/水上電探扱い。特定艦で装備ボーナスあり。'},
 {name:'カ号観測機',category:'回転翼機',stats:{対潜:9,命中:1},radius:1,tags:['対潜','回転翼機','対潜支援'],improve:'改修可',obtain:'特殊開発・初期装備・改修等。',update:'オ号観測機改→改二→S-51Jへ更新系統。',role:'回転翼機の基本装備。対潜支援や一部艦の対潜強化に使用。',equip:'一部の航戦・軽空母・航巡・揚陸艦など。',special:'ソナー/爆雷シナジーとは別系統。'},
 {name:'オ号観測機改二',category:'回転翼機',stats:{火力:1,対潜:11,索敵:1,命中:1},radius:1,tags:['対潜','回転翼機','対潜支援'],improve:'改修可',obtain:'開発不可。オ号観測機改から改修更新、ランキング等。',update:'S-51Jへ更新可能。',role:'対潜11の高性能回転翼機。',equip:'一部の航戦・軽空母・航巡・揚陸艦など。',special:'対潜支援目的ではS-51Jまで更新すると威力が一段上がる。'},
 {name:'S-51J',category:'回転翼機',stats:{火力:2,対潜:12,索敵:3,命中:2},radius:2,tags:['対潜','ヘリ','先制対潜','対潜支援'],improve:'改修可',obtain:'開発不可。任務選択報酬、オ号観測機改二から更新。',update:'S-51J改へ更新可能。',role:'高対潜の艦載ヘリ。日向改二では先制対潜にも利用可能。',equip:'一部の航戦・軽空母・航巡・揚陸艦など。',special:'日向改二に1枠以上で先制対潜可能。'},
 {name:'S-51J改',category:'回転翼機',stats:{火力:2,対潜:13,索敵:4,命中:3},radius:2,tags:['対潜','ヘリ','先制対潜','対潜支援'],improve:'改修可',obtain:'開発不可。S-51Jから改修更新。',update:'S-51Jの上位。',role:'対潜13・索敵4・命中3の上位艦載ヘリ。',equip:'一部の航戦・軽空母・航巡・揚陸艦など。',special:'日向改二の先制対潜補助。対潜支援ではS-51Jと威力/命中が同等になる場合がある。'},
 {name:'後期型艦首魚雷(6門)',category:'潜水艦魚雷',stats:{雷装:15,命中:3,回避:1},range:'短',tags:['潜水艦','魚雷CI','後期型'],improve:'改修可',obtain:'開発可能。任務・ランキング等。',update:'熟練聴音員＋後期型艦首魚雷(6門)の入手任務に使用。',role:'雷装15の使いやすい潜水艦専用後期型魚雷。',equip:'潜水艦・潜水空母のみ。',special:'後期型潜水艦魚雷として専用魚雷カットインに関係。'},
 {name:'熟練聴音員＋後期型艦首魚雷(6門)',category:'潜水艦魚雷',stats:{雷装:15,索敵:1,命中:5,回避:4},range:'短',tags:['潜水艦','魚雷CI','後期型','高命中'],improve:'改修不可',obtain:'開発不可。任務・ランキング等。',update:'後期型艦首魚雷(6門)の上位系統。',role:'雷装15に命中5・回避4を備える潜水艦用高性能魚雷。',equip:'潜水艦・潜水空母のみ。',special:'後期型潜水艦魚雷として専用魚雷カットインに関係。'},
 {name:'潜水艦搭載電探＆逆探(E27)',category:'潜水艦装備',stats:{火力:1,対空:1,索敵:5,命中:3,回避:11},tags:['潜水艦','索敵','補強増設','回避'],improve:'改修可',obtain:'開発不可。伊13改初期装備、改修更新等。',update:'潜水艦搭載電探＆水防式望遠鏡から更新。',role:'索敵と回避を大きく補う潜水艦専用電探。',equip:'潜水艦・潜水空母のみ。補強増設にも装備可能。',special:'回避+11が特徴。潜水艦の補強増設枠を活用できる。'}
);
// Keep the performance catalog complete using the same captured game master
// as the ship compatibility checker. Hand-written acquisition notes stay intact.
function hdEquipApplyMasterPerformance(){
 const snap=window.HD_KANCOLLE_MASTER_SNAPSHOT;if(!snap?.equipment)return;
 const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・'),byName=new Map(HD_EQUIPMENT_CATALOG.map(x=>[norm(x.name),x]));
 const categories={25:'回転翼機',38:'大口径主砲',91:'噴式戦闘爆撃機',93:'大型電探',94:'艦上偵察機',95:'副砲'};
 const tags={6:['制空','艦戦'],7:['艦爆'],8:['艦攻'],9:['索敵','艦偵'],10:['索敵','水偵'],11:['水爆'],12:['電探'],13:['電探'],14:['対潜','ソナー'],15:['対潜'],21:['防空'],24:['輸送'],25:['対潜'],26:['対潜'],40:['対潜','ソナー'],45:['制空','水戦'],47:['基地航空隊','陸攻'],48:['基地航空隊'],49:['基地航空隊','索敵'],57:['噴式'],91:['噴式'],93:['電探'],94:['索敵','艦偵']};
 let added=0,registered=0;
 for(const [name,meta] of Object.entries(snap.equipment)){
  if(!meta.stats||!Object.values(meta.stats).every(Number.isFinite))continue;
  const key=norm(name);let item=byName.get(key);
  if(!item){item={name,category:categories[meta.typeId]||meta.typeName||'その他',tags:tags[meta.typeId]||[],improve:'未確認',obtain:'入手方法は攻略Wikiで確認。',update:'特殊効果・改修効果・艦固有ボーナスは別途確認。',role:'装備マスターの基本性能を登録。'};HD_EQUIPMENT_CATALOG.push(item);byName.set(key,item);added++}
  item.stats=Object.fromEntries(Object.entries(meta.stats).filter(([,v])=>v!==0));item.range=meta.range||'';
  if(meta.radius!=null)item.radius=meta.radius;else delete item.radius;
  item.masterId=meta.id;item.performanceSource={...snap.source};registered++;
 }
 window.HD_EQUIPMENT_PERFORMANCE_COVERAGE={registered,added,total:Object.keys(snap.equipment).length,source:snap.source};
}
hdEquipApplyMasterPerformance();
