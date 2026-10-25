# PR152: 初回明示update抑止を実アプリ条件へ接続

基準 `9401810ca254ba1e154bbffca48e76b73b035aac`。候補の製品採用なし。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。
旧保存実nullを最優先の未解決として維持し、保存診断・load後完全一致を変更しない。

## 既存比較と更新経路

[人工比較](pr152-suppressed-close-ja.md)は完了証拠として再利用し、保持/破棄/初回抑止の
再実行はしない。今回だけ実HTML/UI/資産・二つの登録入口を含む元`pwa.spec`を使う。

|入口|現行の役割|初回明示updateだけ抑止した場合の範囲・懸念|
|---|---|---|
|app.js load|版なし`register('./sw.js')`、元のcatch|不変。既存controllerは別の登録呼出し完了の証明ではない|
|update-manager load|版付きregisterをawait→registered→明示updateを非待機で開始→既存ready反応|初回文書の明示updateだけ抑止。registerやブラウザーの自動更新まで止めない。初回のSW更新検出・キャッシュ切替が遅れないことは未検証|
|load後1200ms|`hdCheckForUpdate(false)`で外部/公開版JSONを取得し更新UI表示|コード不変。これはSW更新APIとは別。タイマー値/通信/fallbackを変更しない|
|手動の更新確認|`hdCheckForUpdate(true)`、公開反映状態の表示|コード不変。今回この操作の動作試験はしていない|
|今すぐ更新/hdForceUpdate|オンラインで版確認→対象scopeのupdate/unregister→PWA cache削除→遷移。オフラインは早期拒否|コード不変。元PWA試験はオフライン拒否/キャッシュ維持だけを確認する計画。オンライン更新・版跨ぎ・iPhone実機の安全性は未検証|

抑止を恒久採用すると初回の新SW検出/資産更新/オフライン初期準備へ影響する可能性がある。
後続文書の明示updateは有効だが、利用者が後続文書を開く保証はない。
登録統合・URL/scope・SW本文・版/cache名・保存形式には変更しない。

## 条件と介入

事前protocolで現行→候補の順、WebKit各1回/retries0で終了と固定した。
既存公式PW1.55/WebKit26.0 rev2203を再利用。新規隔離context・元のランダムport HTTP origin。
元のHTML/app.js/UI/全資産/SW、MIME/no-store、getRegistrations準備→reloadの順序を維持する。
元の登録12秒・全体45秒・poll間隔・全assert・例外ゼロ検査・後続オフライン検査を残す。
元fixtureの100ms待機は不変で、新たな固定sleepは追加しない。

既存register継続診断と初回抑止機構を共通化し、**配信時の完全なupdate-managerソース**へ適用。
初回ソースの条件間差分は抑止定数false→trueだけ。以降の版取得・UI・timer・強制更新処理も残す。
後続ソースは両方同じphase=reloaded/suppress=false。
SW APIラッパー、追加Promise反応、timer、保存読取り/書込み、待機条件の追加なし。

初回操作は元のreload直前に**受信済みNode履歴だけ**で確認する。
初回await継続→registered→update-site→実行返却/抑止がなければ準備未確認とする。
到達を強制する追加waitを入れない。欠測を呼出しなし/未実行/native Promise pendingと断定しない。
既存console配送・メタデータ読取り・配信加工とhash、Nodeのphase記録はタイミングへ介入する。
両条件に共通だが未加工配信と同じ挙動とは保証しない。

元`pwa.spec`には投入保存キー・文字列完全一致やStorage境界監査がない。
PWA-cached-reloadの5キーや空母2キーfixtureへ置き換えず、保存操作も増やさない。
通常CIの既設保存診断/load後検査はそのまま。今回の2試行だけで実nullを評価できない。

## 契約と配信ソース

変更した配信/失敗退避4件、既存抑止6件・gate8件、計18契約成功後に限定実行。
全文の更新機能維持、初回だけ0/後続1回、引数/receiver/元catchとready反応、未確認準備、
失敗時の受信済み記録とsource保持、上限/drop、余分なブラウザー読取りなしを確認した。
旧人工比較の生成ソースhashは変わっていない。

|配信ソース|SHA256|
|---|---|
|製品update-manager原文|186527db6be79198fcfe49951173736c24ee30f776cc90f98f137d7dc71e73f9|
|初回・現行|805973448710b314dfbe3f7f8579a87bd6aa07b78ddb29561015c328df37fbfa|
|初回・抑止候補|326f7be4ea999eb96898feadfe22253e72751bf659b19593a58ea7612329ad3f|
|後続・両方同じ|e0f7dc5b3eecba5bba8b48bda29081a667abef5739517f6e2f247a643ec6f37f|

実行したserverの配信本文・hash・finish、初回/後続文書のprobe-installedのphase/policyを照合。
server finishはブラウザー本文読了・register成功とは別。native内部要求IDはない。
HTML/app.js/SWの原本とsource-at-executionを保持し、製品ファイルは不変。

## 実アプリ結果

**初回成功0・再試行0・最終失敗2。各1回で終了、追加反復なし。**

|条件|初回文書|再読込文書|登録/オフライン検査|
|---|---|---|---|
|現行、origin46325|register-before/同期返却まで。await後・update地点は未観測|idle→registering、14poll、await後未観測|登録12秒不成立。native/cache/scope snapshot以降、オフライン検査は未到達|
|初回抑止、origin35911|suppress=trueソースは実行されたがregister同期返却まで。抑止地点は未観測|suppress=false、idle→registering、14poll、await後未観測|同じ登録12秒不成立。後続検査は未到達|

両方ともDCLとload/completeは到達し、DCL停止での失敗ではない。
境界/state/server/配信記録のdrop・不正・evaluate例外は0。pageerror/登録失敗警告の受信も0。
serverは版なしsw.jsの受付→200 finish/通常closeだけを記録し、版付きは欠測。
内部未発行やnative Promise pendingの証明ではない。

両方で**初回操作の有効比較が成立した証拠が不足**する。初回抑止コードが存在しても、
その分岐へ到達した記録はない。候補の効果は未確認で、無効であることの証明でもない。
人工Bでは初回await/update地点を準備ゲートで確認したが、元の実アプリは二つの登録入口を持ち、
getRegistrations>0でreloadする。人工比較の成功を今回の操作成立や製品修正へ代用しない。
各1回・別origin/context、タイミングと環境変動、診断配送の限界も残る。

## 判断と証拠

候補採用・製品修正なし。登録比較はここで終了する。
採用判断にはまず、元実アプリで初回await/明示update地点に到達したという有効な介入証拠が不足する。
さらに初回の更新検出・新旧SW/cacheの切替・オンライン手動更新・オフライン起動の非劣化が必要。
これを得るための反復・候補変更・追加待機や登録統合は今回行わない。

原本 `/workspace/hd152-app-initial-update-20261021/`。
protocol、旧原本hash、契約ログ、実行前/配信source、配信hash比較、target.log/summary、
両初回trace/動画/画像/error-context/状態JSON/継続JSON/比較JSONを保持。retry資料はない。
失敗後evaluate/storageState/自動復元は実施していない。
通常CIを実行する場合は同HEADの結果をPR冒頭/外部証拠へ記録し、このCI外2失敗と別集計にする。

旧保存実null、自然DCL停止、runtime navigation内部エラー/現SW関与、SW/通信/Cache API例外、
Chromium重複宣言は別件の未解決。53例1/49/3、同期外15manualを維持。
iPhone実機・WebKitオフライン・5-6は未確認。PR152ドラフト・公開保留、PR151未変更。
