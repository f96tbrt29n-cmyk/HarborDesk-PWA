# PR #152：WebKit再読込の未完了要求とSW比較

2026-10-18 JST。基準7e5713c、CI39096704516。製品コード・SW・保存形式・45秒期限・既存の検証条件は変更しない。PRはドラフト、マージ・公開なし。

## 既存CIの初回・再試行

両試行とも空母夜戦CIの配備成立後、page.reload(domcontentloaded)で45秒全体期限。例外0を正常判定の代わりにしない。

|段階|初回|再試行|
|---|---:|---:|
|reload開始|1620ms|1550ms|
|upstream要求取消|1623ms|1555〜1556ms|
|HTML応答（200、fromSW=true）|1762ms|1708ms|
|主フレーム#home遷移|1774ms|1720ms|
|reload後の要求/応答記録|75/60|75/39|
|最後のイベント|1829ms manifest応答|1775ms manifest応答|
|DCL、保存方針・6キー復元検査|未到達|未到達|
|pageerror|0|0|

初回trace・動画・段階JSONと再試行資料をそれぞれ保持し、成功した爆撃CI/DD夜戦CIと比較。成功例ではDCLと方針復元まで到達。原CIではrequestfinished/転送サイズ/SW内部を採っていなかったため、本文読了とブラウザー引渡しの段階を後から復元できない。保存データの不一致が分かったわけでも、停止後の保持を確認できたわけでもない。

## 応答イベントがないJS

全件の機械可読一覧は[pr152-webkit-pending-scripts.json](pr152-webkit-pending-scripts.json)。URLに要求イベントがあり、対応するresponseイベントがないことを指す。「サーバーが絶対に応答していない」「その直前の本文は完了した」という意味ではない。

初回15件：

- `equipment-catalog-extra4.js?v=580`
- `equipment-catalog-ui-patch.js?v=580`
- `map-equipment-recommend.js?v=580`
- `map-equipment-owned.js?v=580`
- `development-recipes.js?v=580`
- `construction-database.js?v=580`
- `improvement-workshop.js?v=580`
- `material-planner.js?v=580`
- `eo-tracker.js?v=580`
- `quest-database.js?v=580`
- `expedition-database.js?v=580`
- `home-dashboard.js?v=580`
- `update-manager.js?v=580`
- `map-strategy-navigator.js?v=580`
- `strategy-goals.js?v=580`

再試行は上記15件に、次の21件を加えた36件：

- `training-planner.js?v=580`
- `drop-hunting.js?v=580`
- `custom-fleets.js?v=580`
- `map-images.js?v=580`
- `map-tabs.js?v=580`
- `map-interactive.js?v=580`
- `map-node-data-1.js?v=580`
- `map-node-data-2-7.js?v=580`
- `map-advanced-data.js?v=580`
- `map-air-data.js?v=580`
- `enemy-anti-air-data.js?v=580`
- `enemy-anti-air.js?v=580`
- `map-air-check.js?v=580`
- `map-controller.js?v=580`
- `advanced-tools.js?v=580`
- `resource-history.js?v=580`
- `kancolle-import.js?v=580`
- `equipment-catalog.js?v=580`
- `equipment-catalog-extra.js?v=580`
- `equipment-catalog-extra2.js?v=580`
- `equipment-catalog-extra3.js?v=580`

index.htmlの通常のparser-blockingなscript並びに対し、初回はequipment-catalog-extra4、再試行はtraining-planner以降の連続した後半が応答記録を欠く。未完了スクリプトがDCLを妨げる状態と整合するが、ヘッダーを受信した直前のスクリプトの本文・評価完了も未確認。特定ファイルの実装バグ、SWのdeadlock、OS/ブラウザー障害のどれかを断定しない。

## 今回の限定計測

対象は既存3方針ケースのみ。Node側で要求IDを共通化し、frame/workerの取得可能な所有情報、requestfinished、requestfailed、timing、報告される転送サイズ、Content-Lengthを保存する。サイズ取得はローカルdocument/JSと既知upstreamに限定し、同じ要求で重複発行しない。ヘッダー受信と本文転送完了、JS実行完了は区別する。frameは要求の発行元でありSWを迂回した証明ではない。WebKitのworker所有情報が得られない場合はunknownのままにする。失敗退避は評価・サイズ取得の完了を待たない。

認証情報、任意のquery、要求ヘッダー、本文を記録しない。URLのuser/passwordとv以外のqueryを落とす。単体テストでID/本文サイズ/時刻/秘密query除外を確認。pageerrorの検証は維持し、取消を成功へ変えない。

専用ローカルサーバーは明示的なhd_reload_probe=1付きSWだけへ計測コードを付加する。公開SW/キャッシュ/利用者プロフィールは変更しない。probeプロジェクトだけ登録URLにマーカーを付け、SW内のfetch到達、network開始/headers/clone本文読了、cache match/put、respondWithへの応答引渡し直前をmessageで記録する。本文は3ファイルだけcloneしてバイト数を数え、内容を出力しない。cache参照はfallbackで呼ばれる場合だけ。正常なnetwork-firstではcache-matchがないのが仕様。

この計測はclone・メッセージ・Promiseの段階を追加してスケジューリングへ影響し得る。probe成功を通常SWの安定成功や根本原因解消へ読み替えない。handoff-responseはSWがrespondWithへ返す直前であり、ブラウザーでの読了は別のrequestfinished/サイズで判断する。

## SW比較：各1回、再試行0

|エンジン/モード|reload→DCL|reload→6キー比較|結果|
|---|---:|---:|---|
|chromium-allow|843ms|2318ms|初回成功|
|chromium-block|406ms|1449ms|初回成功|
|chromium-probe|992ms|2316ms|初回成功|
|webkit-allow|754ms|1170ms|初回失敗（通信pageerror、復元比較は成功）|
|webkit-block|407ms|1087ms|初回成功|
|webkit-probe|767ms|1550ms|初回成功|

合計5初回成功/1最終失敗/再試行0、45秒停止は再現せず。SW無効でも元の停止が起きないことを1回観測しただけで、SWが原因とは言えない。通常6比較では未保存キーのnullもそのまま比較し、全6キーが値を持つ試験とは区別する。

probe成功例ではtraining-planner 15,974bytes、equipment-catalog-extra3 10,201bytes、equipment-catalog-extra4 13,599bytesの本文読了を記録し、実ファイルサイズと一致。通常/無効時もPlaywrightが報告する対象scriptの本文サイズを取得。これは成功時の経路であり、元の失敗時の転送サイズではない。

最初のgrep指定はNo tests foundの設定誤りで、実行件数に含めない。ログはselection-error.logへ保存。

## 6キーすべてに値がある専用プロフィール

追加した専用プロフィールの初版はresourcesだけの不完全なapp状態を生成し、renderTimers/tickでarr.length/arr iterable例外を発生させた。WebKitは45秒reload停止、Chromiumは再読込・復元後の例外検査で失敗（各1、再試行0）。元CIの例外0での停止とは区別し、このfixture不備を元の原因とは扱わない。

正式なblankState()へ修正。前回の診断影響試験（route-completion-2-5）にも同型の部分状態があったため、そちらも正式な状態を使い、再読込後の意図しない例外0を追加確認する。製品側へ例外隠しを入れない。修正後の診断影響試験はChromium/WebKit各1回初回成功（計19.9秒）、再試行0。再読込後の意図しない例外0と6キー・プランナー一致も検査。

有効な専用プロフィールではroster/equipmentの元の空母方針fixtureに加え、司令部120の同期、正式な資源状態、保存編成API、計算プラン保存APIで6キーすべてを非nullにする。Chromium/WebKit各1回初回成功、再試行0（計19.7秒）。再読込完了、cv-fighter2復元、6文字列の完全一致、pageerror0を確認。元の失敗を「修正で解消」とは呼ばない。無効版資料もretentionに保持し、有効版retention-validと分ける。

## 再実行手順と残る証拠

専用環境で `npx playwright test -c playwright.reload-probe.config.cjs`。標準のretries=0、workers=1、45秒/元のアサーションを使用。通常SW/無効/probe各2エンジンに、6キー有効プロフィール2件を加えた8ケース。HD_RELOAD_EVIDENCE_DIRで証拠の出力先を指定でき、省略時は時刻別に保存。既存資料を上書きしない。

元の停止は通常SWの次の自然な失敗で、未完了要求IDのcontext所有情報・headers・requestfinished/sizesを対照する必要がある。内部probeで同じ停止が出ていないため、失敗時SW内のどの段階かは未確定。成功回数を増やすための大量反復はしない。

通信pageerrorは今回も復元完了した試行で出ており、45秒停止と別問題。Chromium元の重複宣言2件、2-5北同期外15候補の索敵ボーナス差分と一般探索の網羅性は未解決。有限在庫16候補と未知のガードを維持。53例は全条件検証済み1/一部49/未確認3。5-6・実機iPhone・WebKitオフラインは未確認。PR151変更なし。

今回の全証拠は/workspace/hd152-sw-stages-20261018、元のCI資料は/workspace/hd152-network-impact-20261018に保持。新CIはpush後のPR記録で初回/再試行/最終失敗を区別する。
