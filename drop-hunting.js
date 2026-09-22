const HD_DROP_HUNT_KEY='harbordesk-drop-hunts-v1';
const HD_DROP_TARGETS=[
 {ship:'明石',type:'工作艦',locations:[
  {map:'1-5',node:'J ボス',rank:'S',note:'司令部Lv40以上。敵編成によってはドロップしない。2024/10/18以降は2隻目まで報告あり。'},
  {map:'2-5',node:'O ボス',rank:'A/S',note:'未所持向けの特別ドロップが継続。通常のドロップ報告もある。'},
  {map:'3-5',node:'H / Kボス',rank:'S',note:'Hは北方棲姫マス。Kボスでも確認。'},
  {map:'6-2',node:'I / J',rank:'S',note:'道中S勝利で確認。'}],source:'攻略Wiki 明石 / 各海域ページ',checked:'2026-09-17'},
 {ship:'大鯨',type:'潜水母艦',locations:[
  {map:'2-5',node:'O ボス',rank:'A/S',note:'ボスマスで確認。'},
  {map:'6-5',node:'E',rank:'S',note:'道中Eマスで確認。'}],source:'攻略Wiki 2-5 / 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'大淀',type:'軽巡洋艦',locations:[
  {map:'1-6',node:'B / J',rank:'S',note:'非常に低確率。Bは強い敵編成での報告が多い。'}],source:'攻略Wiki 1-6',checked:'2026-09-17'},
 {ship:'朝雲',type:'駆逐艦',locations:[
  {map:'1-6',node:'B / J',rank:'S',note:'道中のためドロップ自体が発生しない場合あり。'}],source:'攻略Wiki 1-6',checked:'2026-09-17'},
 {ship:'天津風',type:'駆逐艦',locations:[
  {map:'3-5',node:'K ボス',rank:'S',note:'ゲージ強化後を含めボスSで確認。'},
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 3-5 / 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'風雲',type:'駆逐艦',locations:[
  {map:'3-5',node:'K ボス',rank:'S',note:'ボスSで確認。'}],source:'攻略Wiki 3-5',checked:'2026-09-17'},
 {ship:'まるゆ',type:'潜水艦',locations:[
  {map:'3-5',node:'H',rank:'S',note:'北方棲姫マスS勝利で確認。'}],source:'攻略Wiki 3-5',checked:'2026-09-17'},
 {ship:'雲龍',type:'正規空母',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'通常海域では重要な入手機会。ボスS勝利が必要。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'阿賀野',type:'軽巡洋艦',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'2025/10/29以降、春雨と入れ替わる形でボスドロップ確認。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'能代',type:'軽巡洋艦',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'ボスSで確認。大型建造でも入手可能。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'鹿島',type:'練習巡洋艦',locations:[
  {map:'6-5',node:'M ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'春雨',type:'駆逐艦',locations:[
  {map:'6-5',node:'M ボス',rank:'S',note:'6-5ボスで確認。6-3では2025/10/29以降ドロップしなくなった。'}],source:'攻略Wiki 6-3 / 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'神威',type:'補給艦',locations:[
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'春日丸',type:'軽空母',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'対馬',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'平戸',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'御蔵',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'日振',type:'海防艦',locations:[
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'大東',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'松輪',type:'海防艦',locations:[
  {map:'7-4',node:'H',rank:'S',note:'Hマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'佐渡',type:'海防艦',locations:[
  {map:'7-4',node:'H',rank:'S',note:'Hマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'}
];

const HD_MAP_DROP_CHECKED='2026-09-18';
const HD_MAP_DROP_DATA={
 '1-1':{nodes:[
  {node:'C ボス',rank:'S中心',ships:'鳳翔、天龍、龍田、多摩、川内、神通、那珂、鹿島、睦月、如月、皐月、文月、長月、菊月、三日月、望月、吹雪、白雪、初雪、深雪、叢雲、磯波、綾波、敷波、朧、曙、漣、潮、暁、響、雷、電、初春、子日、若葉、初霜、白露、時雨、村雨、夕立、五月雨、山風、涼風、朝潮、大潮、満潮、荒潮、霰、霞、陽炎、不知火、黒潮、瑞穂',featured:'鳳翔、鹿島、山風、瑞穂'}
 ]},
 '1-2':{nodes:[
  {node:'E ボス',rank:'S中心',ships:'祥鳳、天龍、龍田、球磨、多摩、北上、木曾、長良、五十鈴、川内、神通、那珂、磯風、迅鯨',featured:'磯風、迅鯨'}
 ],note:'通常駆逐艦も多数ドロップ。'},
 '1-3':{nodes:[
  {node:'J ボス',rank:'S中心',ships:'鳳翔、古鷹、加古、青葉、衣笠、山風、千歳、千代田、瑞穂',featured:'衣笠、山風、瑞穂'}
 ],note:'通常の軽巡・駆逐艦もドロップ。'},
 '1-4':{nodes:[
  {node:'L ボス',rank:'S中心',ships:'龍驤、祥鳳、衣笠、酒匂、巻雲、朝霜、千歳、千代田',featured:'酒匂、巻雲、朝霜'}
 ],note:'通常の重巡・軽巡・駆逐艦もドロップ。'},
 '1-5':{nodes:[
  {node:'J ボス',rank:'S中心',ships:'鳳翔、飛鷹、隼鷹、古鷹、加古、青葉、衣笠、球磨、多摩、長良、五十鈴、名取、由良、川内、神通、那珂、第四号海防艦、第二十二号海防艦、伊168、伊8、伊19、伊58、伊201、伊203、明石',featured:'第四号海防艦、第二十二号海防艦、伊8、伊201、伊203、明石'}
 ],note:'明石は敵編成や所持状況などで条件が変わる場合あり。期間限定ドロップはWiki側でも未反映の場合がある。'},
 '1-6':{nodes:[
  {node:'B / J 主要マス',rank:'S中心',ships:'大淀、朝雲、浦風、磯風、浜風、伊8',featured:'大淀、朝雲、磯風、伊8',kind:'route'}
 ],note:'1-6はボスマスがないため、主要な道中ドロップを表示。'},

 '2-1':{nodes:[
  {node:'H ボス',rank:'S中心',ships:'榛名、霧島、扶桑、山城、鳳翔、龍驤、祥鳳、飛鷹、隼鷹、桃、千歳、千代田',featured:'桃'}
 ],note:'通常の重巡・軽巡・駆逐艦も多数ドロップ。'},
 '2-2':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'金剛、比叡、霧島、扶桑、山城、伊勢、加賀、蒼龍、龍驤、祥鳳、飛鷹、隼鷹、狭霧、天津風、浦風、浜風、夕雲、巻雲',featured:'狭霧、天津風、浦風、夕雲、巻雲'}
 ]},
 '2-3':{nodes:[
  {node:'N ボス',rank:'S中心',ships:'金剛、比叡、榛名、霧島、扶桑、山城、伊勢、日向、赤城、加賀、蒼龍、飛龍、翔鶴、龍驤、祥鳳、飛鷹、隼鷹、Gambier Bay、阿賀野、朝雲、山雲、天津風、秋月、長波、早波、浜波、岸波、能美、伊168、神州丸',featured:'飛龍、翔鶴、Gambier Bay、阿賀野、天津風、秋月、早波、浜波、岸波、能美、神州丸'}
 ]},
 '2-4':{nodes:[
  {node:'P ボス',rank:'S中心',ships:'長門、陸奥、赤城、龍驤、祥鳳、飛鷹、隼鷹、弥生、浦波、山雲、親潮、雪風、浦風、浜風、浜波、大鯨',featured:'長門、陸奥、親潮、浜波、大鯨'}
 ]},
 '2-5':{nodes:[
  {node:'O ボス',rank:'S/A',ships:'長門、陸奥、蒼龍、飛龍、鳳翔、龍驤、祥鳳、瑞鳳、飛鷹、隼鷹、三隈、鈴谷、熊野、鬼怒、阿武隈、能代、弥生、卯月、海風、江風、野分、夕雲、巻雲、伊168、伊19、伊58、大鯨、明石',featured:'長門、陸奥、三隈、能代、海風、江風、野分、大鯨、明石'}
 ]},

 '3-1':{nodes:[
  {node:'G ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、阿武隈、白雲、陽炎、不知火、雪風、千歳、千代田、宗谷、大泊',featured:'陸奥、飛龍、白雲、宗谷、大泊'}
 ]},
 '3-2':{nodes:[
  {node:'L ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、龍驤、祥鳳、飛鷹、隼鷹、長波、島風、千歳、千代田',featured:'陸奥、長波、島風'}
 ]},
 '3-3':{nodes:[
  {node:'M ボス',rank:'S中心',ships:'長門、陸奥、赤城、加賀、蒼龍、飛龍、弥生、山雲、雪風、浜風、舞風、伊168、千歳、千代田',featured:'長門、陸奥、山雲、舞風'}
 ]},
 '3-4':{nodes:[
  {node:'P ボス',rank:'S中心',ships:'長門、陸奥、赤城、加賀、蒼龍、飛龍、卯月、初風、雪風、伊58、大鯨',featured:'長門、陸奥、初風、大鯨'}
 ]},
 '3-5':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'長門、陸奥、赤城、加賀、蒼龍、飛龍、山雲、天津風、谷風、秋雲、風雲、長波、島風、伊168、伊8、伊19、伊58、明石',featured:'天津風、風雲、長波、明石'},
  {node:'H 北方棲姫',rank:'S',ships:'谷風、伊168、伊8、伊19、伊58、まるゆ、明石',featured:'まるゆ、明石',kind:'route'}
 ]},

 '4-1':{nodes:[
  {node:'J ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、鬼怒、阿武隈、夕張、浦波、島風、伊168',featured:'陸奥、夕張、島風'}
 ]},
 '4-2':{nodes:[
  {node:'L ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、瑞鳳、弥生、雪風、浦風、夕雲、伊58',featured:'陸奥、瑞鳳、浦風、夕雲'}
 ]},
 '4-3':{nodes:[
  {node:'N ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、瑞鳳、三隈、鬼怒、阿武隈、夕張、巻雲、島風',featured:'陸奥、瑞鳳、三隈、夕張、巻雲、島風'}
 ]},
 '4-4':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'長門、陸奥、赤城、加賀、翔鶴、瑞鶴、鳳翔、龍驤、祥鳳、瑞鳳、飛鷹、隼鷹、卯月、浜風、夕雲、長波、大鯨',featured:'長門、陸奥、翔鶴、瑞鶴、長波、大鯨'}
 ]},
 '4-5':{nodes:[
  {node:'T ボス',rank:'S中心',ships:'翔鶴、加賀、龍驤、祥鳳、飛鷹、隼鷹、三隈、鈴谷、熊野、野分、舞風、朝霜、早霜、清霜、まるゆ',featured:'翔鶴、三隈、野分、朝霜、早霜、清霜、まるゆ'},
  {node:'K / N / S 主要マス',rank:'S中心',ships:'Z1、Libeccio、伊8',featured:'Z1、Libeccio、伊8',kind:'route'}
 ]},

 '5-1':{nodes:[
  {node:'J ボス',rank:'S中心',ships:'弥生、卯月、浦波、浜風、夕雲、長波、島風、伊58',featured:'卯月、浜風、夕雲、長波、島風'}
 ],note:'通常の戦艦・重巡・軽巡などもドロップ。'},
 '5-2':{nodes:[
  {node:'O ボス',rank:'S中心',ships:'陸奥、赤城、加賀、蒼龍、飛龍、翔鶴、瑞鶴、三隈、夕張、雪風、浜風、秋雲、夕雲、巻雲、伊58、大鯨',featured:'陸奥、翔鶴、瑞鶴、三隈、大鯨'}
 ]},
 '5-3':{nodes:[
  {node:'Q ボス',rank:'S中心',ships:'翔鶴、瑞鶴、鈴谷、弥生、卯月、山雲、浦風、浜風、秋雲、夕雲、長波、伊168、伊58、瑞穂',featured:'翔鶴、瑞鶴、山雲、浦風、長波、瑞穂'}
 ]},
 '5-4':{nodes:[
  {node:'P ボス',rank:'S中心',ships:'陸奥、翔鶴、瑞鶴、瑞鳳、鈴谷、熊野、夕張、阿賀野、有明、雪風、浜風、秋雲、夕雲、巻雲、長波、涼波、伊19、伊58',featured:'翔鶴、瑞鶴、阿賀野、有明、涼波、長波'}
 ]},
 '5-5':{nodes:[
  {node:'S ボス',rank:'S中心',ships:'陸奥、翔鶴、瑞鶴、龍驤、瑞鳳、阿賀野、弥生、卯月、初風、雪風、浜風、舞風、秋雲、夕雲、巻雲、伊168、伊8、伊19、伊58、大鯨',featured:'陸奥、翔鶴、瑞鶴、阿賀野、初風、大鯨'}
 ]},
 '5-6':{nodes:[
  {node:'G 第1ボス',rank:'S中心',ships:'妙高、羽黒、高雄、愛宕、摩耶、鳥海、最上、鈴谷、筑摩、Northampton、長良、川内、夕張、能代、浦波、天霧、有明、夕暮、朝雲、夏雲、早潮、初風、雪風、時津風、玉波、涼波、藤波、早波、宗谷',featured:'Northampton、夕張、能代、有明、夕暮、夏雲、早潮、玉波、涼波、藤波、早波、宗谷'},
  {node:'N 第2ボス',rank:'S中心',ships:'翔鶴、瑞鶴、妙高、羽黒、高雄、愛宕、摩耶、鳥海、最上、鈴谷、筑摩、Northampton、長良、川内、神通、那珂、阿賀野、能代、Helena、卯月、水無月、天霧、初風、浦風、長波、玉波、涼波、藤波、早波、島風、Fletcher、長鯨、宗谷',featured:'翔鶴、瑞鶴、Northampton、阿賀野、能代、Helena、水無月、Fletcher、長鯨、宗谷'},
  {node:'Z 第3ボス',rank:'S中心',ships:'翔鶴、瑞鶴、Saratoga、Hornet、妙高、羽黒、高雄、愛宕、摩耶、鳥海、最上、鈴谷、筑摩、Northampton、長良、川内、神通、那珂、阿賀野、能代、Helena、卯月、水無月、天霧、初風、時津風、浦風、長波、玉波、涼波、藤波、早波、照月、島風、Fletcher、長鯨、宗谷',featured:'Saratoga、Hornet、Northampton、Helena、水無月、照月、Fletcher、長鯨、宗谷'}
 ],note:'G/Nは確定ドロップではない。段階ごとにボスが異なる。'},

 '6-1':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'長門、陸奥、翔鶴、瑞鶴、雪風、巻雲、長波、伊168、伊8、伊19、伊58、まるゆ、大鯨、長鯨',featured:'長門、陸奥、まるゆ、大鯨、長鯨'}
 ]},
 '6-2':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'長門、陸奥、翔鶴、瑞鶴、夕張、矢矧、酒匂、浦波、浜風、夕雲、島風、伊168、伊19、まるゆ',featured:'長門、陸奥、矢矧、酒匂、まるゆ'},
  {node:'I / J 道中',rank:'S',ships:'明石',featured:'明石',kind:'route'}
 ]},
 '6-3':{nodes:[
  {node:'J ボス',rank:'S中心',ships:'翔鶴、瑞鶴、雲龍、阿武隈、夕張、阿賀野、能代、香取、伊168、伊19、伊58',featured:'雲龍、阿賀野、能代、香取'}
 ],note:'春雨は2025/10/29以降、この海域のボスドロップから外れたとされる。'},
 '6-4':{nodes:[
  {node:'N ボス',rank:'S中心',ships:'長門、陸奥、蒼龍、飛龍、弥生、朝雲、山雲、時津風、浦風、谷風、秋雲、夕雲、巻雲、速吸',featured:'長門、陸奥、朝雲、山雲、時津風、速吸'}
 ]},
 '6-5':{nodes:[
  {node:'M ボス',rank:'S中心',ships:'長門、陸奥、赤城、加賀、翔鶴、瑞鶴、鬼怒、阿武隈、夕張、鹿島、春雨、海風、江風、野分、舞風、秋雲、夕雲、巻雲、長波、高波、沖波、朝霜',featured:'長門、陸奥、翔鶴、瑞鶴、鹿島、海風、江風、高波、沖波'},
  {node:'E 道中',rank:'S',ships:'大鯨',featured:'大鯨',kind:'route'}
 ]},

 '7-1':{nodes:[
  {node:'K ボス',rank:'S中心',ships:'金剛、祥鳳、瑞鳳、三隈、鈴谷、熊野、狭霧、嵐、萩風、伊168、伊8、伊19、伊58、千歳、千代田',featured:'瑞鳳、三隈、狭霧、嵐、萩風'},
  {node:'C 主要マス',rank:'S中心',ships:'親潮、伊168、伊8、伊19、伊58、大鯨',featured:'親潮、大鯨',kind:'route'}
 ]},
 '7-2':{nodes:[
  {node:'G 第1ボス',rank:'S中心',ships:'阿武隈、夕張、谷風、秋雲、早波、伊168、伊8、伊19、伊58',featured:'夕張、早波'},
  {node:'M 第2ボス',rank:'S中心',ships:'翔鶴、瑞鶴、水無月、天霧、狭霧、谷風、秋雲、風雲、瑞穂',featured:'翔鶴、瑞鶴、水無月、天霧、狭霧、風雲、瑞穂'}
 ],note:'瑞穂は攻略中のみの報告条件があるため、掘り前に最新Wikiを確認。'},
 '7-3':{nodes:[
  {node:'E 第1ボス',rank:'S中心',ships:'神風、阿賀野、山風、藤波、岸波',featured:'神風、阿賀野、山風、藤波、岸波'},
  {node:'P 第2ボス',rank:'S中心',ships:'Gambier Bay、神風、朝風、山風、藤波、岸波、Luigi Torelli',featured:'Gambier Bay、朝風、Luigi Torelli'}
 ]},
 '7-4':{nodes:[
  {node:'P ボス',rank:'S中心',ships:'瑞鶴、瑞鳳、春日丸、旗風、天津風、対馬、平戸、御蔵、日振、大東、神威',featured:'春日丸、対馬、平戸、御蔵、日振、大東、神威'},
  {node:'H 道中',rank:'S',ships:'旗風、天津風、浦風、松輪、佐渡、日振、神威',featured:'松輪、佐渡、日振、神威',kind:'route'}
 ]},
 '7-5':{nodes:[
  {node:'K 第1ボス',rank:'S中心',ships:'Houston、De Ruyter、Perth、松風、春雨、山風、江風、朝雲、峯雲、初風、雪風、天津風、時津風、瑞穂',featured:'Houston、De Ruyter、Perth、峯雲、瑞穂'},
  {node:'Q 第2ボス',rank:'S中心',ships:'Perth、朝風、春風、旗風、水無月',featured:'Perth、朝風、春風、旗風、水無月'},
  {node:'T 第3ボス',rank:'S中心',ships:'瑞鳳、三隈、鈴谷、熊野、Houston、Perth、朝風、春風、旗風、水無月、神州丸、あきつ丸',featured:'Houston、Perth、神州丸、あきつ丸'}
 ]}
};

const HD_MAP_DROP_VIEW_KEY='harbordesk-map-drop-view-v1';
function hdMapDropNames(v){return Array.isArray(v)?v:String(v||'').split('、').map(x=>x.trim()).filter(Boolean)}
function hdMapDropView(map){
 try{const data=JSON.parse(localStorage.getItem(HD_MAP_DROP_VIEW_KEY)||'{}'),v=data[map]||'all';return ['all','missing','featured'].includes(v)?v:'all'}catch{return 'all'}
}
function hdMapDropSetView(map,view){
 try{const data=JSON.parse(localStorage.getItem(HD_MAP_DROP_VIEW_KEY)||'{}');data[map]=['all','missing','featured'].includes(view)?view:'all';localStorage.setItem(HD_MAP_DROP_VIEW_KEY,JSON.stringify(data))}catch{}
}
function hdMapDropUnique(map){
 const data=HD_MAP_DROP_DATA[map],seen=new Map();
 for(const node of data?.nodes||[]){
  const featured=new Set(hdMapDropNames(node.featured));
  for(const ship of hdMapDropNames(node.ships)){
   if(!seen.has(ship))seen.set(ship,{ship,featured:featured.has(ship),nodes:[node.node]});
   else{const row=seen.get(ship);row.featured=row.featured||featured.has(ship);if(!row.nodes.includes(node.node))row.nodes.push(node.node)}
  }
 }
 return [...seen.values()];
}
function hdMapDropStats(map){
 const rows=hdMapDropUnique(map),owned=rows.filter(x=>hdDropOwned(x.ship)).length,featured=rows.filter(x=>x.featured).length,missing=Math.max(0,rows.length-owned);
 return {total:rows.length,owned,missing,featured,rate:rows.length?Math.round(owned/rows.length*100):0};
}
function hdMapDropShipType(ship){
 const norm=String(ship||'').normalize('NFKC');
 const curated=HD_DROP_TARGETS.find(x=>x.ship===ship);
 if(curated?.type)return curated.type;
 try{
  const roster=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[];
  const own=roster.find(x=>{
   const name=String(x.name||'').normalize('NFKC');
   return name===norm||name.startsWith(norm);
  });
  if(own?.type)return own.type;
 }catch{}
 if(typeof HD_SHIP_DATABASE!=='undefined'){
  const db=HD_SHIP_DATABASE.find(x=>{
   return [x.base,x.final].some(n=>{
    const name=String(n||'').normalize('NFKC');
    return name===norm||name.startsWith(norm);
   });
  });
  if(db?.type)return db.type;
 }
 return '艦娘';
}
function hdMapDropReverseIndex(){
 const rows=new Map();
 const curatedByShip=new Map(HD_DROP_TARGETS.map(x=>[x.ship,x]));
 for(const [map,data] of Object.entries(HD_MAP_DROP_DATA)){
  for(const node of data?.nodes||[]){
   const featured=new Set(hdMapDropNames(node.featured));
   for(const ship of hdMapDropNames(node.ships)){
    if(!rows.has(ship))rows.set(ship,{ship,type:hdMapDropShipType(ship),locations:[],source:'HarborDesk 海域ドロップ表',checked:HD_MAP_DROP_CHECKED,featured:false});
    const row=rows.get(ship),curated=curatedByShip.get(ship);
    const detailed=(curated?.locations||[]).find(l=>l.map===map&&(
      l.node===node.node||
      String(l.node||'').includes(String(node.node||'').replace(' ボス',''))||
      String(node.node||'').includes(String(l.node||'').replace(' ボス',''))
    ));
    row.featured=row.featured||featured.has(ship);
    row.locations.push({
      map,
      node:node.node,
      rank:detailed?.rank||node.rank||'S中心',
      note:detailed?.note||node.note||data.note||'海域ドロップタブ収録。限定・条件付きドロップは最新Wikiも確認してね。',
      featured:featured.has(ship),
      kind:node.kind||'boss'
    });
    if(curated?.source)row.source=curated.source;
    if(curated?.checked)row.checked=curated.checked;
   }
  }
 }
 return [...rows.values()].sort((a,b)=>a.ship.localeCompare(b.ship,'ja'));
}
function hdDropAllTargets(){return hdMapDropReverseIndex()}

function hdMapDropWikiUrl(map){return 'https://wikiwiki.jp/kancolle/%E5%87%BA%E6%92%83%E3%83%89%E3%83%AD%E3%83%83%E3%83%97/'+encodeURIComponent(map)}
function hdMapDropHuntActive(ship,map,node){return hdDropHunts().some(x=>x.ship===ship&&x.map===map&&x.node===node&&!x.obtained)}
function hdMapDropShipHtml(ship,map,node,featured){
 const owned=hdDropOwned(ship),active=hdMapDropHuntActive(ship,map,node);
 return `<button type="button" class="hd-map-drop-chip${featured?' featured':''}${owned?' owned':''}${active?' hunting':''}" data-hd-map-drop-ship="${hdDropEsc(ship)}" data-hd-map-drop-map="${hdDropEsc(map)}" data-hd-map-drop-node="${hdDropEsc(node)}" data-hd-map-drop-owned="${owned?'1':'0'}" data-hd-map-drop-featured="${featured?'1':'0'}" title="${active?'掘り目標に追加済み':'タップで掘り目標に追加'}"><span>${hdDropEsc(ship)}</span>${featured?'<em>注目</em>':''}${owned?'<i>所持</i>':''}${active?'<b>掘り中</b>':''}</button>`;
}
function hdMapDropHtml(map){
 const data=HD_MAP_DROP_DATA[map];
 if(!data)return `<div class="empty">この海域のドロップ情報は整理中だよ。<a class="guide-link" href="${hdMapDropWikiUrl(map)}" target="_blank" rel="noopener">Wiki全ドロップ表 ↗</a></div>`;
 const view=hdMapDropView(map),stats=hdMapDropStats(map);
 const nodeHtml=(data.nodes||[]).map(n=>{
  const allShips=hdMapDropNames(n.ships),featured=new Set(hdMapDropNames(n.featured));
  const ships=allShips.filter(ship=>view==='all'||(view==='missing'&&!hdDropOwned(ship))||(view==='featured'&&featured.has(ship)));
  if(!ships.length)return '';
  return `<article class="hd-map-drop-node ${n.kind==='route'?'route':'boss'}"><div class="hd-map-drop-node-head"><div><strong>${hdDropEsc(n.node)}</strong><span>${hdDropEsc(n.rank||'S中心')}</span></div><b>${ships.length} / ${allShips.length}隻</b></div><div class="hd-map-drop-ships">${ships.map(ship=>hdMapDropShipHtml(ship,map,n.node,featured.has(ship))).join('')}</div>${n.note?`<p>${hdDropEsc(n.note)}</p>`:''}</article>`;
 }).filter(Boolean).join('');
 const filters=[['all','すべて'],['missing','未所持'],['featured','注目艦']];
 return `<section class="hd-map-drop-panel"><div class="hd-map-drop-intro"><div><div class="eyebrow">MAP DROPS</div><h4>${hdDropEsc(map)} ドロップ艦娘</h4><p>ボス・主要マスで確認されている主なドロップ。艦名をタップすると掘り目標へ追加できるよ。</p></div><a class="guide-link" href="${hdMapDropWikiUrl(map)}" target="_blank" rel="noopener">Wiki全表 ↗</a></div><div class="hd-map-drop-summary"><div class="hd-map-drop-progress"><div><strong>収録艦 所持率</strong><b>${stats.owned} / ${stats.total}隻・${stats.rate}%</b></div><div class="hd-map-drop-progress-bar" aria-label="収録艦所持率 ${stats.rate}%"><span style="width:${stats.rate}%"></span></div></div><div class="hd-map-drop-summary-stats"><span>未所持 <b>${stats.missing}</b></span><span>注目艦 <b>${stats.featured}</b></span></div></div><div class="hd-map-drop-view" role="group" aria-label="ドロップ表示フィルタ">${filters.map(([id,label])=>`<button type="button" class="ghost small ${view===id?'active':''}" data-hd-map-drop-view="${id}" data-hd-map-drop-view-map="${hdDropEsc(map)}">${label}</button>`).join('')}</div>${data.note?`<div class="hd-drop-warning">${hdDropEsc(data.note)}</div>`:''}<div class="hd-map-drop-nodes">${nodeHtml||'<div class="empty">この条件に合うドロップ艦はいないよ。</div>'}</div><div class="hd-map-drop-foot">所持率はこのタブに収録した艦娘を基準に計算｜確認 ${HD_MAP_DROP_CHECKED}｜ドロップテーブルは告知なく変わる場合があるため、限定艦を狙う前は最新Wikiも確認してね。</div></section>`;
}

function hdDropOpenMapPanel(){
 if(typeof selectedMap==='undefined'||!selectedMap)return false;
 const card=document.getElementById('selectedMapCard');if(!card)return false;
 let host=document.getElementById('hdFallbackDropTools');
 if(!host){host=document.createElement('div');host.id='hdFallbackDropTools';card.appendChild(host)}
 host.className='map-tab-pane active hd-drop-fallback';
 host.dataset.mapPane='drop';host.dataset.hdCoreFallbackPane='1';
 host.innerHTML=hdMapDropHtml(selectedMap);
 if(typeof window.hdCoreActivateFallbackPane==='function')return !!window.hdCoreActivateFallbackPane(host);
 if(typeof window.hdWSShowElement==='function'&&window.hdWSShowElement(host,true))return true;
 host.scrollIntoView({behavior:'smooth',block:'start'});return true;
}
function hdMapDropRefreshCurrent(){
 const host=document.getElementById('hdFallbackDropTools');
 if(host&&typeof selectedMap!=='undefined'&&selectedMap){
  host.innerHTML=hdMapDropHtml(selectedMap);
  return true;
 }
 if(typeof hdApplyMapTabs==='function'){hdApplyMapTabs();return true}
 return false;
}
window.hdMapDropHtml=hdMapDropHtml;
window.hdDropOpenMapPanel=hdDropOpenMapPanel;

let hdDropMap='すべて';
let hdDropMissingOnly=false;
function hdDropEsc(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdDropRosterNames(){try{return new Set((JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]).map(x=>String(x.name||'').trim()).filter(Boolean))}catch{return new Set()}}
function hdDropOwned(ship){const names=hdDropRosterNames();return [...names].some(n=>n===ship||n.startsWith(ship))}
function hdDropHunts(){try{return JSON.parse(localStorage.getItem(HD_DROP_HUNT_KEY)||'[]')||[]}catch{return []}}
function hdDropSave(v){localStorage.setItem(HD_DROP_HUNT_KEY,JSON.stringify(v));hdRenderDropHunts();hdRenderDropDb()}
function hdDropUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdRenderDropDb(){
 const host=document.getElementById('hdDropDbList');if(!host)return;
 const q=(document.getElementById('hdDropSearch')?.value||'').trim().toLowerCase();
 const owned=hdDropRosterNames();
 let rows=hdDropAllTargets().filter(x=>(hdDropMap==='すべて'||x.locations.some(l=>l.map===hdDropMap))&&(!q||`${x.ship} ${x.type} ${x.locations.map(l=>`${l.map} ${l.node} ${l.note}`).join(' ')}`.toLowerCase().includes(q)));
 if(hdDropMissingOnly)rows=rows.filter(x=>![...owned].some(n=>n===x.ship||n.startsWith(x.ship)));
 const count=document.getElementById('hdDropCount');if(count)count.textContent=`${rows.length}隻`;
 host.innerHTML=rows.map(x=>{const isOwned=hdDropOwned(x.ship);return `<article class="hd-drop-card"><div class="hd-drop-head"><div><strong>${hdDropEsc(x.ship)}</strong><span>${hdDropEsc(x.type)}${x.featured?'・注目ドロップ':''}</span></div><b class="${isOwned?'owned':'missing'}">${isOwned?'所持済み':'未所持'}</b></div><div class="hd-drop-locations">${x.locations.filter(l=>hdDropMap==='すべて'||l.map===hdDropMap).map((l,i)=>`<div class="hd-drop-location ${l.featured?'featured':''}"><div><strong>${hdDropEsc(l.map)} ${hdDropEsc(l.node)}</strong><span>${hdDropEsc(l.rank)}勝利目安${l.featured?'・注目':''}</span></div><p>${hdDropEsc(l.note)}</p><button class="primary small" type="button" data-hd-drop-target="${hdDropEsc(x.ship)}" data-hd-drop-map="${hdDropEsc(l.map)}" data-hd-drop-node="${hdDropEsc(l.node)}">ここを掘り目標にする</button></div>`).join('')}</div><div class="hd-drop-source">${hdDropEsc(x.source)}｜確認 ${hdDropEsc(x.checked)}</div></article>`}).join('')||'<div class="empty">条件に合うドロップ候補がないよ</div>';
}
function hdRenderDropHunts(){
 const host=document.getElementById('hdDropHuntList');if(!host)return;const rows=hdDropHunts();
 host.innerHTML=rows.length?rows.map(h=>`<article class="hd-hunt-card${h.obtained?' done':''}"><div class="hd-hunt-head"><div><strong>${hdDropEsc(h.ship)}</strong><span>${hdDropEsc(h.map)} ${hdDropEsc(h.node)}</span></div><button class="ghost small" type="button" data-hd-hunt-delete="${h.id}">削除</button></div><div class="hd-hunt-stats"><span>周回 <b>${h.runs||0}</b></span><span>S <b>${h.s||0}</b></span><span>A <b>${h.a||0}</b></span></div><div class="hd-hunt-actions"><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="runs">＋1周</button><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="s">＋S</button><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="a">＋A</button><button class="primary small" data-hd-hunt-obtained="${h.id}">${h.obtained?'入手済み ✓':'入手した！'}</button></div>${h.obtained&&!hdDropOwned(h.ship)?`<button class="ghost small" data-hd-hunt-roster="${h.id}">艦隊台帳へ追加</button>`:''}</article>`).join(''):'<div class="empty">掘り目標はまだないよ。下の逆引きから追加できる。</div>';
}
function hdAddDropTarget(ship,map,node){const rows=hdDropHunts();if(rows.some(x=>x.ship===ship&&x.map===map&&x.node===node&&!x.obtained)){document.getElementById('hdDropHuntList')?.scrollIntoView({behavior:'smooth',block:'center'});return}rows.unshift({id:hdDropUid(),ship,map,node,runs:0,s:0,a:0,obtained:false,createdAt:Date.now()});hdDropSave(rows);document.getElementById('hdDropHuntList')?.scrollIntoView({behavior:'smooth',block:'center'})}
function hdEnsureDropDb(){
 if(document.getElementById('dropHuntingDb'))return;const anchor=document.getElementById('shipDatabase')||document.getElementById('roster');if(!anchor)return;
 const maps=['すべて',...Object.keys(HD_MAP_DROP_DATA)].sort((a,b)=>a==='すべて'?-1:a.localeCompare(b,undefined,{numeric:true}));
 const sec=document.createElement('section');sec.id='dropHuntingDb';sec.className='advanced-section';sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">DROP / FARMING</div><h2>全海域ドロップ逆引き・掘り記録</h2></div><span id="hdDropCount" class="muted"></span></div><div class="hd-drop-warning">1-1〜7-5（5-6含む）37海域のドロップタブ収録データを艦娘名から逆引きできるよ。限定・条件付きドロップは変わる場合があるので最新Wikiも確認してね。</div><div class="hd-drop-toolbar"><input id="hdDropSearch" type="search" placeholder="艦名・海域・マスで検索"><label><input id="hdDropMissingOnly" type="checkbox"> 未所持だけ</label></div><div class="hd-drop-filters">${maps.map(m=>`<button class="ghost small${m==='すべて'?' active':''}" type="button" data-hd-drop-mapfilter="${m}">${m}</button>`).join('')}</div><div class="hd-hunt-title"><strong>掘り目標</strong><span class="muted">周回・勝利数を端末内保存</span></div><div id="hdDropHuntList" class="hd-hunt-list"></div><div id="hdDropDbList" class="hd-drop-list"></div><div><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E9%80%86%E5%BC%95%E3%81%8D%E8%89%A6%E5%A8%98%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E8%A1%A8" target="_blank" rel="noopener">攻略Wiki ドロップ逆引きで最新情報 ↗</a></div>`;anchor.insertAdjacentElement('afterend',sec);
 document.getElementById('hdDropSearch').addEventListener('input',hdRenderDropDb);document.getElementById('hdDropMissingOnly').addEventListener('change',e=>{hdDropMissingOnly=e.target.checked;hdRenderDropDb()});hdRenderDropHunts();hdRenderDropDb();
}
document.addEventListener('click',e=>{
 const mapView=e.target.closest?.('[data-hd-map-drop-view]');if(mapView){hdMapDropSetView(mapView.dataset.hdMapDropViewMap,mapView.dataset.hdMapDropView);hdMapDropRefreshCurrent();return}
 const mapShip=e.target.closest?.('[data-hd-map-drop-ship]');if(mapShip){hdAddDropTarget(mapShip.dataset.hdMapDropShip,mapShip.dataset.hdMapDropMap,mapShip.dataset.hdMapDropNode);hdMapDropRefreshCurrent();return}
 const mf=e.target.closest?.('[data-hd-drop-mapfilter]');if(mf){hdDropMap=mf.dataset.hdDropMapfilter;document.querySelectorAll('[data-hd-drop-mapfilter]').forEach(b=>b.classList.toggle('active',b===mf));hdRenderDropDb();return}
 const add=e.target.closest?.('[data-hd-drop-target]');if(add){hdAddDropTarget(add.dataset.hdDropTarget,add.dataset.hdDropMap,add.dataset.hdDropNode);return}
 const inc=e.target.closest?.('[data-hd-hunt-add]');if(inc){const rows=hdDropHunts(),h=rows.find(x=>x.id===inc.dataset.hdHuntAdd);if(h){h.runs=(h.runs||0)+1;if(inc.dataset.field==='s')h.s=(h.s||0)+1;if(inc.dataset.field==='a')h.a=(h.a||0)+1;hdDropSave(rows)}return}
 const got=e.target.closest?.('[data-hd-hunt-obtained]');if(got){const rows=hdDropHunts(),h=rows.find(x=>x.id===got.dataset.hdHuntObtained);if(h){h.obtained=!h.obtained;h.obtainedAt=h.obtained?Date.now():null;hdDropSave(rows)}return}
 const del=e.target.closest?.('[data-hd-hunt-delete]');if(del){const rows=hdDropHunts(),i=rows.findIndex(x=>String(x.id)===String(del.dataset.hdHuntDelete));if(i<0)return;const [item]=rows.splice(i,1);hdDropSave(rows);window.hdToastAction?.(`${item.ship||'掘り目標'} を削除したよ`,'元に戻す',()=>{const current=hdDropHunts();if(!current.some(x=>String(x.id)===String(item.id))){current.splice(Math.min(i,current.length),0,item);hdDropSave(current);window.hdToast?.('元に戻したよ')}},6500);return}
 const rr=e.target.closest?.('[data-hd-hunt-roster]');if(rr){const h=hdDropHunts().find(x=>x.id===rr.dataset.hdHuntRoster);if(h&&typeof openShipRosterDialog==='function'){openShipRosterDialog({name:h.ship,memo:`${h.map} ${h.node}で入手。HarborDesk掘り記録 ${h.runs||0}周。`})}}
});
window.addEventListener('load',()=>setTimeout(hdEnsureDropDb,340));setTimeout(hdEnsureDropDb,520);
