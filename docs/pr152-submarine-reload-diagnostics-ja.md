# PR152: 潜水艦夜戦保存へ既存境界診断を適用

基準8394a8d。CI40042612405の潜水艦初回/retryのDCL停止は未解決。
旧原本の再解析・prepared保存保持・hash対照の再実行は行わない。

## 変更と不変範囲

`night-policy-reload.spec.js`の潜水艦1ケースだけに既存observeStorageを適用。
scriptErrorBoundary/keyPresenceを有効化し、元fixtureの前後・元reload直前・元policy-restored地点で採取する。
元々あるinit/app.js load/DCL/readystatechange/complete/load/pagehide/storage/最初のSCRIPT errorの受動記録も使用。
getItemの本文は出さず、存在/長さ/参考hash、own、列挙、length前後、readAt/sequence/timeOriginを保持する。
キーごとgetItem→own、列挙length前→scan→length後という非原子的な読取り。128走査・例外・途中変化時は不存在と断定しない。
Storage書込み・初期化・復元・sentinelは追加しない。失敗後の追加evaluate/storageStateなし。

元々あった要求/応答/終了/失敗、script load/error、Resource Timing、30秒watchdogは維持。
既存parserBoundaryの42番home-dashboard.js loadを選び、watchdogとDCLを合わせ最大3記録/文書。
40番も同時追加しない。6要素のURL/属性/connected/load/error、走査128・一致最大4を保持。
singleScriptも既存watchdog限定で有効化。記録なし・present=false・走査上限による不明を区別する。
43番loadや要素存在は評価完了・後続処理完了・通信/本文完了の証明ではない。

初回trace/videoを成功時にも保持するため対象test typeを分ける。
他の夜戦ケースは元のretain-on-failure traceをtest typeの既定へ移し、保持範囲を維持する。
親suiteのtrace設定が対象のonを上書きしない構成。videoがworker optionのため通常CIではworker境界/起動負荷が変わり得る。
追加Storage読取り・console配送・scriptメタデータ走査・trace/video記録によるタイミング介入は残る。
新タイマー/全量DOM/本文取得/追加fetch/SW・Promiseラッパーは追加しない。製品と診断ライブラリは未変更。

## 元fixture

|キー|操作と確認範囲|
|---|---|
|harbordesk-equipment-v1|元fixtureが魚雷2個・潜水艦電探1個を投入。監査対象|
|harbordesk-ship-roster-v1|伊58改、実masterId、個体93、Lv90、増設0。監査対象|
|custom-fleets/fleet-calculator/kancolle-sync/pwa-v1（harbordesk接頭辞）|fixtureでは未投入。製品生成の有無は採取結果で判断|
|harbordesk-night-ci-policy-v1|元UI操作sub-radar→sub-lateで書込み。固定6キー監査の対象外。元の方針復元assertを維持|

データ投入式のSHA256、元操作/待機/アサーションの空白正規化SHA256を基準と照合する契約を追加。
元fixtureの期待する所持個体、増設なし、横幅、方針復元と既存のhdFSSuggestionHtml stack限定pageerror検査を変更しない。
この限定例外検査が通ることを、全ページ例外ゼロと表現しない。
監査は参考hashを含むが、潜水艦に新しい文字列完全一致・load待機assertを追加したわけではない。

## 文書への対応付けと限界

native/script/resource/parserとStorageは同じperformance.timeOriginで直接照合できる。
文書内時刻は各文書の範囲で使用し、Node受信時刻と直接減算しない。
ブラウザー要求IDはrequest/response/finished/failedで対応可能だがnative文書IDはない。
reload区間・main frame・URL・Node時刻は候補の対応根拠であり、URLだけで新旧文書や内部SW要求を同定しない。
Resource Timingはその文書の完了記録。欠測を未発行/本文未完了/SW原因の証拠にしない。
通常応答ヘッダー消去指示の診断はこのケースには追加しない。

## 実行

固定Playwright1.55.0-noble既存digest、WebKit2203/26.0、UID1001、Node24.21.0。
元fixture・準備待機・45秒期限を維持。WebKit対象1回/retries0で終了し、成功目的の反復なし。

```sh
npx playwright test tests/night-policy-reload.spec.js --grep 'submarine night CI policy regenerates the mobile owned loadout and persists the selected set$' --project=webkit --workers=1 --retries=0
```

35件の既存/配線契約と--list 1件を実行前に確認。局所結果と通常CIは別集計。
本ケースは通常CI固定一覧に元々含まれている。変更push後の通常CIを1回確認する。
原本 `/workspace/hd152-submarine-reload-diagnostics-20261024/`。
結果は同rootの確定報告とPR冒頭に記録する。
旧自然実null、DCL、早期再読込、navigation/登録/通信例外、hash旧失敗等を解決済みにしない。
PR152 draft/公開保留、PR151未変更、マージ/公開/自動マージなし。
53例1/49/3、同期外15候補manualを維持。

## 局所結果（通常CIとは別）

WebKit1回/retries0、初回成功1/再試行成功0/最終失敗0。実時間9.6秒。
新文書1792817768767はDCL475ms→policy-restored監査1426ms、最終readyStateはinteractive。
投入2キーは非null/ownあり/列挙あり、lengthと参考hashはreload前と一致（文字列完全一致ではない）。
未投入4キーはnull/ownなし/列挙なし、length10→10・走査完了。異常実nullは採取範囲で未観測。
新旧各文書に42番load/DCLの2記録、watchdogはDCLで取消され未発火。SCRIPT errorも未発火。
DCL時は対象6要素が存在してload観測あり。42番load時点の後続不在は挿入途中の観測であり異常扱いしない。
Storage/native/parserのdrop0、列挙/要素走査の上限/切詰め/採取例外なし。
元試験の終了条件を維持したため新文書load/completeは未観測。停止位置の自然境界は未再現。
ブラウザーpageerrorの記録0だが、元assertのstack限定範囲は不変。サーバーログのBrokenPipeは別に保持し、原因を推測しない。
初回trace/video/保存監査/reload JSON/サーバーログ/原・配信ソースhashを保持。
診断設置・正常経路確認として終了し、旧初回/retryの欠測を補完しない。
