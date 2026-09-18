const HD_SHIP_DATABASE=[
 {base:'長門',final:'長門改二',type:'戦艦',speed:'低速',targetLv:88,path:'長門 → 長門改(Lv30) → 長門改二(Lv88)',requirements:'Lv88＋改装設計図',roles:['特殊砲撃','対艦','高耐久'],note:'長門型特殊砲撃の中核。重量編成・高難度海域向け。'},
 {base:'陸奥',final:'陸奥改二',type:'戦艦',speed:'低速',targetLv:89,path:'陸奥 → 陸奥改(Lv30) → 陸奥改二(Lv89)',requirements:'Lv89＋改装設計図',roles:['特殊砲撃','対艦','高耐久'],note:'長門改二と組ませる特殊砲撃編成で使いやすい。'},
 {base:'大和',final:'大和改二',type:'戦艦',speed:'高速',targetLv:88,path:'大和 → 大和改(Lv60) → 大和改二(Lv88) ⇔ 大和改二重(Lv93)',requirements:'Lv88＋改装設計図×3＋新型砲熕兵装資材×3＋戦闘詳報＋新型高温高圧缶×2',roles:['特殊砲撃','最終海域','対地'],note:'改二は高速。Lv93で改二重へコンバート可能。'},
 {base:'武蔵',final:'武蔵改二',type:'戦艦',speed:'低速',targetLv:89,path:'武蔵 → 武蔵改(Lv40) → 武蔵改二(Lv89)',requirements:'Lv89＋改装設計図×3＋新型砲熕兵装資材×3＋戦闘詳報',roles:['特殊砲撃','最終海域','高耐久'],note:'大和型の重量級戦艦。高難度攻略の主力候補。'},
 {base:'伊勢',final:'伊勢改二',type:'航空戦艦',speed:'低速',targetLv:88,path:'伊勢 → 伊勢改(Lv10) → 伊勢改二(Lv88)',requirements:'Lv88＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報',roles:['制空補助','航空戦艦','艦戦運用'],note:'航空戦艦ながら艦戦運用もでき、制空調整に便利。'},
 {base:'日向',final:'日向改二',type:'航空戦艦',speed:'低速',targetLv:90,path:'日向 → 日向改(Lv10) → 日向改二(Lv90)',requirements:'Lv90＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋航空系資材',roles:['制空補助','航空戦艦','対潜補助'],note:'伊勢改二と同系統。装備構成で役割を大きく変えられる。'},
 {base:'赤城',final:'赤城改二',type:'正規空母',speed:'高速',targetLv:90,path:'赤城 → 赤城改(Lv30) → 赤城改二(Lv90) ⇔ 赤城改二戊(Lv92)',requirements:'Lv90＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋新型航空兵装資材×2＋開発資材×100',roles:['制空','航空火力','夜間航空'],note:'改二戊は夜間航空運用向けのコンバート。'},
 {base:'加賀',final:'加賀改二',type:'正規空母',speed:'高速',targetLv:82,path:'加賀 → 加賀改(Lv30) → 加賀改二(Lv82) ⇔ 改二戊 / 改二護',requirements:'Lv82＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋新型航空兵装資材×2＋開発資材×120',roles:['制空','航空火力','対潜護衛'],note:'改二戊・改二護へのコンバートで運用特性が変わる。'},
 {base:'翔鶴',final:'翔鶴改二甲',type:'装甲空母',speed:'高速',targetLv:88,path:'翔鶴 → 翔鶴改(Lv30) → 翔鶴改二(Lv80) ⇔ 翔鶴改二甲(Lv88)',requirements:'改二: Lv80＋改装設計図＋試製甲板カタパルト / 甲: Lv88',roles:['航空火力','装甲空母','制空'],note:'中破でも航空攻撃可能な装甲空母形態が高難度で有用。'},
 {base:'瑞鶴',final:'瑞鶴改二甲',type:'装甲空母',speed:'高速',targetLv:90,path:'瑞鶴 → 瑞鶴改(Lv25) → 瑞鶴改二(Lv77) ⇔ 瑞鶴改二甲(Lv90)',requirements:'改二: Lv77＋改装設計図＋試製甲板カタパルト / 甲: Lv90',roles:['航空火力','装甲空母','制空'],note:'翔鶴改二甲と並ぶ装甲空母の主力。'},
 {base:'最上',final:'最上改二特',type:'航空巡洋艦',speed:'高速',targetLv:90,path:'最上 → 最上改(Lv10) → 最上改二(Lv80) ⇔ 最上改二特(Lv90)',requirements:'改二: Lv80＋改装設計図＋新型航空兵装資材×2＋戦闘詳報＋開発資材×60 / 特: Lv90＋高速建造材×60＋開発資材×45',roles:['対地','甲標的','水戦','輸送'],note:'改二特は甲標的・大発・内火艇を搭載できる万能航巡。'},
 {base:'矢矧',final:'矢矧改二乙',type:'軽巡洋艦',speed:'高速',targetLv:90,path:'矢矧 → 矢矧改(Lv35) → 矢矧改二(Lv88) ⇔ 矢矧改二乙(Lv90)',requirements:'改二: Lv88＋改装設計図＋戦闘詳報＋高速建造材×88＋開発資材×88 / 乙: Lv90＋高速建造材×30＋開発資材×45',roles:['甲標的','水戦','対潜','夜戦'],note:'改二乙は4スロット・甲標的・水上機運用を両立する万能軽巡。'},
 {base:'夕張',final:'夕張改二特',type:'軽巡洋艦',speed:'高速',targetLv:86,path:'夕張 → 夕張改(Lv25) → 夕張改二(Lv84) ⇔ 改二特(Lv86) / 改二丁(Lv88)',requirements:'改二: Lv84＋改装設計図＋戦闘詳報',roles:['甲標的','対地','対潜','輸送'],note:'改二特は甲標的・大発系を扱える多用途軽巡。'},
 {base:'阿武隈',final:'阿武隈改二',type:'軽巡洋艦',speed:'高速',targetLv:75,path:'阿武隈 → 阿武隈改(Lv17) → 阿武隈改二(Lv75)',requirements:'Lv75＋改装設計図',roles:['甲標的','輸送','遠征'],note:'先制雷撃と大発運用ができ、遠征・輸送でも便利。'},
 {base:'北上',final:'北上改二',type:'重雷装巡洋艦',speed:'高速',targetLv:50,path:'北上 → 北上改(Lv10) → 北上改二(Lv50)',requirements:'Lv50',roles:['先制雷撃','夜戦CI','高雷装'],note:'低コストで高い雷装と夜戦火力を得られる。'},
 {base:'大井',final:'大井改二',type:'重雷装巡洋艦',speed:'高速',targetLv:50,path:'大井 → 大井改(Lv10) → 大井改二(Lv50)',requirements:'Lv50',roles:['先制雷撃','夜戦','高雷装'],note:'北上改二と並ぶ雷巡の定番。'},
 {base:'雪風',final:'雪風改二',type:'駆逐艦',speed:'高速',targetLv:88,path:'雪風 → 雪風改(Lv20) → 丹陽(Lv71) → 雪風改二(Lv88)',requirements:'丹陽: Lv71＋改装設計図＋新型兵装資材×2 / 雪風改二: Lv88＋改装設計図×2＋戦闘詳報',roles:['夜戦CI','幸運艦','対空'],note:'高い運を活かした魚雷CI運用に向く。'},
 {base:'時雨',final:'時雨改三',type:'駆逐艦',speed:'高速',targetLv:97,path:'時雨 → 時雨改(Lv20) → 時雨改二(Lv60) → 時雨改三(Lv97)',requirements:'Lv97＋改装設計図×2＋新型兵装資材×3＋戦闘詳報×2',roles:['夜戦CI','対潜','高運'],note:'高い運と対潜を持つ高水準の駆逐艦。'},
 {base:'霞',final:'霞改二乙',type:'駆逐艦',speed:'高速',targetLv:88,path:'霞 → 霞改(Lv20) → 霞改二(Lv75) ⇔ 霞改二乙(Lv88)',requirements:'改二: Lv75 / 乙: Lv88',roles:['輸送','司令部','対地'],note:'輸送や司令部施設運用で便利。コンバート可能。'},
 {base:'秋月',final:'秋月改二',type:'駆逐艦',speed:'高速',targetLv:85,path:'秋月 → 秋月改(Lv40) → 秋月改二(Lv85)',requirements:'Lv85＋改装設計図＋新型兵装資材×2＋戦闘詳報＋開発資材×30',roles:['防空','対空CI'],note:'防空駆逐艦。改二で4スロット化し、防空性能がさらに向上。'},
 {base:'初月',final:'初月改二',type:'駆逐艦',speed:'高速',targetLv:88,path:'初月 → 初月改(Lv40) → 初月改二(Lv88)',requirements:'Lv88＋改装設計図＋新型兵装資材×2＋戦闘詳報',roles:['防空','対空CI','4スロット'],note:'4スロットの防空駆逐艦で、対空以外にも柔軟に使える。'},
 {base:'Fletcher',final:'Fletcher Mk.II',type:'駆逐艦',speed:'高速',targetLv:90,path:'Fletcher → Fletcher改(Lv55) → Fletcher改 Mod.2(Lv88) ⇔ Fletcher Mk.II(Lv90)',requirements:'改: Lv55＋高速建造材×10＋開発資材×80 / Mod.2: Lv88＋改装設計図＋高速建造材×30＋開発資材×120 / Mk.II: Lv90＋高速建造材×30＋開発資材×180',roles:['対空CI','自動先制対潜','夜戦CI'],note:'対空・対潜・夜戦を高水準でこなす万能駆逐艦。'}
,
 {base:'金剛',final:'金剛改二丙',type:'高速戦艦',speed:'高速',targetLv:92,path:'金剛 → 金剛改(Lv25) → 金剛改二(Lv75) → 金剛改二丙(Lv92)',requirements:'Lv92＋改装設計図×2＋新型砲熕兵装資材×2＋戦闘詳報＋開発資材×300',roles:['高速戦艦','夜戦','特殊砲撃','対艦'],note:'雷装を持つ高速戦艦。比叡改二丙との特殊砲撃や夜戦込みの攻略で使いやすい。'},
 {base:'比叡',final:'比叡改二丙',type:'高速戦艦',speed:'高速',targetLv:90,path:'比叡 → 比叡改(Lv25) → 比叡改二(Lv75) → 比叡改二丙(Lv90)',requirements:'Lv90＋改装設計図×2＋新型砲熕兵装資材×2＋戦闘詳報＋開発資材×330',roles:['高速戦艦','夜戦','特殊砲撃','対艦'],note:'雷装を持つ高速戦艦。金剛改二丙との特殊砲撃や夜戦込みの攻略向け。'},
 {base:'摩耶',final:'摩耶改二',type:'重巡洋艦',speed:'高速',targetLv:75,path:'摩耶 → 摩耶改(Lv18) → 摩耶改二(Lv75)',requirements:'Lv75',roles:['対空CI','防空','重巡','夜戦'],note:'専用対空CIを組みやすい防空重巡。航空攻撃が厳しい海域で特に有用。'},
 {base:'鈴谷',final:'鈴谷改二',type:'航空巡洋艦',speed:'高速',targetLv:84,path:'鈴谷 → 鈴谷改(Lv35) → 鈴谷改二(Lv84) ⇔ 鈴谷航改二(Lv88)',requirements:'Lv84＋改装設計図',roles:['水戦','対地','輸送','制空補助'],note:'水戦・水爆・対地装備を扱える万能航巡。軽空母形態へコンバート可能。'},
 {base:'熊野',final:'熊野改二',type:'航空巡洋艦',speed:'高速',targetLv:84,path:'熊野 → 熊野改(Lv35) → 熊野改二(Lv84) ⇔ 熊野航改二(Lv88)',requirements:'Lv84＋改装設計図',roles:['水戦','対地','輸送','制空補助'],note:'鈴谷改二と同系統の万能航巡。海域に応じて制空・対地・輸送を切り替えやすい。'},
 {base:'能代',final:'能代改二',type:'軽巡洋艦',speed:'高速',targetLv:85,path:'能代 → 能代改(Lv35) → 能代改二(Lv85)',requirements:'Lv85＋改装設計図＋戦闘詳報＋高速建造材×77＋開発資材×80',roles:['4スロット','対潜','昼連撃','夜戦'],note:'4スロット軽巡。火力・雷装・対潜を高水準でまとめやすい。'},
 {base:'夕立',final:'夕立改二',type:'駆逐艦',speed:'高速',targetLv:55,path:'夕立 → 夕立改(Lv20) → 夕立改二(Lv55)',requirements:'Lv55',roles:['高火力','夜戦','駆逐主力'],note:'低い改装Lvで高い火力と雷装を得られる定番主力駆逐艦。'},
 {base:'長波',final:'長波改二',type:'駆逐艦',speed:'高速',targetLv:75,path:'長波 → 長波改(Lv30) → 長波改二(Lv75)',requirements:'Lv75＋改装設計図＋戦闘詳報',roles:['D型砲','夜戦CI','高火力','司令部'],note:'D型砲系との相性がよく、夜戦火力と汎用性を両立する夕雲型改二。'},
 {base:'瑞鳳',final:'瑞鳳改二乙',type:'軽空母',speed:'高速',targetLv:80,path:'瑞鳳 → 瑞鳳改(Lv25) → 瑞鳳改二(Lv80) ⇔ 瑞鳳改二乙(Lv80)',requirements:'改二乙: Lv80＋高速建造材×20＋開発資材×5',roles:['護衛空母','対潜','制空','航空火力'],note:'射程長の護衛空母。対潜支援と航空戦を両立しやすい。'},
 {base:'Saratoga',final:'Saratoga Mk.II Mod.2',type:'装甲空母',speed:'高速',targetLv:85,path:'Saratoga → Saratoga改(Lv40) → Saratoga Mk.II(Lv85) ⇔ Saratoga Mk.II Mod.2(Lv85)',requirements:'Mk.II: Lv85＋試製甲板カタパルト＋改装設計図 / Mod.2: 高速建造材×30＋開発資材×20',roles:['装甲空母','航空火力','制空'],note:'93機搭載の装甲空母形態。中破時も攻撃でき、高難度海域で安定した航空火力を出しやすい。'}
];


const HD_SHIP_STATS={
 '長門改二':{hp:91,armor:110,evasion:70,fire:118,torp:0,aa:100,asw:0,los:55,luck:40,air:15,fuel:180,ammo:225,range:'長'},
 '陸奥改二':{hp:91,armor:109,evasion:71,fire:118,torp:0,aa:102,asw:0,los:57,luck:16,air:17,fuel:180,ammo:225,range:'長'},
 '大和改二':{hp:98,armor:122,evasion:68,fire:144,torp:0,aa:108,asw:0,los:59,luck:18,air:22,fuel:290,ammo:350,range:'超長'},
 '武蔵改二':{hp:99,armor:125,evasion:65,fire:145,torp:0,aa:105,asw:0,los:58,luck:10,air:28,fuel:275,ammo:350,range:'超長'},
 '伊勢改二':{hp:78,armor:94,evasion:82,fire:88,torp:0,aa:85,asw:0,los:72,luck:40,air:57,fuel:110,ammo:145,range:'中'},
 '日向改二':{hp:78,armor:94,evasion:83,fire:86,torp:0,aa:84,asw:85,los:75,luck:40,air:57,fuel:115,ammo:140,range:'中'},
 '赤城改二':{hp:81,armor:81,evasion:73,fire:60,torp:0,aa:85,asw:0,los:91,luck:20,air:90,fuel:95,ammo:90,range:'中'},
 '加賀改二':{hp:84,armor:80,evasion:70,fire:56,torp:0,aa:84,asw:0,los:90,luck:18,air:99,fuel:100,ammo:95,range:'中'},
 '翔鶴改二甲':{hp:78,armor:83,evasion:81,fire:70,torp:0,aa:88,asw:0,los:90,luck:20,air:76,fuel:100,ammo:85,range:'中'},
 '瑞鶴改二甲':{hp:79,armor:84,evasion:85,fire:65,torp:0,aa:90,asw:0,los:90,luck:50,air:76,fuel:100,ammo:85,range:'中'},
 '最上改二特':{hp:61,armor:78,evasion:81,fire:81,torp:90,aa:86,asw:0,los:80,luck:18,air:14,fuel:55,ammo:70,range:'中'},
 '矢矧改二乙':{hp:53,armor:74,evasion:86,fire:81,torp:88,aa:89,asw:80,los:60,luck:17,air:6,fuel:45,ammo:50,range:'中'},
 '夕張改二特':{hp:41,armor:66,evasion:81,fire:56,torp:88,aa:78,asw:70,los:50,luck:30,air:0,fuel:30,ammo:40,range:'短'},
 '阿武隈改二':{hp:45,armor:68,evasion:83,fire:56,torp:94,aa:78,asw:82,los:60,luck:20,air:3,fuel:25,ammo:35,range:'短'},
 '北上改二':{hp:43,armor:63,evasion:83,fire:63,torp:139,aa:49,asw:79,los:43,luck:30,air:0,fuel:25,ammo:75,range:'中'},
 '大井改二':{hp:43,armor:63,evasion:83,fire:63,torp:139,aa:49,asw:79,los:43,luck:13,air:0,fuel:25,ammo:75,range:'中'},
 '雪風改二':{hp:35,armor:60,evasion:100,fire:66,torp:90,aa:85,asw:74,los:48,luck:63,air:0,fuel:15,ammo:25,range:'短'},
 '時雨改三':{hp:34,armor:57,evasion:98,fire:67,torp:91,aa:87,asw:88,los:51,luck:55,air:0,fuel:15,ammo:25,range:'短'},
 '霞改二乙':{hp:31,armor:52,evasion:92,fire:63,torp:83,aa:83,asw:68,los:56,luck:37,air:0,fuel:15,ammo:20,range:'短'},
 '秋月改二':{hp:38,armor:56,evasion:92,fire:67,torp:84,aa:119,asw:76,los:56,luck:17,air:0,fuel:25,ammo:30,range:'短'},
 '初月改二':{hp:39,armor:57,evasion:93,fire:70,torp:82,aa:118,asw:75,los:54,luck:18,air:0,fuel:25,ammo:30,range:'短'},
 'Fletcher Mk.II':{hp:38,armor:56,evasion:94,fire:62,torp:82,aa:95,asw:97,los:66,luck:47,air:0,fuel:25,ammo:25,range:'短'},
 '金剛改二丙':{hp:86,armor:91,evasion:75,fire:99,torp:44,aa:89,asw:0,los:51,luck:18,air:13,fuel:100,ammo:160,range:'長'},
 '比叡改二丙':{hp:86,armor:90,evasion:73,fire:98,torp:47,aa:85,asw:0,los:53,luck:15,air:8,fuel:100,ammo:160,range:'長'},
 '摩耶改二':{hp:57,armor:78,evasion:81,fire:77,torp:84,aa:106,asw:0,los:55,luck:14,air:12,fuel:45,ammo:80,range:'中'},
 '鈴谷改二':{hp:61,armor:74,evasion:82,fire:76,torp:88,aa:85,asw:0,los:83,luck:14,air:24,fuel:55,ammo:60,range:'中'},
 '熊野改二':{hp:62,armor:75,evasion:81,fire:76,torp:87,aa:84,asw:0,los:81,luck:13,air:24,fuel:55,ammo:60,range:'中'},
 '能代改二':{hp:53,armor:72,evasion:83,fire:78,torp:86,aa:82,asw:84,los:61,luck:13,air:8,fuel:35,ammo:45,range:'中'},
 '夕立改二':{hp:31,armor:52,evasion:89,fire:74,torp:94,aa:59,asw:69,los:49,luck:22,air:0,fuel:15,ammo:20,range:'短'},
 '長波改二':{hp:33,armor:55,evasion:92,fire:69,torp:90,aa:67,asw:68,los:45,luck:30,air:0,fuel:15,ammo:20,range:'短'},
 '瑞鳳改二乙':{hp:59,armor:72,evasion:67,fire:48,torp:0,aa:88,asw:48,los:77,luck:42,air:50,fuel:40,ammo:45,range:'長'},
 'Saratoga Mk.II Mod.2':{hp:89,armor:88,evasion:56,fire:58,torp:0,aa:94,asw:0,los:95,luck:40,air:93,fuel:100,ammo:100,range:'中'}
};

const HD_SHIP_LOADOUTS={
 '長門改二':[
  {name:'通常攻略・弾着',gear:['41cm三連装砲改二','試製41cm三連装砲','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'昼連撃・弾着観測を基本に、徹甲弾補正を取る。'},
  {name:'特殊砲撃寄り',gear:['41cm三連装砲改二','試製41cm三連装砲','一式徹甲弾改','高性能電探'],memo:'長門型特殊砲撃を使う高難度向け。制空や索敵は艦隊全体で調整。'}
 ],
 '陸奥改二':[
  {name:'通常攻略・弾着',gear:['41cm三連装砲改二','試製41cm三連装砲','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'長門改二と同じく主砲2＋偵察機＋徹甲弾が基本。'},
  {name:'長門タッチ随伴',gear:['41cm三連装砲改二','試製41cm三連装砲','一式徹甲弾改','高性能電探'],memo:'長門改二との特殊砲撃編成で火力を重視。'}
 ],
 '大和改二':[
  {name:'高火力・弾着',gear:['51cm連装砲','46cm三連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改','15m二重測距儀+21号電探改二'],memo:'5スロを活かした高火力の定番。'},
  {name:'特殊砲撃・命中重視',gear:['51cm連装砲','46cm三連装砲改','一式徹甲弾改','15m二重測距儀+21号電探改二','高性能水偵'],memo:'大和型特殊砲撃を意識しつつ命中と索敵を確保。'}
 ],
 '武蔵改二':[
  {name:'高火力・弾着',gear:['51cm連装砲','46cm三連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改','15m二重測距儀+21号電探改二'],memo:'5スロの重量級テンプレ。'},
  {name:'大和型タッチ随伴',gear:['51cm連装砲','46cm三連装砲改','一式徹甲弾改','高性能電探','高性能水偵'],memo:'大和改二/重との特殊砲撃で採用しやすい。'}
 ],
 '伊勢改二':[
  {name:'制空補助戦艦',gear:['41cm三連装砲改二','41cm三連装砲改二','零式水上偵察機11型乙(熟練)','高性能艦戦','一式徹甲弾改'],memo:'戦艦火力を維持しながら制空値を補う。'},
  {name:'航空寄り',gear:['41cm三連装砲改二','41cm三連装砲改二','瑞雲改二','高性能艦戦','高性能艦戦'],memo:'海域の制空要求が高い時の補助型。'}
 ],
 '日向改二':[
  {name:'制空・航空補助',gear:['41cm三連装砲改二','41cm三連装砲改二','瑞雲改二','高性能艦戦','一式徹甲弾改'],memo:'航空戦艦として火力と制空を両立。'},
  {name:'対潜補助',gear:['41cm三連装砲改二','瑞雲改二','対潜回転翼機','対潜哨戒機','高性能艦戦'],memo:'日向改二の対潜値を活かす用途。海域条件に合わせて調整。'}
 ],
 '赤城改二':[
  {name:'昼戦バランス',gear:['天山一二型(友永隊)','彗星(江草隊)','高性能艦戦','高性能艦戦','彩雲'],memo:'攻撃2枠＋制空＋触接/索敵をまとめた汎用型。'},
  {name:'航空火力重視',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦','熟練甲板要員系'],memo:'制空を満たした残りを攻撃機へ。'}
 ],
 '加賀改二':[
  {name:'制空安定',gear:['天山一二型(友永隊)','彗星(江草隊)','高性能艦戦','高性能艦戦','彩雲'],memo:'大搭載を活かして制空を安定させる。'},
  {name:'攻撃寄り',gear:['強力な艦攻','強力な艦爆','強力な艦攻','高性能艦戦','高性能艦戦'],memo:'必要制空を満たせる海域で攻撃機を増やす。'}
 ],
 '翔鶴改二甲':[
  {name:'装甲空母バランス',gear:['天山一二型(友永隊)','彗星(江草隊)','高性能艦戦','高性能艦戦'],memo:'中破攻撃可能を活かす汎用型。'},
  {name:'攻撃寄り',gear:['強力な艦攻','強力な艦爆','強力な艦攻','高性能艦戦'],memo:'制空に余裕がある海域で航空火力を伸ばす。'}
 ],
 '瑞鶴改二甲':[
  {name:'装甲空母バランス',gear:['天山一二型(友永隊)','彗星(江草隊)','高性能艦戦','高性能艦戦'],memo:'翔鶴改二甲と並べやすい標準型。'},
  {name:'攻撃寄り',gear:['強力な艦攻','強力な艦爆','強力な艦攻','高性能艦戦'],memo:'高い運も活かしつつ航空火力を重視。'}
 ],
 '最上改二特':[
  {name:'先制雷撃＋弾着',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','甲標的 丁型改','瑞雲改二'],memo:'先制雷撃と昼連撃を両立する万能構成。'},
  {name:'対地',gear:['20.3cm(3号)連装砲','甲標的 丁型改','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇'],memo:'陸上型相手に。敵や特効に応じて水戦・WG系と交換。'}
 ],
 '矢矧改二乙':[
  {name:'万能連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','零式水上偵察機11型乙(熟練)','甲標的 丁型改'],memo:'先制雷撃＋昼夜連撃の汎用構成。'},
  {name:'夜戦CI寄り',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','甲標的 丁型改','水雷戦隊 熟練見張員'],memo:'高難度ボスの夜戦打点を意識。運改修状況で連撃型と使い分け。'}
 ],
 '夕張改二特':[
  {name:'先制雷撃・汎用',gear:['甲標的 丙型','主砲','主砲','高性能電探','機銃/対潜補助'],memo:'スロット制限に注意しつつ雷撃・連撃・電探をまとめる。'},
  {name:'対地',gear:['甲標的 丙型','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','高性能電探','機銃/補助装備'],memo:'対地と先制雷撃を両立しやすい。'}
 ],
 '阿武隈改二':[
  {name:'魚雷CI',gear:['甲標的 丙型','61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷'],memo:'先制雷撃＋夜戦魚雷CI。運改修済みだと特に強力。'},
  {name:'輸送',gear:['甲標的 丙型','大発動艇','大発動艇'],memo:'輸送量を確保しつつ先制雷撃も維持。'}
 ],
 '北上改二':[
  {name:'夜戦魚雷CI',gear:['甲標的 丁型改','61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷'],memo:'最大雷装139を活かす高火力型。'},
  {name:'夜戦連撃',gear:['甲標的 丁型改','主砲','主砲'],memo:'運改修に依存しにくい安定型。'}
 ],
 '大井改二':[
  {name:'夜戦火力',gear:['甲標的 丁型改','61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷'],memo:'魚雷CIを使うなら運改修や見張員補助を意識。'},
  {name:'夜戦連撃',gear:['甲標的 丁型改','主砲','主砲'],memo:'初期運13なので通常は連撃型が扱いやすい。'}
 ],
 '雪風改二':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'高い運63を活かす定番の夜戦CI。'},
  {name:'対空・汎用',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空CIや通常連撃を意識。'}
 ],
 '時雨改三':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員','対潜/電探補助'],memo:'4スロと高運を活かして夜戦火力を伸ばす。'},
  {name:'対潜兼用',gear:['四式水中聴音機','対潜爆雷投射機','爆雷','主砲/電探'],memo:'高い対潜値を活かす。必要対潜値を満たしたら残りを火力へ。'}
 ],
 '霞改二乙':[
  {name:'輸送・司令部',gear:['大発動艇','大発動艇','艦隊司令部施設'],memo:'輸送や遊撃部隊運用向け。'},
  {name:'対地',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','主砲/補助装備'],memo:'陸上型対策。敵に応じてWG系や電探へ調整。'}
 ],
 '秋月改二':[
  {name:'防空CI',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探','対潜/機銃/煙幕'],memo:'最大対空119を活かす防空の基本。4枠目は海域に応じて自由枠。'},
  {name:'防空＋対潜',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探','四式水中聴音機'],memo:'防空を維持しつつ対潜補助。'}
 ],
 '初月改二':[
  {name:'防空CI',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探','対潜/機銃/煙幕'],memo:'4スロ防空駆逐として柔軟に運用。'},
  {name:'防空＋対潜',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探','四式水中聴音機'],memo:'防空と対潜を同時に担当。'}
 ],
 'Fletcher Mk.II':[
  {name:'対空CI',gear:['5inch単装砲 Mk.30 改','5inch単装砲 Mk.30 改','GFCS Mk.37'],memo:'米駆逐の対空CIを狙う標準構成。'},
  {name:'先制対潜',gear:['HF/DF + Type144/147 ASDIC','RUR-4A Weapon Alpha改','5inch単装砲 Mk.30 改'],memo:'高い対潜97を活かす。対潜装備を減らしても先制対潜可能な場面が多い。'}
 ],
 '金剛改二丙':[
  {name:'高速戦艦・弾着',gear:['35.6cm連装砲改','35.6cm連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'高速戦艦として扱いやすい主砲2＋水偵＋徹甲弾。'},
  {name:'夜戦寄り',gear:['35.6cm連装砲改','35.6cm連装砲改','魚雷/夜戦補助','高性能水偵'],memo:'雷装を持つ特性を活かす形。特殊砲撃を使う場合は相方と海域条件を優先。'}
 ],
 '比叡改二丙':[
  {name:'高速戦艦・弾着',gear:['35.6cm連装砲改','35.6cm連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'主砲2＋水偵＋徹甲弾を基本にする。'},
  {name:'特殊砲撃随伴',gear:['35.6cm連装砲改','35.6cm連装砲改','一式徹甲弾改','高性能電探'],memo:'金剛改二丙との特殊砲撃や命中重視の攻略用。'}
 ],
 '摩耶改二':[
  {name:'対空CI',gear:['主砲','高角砲＋高射装置','高性能対空電探','特殊機銃'],memo:'摩耶の強みを出す防空型。対空CI条件を優先して組む。'},
  {name:'対空＋昼連撃',gear:['主砲','高角砲＋高射装置','零式水上偵察機11型乙(熟練)','高性能対空電探'],memo:'制空権を取れる海域で昼連撃も意識した構成。'}
 ],
 '鈴谷改二':[
  {name:'航巡・制空補助',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','二式水戦改(熟練)'],memo:'昼連撃を維持しつつ制空を補助。'},
  {name:'対地',gear:['20.3cm(3号)連装砲','三式弾','大発系対地装備/ロケット','水戦/水偵'],memo:'陸上型相手。敵種に合わせて対地装備を差し替える。'}
 ],
 '熊野改二':[
  {name:'航巡・制空補助',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','二式水戦改(熟練)'],memo:'鈴谷改二と同様に火力と制空を両立。'},
  {name:'対地',gear:['20.3cm(3号)連装砲','三式弾','大発系対地装備/ロケット','水戦/水偵'],memo:'陸上型・港湾系の攻略で役割を持たせやすい。'}
 ],
 '能代改二':[
  {name:'4スロ連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','零式水上偵察機11型乙(熟練)','高性能電探/見張員'],memo:'昼夜連撃を軸に4枠目で索敵や夜戦補助を調整。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷','主砲/水偵'],memo:'最大対潜84を活かして先制対潜ラインを狙う。'}
 ],
 '夕立改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'高火力74・雷装94を活かす安定型。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運22なので発動率を補助できる場合に採用。'}
 ],
 '長波改二':[
  {name:'D型砲・夜戦',gear:['12.7cm連装砲D型改二','61cm四連装(酸素)魚雷後期型','水上電探'],memo:'D型砲＋魚雷＋電探の夜戦CIを狙う構成。'},
  {name:'通常連撃',gear:['12.7cm連装砲D型改二','12.7cm連装砲D型改二','水上電探'],memo:'昼夜の安定運用。'}
 ],
 '瑞鳳改二乙':[
  {name:'護衛空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','彩雲/対潜艦攻'],memo:'航空火力・制空・索敵をまとめる汎用型。'},
  {name:'対潜支援',gear:['対潜値の高い艦攻','対潜値の高い艦攻','高性能艦戦','彩雲/艦戦'],memo:'護衛空母の先制対潜を活かす。制空値に応じて艦戦数を調整。'}
 ],
 'Saratoga Mk.II Mod.2':[
  {name:'装甲空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦'],memo:'93機搭載と中破攻撃可能を活かす標準型。'},
  {name:'航空火力重視',gear:['強力な艦攻','強力な艦爆','強力な艦攻','高性能艦戦'],memo:'必要制空を満たした海域で攻撃機を増やす。'}
 ]
};


function hdShipDbMapCandidates(detail){
 const text=[detail?.name,detail?.overview,detail?.fleet,detail?.route,detail?.air,detail?.note,detail?.caution].filter(Boolean).join(' ');
 const rules=[
  {re:/潜水|対潜/,roles:['対潜','自動先制対潜'],reason:'対潜'},
  {re:/空襲|制空|航空|艦戦|防空/,roles:['防空','対空CI','制空','制空補助'],reason:'防空・制空'},
  {re:/陸上|対地|砲台|集積|港湾/,roles:['対地'],reason:'対地'},
  {re:/輸送|TP/,roles:['輸送'],reason:'輸送'},
  {re:/夜戦/,roles:['夜戦','夜戦CI'],reason:'夜戦'},
  {re:/先制雷撃|甲標的/,roles:['甲標的','先制雷撃'],reason:'先制雷撃'},
  {re:/特殊砲撃|タッチ/,roles:['特殊砲撃'],reason:'特殊砲撃'},
  {re:/高難度|最終海域|EO|ボス/,roles:['装甲空母','高耐久','高火力'],reason:'高難度'}
 ];
 const typeRules=[
  {re:/駆逐/,test:x=>x.type==='駆逐艦',reason:'駆逐枠'},
  {re:/軽巡/,test:x=>x.type==='軽巡洋艦',reason:'軽巡枠'},
  {re:/航巡|航空巡洋艦/,test:x=>x.type==='航空巡洋艦',reason:'航巡枠'},
  {re:/重巡/,test:x=>x.type==='重巡洋艦',reason:'重巡枠'},
  {re:/軽空母/,test:x=>x.type==='軽空母',reason:'軽空母枠'},
  {re:/正規空母|空母/,test:x=>['正規空母','装甲空母'].includes(x.type),reason:'空母枠'},
  {re:/戦艦/,test:x=>['戦艦','高速戦艦','航空戦艦'].includes(x.type),reason:'戦艦枠'}
 ];
 return HD_SHIP_DATABASE.map((x,index)=>{
  let score=0;const reasons=[];
  for(const r of rules){
   if(!r.re.test(text))continue;
   const hits=x.roles.filter(role=>r.roles.some(k=>role.includes(k)||k.includes(role)));
   if(hits.length){score+=3+Math.min(2,hits.length-1);reasons.push(r.reason)}
  }
  for(const r of typeRules){if(r.re.test(text)&&r.test(x)){score+=1;reasons.push(r.reason)}}
  if(/高速/.test(text)&&x.speed==='高速'){score+=1;reasons.push('高速')}
  if(/4スロ|四スロ/.test(text)&&x.roles.some(r=>r.includes('4スロ'))){score+=2;reasons.push('4スロ')}
  return {item:x,score,reasons:[...new Set(reasons)],index};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,6);
}
function hdShipDbMapRecommendHtml(map,detail){
 const rows=hdShipDbMapCandidates(detail);if(!rows.length)return '';
 return `<section class="hd-map-ship-recommend"><div class="hd-map-ship-recommend-head"><div><div class="eyebrow">SHIP CANDIDATES</div><strong>この海域の艦娘候補</strong></div><span>DBから自動抽出</span></div><p class="hd-map-ship-recommend-note">海域説明の役割・艦種・速力キーワードから候補を抽出。ルート固定条件・特効・札・所持装備を最優先してね。</p><div class="hd-map-ship-recommend-grid">${rows.map(({item,reasons})=>`<button type="button" class="hd-map-ship-candidate" data-hd-shipdb-jump="${hdShipDbEsc(item.final)}"><span><b>${hdShipDbEsc(item.final)}</b><small>${hdShipDbEsc(item.type)}</small></span><span class="hd-map-ship-reasons">${reasons.slice(0,3).map(r=>`<i>${hdShipDbEsc(r)}</i>`).join('')}</span></button>`).join('')}</div></section>`;
}
function hdShipDbJumpTo(name){
 hdEnsureShipDatabase();
 const input=document.getElementById('hdShipDbSearch');if(input){input.value=name;hdRenderShipDatabase()}
 const sec=document.getElementById('shipDatabase');if(sec){sec.scrollIntoView({behavior:'smooth',block:'start'})}
}

function hdShipDbStatsHtml(item){
 const s=HD_SHIP_STATS[item.final];if(!s)return '';
 const cells=[['耐久',s.hp],['火力',s.fire],['雷装',s.torp],['対空',s.aa],['装甲',s.armor],['回避',s.evasion],['対潜',s.asw],['索敵',s.los],['運',s.luck],['搭載',s.air]];
 return `<details class="hd-shipdb-detail"><summary>ステータス・おすすめ装備</summary><div class="hd-shipdb-detail-body"><div class="hd-shipdb-stat-head"><b>Lv99最大ステータス</b><span>装備補正なし</span></div><div class="hd-shipdb-stats">${cells.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="hd-shipdb-substats"><span>速力 <b>${hdShipDbEsc(item.speed)}</b></span><span>射程 <b>${hdShipDbEsc(s.range)}</b></span><span>燃料 <b>${s.fuel}</b></span><span>弾薬 <b>${s.ammo}</b></span></div>${hdShipDbLoadoutsHtml(item)}</div></details>`;
}
function hdShipDbLoadoutsHtml(item){
 const sets=HD_SHIP_LOADOUTS[item.final]||[];if(!sets.length)return '';
 return `<div class="hd-shipdb-loadouts"><div class="hd-shipdb-stat-head"><b>おすすめ装備例</b><span>海域・特効・所持装備で調整</span></div>${sets.map(x=>`<article class="hd-shipdb-loadout"><strong>${hdShipDbEsc(x.name)}</strong><div class="hd-shipdb-gearchips">${x.gear.map(g=>`<span>${hdShipDbEsc(g)}</span>`).join('')}</div><p>${hdShipDbEsc(x.memo)}</p></article>`).join('')}</div>`;
}

let hdShipDbType='すべて';
let hdShipDbMissingOnly=false;

function hdShipDbEsc(s){return typeof rosterEsc==='function'?rosterEsc(s):String(s??'')}
function hdShipDbRoster(){try{return JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{return []}}
function hdShipDbOwned(item){
 const rows=hdShipDbRoster().filter(x=>{const n=String(x.name||'').trim();return n===item.base||n===item.final||n.startsWith(item.base)});
 if(!rows.length)return null;
 return rows.sort((a,b)=>(Number(b.level)||0)-(Number(a.level)||0))[0];
}
function hdShipDbStatus(item){
 const own=hdShipDbOwned(item);if(!own)return {label:'未所持',cls:'missing',detail:''};
 const lv=Number(own.level)||0;
 if(String(own.name||'')===item.final)return {label:'改装済み',cls:'ready',detail:`${own.name}${lv?` Lv.${lv}`:''}`};
 if(lv>=item.targetLv)return {label:'Lv条件達成',cls:'ready',detail:`${own.name} Lv.${lv}`};
 return {label:'育成中',cls:'owned',detail:`${own.name}${lv?` Lv.${lv} / あと${Math.max(0,item.targetLv-lv)}Lv`:''}`};
}
function hdRenderShipDatabase(){
 const list=document.getElementById('hdShipDbList');if(!list)return;
 const q=(document.getElementById('hdShipDbSearch')?.value||'').trim().toLowerCase();
 let rows=HD_SHIP_DATABASE.filter(x=>(hdShipDbType==='すべて'||x.type===hdShipDbType)&&(!q||`${x.base} ${x.final} ${x.type} ${x.roles.join(' ')} ${x.note} ${x.path} ${(HD_SHIP_LOADOUTS[x.final]||[]).flatMap(y=>[y.name,...y.gear,y.memo]).join(' ')}`.toLowerCase().includes(q)));
 if(hdShipDbMissingOnly)rows=rows.filter(x=>!hdShipDbOwned(x));
 const count=document.getElementById('hdShipDbCount');if(count)count.textContent=`${rows.length}隻`;
 list.innerHTML=rows.map(x=>{const s=hdShipDbStatus(x);return `<article class="hd-shipdb-card"><div class="hd-shipdb-head"><div><strong>${hdShipDbEsc(x.final)}</strong><span>${hdShipDbEsc(x.type)}・${hdShipDbEsc(x.speed)}</span></div><div class="hd-shipdb-status ${s.cls}"><b>${s.label}</b>${s.detail?`<small>${hdShipDbEsc(s.detail)}</small>`:''}</div></div><div class="hd-shipdb-path">${hdShipDbEsc(x.path)}</div><div class="hd-shipdb-require"><span>改装条件</span><strong>${hdShipDbEsc(x.requirements)}</strong></div><div class="hd-shipdb-roles">${x.roles.map(r=>`<span>${hdShipDbEsc(r)}</span>`).join('')}</div>${hdShipDbStatsHtml(x)}<p>${hdShipDbEsc(x.note)}</p><div class="hd-shipdb-actions"><button class="primary small" type="button" data-hd-shipdb-add="${hdShipDbEsc(x.base)}">台帳へ追加</button><a class="guide-link" href="https://wikiwiki.jp/kancolle/${encodeURIComponent(x.final)}" target="_blank" rel="noopener">Wiki ↗</a></div></article>`}).join('')||'<div class="empty">条件に合う艦娘がいないよ</div>';
}
function hdEnsureShipDatabase(){
 if(document.getElementById('shipDatabase'))return;
 const roster=document.getElementById('roster');if(!roster)return;
 const sec=document.createElement('section');sec.id='shipDatabase';sec.className='advanced-section';
 const types=['すべて',...new Set(HD_SHIP_DATABASE.map(x=>x.type))];
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">SHIP DATABASE</div><h2>艦娘データベース・改装計画</h2></div><span id="hdShipDbCount" class="muted"></span></div><div class="hd-shipdb-note">主要艦の改装Lv・必要アイテム・役割に加えて、Lv99最大ステータスと用途別おすすめ装備を確認。艦隊台帳のLvとも照合するよ。ステータスは攻略Wikiの現行Lv99最大値（装備補正なし）基準。</div><div class="hd-shipdb-toolbar"><input id="hdShipDbSearch" type="search" placeholder="艦名・艦種・役割で検索"><label><input id="hdShipDbMissingOnly" type="checkbox"> 未所持だけ</label></div><div class="hd-shipdb-filters">${types.map((t,i)=>`<button class="ghost small${i===0?' active':''}" type="button" data-hd-shipdb-filter="${hdShipDbEsc(t)}">${hdShipDbEsc(t)}</button>`).join('')}</div><div id="hdShipDbList" class="hd-shipdb-list"></div><div><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E6%94%B9%E9%80%A0/%E8%89%A6%E7%A8%AE%E5%88%A5%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener">攻略Wiki 改造一覧で最新情報 ↗</a></div>`;
 roster.insertAdjacentElement('beforebegin',sec);
 document.getElementById('hdShipDbSearch').addEventListener('input',hdRenderShipDatabase);
 document.getElementById('hdShipDbMissingOnly').addEventListener('change',e=>{hdShipDbMissingOnly=e.target.checked;hdRenderShipDatabase()});
 hdRenderShipDatabase();
}
function hdShipDbAdd(base){
 const item=HD_SHIP_DATABASE.find(x=>x.base===base);if(!item)return;
 if(typeof openShipRosterDialog==='function')openShipRosterDialog();
 setTimeout(()=>{
  const name=document.getElementById('rosterName'),remodel=document.getElementById('rosterRemodel'),memo=document.getElementById('rosterMemo');
  if(name)name.value=item.base;if(remodel)remodel.value='育成中';if(memo) memo.value=`目標: ${item.final} / ${item.requirements}`;
 },0);
}
document.addEventListener('click',e=>{const jump=e.target.closest?.('[data-hd-shipdb-jump]');if(jump){hdShipDbJumpTo(jump.dataset.hdShipdbJump);return}});
document.addEventListener('click',e=>{
 const f=e.target.closest?.('[data-hd-shipdb-filter]');if(f){hdShipDbType=f.dataset.hdShipdbFilter;document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderShipDatabase();return}
 const add=e.target.closest?.('[data-hd-shipdb-add]');if(add){hdShipDbAdd(add.dataset.hdShipdbAdd);return}
});
window.addEventListener('load',()=>setTimeout(hdEnsureShipDatabase,300));setTimeout(hdEnsureShipDatabase,500);
