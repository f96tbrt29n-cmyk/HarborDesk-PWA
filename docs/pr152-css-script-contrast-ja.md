# PR #152: 先行CSS待ちと先頭同期script待ちの隔離対照

基準: `8331bbb36e49e290d5df5aba2e699d361c6946f4`、CI39503882702。製品修正なし。自然DCL停止・旧保存5キー実null・SW例外の原因確定ではない。

## 既存証拠を再利用した範囲と不足

- `docs/pr152-script-boundary-native-ja.md`の31番本文保留、および `/workspace/hd152-resource-timing-20261019/body-control/compact-stage-matrix.json` のWebKit/SW無効44番本文保留を再利用した。サーバーが1024bytes送出した状態で、対象scriptの終了／loadとDCLは未到達、後続scriptの要求終了は到達、解除後に進行した。今回この実験は繰り返していない。
- これらは先頭scriptではなく、先行CSSを制御せず、唯一要素の識別・隔離評価マーカーもない。「先行CSS保留」と「先頭同期script応答保留」を区別する問いには不足するため、A・Bの両方が必要だった。
- 自然失敗の資料は前回抽出した `/workspace/hd152-single-script-20261021/original-css-analysis.json`、`selected-boundaries.json`と元の初回trace／動画／JSONを再利用。全履歴の再集計はしていない。

## 事前に固定した条件

隔離HTTP serverをケースごとに127.0.0.1の未使用portへ起動し、Playwrightの新規contextを使用。HTMLは先行stylesheet→通常の外部同期script→次の同期script（async/deferなし）の最小構造。製品HTML／JS／SWを変更・配信せず、Storage API・既存プロフィールに触れない。SWは隔離contextでblock、登録なし、controller=null。request interceptionは使わず、serverが応答ヘッダー送信前で保留する。通信・例外・タイミングはSW有効の製品条件と異なる。

|条件|保留対象|通常応答|
|---|---|---|
|A|`/preceding.css`のヘッダー・本文|`/first.js`、`/following.js`|
|B|`/first.js`のヘッダー・本文|`/preceding.css`、`/following.js`|

WebKit各1回・retries=0・45秒期限。既存30秒watchdogのstall-loadingを受けた後、記録・アサーションを行い直ちに明示release、その後DCL・要求終了・実行マーカーを検証して終了。失敗時もfinallyで隔離serverだけを解除・終了し、追加のpage評価／storageState取得は行わない。新しいタイマー、MutationObserver、レイアウト／全量DOM取得、script／SW APIラッパーなし。

既存observeReload/native probeのparserBoundary=true、parserLoadBoundary=42、parserSingleScript=true、keepNative=trueを再利用。fixtureには42番scriptはないため、そのload境界記録は出ない。既存watchdog／DCLの2理由を使用し、3記録上限は変更しない。実行開始・終了マーカーは人工first/following script内だけ。製品への評価マーカーはない。

事前条件は `/workspace/hd152-css-script-contrast-20261021/protocol.json`。明示実行configは `playwright.css-script-control.config.cjs`。通常の固定browser regressionリストに人工保留試験を混ぜず、実アプリの試験もskipしない。

## 結果: 各1回で終了

追加server契約2件は成功。既存診断19件の基準HEADでの成功証拠を再利用し、変更のない契約・保存UI・探索領域を反復していない。

Aは32.355秒、Bは30.431秒、両方初回成功、再試行0、最終失敗0。これは意図した人工保留を観測・解除できた結果で、製品の停止を解消した結果ではない。

|watchdog時の観測|A: CSS保留|B: 先頭script保留|旧自然停止の新文書|
|---|---|---|---|
|script要素数|1|1|1|
|唯一要素|隔離originの`first.js`|隔離originの`first.js`|URL・属性は未計測|
|属性|type空、async/defer=false、connected=true|同左|未計測|
|CSS要求／応答／終了／失敗|要求あり／応答なし／終了なし／失敗なし|要求・200応答・終了あり／失敗なし|28件中27件は応答・終了、mobile-layout.cssは要求のみで他は欠測|
|先頭script要求／応答／終了／失敗|要求・200応答・終了あり／失敗なし|要求あり／応答なし／終了なし／失敗なし|app.js要求あり、応答・終了・失敗は欠測|
|先頭script Resource Timing|あり。decodedBodySize325、transferSize625、workerStart0|なし|完了entryの観測なし|
|JS Resource Timing総数|2（先頭＋後続）|1（後続）|0|
|script load／error|0／0|0／0|0／0|
|先頭実行開始・終了|未到達|未到達|製品に評価マーカーなし、比較不能|
|readyState／DCL|loading／未到達|loading／未到達|loading／未観測|
|後続scriptの要求終了|あり|あり|43番update-manager.js等の要求終了も欠測|
|SW controller|なし|なし|activatedと切替を観測。内部取得・本文段階は未計測|

Aは先頭scriptの通信・Resource Timing完了を観測しながら、その実行・load・DCLはCSS解除まで進まなかった。したがって、scriptCount1/load0だけではscript通信未完了と区別できない。一方、自然失敗のapp.js完了欠測／JS resource0とは異なる。自然条件のCSS待ちを一般に否定するものではない。

Bは先頭scriptの完了記録欠測という点では自然失敗に似るが、CSS終了と後続scriptの通信・resource完了がある点で異なる。単一scriptを保留したこのfixtureを、自然失敗の欠測全体の説明へ置き換えない。

## 解除後の進行と時計

|Node observeReload経過ms|A|B|
|---|---:|---:|
|既存watchdogのstall通知|30061|30033|
|release直前のphase|30077|30042|
|DCL待機完了phase|30094|30057|

両条件とも解除後にCSS・先頭・後続のrequestfinished、先頭のResource Timing、script load2件、first:start→first:end→following:start→following:end、native DCLを確認。両方pageerror0。境界はwatchdogとDCLの2記録／上限3、drop0、切詰めなし。独立JSON・summary・添付に唯一要素のメタデータが保持された。正常にDCLでwatchdogを取り消す既存の製品側条件は変更しない。

browserイベントとfixture serverイベントはobserveReloadの同じNode時計のphaseでも対応付けた。server独自monoは別欄、script実行マーカーはnative doc/timeOriginとat/performance.nowを持つ。異なる時計を直接減算しない。server response-finish/end-calledはサーバー側の処理であり、ブラウザー本文読了・評価完了とは別。requestfinished、resource、load、マーカーも別段階として保持する。

## 保存資料と限界

今回の資料rootは `/workspace/hd152-css-script-contrast-20261021/`。

- `controls/summary.json`、`controls.log`、`contracts.log`、`comparison.json`、`control-results.json`。
- `css-held-css-script-control.json`／`script-held-css-script-control.json`と各released JSON: server・browserイベント、native、実行マーカー。
- `controls/artifacts/`の各条件に**初回の人工対照trace.zip・video.webm・reload-navigation-evidence.json**。成功時もtrace/videoを明示保持。再試行は未実行で資料なし。traceはsnapshots:falseで全量DOM採取なし。
- `reused-evidence.json`は既存WebKit44番対照の選択部分と原本ハッシュ。`original-manifest.json`は旧自然失敗の4原本ハッシュ。

旧自然失敗で唯一要素のURL・属性、評価マーカー、内部SW本文段階は未計測。新しい人工／成功記録から補完できない。SWなし・単純HTML・小さい人工本文・新context・応答全体の保留という差があるため、元のmobile-layout.cssやapp.jsが実際に未完了だったか、SWが原因かは未確定。

今回、製品不具合の修正はない。次の判別する問いは「自然停止時の先頭scriptに通信終了・Resource Timingがあるのに実行/loadがないのか、通信完了自体が観測できないのか」。既存singleScriptを含む通常CIの同一文書記録を使用し、通知欠測だけで内部未完了と断定しない。停止が出るまでの反復や同じA/B対照は行わない。

元空母fixtureは変更せず2キー非null／4キー未投入nullを維持。今回の人工fixtureはStorage API未使用で、専用6キー全非null・完全一致試験の代わりではない。旧保存5キー実null、自然DCL停止、SW／通信／Cache API例外、Chromium重複宣言、5-6、iPhone実機・WebKitオフラインは残件。53例1／49／3、同期外15候補manual、保存UI修正39801e0、PR151を維持する。PR152はドラフト、マージ・公開・自動マージ有効化なし。

通常CIの最終SHA・初回／再試行別結果と限定pageerror検査範囲はPR本文冒頭へ記録する。人工対照のpageerror0と、通常試験の初回合格やthree-plane等のstack限定検査を混同しない。
