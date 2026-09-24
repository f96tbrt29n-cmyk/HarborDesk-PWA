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
 {base:'大淀',final:'大淀改',type:'軽巡洋艦',speed:'高速',targetLv:35,path:'大淀 → 大淀改(Lv35)',requirements:'Lv35',roles:['4スロット','索敵','司令部','昼連撃'],note:'高索敵の4スロ軽巡。艦隊司令部施設や偵察機を使う連合艦隊運用で便利。'},
 {base:'榛名',final:'榛名改二乙',type:'高速戦艦',speed:'高速',targetLv:88,path:'榛名 → 榛名改(Lv25) → 榛名改二(Lv80) → 榛名改二乙(Lv88) ⇔ 榛名改二丙(Lv90)',requirements:'Lv88＋改装設計図×2＋新型兵装資材×2＋戦闘詳報＋開発資材×390',roles:['高速戦艦','対空','夜戦','高運'],note:'高い対空と運を持つ高速戦艦。通常攻略から夜戦・防空寄りまで幅広く使いやすい。'},
 {base:'霧島',final:'霧島改二丙',type:'高速戦艦',speed:'高速',targetLv:89,path:'霧島 → 霧島改(Lv25) → 霧島改二(Lv75) → 霧島改二丙(Lv89)',requirements:'Lv89＋改装設計図×2＋新型砲熕兵装資材×2＋戦闘詳報＋開発資材×400',roles:['高速戦艦','高火力','夜戦','対艦'],note:'火力106と雷装40を持つ攻撃寄り高速戦艦。昼夜を通じて高い打点を出しやすい。'},
 {base:'木曾',final:'木曾改二',type:'重雷装巡洋艦',speed:'高速',targetLv:65,path:'木曾 → 木曾改(Lv20) → 木曾改二(Lv65)',requirements:'Lv65',roles:['先制雷撃','夜戦','対潜','高雷装'],note:'雷装111の雷巡。北上・大井より雷装は低いが、対空・対潜とのバランスが良い。'},
 {base:'神通',final:'神通改二',type:'軽巡洋艦',speed:'高速',targetLv:60,path:'神通 → 神通改(Lv20) → 神通改二(Lv60)',requirements:'Lv60',roles:['高火力','高雷装','夜戦','軽巡主力'],note:'火力74・雷装99の夜戦火力型軽巡。連撃や魚雷CIでボス夜戦に向く。'},
 {base:'鳥海',final:'鳥海改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'鳥海 → 鳥海改(Lv25) → 鳥海改二(Lv65)',requirements:'Lv65＋改装設計図',roles:['高火力','夜戦','重巡','対艦'],note:'火力86・雷装87の高夜戦火力重巡。通常連撃でも高い打点を出せる。'},
 {base:'夕雲',final:'夕雲改二',type:'駆逐艦',speed:'高速',targetLv:75,path:'夕雲 → 夕雲改(Lv30) → 夕雲改二(Lv75)',requirements:'Lv75＋改装設計図＋戦闘詳報',roles:['D型砲','夜戦','対潜','駆逐主力'],note:'夕雲型改二の標準格。D型砲系と相性がよく、対潜も高め。'},
 {base:'満潮',final:'満潮改二',type:'駆逐艦',speed:'高速',targetLv:77,path:'満潮 → 満潮改(Lv20) → 満潮改二(Lv77)',requirements:'Lv77',roles:['対地','輸送','大発','高火力'],note:'設計図不要で大発・内火艇を扱える対地/輸送向け駆逐艦。'},
 {base:'朝霜',final:'朝霜改二',type:'駆逐艦',speed:'高速',targetLv:77,path:'朝霜 → 朝霜改(Lv45) → 朝霜改二(Lv77) → 朝霜改二補(Lv92)',requirements:'Lv77＋改装設計図＋戦闘詳報＋開発資材×30',roles:['D型砲','対潜','夜戦','高回避'],note:'回避94・対潜76を持つ夕雲型改二。D型砲運用と対潜を両立しやすい。'},
 {base:'初霜',final:'初霜改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'初霜 → 初霜改(Lv20) → 初霜改二(Lv70)',requirements:'Lv70',roles:['高運','夜戦CI','対空','対潜'],note:'運53の幸運駆逐。魚雷CIを狙いやすく、対空・対潜もバランスが良い。'},
 {base:'磯風',final:'磯風乙改',type:'駆逐艦',speed:'高速',targetLv:68,path:'磯風 → 磯風改(Lv45) → 磯風乙改(Lv68)',requirements:'Lv68＋高速建造材×10＋開発資材×40',roles:['対空','対空CI','夜戦','対潜'],note:'対空91の乙改駆逐。防空と通常夜戦を兼ねる使いやすい改装形態。'},
 {base:'荒潮',final:'荒潮改二',type:'駆逐艦',speed:'高速',targetLv:67,path:'荒潮 → 荒潮改(Lv20) → 荒潮改二(Lv67)',requirements:'Lv67＋改装設計図',roles:['対地','輸送','大発','高火力'],note:'設計図は必要だが、対地・輸送をこなしやすい朝潮型改二。'},
 {base:'白露',final:'白露改二',type:'駆逐艦',speed:'高速',targetLv:77,path:'白露 → 白露改(Lv20) → 白露改二(Lv77)',requirements:'Lv77＋戦闘詳報＋開発資材×15',roles:['対潜','司令部','対地','高火力'],note:'対潜83を持つ高対潜駆逐。司令部・内火艇運用にも対応しやすい。'},
 {base:'村雨',final:'村雨改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'村雨 → 村雨改(Lv20) → 村雨改二(Lv70)',requirements:'Lv70＋戦闘詳報',roles:['輸送','大発','対潜','司令部'],note:'大発と司令部を扱える汎用駆逐。対潜77で潜水対策にも使いやすい。'},
 {base:'江風',final:'江風改二',type:'駆逐艦',speed:'高速',targetLv:75,path:'江風 → 江風改(Lv30) → 江風改二(Lv75)',requirements:'Lv75',roles:['高雷装','輸送','大発','夜戦'],note:'雷装96の高雷装駆逐。輸送と夜戦火力を両立しやすい。'},
 {base:'陽炎',final:'陽炎改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'陽炎 → 陽炎改(Lv20) → 陽炎改二(Lv70)',requirements:'Lv70＋改装設計図＋開発資材×20',roles:['夜戦','駆逐主力','高雷装'],note:'雷装90のバランス型改二。通常連撃・魚雷CIどちらにも寄せやすい。'},
 {base:'不知火',final:'不知火改二',type:'駆逐艦',speed:'高速',targetLv:72,path:'不知火 → 不知火改(Lv20) → 不知火改二(Lv72)',requirements:'Lv72＋改装設計図＋開発資材×20',roles:['夜戦','駆逐主力','高雷装'],note:'雷装91・運24の陽炎型改二。夜戦火力と汎用性を両立。'},
 {base:'黒潮',final:'黒潮改二',type:'駆逐艦',speed:'高速',targetLv:73,path:'黒潮 → 黒潮改(Lv20) → 黒潮改二(Lv73)',requirements:'Lv73＋改装設計図＋開発資材×20',roles:['高火力','夜戦','対潜','駆逐主力'],note:'火力69・対潜70の攻撃寄り陽炎型改二。通常攻略で扱いやすい。'},
 {base:'浦風',final:'浦風丁改',type:'駆逐艦',speed:'高速',targetLv:69,path:'浦風 → 浦風改(Lv35) → 浦風丁改(Lv69)',requirements:'Lv69＋高速建造材×10＋開発資材×40',roles:['対潜','対空','内火艇','護衛'],note:'対潜88の丁改駆逐。対潜先制ラインを満たしやすく、内火艇も扱える。'},
 {base:'谷風',final:'谷風丁改',type:'駆逐艦',speed:'高速',targetLv:70,path:'谷風 → 谷風改(Lv30) → 谷風丁改(Lv70)',requirements:'Lv70＋高速建造材×20＋開発資材×50',roles:['対潜','高回避','対空','護衛'],note:'回避94・対潜86の護衛向け駆逐。潜水マスの安定化に使いやすい。'},
 {base:'浜風',final:'浜風乙改',type:'駆逐艦',speed:'高速',targetLv:67,path:'浜風 → 浜風改(Lv30) → 浜風乙改(Lv67)',requirements:'Lv67＋高速建造材×10＋開発資材×40',roles:['防空','対空CI','対潜','護衛'],note:'対空93の乙改駆逐。防空寄りの通常攻略と対潜補助に向く。'},
 {base:'五十鈴',final:'五十鈴改二',type:'軽巡洋艦',speed:'高速',targetLv:50,path:'五十鈴 → 五十鈴改(Lv12) → 五十鈴改二(Lv50)',requirements:'Lv50',roles:['対潜','防空','対空CI','軽巡'],note:'対潜94・対空85の対潜防空軽巡。低い改装Lvで専門役を持てる。'},
 {base:'川内',final:'川内改二',type:'軽巡洋艦',speed:'高速',targetLv:60,path:'川内 → 川内改(Lv20) → 川内改二(Lv60)',requirements:'Lv60',roles:['夜戦','夜戦装備','軽巡','水偵'],note:'夜戦装備を持参し、雷装89・回避84で夜戦中心の通常攻略に使いやすい。'},
 {base:'那珂',final:'那珂改二',type:'軽巡洋艦',speed:'高速',targetLv:48,path:'那珂 → 那珂改(Lv20) → 那珂改二(Lv48)',requirements:'Lv48',roles:['対潜','軽巡','夜戦','低改装Lv'],note:'Lv48で改二になり、対潜86を持つ扱いやすい汎用軽巡。'},
 {base:'多摩',final:'多摩改二',type:'軽巡洋艦',speed:'高速',targetLv:70,path:'多摩 → 多摩改(Lv20) → 多摩改二(Lv70)',requirements:'Lv70＋改装設計図',roles:['水戦','制空補助','輸送','対潜'],note:'水戦や大発系を扱える多用途軽巡。制空補助・輸送・対潜を切り替えやすい。'},
 {base:'龍田',final:'龍田改二',type:'軽巡洋艦',speed:'高速',targetLv:80,path:'龍田 → 龍田改(Lv20) → 龍田改二(Lv80)',requirements:'Lv80＋高速建造材×5＋開発資材×15',roles:['対潜','輸送','大発','軽巡'],note:'対潜82を持ち、大発系を扱える輸送・対潜向け軽巡。'},
 {base:'古鷹',final:'古鷹改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'古鷹 → 古鷹改(Lv25) → 古鷹改二(Lv65)',requirements:'Lv65',roles:['重巡','夜戦','低燃費','対艦'],note:'燃料35・弾薬65の比較的軽い重巡。通常連撃や夜戦で使いやすい。'},
 {base:'加古',final:'加古改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'加古 → 加古改(Lv25) → 加古改二(Lv65)',requirements:'Lv65',roles:['重巡','夜戦','低燃費','対艦'],note:'火力78・雷装77の低燃費寄り重巡。通常海域の連撃要員に向く。'},
 {base:'衣笠',final:'衣笠改二',type:'重巡洋艦',speed:'高速',targetLv:55,path:'衣笠 → 衣笠改(Lv25) → 衣笠改二(Lv55)',requirements:'Lv55',roles:['重巡','夜戦','低改装Lv','対艦'],note:'Lv55で改二になり、燃費も比較的軽い重巡。育成しやすい。'},
 {base:'那智',final:'那智改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'那智 → 那智改(Lv25) → 那智改二(Lv65)',requirements:'Lv65',roles:['重巡','対空','夜戦','対艦'],note:'対空83・索敵63を持つ妙高型改二。通常連撃から夜戦まで安定。'},
 {base:'皐月',final:'皐月改二',type:'駆逐艦',speed:'高速',targetLv:75,path:'皐月 → 皐月改(Lv20) → 皐月改二(Lv75)',requirements:'Lv75',roles:['対潜','防空','輸送','大発'],note:'低燃費で対潜81・対空82。大発運用もでき、遠征・輸送・対潜で便利。'},
 {base:'足柄',final:'足柄改二',type:'重巡洋艦',speed:'高速',targetLv:65,path:'足柄 → 足柄改(Lv25) → 足柄改二(Lv65)',requirements:'Lv65',roles:['高火力','夜戦','重巡','対艦'],note:'火力84・雷装84の攻撃寄り重巡。昼連撃と夜戦の両方で扱いやすい。'},
 {base:'睦月',final:'睦月改二',type:'駆逐艦',speed:'高速',targetLv:65,path:'睦月 → 睦月改(Lv20) → 睦月改二(Lv65)',requirements:'Lv65',roles:['輸送','大発','遠征','低燃費'],note:'燃料15・弾薬15の低燃費駆逐。大発運用と遠征・輸送で使いやすい。'},
 {base:'如月',final:'如月改二',type:'駆逐艦',speed:'高速',targetLv:65,path:'如月 → 如月改(Lv20) → 如月改二(Lv65)',requirements:'Lv65',roles:['輸送','大発','遠征','低燃費'],note:'睦月改二と同系統の低燃費駆逐。輸送や遠征で運用しやすい。'},
 {base:'球磨',final:'球磨改二',type:'軽巡洋艦',speed:'高速',targetLv:88,path:'球磨 → 球磨改(Lv20) → 球磨改二(Lv88) ⇔ 球磨改二丁(Lv88)',requirements:'Lv88＋改装設計図＋高速建造材×55＋開発資材×55',roles:['高火力','高雷装','対潜','制空補助'],note:'火力70・雷装92・対潜80の高バランス軽巡。水上機運用による補助も可能。'},
 {base:'天龍',final:'天龍改二',type:'軽巡洋艦',speed:'高速',targetLv:84,path:'天龍 → 天龍改(Lv20) → 天龍改二(Lv84)',requirements:'Lv84＋高速建造材×8＋開発資材×24',roles:['防空','対空','夜戦','低燃費'],note:'対空89を持つ軽巡。弾薬25で比較的軽く、防空寄りの水雷編成に使いやすい。'},
 {base:'叢雲',final:'叢雲改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'叢雲 → 叢雲改(Lv20) → 叢雲改二(Lv70)',requirements:'Lv70',roles:['夜戦','高雷装','駆逐主力'],note:'雷装89のバランス型改二。設計図不要で通常攻略に投入しやすい。'},
 {base:'暁',final:'暁改二',type:'駆逐艦',speed:'高速',targetLv:70,path:'暁 → 暁改(Lv20) → 暁改二(Lv70)',requirements:'Lv70',roles:['高雷装','索敵','夜戦','駆逐主力'],note:'雷装90・索敵60が特徴。通常連撃と索敵補助を両立しやすい。'},
 {base:'潮',final:'潮改二',type:'駆逐艦',speed:'高速',targetLv:60,path:'潮 → 潮改(Lv20) → 潮改二(Lv60)',requirements:'Lv60',roles:['高運','夜戦CI','対潜','防空'],note:'運32・回避95・対潜75を持つ生存力の高い駆逐。魚雷CIや対潜向け。'},
 {base:'初春',final:'初春改二',type:'駆逐艦',speed:'高速',targetLv:65,path:'初春 → 初春改(Lv20) → 初春改二(Lv65)',requirements:'Lv65',roles:['高雷装','夜戦','防空','駆逐主力'],note:'雷装90を持つ設計図不要改二。夜戦と通常攻略で使いやすい。'},
 {base:'文月',final:'文月改二',type:'駆逐艦',speed:'高速',targetLv:77,path:'文月 → 文月改(Lv20) → 文月改二(Lv77)',requirements:'Lv77',roles:['対潜','輸送','大発','防空'],note:'対潜81・対空82の護衛寄り睦月型改二。輸送と潜水対策を兼ねやすい。'}
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
 '大淀改':{hp:47,armor:69,evasion:78,fire:71,torp:49,aa:77,asw:39,los:84,luck:30,air:12,fuel:35,ammo:35,range:'中'},
 '榛名改二乙':{hp:85,armor:93,evasion:75,fire:94,torp:40,aa:94,asw:0,los:53,luck:48,air:12,fuel:100,ammo:160,range:'長'},
 '霧島改二丙':{hp:85,armor:92,evasion:74,fire:106,torp:40,aa:82,asw:0,los:52,luck:16,air:11,fuel:100,ammo:160,range:'長'},
 '木曾改二':{hp:44,armor:65,evasion:85,fire:65,torp:111,aa:72,asw:82,los:49,luck:13,air:0,fuel:25,ammo:50,range:'中'},
 '神通改二':{hp:51,armor:69,evasion:80,fire:74,torp:99,aa:68,asw:80,los:54,luck:13,air:3,fuel:25,ammo:35,range:'中'},
 '鳥海改二':{hp:57,armor:78,evasion:80,fire:86,torp:87,aa:70,asw:0,los:62,luck:20,air:12,fuel:45,ammo:80,range:'中'},
 '夕雲改二':{hp:33,armor:54,evasion:93,fire:67,torp:87,aa:68,asw:77,los:46,luck:18,air:0,fuel:15,ammo:20,range:'短'},
 '満潮改二':{hp:31,armor:54,evasion:90,fire:69,torp:89,aa:65,asw:60,los:55,luck:18,air:0,fuel:15,ammo:20,range:'短'},
 '朝霜改二':{hp:33,armor:55,evasion:94,fire:69,torp:88,aa:76,asw:76,los:46,luck:28,air:0,fuel:15,ammo:20,range:'短'},
 '初霜改二':{hp:32,armor:55,evasion:95,fire:63,torp:85,aa:81,asw:72,los:49,luck:53,air:0,fuel:15,ammo:20,range:'短'},
 '磯風乙改':{hp:34,armor:53,evasion:91,fire:66,torp:84,aa:91,asw:72,los:52,luck:24,air:0,fuel:15,ammo:25,range:'短'},
 '荒潮改二':{hp:31,armor:52,evasion:90,fire:69,torp:88,aa:70,asw:59,los:52,luck:17,air:0,fuel:15,ammo:20,range:'短'},
 '白露改二':{hp:31,armor:50,evasion:91,fire:69,torp:87,aa:71,asw:83,los:50,luck:16,air:0,fuel:15,ammo:20,range:'短'},
 '村雨改二':{hp:31,armor:51,evasion:90,fire:68,torp:88,aa:70,asw:77,los:47,luck:17,air:0,fuel:15,ammo:20,range:'短'},
 '江風改二':{hp:31,armor:51,evasion:89,fire:62,torp:96,aa:64,asw:63,los:53,luck:19,air:0,fuel:15,ammo:20,range:'短'},
 '陽炎改二':{hp:33,armor:53,evasion:90,fire:68,torp:90,aa:62,asw:67,los:42,luck:20,air:0,fuel:15,ammo:20,range:'短'},
 '不知火改二':{hp:33,armor:54,evasion:90,fire:67,torp:91,aa:64,asw:68,los:43,luck:24,air:0,fuel:15,ammo:20,range:'短'},
 '黒潮改二':{hp:33,armor:53,evasion:90,fire:69,torp:88,aa:65,asw:70,los:41,luck:22,air:0,fuel:15,ammo:20,range:'短'},
 '浦風丁改':{hp:33,armor:53,evasion:88,fire:62,torp:80,aa:76,asw:88,los:48,luck:18,air:0,fuel:15,ammo:25,range:'短'},
 '谷風丁改':{hp:33,armor:51,evasion:94,fire:59,torp:84,aa:80,asw:86,los:42,luck:17,air:0,fuel:15,ammo:25,range:'短'},
 '浜風乙改':{hp:33,armor:54,evasion:89,fire:64,torp:83,aa:93,asw:74,los:47,luck:20,air:0,fuel:15,ammo:25,range:'短'},
 '五十鈴改二':{hp:44,armor:69,evasion:80,fire:62,torp:79,aa:85,asw:94,los:59,luck:13,air:0,fuel:25,ammo:30,range:'短'},
 '川内改二':{hp:49,armor:69,evasion:84,fire:69,torp:89,aa:71,asw:74,los:55,luck:14,air:3,fuel:25,ammo:35,range:'中'},
 '那珂改二':{hp:48,armor:68,evasion:82,fire:69,torp:84,aa:76,asw:86,los:54,luck:13,air:3,fuel:25,ammo:35,range:'中'},
 '多摩改二':{hp:46,armor:69,evasion:82,fire:61,torp:91,aa:83,asw:85,los:61,luck:13,air:3,fuel:25,ammo:30,range:'短'},
 '龍田改二':{hp:42,armor:63,evasion:84,fire:50,torp:80,aa:80,asw:82,los:52,luck:18,air:3,fuel:25,ammo:25,range:'短'},
 '古鷹改二':{hp:53,armor:72,evasion:77,fire:77,torp:75,aa:64,asw:0,los:54,luck:14,air:8,fuel:35,ammo:65,range:'中'},
 '加古改二':{hp:52,armor:72,evasion:76,fire:78,torp:77,aa:65,asw:0,los:55,luck:12,air:8,fuel:35,ammo:65,range:'中'},
 '衣笠改二':{hp:53,armor:73,evasion:79,fire:78,torp:78,aa:66,asw:0,los:58,luck:13,air:8,fuel:35,ammo:65,range:'中'},
 '那智改二':{hp:56,armor:78,evasion:83,fire:81,torp:85,aa:83,asw:0,los:63,luck:18,air:12,fuel:45,ammo:75,range:'中'},
 '皐月改二':{hp:28,armor:45,evasion:96,fire:42,torp:78,aa:82,asw:81,los:45,luck:20,air:0,fuel:15,ammo:15,range:'短'},
 '足柄改二':{hp:56,armor:79,evasion:85,fire:84,torp:84,aa:77,asw:0,los:57,luck:20,air:12,fuel:45,ammo:75,range:'中'},
 '睦月改二':{hp:27,armor:43,evasion:90,fire:45,torp:79,aa:56,asw:69,los:43,luck:14,air:0,fuel:15,ammo:15,range:'短'},
 '如月改二':{hp:27,armor:43,evasion:91,fire:46,torp:80,aa:57,asw:69,los:44,luck:13,air:0,fuel:15,ammo:15,range:'短'},
 '球磨改二':{hp:46,armor:70,evasion:82,fire:70,torp:92,aa:80,asw:80,los:58,luck:16,air:3,fuel:25,ammo:35,range:'短'},
 '天龍改二':{hp:42,armor:63,evasion:82,fire:64,torp:78,aa:89,asw:70,los:53,luck:17,air:3,fuel:25,ammo:25,range:'短'},
 '叢雲改二':{hp:31,armor:51,evasion:90,fire:57,torp:89,aa:74,asw:69,los:42,luck:16,air:0,fuel:15,ammo:20,range:'短'},
 '暁改二':{hp:31,armor:50,evasion:89,fire:62,torp:90,aa:59,asw:66,los:60,luck:15,air:0,fuel:15,ammo:20,range:'短'},
 '潮改二':{hp:33,armor:59,evasion:95,fire:59,torp:84,aa:81,asw:75,los:48,luck:32,air:0,fuel:15,ammo:20,range:'短'},
 '初春改二':{hp:31,armor:51,evasion:90,fire:55,torp:90,aa:73,asw:69,los:45,luck:16,air:0,fuel:15,ammo:20,range:'短'},
 '文月改二':{hp:27,armor:46,evasion:93,fire:45,torp:77,aa:82,asw:81,los:47,luck:17,air:0,fuel:15,ammo:15,range:'短'}
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
 ],
 '榛名改二乙':[
  {name:'高速戦艦・弾着',gear:['35.6cm連装砲改','35.6cm連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'高運・高対空を活かしつつ主砲2＋水偵＋徹甲弾で安定運用。'},
  {name:'夜戦・命中寄り',gear:['35.6cm連装砲改','35.6cm連装砲改','高性能電探','高性能水偵'],memo:'夜戦や命中重視の海域で使いやすい。'}
 ],
 '霧島改二丙':[
  {name:'高火力・弾着',gear:['35.6cm連装砲改','35.6cm連装砲改','零式水上偵察機11型乙(熟練)','一式徹甲弾改'],memo:'火力106を活かす標準弾着構成。'},
  {name:'夜戦寄り',gear:['35.6cm連装砲改','35.6cm連装砲改','魚雷/夜戦補助','高性能水偵'],memo:'雷装40を持つ特徴を夜戦で活かす。'}
 ],
 '木曾改二':[
  {name:'先制雷撃＋連撃',gear:['甲標的 丁型改','主砲','主砲'],memo:'先制雷撃を維持しながら夜戦連撃を狙う安定型。'},
  {name:'魚雷CI',gear:['甲標的 丁型改','61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷'],memo:'運改修済みなら夜戦CIで火力を伸ばす。'}
 ],
 '神通改二':[
  {name:'夜戦連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','夜戦補助/電探'],memo:'高い火力・雷装を安定して活かす夜戦連撃型。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運改修後の高難度ボス向け。'}
 ],
 '鳥海改二':[
  {name:'高火力連撃',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'火力86・雷装87を活かした昼夜連撃。'},
  {name:'夜戦寄り',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','夜戦補助','高性能水偵'],memo:'重巡トップクラスの夜戦火力を活かす。'}
 ],
 '夕雲改二':[
  {name:'D型砲連撃',gear:['12.7cm連装砲D型改二','12.7cm連装砲D型改二','水上電探'],memo:'D型砲系との相性を活かした標準型。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜77を活かす潜水マス向け。'}
 ],
 '満潮改二':[
  {name:'対地',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','主砲/対地補助'],memo:'大発・内火艇で陸上型を攻撃。'},
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'設計図不要の輸送要員として使いやすい。'}
 ],
 '朝霜改二':[
  {name:'D型砲連撃',gear:['12.7cm連装砲D型改二','12.7cm連装砲D型改二','水上電探'],memo:'高回避を活かしつつ夜戦連撃。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜76を活かす標準対潜型。'}
 ],
 '初霜改二':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運53を活かした夜戦フィニッシャー。'},
  {name:'防空・汎用',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空81を活かしつつ通常連撃も可能。'}
 ],
 '磯風乙改':[
  {name:'防空連撃',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空91を活かした防空寄り連撃。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜72を活かす潜水対策。'}
 ],
 '荒潮改二':[
  {name:'対地',gear:['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','主砲/対地補助'],memo:'大発系と内火艇を使って陸上型を担当。'},
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'TP輸送量を優先する構成。'}
 ],
 '白露改二':[
  {name:'先制対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜83を活かす標準対潜構成。'},
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'火力69・雷装87を安定して活かす。'}
 ],
 '村雨改二':[
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'輸送海域で大発運用。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜77を活かして潜水マスを対処。'}
 ],
 '江風改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'雷装96を連撃で安定して活かす。'},
  {name:'輸送',gear:['大発動艇','大発動艇','主砲/電探'],memo:'輸送量を稼ぎつつ1枠を戦闘補助へ。'}
 ],
 '陽炎改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'汎用性の高い昼夜連撃型。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運改修や夜戦補助込みで高打点を狙う。'}
 ],
 '不知火改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'雷装91を活かす安定型。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運24を活かし、補助込みでCIを狙う。'}
 ],
 '黒潮改二':[
  {name:'高火力連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'火力69を活かした通常攻略向け。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜70を活かす潜水対策。'}
 ],
 '浦風丁改':[
  {name:'先制対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜88を活かした対潜特化。'},
  {name:'対地補助',gear:['特二式内火艇','高性能駆逐主砲','高性能駆逐主砲'],memo:'内火艇搭載可を活かして陸上型へ追加打点。'}
 ],
 '谷風丁改':[
  {name:'先制対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜86・回避94を活かす護衛型。'},
  {name:'防空補助',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空80を活かして航空戦対策を補助。'}
 ],
 '浜風乙改':[
  {name:'防空CI',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空93を活かした防空寄り構成。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜74を活かして潜水艦を処理。'}
 ],
 '五十鈴改二':[
  {name:'対潜特化',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜94を活かした潜水艦対策。'},
  {name:'防空＋対潜',gear:['高角砲＋高射装置','高性能対空電探','四式水中聴音機'],memo:'航空戦対策と対潜を同時に担当。'}
 ],
 '川内改二':[
  {name:'夜戦連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','九八式水上偵察機(夜偵)'],memo:'夜偵を載せて昼夜連撃を両立。'},
  {name:'夜戦補助',gear:['主砲','主砲','照明弾/探照灯'],memo:'夜戦装備を持たせて艦隊全体を支援。'}
 ],
 '那珂改二':[
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜86を活かす潜水マス向け。'},
  {name:'汎用連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','高性能水偵'],memo:'通常海域で昼夜連撃を狙う。'}
 ],
 '多摩改二':[
  {name:'制空補助',gear:['主砲','二式水戦改(熟練)','高性能水偵/補助装備'],memo:'水戦運用で制空を補助。'},
  {name:'輸送・対地',gear:['大発動艇','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇'],memo:'輸送または陸上型対策に寄せる。'}
 ],
 '龍田改二':[
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜82を活かす対潜専門型。'},
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'低燃費でTP輸送を担当。'}
 ],
 '古鷹改二':[
  {name:'重巡連撃',gear:['20.3cm(2号)連装砲','20.3cm(2号)連装砲','高性能水偵','高性能電探'],memo:'昼夜連撃と索敵をまとめる標準型。'},
  {name:'夜戦補助',gear:['20.3cm(2号)連装砲','20.3cm(2号)連装砲','高性能水偵','探照灯/照明弾'],memo:'通常海域の夜戦支援も兼ねる。'}
 ],
 '加古改二':[
  {name:'重巡連撃',gear:['20.3cm(2号)連装砲','20.3cm(2号)連装砲','高性能水偵','高性能電探'],memo:'低燃費寄りの通常連撃構成。'},
  {name:'夜戦',gear:['20.3cm(2号)連装砲','20.3cm(2号)連装砲','高性能水偵','探照灯'],memo:'持参装備も活かし夜戦補助。'}
 ],
 '衣笠改二':[
  {name:'重巡連撃',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','高性能水偵','高性能電探'],memo:'3号砲系で火力と昼夜連撃を両立。'},
  {name:'夜戦寄り',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','61cm五連装(酸素)魚雷','高性能水偵'],memo:'夜戦火力を少し伸ばした構成例。'}
 ],
 '那智改二':[
  {name:'重巡連撃',gear:['20.3cm(2号)連装砲','20.3cm(2号)連装砲','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'索敵63と火力81を活かす標準構成。'},
  {name:'防空寄り',gear:['主砲','主砲','高性能水偵','高性能対空電探'],memo:'対空83を活かして航空戦対策を補助。'}
 ],
 '皐月改二':[
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'低コストで対潜81を活かす。'},
  {name:'輸送・防空',gear:['大発動艇','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'輸送をしつつ航空戦対策も補助。'}
 ],
 '足柄改二':[
  {name:'高火力連撃',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','零式水上偵察機11型乙(熟練)','高性能電探'],memo:'火力84・雷装84を昼夜連撃で安定して活かす。'},
  {name:'夜戦寄り',gear:['20.3cm(3号)連装砲','20.3cm(3号)連装砲','夜戦補助','高性能水偵'],memo:'夜戦火力を重視するボス戦向け。'}
 ],
 '睦月改二':[
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'低燃費を活かしたTP輸送・遠征向け。'},
  {name:'汎用連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'通常海域で最低限の戦闘力を確保。'}
 ],
 '如月改二':[
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'低燃費の輸送要員として運用。'},
  {name:'汎用連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'戦闘が必要な遠征・通常海域向け。'}
 ],
 '球磨改二':[
  {name:'軽巡連撃',gear:['15.2cm連装砲改二','15.2cm連装砲改二','零式水上偵察機11型乙(熟練)'],memo:'火力70・雷装92を昼夜連撃で活かす。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜80を活かした潜水艦対策。'}
 ],
 '天龍改二':[
  {name:'防空連撃',gear:['高角砲＋高射装置','高角砲＋高射装置','高性能対空電探'],memo:'対空89を活かす防空寄り構成。'},
  {name:'夜戦連撃',gear:['主砲','主砲','夜戦補助/電探'],memo:'軽巡としての夜戦連撃を維持。'}
 ],
 '叢雲改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'雷装89を安定して活かす。'},
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運改修後や夜戦補助込みで採用。'}
 ],
 '暁改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'雷装90と索敵60を活かす汎用型。'},
  {name:'索敵補助',gear:['高性能駆逐主砲','高性能駆逐主砲','33号水上電探'],memo:'索敵分岐が厳しい海域で使いやすい。'}
 ],
 '潮改二':[
  {name:'魚雷CI',gear:['61cm五連装(酸素)魚雷','61cm五連装(酸素)魚雷','水雷戦隊 熟練見張員'],memo:'運32を活かして夜戦CIを狙う。'},
  {name:'対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜75を活かす潜水艦対策。'}
 ],
 '初春改二':[
  {name:'夜戦連撃',gear:['高性能駆逐主砲','高性能駆逐主砲','水上電探'],memo:'雷装90を活かした安定型。'},
  {name:'防空補助',gear:['10cm連装高角砲＋高射装置','10cm連装高角砲＋高射装置','高性能対空電探'],memo:'対空73を活かして航空戦を補助。'}
 ],
 '文月改二':[
  {name:'先制対潜',gear:['四式水中聴音機','対潜爆雷投射機','爆雷'],memo:'対潜81を活かした護衛・潜水対策。'},
  {name:'輸送',gear:['大発動艇','大発動艇','大発動艇'],memo:'低燃費と輸送適性を活かすTP海域向け。'}
 ]
};


const HD_SHIP_MASTER_SOURCE={"repo":"Tibowl/api_start2","commit":"f45f36fdc8caddf8f78c287e599dcab0cb5d5c68","updated":"2026-09-16","basis":"api_start2 normal/exslot masters"};
const HD_SHIP_SLOT_PROFILES={
 "長門改二": {
  "id": 541,
  "ctype": 19,
  "stype": 9,
  "slots": [
   3,
   3,
   6,
   3
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "3": null,
   "4": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "38": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "46": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "大口径主砲（II）",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "大発",
   "内火艇",
   "大型ソナー"
  ]
 },
 "陸奥改二": {
  "id": 573,
  "ctype": 19,
  "stype": 9,
  "slots": [
   2,
   3,
   5,
   7
  ],
  "equipRules": {
   "2": null,
   "3": null,
   "4": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "38": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "46": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "大口径主砲（II）",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "内火艇",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "大和改二": {
  "id": 911,
  "ctype": 37,
  "stype": 8,
  "slots": [
   4,
   4,
   4,
   8,
   2
  ],
  "equipRules": {
   "2": null,
   "3": null,
   "4": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "38": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "大口径主砲（II）",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "武蔵改二": {
  "id": 546,
  "ctype": 37,
  "stype": 9,
  "slots": [
   5,
   5,
   5,
   8,
   5
  ],
  "equipRules": {
   "2": null,
   "3": null,
   "4": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "38": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "大口径主砲（II）",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "伊勢改二": {
  "id": 553,
  "ctype": 2,
  "stype": 10,
  "slots": [
   2,
   2,
   22,
   22,
   9
  ],
  "equipRules": {
   "2": null,
   "3": null,
   "4": null,
   "6": null,
   "7": null,
   "9": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "50": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上偵察機",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦爆",
   "艦偵",
   "水戦",
   "水爆",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "日向改二": {
  "id": 554,
  "ctype": 2,
  "stype": 10,
  "slots": [
   2,
   8,
   24,
   12,
   11
  ],
  "equipRules": {
   "2": null,
   "3": null,
   "4": null,
   "6": null,
   "7": null,
   "9": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "50": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "大口径主砲",
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上偵察機",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦爆",
   "艦偵",
   "水戦",
   "水爆",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "赤城改二": {
  "id": 594,
  "ctype": 14,
  "stype": 11,
  "slots": [
   21,
   21,
   32,
   12,
   4
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー"
  ]
 },
 "加賀改二": {
  "id": 698,
  "ctype": 3,
  "stype": 11,
  "slots": [
   20,
   20,
   44,
   12,
   3
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー"
  ]
 },
 "翔鶴改二甲": {
  "id": 466,
  "ctype": 33,
  "stype": 18,
  "slots": [
   34,
   21,
   12,
   9
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "56": null,
   "57": null,
   "58": null,
   "59": null,
   "94": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "噴式戦闘機",
   "噴式戦闘爆撃機",
   "噴式攻撃機",
   "噴式偵察機",
   "艦上偵察機（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー",
   "噴式"
  ]
 },
 "瑞鶴改二甲": {
  "id": 467,
  "ctype": 33,
  "stype": 18,
  "slots": [
   34,
   24,
   12,
   6
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "56": null,
   "57": null,
   "58": null,
   "59": null,
   "94": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "噴式戦闘機",
   "噴式戦闘爆撃機",
   "噴式攻撃機",
   "噴式偵察機",
   "艦上偵察機（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー",
   "噴式"
  ]
 },
 "最上改二特": {
  "id": 506,
  "ctype": 9,
  "stype": 6,
  "slots": [
   2,
   2,
   7,
   3
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "24": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "46": null,
   "50": null,
   "54": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "上陸用舟艇",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "輸送機材",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "甲標的",
   "大発",
   "内火艇",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "矢矧改二乙": {
  "id": 668,
  "ctype": 41,
  "stype": 3,
  "slots": [
   1,
   1,
   2,
   2
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "45": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "甲標的",
   "内火艇",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "夕張改二特": {
  "id": 623,
  "ctype": 34,
  "stype": 3,
  "slots": [
   0,
   0,
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "24": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "甲標的",
   "大発",
   "内火艇"
  ]
 },
 "阿武隈改二": {
  "id": 200,
  "ctype": 20,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "24": null,
   "27": [
    268
   ],
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "甲標的",
   "大発",
   "内火艇"
  ]
 },
 "北上改二": {
  "id": 119,
  "ctype": 4,
  "stype": 4,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "甲標的"
  ]
 },
 "大井改二": {
  "id": 118,
  "ctype": 4,
  "stype": 4,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "甲標的"
  ]
 },
 "雪風改二": {
  "id": 656,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "時雨改三": {
  "id": 961,
  "ctype": 23,
  "stype": 2,
  "slots": [
   0,
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "霞改二乙": {
  "id": 470,
  "ctype": 18,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "秋月改二": {
  "id": 963,
  "ctype": 54,
  "stype": 2,
  "slots": [
   0,
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "初月改二": {
  "id": 968,
  "ctype": 54,
  "stype": 2,
  "slots": [
   0,
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "Fletcher Mk.II": {
  "id": 629,
  "ctype": 91,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "金剛改二丙": {
  "id": 591,
  "ctype": 6,
  "stype": 8,
  "slots": [
   2,
   2,
   3,
   6
  ],
  "equipRules": {
   "3": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "大口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水爆",
   "大型ソナー"
  ]
 },
 "比叡改二丙": {
  "id": 592,
  "ctype": 6,
  "stype": 8,
  "slots": [
   2,
   2,
   2,
   2
  ],
  "equipRules": {
   "3": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "大口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "大型ソナー"
  ]
 },
 "摩耶改二": {
  "id": 428,
  "ctype": 8,
  "stype": 5,
  "slots": [
   3,
   3,
   3,
   3
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "鈴谷改二": {
  "id": 503,
  "ctype": 9,
  "stype": 6,
  "slots": [
   3,
   3,
   7,
   11
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "45": null,
   "50": null,
   "54": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "熊野改二": {
  "id": 504,
  "ctype": 9,
  "stype": 6,
  "slots": [
   3,
   3,
   7,
   11
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "45": null,
   "50": null,
   "54": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "能代改二": {
  "id": 662,
  "ctype": 41,
  "stype": 3,
  "slots": [
   1,
   1,
   4,
   2
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "水爆",
   "内火艇",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "夕立改二": {
  "id": 144,
  "ctype": 23,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "長波改二": {
  "id": 543,
  "ctype": 38,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "瑞鳳改二乙": {
  "id": 560,
  "ctype": 11,
  "stype": 7,
  "slots": [
   18,
   15,
   15,
   2
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "Saratoga Mk.II Mod.2": {
  "id": 550,
  "ctype": 69,
  "stype": 18,
  "slots": [
   37,
   24,
   19,
   13
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "94": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "艦上偵察機（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー"
  ]
 },
 "Iowa改": {
  "id": 360,
  "ctype": 65,
  "stype": 8,
  "slots": [
   4,
   4,
   4,
   4
  ],
  "equipRules": {
   "3": null,
   "4": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "大口径主砲",
   "副砲",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "Atlanta改": {
  "id": 696,
  "ctype": 99,
  "stype": 3,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "由良改二": {
  "id": 488,
  "ctype": 20,
  "stype": 3,
  "slots": [
   1,
   2,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "45": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "甲標的",
   "大発",
   "内火艇"
  ]
 },
 "朝潮改二丁": {
  "id": 468,
  "ctype": 18,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "Jervis改": {
  "id": 394,
  "ctype": 82,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "Samuel B.Roberts Mk.II": {
  "id": 920,
  "ctype": 87,
  "stype": 2,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "回転翼機"
  ]
 },
 "大鳳改": {
  "id": 156,
  "ctype": 43,
  "stype": 18,
  "slots": [
   30,
   24,
   24,
   8
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null,
   "94": null,
   "95": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材",
   "艦上偵察機（II）",
   "副砲（II）"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "大型ソナー"
  ]
 },
 "利根改二": {
  "id": 188,
  "ctype": 31,
  "stype": 6,
  "slots": [
   2,
   2,
   9,
   6
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "45": null,
   "50": null,
   "54": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "筑摩改二": {
  "id": 189,
  "ctype": 31,
  "stype": 6,
  "slots": [
   2,
   2,
   9,
   6
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "45": null,
   "50": null,
   "54": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上戦闘機",
   "輸送機材",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機",
   "大型ソナー"
  ]
 },
 "Ташкент改": {
  "id": 395,
  "ctype": 81,
  "stype": 2,
  "slots": [
   0,
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": [
    268
   ],
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "天津風改二": {
  "id": 951,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "涼月改": {
  "id": 537,
  "ctype": 54,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "千歳航改二": {
  "id": 296,
  "ctype": 15,
  "stype": 7,
  "slots": [
   24,
   16,
   11,
   8
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "千代田航改二": {
  "id": 297,
  "ctype": 15,
  "stype": 7,
  "slots": [
   24,
   16,
   11,
   8
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "龍驤改二": {
  "id": 157,
  "ctype": 32,
  "stype": 7,
  "slots": [
   18,
   28,
   6,
   3
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "隼鷹改二": {
  "id": 408,
  "ctype": 24,
  "stype": 7,
  "slots": [
   24,
   18,
   20,
   4
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "神鷹改二": {
  "id": 536,
  "ctype": 76,
  "stype": 7,
  "slots": [
   9,
   18,
   18,
   6
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "大鷹改二": {
  "id": 529,
  "ctype": 76,
  "stype": 7,
  "slots": [
   14,
   14,
   8,
   3
  ],
  "equipRules": {
   "4": null,
   "6": null,
   "7": null,
   "8": null,
   "9": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "16": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "26": null,
   "27": null,
   "34": null,
   "35": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "50": null
  },
  "allowedTypes": [
   "副砲",
   "艦上戦闘機",
   "艦上爆撃機",
   "艦上攻撃機",
   "艦上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "追加装甲",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "対潜哨戒機",
   "追加装甲(中型)",
   "司令部施設",
   "航空要員",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "輸送機材"
  ],
  "flags": [
   "艦戦",
   "艦攻",
   "艦爆",
   "艦偵",
   "回転翼機",
   "対潜哨戒機",
   "大型ソナー"
  ]
 },
 "Zara due": {
  "id": 496,
  "ctype": 64,
  "stype": 5,
  "slots": [
   6,
   3,
   3,
   3
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "水爆",
   "大型ソナー"
  ]
 },
 "Gotland andra": {
  "id": 630,
  "ctype": 89,
  "stype": 3,
  "slots": [
   2,
   2,
   3,
   7
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "42": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型探照灯",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "水爆",
   "大発",
   "回転翼機"
  ]
 },
 "Johnston改": {
  "id": 689,
  "ctype": 91,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "Верный": {
  "id": 147,
  "ctype": 5,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "妙高改二": {
  "id": 319,
  "ctype": 29,
  "stype": 5,
  "slots": [
   2,
   2,
   4,
   4
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "羽黒改二": {
  "id": 194,
  "ctype": 29,
  "stype": 5,
  "slots": [
   2,
   2,
   4,
   4
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "鬼怒改二": {
  "id": 487,
  "ctype": 20,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "綾波改二": {
  "id": 195,
  "ctype": 1,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "大潮改二": {
  "id": 199,
  "ctype": 18,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "大淀改": {
  "id": 321,
  "ctype": 52,
  "stype": 3,
  "slots": [
   0,
   6,
   6,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "榛名改二乙": {
  "id": 593,
  "ctype": 6,
  "stype": 8,
  "slots": [
   1,
   2,
   5,
   4
  ],
  "equipRules": {
   "3": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "大口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "水爆",
   "大型ソナー"
  ]
 },
 "霧島改二丙": {
  "id": 694,
  "ctype": 6,
  "stype": 8,
  "slots": [
   2,
   2,
   4,
   3
  ],
  "equipRules": {
   "3": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "16": null,
   "17": null,
   "18": null,
   "19": null,
   "20": null,
   "21": null,
   "23": null,
   "28": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "40": null,
   "42": null,
   "43": null,
   "45": null,
   "46": null,
   "93": null,
   "95": null
  },
  "allowedTypes": [
   "大口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "対艦強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(大型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型ソナー",
   "大型探照灯",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "大型電探（II）",
   "副砲（II）"
  ],
  "flags": [
   "水戦",
   "内火艇",
   "大型ソナー"
  ]
 },
 "木曾改二": {
  "id": 146,
  "ctype": 4,
  "stype": 4,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "22": null,
   "23": null,
   "27": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "特殊潜航艇",
   "応急修理要員",
   "追加装甲(中型)",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "甲標的"
  ]
 },
 "神通改二": {
  "id": 159,
  "ctype": 16,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "鳥海改二": {
  "id": 427,
  "ctype": 8,
  "stype": 5,
  "slots": [
   3,
   3,
   3,
   3
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "夕雲改二": {
  "id": 542,
  "ctype": 38,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "満潮改二": {
  "id": 489,
  "ctype": 18,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "朝霜改二": {
  "id": 578,
  "ctype": 38,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "初霜改二": {
  "id": 419,
  "ctype": 10,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "磯風乙改": {
  "id": 557,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "荒潮改二": {
  "id": 490,
  "ctype": 18,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "白露改二": {
  "id": 497,
  "ctype": 23,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "村雨改二": {
  "id": 498,
  "ctype": 23,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "江風改二": {
  "id": 469,
  "ctype": 23,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "陽炎改二": {
  "id": 566,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "不知火改二": {
  "id": 567,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "黒潮改二": {
  "id": 568,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "浦風丁改": {
  "id": 556,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "内火艇"
  ]
 },
 "谷風丁改": {
  "id": 559,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "浜風乙改": {
  "id": 558,
  "ctype": 30,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "五十鈴改二": {
  "id": 141,
  "ctype": 20,
  "stype": 3,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "川内改二": {
  "id": 158,
  "ctype": 16,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "那珂改二": {
  "id": 160,
  "ctype": 16,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "多摩改二": {
  "id": 547,
  "ctype": 4,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "45": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上戦闘機",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "大発",
   "内火艇",
   "回転翼機"
  ]
 },
 "龍田改二": {
  "id": 478,
  "ctype": 21,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "25": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "オートジャイロ",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇",
   "回転翼機"
  ]
 },
 "古鷹改二": {
  "id": 416,
  "ctype": 7,
  "stype": 5,
  "slots": [
   2,
   2,
   2,
   2
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "加古改二": {
  "id": 417,
  "ctype": 7,
  "stype": 5,
  "slots": [
   2,
   2,
   2,
   2
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "衣笠改二": {
  "id": 142,
  "ctype": 13,
  "stype": 5,
  "slots": [
   2,
   2,
   2,
   2
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "那智改二": {
  "id": 192,
  "ctype": 29,
  "stype": 5,
  "slots": [
   2,
   2,
   4,
   4
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "皐月改二": {
  "id": 418,
  "ctype": 28,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 },
 "足柄改二": {
  "id": 193,
  "ctype": 29,
  "stype": 5,
  "slots": [
   2,
   2,
   4,
   4
  ],
  "equipRules": {
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "12": null,
   "13": null,
   "16": null,
   "17": null,
   "18": null,
   "20": null,
   "21": null,
   "23": null,
   "27": null,
   "29": null,
   "33": null,
   "34": null,
   "36": null,
   "39": null,
   "40": null,
   "43": null,
   "54": null,
   "95": null
  },
  "allowedTypes": [
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "小型電探",
   "大型電探",
   "追加装甲",
   "機関部強化",
   "対空強化弾",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "追加装甲(中型)",
   "探照灯",
   "照明弾",
   "司令部施設",
   "高射装置",
   "水上艦要員",
   "大型ソナー",
   "戦闘糧食",
   "水上艦装備",
   "副砲（II）"
  ],
  "flags": [
   "大型ソナー"
  ]
 },
 "睦月改二": {
  "id": 434,
  "ctype": 28,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "如月改二": {
  "id": 435,
  "ctype": 28,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "大発"
  ]
 },
 "球磨改二": {
  "id": 652,
  "ctype": 4,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "4": null,
   "5": null,
   "10": null,
   "11": null,
   "12": null,
   "13": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "27": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "35": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "45": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "副砲",
   "魚雷",
   "水上偵察機",
   "水上爆撃機",
   "小型電探",
   "大型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "追加装甲(中型)",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "航空要員",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上戦闘機",
   "水上艦装備"
  ],
  "flags": [
   "水戦",
   "水爆",
   "回転翼機"
  ]
 },
 "天龍改二": {
  "id": 477,
  "ctype": 21,
  "stype": 3,
  "slots": [
   1,
   1,
   1
  ],
  "equipRules": {
   "1": null,
   "2": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "25": null,
   "29": null,
   "30": null,
   "33": null,
   "34": null,
   "36": null,
   "37": null,
   "39": null,
   "42": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "中口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "オートジャイロ",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "司令部施設",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "大型探照灯",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": [
   "回転翼機"
  ]
 },
 "叢雲改二": {
  "id": 420,
  "ctype": 12,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "暁改二": {
  "id": 437,
  "ctype": 5,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "潮改二": {
  "id": 407,
  "ctype": 1,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "初春改二": {
  "id": 326,
  "ctype": 10,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "水上艦装備"
  ],
  "flags": []
 },
 "文月改二": {
  "id": 548,
  "ctype": 28,
  "stype": 2,
  "slots": [
   0,
   0,
   0
  ],
  "equipRules": {
   "1": null,
   "5": null,
   "12": null,
   "14": null,
   "15": null,
   "17": null,
   "20": null,
   "21": null,
   "23": null,
   "24": null,
   "29": null,
   "30": null,
   "33": null,
   "36": null,
   "37": null,
   "39": null,
   "43": null,
   "46": null,
   "54": null
  },
  "allowedTypes": [
   "小口径主砲",
   "魚雷",
   "小型電探",
   "ソナー",
   "爆雷",
   "機関部強化",
   "VT信管",
   "対空機銃",
   "応急修理要員",
   "上陸用舟艇",
   "探照灯",
   "簡易輸送部材",
   "照明弾",
   "高射装置",
   "対地装備",
   "水上艦要員",
   "戦闘糧食",
   "特型内火艇",
   "水上艦装備"
  ],
  "flags": [
   "大発",
   "内火艇"
  ]
 }
};
const HD_EQUIPMENT_MASTER_META_BY_NAME={
 "零式艦戦53型(岩本隊)": {
  "id": 157,
  "typeId": 6,
  "typeName": "艦上戦闘機"
 },
 "試製烈風 後期型": {
  "id": 22,
  "typeId": 6,
  "typeName": "艦上戦闘機"
 },
 "彩雲": {
  "id": 54,
  "typeId": 9,
  "typeName": "艦上偵察機"
 },
 "零式水上偵察機11型乙(熟練)": {
  "id": 239,
  "typeId": 10,
  "typeName": "水上偵察機"
 },
 "四式水中聴音機": {
  "id": 149,
  "typeId": 14,
  "typeName": "ソナー"
 },
 "三式水中探信儀": {
  "id": 47,
  "typeId": 14,
  "typeName": "ソナー"
 },
 "61cm五連装(酸素)魚雷": {
  "id": 58,
  "typeId": 5,
  "typeName": "魚雷"
 },
 "九一式徹甲弾": {
  "id": 36,
  "typeId": 19,
  "typeName": "対艦強化弾"
 },
 "一式徹甲弾": {
  "id": 116,
  "typeId": 19,
  "typeName": "対艦強化弾"
 },
 "三式弾": {
  "id": 35,
  "typeId": 18,
  "typeName": "対空強化弾"
 },
 "大発動艇": {
  "id": 68,
  "typeId": 24,
  "typeName": "上陸用舟艇"
 },
 "二式水戦改(熟練)": {
  "id": 216,
  "typeId": 45,
  "typeName": "水上戦闘機"
 },
 "一式陸攻": {
  "id": 169,
  "typeId": 47,
  "typeName": "陸上攻撃機"
 },
 "試製東海": {
  "id": 269,
  "typeId": 47,
  "typeName": "陸上攻撃機"
 },
 "発煙装置(煙幕)": {
  "id": 500,
  "typeId": 54,
  "typeName": "水上艦装備"
 },
 "41cm連装砲": {
  "id": 8,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "41cm三連装砲改": {
  "id": 236,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "41cm三連装砲改二": {
  "id": 290,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "41cm連装砲改二": {
  "id": 318,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "試製51cm連装砲": {
  "id": 128,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "51cm連装砲": {
  "id": 281,
  "typeId": 3,
  "typeName": "大口径主砲"
 },
 "20.3cm(3号)連装砲": {
  "id": 50,
  "typeId": 2,
  "typeName": "中口径主砲"
 },
 "15.2cm連装砲改二": {
  "id": 407,
  "typeId": 2,
  "typeName": "中口径主砲"
 },
 "甲標的 丙型": {
  "id": 309,
  "typeId": 22,
  "typeName": "特殊潜航艇"
 },
 "22号対水上電探改四": {
  "id": 88,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "13号対空電探改": {
  "id": 106,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "13号対空電探改(後期型)": {
  "id": 450,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "SG レーダー(初期型)": {
  "id": 315,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "HF/DF + Type144/147 ASDIC": {
  "id": 262,
  "typeId": 14,
  "typeName": "ソナー"
 },
 "三式爆雷投射機 集中配備": {
  "id": 287,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "烈風(六〇一空)": {
  "id": 110,
  "typeId": 6,
  "typeName": "艦上戦闘機"
 },
 "天山一二型(友永隊)": {
  "id": 94,
  "typeId": 8,
  "typeName": "艦上攻撃機"
 },
 "流星改(一航戦)": {
  "id": 342,
  "typeId": 8,
  "typeName": "艦上攻撃機"
 },
 "流星改(一航戦/熟練)": {
  "id": 343,
  "typeId": 8,
  "typeName": "艦上攻撃機"
 },
 "彗星(江草隊)": {
  "id": 100,
  "typeId": 7,
  "typeName": "艦上爆撃機"
 },
 "特二式内火艇": {
  "id": 167,
  "typeId": 46,
  "typeName": "特型内火艇"
 },
 "M4A1 DD": {
  "id": 355,
  "typeId": 24,
  "typeName": "上陸用舟艇"
 },
 "25mm三連装機銃 集中配備": {
  "id": 131,
  "typeId": 21,
  "typeName": "対空機銃"
 },
 "25mm連装機銃(熟練機銃員分隊)": {
  "id": 575,
  "typeId": 21,
  "typeName": "対空機銃"
 },
 "Bofors 40mm四連装機関砲": {
  "id": 173,
  "typeId": 21,
  "typeName": "対空機銃"
 },
 "12cm30連装噴進砲改二": {
  "id": 274,
  "typeId": 21,
  "typeName": "対空機銃"
 },
 "91式高射装置": {
  "id": 120,
  "typeId": 36,
  "typeName": "高射装置"
 },
 "94式高射装置": {
  "id": 121,
  "typeId": 36,
  "typeName": "高射装置"
 },
 "15.5cm三連装副砲改二": {
  "id": 463,
  "typeId": 4,
  "typeName": "副砲"
 },
 "熟練見張員": {
  "id": 129,
  "typeId": 39,
  "typeName": "水上艦要員"
 },
 "探照灯": {
  "id": 74,
  "typeId": 29,
  "typeName": "探照灯"
 },
 "照明弾": {
  "id": 101,
  "typeId": 33,
  "typeName": "照明弾"
 },
 "九八式水上偵察機(夜偵)": {
  "id": 102,
  "typeId": 10,
  "typeName": "水上偵察機"
 },
 "熟練甲板要員": {
  "id": 477,
  "typeId": 35,
  "typeName": "航空要員"
 },
 "銀河": {
  "id": 187,
  "typeId": 47,
  "typeName": "陸上攻撃機"
 },
 "一式陸攻 三四型": {
  "id": 186,
  "typeId": 47,
  "typeName": "陸上攻撃機"
 },
 "四式重爆 飛龍": {
  "id": 403,
  "typeId": 47,
  "typeName": "陸上攻撃機"
 },
 "一式戦 隼II型(64戦隊)": {
  "id": 225,
  "typeId": 48,
  "typeName": "局地戦闘機"
 },
 "一式戦 隼III型甲(54戦隊)": {
  "id": 223,
  "typeId": 48,
  "typeName": "局地戦闘機"
 },
 "雷電": {
  "id": 175,
  "typeId": 48,
  "typeName": "局地戦闘機"
 },
 "紫電改(三四三空) 戦闘301": {
  "id": 263,
  "typeId": 48,
  "typeName": "局地戦闘機"
 },
 "改良型艦本式タービン": {
  "id": 33,
  "typeId": 17,
  "typeName": "機関部強化"
 },
 "強化型艦本式缶": {
  "id": 34,
  "typeId": 17,
  "typeName": "機関部強化"
 },
 "新型高温高圧缶": {
  "id": 87,
  "typeId": 17,
  "typeName": "機関部強化"
 },
 "増設バルジ(中型艦)": {
  "id": 72,
  "typeId": 27,
  "typeName": "追加装甲(中型)"
 },
 "増設バルジ(大型艦)": {
  "id": 73,
  "typeId": 28,
  "typeName": "追加装甲(大型)"
 },
 "艦本新設計 増設バルジ(中型艦)": {
  "id": 203,
  "typeId": 27,
  "typeName": "追加装甲(中型)"
 },
 "艦本新設計 増設バルジ(大型艦)": {
  "id": 204,
  "typeId": 28,
  "typeName": "追加装甲(大型)"
 },
 "艦隊司令部施設": {
  "id": 107,
  "typeId": 34,
  "typeName": "司令部施設"
 },
 "遊撃部隊 艦隊司令部": {
  "id": 272,
  "typeId": 34,
  "typeName": "司令部施設"
 },
 "精鋭水雷戦隊 司令部": {
  "id": 413,
  "typeId": 34,
  "typeName": "司令部施設"
 },
 "水雷戦隊 熟練見張員": {
  "id": 412,
  "typeId": 39,
  "typeName": "水上艦要員"
 },
 "96式150cm探照灯": {
  "id": 140,
  "typeId": 42,
  "typeName": "大型探照灯"
 },
 "紫雲": {
  "id": 118,
  "typeId": 10,
  "typeName": "水上偵察機"
 },
 "紫雲(熟練)": {
  "id": 521,
  "typeId": 10,
  "typeName": "水上偵察機"
 },
 "瑞雲改二(六三四空)": {
  "id": 322,
  "typeId": 11,
  "typeName": "水上爆撃機"
 },
 "噴式景雲改": {
  "id": 199,
  "typeId": 57,
  "typeName": "噴式戦闘爆撃機"
 },
 "橘花改": {
  "id": 200,
  "typeId": 57,
  "typeName": "噴式戦闘爆撃機"
 },
 "応急修理要員": {
  "id": 42,
  "typeId": 23,
  "typeName": "応急修理要員"
 },
 "応急修理女神": {
  "id": 43,
  "typeId": 23,
  "typeName": "応急修理要員"
 },
 "洋上補給": {
  "id": 146,
  "typeId": 44,
  "typeName": "補給物資"
 },
 "夜間作戦航空要員": {
  "id": 258,
  "typeId": 35,
  "typeName": "航空要員"
 },
 "F6F-3N": {
  "id": 254,
  "typeId": 6,
  "typeName": "艦上戦闘機"
 },
 "F6F-5N": {
  "id": 255,
  "typeId": 6,
  "typeName": "艦上戦闘機"
 },
 "TBM-3D": {
  "id": 257,
  "typeId": 8,
  "typeName": "艦上攻撃機"
 },
 "42号対空電探改二": {
  "id": 411,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "FuMO25 レーダー": {
  "id": 124,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "カ号観測機": {
  "id": 69,
  "typeId": 25,
  "typeName": "オートジャイロ"
 },
 "オ号観測機改二": {
  "id": 325,
  "typeId": 25,
  "typeName": "オートジャイロ"
 },
 "S-51J": {
  "id": 326,
  "typeId": 25,
  "typeName": "オートジャイロ"
 },
 "S-51J改": {
  "id": 327,
  "typeId": 25,
  "typeName": "オートジャイロ"
 },
 "後期型艦首魚雷(6門)": {
  "id": 213,
  "typeId": 32,
  "typeName": "潜水艦魚雷"
 },
 "12.7cm連装高角砲": {
  "id": 10,
  "typeId": 4,
  "typeName": "副砲"
 },
 "15.5cm三連装副砲": {
  "id": 12,
  "typeId": 4,
  "typeName": "副砲"
 },
 "13号対空電探": {
  "id": 27,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "22号対水上電探": {
  "id": 28,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "三式爆雷投射機": {
  "id": 45,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "8cm高角砲": {
  "id": 66,
  "typeId": 4,
  "typeName": "副砲"
 },
 "10cm連装高角砲(砲架)": {
  "id": 71,
  "typeId": 4,
  "typeName": "副砲"
 },
 "12.7cm高角砲+高射装置": {
  "id": 130,
  "typeId": 4,
  "typeName": "副砲"
 },
 "15m二重測距儀+21号電探改二": {
  "id": 142,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "潜水艦搭載電探&水防式望遠鏡": {
  "id": 210,
  "typeId": 51,
  "typeName": "潜水艦装備"
 },
 "潜水艦搭載電探&逆探(E27)": {
  "id": 211,
  "typeId": 51,
  "typeName": "潜水艦装備"
 },
 "8cm高角砲改+増設機銃": {
  "id": 220,
  "typeId": 4,
  "typeName": "副砲"
 },
 "九五式爆雷": {
  "id": 226,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "二式爆雷": {
  "id": 227,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "15.5cm三連装副砲改": {
  "id": 234,
  "typeId": 4,
  "typeName": "副砲"
 },
 "22号対水上電探改四(後期調整型)": {
  "id": 240,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "北方迷彩(+北方装備)": {
  "id": 268,
  "typeId": 27,
  "typeName": "追加装甲(中型)"
 },
 "10cm連装高角砲改+増設機銃": {
  "id": 275,
  "typeId": 4,
  "typeName": "副砲"
 },
 "三式弾改": {
  "id": 317,
  "typeId": 18,
  "typeName": "対空強化弾"
 },
 "二式12cm迫撃砲改": {
  "id": 346,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "二式12cm迫撃砲改 集中配備": {
  "id": 347,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "12.7cm単装高角砲改二": {
  "id": 379,
  "typeId": 1,
  "typeName": "小口径主砲"
 },
 "後期型潜水艦搭載電探&逆探": {
  "id": 384,
  "typeId": 51,
  "typeName": "潜水艦装備"
 },
 "装甲艇(AB艇)": {
  "id": 408,
  "typeId": 24,
  "typeName": "上陸用舟艇"
 },
 "21号対空電探改二": {
  "id": 410,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "潜水艦後部魚雷発射管4門(初期型)": {
  "id": 442,
  "typeId": 32,
  "typeName": "潜水艦魚雷"
 },
 "潜水艦後部魚雷発射管4門(後期型)": {
  "id": 443,
  "typeId": 32,
  "typeName": "潜水艦魚雷"
 },
 "後期型電探&逆探+シュノーケル装備": {
  "id": 458,
  "typeId": 51,
  "typeName": "潜水艦装備"
 },
 "15m二重測距儀改+21号電探改二+熟練射撃指揮所": {
  "id": 460,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "10cm連装高角砲群 集中配備": {
  "id": 464,
  "typeId": 4,
  "typeName": "副砲"
 },
 "熟練甲板要員+航空整備員": {
  "id": 478,
  "typeId": 35,
  "typeName": "航空要員"
 },
 "三式弾改二": {
  "id": 483,
  "typeId": 18,
  "typeName": "対空強化弾"
 },
 "二式爆雷改二": {
  "id": 488,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "電探装備マスト(13号改+22号電探改四)": {
  "id": 506,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "逆探(E27)+22号対水上電探改四(後期調整型)": {
  "id": 517,
  "typeId": 12,
  "typeName": "小型電探"
 },
 "SJレーダー+潜水艦司令塔装備": {
  "id": 519,
  "typeId": 51,
  "typeName": "潜水艦装備"
 },
 "12cm単装高角砲+25mm機銃増備": {
  "id": 524,
  "typeId": 4,
  "typeName": "副砲"
 },
 "特四式内火艇": {
  "id": 525,
  "typeId": 46,
  "typeName": "特型内火艇"
 },
 "特四式内火艇改": {
  "id": 526,
  "typeId": 46,
  "typeName": "特型内火艇"
 },
 "Type281 レーダー": {
  "id": 527,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "Type274 射撃管制レーダー": {
  "id": 528,
  "typeId": 13,
  "typeName": "大型電探"
 },
 "三式爆雷投射機改": {
  "id": 569,
  "typeId": 15,
  "typeName": "爆雷"
 },
 "53cm連装魚雷改(酸素魚雷)": {
  "id": 571,
  "typeId": 5,
  "typeName": "魚雷"
 },
 "12.7cm単装高角砲改三": {
  "id": 572,
  "typeId": 1,
  "typeName": "小口径主砲"
 }
};
const HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS={
 "小口径主砲": [
  1
 ],
 "中口径主砲": [
  2
 ],
 "大口径主砲": [
  3
 ],
 "副砲": [
  4
 ],
 "魚雷": [
  5
 ],
 "艦上戦闘機": [
  6
 ],
 "艦上爆撃機": [
  7
 ],
 "艦上攻撃機": [
  8
 ],
 "艦上偵察機": [
  9
 ],
 "水上偵察機": [
  10
 ],
 "水上爆撃機": [
  11
 ],
 "小型電探": [
  12
 ],
 "小型水上電探": [
  12
 ],
 "小型対空電探": [
  12
 ],
 "大型電探": [
  13
 ],
 "ソナー": [
  14
 ],
 "爆雷": [
  15
 ],
 "増設バルジ": [
  16,
  27,
  28
 ],
 "機関部強化": [
  17
 ],
 "対空強化弾": [
  18
 ],
 "対艦強化弾": [
  19
 ],
 "対空機銃": [
  21
 ],
 "特殊潜航艇": [
  22
 ],
 "応急修理要員": [
  23
 ],
 "上陸用舟艇": [
  24
 ],
 "回転翼機": [
  25
 ],
 "探照灯": [
  29
 ],
 "潜水艦魚雷": [
  32
 ],
 "照明弾": [
  33
 ],
 "司令部施設": [
  34
 ],
 "航空要員": [
  35
 ],
 "高射装置": [
  36
 ],
 "大型探照灯": [
  42
 ],
 "補給物資": [
  44
 ],
 "水上戦闘機": [
  45
 ],
 "特型内火艇": [
  46
 ],
 "陸上攻撃機": [
  47
 ],
 "局地戦闘機": [
  48
 ],
 "陸軍戦闘機": [
  48
 ],
 "潜水艦装備": [
  51
 ],
 "水上艦要員": [
  39,
  54
 ],
 "艦載発煙装置": [
  54
 ],
 "噴式戦闘爆撃機": [
  57,
  91
 ]
};
const HD_EXSLOT_BASE_TYPE_IDS=[16,21,23,27,28,36,39,43,44];
const HD_EXSLOT_GLOBAL_ITEM_IDS=[33];
const HD_EXSLOT_ITEM_RULES={
 "10": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   593,
   911,
   916,
   954,
   1031
  ]
 },
 "12": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   911,
   916
  ]
 },
 "27": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   38,
   41,
   52,
   54,
   101
  ],
  "shipIds": [
   229,
   426,
   961,
   975,
   979,
   986,
   987,
   1035,
   1040
  ]
 },
 "28": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   30,
   38,
   101
  ],
  "shipIds": [
   229,
   591,
   592,
   593,
   694,
   954,
   961,
   975,
   1035,
   1040
  ]
 },
 "33": {
  "reqStar": 0,
  "stypes": [
   99
  ],
  "ctypes": [],
  "shipIds": []
 },
 "34": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   229,
   316,
   951,
   961,
   1035,
   1040
  ]
 },
 "35": {
  "reqStar": 0,
  "stypes": [
   5,
   6,
   8,
   9,
   10
  ],
  "ctypes": [],
  "shipIds": []
 },
 "45": {
  "reqStar": 0,
  "stypes": [
   1
  ],
  "ctypes": [
   54,
   101
  ],
  "shipIds": [
   564,
   648,
   961,
   982,
   1033,
   1035,
   1040
  ]
 },
 "66": {
  "reqStar": 0,
  "stypes": [
   19,
   20,
   21
  ],
  "ctypes": [
   41
  ],
  "shipIds": [
   488,
   501,
   502,
   503,
   504,
   506,
   507,
   508,
   509,
   883,
   888,
   894,
   899
  ]
 },
 "71": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   43,
   52
  ],
  "shipIds": [
   136,
   148,
   546,
   593,
   894,
   899,
   911,
   916,
   954,
   1031
  ]
 },
 "87": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   229,
   316,
   951,
   961,
   1035,
   1040
  ]
 },
 "88": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   30,
   38,
   101
  ],
  "shipIds": [
   229,
   591,
   592,
   593,
   694,
   954,
   961,
   975,
   1035,
   1040
  ]
 },
 "106": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   38,
   41,
   52,
   54,
   101
  ],
  "shipIds": [
   229,
   426,
   961,
   975,
   979,
   986,
   987,
   1035,
   1040
  ]
 },
 "124": {
  "reqStar": 7,
  "stypes": [],
  "ctypes": [
   47,
   55
  ],
  "shipIds": []
 },
 "130": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   593,
   911,
   916,
   954,
   1031
  ]
 },
 "142": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   911,
   916
  ]
 },
 "210": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "211": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "220": {
  "reqStar": 0,
  "stypes": [
   19,
   20,
   21
  ],
  "ctypes": [
   41
  ],
  "shipIds": [
   488,
   501,
   502,
   503,
   504,
   506,
   507,
   508,
   509,
   883,
   888,
   894,
   899
  ]
 },
 "226": {
  "reqStar": 0,
  "stypes": [
   1
  ],
  "ctypes": [],
  "shipIds": [
   145,
   961,
   982,
   1033,
   1035,
   1040
  ]
 },
 "227": {
  "reqStar": 0,
  "stypes": [
   1
  ],
  "ctypes": [],
  "shipIds": [
   145,
   961,
   982,
   1033,
   1035,
   1040
  ]
 },
 "234": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   911,
   916
  ]
 },
 "240": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   30,
   38,
   101
  ],
  "shipIds": [
   229,
   591,
   592,
   593,
   694,
   954,
   961,
   975,
   1035,
   1040
  ]
 },
 "268": {
  "reqStar": 7,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   100,
   101,
   114,
   200,
   290,
   395,
   511,
   512,
   513,
   516,
   574,
   995,
   1000,
   1001,
   1006
  ]
 },
 "275": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   43,
   52
  ],
  "shipIds": [
   136,
   148,
   546,
   593,
   894,
   899,
   911,
   916,
   954,
   1031
  ]
 },
 "317": {
  "reqStar": 0,
  "stypes": [
   5,
   6,
   8,
   9,
   10
  ],
  "ctypes": [],
  "shipIds": []
 },
 "346": {
  "reqStar": 0,
  "stypes": [
   1,
   16,
   17,
   19,
   20,
   22
  ],
  "ctypes": [],
  "shipIds": []
 },
 "347": {
  "reqStar": 0,
  "stypes": [
   1,
   16,
   17,
   19,
   20,
   22
  ],
  "ctypes": [],
  "shipIds": []
 },
 "379": {
  "reqStar": 7,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   144,
   145,
   195,
   407,
   419,
   426,
   437,
   557,
   656,
   961,
   1035,
   1040
  ]
 },
 "384": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "408": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   621,
   626
  ]
 },
 "410": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   591,
   592,
   593,
   694,
   954,
   1031
  ]
 },
 "411": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   591,
   592,
   593,
   694,
   954,
   1031
  ]
 },
 "413": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   4,
   16,
   20,
   38,
   41,
   52,
   54
  ],
  "shipIds": []
 },
 "442": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "443": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "450": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   38,
   41,
   52,
   54,
   101
  ],
  "shipIds": [
   229,
   426,
   961,
   975,
   979,
   986,
   987,
   1035,
   1040
  ]
 },
 "458": {
  "reqStar": 0,
  "stypes": [
   13,
   14
  ],
  "ctypes": [],
  "shipIds": []
 },
 "460": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   911,
   916
  ]
 },
 "463": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   911,
   916
  ]
 },
 "464": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   546,
   593,
   911,
   916,
   954,
   1031
  ]
 },
 "477": {
  "reqStar": 0,
  "stypes": [
   7,
   11,
   18
  ],
  "ctypes": [],
  "shipIds": []
 },
 "478": {
  "reqStar": 0,
  "stypes": [
   7,
   11,
   18
  ],
  "ctypes": [],
  "shipIds": []
 },
 "483": {
  "reqStar": 0,
  "stypes": [
   5,
   6,
   8,
   9,
   10
  ],
  "ctypes": [],
  "shipIds": []
 },
 "488": {
  "reqStar": 0,
  "stypes": [
   1
  ],
  "ctypes": [],
  "shipIds": [
   145,
   961,
   982,
   1033,
   1035,
   1040
  ]
 },
 "506": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   147,
   235,
   407,
   419,
   464,
   470,
   537,
   538,
   557,
   558,
   578,
   656,
   743,
   744,
   745,
   955,
   956,
   960,
   961,
   963,
   968,
   975,
   981,
   982,
   983,
   1033,
   1034,
   1035,
   1040,
   1046
  ]
 },
 "517": {
  "reqStar": 4,
  "stypes": [],
  "ctypes": [
   30,
   38,
   101
  ],
  "shipIds": [
   229,
   591,
   592,
   593,
   694,
   954,
   961,
   975,
   1035,
   1040
  ]
 },
 "519": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   114,
   122
  ],
  "shipIds": []
 },
 "524": {
  "reqStar": 0,
  "stypes": [
   17,
   19,
   20,
   21,
   22
  ],
  "ctypes": [],
  "shipIds": []
 },
 "525": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   399,
   607,
   971,
   972,
   976,
   977
  ]
 },
 "526": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   399,
   607,
   971,
   972,
   976,
   977
  ]
 },
 "527": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   67,
   78,
   88,
   108,
   112,
   135
  ],
  "shipIds": []
 },
 "528": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [
   67,
   88,
   108,
   134
  ],
  "shipIds": []
 },
 "569": {
  "reqStar": 0,
  "stypes": [
   1
  ],
  "ctypes": [
   54,
   101
  ],
  "shipIds": [
   564,
   648,
   961,
   982,
   1033,
   1035,
   1040
  ]
 },
 "571": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   591,
   592,
   656,
   694,
   954,
   961
  ]
 },
 "572": {
  "reqStar": 0,
  "stypes": [],
  "ctypes": [],
  "shipIds": [
   144,
   145,
   195,
   407,
   419,
   426,
   437,
   557,
   656,
   961,
   1035,
   1040
  ]
 }
};
const HD_EXSLOT_LIMIT_TYPE_IDS={
 "100": [
  27
 ],
 "101": [
  27
 ],
 "114": [
  27
 ],
 "200": [
  27
 ],
 "290": [
  27
 ],
 "395": [
  27
 ],
 "511": [
  27
 ],
 "512": [
  27
 ],
 "513": [
  27
 ],
 "516": [
  27
 ],
 "574": [
  27
 ],
 "995": [
  27
 ],
 "1000": [
  27
 ],
 "1001": [
  27
 ],
 "1006": [
  27
 ]
};
const HD_PICKER_TYPE_SP_OVERRIDES={128:38,281:38,465:38,142:93,460:93,151:94,561:91};
const HD_PICKER_TYPE_OVERRIDES={467:95};
const HD_SLOT_EXCLUSION_RULES=[
 {shipIds:[553,554],slot:2,fromSlot:true,exclude:[2,3]},
 {shipIds:[622,623,624],slot:3,exclude:[1,2,5,22]},
 {shipIds:[622,623,624],slot:4,allowOnly:[12,21,43]},
 {shipIds:[662,663,668],slot:3,exclude:[5]},
 {shipIds:[963,968],slot:3,exclude:[1,5,13]},
 {shipIds:[978],slot:2,exclude:[2]},
 {shipIds:[961,1035],slot:3,exclude:[1,5]},
 {shipIds:[743,744,745],slot:3,allowOnly:[21,43]}
];
(function hdApplyKancolleMasterSnapshot(){
 const snap=window.HD_KANCOLLE_MASTER_SNAPSHOT;
 window.HD_SHIP_MASTER_RUNTIME_SYNCED=!!(snap&&snap.ships);
 window.HD_SHIP_MASTER_RUNTIME_SOURCE=snap?.source||HD_SHIP_MASTER_SOURCE;
 if(!snap?.ships)return;
 const replaceObj=(target,source)=>{for(const k of Object.keys(target))delete target[k];Object.assign(target,source||{})};
 replaceObj(HD_SHIP_SLOT_PROFILES,snap.ships);
 replaceObj(HD_EQUIPMENT_MASTER_META_BY_NAME,snap.equipment);
 HD_EXSLOT_BASE_TYPE_IDS.splice(0,HD_EXSLOT_BASE_TYPE_IDS.length,...(snap.exslotBaseTypeIds||[]));
 HD_EXSLOT_GLOBAL_ITEM_IDS.splice(0,HD_EXSLOT_GLOBAL_ITEM_IDS.length,...(snap.exslotGlobalItemIds||[]));
 replaceObj(HD_EXSLOT_ITEM_RULES,snap.exslotItemRules);
 replaceObj(HD_EXSLOT_LIMIT_TYPE_IDS,snap.exslotLimitTypeIds);
 const cr=snap.clientRules||null;
 window.HD_SHIP_PICKER_RUNTIME_SYNCED=!!cr;
 window.HD_SHIP_PICKER_RUNTIME_SOURCE=cr?.source||null;
 if(cr){
  replaceObj(HD_PICKER_TYPE_SP_OVERRIDES,cr.equipTypeSpOverrides);
  replaceObj(HD_PICKER_TYPE_OVERRIDES,cr.pickerTypeOverrides);
  HD_SLOT_EXCLUSION_RULES.splice(0,HD_SLOT_EXCLUSION_RULES.length,...(cr.slotExclusions||[]));
 }
})();
const HD_EQUIP_TYPE_LABELS={1:'小口径主砲',2:'中口径主砲',3:'大口径主砲',5:'魚雷',12:'小型電探',13:'大型電探',21:'対空機銃',22:'特殊潜航艇',43:'戦闘糧食',38:'大口径主砲(II)',91:'噴式戦闘爆撃機(II)',93:'大型電探(II)',94:'艦上偵察機(II)',95:'副砲(II)'};
const HD_EQUIPMENT_MASTER_NAME_BY_ID=Object.fromEntries(Object.entries(HD_EQUIPMENT_MASTER_META_BY_NAME).map(([name,v])=>[String(v.id),name]));
const HD_EXSLOT_TYPE_LABELS={16:'追加装甲',21:'対空機銃',23:'応急修理要員',27:'追加装甲(中型)',28:'追加装甲(大型)',36:'高射装置',39:'水上艦要員',43:'戦闘糧食',44:'補給物資'};
function hdShipDbSlotProfile(ship){
 const name=typeof ship==='string'?ship:(ship?.final||ship?.name||ship?.base||ship?.row?.name);
 const p=HD_SHIP_SLOT_PROFILES[name];
 if(p)return {...p,total:p.slots.reduce((s,n)=>s+n,0),count:p.slots.length,masterOnly:false};
 const row=typeof hdShipDbMasterRowFor==='function'?hdShipDbMasterRowFor(ship):null;if(!row)return null;
 const snap=window.HD_KANCOLLE_MASTER_SNAPSHOT||{},equipRules=snap.shipEquipOverrides?.[String(row.id)]||snap.stypeEquipRules?.[String(row.stype)]||{};
 const names=typeof hdShipDbMasterTypeMap==='function'?hdShipDbMasterTypeMap():new Map(),allowedTypes=Object.keys(equipRules).map(id=>names.get(String(id))||'').filter(Boolean);
 return {id:row.id,ctype:row.ctype,stype:row.stype,slots:[...(row.slots||[])],equipRules,allowedTypes,flags:[],total:(row.slots||[]).reduce((s,n)=>s+n,0),count:(row.slots||[]).length,masterOnly:true};
}
function hdShipDbMasterMeta(item){
 return HD_EQUIPMENT_MASTER_META_BY_NAME[String(item?.name||'')]||null;
}
function hdShipDbPickerTypeId(item){
 const exact=hdShipDbMasterMeta(item);
 if(exact?.id){const id=Number(exact.id);return Number(HD_PICKER_TYPE_OVERRIDES[id]??HD_PICKER_TYPE_SP_OVERRIDES[id]??exact.typeId??0)}
 const ids=HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS[String(item?.category||'')]||[];return Number(ids[0]||0);
}
function hdShipDbMasterTypeIdsForItem(item){
 const exact=hdShipDbMasterMeta(item);if(exact?.id)return [hdShipDbPickerTypeId(item)].filter(Boolean);
 return HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS[String(item?.category||'')]||[];
}
function hdShipDbMasterCompatible(item,ship){
 const p=hdShipDbSlotProfile(ship);if(!p?.equipRules)return null;
 const exact=hdShipDbMasterMeta(item),ids=hdShipDbMasterTypeIdsForItem(item);if(!ids.length)return null;
 let saw=false;
 for(const typeId of ids){
  const key=String(typeId);if(!Object.prototype.hasOwnProperty.call(p.equipRules,key))continue;
  saw=true;const rule=p.equipRules[key];
  if(rule===null)return true;
  if(exact&&Array.isArray(rule)&&rule.includes(Number(exact.id)))return true;
 }
 return saw?false:null;
}
function hdShipDbExpansionRuleApplies(rule,profile){
 if(!rule||!profile)return false;
 return (rule.shipIds||[]).includes(Number(profile.id))||(rule.stypes||[]).includes(Number(profile.stype))||(rule.stypes||[]).includes(99)||(rule.ctypes||[]).includes(Number(profile.ctype));
}
function hdShipDbExpansionRuleMatch(rule,profile,star=0){
 return hdShipDbExpansionRuleApplies(rule,profile)&&Number(star||0)>=Number(rule?.reqStar||0);
}
function hdShipDbExpansionInfo(item,ship,star=0){
 const profile=hdShipDbSlotProfile(ship);if(!profile)return {allowed:false,mode:'none',reason:'艦娘マスター未登録',reqStar:0};
 const normal=hdShipDbMasterCompatible(item,ship);
 if(normal===false)return {allowed:false,mode:'none',reason:'通常スロット装備不可',reqStar:0};
 if(normal===null&&!hdShipDbEquipCompatible(item,ship))return {allowed:false,mode:'none',reason:'通常スロット装備不可',reqStar:0};
 const exact=hdShipDbMasterMeta(item),typeIds=hdShipDbMasterTypeIdsForItem(item);
 let starShort=null;
 if(exact){
  const special=HD_EXSLOT_ITEM_RULES[String(exact.id)];
  if(special&&hdShipDbExpansionRuleApplies(special,profile)){
   const req=Number(special.reqStar||0);
   if(Number(star||0)>=req)return {allowed:true,mode:(special.stypes||[]).includes(99)?'global':'special',reason:(special.stypes||[]).includes(99)?'全艦個別許可':'艦/艦級/艦種別の個別許可',reqStar:req};
   starShort={allowed:false,mode:'special',reason:`改修★${req}以上が必要`,reqStar:req};
  }
  if(HD_EXSLOT_GLOBAL_ITEM_IDS.includes(Number(exact.id)))return {allowed:true,mode:'global',reason:'全艦個別許可',reqStar:0};
 }
 const blocked=new Set(HD_EXSLOT_LIMIT_TYPE_IDS[String(profile.id)]||[]);
 const common=typeIds.find(id=>HD_EXSLOT_BASE_TYPE_IDS.includes(Number(id))&&!blocked.has(Number(id)));
 if(common)return {allowed:true,mode:'common',reason:`共通増設カテゴリ: ${HD_EXSLOT_TYPE_LABELS[common]||HD_EQUIP_TYPE_LABELS[common]||('#'+common)}`,reqStar:0,typeId:Number(common)};
 return starShort||{allowed:false,mode:'none',reason:'補強増設対象外',reqStar:0};
}
function hdShipDbExpansionCompatible(item,ship,star=0){
 return hdShipDbExpansionInfo(item,ship,star).allowed;
}
function hdShipDbExpansionCandidates(ship,remaining=null,context=''){
 const inv=hdShipDbOwnedEquipInventory(),rows=[];
 for(const own of inv.values()){
  const remain=remaining?Number(remaining.get(own.key)||0):Number(own.count||0);if(remain<=0)continue;
  const info=hdShipDbExpansionInfo(own.item,ship,own.maxStar||0);if(!info.allowed)continue;
  const bonus=info.mode==='special'?24:info.mode==='global'?16:0;
  const score=hdShipDbEquipPower(own.item,context)+(own.maxStar||0)*2+bonus;
  rows.push({own,info,score,remain});
 }
 return rows.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
}
function hdShipDbExpansionMasterRows(ship){
 const p=hdShipDbSlotProfile(ship);if(!p)return {common:[],special:[]};
 const blocked=new Set(HD_EXSLOT_LIMIT_TYPE_IDS[String(p.id)]||[]);
 const common=HD_EXSLOT_BASE_TYPE_IDS.filter(id=>Object.prototype.hasOwnProperty.call(p.equipRules||{},String(id))&&!blocked.has(Number(id))).map(id=>HD_EXSLOT_TYPE_LABELS[id]||HD_EQUIP_TYPE_LABELS[id]||('#'+id));
 const special=[];
 for(const [id,rule] of Object.entries(HD_EXSLOT_ITEM_RULES)){
  if(!hdShipDbExpansionRuleApplies(rule,p))continue;
  const name=HD_EQUIPMENT_MASTER_NAME_BY_ID[String(id)];if(!name)continue;
  const normal=hdShipDbMasterCompatible({name},ship);if(normal===false)continue;
  special.push({id:Number(id),name,reqStar:Number(rule.reqStar||0),global:(rule.stypes||[]).includes(99)});
 }
 special.sort((a,b)=>(a.global===b.global?0:a.global?-1:1)||a.reqStar-b.reqStar||a.id-b.id);
 return {common:[...new Set(common)],special};
}
function hdShipDbExpansionMasterHtml(ship){
 const rows=hdShipDbExpansionMasterRows(ship),max=12,shown=rows.special.slice(0,max),rest=Math.max(0,rows.special.length-shown.length);
 const common=rows.common.length?rows.common.map(x=>`<span>${hdShipDbEsc(x)}</span>`).join(''):'<span class="muted-chip">共通カテゴリなし</span>';
 const special=shown.length?shown.map(x=>`<span class="${x.reqStar?'star-rule':''}">${hdShipDbEsc(x.name)}${x.reqStar?` ★${x.reqStar}+`:''}${x.global?'・全艦':''}</span>`).join(''):'<span class="muted-chip">個別追加なし</span>';
 return `<div class="hd-shipdb-exslot-master"><div><b>共通カテゴリ</b><div>${common}</div></div><div><b>個別追加</b><div>${special}${rest?`<span>ほか${rest}件</span>`:''}</div></div></div>`;
}
function hdShipDbExpansionHtml(ship){
 const rows=hdShipDbExpansionCandidates(ship,null,(HD_SHIP_LOADOUTS[ship.final]||[]).map(x=>x.name+' '+x.memo).join(' ')).slice(0,6);
 if(!rows.length)return '<div class="hd-shipdb-expansion-owned"><b>手持ち増設候補</b><span>装備台帳に搭載可能な候補なし</span></div>';
 return `<div class="hd-shipdb-expansion-owned"><b>手持ち増設候補</b><div>${rows.map(({own,info})=>`<span title="${hdShipDbEsc(info.reason)}">${hdShipDbEsc(own.name)}${own.maxStar?` ★${own.maxStar}`:''}<i>${info.mode==='common'?'共通':info.mode==='global'?'全艦':'個別'}${info.reqStar?` ★${info.reqStar}+`:''}</i></span>`).join('')}</div></div>`;
}
function hdShipDbSlotRules(profile,index){
 if(!profile)return [];return HD_SLOT_EXCLUSION_RULES.filter(r=>r.shipIds.includes(Number(profile.id))&&(r.fromSlot?index>=r.slot:index===r.slot));
}
function hdShipDbSlotRejects(profile,index,item){
 const typeId=hdShipDbPickerTypeId(item);if(!typeId)return false;
 return hdShipDbSlotRules(profile,index).some(r=>Array.isArray(r.allowOnly)?!r.allowOnly.includes(typeId):Array.isArray(r.exclude)&&r.exclude.includes(typeId));
}
function hdShipDbSlotRuleText(profile,index){
 const rules=hdShipDbSlotRules(profile,index);if(!rules.length)return '';
 return rules.map(r=>Array.isArray(r.allowOnly)?'許可のみ: '+r.allowOnly.map(x=>HD_EQUIP_TYPE_LABELS[x]||('#'+x)).join('・'):'不可: '+(r.exclude||[]).map(x=>HD_EQUIP_TYPE_LABELS[x]||('#'+x)).join('・')).join(' / ');
}
function hdShipDbAirGearKind(item,wanted=''){
 const cat=String(item?.category||''),text=`${wanted} ${item?.name||''} ${cat}`;
 if(/彩雲|艦上偵察機|水上偵察機|偵察機|水偵/.test(text))return 'recon';
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|水上戦闘機|水上爆撃機|噴式|艦戦|艦攻|艦爆|水戦|瑞雲/.test(text))return 'air';
 if(/回転翼機|対潜哨戒機/.test(text))return 'air';
 return 'normal';
}
function hdShipDbPickNormalSlot(profile,free,item,wanted){
 if(!profile||!free.length)return null;
 const kind=hdShipDbAirGearKind(item,wanted);
 let sorted=free.filter(x=>!item||!hdShipDbSlotRejects(profile,x.index,item));
 if(kind==='air')sorted.sort((a,b)=>b.cap-a.cap||a.index-b.index);
 else if(kind==='recon')sorted.sort((a,b)=>a.cap-b.cap||b.index-a.index);
 else sorted.sort((a,b)=>a.index-b.index);
 return sorted[0]||null;
}
function hdShipDbSlotHtml(item){
 const p=hdShipDbSlotProfile(item);if(!p)return '';
 const slotHtml=`<div class="hd-shipdb-slot-grid">${p.slots.map((n,i)=>{const rule=hdShipDbSlotRuleText(p,i);return `<span class="${rule?'restricted':''}"><i>第${i+1}</i><b>${n}</b><small>${rule?'制限':'機'}</small>${rule?`<em>${hdShipDbEsc(rule)}</em>`:''}</span>`}).join('')}</div>`;
 const flags=p.flags?.length?`<div class="hd-shipdb-slot-flags">${p.flags.map(x=>`<span>${hdShipDbEsc(x)}</span>`).join('')}</div>`:'';
 const expansion=`<div class="hd-shipdb-expansion"><b>補強増設（マスター同期）</b><span>通常スロット可否を満たした上で、共通カテゴリ・艦/艦級/艦種別の追加許可・改修★条件を判定。</span>${hdShipDbExpansionMasterHtml(item)}${hdShipDbExpansionHtml(item)}</div>`;
 return `<div class="hd-shipdb-slot-profile"><div class="hd-shipdb-stat-head"><b>装備スロット</b><span>${p.count}スロット・搭載計${p.total}</span></div>${slotHtml}${flags}${expansion}</div>`;
}

function hdShipDbMasterAudit(){
 const ships=HD_SHIP_DATABASE.map(x=>x.final),missingProfiles=ships.filter(x=>!HD_SHIP_SLOT_PROFILES[x]);
 const badSlots=ships.filter(x=>{const p=HD_SHIP_SLOT_PROFILES[x];return p&&(!Array.isArray(p.slots)||p.slots.length!==p.count&&p.count!=null)});
 const ruleCount=Object.keys(HD_EXSLOT_ITEM_RULES||{}).length,starRuleCount=Object.values(HD_EXSLOT_ITEM_RULES||{}).filter(x=>Number(x.reqStar||0)>0).length;
 const masterForms=Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips||{}).length;
 return {ships:ships.length,profiles:ships.length-missingProfiles.length,masterForms,missingProfiles,badSlots,equipmentMasterCount:Object.keys(HD_EQUIPMENT_MASTER_META_BY_NAME||{}).length,exslotRules:ruleCount,starRules:starRuleCount,slotRules:HD_SLOT_EXCLUSION_RULES.length,pickerOverrides:Object.keys(HD_PICKER_TYPE_SP_OVERRIDES||{}).length+Object.keys(HD_PICKER_TYPE_OVERRIDES||{}).length,snapshotLoaded:window.HD_SHIP_MASTER_RUNTIME_SYNCED===true,pickerRulesLoaded:window.HD_SHIP_PICKER_RUNTIME_SYNCED===true,source:window.HD_SHIP_MASTER_RUNTIME_SOURCE||HD_SHIP_MASTER_SOURCE,pickerSource:window.HD_SHIP_PICKER_RUNTIME_SOURCE||null};
}
window.HD_SHIP_MASTER_AUDIT=hdShipDbMasterAudit();
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
function hdShipDbOwnedEquipStackKey(name,star=0){return hdShipDbEquipNorm(name)+'@@'+Math.max(0,Number(star)||0)}
function hdShipDbOwnedEquipInventory(){
 let rows=[];try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');rows=Array.isArray(x)?x:[]}catch{}
 const cat=hdShipDbEquipCatalog(),byName=new Map(cat.map(x=>[hdShipDbEquipNorm(x.name),x])),m=new Map();
 for(const row of rows){
  const norm=hdShipDbEquipNorm(row.name),star=Math.max(0,Number(row.star)||0),key=hdShipDbOwnedEquipStackKey(row.name,star),count=Math.max(0,Number(row.count)||0);if(!norm||!count)continue;
  const item=byName.get(norm)||{name:row.name,category:row.category||'',stats:{},tags:[],role:''};
  const cur=m.get(key)||{key,norm,name:row.name,count:0,star,maxStar:star,item};
  cur.count+=count;m.set(key,cur);
 }
 return m;
}
function hdShipDbEquipCompatible(item,ship){
 const master=hdShipDbMasterCompatible(item,ship);
 if(master!==null)return master;
 if(typeof hdFLCompatible==='function'){
  const base=hdFLCompatible(item,{profile:{type:ship.type,roles:ship.roles||[],row:{name:ship.final}}});
  if(base)return true;
 }
 const cat=String(item.category||''),type=ship.type,roles=ship.roles||[],profile=hdShipDbSlotProfile(ship),flags=profile?.flags||[];
 const carrier=['軽空母','正規空母','装甲空母'].includes(type),battle=['戦艦','高速戦艦','航空戦艦'].includes(type),destroyer=['駆逐艦','海防艦'].includes(type),cruiser=['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','練習巡洋艦'].includes(type);
 if(/陸上攻撃機|陸軍戦闘機|局地戦闘機/.test(cat))return false;
 if(/艦上戦闘機/.test(cat))return carrier||flags.includes('艦戦');
 if(/艦上攻撃機/.test(cat))return carrier||flags.includes('艦攻');
 if(/艦上爆撃機/.test(cat))return carrier||flags.includes('艦爆');
 if(/艦上偵察機/.test(cat))return carrier||flags.includes('艦偵');
 if(/噴式/.test(cat)||/噴式/.test(String(item.name||'')))return flags.includes('噴式');
 if(/大口径主砲/.test(cat))return battle;
 if(/中口径主砲/.test(cat))return cruiser||ship.final==='大和改二';
 if(/小口径主砲/.test(cat))return destroyer||['軽巡洋艦','練習巡洋艦'].includes(type);
 if(/水上戦闘機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||roles.includes('水戦')||roles.includes('制空補助')||flags.includes('水戦');
 if(/水上爆撃機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||flags.includes('水爆');
 if(/水上偵察機/.test(cat))return battle||['軽巡洋艦','重巡洋艦','航空巡洋艦','航空戦艦','水上機母艦'].includes(type);
 if(/回転翼機/.test(cat))return flags.includes('回転翼機')||roles.some(r=>String(r).includes('対潜'));
 if(/対艦強化弾/.test(cat))return battle;
 if(/魚雷/.test(cat)&&!/特殊潜航艇|甲標的/.test(cat))return destroyer||['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','潜水艦','潜水空母'].includes(type);
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
 const inv=hdShipDbOwnedEquipInventory(),remaining=new Map([...inv].map(([k,v])=>[k,v.count])),slots=[],profile=hdShipDbSlotProfile(ship);
 const free=profile?profile.slots.map((cap,index)=>({index,cap})):[];
 let seq=0;
 for(const wanted of (set?.gear||[])){
  const candidates=[];
  for(const own of inv.values()){
   if((remaining.get(own.key)||0)<=0)continue;
   const score=hdShipDbEquipWantedMatch(own.item,wanted,ship);if(!Number.isFinite(score))continue;
   const pick=profile?hdShipDbPickNormalSlot(profile,free,own.item,wanted):null;if(profile&&!pick)continue;
   candidates.push({own,pick,score:score+(own.maxStar||0)*1.5});
  }
  candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
  const best=candidates[0],pick=best?.pick||(profile?hdShipDbPickNormalSlot(profile,free,null,wanted):null);
  const slotIndex=pick?pick.index:seq++,capacity=pick?pick.cap:null;
  if(pick){const at=free.findIndex(x=>x.index===pick.index);if(at>=0)free.splice(at,1)}
  if(best){remaining.set(best.own.key,(remaining.get(best.own.key)||0)-1);slots.push({wanted,found:true,name:best.own.name,star:best.own.maxStar,count:best.own.count,slotIndex,capacity})}
  else slots.push({wanted,found:false,name:'',star:0,count:0,slotIndex,capacity});
 }
 const expansion=hdShipDbExpansionCandidates(ship,remaining,`${set?.name||''} ${set?.memo||''} ${(set?.gear||[]).join(' ')}`)[0]||null;
 return {slots,filled:slots.filter(x=>x.found).length,total:slots.length,inventoryCount:[...inv.values()].reduce((s,x)=>s+x.count,0),profile,freeSlots:free,expansion};
}
function hdShipDbOwnedFitHtml(ship,set){
 if(!set)return '';
 const plan=hdShipDbResolveOwnedLoadout(ship,set);
 if(!plan.inventoryCount){
  const rows=[...plan.slots].sort((a,b)=>(a.slotIndex??99)-(b.slotIndex??99));
  return `<div class="hd-map-owned-fit empty-fit"><div class="hd-map-owned-fit-head"><div><b>手持ち装備案</b><small>装備台帳が空。必要装備の入手方法をここから確認できるよ。</small></div></div><div class="hd-map-owned-slots">${rows.map(x=>{const slot=plan.profile?`第${(x.slotIndex??0)+1}スロ・${x.capacity}機`:`装備枠${(x.slotIndex??0)+1}`;return `<span class="missing"><i>!</i><b>不足</b><small>${slot}｜${hdShipDbEsc(x.wanted)}</small><button type="button" class="ghost small" data-hd-ship-acquire="${hdShipDbEsc(x.wanted)}">入手方法</button></span>`}).join('')}</div><button type="button" class="ghost small" data-hd-ship-equip-ledger>装備台帳を開く</button></div>`;
 }
 const cls=plan.filled===plan.total?'complete':plan.filled?'partial':'missing';
 const rows=[...plan.slots].sort((a,b)=>(a.slotIndex??99)-(b.slotIndex??99));
 const slotNote=plan.profile?'<small>搭載数を考慮して航空装備を自動配置</small>':'<small>装備可否・性能から自動配備</small>';
 return `<div class="hd-map-owned-fit ${cls}"><div class="hd-map-owned-fit-head"><div><b>手持ち装備案</b><small>${plan.filled}/${plan.total}枠を配備</small>${slotNote}</div><button type="button" class="ghost small" data-hd-ship-owned-refresh>再配備</button></div><div class="hd-map-owned-slots">${rows.map(x=>{const slot=plan.profile?`第${(x.slotIndex??0)+1}スロ・${x.capacity}機`:`装備枠${(x.slotIndex??0)+1}`;return x.found?`<span class="owned"><i>✓</i><b>${hdShipDbEsc(x.name)}${x.star?` ★${x.star}`:''}</b><small>${slot}｜所持 ${x.count}｜${hdShipDbEsc(x.wanted)}</small></span>`:`<span class="missing"><i>!</i><b>不足</b><small>${slot}｜${hdShipDbEsc(x.wanted)}</small><button type="button" class="ghost small" data-hd-ship-acquire="${hdShipDbEsc(x.wanted)}">入手方法</button></span>`}).join('')}${plan.profile&&plan.freeSlots.length?plan.freeSlots.sort((a,b)=>a.index-b.index).map(x=>`<span class="free"><i>＋</i><b>空きスロット</b><small>第${x.index+1}スロ・${x.cap}機</small></span>`).join(''):''}${plan.expansion?`<div class="hd-map-expansion-pick"><i>増設</i><b>${hdShipDbEsc(plan.expansion.own.name)}${plan.expansion.own.maxStar?` ★${plan.expansion.own.maxStar}`:''}</b><small>${plan.expansion.info.mode==='common'?'共通カテゴリ':plan.expansion.info.mode==='global'?'全艦個別許可':'個別許可'}${plan.expansion.info.reqStar?`｜必要★${plan.expansion.info.reqStar}+`:''}｜通常枠で未使用の手持ち</small></div>`:''}</div><button type="button" class="ghost small" data-hd-ship-equip-ledger>装備台帳を開く</button></div>`;
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
 if(exact&&typeof hdAGOpenItem==='function'){hdAGOpenItem(exact.name,map);return true}
 const kind=hdShipDbAcquisitionKind(wanted);
 if(kind&&typeof hdAGOpen==='function'){hdAGOpen(kind,map);return true}
 if(typeof hdAGOpenCatalog==='function'){hdAGOpenCatalog(wanted);return true}
 return false;
}
async function hdShipDbEnsureCurrentAssets(){
 if(typeof window.hdEnsureCurrentAssets!=='function')return false;
 try{await window.hdEnsureCurrentAssets();return true}catch{return false}
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
 return `<section class="hd-map-ship-recommend"><div class="hd-map-ship-recommend-head"><div><div class="eyebrow">SHIP CANDIDATES</div><strong>この海域の艦娘候補＋装備例</strong></div><span>DB・台帳から自動抽出</span></div><p class="hd-map-ship-recommend-note">海域説明の役割・艦種・速力と、艦隊台帳の所持状況から候補を抽出。装備例は海域の特徴に近いプリセットを優先表示するよ。ルート固定・特効・札・制空値は最優先で調整してね。</p><div class="hd-map-ship-recommend-grid">${rows.map(({item,reasons})=>{const set=hdShipDbMapLoadout(item,reasons);return `<article class="hd-map-ship-candidate"><button type="button" class="hd-map-ship-candidate-main" data-hd-shipdb-jump="${hdShipDbEsc(item.final)}"><span><b>${hdShipDbEsc(item.final)}</b><small>${hdShipDbEsc(item.type)}・${hdShipDbEsc(item.speed)}</small></span><span class="hd-map-ship-reasons">${reasons.slice(0,4).map(r=>`<i>${hdShipDbEsc(r)}</i>`).join('')}</span></button>${set?`<div class="hd-map-candidate-loadout"><div><b>${hdShipDbEsc(set.name)}</b><small>おすすめ装備例</small></div><div class="hd-map-candidate-gears">${set.gear.map(g=>`<span>${hdShipDbEsc(g)}</span>`).join('')}</div><p>${hdShipDbEsc(set.memo)}</p></div><div data-hd-owned-fit="${hdShipDbEsc(item.final)}" data-hd-loadout-name="${hdShipDbEsc(set.name)}">${hdShipDbOwnedFitHtml(item,set)}</div>`:''}<div class="hd-map-candidate-actions"><button type="button" class="primary small" data-hd-ship-procure="${hdShipDbEsc(item.final)}" data-hd-loadout-name="${hdShipDbEsc(set?.name||'')}">不足を調達リストへ</button><button type="button" class="ghost small hd-map-candidate-more" data-hd-shipdb-jump="${hdShipDbEsc(item.final)}">ステータス・別装備を見る</button></div></article>`}).join('')}</div></section>`;
}
function hdShipDbJumpTo(name){
 hdEnsureShipDatabase();
 const input=document.getElementById('hdShipDbSearch');if(input){input.value=name;hdShipDbViewSave({query:name});hdRenderShipDatabase()}
 const sec=document.getElementById('shipDatabase');if(!sec)return false;
 if(typeof window.hdWSShowElement==='function'&&window.hdWSShowElement(sec,true))return true;
 sec.scrollIntoView({behavior:'smooth',block:'start'});return true;
}

function hdShipDbStatsHtml(item){
 const s=HD_SHIP_STATS[item.final];if(!s)return '';
 const cells=[['耐久',s.hp],['火力',s.fire],['雷装',s.torp],['対空',s.aa],['装甲',s.armor],['回避',s.evasion],['対潜',s.asw],['索敵',s.los],['運',s.luck],['搭載',s.air]];
 return `<details class="hd-shipdb-detail"><summary>ステータス・おすすめ装備</summary><div class="hd-shipdb-detail-body"><div class="hd-shipdb-stat-head"><b>Lv99最大ステータス</b><span>装備補正なし</span></div><div class="hd-shipdb-stats">${cells.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="hd-shipdb-substats"><span>速力 <b>${hdShipDbEsc(item.speed)}</b></span><span>射程 <b>${hdShipDbEsc(s.range)}</b></span><span>燃料 <b>${s.fuel}</b></span><span>弾薬 <b>${s.ammo}</b></span></div>${hdShipDbSlotHtml(item)}${hdShipDbLoadoutsHtml(item)}</div></details>`;
}
function hdShipDbLoadoutsHtml(item){
 const sets=HD_SHIP_LOADOUTS[item.final]||[];if(!sets.length)return '';
 return `<div class="hd-shipdb-loadouts"><div class="hd-shipdb-stat-head"><b>おすすめ装備例</b><span>海域・特効・所持装備で調整</span></div>${sets.map(x=>`<article class="hd-shipdb-loadout"><strong>${hdShipDbEsc(x.name)}</strong><div class="hd-shipdb-gearchips">${x.gear.map(g=>`<span>${hdShipDbEsc(g)}</span>`).join('')}</div><p>${hdShipDbEsc(x.memo)}</p></article>`).join('')}</div>`;
}

function hdShipDbMasterSnapshot(){return window.HD_KANCOLLE_MASTER_SNAPSHOT||{}}
function hdShipDbMasterRows(){return Object.values(hdShipDbMasterSnapshot().allShips||{})}
const HD_SHIP_MASTER_NAME_CACHE=new Map();
function hdShipDbMasterRowFor(input){
 const directId=Number(input?.masterId||input?._masterId||input?._masterRow?.id)||0,snap=hdShipDbMasterSnapshot();
 if(directId&&snap.allShips?.[String(directId)])return snap.allShips[String(directId)];
 if(input?._masterRow?.id)return input._masterRow;
 const name=String(typeof input==='string'?input:(input?.final||input?.name||input?.base||input?.row?.name||'')).trim();if(!name)return null;
 if(!HD_SHIP_MASTER_NAME_CACHE.size){
  for(const row of hdShipDbMasterRows()){const a=HD_SHIP_MASTER_NAME_CACHE.get(row.name)||[];a.push(row);HD_SHIP_MASTER_NAME_CACHE.set(row.name,a)}
  for(const rows of HD_SHIP_MASTER_NAME_CACHE.values())rows.sort((a,b)=>Number(b.id)-Number(a.id));
 }
 const rows=HD_SHIP_MASTER_NAME_CACHE.get(name)||[];if(!rows.length)return null;
 const type=String(input?.type||input?.row?.type||'');
 return (type&&rows.find(x=>x.type===type))||rows[0];
}
function hdShipDbMasterRoles(row){
 if(!row)return [];
 const types=hdShipDbMasterAllowedTypes(row),set=new Set(types),roles=[],add=x=>{if(x&&!roles.includes(x))roles.push(x)};
 if(['駆逐艦','海防艦','軽巡洋艦','練習巡洋艦'].includes(row.type))add('対潜');
 if(set.has('艦上戦闘機')){add('制空');add('航空火力')}
 if(set.has('水上戦闘機')){add('水戦');add('制空補助')}
 if(set.has('上陸用舟艇')){add('輸送');add('大発')}
 if(set.has('特型内火艇'))add('対地');
 if(set.has('特殊潜航艇'))add('先制雷撃');
 if(Number(row.stats?.luck)>=30){add('高運');add('夜戦CI')}
 if(Number(row.stats?.fire)>=80)add('高火力');
 return roles;
}
function hdShipDbMasterAdapter(input,extraRoles=[]){
 const row=hdShipDbMasterRowFor(input);if(!row)return null;
 return {base:row.name,final:row.name,type:row.type,speed:hdShipDbMasterSpeed(row.speed),roles:[...new Set([...hdShipDbMasterRoles(row),...(extraRoles||[])])],masterId:row.id,_masterRow:row,_masterOnly:true};
}
function hdShipDbResolveShip(input,extraRoles=[]){
 const name=String(typeof input==='string'?input:(input?.name||input?.final||input?.base||input?.row?.name||'')).trim();if(!name)return null;
 const rows=typeof HD_SHIP_DATABASE!=='undefined'?HD_SHIP_DATABASE:[];
 const exact=rows.find(x=>name===x.final||name===x.base);if(exact)return exact;
 const master=hdShipDbMasterAdapter(input,extraRoles);if(master)return master;
 return rows.find(x=>name.startsWith(x.base))||null;
}

function hdShipDbMasterSpeed(code){return ({5:'低速',10:'高速',15:'高速+',20:'最速'})[Number(code)]||`速力${Number(code)||0}`}
function hdShipDbMasterRange(code){return ({0:'無',1:'短',2:'中',3:'長',4:'超長'})[Number(code)]||`射程${Number(code)||0}`}
function hdShipDbMasterTypeMap(){
 const m=new Map();
 for(const x of Object.values(hdShipDbMasterSnapshot().equipment||{})){if(x?.typeId&&x?.typeName&&!m.has(String(x.typeId)))m.set(String(x.typeId),x.typeName)}
 return m;
}
function hdShipDbMasterAllowedTypes(row){
 const snap=hdShipDbMasterSnapshot(),rules=snap.shipEquipOverrides?.[String(row.id)]||snap.stypeEquipRules?.[String(row.stype)]||{},names=hdShipDbMasterTypeMap();
 return Object.keys(rules).map(id=>names.get(String(id))||`装備種#${id}`).filter(Boolean);
}
function hdShipDbMasterEquipmentMeta(name){
 const snap=hdShipDbMasterSnapshot(),raw=String(name||'').trim();if(!raw)return null;
 if(snap.equipment?.[raw])return {name:raw,...snap.equipment[raw]};
 const norm=hdShipDbEquipNorm(raw);
 for(const [n,v] of Object.entries(snap.equipment||{}))if(hdShipDbEquipNorm(n)===norm)return {name:n,...v};
 return null;
}
function hdShipDbMasterRowByName(name){
 const raw=String(name||'').trim();if(!raw)return null;
 const rows=hdShipDbMasterRows(),exact=rows.find(x=>x.name===raw);if(exact)return exact;
 const norm=hdShipDbEquipNorm(raw);return rows.find(x=>hdShipDbEquipNorm(x.name)===norm)||null;
}
function hdShipDbMasterPickerTypeId(meta){
 if(!meta)return 0;const cr=hdShipDbMasterSnapshot().clientRules||{},id=Number(meta.id)||0;
 return Number(cr.pickerTypeOverrides?.[String(id)]??cr.pickerTypeOverrides?.[id]??cr.equipTypeSpOverrides?.[String(id)]??cr.equipTypeSpOverrides?.[id]??meta.typeId??0);
}
function hdShipDbMasterEquipRules(row){
 const snap=hdShipDbMasterSnapshot();return snap.shipEquipOverrides?.[String(row.id)]||snap.stypeEquipRules?.[String(row.stype)]||{};
}
function hdShipDbMasterSlotRulesFor(row,index){
 const rules=hdShipDbMasterSnapshot().clientRules?.slotExclusions||[];
 return rules.filter(r=>(r.shipIds||[]).includes(Number(row.id))&&(r.fromSlot?index>=Number(r.slot):index===Number(r.slot)));
}
function hdShipDbMasterSlotBlocked(row,index,typeId){
 return hdShipDbMasterSlotRulesFor(row,index).some(r=>Array.isArray(r.allowOnly)?!r.allowOnly.includes(Number(typeId)):Array.isArray(r.exclude)&&(r.exclude||[]).includes(Number(typeId)));
}
function hdShipDbMasterNormalCheck(row,equipName){
 const meta=hdShipDbMasterEquipmentMeta(equipName);
 if(!row)return {allowed:false,baseAllowed:false,known:false,reason:'艦娘を選んでね',slots:[],meta:null,typeId:0};
 if(!meta)return {allowed:false,baseAllowed:false,known:false,reason:'公式装備マスターに一致する装備名がない',slots:[],meta:null,typeId:0};
 const typeId=hdShipDbMasterPickerTypeId(meta),rules=hdShipDbMasterEquipRules(row),key=String(typeId);
 if(!typeId||!Object.prototype.hasOwnProperty.call(rules,key))return {allowed:false,baseAllowed:false,known:true,reason:'この艦では通常装備不可',slots:[],meta,typeId};
 const rule=rules[key];
 if(Array.isArray(rule)&&!rule.includes(Number(meta.id)))return {allowed:false,baseAllowed:false,known:true,reason:'装備カテゴリは対応しているが、この装備IDは個別許可対象外',slots:[],meta,typeId};
 const slots=(row.slots||[]).map((cap,index)=>({index,cap,blocked:hdShipDbMasterSlotBlocked(row,index,typeId)}));
 const allowed=slots.filter(x=>!x.blocked);
 return {allowed:allowed.length>0,baseAllowed:true,known:true,reason:allowed.length?'通常スロット装備可':slots.length?'装備位置制限により全通常スロットで不可':'通常装備カテゴリ対応・通常スロットなし',slots,allowedSlots:allowed,meta,typeId,individual:Array.isArray(rule)};
}
function hdShipDbMasterExslotCheck(row,equipName,star=0,normalInfo=null){
 const snap=hdShipDbMasterSnapshot(),normal=normalInfo||hdShipDbMasterNormalCheck(row,equipName),meta=normal.meta||hdShipDbMasterEquipmentMeta(equipName);
 if(!row||!meta)return {allowed:false,mode:'none',reason:normal.reason||'判定不可',reqStar:0};
 const typeId=normal.typeId||hdShipDbMasterPickerTypeId(meta),rule=snap.exslotItemRules?.[String(meta.id)];
 let starShort=null;
 if(rule&&hdShipDbExpansionRuleApplies(rule,row)){
  const req=Number(rule.reqStar||0);
  if(Number(star||0)>=req)return {allowed:true,mode:(rule.stypes||[]).includes(99)?'global':'special',reason:(rule.stypes||[]).includes(99)?'全艦個別許可':'艦/艦級/艦種別の個別許可',reqStar:req};
  starShort={allowed:false,mode:'special',reason:`改修★${req}以上が必要`,reqStar:req};
 }
 if(!rule&&(snap.exslotGlobalItemIds||[]).includes(Number(meta.id)))return {allowed:true,mode:'global',reason:'全艦個別許可',reqStar:0};
 const blocked=new Set(snap.exslotLimitTypeIds?.[String(row.id)]||[]);
 if(normal.baseAllowed&&(snap.exslotBaseTypeIds||[]).includes(Number(typeId))&&!blocked.has(Number(typeId)))return {allowed:true,mode:'common',reason:`共通増設カテゴリ: ${HD_EXSLOT_TYPE_LABELS[typeId]||HD_EQUIP_TYPE_LABELS[typeId]||meta.typeName||('#'+typeId)}`,reqStar:0};
 return starShort||{allowed:false,mode:'none',reason:blocked.has(Number(typeId))?'この艦では該当増設カテゴリが制限対象':'補強増設対象外',reqStar:0};
}
function hdShipDbMasterReverseCompatibility(equipName,star=0,ownedOnly=false){
 const rows=[];
 for(const row of hdShipDbMasterRows()){
  const normal=hdShipDbMasterNormalCheck(row,equipName);
  const ex=hdShipDbMasterExslotCheck(row,equipName,star,normal);
  if(!normal.allowed&&!ex.allowed)continue;
  const owned=hdShipDbMasterOwned(row);
  if(ownedOnly&&!owned)continue;
  rows.push({row,normal,ex,owned});
 }
 rows.sort((a,b)=>(!!b.owned-!!a.owned)||((a.row.sortno||99999)-(b.row.sortno||99999))||a.row.id-b.row.id);
 return rows;
}
function hdShipDbReverseHtml(equipName,star=0,ownedOnly=false){
 const meta=hdShipDbMasterEquipmentMeta(equipName);if(!meta)return '';
 const rows=hdShipDbMasterReverseCompatibility(meta.name,star,ownedOnly),normalCount=rows.filter(x=>x.normal.allowed).length,exCount=rows.filter(x=>x.ex.allowed).length,shown=rows.slice(0,80),rest=Math.max(0,rows.length-shown.length);
 const cards=shown.map(({row,normal,ex,owned})=>{
  const slots=normal.allowed?(normal.allowedSlots||[]).map(x=>`第${x.index+1}`).join('・'):'';
  const badges=[normal.allowed?`通常 ${slots||'可'}`:'',ex.allowed?`増設 ${ex.mode==='common'?'共通':ex.mode==='global'?'全艦':'個別'}${ex.reqStar?` ★${ex.reqStar}+`:''}`:''].filter(Boolean);
  return `<button type="button" class="hd-equip-reverse-row" data-hd-equip-check-ship="${row.id}"><span><b>${hdShipDbEsc(row.name)}</b><small>${hdShipDbEsc(row.type)}・${hdShipDbMasterSpeed(row.speed)}${owned?`・所持Lv.${Number(owned.level)||0}`:''}</small></span><span>${badges.map(x=>`<i>${hdShipDbEsc(x)}</i>`).join('')}</span></button>`;
 }).join('');
 return `<details class="hd-equip-reverse" open><summary>この装備を積める艦 <span>${rows.length}形態</span></summary><div class="hd-equip-reverse-summary"><span>通常枠 <b>${normalCount}</b></span><span>補強増設 <b>${exCount}</b></span>${ownedOnly?'<span>台帳の所持艦だけ</span>':''}</div><div class="hd-equip-reverse-list">${cards||'<div class="hd-equip-check-empty">条件に合う艦がないよ</div>'}</div>${rest?`<small class="hd-equip-reverse-rest">ほか ${rest}形態。艦名を絞るか「所持艦だけ」を使ってね。</small>`:''}</details>`;
}
function hdShipDbEquipCheckHtml(row,equipName,star=0){
 const normal=hdShipDbMasterNormalCheck(row,equipName),ex=hdShipDbMasterExslotCheck(row,equipName,star,normal);
 if(!row)return '<div class="hd-equip-check-empty">艦娘を選んでね</div>';
 if(!normal.meta)return `<div class="hd-equip-check-empty"><b>${hdShipDbEsc(equipName||'装備未選択')}</b><span>${hdShipDbEsc(normal.reason)}</span></div>`;
 const slotHtml=(normal.slots||[]).length?normal.slots.map(x=>`<span class="${x.blocked?'blocked':'ok'}"><i>第${x.index+1}</i><b>${x.blocked?'×':'○'}</b><small>${x.cap}機</small></span>`).join(''):'<span class="blocked"><b>通常枠なし</b></span>';
 const ownedOnly=!!document.getElementById('hdShipEquipCheckOwnedOnly')?.checked;
 return `<div class="hd-equip-check-result"><div class="hd-equip-check-title"><div><b>${hdShipDbEsc(row.name)}</b><span>× ${hdShipDbEsc(normal.meta.name)}${Number(star)?` ★${Number(star)}`:''}</span></div><small>${hdShipDbEsc(normal.meta.typeName||('装備種#'+normal.typeId))} / ID ${normal.meta.id}</small></div><div class="hd-equip-check-judge"><article class="${normal.allowed?'ok':'ng'}"><b>通常スロット ${normal.allowed?'○':'×'}</b><span>${hdShipDbEsc(normal.reason)}</span><div class="hd-equip-check-slots">${slotHtml}</div></article><article class="${ex.allowed?'ok':ex.reqStar?'warn':'ng'}"><b>補強増設 ${ex.allowed?'○':'×'}</b><span>${hdShipDbEsc(ex.reason)}</span>${ex.reqStar?`<small>必要改修: ★${ex.reqStar}以上 / 入力 ★${Number(star)||0}</small>`:''}</article></div><p>判定元: api_start2 通常装備/補強増設マスター＋装備picker位置制限。艦これ更新時はHarborDeskの自動同期で更新されるよ。</p>${hdShipDbReverseHtml(normal.meta.name,star,ownedOnly)}</div>`;
}
function hdShipDbRenderEquipChecker(){
 const host=document.getElementById('hdShipEquipCheckResult');if(!host)return;
 const shipName=document.getElementById('hdShipEquipCheckShip')?.value||'',equipName=document.getElementById('hdShipEquipCheckEquip')?.value||'',star=Math.max(0,Math.min(10,Number(document.getElementById('hdShipEquipCheckStar')?.value)||0));
 const row=hdShipDbMasterRowByName(shipName);host.innerHTML=hdShipDbEquipCheckHtml(row,equipName,star);
}
function hdShipDbEnsureEquipChecker(){
 let d=document.getElementById('hdShipEquipCheckDialog');if(d)return d;
 const rows=hdShipDbMasterRows().slice().sort((a,b)=>(a.sortno||99999)-(b.sortno||99999)||a.id-b.id),equipment=Object.keys(hdShipDbMasterSnapshot().equipment||{}).sort((a,b)=>a.localeCompare(b,'ja'));
 d=document.createElement('dialog');d.id='hdShipEquipCheckDialog';d.className='hd-ship-equip-check-dialog';
 d.innerHTML=`<div class="hd-equip-check-head"><div><div class="eyebrow">EQUIPMENT COMPATIBILITY</div><h3>装備可否チェッカー</h3></div><button type="button" class="icon-btn" data-hd-equip-check-close>×</button></div><p class="muted">全プレイヤー艦形態を公式マスターで判定。通常枠・位置制限・補強増設・改修★条件まで確認できるよ。</p><div class="hd-equip-check-form"><label>艦娘<input id="hdShipEquipCheckShip" list="hdShipEquipCheckShipList" placeholder="例: 大和改二"></label><label>装備<input id="hdShipEquipCheckEquip" list="hdShipEquipCheckEquipList" placeholder="装備名を入力"></label><label>改修★<input id="hdShipEquipCheckStar" type="number" min="0" max="10" value="0"></label><button type="button" class="primary" data-hd-equip-check-run>判定</button><label class="hd-equip-check-owned"><input id="hdShipEquipCheckOwnedOnly" type="checkbox"> 台帳の所持艦だけ逆引き</label></div><datalist id="hdShipEquipCheckShipList">${rows.map(x=>`<option value="${hdShipDbEsc(x.name)}"></option>`).join('')}</datalist><datalist id="hdShipEquipCheckEquipList">${equipment.map(x=>`<option value="${hdShipDbEsc(x)}"></option>`).join('')}</datalist><div id="hdShipEquipCheckResult" class="hd-equip-check-result-host"><div class="hd-equip-check-empty">艦娘と装備を選んで「判定」を押してね</div></div>`;
 document.body.appendChild(d);
 d.querySelectorAll('#hdShipEquipCheckShip,#hdShipEquipCheckEquip,#hdShipEquipCheckStar,#hdShipEquipCheckOwnedOnly').forEach(el=>el.addEventListener('change',hdShipDbRenderEquipChecker));
 return d;
}
function hdShipDbOpenEquipChecker(ref){
 const d=hdShipDbEnsureEquipChecker(),row=typeof ref==='number'||/^\d+$/.test(String(ref||''))?hdShipDbMasterSnapshot().allShips?.[String(ref)]:hdShipDbMasterRowFor(ref)||hdShipDbMasterRowByName(ref);
 const ship=document.getElementById('hdShipEquipCheckShip');if(ship&&row)ship.value=row.name;
 hdShipDbRenderEquipChecker();if(!d.open)d.showModal();
}
function hdShipDbMasterSuggestedLoadouts(row){
 const types=new Set(hdShipDbMasterAllowedTypes(row)),roles=new Set(hdShipDbMasterRoles(row)),slots=Math.max(1,(row.slots||[]).length),out=[];
 const has=x=>types.has(x),first=(...xs)=>xs.find(has)||'',repeat=(x,n)=>x?Array.from({length:n},()=>x):[];
 const add=(name,gear,note)=>{
  gear=(gear||[]).filter(Boolean).slice(0,slots);
  if(!gear.length)return;
  const key=gear.join('|');if(out.some(x=>x.key===key))return;
  out.push({name,gear,note,key});
 };
 const main=first('大口径主砲','中口径主砲','小口径主砲'),radar=first('大型電探','小型電探');
 if(main)add('昼戦・連撃',[main,main,has('水上偵察機')?'水上偵察機':'',radar],'主砲系を軸にした汎用構成。弾着対応艦は水上偵察機を優先。');
 if(has('艦上戦闘機'))add('制空優先',[...repeat('艦上戦闘機',2),has('艦上攻撃機')?'艦上攻撃機':'',has('艦上偵察機')?'艦上偵察機':''],'制空を取りつつ航空攻撃も残す基本案。搭載数の大きいスロットを優先。');
 if(has('艦上攻撃機')||has('艦上爆撃機'))add('航空火力',[has('艦上攻撃機')?'艦上攻撃機':'',has('艦上爆撃機')?'艦上爆撃機':'',has('艦上戦闘機')?'艦上戦闘機':'',has('艦上偵察機')?'艦上偵察機':''],'攻撃機中心の汎用案。実戦では海域の必要制空値に合わせて艦戦数を調整。');
 if(has('水上戦闘機')||has('水上爆撃機'))add('水上機運用',[has('水上戦闘機')?'水上戦闘機':'',has('水上爆撃機')?'水上爆撃機':'',has('水上偵察機')?'水上偵察機':'',main],'制空補助・弾着・航空火力を兼ねる水上機運用案。');
 if(has('ソナー')&&has('爆雷'))add('対潜',['ソナー','爆雷',main||radar,has('大型ソナー')?'大型ソナー':''],'対潜値と先制対潜条件を意識した基本案。艦のLv・素対潜も確認してね。');
 if(has('魚雷'))add(roles.has('高運')?'夜戦CI':'雷撃・夜戦',['魚雷','魚雷',radar||main,roles.has('高運')?'魚雷':''],'魚雷カットイン/雷撃寄りの案。運が低い艦は連撃構成も候補。');
 if(has('潜水艦魚雷'))add('潜水艦魚雷CI',repeat('潜水艦魚雷',slots),'潜水艦の夜戦カットインを意識した基本案。');
 if(has('上陸用舟艇')||has('特型内火艇')||has('対地装備'))add('輸送・対地',[has('上陸用舟艇')?'上陸用舟艇':'',has('特型内火艇')?'特型内火艇':'',has('対地装備')?'対地装備':'',main||radar],'輸送・対地を優先する案。敵編成やTP条件に合わせて入れ替え。');
 if(main&&has('対空機銃'))add('対空寄り',[main,main,radar,'対空機銃'],'通常火力を保ちつつ対空装備を足す汎用案。');
 if(!out.length)add('汎用',Array.from(types).slice(0,slots),'公式マスターで装備可能なカテゴリから組んだ入口用の構成。');
 return out.slice(0,4).map(({key,...x})=>x);
}
function hdShipDbMasterOwnedStacks(){
 let rows=[];try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');rows=Array.isArray(x)?x:[]}catch{}
 const cat=hdShipDbEquipCatalog(),byName=new Map(cat.map(x=>[hdShipDbEquipNorm(x.name),x])),m=new Map();
 for(const row of rows){
  const name=String(row.name||'').trim(),norm=hdShipDbEquipNorm(name),count=Math.max(0,Number(row.count)||0),star=Math.max(0,Math.min(10,Number(row.star)||0));
  if(!norm||!count)continue;
  const key=norm+'|'+star,item=byName.get(norm)||{name,category:row.category||'',stats:{},tags:[],role:''},cur=m.get(key)||{key,norm,name,count:0,star,item};
  cur.count+=count;m.set(key,cur);
 }
 return [...m.values()].sort((a,b)=>b.star-a.star||a.name.localeCompare(b.name,'ja'));
}
function hdShipDbMasterOwnedTotal(stacks,norm){return stacks.filter(x=>x.norm===norm).reduce((s,x)=>s+x.count,0)}
function hdShipDbMasterWantedMatch(meta,wanted){
 const type=String(meta?.typeName||''),w=String(wanted||'');
 if(!type||!w)return false;
 if(type===w)return true;
 if(w==='小型電探')return /小型.*電探|小型電探/.test(type);
 if(w==='大型電探')return /大型.*電探|大型電探/.test(type);
 if(w==='爆雷')return /爆雷/.test(type);
 if(w==='ソナー')return /ソナー/.test(type);
 return false;
}
function hdShipDbMasterOwnedPickSlot(normal,free,wanted){
 let slots=(normal?.allowedSlots||[]).filter(x=>free.has(x.index));if(!slots.length)return null;
 const w=String(wanted||'');
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|水上戦闘機|水上爆撃機|噴式/.test(w))slots.sort((a,b)=>b.cap-a.cap||a.index-b.index);
 else if(/偵察機/.test(w))slots.sort((a,b)=>a.cap-b.cap||b.index-a.index);
 else slots.sort((a,b)=>a.index-b.index);
 return slots[0]||null;
}
function hdShipDbMasterResolveOwnedPlan(row,plan){
 const stacks=hdShipDbMasterOwnedStacks(),remaining=new Map(stacks.map(x=>[x.key,x.count])),free=new Set((row.slots||[]).map((_,i)=>i)),slots=[];
 for(const wanted of (plan?.gear||[])){
  const candidates=[];
  for(const stack of stacks){
   if((remaining.get(stack.key)||0)<=0)continue;
   const meta=hdShipDbMasterEquipmentMeta(stack.name);if(!hdShipDbMasterWantedMatch(meta,wanted))continue;
   const normal=hdShipDbMasterNormalCheck(row,stack.name);if(!normal.allowed)continue;
   const pick=hdShipDbMasterOwnedPickSlot(normal,free,wanted);if(!pick)continue;
   const score=(typeof hdShipDbEquipPower==='function'?hdShipDbEquipPower(stack.item,wanted):0)+stack.star*1.35+(Number(stack.item?.stats?.命中)||0)*.2;
   candidates.push({stack,normal,pick,score});
  }
  candidates.sort((a,b)=>b.score-a.score||b.stack.star-a.stack.star||a.stack.name.localeCompare(b.stack.name,'ja'));
  const best=candidates[0];
  if(best){
   remaining.set(best.stack.key,(remaining.get(best.stack.key)||0)-1);free.delete(best.pick.index);
   slots.push({wanted,found:true,name:best.stack.name,star:best.stack.star,slotIndex:best.pick.index,capacity:best.pick.cap,ownedTotal:hdShipDbMasterOwnedTotal(stacks,best.stack.norm)});
  }else slots.push({wanted,found:false,name:'',star:0,slotIndex:null,capacity:null,ownedTotal:0});
 }
 return {slots,filled:slots.filter(x=>x.found).length,total:slots.length,inventoryCount:stacks.reduce((s,x)=>s+x.count,0),freeSlots:[...free]};
}
function hdShipDbMasterOwnedPlanHtml(row,plan){
 const r=hdShipDbMasterResolveOwnedPlan(row,plan),procure=`<button type="button" class="primary small hd-master-procure" data-hd-master-procure="${row.id}" data-hd-master-plan="${hdShipDbEsc(plan?.name||'')}">不足を調達リストへ</button>`;
 if(!r.inventoryCount)return `<div class="hd-master-owned-plan empty"><b>手持ち装備</b><span>装備台帳が空。登録すると実物装備へ自動変換するよ。</span>${procure}</div>`;
 const cls=r.filled===r.total?'complete':r.filled?'partial':'missing';
 const rows=[...r.slots].sort((a,b)=>(a.slotIndex??99)-(b.slotIndex??99));
 return `<div class="hd-master-owned-plan ${cls}"><div class="hd-master-owned-head"><b>手持ちで組む</b><span>${r.filled}/${r.total}枠</span></div><div class="hd-master-owned-items">${rows.map(x=>x.found?`<span class="owned"><i>✓</i><b>${hdShipDbEsc(x.name)}${x.star?` ★${x.star}`:''}</b><small>第${x.slotIndex+1}スロ・${x.capacity}機｜所持${x.ownedTotal}</small></span>`:`<span class="missing"><i>!</i><b>不足: ${hdShipDbEsc(x.wanted)}</b><small>装備台帳に候補なし</small><button type="button" class="ghost small" data-hd-master-acquire="${row.id}" data-hd-master-wanted="${hdShipDbEsc(x.wanted)}">この艦に積める入手候補</button></span>`).join('')}</div>${r.filled<r.total?procure:''}</div>`;
}
function hdShipDbMasterSuggestedHtml(row){
 const plans=hdShipDbMasterSuggestedLoadouts(row);if(!plans.length)return '';
 return `<details class="hd-shipdb-master-equip hd-shipdb-master-suggest"><summary>汎用おすすめ装備 ${plans.length}案</summary><div class="hd-shipdb-master-suggest-list">${plans.map(p=>`<div><b>${hdShipDbEsc(p.name)}</b><div class="hd-shipdb-roles">${p.gear.map(g=>`<span>${hdShipDbEsc(g)}</span>`).join('')}</div><small>${hdShipDbEsc(p.note)}</small>${hdShipDbMasterOwnedPlanHtml(row,p)}</div>`).join('')}</div><p>公式マスターのカテゴリ案を、装備台帳の所持数・改修★・装備可否・スロット位置制限まで見て実物装備へ変換。足りない枠は不足表示するよ。</p></details>`;
}
function hdShipDbMasterNext(row){return hdShipDbMasterSnapshot().allShips?.[String(row.afterId)]?.name||''}
function hdShipDbMasterOwned(row){
 const rows=hdShipDbRoster().filter(x=>String(x.name||'').trim()===row.name);
 return rows.sort((a,b)=>(Number(b.level)||0)-(Number(a.level)||0))[0]||null;
}
function hdShipDbMasterMatchesType(row,type){
 if(type==='すべて')return true;
 if(type==='高速戦艦')return row.type==='戦艦'&&Number(row.speed)>=10;
 if(type==='航空戦艦')return row.type==='航空戦艦';
 if(type==='装甲空母')return row.type==='装甲空母';
 return row.type===type;
}
let hdShipDbAcquisitionIndex=null;
function hdShipDbAcquisitionRows(name){
 if(!hdShipDbAcquisitionIndex&&typeof hdDropAllTargets==='function')hdShipDbAcquisitionIndex=new Map(hdDropAllTargets().map(row=>[row.ship,row]));
 const ship=String(name||'').trim(),base=ship.split('改')[0],drop=hdShipDbAcquisitionIndex?.get(ship)||hdShipDbAcquisitionIndex?.get(base)||null;
 const recipes=typeof HD_CONSTRUCTION_RECIPES!=='undefined'?HD_CONSTRUCTION_RECIPES.filter(recipe=>recipe.target.includes(ship)||recipe.target.includes(base)):[];
 return {ship,base,drop,recipes};
}
function hdShipDbAcquisitionMatches(name,query){
 const {drop,recipes}=hdShipDbAcquisitionRows(name);
 return !!drop?.locations.some(x=>`${x.map} ${x.node}`.toLowerCase().includes(query))||recipes.some(x=>`${x.group} ${x.type==='large'?'大型建造':'通常建造'}`.toLowerCase().includes(query));
}
function hdShipDbAcquisitionHtml(name){
 const {ship,base,drop,recipes}=hdShipDbAcquisitionRows(name),locations=drop?.locations||[],wiki=`https://wikiwiki.jp/kancolle/${encodeURIComponent(base||ship)}`;
 const dropHtml=locations.length?`<div><b>ドロップ海域</b><ul>${locations.slice(0,6).map(x=>`<li>${hdShipDbEsc(x.map)} ${hdShipDbEsc(x.node)}・${hdShipDbEsc(x.rank||'S中心')}</li>`).join('')}</ul>${locations.length>6?`<small>ほか ${locations.length-6} 件</small>`:''}<button type="button" class="ghost small" data-hd-shipdb-acquire-drop="${hdShipDbEsc(drop.ship)}">全候補と条件を見る</button></div>`:'';
 const buildHtml=recipes.length?`<div><b>建造</b><ul>${recipes.slice(0,3).map(x=>`<li>${x.type==='large'?'大型':'通常'}・${hdShipDbEsc(x.group)}（燃${Number(x.fuel)}/弾${Number(x.ammo)}/鋼${Number(x.steel)}/ボ${Number(x.bauxite)}）</li>`).join('')}</ul><button type="button" class="ghost small" data-hd-shipdb-acquire-build="${hdShipDbEsc(base)}" data-hd-shipdb-build-mode="${recipes[0].type}">建造レシピを見る</button></div>`:'';
 return `<details class="hd-shipdb-acquisition"><summary>入手方法${locations.length||recipes.length?`・ドロップ${locations.length}件 / 建造${recipes.length}件`:''}</summary>${dropHtml}${buildHtml}${!dropHtml&&!buildHtml?'<p>収録済みの通常海域ドロップ・建造レシピには、この艦の候補がないよ。</p>':''}${ship!==base?`<p>改装後の形態は ${hdShipDbEsc(base)} を入手し、改装して育てよう。</p>`:''}<small>海域情報 ${hdShipDbEsc(drop?.checked||'未収録')}。限定ドロップと建造条件は変わるので最新情報を確認してね。</small><a class="guide-link" href="${wiki}" target="_blank" rel="noopener">攻略Wikiで最新情報 ↗</a></details>`;
}
function hdShipDbMasterCardHtml(row){
 const next=hdShipDbMasterNext(row),owned=hdShipDbMasterOwned(row),types=hdShipDbMasterAllowedTypes(row),showTypes=types.slice(0,12),rest=Math.max(0,types.length-showTypes.length),s=row.stats||{},image=typeof hdShipImageCardHtml==='function'?hdShipImageCardHtml(row):'';
 const remodel=next&&row.afterLv?`Lv.${row.afterLv} → ${next}`:'改装先なし / 最終形態',peekKey='master:'+row.id,peek=hdShipDbPeekKey===peekKey?' hd-peek':'';
 return `<article class="hd-shipdb-card hd-shipdb-master-card${peek}" data-hd-shipdb-peek-key="${hdShipDbEsc(peekKey)}"><div class="hd-shipdb-head"><div><strong>${hdShipDbEsc(row.name)}</strong><span>${hdShipDbEsc(row.type)}・${hdShipDbMasterSpeed(row.speed)}・${hdShipDbMasterRange(row.range)}</span></div><div class="hd-shipdb-master-badge"><b>MASTER</b><small>ID ${row.id}</small></div></div>${image}<div class="hd-shipdb-path">${hdShipDbEsc(remodel)}</div><div class="hd-shipdb-master-mini"><span>耐久 <b>${s.hp||0}</b></span><span>火力上限 <b>${s.fire||0}</b></span><span>雷装上限 <b>${s.torp||0}</b></span><span>対空上限 <b>${s.aa||0}</b></span><span>装甲上限 <b>${s.armor||0}</b></span><span>運上限 <b>${s.luck||0}</b></span></div><div class="hd-shipdb-master-slots">${(row.slots||[]).map((n,i)=>`<span><i>第${i+1}</i><b>${n}</b><small>機</small></span>`).join('')||'<span><b>通常スロットなし</b></span>'}</div><div class="hd-shipdb-substats"><span>燃料 <b>${row.fuel||0}</b></span><span>弾薬 <b>${row.ammo||0}</b></span><span>艦種ID <b>${row.stype}</b></span>${owned?`<span>台帳 <b>Lv.${Number(owned.level)||0}</b></span>`:''}</div><details class="hd-shipdb-master-equip"><summary>公式装備カテゴリ ${types.length}種</summary><div class="hd-shipdb-roles">${showTypes.map(x=>`<span>${hdShipDbEsc(x)}</span>`).join('')}${rest?`<span>ほか${rest}種</span>`:''}</div></details>${hdShipDbMasterSuggestedHtml(row)}<p>api_start2自動同期の公式マスター参照。公式マスターだけの艦形態でも、艦種・役割・装備可能カテゴリから汎用おすすめ構成を表示。個別装備名までの詳細チューニングは詳細攻略DB収録艦を優先してね。</p>${hdShipDbAcquisitionHtml(row.name)}<div class="hd-shipdb-actions"><button class="primary small" type="button" data-hd-shipmaster-add="${row.id}">台帳へ追加</button><button class="ghost small" type="button" data-hd-ship-equip-check-id="${row.id}">装備可否</button><a class="guide-link" href="https://wikiwiki.jp/kancolle/${encodeURIComponent(row.name)}" target="_blank" rel="noopener">Wiki ↗</a></div></article>`;
}

const HD_SHIP_DB_VIEW_KEY='harbordesk-session-shipdb-view-v1';
function hdShipDbViewLoad(){try{return JSON.parse(sessionStorage.getItem(HD_SHIP_DB_VIEW_KEY)||'{}')||{}}catch{return {}}}
function hdShipDbViewSave(patch={}){const next={...hdShipDbViewLoad(),...patch};try{sessionStorage.setItem(HD_SHIP_DB_VIEW_KEY,JSON.stringify(next))}catch{}return next}
let hdShipDbIncludeMaster=true;
let hdShipDbType='すべて';
let hdShipDbMissingOnly=false;
let hdShipDbImageFilter='all';
let hdShipDbRenderTimer=0;
let hdShipDbPeekKey=String(hdShipDbViewLoad().peekKey||'');
function hdShipDbImageMatches(ref){
 if(hdShipDbImageFilter==='all')return true;
 const has=typeof hdShipImageHasLocalSync==='function'&&hdShipImageHasLocalSync(ref);
 return hdShipDbImageFilter==='registered'?has:!has;
}
async function hdShipDbUpdateImageCoverage(){
 const el=document.getElementById('hdShipDbImageCoverage');if(!el)return;
 if(typeof hdShipImageCoverage!=='function'){el.textContent='画像機能未読込';return}
 const c=await hdShipImageCoverage();el.textContent=`画像 ${c.local}/${c.total}・未登録 ${c.missing}`;
}

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
function hdShipDbScheduleRender(delay=90){clearTimeout(hdShipDbRenderTimer);hdShipDbRenderTimer=setTimeout(hdRenderShipDatabase,Math.max(0,Number(delay)||0))}
function hdShipDbDetailStateKind(details){
 if(details?.classList?.contains('hd-shipdb-master-suggest'))return 'master-suggest';
 if(details?.classList?.contains('hd-shipdb-master-equip'))return 'master-equip';
 if(details?.classList?.contains('hd-shipdb-acquisition'))return 'acquisition';
 if(details?.classList?.contains('hd-shipdb-detail'))return 'detail';
 return '';
}
function hdShipDbOpenDetailsSnapshot(list){
 return [...(list?.querySelectorAll?.('details[open]')||[])].map(details=>{
  const card=details.closest?.('[data-hd-shipdb-peek-key]'),cardKey=String(card?.dataset?.hdShipdbPeekKey||''),kind=hdShipDbDetailStateKind(details);
  return cardKey&&kind?{cardKey,kind}:null;
 }).filter(Boolean);
}
function hdShipDbRestoreOpenDetails(list,rows){
 for(const row of rows||[]){
  const card=[...(list?.querySelectorAll?.('[data-hd-shipdb-peek-key]')||[])].find(x=>String(x.dataset?.hdShipdbPeekKey||'')===String(row?.cardKey||''));
  if(!card)continue;
  const selector=row.kind==='master-suggest'?'details.hd-shipdb-master-suggest'
   :row.kind==='master-equip'?'details.hd-shipdb-master-equip:not(.hd-shipdb-master-suggest)'
   :row.kind==='acquisition'?'details.hd-shipdb-acquisition'
   :row.kind==='detail'?'details.hd-shipdb-detail':'';
  const details=selector?card.querySelector(selector):null;if(details)details.open=true;
 }
}
function hdRenderShipDatabase(){
 const list=document.getElementById('hdShipDbList');if(!list)return;
 const openDetails=hdShipDbOpenDetailsSnapshot(list);
 const q=(document.getElementById('hdShipDbSearch')?.value||'').trim().toLowerCase();
 let rows=HD_SHIP_DATABASE.filter(x=>(hdShipDbType==='すべて'||x.type===hdShipDbType)&&(!q||`${x.base} ${x.final} ${x.type} ${x.roles.join(' ')} ${x.note} ${x.path} ${(HD_SHIP_LOADOUTS[x.final]||[]).flatMap(y=>[y.name,...y.gear,y.memo]).join(' ')}`.toLowerCase().includes(q)||hdShipDbAcquisitionMatches(x.base,q)));
 if(hdShipDbMissingOnly)rows=rows.filter(x=>!hdShipDbOwned(x));
 rows=rows.filter(x=>hdShipDbImageMatches(x.final));
 const detailedHtml=rows.map(x=>{const s=hdShipDbStatus(x),image=typeof hdShipImageCardHtml==='function'?hdShipImageCardHtml(x.final):'',peekKey='detail:'+x.final,peek=hdShipDbPeekKey===peekKey?' hd-peek':'';return `<article class="hd-shipdb-card${peek}" data-hd-shipdb-peek-key="${hdShipDbEsc(peekKey)}"><div class="hd-shipdb-head"><div><strong>${hdShipDbEsc(x.final)}</strong><span>${hdShipDbEsc(x.type)}・${hdShipDbEsc(x.speed)}</span></div><div class="hd-shipdb-status ${s.cls}"><b>${s.label}</b>${s.detail?`<small>${hdShipDbEsc(s.detail)}</small>`:''}</div></div>${image}<div class="hd-shipdb-path">${hdShipDbEsc(x.path)}</div><div class="hd-shipdb-require"><span>改装条件</span><strong>${hdShipDbEsc(x.requirements)}</strong></div><div class="hd-shipdb-roles">${x.roles.map(r=>`<span>${hdShipDbEsc(r)}</span>`).join('')}</div>${hdShipDbStatsHtml(x)}<p>${hdShipDbEsc(x.note)}</p>${hdShipDbAcquisitionHtml(x.base)}<div class="hd-shipdb-actions"><button class="primary small" type="button" data-hd-shipdb-add="${hdShipDbEsc(x.base)}">台帳へ追加</button><button class="ghost small" type="button" data-hd-ship-equip-check-name="${hdShipDbEsc(x.final)}">装備可否</button><a class="guide-link" href="https://wikiwiki.jp/kancolle/${encodeURIComponent(x.final)}" target="_blank" rel="noopener">Wiki ↗</a></div></article>`}).join('');
 let masterRows=[];
 if((q||hdShipDbImageFilter!=='all')&&hdShipDbIncludeMaster){
  const detailedNames=new Set(HD_SHIP_DATABASE.map(x=>x.final));
  masterRows=hdShipDbMasterRows().filter(x=>!detailedNames.has(x.name)&&hdShipDbMasterMatchesType(x,hdShipDbType)&&(!q||(`${x.name} ${x.type}`.toLowerCase().includes(q))||hdShipDbAcquisitionMatches(x.name,q))&&hdShipDbImageMatches(x));
  if(hdShipDbMissingOnly)masterRows=masterRows.filter(x=>!hdShipDbMasterOwned(x));
  masterRows.sort((a,b)=>(a.sortno||99999)-(b.sortno||99999)||a.id-b.id);
 }
 const shown=masterRows.slice(0,80),masterHtml=shown.length?`<div class="hd-shipdb-master-group"><div class="hd-shipdb-master-group-head"><div><div class="eyebrow">OFFICIAL MASTER</div><strong>公式マスター参照</strong></div><span>${masterRows.length}件${masterRows.length>80?'・先頭80件表示':''}</span></div>${shown.map(hdShipDbMasterCardHtml).join('')}</div>`:'';
 const reset=document.querySelector('[data-hd-shipdb-reset]'),dirty=!!q||hdShipDbType!=='すべて'||hdShipDbMissingOnly||!hdShipDbIncludeMaster||hdShipDbImageFilter!=='all';if(reset){reset.disabled=!dirty;reset.classList.toggle('is-active',dirty)}
 const summary=document.getElementById('hdShipDbActiveFilters'),chips=[];if(q)chips.push('検索: '+q);if(hdShipDbType!=='すべて')chips.push('艦種: '+hdShipDbType);if(hdShipDbMissingOnly)chips.push('未所持');if(!hdShipDbIncludeMaster)chips.push('詳細DBのみ');if(hdShipDbImageFilter!=='all')chips.push(hdShipDbImageFilter==='registered'?'画像登録済み':'画像未登録');
 if(summary){summary.hidden=!chips.length;summary.innerHTML=chips.length?chips.map(x=>`<span>${hdShipDbEsc(x)}</span>`).join('')+'<button type="button" class="ghost small" data-hd-shipdb-reset>クリア</button>':''}
 const count=document.getElementById('hdShipDbCount');if(count)count.textContent=(q||hdShipDbImageFilter!=='all')&&hdShipDbIncludeMaster?`詳細 ${rows.length} / マスター ${masterRows.length}`:`詳細 ${rows.length}隻`;
 list.innerHTML=(detailedHtml||masterHtml)?detailedHtml+masterHtml:'<div class="empty empty-action"><strong>条件に合う艦娘がいないよ</strong><p>検索・艦種・所持・画像条件を一度戻してみて。</p><button type="button" class="ghost small" data-hd-shipdb-empty-reset>条件をクリア</button></div>';
 hdShipDbRestoreOpenDetails(list,openDetails);
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(list);
}
function hdEnsureShipDatabase(){
 if(document.getElementById('shipDatabase'))return;
 const roster=document.getElementById('roster');if(!roster)return;
 const sec=document.createElement('section');sec.id='shipDatabase';sec.className='advanced-section';
 const types=['すべて',...new Set(HD_SHIP_DATABASE.map(x=>x.type))],view=hdShipDbViewLoad();
 hdShipDbType=types.includes(view.type)?view.type:'すべて';
 hdShipDbMissingOnly=!!view.missingOnly;
 hdShipDbIncludeMaster=view.includeMaster!==false;
 hdShipDbImageFilter=['all','registered','missing'].includes(view.imageFilter)?view.imageFilter:'all';
 const masterCount=hdShipDbMasterRows().length;
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">SHIP DATABASE</div><h2>艦娘データベース・改装計画</h2></div><span id="hdShipDbCount" class="muted"></span></div><div class="hd-shipdb-note">詳細攻略DB ${HD_SHIP_DATABASE.length}隻＋公式マスター参照 ${masterCount}形態。詳細DBはLv99最大値・育成・用途別装備まで対応し、公式マスターはapi_start2自動同期で全形態の艦種・改装・スロット・搭載・装備可能カテゴリを検索できるよ。</div><div class="hd-shipdb-search-row"><input id="hdShipDbSearch" type="search" placeholder="艦名・艦種・ドロップ海域・建造で検索"><button class="ghost small" type="button" data-hd-shipdb-compact>コンパクト</button></div><div class="hd-shipdb-toolbar"><label><input id="hdShipDbMissingOnly" type="checkbox"> 未所持だけ</label><label><input id="hdShipDbIncludeMaster" type="checkbox" checked> 全艦マスターも検索</label><button class="ghost small" type="button" data-hd-shipdb-reset>条件クリア</button><button class="ghost small" type="button" data-hd-ship-image-settings>艦娘画像</button><button class="ghost small" type="button" data-hd-open-equip-check>装備可否チェッカー</button></div><div id="hdShipDbActiveFilters" class="hd-active-filters" hidden></div><div class="hd-shipdb-image-filter-bar"><span id="hdShipDbImageCoverage" class="muted">画像確認中…</span><div><button class="ghost small active" type="button" data-hd-shipdb-image-filter="all">画像すべて</button><button class="ghost small" type="button" data-hd-shipdb-image-filter="registered">登録済み</button><button class="ghost small" type="button" data-hd-shipdb-image-filter="missing">未登録</button></div></div><div class="hd-shipdb-filters">${types.map((t,i)=>`<button class="ghost small${i===0?' active':''}" type="button" data-hd-shipdb-filter="${hdShipDbEsc(t)}">${hdShipDbEsc(t)}</button>`).join('')}</div><div id="hdShipDbCompactHint" class="hd-compact-hint" hidden>カードをタップすると、その1件だけ詳細を開けるよ</div><div id="hdShipDbList" class="hd-shipdb-list"></div><div><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E6%94%B9%E9%80%A0/%E8%89%A6%E7%A8%AE%E5%88%A5%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener">攻略Wiki 改造一覧で最新情報 ↗</a></div>`;
 roster.insertAdjacentElement('beforebegin',sec);
 const search=document.getElementById('hdShipDbSearch'),missing=document.getElementById('hdShipDbMissingOnly'),include=document.getElementById('hdShipDbIncludeMaster');
 if(search){search.value=String(view.query||'');search.addEventListener('input',()=>{hdShipDbViewSave({query:search.value});hdShipDbScheduleRender()})}
 if(missing){missing.checked=hdShipDbMissingOnly;missing.addEventListener('change',e=>{hdShipDbMissingOnly=e.target.checked;hdShipDbViewSave({missingOnly:hdShipDbMissingOnly});hdRenderShipDatabase()})}
 if(include){include.checked=hdShipDbIncludeMaster;include.addEventListener('change',e=>{hdShipDbIncludeMaster=e.target.checked;hdShipDbViewSave({includeMaster:hdShipDbIncludeMaster});hdRenderShipDatabase()})}
 document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b.dataset.hdShipdbFilter===hdShipDbType));
 document.querySelectorAll('[data-hd-shipdb-image-filter]').forEach(b=>b.classList.toggle('active',(b.dataset.hdShipdbImageFilter||'all')===hdShipDbImageFilter));
 const compact=view.compact==null?!!window.matchMedia?.('(max-width:680px)')?.matches:!!view.compact,compactBtn=document.querySelector('[data-hd-shipdb-compact]'),list=document.getElementById('hdShipDbList');
 list?.classList.toggle('hd-compact',compact);if(compactBtn)compactBtn.textContent=compact?'詳細表示':'コンパクト';const hint=document.getElementById('hdShipDbCompactHint');if(hint)hint.hidden=!compact;
 hdRenderShipDatabase();hdShipDbUpdateImageCoverage();
}
function hdShipDbAddMaster(id){
 const item=hdShipDbMasterSnapshot().allShips?.[String(id)];if(!item)return;
 if(typeof openShipRosterDialog==='function')openShipRosterDialog();
 setTimeout(()=>{
  const name=document.getElementById('rosterName'),remodel=document.getElementById('rosterRemodel'),memo=document.getElementById('rosterMemo'),next=hdShipDbMasterNext(item);
  if(name)name.value=item.name;if(remodel)remodel.value='育成中';if(memo)memo.value=`公式マスターID ${item.id} / ${item.type}${next&&item.afterLv?` / Lv.${item.afterLv}→${next}`:''}`;
 },0);
}
function hdShipDbAdd(base){
 const item=HD_SHIP_DATABASE.find(x=>x.base===base);if(!item)return;
 if(typeof openShipRosterDialog==='function')openShipRosterDialog();
 setTimeout(()=>{
  const name=document.getElementById('rosterName'),remodel=document.getElementById('rosterRemodel'),memo=document.getElementById('rosterMemo');
  if(name)name.value=item.base;if(remodel)remodel.value='育成中';if(memo) memo.value=`目標: ${item.final} / ${item.requirements}`;
 },0);
}
document.addEventListener('click',async e=>{
 if(e.target.closest?.('[data-hd-ship-owned-refresh]')){const card=e.target.closest('.hd-map-ship-candidate');if(card)hdShipDbRefreshOwnedFits(card);return}
 const masterProcure=e.target.closest?.('[data-hd-master-procure]');
 if(masterProcure&&typeof hdPLAddMasterLoadout!=='function'){
  e.stopImmediatePropagation();
  masterProcure.setAttribute('aria-busy','true');await hdShipDbEnsureCurrentAssets();masterProcure.removeAttribute('aria-busy');
  const map=masterProcure.dataset.hdMasterMap||(typeof selectedMap!=='undefined'?selectedMap:'');
  if(typeof hdPLAddMasterLoadout==='function'&&hdPLAddMasterLoadout(masterProcure.dataset.hdMasterProcure,masterProcure.dataset.hdMasterPlan||'',map)){if(typeof hdPLOpenList==='function')hdPLOpenList();return}
  window.hdToast?.('調達リストを読み込めなかったよ。アプリ更新を試してね','warn');return;
 }
 const masterAcquire=e.target.closest?.('[data-hd-master-acquire]');
 if(masterAcquire&&typeof hdAGOpenMaster!=='function'){
  e.stopImmediatePropagation();
  masterAcquire.setAttribute('aria-busy','true');await hdShipDbEnsureCurrentAssets();masterAcquire.removeAttribute('aria-busy');
  if(typeof hdAGOpenMaster==='function'){hdAGOpenMaster(masterAcquire.dataset.hdMasterAcquire,masterAcquire.dataset.hdMasterWanted||'');return}
  window.hdToast?.('入手候補を読み込めなかったよ。アプリ更新を試してね','warn');return;
 }
 const procure=e.target.closest?.('[data-hd-ship-procure]');
 if(procure){
  const map=typeof selectedMap!=='undefined'?selectedMap:'';
  if(typeof hdPLAddShipLoadout!=='function'){
   procure.setAttribute('aria-busy','true');await hdShipDbEnsureCurrentAssets();procure.removeAttribute('aria-busy');
  }
  if(typeof hdPLAddShipLoadout==='function'&&hdPLAddShipLoadout(map,procure.dataset.hdShipProcure,procure.dataset.hdLoadoutName||'')){if(typeof hdPLOpenList==='function')hdPLOpenList();return}
  window.hdToast?.('調達リストを読み込めなかったよ。アプリ更新を試してね','warn');return;
 }
 const acquire=e.target.closest?.('[data-hd-ship-acquire]');
 if(acquire){
  if(!hdShipDbOpenAcquire(acquire.dataset.hdShipAcquire)){
   acquire.setAttribute('aria-busy','true');await hdShipDbEnsureCurrentAssets();acquire.removeAttribute('aria-busy');
   if(!hdShipDbOpenAcquire(acquire.dataset.hdShipAcquire))window.hdToast?.('入手方法を読み込めなかったよ。アプリ更新を試してね','warn');
  }
  return;
 }
 if(e.target.closest?.('[data-hd-ship-equip-ledger]')){
  if(typeof hdOwnedOpenLedger==='function')hdOwnedOpenLedger('');
  else{const target=document.getElementById('equipmentBook');if(target){if(typeof window.hdWSShowElement==='function')window.hdWSShowElement(target,true);else target.scrollIntoView({behavior:'smooth',block:'start'})}}
  return;
 }
});
window.addEventListener('hd:modules-ready',()=>setTimeout(()=>hdShipDbRefreshOwnedFits(document),0));
window.addEventListener('storage',e=>{if(e.key==='harbordesk-equipment-v1')hdShipDbRefreshOwnedFits(document)});
window.addEventListener('hd:equipment-changed',()=>hdShipDbRefreshOwnedFits(document));
window.addEventListener('hd:ship-images-changed',()=>{hdShipDbUpdateImageCoverage();if(hdShipDbImageFilter!=='all')hdRenderShipDatabase();else if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(document.getElementById('hdShipDbList')||document)});
window.addEventListener('hd:ship-images-ready',()=>{hdShipDbUpdateImageCoverage();if(hdShipDbImageFilter!=='all')hdRenderShipDatabase()});
setTimeout(()=>hdShipDbRefreshOwnedFits(document),900);
document.addEventListener('click',e=>{const jump=e.target.closest?.('[data-hd-shipdb-jump]');if(jump){hdShipDbJumpTo(jump.dataset.hdShipdbJump);return}});
document.addEventListener('click',e=>{
 const peekCard=e.target.closest?.('.hd-shipdb-card,.hd-shipdb-master-card'),peekList=document.getElementById('hdShipDbList');
 if(peekCard&&peekList?.classList.contains('hd-compact')&&!e.target.closest('button,a,input,label,summary,details,select,textarea')){
  const open=!peekCard.classList.contains('hd-peek'),key=String(peekCard.dataset.hdShipdbPeekKey||'');
  peekList.querySelectorAll('.hd-peek').forEach(x=>x.classList.remove('hd-peek'));
  hdShipDbPeekKey=open?key:'';
  hdShipDbViewSave({peekKey:hdShipDbPeekKey});
  if(open)peekCard.classList.add('hd-peek');
  return;
 }
 const dropLink=e.target.closest?.('[data-hd-shipdb-acquire-drop]');if(dropLink){const query=dropLink.dataset.hdShipdbAcquireDrop||'';if(typeof window.hdDropOpenSearch==='function'){window.hdDropOpenSearch(query,true);return}hdEnsureDropDb?.();const input=document.getElementById('hdDropSearch');if(input){input.value=query;hdRenderDropDb()}window.hdWSShowElement?.('dropHuntingDb',true);return}
 const buildLink=e.target.closest?.('[data-hd-shipdb-acquire-build]');if(buildLink){const query=buildLink.dataset.hdShipdbAcquireBuild||'',mode=buildLink.dataset.hdShipdbBuildMode==='large'?'large':'normal';if(typeof window.hdConstructionOpenSearch==='function'){window.hdConstructionOpenSearch(query,mode);return}hdEnsureConstructionSection?.();if(typeof hdConstructionMode!=='undefined')hdConstructionMode=mode;const input=document.getElementById('hdConstructionSearch');if(input)input.value=query;renderConstructionDb?.();window.hdWSShowElement?.('constructionDb',true);return}
 if(e.target.closest?.('[data-hd-shipdb-empty-reset]')){document.querySelector('[data-hd-shipdb-reset]')?.click();return}
 const reset=e.target.closest?.('[data-hd-shipdb-reset]');if(reset){
  const search=document.getElementById('hdShipDbSearch'),missing=document.getElementById('hdShipDbMissingOnly'),include=document.getElementById('hdShipDbIncludeMaster'),list=document.getElementById('hdShipDbList');
  if(search)search.value='';if(missing)missing.checked=false;if(include)include.checked=true;
  hdShipDbType='すべて';hdShipDbMissingOnly=false;hdShipDbIncludeMaster=true;hdShipDbImageFilter='all';
  document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b.dataset.hdShipdbFilter==='すべて'));
  document.querySelectorAll('[data-hd-shipdb-image-filter]').forEach(b=>b.classList.toggle('active',(b.dataset.hdShipdbImageFilter||'all')==='all'));
  hdShipDbViewSave({query:'',type:'すべて',missingOnly:false,includeMaster:true,imageFilter:'all'});
  hdRenderShipDatabase();return
 }
 const compact=e.target.closest?.('[data-hd-shipdb-compact]');if(compact){const list=document.getElementById('hdShipDbList'),next=!list?.classList.contains('hd-compact');list?.querySelectorAll('.hd-peek').forEach(x=>x.classList.remove('hd-peek'));list?.classList.toggle('hd-compact',next);hdShipDbViewSave({compact:next});compact.textContent=next?'詳細表示':'コンパクト';const hint=document.getElementById('hdShipDbCompactHint');if(hint)hint.hidden=!next;return}
 const imageFilter=e.target.closest?.('[data-hd-shipdb-image-filter]');if(imageFilter){hdShipDbImageFilter=imageFilter.dataset.hdShipdbImageFilter||'all';hdShipDbViewSave({imageFilter:hdShipDbImageFilter});document.querySelectorAll('[data-hd-shipdb-image-filter]').forEach(b=>b.classList.toggle('active',b===imageFilter));hdRenderShipDatabase();return}
 const f=e.target.closest?.('[data-hd-shipdb-filter]');if(f){hdShipDbType=f.dataset.hdShipdbFilter;hdShipDbViewSave({type:hdShipDbType});document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderShipDatabase();return}
 const add=e.target.closest?.('[data-hd-shipdb-add]');if(add){hdShipDbAdd(add.dataset.hdShipdbAdd);return}
 const masterAdd=e.target.closest?.('[data-hd-shipmaster-add]');if(masterAdd){hdShipDbAddMaster(masterAdd.dataset.hdShipmasterAdd);return}
 const checkerId=e.target.closest?.('[data-hd-ship-equip-check-id]');if(checkerId){hdShipDbOpenEquipChecker(checkerId.dataset.hdShipEquipCheckId);return}
 const checkerName=e.target.closest?.('[data-hd-ship-equip-check-name]');if(checkerName){hdShipDbOpenEquipChecker(checkerName.dataset.hdShipEquipCheckName);return}
 if(e.target.closest?.('[data-hd-open-equip-check]')){hdShipDbOpenEquipChecker('');return}
 const reverseShip=e.target.closest?.('[data-hd-equip-check-ship]');if(reverseShip){const row=hdShipDbMasterSnapshot().allShips?.[String(reverseShip.dataset.hdEquipCheckShip)],ship=document.getElementById('hdShipEquipCheckShip');if(row&&ship)ship.value=row.name;hdShipDbRenderEquipChecker();return}
 if(e.target.closest?.('[data-hd-equip-check-run]')){hdShipDbRenderEquipChecker();return}
 if(e.target.closest?.('[data-hd-equip-check-close]')){document.getElementById('hdShipEquipCheckDialog')?.close();return}
});
window.addEventListener('load',()=>setTimeout(hdEnsureShipDatabase,300));setTimeout(hdEnsureShipDatabase,500);
