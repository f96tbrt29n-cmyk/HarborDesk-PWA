# PR152：未加工SWの受動観測と2-5北の有限部分領域

2026-10-18。基準a3daf1e、main 7f114a6。PR151変更なし、PR152ドラフト維持・マージ/公開なし。製品・保存形式・攻略判定・45秒期限は変更しない。

## SWプロフィールと計測の範囲

前CI39124463722の必須6ジョブは全成功、両エンジン670件ずつ初回成功。ただし対象3方針テストは計測SWを使用しており、未加工SWの自然停止が解消した証拠ではない。

今回、通常CIのHD_RELOAD_BUFFER_SW指定を除去した。通常サーバーは未加工SWを返す。ブラウザー側native probeもinstrumentSW=falseではregister関数を差し替えない（関数同一性のNode検査付き）。SW内部fetch/cache関数、応答本文、登録URLは変更しない。

ブラウザー側は既存のrequest/response/requestfinished/requestfailed、native script load/error、readyState/DCL、controllerchangeと単発getRegistrationを記録。レイアウト/DOM snapshot/追加本文readerを使わない。登録状態の単発照会やconsoleイベント・request sizes採取にも負荷はあり、完全に無影響とは主張しない。失敗時だけ有界native buffer詳細を退避する。健全文書の30秒観測timerはDCLで解除し、テスト期限は45秒のまま。

JSONのprofile.swSource（unmodified/test-instrumented）とserviceWorkers（allow/block）を分離した。unmodified+blockは「未加工SWが実際に制御した」という意味ではない。要求ごとのfromServiceWorker、controllerの観測時点も区別する。

SW内部の4ファイル計測は専用サーバー・opt-in marker・私用プロフィールだけに残す。通常/無効/計測を同一の非null6キーfixture、各エンジン1回・再試行0で比較する設定はplaywright.passive-reload.config.cjs。公開workflowには追加しない。

## 今回の限定比較

|エンジン|SW|reload待機ms|結果|
|---|---|---:|---|
|Chromium|未加工/allow|913|初回成功|
|Chromium|block|404|初回成功|
|Chromium|計測|842|初回成功|
|WebKit|未加工/allow|878|初回成功|
|WebKit|block|435|初回成功|
|WebKit|計測|892|初回成功|

6件とも静的script45本のresponse/requestfinishedあり、requestfailed0、native DCL・cv-fighter2復元・非null6文字列完全一致・pageerror0。WebKit allow/probeでは版付きcontroller activatedを観測。Chromium allow/probeにはactivatingの観測もあり、全試行でactivatedを待って開始した実験ではない。内部probeの影響を排除できる反復数ではなく、時間差を性能差/原因へ読み替えない。自然な45秒停止は再現せず、成功を根本解決とは扱わない。追加の大量反復はしない。

環境復元時、既定ブラウザー保存先の不一致で6起動失敗、保存先修正後WebKit3起動失敗、私用ライブラリー指定後もldconfigだけを見る検証により3起動失敗があった。これらはfixtureへ未到達。ライブラリーの実ロードをctypesで確認し、既存の私用ライブラリーとPlaywrightのホスト検証省略指定でWebKitを起動した。テストスキップ/アサーション変更ではない。Chromium成功3件を再実行せず、WebKitだけ実行。すべての初期ログ/traceを保持。公式CIはinstall --with-depsで別途検証する。

## 自然停止の解釈と次の証拠

旧CI39096704516の初回30→31番、再試行9→10番はヘッダー記録境界であり、本文完了/実行完了の境界ではない。旧資料にrequestfinished/native script load/readyStateがないため遡及して確定できない。全順序はpr152-static-script-audit.json、人工本文保留対照はpr152-script-boundary-native-ja.mdを参照。

次の自然な停止で、各要求のヘッダー・requestfinished/failed・報告サイズ、最後のnative script load、最初の欠測、document.readyState、controller、native DCLとPlaywright waiterを対応付ける。script loadはロード/実行の試行後のイベントであり、例外ゼロの証明ではない。DOMContentLoadedも動的モジュールすべての完了とは別。SW内部stageが必要な場合にだけ隔離プロフィールと比較する。欠測だけで通信失敗/未実行と断定しない。

## 通信/Cache API例外を分離

今回6件のpageerrorは0。以前の未加工SW比較でのsw.jsアクセス制御例外と、復元後のCache API Context is stoppedは未解決の別記録として残す。GitHub鮮度診断の2公開API fetchはhdDXGithubHead→hdDXUpstreamFreshness→hdDXCollectから発生し、遷移取消/CORS/ネイティブWebKit通知/実行環境を切り分ける必要がある。旧停止2試行はpageerror0だった。今回例外がないことも、DCL/方針復元後に例外が出た過去資料も、45秒停止との共通原因を証明しない。Cache例外のスタック・発信元がない試行は不明のまま。[以前の時系列](pr152-network-pageerror-ja.md)を維持し、推測の製品修正はしない。

## 2-5北の進捗と限界

既存16候補の各艦について、同期表示索敵D、現装備の素索敵R、Lv90、司令部Lv120、係数1、同期/提案の装備位置・改修値を添付JSONへ追加。観測項D-R=41、制空と33式の独立oracleとの一致、低速/2隻のドラム缶/合法枠/改修別有限在庫を検査。同期と同じ1候補以外の15候補は新ボーナス差が不明、索敵manual・総合攻略可能falseを維持する。

既存資料KC3Kai固定commit db1e102da2315299d543cfc90003929dc377c111のShip.nakedLoS（1119行）、equipmentTotalStats（874行）、Fleet.eLos4（1329行）を再照合。同期と同じ配備はsqrt(D-R)。配備変更はsqrt(D-R-B_old+B_new)となり、装備別/艦別/改修別B_old/B_newの根拠が必要。今回それを0として補完したり、未知15候補を確認済みにする変更はない。実プレイヤー本人の同期データではなく専用API観測fixtureである。

新しい限定照合では、扶桑改二の第3/4枠だけを可変、他艦の主砲/ドラム缶/電探/5重要枠を固定。独立4^7列挙からこの部分領域を抽出すると数値解は2件（制空66/56、索敵49.458745...）。テストでBuildの可変slot領域だけを2枠へ制限し、同期候補shortcutを無効化したうえで、製品のSearchSteps/評価/在庫/適合判定を使用する。一般探索は同期と同じ解を発見し、装備位置・★4・低速・2隻ドラム・制空・索敵を同時充足。他艦の配備は不変、総合攻略可能は連戦制空などの未確認によりfalse。

このablationは限定領域での存在照合であり、未制限のbeam全探索、全16解の発見、全艦/全装備の網羅性ではない。改修別有限在庫を超えずに一つの条件を壊さず発見できることを追加検証した。新規照合と拡充16候補は両エンジン計4件初回成功、再試行0。

53例台帳の2-5北へ証拠を追記し、全条件検証済み1/一部49/未確認3は変更しない。同期外ボーナス、一般探索網羅性、全境界/全操作列が残る。元のChromium重複宣言2件、5-6、実機iPhone、WebKitオフラインも未確認。

証拠：/workspace/hd152-passive-sw-20261018。旧証拠は削除しない。CI最終結果はPR本文へ記録する。
