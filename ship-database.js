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
 {base:'Saratoga',final:'Saratoga Mk.II Mod.2',type:'装甲空母',speed:'高速',targetLv:85,path:'Saratoga → Saratoga改(Lv40) → Saratoga Mk.II(Lv85) ⇔ Saratoga Mk.II Mod.2(Lv85)',requirements:'Mk.II: Lv85＋試製甲板カタパルト＋改装設計図 / Mod.2: 高速建造材×30＋開発資材×20',roles:['装甲空母','航空火力','制空'],note:'93機搭載の装甲空母形態。中破時も攻撃でき、高難度海域で安定した航空火力を出しやすい。'},
 {base:'Iowa',final:'Iowa改',type:'高速戦艦',speed:'高速',targetLv:50,path:'Iowa → Iowa改(Lv50)',requirements:'Lv50',roles:['高速戦艦','高火力','高対空','対艦'],note:'高速・高火力・高対空を兼ねる海外戦艦。通常攻略から高難度まで扱いやすい。'},
 {base:'Atlanta',final:'Atlanta改',type:'軽巡洋艦',speed:'高速',targetLv:50,path:'Atlanta → Atlanta改(Lv50)',requirements:'Lv50＋高速建造材×20＋開発資材×100',roles:['防空','対空CI','軽巡','高対空'],note:'専用対空CIが強力な防空巡洋艦。空襲・航空戦が厳しい海域向け。'},
 {base:'由良',final:'由良改二',type:'軽巡洋艦',speed:'高速',targetLv:77,path:'由良 → 由良改(Lv20) → 由良改二(Lv77)',requirements:'Lv77＋改装設計図',roles:['甲標的','水戦','対潜','対地','輸送'],note:'甲標的・水戦・大発系を扱える多用途軽巡。制空補助や輸送にも対応。'},
 {base:'朝潮',final:'朝潮改二丁',type:'駆逐艦',speed:'高速',targetLv:85,path:'朝潮 → 朝潮改(Lv20) → 朝潮改二(Lv70) ⇔ 朝潮改二丁(Lv85)',requirements:'Lv85',roles:['対潜','対地','輸送','大発'],note:'高い対潜値と大発・内火艇運用が強み。対潜・輸送・対地で便利。'},
 {base:'Jervis',final:'Jervis改',type:'駆逐艦',speed:'高速',targetLv:45,path:'Jervis → Jervis改(Lv45)',requirements:'Lv45',roles:['夜戦CI','高運','対潜','駆逐主力'],note:'高運と高対潜を持つ英国駆逐。夜戦CIと対潜を両立しやすい。'},
 {base:'Samuel B.Roberts',final:'Samuel B.Roberts Mk.II',type:'駆逐艦',speed:'高速',targetLv:78,path:'Samuel B.Roberts → Samuel B.Roberts改(Lv50) → Samuel B.Roberts Mk.II(Lv78)',requirements:'Lv78＋改装設計図＋高速建造材×20＋開発資材×60',roles:['自動先制対潜','対潜','高運','護衛'],note:'無条件先制対潜が可能な護衛駆逐艦。対潜海域の専門要員。'},
 {base:'大鳳',final:'大鳳改',type:'装甲空母',speed:'高速',targetLv:40,path:'大鳳 → 大鳳改(Lv40)',requirements:'Lv40',roles:['装甲空母','航空火力','制空','高耐久'],note:'中破でも航空攻撃できる装甲空母。高難度攻略で安定した航空火力を出しやすい。'},
 {base:'利根',final:'利根改二',type:'航空巡洋艦',speed:'高速',targetLv:70,path:'利根 → 利根改(Lv25) → 利根改二(Lv70)',requirements:'Lv70＋改装設計図',roles:['索敵','水戦','制空補助','対地'],note:'高い索敵を持つ航巡。偵察機・水戦・対地装備を使い分けやすい。'},
 {base:'筑摩',final:'筑摩改二',type:'航空巡洋艦',speed:'高速',targetLv:70,path:'筑摩 → 筑摩改(Lv25) → 筑摩改二(Lv70)',requirements:'Lv70＋改装設計図',roles:['索敵','水戦','制空補助','対地'],note:'利根改二と並ぶ高索敵航巡。制空補助や弾着観測を担当しやすい。'},
 {base:'Ташкент',final:'Ташкент改',type:'駆逐艦',speed:'高速',targetLv:50,path:'Ташкент → Ташкент改(Lv50)',requirements:'Lv50',roles:['4スロット','対潜','夜戦','高運'],note:'4スロット・射程中の大型駆逐艦。対潜・夜戦・補助装備を同時に積みやすい。'},
 {base:'天津風',final:'天津風改二',type:'駆逐艦',speed:'高速',targetLv:73,path:'天津風 → 天津風改(Lv20) → 天津風改二(Lv73)',requirements:'Lv73＋改装設計図＋戦闘詳報＋高速建造材×30＋開発資材×65',roles:['高速','高回避','夜戦','高速化'],note:'高い回避と改良缶系との相性が特徴。高速ルートや回避重視の駆逐枠で使いやすい。'},
 {base:'涼月',final:'涼月改',type:'駆逐艦',speed:'高速',targetLv:55,path:'涼月 → 涼月改(Lv55)',requirements:'Lv55',roles:['防空','対空CI','高対空'],note:'秋月型の防空駆逐。高い対空と運を活かして艦隊防空を担当する。'},
 {base:'千歳',final:'千歳航改二',type:'軽空母',speed:'高速',targetLv:50,path:'千歳 → 千歳改(Lv10) → 千歳甲(Lv12) → 千歳航(Lv15) → 千歳航改(Lv35) → 千歳航改二(Lv50)',requirements:'Lv50',roles:['軽空母','高速','制空','航空火力'],note:'高速軽空母の定番。搭載配分が扱いやすく、制空と攻撃を両立しやすい。'},
 {base:'千代田',final:'千代田航改二',type:'軽空母',speed:'高速',targetLv:50,path:'千代田 → 千代田改(Lv10) → 千代田甲(Lv12) → 千代田航(Lv15) → 千代田航改(Lv35) → 千代田航改二(Lv50)',requirements:'Lv50',roles:['軽空母','高速','制空','航空火力'],note:'千歳航改二と同系統の高速軽空母。通常海域や高速統一ルートで便利。'},
 {base:'龍驤',final:'龍驤改二',type:'軽空母',speed:'高速',targetLv:75,path:'龍驤 → 龍驤改(Lv25) → 龍驤改二(Lv75)',requirements:'Lv75',roles:['軽空母','高速','航空火力','制空'],note:'28機スロットを活かした攻撃機・艦戦運用が特徴。高速軽空母枠の有力候補。'},
 {base:'隼鷹',final:'隼鷹改二',type:'軽空母',speed:'低速',targetLv:80,path:'隼鷹 → 隼鷹改(Lv25) → 隼鷹改二(Lv80)',requirements:'Lv80',roles:['軽空母','低速','航空火力','高運'],note:'搭載66・高運の低速軽空母。速力制限がない海域で航空戦力を出しやすい。'},
 {base:'神鷹',final:'神鷹改二',type:'軽空母',speed:'低速',targetLv:85,path:'神鷹 → 神鷹改(Lv60) → 神鷹改二(Lv85)',requirements:'Lv85＋試製甲板カタパルト＋改装設計図＋開発資材×40',roles:['護衛空母','対潜','先制対潜','護衛'],note:'高対潜の護衛空母。潜水艦が多い海域や輸送護衛で役割を持ちやすい。'},
 {base:'大鷹',final:'大鷹改二',type:'軽空母',speed:'低速',targetLv:85,path:'春日丸 → 大鷹(Lv30) → 大鷹改(Lv60) → 大鷹改二(Lv85)',requirements:'Lv85＋試製甲板カタパルト＋改装設計図',roles:['護衛空母','対潜','先制対潜','護衛'],note:'高対潜の護衛空母。対潜攻撃と船団護衛を兼ねる軽空母枠。'},
 {base:'Zara',final:'Zara due',type:'重巡洋艦',speed:'高速',targetLv:88,path:'Zara → Zara改(Lv40) → Zara due(Lv88)',requirements:'Lv88＋改装設計図',roles:['水戦','制空補助','重巡','対地'],note:'水戦・水爆を扱える重巡。射程長で、制空補助や対地を兼ねやすい。'},
 {base:'Gotland',final:'Gotland andra',type:'軽巡洋艦',speed:'高速',targetLv:85,path:'Gotland → Gotland改(Lv55) → Gotland andra(Lv85)',requirements:'Lv85＋試製甲板カタパルト＋改装設計図＋高速建造材×35＋開発資材×55',roles:['4スロット','対潜','索敵','水上機','夜戦'],note:'4スロットの軽航空巡洋艦。水上機・対潜・夜戦補助を柔軟に組める。'},
 {base:'Johnston',final:'Johnston改',type:'駆逐艦',speed:'高速',targetLv:55,path:'Johnston → Johnston改(Lv55)',requirements:'Lv55＋高速建造材×10＋開発資材×80',roles:['対空CI','自動先制対潜','高運','夜戦CI'],note:'高対空・高対潜・高運を併せ持つFletcher級。防空と対潜を両立しやすい。'},
 {base:'響',final:'Верный',type:'駆逐艦',speed:'高速',targetLv:70,path:'響 → 響改(Lv20) → Верный(Lv70)',requirements:'Lv70',roles:['対潜','対地','輸送','高耐久'],note:'駆逐艦として耐久・装甲が高く、大発系や内火艇を使う対地・輸送でも便利。'},
 {base:'妙高',final:'妙高改二',type:'重巡洋艦',speed:'高速',targetLv:70,path:'妙高 → 妙高改(Lv25) → 妙高改二(Lv70)',requirements:'Lv70',roles:['夜戦CI','高運','重巡','対艦'],note:'高めの運と夜戦火力を持つ重巡。魚雷CIや通常連撃の両方に対応。'},
 {base:'羽黒',final:'羽黒改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'羽黒 → 羽黒改(Lv25) → 羽黒改二(Lv65)',requirements:'Lv65',roles:['高火力','重巡','夜戦','対艦'],note:'火力85の攻撃寄り重巡。昼連撃から夜戦まで扱いやすい。'},
 {base:'鬼怒',final:'鬼怒改二',type:'軽巡洋艦',speed:'高速',targetLv:75,path:'鬼怒 → 鬼怒改(Lv17) → 鬼怒改二(Lv75)',requirements:'Lv75＋改装設計図',roles:['輸送','大発','対潜','防空','遠征'],note:'大発系を扱え、輸送・遠征・対潜・防空をまとめて担当しやすい。'},
 {base:'綾波',final:'綾波改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'綾波 → 綾波改(Lv20) → 綾波改二(Lv70)',requirements:'Lv70',roles:['高火力','夜戦CI','高運','駆逐主力'],note:'高火力・高運の夜戦向け駆逐。魚雷CIと連撃を使い分けやすい。'},
 {base:'大潮',final:'大潮改二',type:'駆逐艦',speed:'高速',targetLv:65,path:'大潮 → 大潮改(Lv20) → 大潮改二(Lv65)',requirements:'Lv65＋改装設計図',roles:['対地','輸送','大発','夜戦'],note:'大発・内火艇を扱える高雷装駆逐。輸送と対地の両方で使いやすい。'},
 {base:'大淀',final:'大淀改',type:'軽巡洋艦',speed:'高速',targetLv:35,path:'大淀 → 大淀改(Lv35)',requirements:'Lv35',roles:['4スロット','索敵','司令部','昼連撃'],note:'高索敵の4スロ軽巡。艦隊司令部施設や偵察機を使う連合艦隊運用で便利。'}
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
 'Saratoga Mk.II Mod.2':{hp:89,armor:88,evasion:56,fire:58,torp:0,aa:94,asw:0,los:95,luck:40,air:93,fuel:100,ammo:100,range:'中'},
 'Iowa改':{hp:92,armor:107,evasion:70,fire:117,torp:0,aa:120,asw:0,los:71,luck:41,air:16,fuel:200,ammo:275,range:'長'},
 'Atlanta改':{hp:41,armor:61,evasion:76,fire:64,torp:70,aa:128,asw:32,los:50,luck:18,air:0,fuel:30,ammo:60,range:'短'},
 '由良改二':{hp:45,armor:67,evasion:84,fire:57,torp:83,aa:88,asw:83,los:64,luck:16,air:4,fuel:25,ammo:30,range:'短'},
 '朝潮改二丁':{hp:34,armor:55,evasion:88,fire:55,torp:86,aa:75,asw:89,los:55,luck:17,air:0,fuel:15,ammo:20,range:'短'},
 'Jervis改':{hp:31,armor:50,evasion:90,fire:52,torp:90,aa:70,asw:92,los:52,luck:55,air:0,fuel:15,ammo:25,range:'短'},
 'Samuel B.Roberts Mk.II':{hp:29,armor:47,evasion:90,fire:52,torp:70,aa:68,asw:90,los:52,luck:40,air:3,fuel:15,ammo:20,range:'短'},
 '大鳳改':{hp:70,armor:84,evasion:59,fire:59,torp:0,aa:86,asw:0,los:77,luck:4,air:86,fuel:90,ammo:75,range:'短'},
 '利根改二':{hp:59,armor:80,evasion:83,fire:78,torp:82,aa:84,asw:0,los:93,luck:15,air:19,fuel:50,ammo:65,range:'中'},
 '筑摩改二':{hp:58,armor:79,evasion:80,fire:79,torp:83,aa:85,asw:0,los:94,luck:14,air:19,fuel:50,ammo:65,range:'中'},
 'Ташкент改':{hp:39,armor:56,evasion:94,fire:66,torp:68,aa:69,asw:73,los:48,luck:43,air:0,fuel:15,ammo:35,range:'中'},
 '天津風改二':{hp:35,armor:63,evasion:99,fire:65,torp:89,aa:72,asw:67,los:44,luck:19,air:0,fuel:20,ammo:20,range:'短'},
 '涼月改':{hp:38,armor:55,evasion:91,fire:56,torp:52,aa:117,asw:71,los:49,luck:37,air:0,fuel:20,ammo:25,range:'短'},
 '千歳航改二':{hp:58,armor:65,evasion:69,fire:34,torp:0,aa:72,asw:0,los:79,luck:13,air:59,fuel:45,ammo:40,range:'短'},
 '千代田航改二':{hp:58,armor:65,evasion:69,fire:34,torp:0,aa:72,asw:0,los:79,luck:13,air:59,fuel:45,ammo:40,range:'短'},
 '龍驤改二':{hp:50,armor:62,evasion:69,fire:40,torp:0,aa:48,asw:0,los:79,luck:15,air:55,fuel:40,ammo:45,range:'短'},
 '隼鷹改二':{hp:55,armor:62,evasion:84,fire:40,torp:0,aa:74,asw:0,los:79,luck:41,air:66,fuel:45,ammo:50,range:'短'},
 '神鷹改二':{hp:50,armor:56,evasion:53,fire:37,torp:0,aa:58,asw:88,los:64,luck:15,air:51,fuel:35,ammo:35,range:'中'},
 '大鷹改二':{hp:49,armor:55,evasion:54,fire:39,torp:0,aa:54,asw:89,los:68,luck:14,air:39,fuel:35,ammo:35,range:'中'},
 'Zara due':{hp:62,armor:88,evasion:73,fire:87,torp:48,aa:90,asw:0,los:64,luck:17,air:15,fuel:50,ammo:80,range:'長'},
 'Gotland andra':{hp:47,armor:67,evasion:78,fire:60,torp:73,aa:90,asw:60,los:72,luck:26,air:14,fuel:30,ammo:35,range:'中'},
 'Johnston改':{hp:34,armor:52,evasion:89,fire:55,torp:72,aa:90,asw:90,los:60,luck:40,air:0,fuel:20,ammo:20,range:'短'},
 'Верный':{hp:37,armor:58,evasion:89,fire:58,torp:89,aa:65,asw:77,los:44,luck:20,air:0,fuel:15,ammo:25,range:'短'},
 '妙高改二':{hp:56,armor:80,evasion:88,fire:82,torp:88,aa:80,asw:0,los:61,luck:32,air:12,fuel:45,ammo:75,range:'中'},
 '羽黒改二':{hp:57,armor:78,evasion:86,fire:85,torp:84,aa:76,asw:0,los:58,luck:19,air:12,fuel:45,ammo:75,range:'中'},
 '鬼怒改二':{hp:45,armor:68,evasion:82,fire:58,torp:84,aa:86,asw:87,los:60,luck:17,air:3,fuel:25,ammo:30,range:'短'},
 '綾波改二':{hp:32,armor:54,evasion:90,fire:76,torp:89,aa:52,asw:63,los:51,luck:40,air:0,fuel:15,ammo:20,range:'短'},
 '大潮改二':{hp:31,armor:51,evasion:90,fire:67,torp:90,aa:62,asw:64,los:54,luck:17,air:0,fuel:15,ammo:20,range:'短'},
 '大淀改':{hp:47,armor:69,evasion:78,fire:71,torp:49,aa:77,asw:39,los:84,luck:30,air:12,fuel:35,ammo:35,range:'中'}
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
 ],
 'Iowa改':[
  {name:'高速戦艦・弾着',gear:['16inch三連装砲 Mk.7','16inch三連装砲 Mk.7','高性能水偵','一式徹甲弾改'],memo:'高火力と命中を活かす主砲2＋水偵＋徹甲弾。'},
  {name:'防空寄り',gear:['16inch三連装砲 Mk.7','16inch三連装砲 Mk.7','高性能水偵','高性能対空装備'],memo:'高対空120を活かしつつ通常の弾着運用を維持。'}
 ],
 'Atlanta改':[
  {name:'専用対空CI',gear:['5inch連装両用砲(集中配備)','5inch連装両用砲(集中配備)','GFCS Mk.37'],memo:'Atlantaの専用対空CIを優先する防空特化構成。'},
  {name:'防空＋夜戦補助',gear:['5inch連装両用砲(集中配備)','5inch連装両用砲(集中配備)','高性能電探'],memo:'航空攻撃対策を主目的に、夜戦連撃も意識。'}
 ],
 '由良改二':[
  {name:'先制雷撃・制空補助',gear:['甲標的 丁型改','二式水戦改(熟練)','主砲/水偵'],memo:'甲標的と水戦を同時運用して先制雷撃と制空補助を両立。'},
  {name:'対地・輸送',gear:['甲標的 丁型改','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇'],memo:'対地または輸送海域向け。'}
 ],
 '朝潮改二丁':[
  {name:'先制対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'最大対潜89を活かした対潜特化。'},
  {name:'対地・輸送',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','大発動艇/補助装備'],memo:'大発・内火艇を使う輸送/対地向け。'}
 ],
 'Jervis改':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'高運55を活かした夜戦魚雷CI。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'最大対潜92を活かす対潜型。'}
 ],
 'Samuel B.Roberts Mk.II':[
  {name:'無条件先制対潜',gear:['HF/DF + Type144/147 ASDIC','RUR-4A Weapon Alpha改','主砲/電探'],memo:'無条件先制対潜を活かし、余裕があれば1枠を補助へ。'},
  {name:'対潜火力重視',gear:['HF/DF + Type144/147 ASDIC','RUR-4A Weapon Alpha改','爆雷'],memo:'潜水艦対策を最優先する構成。'}
 ],
 '大鳳改':[
  {name:'装甲空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦'],memo:'86機搭載と中破攻撃可能を活かす汎用構成。'},
  {name:'航空火力重視',gear:['強力な艦攻','強力な艦爆','強力な艦攻','高性能艦戦'],memo:'必要制空を満たした海域で攻撃機を増やす。'}
 ],
 '利根改二':[
  {name:'索敵・弾着',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能水偵/電探'],memo:'最大索敵93を活かし、索敵分岐と昼連撃を両立。'},
  {name:'制空補助',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','二式水戦改(熟練)','零式水上偵察機11型乙(熟練)'],memo:'航巡の水戦運用で制空を補う。'}
 ],
 '筑摩改二':[
  {name:'索敵・弾着',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能水偵/電探'],memo:'最大索敵94を活かす索敵重視型。'},
  {name:'制空補助',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','二式水戦改(熟練)','零式水上偵察機11型乙(熟練)'],memo:'制空補助と昼連撃を両立。'}
 ],
 'Ташкент改':[
  {name:'4スロ対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷','主砲/電探'],memo:'4スロを活かして対潜3点セット＋自由枠。'},
  {name:'夜戦・補助',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員','照明弾/探照灯/電探'],memo:'高運43と4スロを使って夜戦CIと補助を両立。'}
 ],
 '天津風改二':[
  {name:'高速・夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'高回避と雷装89を活かした安定型。'},
  {name:'高速化・回避補助',gear:['高性能駆逐主砲','新型高温高圧缶','強化型艦本式缶'],memo:'速力条件や回避補助を重視する海域向け。'}
 ],
 '涼月改':[
  {name:'防空CI',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空117を活かす秋月型の基本防空構成。'},
  {name:'防空＋対潜',gear:['10cm連装高角砲＋高射装置','高性能対空電探','四式水中聴音機'],memo:'防空を維持しつつ潜水対策を補助。'}
 ],
 '千歳航改二':[
  {name:'高速軽空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦'],memo:'高速統一ルートで使いやすい航空火力・制空両立型。'},
  {name:'制空寄り',gear:['強力な艦攻','高性能艦戦','高性能艦戦','高性能艦戦'],memo:'必要制空値が高い海域向け。'}
 ],
 '千代田航改二':[
  {name:'高速軽空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦'],memo:'千歳航改二と同じく高速軽空母の標準型。'},
  {name:'制空寄り',gear:['強力な艦攻','高性能艦戦','高性能艦戦','高性能艦戦'],memo:'制空値を優先して艦戦を増やす。'}
 ],
 '龍驤改二':[
  {name:'28機スロ攻撃型',gear:['高性能艦戦','強力な艦攻','強力な艦爆','彩雲/補助装備'],memo:'最大28機スロットに主力攻撃機を載せる。'},
  {name:'制空補助',gear:['高性能艦戦','高性能艦戦','強力な艦攻','彩雲/艦戦'],memo:'制空要求に応じて大スロットを艦戦へ。'}
 ],
 '隼鷹改二':[
  {name:'低速軽空母バランス',gear:['強力な艦攻','強力な艦爆','高性能艦戦','高性能艦戦'],memo:'搭載66を活かす標準型。'},
  {name:'航空火力重視',gear:['強力な艦攻','強力な艦攻','高性能艦戦','高性能艦戦'],memo:'速力制限がない海域で航空火力を伸ばす。'}
 ],
 '神鷹改二':[
  {name:'護衛空母・対潜',gear:['対潜値の高い艦攻','対潜値の高い艦攻','高性能艦戦','彩雲/対潜艦攻'],memo:'最大対潜88を活かして潜水艦対策を担当。'},
  {name:'護衛・制空',gear:['対潜値の高い艦攻','高性能艦戦','高性能艦戦','彩雲'],memo:'対潜を維持しながら制空も補助。'}
 ],
 '大鷹改二':[
  {name:'護衛空母・対潜',gear:['対潜値の高い艦攻','対潜値の高い艦攻','高性能艦戦','彩雲/対潜艦攻'],memo:'最大対潜89を活かす船団護衛向け。'},
  {name:'対潜＋制空',gear:['対潜値の高い艦攻','高性能艦戦','高性能艦戦','彩雲'],memo:'潜水対策と最低限の制空を両立。'}
 ],
 'Zara due':[
  {name:'重巡連撃＋水戦',gear:['203mm/53 連装砲','203mm/53 連装砲','零式水上偵察機11型乙(熟練)','二式水戦改(熟練)'],memo:'重巡火力を維持しながら水戦で制空補助。'},
  {name:'対地',gear:['主砲','主砲','三式弾','水戦/水偵'],memo:'陸上型相手の基本。敵に応じて対地装備を調整。'}
 ],
 'Gotland andra':[
  {name:'4スロ連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'4スロを使って昼連撃・索敵・命中をまとめる。'},
  {name:'対潜＋補助',gear:['四式水中聴音機','対潜爆雷投射機','爆雷','水偵/夜戦補助'],memo:'対潜3点セットに1枠の補助装備を追加。'}
 ],
 'Johnston改':[
  {name:'対空CI',gear:['5inch単装砲 Mk.30 改','5inch単装砲 Mk.30 改','GFCS Mk.37'],memo:'Fletcher級の防空性能を活かす定番。'},
  {name:'先制対潜',gear:['HF/DF + Type144/147 ASDIC','RUR-4A Weapon Alpha改','5inch単装砲 Mk.30 改'],memo:'高対潜90を活かして対潜と防空を両立。'}
 ],
 'Верный':[
  {name:'対地',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','主砲/補助装備'],memo:'耐久の高さと対地装備適性を活かす。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜77を活かす標準対潜型。'}
 ],
 '妙高改二':[
  {name:'重巡連撃',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'昼夜連撃と索敵を両立。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','夜戦補助/電探','高性能水偵'],memo:'運32を活かして夜戦CIを狙う高難度向け。'}
 ],
 '羽黒改二':[
  {name:'高火力連撃',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'火力85を活かした標準重巡構成。'},
  {name:'夜戦火力',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','夜戦補助','高性能水偵'],memo:'連撃を維持しつつ夜戦支援装備を追加。'}
 ],
 '鬼怒改二':[
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'輸送量を優先するTP海域向け。'},
  {name:'対潜＋輸送',gear:['四式水中聴音機','対潜爆雷投射機','大発動艇'],memo:'高対潜87を活かしながら輸送も担当。'}
 ],
 '綾波改二':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運40と高火力を活かす夜戦フィニッシャー。'},
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'安定重視の昼夜連撃型。'}
 ],
 '大潮改二':[
  {name:'対地',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','主砲/対地補助'],memo:'対地火力を優先する陸上型向け。'},
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'TP輸送量を優先。'}
 ],
 '大淀改':[
  {name:'4スロ索敵連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'索敵84を活かして分岐と昼連撃を安定。'},
  {name:'司令部・連合艦隊',gear:['主砲','主砲','艦隊司令部施設','高性能水偵'],memo:'連合艦隊旗艦で護衛退避を使う場合の構成例。'}
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
  const own=hdShipDbOwned(x);if(own){score+=2;reasons.push(`所持${own.level?` Lv.${own.level}`:''}`)}
  return {item:x,score,reasons:[...new Set(reasons)],index};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,6);
}
function hdShipDbEquipNorm(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')}
function hdShipDbEquipCatalog(){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 return Array.isArray(cat)?cat:[];
}
function hdShipDbOwnedEquipInventory(){
 let rows=[];try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');rows=Array.isArray(x)?x:[]}catch{}
 const cat=hdShipDbEquipCatalog(),byName=new Map(cat.map(x=>[hdShipDbEquipNorm(x.name),x])),m=new Map();
 for(const row of rows){
  const key=hdShipDbEquipNorm(row.name),count=Math.max(0,Number(row.count)||0);if(!key||!count)continue;
  const item=byName.get(key)||{name:row.name,category:row.category||'',stats:{},tags:[],role:''};
  const cur=m.get(key)||{key,name:row.name,count:0,maxStar:0,item};
  cur.count+=count;cur.maxStar=Math.max(cur.maxStar,Math.max(0,Number(row.star)||0));m.set(key,cur);
 }
 return m;
}
function hdShipDbEquipCompatible(item,ship){
 if(typeof hdFLCompatible==='function')return hdFLCompatible(item,{profile:{type:ship.type,roles:ship.roles||[],row:{name:ship.final}}});
 const cat=String(item.category||''),type=ship.type,roles=ship.roles||[];
 const carrier=['軽空母','正規空母','装甲空母'].includes(type),battle=['戦艦','高速戦艦','航空戦艦'].includes(type),destroyer=['駆逐艦','海防艦'].includes(type),cruiser=['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','練習巡洋艦'].includes(type);
 if(/陸上攻撃機|陸軍戦闘機|局地戦闘機/.test(cat))return false;
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|艦上偵察機/.test(cat))return carrier;
 if(/大口径主砲/.test(cat))return battle;
 if(/中口径主砲/.test(cat))return cruiser;
 if(/小口径主砲/.test(cat))return destroyer||['軽巡洋艦','練習巡洋艦'].includes(type);
 if(/水上戦闘機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||roles.includes('水戦')||roles.includes('制空補助');
 if(/水上偵察機/.test(cat))return battle||['軽巡洋艦','重巡洋艦','航空巡洋艦','航空戦艦','水上機母艦'].includes(type);
 if(/対艦強化弾/.test(cat))return battle;
 if(/魚雷/.test(cat))return destroyer||['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','潜水艦','潜水空母'].includes(type);
 if(/ソナー|爆雷/.test(cat))return destroyer||['軽巡洋艦','練習巡洋艦','軽空母'].includes(type)||roles.some(r=>String(r).includes('対潜'));
 if(/上陸用舟艇|特型内火艇/.test(cat))return roles.some(r=>['対地','輸送','大発'].includes(r));
 return true;
}
function hdShipDbEquipPower(item,wanted){
 const s=item.stats||{},w=String(wanted||'');
 let score=(Number(s.火力)||0)*.6+(Number(s.雷装)||0)*.6+(Number(s.爆装)||0)*.55+(Number(s.対空)||0)*.5+(Number(s.対潜)||0)*.5+(Number(s.索敵)||0)*.4+(Number(s.命中)||0)*.45;
 if(/艦戦|制空|対空/.test(w))score+=(Number(s.対空)||0)*2;
 if(/艦攻|魚雷/.test(w))score+=(Number(s.雷装)||0)*1.8;
 if(/艦爆/.test(w))score+=(Number(s.爆装)||0)*1.8;
 if(/対潜|ソナー|爆雷/.test(w))score+=(Number(s.対潜)||0)*2;
 if(/電探|索敵|水偵|偵察|彩雲/.test(w))score+=(Number(s.索敵)||0)*1.4+(Number(s.命中)||0);
 if(/主砲|砲/.test(w))score+=(Number(s.火力)||0)*1.6+(Number(s.命中)||0);
 return score;
}
function hdShipDbEquipWantedMatch(item,wanted,ship){
 const raw=String(wanted||''),w=hdShipDbEquipNorm(raw),name=hdShipDbEquipNorm(item.name),cat=String(item.category||''),tags=item.tags||[];
 if(!hdShipDbEquipCompatible(item,ship))return -Infinity;
 if(name===w)return 10000;
 let score=0,matched=false;
 const any=(re)=>re.test(cat)||tags.some(t=>re.test(String(t)))||re.test(String(item.role||''));
 const hit=(ok,bonus=150)=>{if(ok){matched=true;score+=bonus}};
 if(/高性能艦戦|艦戦/.test(raw))hit(/艦上戦闘機/.test(cat)||tags.includes('艦戦')||tags.includes('制空'),260);
 if(/強力な艦攻|対潜値の高い艦攻|艦攻/.test(raw)){hit(/艦上攻撃機/.test(cat)||tags.includes('艦攻'),250);if(/対潜/.test(raw))score+=(Number(item.stats?.対潜)||0)*8}
 if(/強力な艦爆|艦爆/.test(raw))hit(/艦上爆撃機/.test(cat)||tags.includes('艦爆'),250);
 if(/彩雲/.test(raw))hit(name.includes(hdShipDbEquipNorm('彩雲'))||/艦上偵察機/.test(cat),270);
 if(/高性能水偵|水偵|偵察機/.test(raw))hit(/水上偵察機/.test(cat)||tags.includes('水偵'),250);
 if(/水戦/.test(raw))hit(/水上戦闘機/.test(cat)||tags.includes('水戦'),250);
 if(/高性能対空電探|対空電探/.test(raw))hit(/電探/.test(cat)&&((Number(item.stats?.対空)||0)>0||tags.includes('対空CI')||tags.includes('防空')),270);
 else if(/高性能電探|水上電探|電探/.test(raw))hit(/電探/.test(cat)||tags.includes('電探'),230);
 if(/高性能駆逐主砲/.test(raw))hit(/小口径主砲/.test(cat),260);
 else if(/主砲/.test(raw)){
  if(['駆逐艦','海防艦'].includes(ship.type))hit(/小口径主砲/.test(cat),240);
  else if(['戦艦','高速戦艦','航空戦艦'].includes(ship.type))hit(/大口径主砲/.test(cat),240);
  else hit(/小口径主砲|中口径主砲/.test(cat),220);
 }
 if(/魚雷/.test(raw))hit(/魚雷/.test(cat)&&!/特殊潜航艇|甲標的/.test(cat),250);
 if(/甲標的/.test(raw))hit(tags.includes('甲標的')||/特殊潜航艇|甲標的/.test(cat)||name.includes('甲標的'),300);
 if(/徹甲弾/.test(raw))hit(/対艦強化弾/.test(cat)||tags.includes('徹甲弾'),280);
 if(/三式弾/.test(raw))hit(name.includes('三式弾')||/対空強化弾/.test(cat),280);
 if(/ソナー|水中聴音機|探信儀/.test(raw))hit(/ソナー/.test(cat)||tags.includes('ソナー'),280);
 if(/爆雷投射機/.test(raw))hit(/爆雷投射機/.test(cat),290);
 else if(/爆雷/.test(raw))hit(/爆雷/.test(cat),250);
 if(/内火艇/.test(raw))hit(/特型内火艇/.test(cat)||name.includes('内火艇'),300);
 if(/大発/.test(raw))hit(/上陸用舟艇/.test(cat)||tags.includes('輸送')||tags.includes('上陸'),260);
 if(/ロケット|対地装備/.test(raw))hit(any(/対地|集積地|上陸/),250);
 if(/機銃/.test(raw))hit(/対空機銃/.test(cat),250);
 if(/照明弾/.test(raw))hit(/照明弾/.test(cat)||name.includes('照明弾'),280);
 if(/探照灯/.test(raw))hit(/探照灯/.test(cat)||name.includes('探照灯'),280);
 if(/見張員/.test(raw))hit(/熟練見張員/.test(cat)||name.includes('見張員'),280);
 if(/缶|高速化|機関/.test(raw))hit(/機関部強化/.test(cat)||tags.includes('高速化')||name.includes('缶'),260);
 if(/対空装備/.test(raw))hit(any(/防空|対空CI/)||/対空機銃|高角砲/.test(cat),230);
 if(/回転翼機/.test(raw))hit(/回転翼機/.test(cat),280);
 if(/対潜哨戒機/.test(raw))hit(/対潜哨戒機/.test(cat),280);
 if(!matched&&raw.includes('/')){
  const parts=raw.split('/').map(x=>x.trim()).filter(Boolean);
  for(const p of parts){const x=hdShipDbEquipWantedMatch(item,p,ship);if(Number.isFinite(x)&&x>0){matched=true;score=Math.max(score,x*.72)}}
 }
 if(!matched)return -Infinity;
 return score+hdShipDbEquipPower(item,raw);
}
function hdShipDbResolveOwnedLoadout(ship,set){
 const inv=hdShipDbOwnedEquipInventory(),remaining=new Map([...inv].map(([k,v])=>[k,v.count])),slots=[];
 for(const wanted of (set?.gear||[])){
  const candidates=[];
  for(const own of inv.values()){
   if((remaining.get(own.key)||0)<=0)continue;
   const score=hdShipDbEquipWantedMatch(own.item,wanted,ship);if(!Number.isFinite(score))continue;
   candidates.push({own,score:score+(own.maxStar||0)*1.5});
  }
  candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
  const best=candidates[0];
  if(best){remaining.set(best.own.key,(remaining.get(best.own.key)||0)-1);slots.push({wanted,found:true,name:best.own.name,star:best.own.maxStar,count:best.own.count})}
  else slots.push({wanted,found:false,name:'',star:0,count:0});
 }
 return {slots,filled:slots.filter(x=>x.found).length,total:slots.length,inventoryCount:[...inv.values()].reduce((s,x)=>s+x.count,0)};
}
function hdShipDbOwnedFitHtml(ship,set){
 if(!set)return '';
 const plan=hdShipDbResolveOwnedLoadout(ship,set);
 if(!plan.inventoryCount)return '<div class="hd-map-owned-fit empty-fit"><b>手持ち装備案</b><span>装備台帳が空だよ。装備を登録するとここに自動配備する。</span></div>';
 const cls=plan.filled===plan.total?'complete':plan.filled?'partial':'missing';
 return `<div class="hd-map-owned-fit ${cls}"><div class="hd-map-owned-fit-head"><div><b>手持ち装備案</b><small>${plan.filled}/${plan.total}枠を配備</small></div><button type="button" class="ghost small" data-hd-ship-owned-refresh>再配備</button></div><div class="hd-map-owned-slots">${plan.slots.map(x=>x.found?`<span class="owned"><i>✓</i><b>${hdShipDbEsc(x.name)}${x.star?` ★${x.star}`:''}</b><small>所持 ${x.count}｜${hdShipDbEsc(x.wanted)}</small></span>`:`<span class="missing"><i>!</i><b>不足</b><small>${hdShipDbEsc(x.wanted)}</small><button type="button" class="ghost small" data-hd-ship-acquire="${hdShipDbEsc(x.wanted)}">入手方法</button></span>`).join('')}</div><button type="button" class="ghost small" data-hd-ship-equip-ledger>装備台帳を開く</button></div>`;
}
function hdShipDbAcquisitionKind(wanted){
 const w=String(wanted||'');
 if(/艦戦|制空/.test(w))return '制空';
 if(/艦攻|艦爆|航空火力/.test(w))return '航空火力';
 if(/ソナー|水中聴音機|探信儀|爆雷|対潜/.test(w))return '対潜';
 if(/電探/.test(w))return '電探';
 if(/水偵|偵察|彩雲|索敵/.test(w))return '索敵';
 if(/魚雷/.test(w)&&!/甲標的/.test(w))return '魚雷';
 if(/主砲|連装砲|三連装砲/.test(w))return '主砲';
 if(/内火艇|大発|三式弾|ロケット|対地/.test(w))return '対地';
 if(/高角砲|機銃|対空/.test(w))return '防空';
 if(/照明弾|探照灯|見張員|夜戦/.test(w))return '夜戦';
 if(/缶|タービン|高速化|機関/.test(w))return '高速化';
 return '';
}
function hdShipDbOpenAcquire(wanted){
 const cat=hdShipDbEquipCatalog(),key=hdShipDbEquipNorm(wanted),exact=cat.find(x=>hdShipDbEquipNorm(x.name)===key);
 const map=typeof selectedMap!=='undefined'?selectedMap:'';
 if(exact&&typeof hdAGOpenItem==='function'){hdAGOpenItem(exact.name,map);return}
 const kind=hdShipDbAcquisitionKind(wanted);
 if(kind&&typeof hdAGOpen==='function'){hdAGOpen(kind,map);return}
 if(typeof hdAGOpenCatalog==='function')hdAGOpenCatalog(wanted);
}
function hdShipDbRefreshOwnedFits(root=document){
 root.querySelectorAll?.('[data-hd-owned-fit]').forEach(host=>{
  const ship=HD_SHIP_DATABASE.find(x=>x.final===host.dataset.hdOwnedFit),sets=ship?HD_SHIP_LOADOUTS[ship.final]||[]:[],set=sets.find(x=>x.name===host.dataset.hdLoadoutName)||sets[0];
  if(ship&&set)host.innerHTML=hdShipDbOwnedFitHtml(ship,set);
 });
}

function hdShipDbMapLoadout(item,reasons=[]){
 const sets=HD_SHIP_LOADOUTS[item.final]||[];if(!sets.length)return null;
 const prefs=[
  {reason:'対潜',re:/対潜/},
  {reason:'防空・制空',re:/対空|防空|制空|航空/},
  {reason:'対地',re:/対地/},
  {reason:'輸送',re:/輸送/},
  {reason:'夜戦',re:/夜戦|魚雷CI|連撃/},
  {reason:'先制雷撃',re:/先制雷撃|甲標的|魚雷CI/},
  {reason:'特殊砲撃',re:/特殊砲撃|タッチ/},
  {reason:'高難度',re:/高火力|装甲空母|弾着/}
 ];
 for(const p of prefs){
  if(!reasons.includes(p.reason))continue;
  const hit=sets.find(x=>p.re.test(`${x.name} ${x.memo}`));if(hit)return hit;
 }
 return sets[0];
}
function hdShipDbMapRecommendHtml(map,detail){
 const rows=hdShipDbMapCandidates(detail);if(!rows.length)return '';
 return `<section class="hd-map-ship-recommend"><div class="hd-map-ship-recommend-head"><div><div class="eyebrow">SHIP CANDIDATES</div><strong>この海域の艦娘候補＋装備例</strong></div><span>DB・台帳から自動抽出</span></div><p class="hd-map-ship-recommend-note">海域説明の役割・艦種・速力と、艦隊台帳の所持状況から候補を抽出。装備例は海域の特徴に近いプリセットを優先表示するよ。ルート固定・特効・札・制空値は最優先で調整してね。</p><div class="hd-map-ship-recommend-grid">${rows.map(({item,reasons})=>{const set=hdShipDbMapLoadout(item,reasons);return `<article class="hd-map-ship-candidate"><button type="button" class="hd-map-ship-candidate-main" data-hd-shipdb-jump="${hdShipDbEsc(item.final)}"><span><b>${hdShipDbEsc(item.final)}</b><small>${hdShipDbEsc(item.type)}・${hdShipDbEsc(item.speed)}</small></span><span class="hd-map-ship-reasons">${reasons.slice(0,4).map(r=>`<i>${hdShipDbEsc(r)}</i>`).join('')}</span></button>${set?`<div class="hd-map-candidate-loadout"><div><b>${hdShipDbEsc(set.name)}</b><small>おすすめ装備例</small></div><div class="hd-map-candidate-gears">${set.gear.map(g=>`<span>${hdShipDbEsc(g)}</span>`).join('')}</div><p>${hdShipDbEsc(set.memo)}</p></div><div data-hd-owned-fit="${hdShipDbEsc(item.final)}" data-hd-loadout-name="${hdShipDbEsc(set.name)}">${hdShipDbOwnedFitHtml(item,set)}</div>`:''}<button type="button" class="ghost small hd-map-candidate-more" data-hd-shipdb-jump="${hdShipDbEsc(item.final)}">ステータス・別装備を見る</button></article>`}).join('')}</div></section>`;
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
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-hd-ship-owned-refresh]')){const card=e.target.closest('.hd-map-ship-candidate');if(card)hdShipDbRefreshOwnedFits(card);return}
 const acquire=e.target.closest?.('[data-hd-ship-acquire]');if(acquire){hdShipDbOpenAcquire(acquire.dataset.hdShipAcquire);return}
 if(e.target.closest?.('[data-hd-ship-equip-ledger]')){
  if(typeof hdOwnedOpenLedger==='function')hdOwnedOpenLedger('');
  else{const target=document.getElementById('equipmentBook');if(target)target.scrollIntoView({behavior:'smooth',block:'start'})}
  return;
 }
});
window.addEventListener('hd:modules-ready',()=>setTimeout(()=>hdShipDbRefreshOwnedFits(document),0));
window.addEventListener('storage',e=>{if(e.key==='harbordesk-equipment-v1')hdShipDbRefreshOwnedFits(document)});
setTimeout(()=>hdShipDbRefreshOwnedFits(document),900);
document.addEventListener('click',e=>{const jump=e.target.closest?.('[data-hd-shipdb-jump]');if(jump){hdShipDbJumpTo(jump.dataset.hdShipdbJump);return}});
document.addEventListener('click',e=>{
 const f=e.target.closest?.('[data-hd-shipdb-filter]');if(f){hdShipDbType=f.dataset.hdShipdbFilter;document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderShipDatabase();return}
 const add=e.target.closest?.('[data-hd-shipdb-add]');if(add){hdShipDbAdd(add.dataset.hdShipdbAdd);return}
});
window.addEventListener('load',()=>setTimeout(hdEnsureShipDatabase,300));setTimeout(hdEnsureShipDatabase,500);
