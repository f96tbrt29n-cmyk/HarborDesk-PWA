# PR152 hashイベント入口と既存pollの限定診断

基準: `126225bf270e0a57d7f519a1d551263067feeada`。
対象: `release smoke: hash navigation cancels stale fleet-suggester recovery` 1ケースだけ。
製品のworkspace-tabs.js、SW、保存形式、元の画面操作/期待値は変更しない。
旧CI39944200383の初回はuserEpoch=1を満たすがsection=hdFleetSuggesterで3秒poll失敗、retry成功。
初回動画/PNG/画面記録はあるがtrace/イベント履歴がなく、原因未確定のまま。

## 記録範囲

`hash-navigation-audit.cjs`を対象ケースだけで有効にする。
page routeはlocalhostのworkspace-tabs.jsだけを一度取得し、既存hashchangeハンドラーの**内部先頭**へ同期のrecord呼出しを加える。
独立hash listenerではない。元のid取得→userEpoch更新→既存0ms予約と返却/例外は維持。
原/配信ソースとSHA256を試行別に保存する。source anchor不一致は診断失敗として記録し、元ソースのまま配信。
本文加工のためcontent-length/encodingを再利用しない。製品ファイルは変更せず、event.newURLへ判定を置換しない。

- handler設置後のinstalledとentry: 文書timeOrigin相関ID、文書内時刻、連番、旧/新/現在hash、group/表示先/guide選択、userEpoch。
- hashは安全な短いanchorだけで、URL本体/query/保存値は出さない。不明/秘匿化を区別する。
- ブラウザー記録はinstalled込み最大16件、以降drop。consoledebugからNodeへ配送し、Node記録は最大32件。
- 元のopen/hash代入/poll/700ms後のevaluateだけから元の値と診断stats/文書時刻を返し、同じpredicateで検査する。履歴最大32件、超過はdrop。
- 設置/上限到達/drop/console採取失敗/不正配送/source加工失敗を分離。記録なしをイベント未発生としない。
- 全体45秒、3秒poll、既存700ms保持、guide/非表示/元の例外検査は不変。追加timer/wait/Storage操作/Promise観測なし。
- finishはNodeで受信済みデータだけをJSONへ退避する。失敗後のevaluate/storageStateや自動復元なし。
- 対象の派生test型だけtrace on（snapshots false/screenshots/sources true）/video on。Playwright1.55ではこれらはworker optionなのでdescribe内useではなくtest.extendで対象だけ分離する。
- 通常CIのalways成果物にJSONと原/加工ソースを追加。元のtrace/videoも初回・retry別に保持する。

## 意味と限界

Node受信時計と文書時計を混ぜない。文書IDはnativeIDではなくtimeOrigin相関。
console配送の遅延/欠測はあり得る。カウンタやdrop0でも無影響/完全配送の一般証明ではない。
記録処理、追加メタデータの読取り、対象1資産のHTTP buffering/ソース加工、保持用worker分離に時間的介入がある。
論理上の処理順/返却/元例外の契約確認を、タイミングが完全に同一という主張へ広げない。
既存pollは離散観測であり、観測の間の短い再上書きを否定できない。700ms後の元観測はuserEpochを再読取りしない。

## 契約と限定実行

Node契約7件成功: 元handlerの相対順序/返却/throw/遅延処理、入口での一致/不一致の採取、秘匿化、既定未設置、上限/drop/診断失敗、元evaluate例外、失敗JSON保持を確認。
契約の意図したmismatchは人工条件で、自然事象の原因証拠ではない。
最初の--listはdescribe内worker optionの制約エラー（本文0件）、修正後はWebKit対象1件を選択。
最初のrunはmountpoint出力削除のEROFS（本文0件）。出力先だけmount配下へ訂正し、両原本を分離した。
有効な試験はWebKit1回/retries0。固定Playwright1.55.0-noble/digest・UID1001/init/ipc、Node24.19.0、WebKit2203/26.0。

実文書timeOrigin `1792796256258.0002`:
- installed at3072ms。
- open read4388–4457ms: hdFleetSuggester/userEpoch0。
- hash代入 read4585–4588ms。
- 実handler入口4590ms: old=#hdFleetSuggester、新=#guide、現在=#guide（**一致**）、表示先hdFleetSuggester/userEpoch0（元incrementより前）。
- 元poll4630ms: guide/userEpoch1。
- 700ms後5342ms: guide/fleetVisible false。最終userEpochはこの元観測では未採取。
初回成功1/再試行0/最終失敗0。元例外検査成功。browser/Node/poll drop0、上限未到達、採取失敗/不正配送/sourceFailures0。
実際の原ソースhashは製品と一致、初回trace/video/JSON/原・加工ソースを保持。
今回は異常未再現。入口前のhash書戻しはこの成功試行では未観測であり、旧失敗や一般的な後続再上書きを否定しない。
追加反復/製品修正なし。

## 通常CIと公開保留

この変更をpushした通常CI1回の対象SHA/URL/確定内訳はPR冒頭と証拠rootの最終記録へ残す。
固定ブラウザーケース一覧/件数、45分job/45秒試験/5秒undo/既存保存比較は変更しない。局所結果とCIの初回/retryは別集計。
自然保存実nullやDCL停止が出れば、初回原本と既設の値/own/列挙/ヘッダー/load後完全一致を優先する。
証拠: `/workspace/hd152-hash-entry-20261023/`。旧原本を上書きしない。
PR152ドラフト・公開保留、PR151未変更。マージ/公開/自動マージ有効化なし。
保存実null・DCL停止・旧hash失敗原因・登録/通信例外・12px差は未解決。53例1/49/3、同期外15manualを維持。
prepared PWAの現固定環境C/W各1回成功は完了。WebKitは登録準備後の停止origin再読込のみ確認済み、一般的オフライン/保存保持/iPhone実機は未確認。
