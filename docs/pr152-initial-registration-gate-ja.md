# PR152: 初回文書の登録継続を待つ準備対照

基準 `8180d4ea3e5ea6a44f02b6ae23f6ca8896b1f341`。
update抑止候補比較は完了・未採用のまま再実行しない。製品/SW/保存形式の変更なし。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。

## 旧現行側の順序と不足

前回の実アプリ現行側の初回原本を再利用した。
同じ`0-trace.trace`のdriver時計で、次の順序を確認できる。

|driver時刻ms|観測|
|---:|---|
|5571.388|旧文書の版付きregister同期返却。文書timeOrigin=1792620033239、文書at=2963|
|5584.062|getRegistrationsの最初の結果0|
|5695.801|getRegistrationsの次の結果1、元準備条件成立|
|5698.846|page.reload要求|
|5863.077|再読込先へのnavigation通知|
|未計測|旧文書pagehideの正確な時刻|

driver時計とNode worker/performance.timeOriginの値を直接減算しない。
pageIdと呼出し順はあるが、getRegistrationsの結果にnative文書/登録ジョブIDはない。
数だけを取得しており、その登録のscope/scriptURLは未採取。
版なしsw.jsの受付/200終了は別途あるが、これだけで版付きregisterの完了・readyや、
列挙された登録の発生APIを同定できない。二入口は同じscopeを使う。

既知の実アプリ記録はgetRegistrations>0後にreloadしており、初回継続を待った同条件の
完了証拠はない。人工Bの保持・破棄比較はHTML/入口が異なるため代用しない。
旧原本にないpagehide/Promise状態を今回の成功で補完しない。

## 変更条件と契約

元`pwa.spec`の**通常の準備条件は不変**。隔離project metadataの
`pwaInitialRegistrationGate: true`、現行配信`pwaInitialUpdateSuppression: false`だけで有効化する。
元getRegistrations準備の後・reload前に、受信済みNode履歴を既存pollで最大12秒待つ。
同じ初回文書/callのawait-resumed→registered-assigned→update-site→update-expression-returned
を要求する。抑止候補では使用不可。追加Promise反応、native API置換、Storage操作、固定sleepなし。
未成立なら元例外を再throwし、reloadや後続処理へ進まない。全体45秒・既定poll/元assertを維持。

新しいゲート3件＋関連18件、計21契約成功後に実行した。
部分境界では未成立、同一文書/call、12秒/既定間隔、失敗時JSONと元例外保持、
失敗後のreload/追加browser読取りなし、抑止候補への誤適用拒否を確認した。

配信source/SW/二つの登録入口/実HTML/UI/資産/server条件は前回現行側と同じ。
初回update-manager SHA256は`805973448710b314dfbe3f7f8579a87bd6aa07b78ddb29561015c328df37fbfa`、
後続は`e0f7dc5b3eecba5bba8b48bda29081a667abef5739517f6e2f247a643ec6f37f`。
原製品update-managerは`186527db6be79198fcfe49951173736c24ee30f776cc90f98f137d7dc71e73f9`。
共通の既存継続診断/phase記録と配信加工は時間的介入があり、未加工実行と同一とはしない。

## WebKit1回の結果

既存公式Playwright1.55/WebKit26.0 rev2203、元ランダムportの新規origin35783/context。
retries0・初回ゲート12秒/再読込後登録12秒・全体45秒で**初回成功1/再試行0/最終失敗0**。
本文11.325秒。予定した1回で終了し、追加反復やupdate抑止の再比較はしない。

以下は同じworkerのNode performance時計。文書時計とは別。

|Node ms|到達地点|
|---:|---|
|5914.575|元のgetRegistrations準備成立|
|5914.705|初回継続ゲート開始|
|6384.043|初回await継続、同文書でregistered代入・update式同期返却まで記録|
|6772.157|初回ゲート成立|
|6772.252|初回継続を確認してからreload要求|
|7060.009|再読込DCL|
|9561.884|新文書の登録12秒待機成立。状態pollはregistering/registering/ready|
|9575.540|元のnative/controller/cache/index/scope検査成功|
|9701.665|オフライン強制更新拒否・該当cache名維持・元errors=[]成功|
|9764.185|元のserver停止を確認し、停止originへreload|
|10118.323|停止originでDCL到達|
|12356.955|UI/module正常・controller存在・末尾errors=[]を含む元の後続検査成功|

初回文書では明示update有効のままawait後に進めた。update式の同期返却はnative updateの
決着ではなく、Promise反応を追加していないので決着は未観測。
再読込文書もawait/registered/update式返却を観測した。
停止originの文書はregister同期返却後、既存catch/error代入へ到達した。
末尾の元検査はオフライン文書の登録readyを要求していないため、この事実も保持する。
今回の停止origin検査成功を、全オフライン状態/実機iPhoneや別runtimeの安全性へ一般化しない。

境界/state/server/配信のdrop・不正・evaluate例外0。両方の元pageerrorゼロassertが成功。
serverは版なし/版付きsw.jsの受付・200 finish/通常closeを記録したが、nativeジョブIDはない。
server finishはbrowser本文読了/register成功や特定updateへの対応の証明ではない。
trace.networkは0件。実配信source/hashと文書phaseの照合はできるが、独立したbrowser本文hashは欠測。

## 解釈と保存範囲

**この1回では、初回文書を保持して待つと対象の既存await継続を確認できた。**
早期reloadの旧失敗とは別時点・各1回・異なるcontext/origin/環境変動を含む。
早期reloadが唯一の原因、待機が必要十分な修正、元テストや製品の不具合が解決したとはしない。
元テスト準備を恒久変更した結果でも、update抑止候補の効果確認でもない。

元`pwa.spec`には保存キー投入/完全一致/Storage境界監査がないため、今回保存実nullを評価しない。
通常CIのPWA5キー/空母2キーload後完全一致・専用6全非null試験はそのまま維持する。
旧CIのCache API例外と取込表示未更新、初回未到達の6キー保持を今回の成功で打ち消さない。

原本 `/workspace/hd152-initial-registration-gate-20261021/`。
旧原本hash/抽出順序、事前protocol、契約/実行ログ、初回trace/video/JSON、配信source/hash、
元/実行時source、環境設定/target-analysisを保持。retry自体はない。
診断JSONのinitialPreparation.ruleは旧文言「追加gateなし」を継承しており、この対照では不正確。
原本を変更せず解析に注記し、最終helperの文言だけを分岐対応へ訂正した。該当3契約成功。
この文字列訂正でbrowser試行は反復していない。originalTestPassedは変更準備下で元assert群が
成功した意味であり、未変更の元試験成功とはしない。

製品修正・候補採用なし。通常CIと隔離対照は別集計し、最終結果はPR冒頭/外部証拠に記録する。
保存実null・自然DCL停止・navigation内部エラー/現SW関与・通信/Cache API/旧SW例外・
Chromium重複宣言は別件の未解決。53例1/49/3・同期外15manualを維持。
5-6/iPhone実機/WebKitオフライン一般は未確認。PR152ドラフト・公開保留、PR151未変更。
