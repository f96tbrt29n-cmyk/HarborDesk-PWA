# PR #152：同期script境界・native DCL・SWイベント採取

2026-10-18 JST。基準797dc6c、旧停止CI39096704516、直前CI39098317706。製品コード・保存形式・SW本体・45秒期限は変更しない。PR151変更なし、PR152ドラフト維持、マージ/公開なし。

## 旧停止の境界と限界

|試行|最後の連続したヘッダー応答|最初の応答記録欠測|欠測|最後の本文完了/script load|
|---|---|---|---:|---|
|初回|30: equipment-catalog-extra3.js|31: equipment-catalog-extra4.js|15本|未計測で不明|
|再試行|9: ship-database.js|10: training-planner.js|36本|未計測で不明|

全45本はHTMLに直接記載されたclassic script（async/deferなし）。後続のrequestイベントも発行されており「最初の1本以外は要求されていない」とは言えない。ただしrequestは物理的な送信の完了証明でもなく、共有queue/接続/SW待ちと各要求の個別停滞は未分離。ヘッダー応答の直前位置を「最後に正常実行完了したscript」へ読み替えない。

全順序と試行別の要求・ヘッダーを[JSON](pr152-static-script-audit.json)に保持。旧記録はrequestfinished、本文EOF、script load、native readyStateを採っていない。DOMContentLoadedを待ってタイムアウトした事実からdocument.readyState=loadingだったとも断定できない。

|HTML順|src|
|---:|---|
|1|`app.js?v=580`|
|2|`map-details.js?v=580`|
|3|`map-details-34.js?v=580`|
|4|`map-details-57.js?v=580`|
|5|`map-plans.js?v=580`|
|6|`ship-roster.js?v=580`|
|7|`ship-master-snapshot.js?v=580`|
|8|`ship-image-provider.js?v=580`|
|9|`ship-database.js?v=580`|
|10|`training-planner.js?v=580`|
|11|`drop-hunting.js?v=580`|
|12|`custom-fleets.js?v=580`|
|13|`map-images.js?v=580`|
|14|`map-tabs.js?v=580`|
|15|`map-interactive.js?v=580`|
|16|`map-node-data-1.js?v=580`|
|17|`map-node-data-2-7.js?v=580`|
|18|`map-advanced-data.js?v=580`|
|19|`map-air-data.js?v=580`|
|20|`enemy-anti-air-data.js?v=580`|
|21|`enemy-anti-air.js?v=580`|
|22|`map-air-check.js?v=580`|
|23|`map-controller.js?v=580`|
|24|`advanced-tools.js?v=580`|
|25|`resource-history.js?v=580`|
|26|`kancolle-import.js?v=580`|
|27|`equipment-catalog.js?v=580`|
|28|`equipment-catalog-extra.js?v=580`|
|29|`equipment-catalog-extra2.js?v=580`|
|30|`equipment-catalog-extra3.js?v=580`|
|31|`equipment-catalog-extra4.js?v=580`|
|32|`equipment-catalog-ui-patch.js?v=580`|
|33|`map-equipment-recommend.js?v=580`|
|34|`map-equipment-owned.js?v=580`|
|35|`development-recipes.js?v=580`|
|36|`construction-database.js?v=580`|
|37|`improvement-workshop.js?v=580`|
|38|`material-planner.js?v=580`|
|39|`eo-tracker.js?v=580`|
|40|`quest-database.js?v=580`|
|41|`expedition-database.js?v=580`|
|42|`home-dashboard.js?v=580`|
|43|`update-manager.js?v=580`|
|44|`map-strategy-navigator.js?v=580`|
|45|`strategy-goals.js?v=580`|

## 軽量な追加観測

対象3方針テストだけ、init scriptからdocumentのscript load/error、readystatechange/native DCL、controllerchange、register/worker statechange/updatefoundを採る。レイアウト、DOM snapshot、入力、保存データ、本文は読まない。registerの元promiseをそのまま返す。getRegistrationは初期/controllerchangeと停止時の単発照会だけ。継続ポーリングはしない。

script loadはロード/実行の試行後のイベントで、例外がなかったこととは別。node requestfinished、報告sizes、native load/DCLを別々に残す。sizes取得はreload開始後に限定し、初期ロードへ不要なRPCを増やさない。PlaywrightのsizesはContent-Length補完もあり、物理的な転送量の独立測定ではない。

readyStateがloadingのまま30秒の場合だけ、観測用watchdogで状態とregistrationを単発採取する。通常DCLで解除し、テスト成功を待たせず、既存45秒期限を変更しない。JS main thread自体が停止すればtimerも実行できない点は限界。finallyはブロックしたpageのevaluateを待たず、Node側の最後の観測とcapture-endを保存する。

軽量イベントはNode側の有界buffer（1024、溢れ件数付き）へ退避。正常時と復元後の通信例外ではnative summaryだけをJSON化し、reload waiterが失敗した場合に詳細を残す。明示的な対照プロジェクトは比較のため詳細を保持する。traceにはイベントconsoleも含まれ得るので、これを全削除したとは扱わない。native DCLが来たのにPlaywright reload待機が失敗する場合も区別できる単体検査を追加。

## SW内部の停止時資料

CIのHD_RELOAD_BUFFER_SW=1では専用テストサーバーを使い、3方針テストの登録URLだけopt-inマーカーを付加する。他ケースと、通常の公開/PWAのSW.js本体は変更しない。公開workflowにこのflagは加えない。

したがって、この3ケースのCIは**計測SWを使う診断プロフィール**であり、未加工SWの安定動作の証明とは別。未加工SW/無効との隔離対照を保持する。callback/portでタイミングやworker寿命に影響する可能性は未除外。

追跡するのは旧境界の前後4本（ship-database、training-planner、equipment-catalog-extra3/4）。fetch-event、network-start/headers/failed、cache-match、cache-put-start/complete、respondWith引渡しを有界historyとMessagePortで流し、失敗時資料に対応付ける。追加fetch・第三のclone/arrayBuffer読取り・毎イベントのclients.matchAllは廃止。既存SWのcache put完了は、そのcloneの本文消費を伴う完了として使い、ブラウザー側の完了と区別する。

cache putとブラウザー引渡しは並行する。引渡しログはブラウザー読了ではない。SW側atは発生時刻、Nodeのmsは受信時刻で、受信順を厳密な因果順序にしない。workerが購読前に失われた場合やhistory範囲外は欠測になり、stageがないだけで未実行と断定しない。秘密情報/任意query/本文/認証ヘッダーは保存せず、URLと状態・サイズだけを記録。

## 隔離対照と観測自身の修正

- 新bufferの通常SW/無効/probeを各エンジン1回：5初回成功/1最終失敗/再試行0。失敗はWebKit通常SWのsw.js通信pageerrorで、DCL・方針・6キー比較は完了。自然な45秒停止は再現せず。
- この初版ではWindow captureでscript loadを拾えていなかった。document captureへ修正し、後述の両エンジン対照で取得を確認。この観測不備を製品不具合とは扱わない。
- 最初の本文0byte保留対照は2件失敗。部分本文1024bytesの版ではWebKit成功/Chromiumはresponse通知期待で失敗。資料はすべて保持。
- Chromiumではサーバーのheader/部分本文flushが済んでもresponse通知が保留された。サーバーflushとブラウザー通知を同一視した新実験の期待を修正し、独立したサーバーcheckpointと観測値を分けた。元の方針テストの合格条件を変更したのではない。

## 1本の部分本文を止める対照

SW無効、31番equipment-catalog-extra4の先頭1024bytesだけ送出、残りを明示releaseまで保留。サーバーが送ったことは受信完了を証明しないため別記する。

最終対照は両エンジン各1回初回成功、再試行0（計10.4秒）。保留中は次が成立：

- server header/partial flushあり、31番のrequestfinished/loadなし。
- 32番equipment-catalog-ui-patchのrequestfinishedあり、loadなし。
- native readyState=loading、最後のscript loadは30番extra3。
- 保留解除後、31/32番のresponse/requestfinished/load、全45本のロード、native DCLまで進む。

WebKitの31番response通知は保留中にもあり、Chromiumはなかった。通知欠落だけを通信失敗の証明にできない。一方、32番の通信は完了しており、1本の本文待ちが後続の実行を止めても、後続の通信まで必ず止めるわけではない。元の15/36欠測をこの単一の実行待ちだけで説明しない。これは人工的な対照で、元の45秒停止の再現ではない。

## SW有効の停止時採取を確認する対照

計測SWがactivatedとなった専用プロフィールで、同じ本文保留をreload時に実施。30秒の診断イベントを待って、最後のscript load=30、readyState=loading、controller/active=sw.js?v=580 activated、installing/waitingなしを確認。

対象31番はfetch/network headers/cache-put-start/handoffまで進み、browser requestfinishedとcache-put-completeはない。解除後はDCLとcache-put-completeが到達。WebKit/Chromium各1回初回成功（39.7秒/39.5秒）、再試行0、pageerror0。45秒以内で計測の機能を確認しており、自然発生停止を解決したとも、activationが原因だったとも扱わない。

## 使用と未完了

`npx playwright test -c playwright.reload-probe.config.cjs` は通常/無効/probe/6キー有効プロフィール。`npx playwright test -c playwright.script-gate.config.cjs` は意図的な本文保留の対照。いずれもretries=0、45秒は維持。専用サーバーが必要な実験は.experiment.cjsと明示configでのみ収集し、通常テストをskipしない。HD_RELOAD_EVIDENCE_DIRで証拠先を指定でき、省略時は時刻別。

元の自然停止のreadyState、最後のscript load、SW切替/本文段階はまだ不明。次の自然なreload失敗で詳細を照合する。通信/Cache API例外は復元済みの別事象として保持。Chromium元重複宣言2件、2-5北の同期外索敵差分と一般探索網羅性は未解決。有限在庫16候補/同期外15候補の未知ガードを維持。53例は全条件検証済み1/一部49/未確認3。5-6・実機iPhone・WebKitオフラインは未確認。

証拠：/workspace/hd152-script-boundary-20261018。旧資料はhd152-network-impact-20261018、hd152-sw-stages-20261018以下へ保持。CI最終結果はPR本文へ記録。
