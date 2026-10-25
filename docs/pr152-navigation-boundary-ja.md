# PR152: 実SW navigation fallbackの未解決回帰と受動診断

基準HEAD `69716e35fb8f8b524ebf909b4b8acea941ef1261`、製品修正 `8c6b97c`、CI39523488840。開始時local/remoteは基準と一致、追跡差分なし（既存の未追跡node_modulesは保持）。PR152はドラフト・未マージ、auto_merge=null。PR151のHEAD `f829f5cebfb8b6c4cb37f64d89175ff6722e2c9c`を維持する。

**今回の変更は隔離runtimeの診断・契約・記録のみ。製品SW修正なし。** キャッシュ更新Promiseの限定改善は維持する一方、WebKit navigationの実ブラウザー回帰は未解決で、公開保留。Node14契約・通常CI成功はこの失敗の解決証拠ではない。

## 新規実行前に比較した既存4試行

原本root `/workspace/hd152-sw-cache-lifetime-20261021/`。旧source/契約・browser原本109ファイルを既存manifestのSHA256で照合し、全一致。原本は変更しない。

|実行順・日時UTC|実SW source SHA256|origin / context証拠|結果・資料|
|---|---|---|---|
|1: runtime、00:39:34開始のうちWebKit|5fe604f7c43ffe020b5a6e8f3643ac4b7ef54d95e297cafab7863fbc4362db41|127.0.0.1:33741、traceのcontext@52e967…、page@350be663…|online/GET fallback成功、navigationで内部エラー。初回trace/video/image/JSONあり|
|2: runtime-before、00:40:56開始|7637e286d38206e577c74bf0f9484ccb87d1ccc48b156811c16c91ab8aeda8b4|127.0.0.1:38021、新規context、native ID未保持|旧SW成功、JSON/summaryのみ|
|3: barrierのfirst-fix-again、00:43:07開始|5fe604f7c43ffe020b5a6e8f3643ac4b7ef54d95e297cafab7863fbc4362db41|127.0.0.1:40641、新規context、native ID未保持|現SWの手動再実行成功、JSON/summaryのみ|
|4: 同barrierのresponse-barrier|67f8bf84376dd71fbdad654804c19088d4bf26dcd5749ff69420cc08fc98b6dc|127.0.0.1:43477、新規context、native ID未保持|未採用候補成功、JSON/summaryのみ。今回再試験なし|

共通: Playwright1.55.0、WebKit、workers1、retries0、45秒、390×844、serviceWorkers=allow、browser offline=false、単一versionなし登録、synthetic shell、実Cache API、SWバイト列未加工。各context/originは別。旧失敗traceのUAはSafari26.0だが実engine版を専用採取しておらず、成功試行の実行版も未保持。現在のインストールmanifestがWebKit26.0/revision2203であることを過去全試行の直接証拠にはしない。

最初のruntimeはsourceを直接sw.jsから読む旧ファイル名.spec.jsで実行。その後の.experiment.cjsはsourceのmetadata指定を追加しただけで、既存assertion/準備/切断手順に差分なし。cache580へ実ASSETSをprecacheし、indexにstale-shellを投入→online reloadでnetwork shell返却とcache本文を確認→first.js?v1 online取得・cache本文確認→outage=true→GET?v2→navigation reload。切断はHTTP serverのres.destroyであり、setOfflineとは異なる。元Responseを調査目的に追加消費していない。既存のcached()はcache.matchが返す別Responseを準備確認のために読む。

元失敗のserver requestsにはoutage中first.jsが2件、`/`が0件。成功3試行はfirst.jsが各7件、`/`が各1件。再接続回数の差は観測事実だが、その理由・ブラウザー内部のretry主体は未計測。recordには時刻/要求IDがなく、SW fetchとの対応もない。

### 元失敗の段階別評価

|段階|初回現SW失敗|旧SW成功・現SW手動再実行成功・候補成功|
|---|---|---|
|1 navigation開始／要求・失敗|reload API開始・拒否を確認。WKPage._onLoadingFailed→FrameManager.requestFailed→frameAbortedNavigationのstackあり。公開request ID/要求通知は未採取|reload後のassertionとnavigationFallback=trueを確認。個別request通知未採取|
|2 SW fetchへの到達|未計測。server `/`欠測はSW未到達の証明ではない|未計測|
|3 network失敗→fallback開始|navigationは未計測。直前GET fallback成功と混同しない|serverでoutage `/`を受け破棄した記録あり。SW内network拒否/fallback開始時刻は未計測|
|4 caches.match hit/miss/拒否|navigation中は未計測。直前に準備したcacheの存在はhitの直接記録ではない|未計測。外部結果はcache fallbackと整合するが、内部観測に置換しない|
|5 応答Promiseが有効Responseで決着|未計測|SW側Promise決着は未計測。ブラウザーでshell描画は確認|
|6 browser応答受信／commit／DCL|応答/commitの個別通知は欠測。DCLまでのreload待機が内部エラーで拒否。後続のDCL有無は追加evaluateせず未確認|DCLまでreload成功とshell/controller検査成功。個別response/commit時刻は未計測|

失敗traceのbrowser時計内ではreload call@28開始3840.747ms→拒否3850.139ms（約9.4ms）。test.traceの別時計のAPI時刻とは直接減算しない。0-trace.networkは0行（snapshots:falseのtrace）で、空を全要求未発行の証拠にはしない。pageerrorは0件だがreload自体が拒否しており試験は失敗。consoleには内部resource errorあり。画像/videoにnetwork shellが残ることは新文書commitの証拠ではない。

この約9.4msの内部遷移エラーは、45秒DCL自然停止、pwa.specのregistering表示検査失敗、Chromiumのofflineエラーとは別分類。

## 選んだ不足境界と最小診断

選択した問い: **navigation応答のブラウザー通知があるのにcommit/DCLが失敗するのか、応答通知もない失敗なのか。** stage6の観測とstage1の対応付けに限定した。

`tests/sw-navigation-observer.cjs`はNode側のpage request/response/requestfinished/requestfailed、main frameのframenavigated/DCL、crashを受動記録する。requestはnavigationとfirst.jsだけ、serverのoutage受付/破棄・既存reload前後境界も同じNode hrtimeの受信時計に記録。IDはWeakMapの観測用要求ID、commitSequenceはmain-frameの観測連番で、native文書/loader/context IDではない。

- 既存明示runtimeのmetadata.observeNavigation=true時だけ有効。明示configではHD_SW_CACHE_OBSERVE_NAVIGATION=1で選択可能。通常CI/製品ページへ観測器を追加しない。
- 応答のstatusのみを採り、body/text/clone/finished Promiseを呼ばない。SW本文/ API/Promiseに変更・観測reactionなし。MessagePort/console配送/追加waitUntil/timer/追加fetch/Storage API/失敗後evaluate/storageStateなし。
- 記録上限128、drop数を明示。Node callbackの配列追加・protocol受信処理には負荷があり、レースのタイミングを変える可能性は残る。SW寿命を直接延ばす構成ではないが「無影響」とは断定しない。
- snapshotはassertion完了または例外伝播後のfinallyでNode内だけから作成し、その後listenerを外す。ブラウザー/SW内部時刻と直接減算しない。response通知はヘッダー観測で、本文引渡し完了やSW内Promise決着ではない。requestfinishedもSW側返却と同一視しない。

契約3件成功: (1)response/finished/commit/DCL分離・要求ID連携・body不読取り・dispose、(2)requestfailedとresponseを区別・対象外要求除外、(3)上限/drop/保持snapshot独立性。人工Emitter契約でありブラウザー故障の再現ではない。

## 事前固定した比較と結果

新evidence root `/workspace/hd152-navigation-boundary-20261021/`。protocol-before-runs.jsonを実行前に保存。**旧SW1回→現SW1回、WebKitのみ、retries0、workers1、45秒で終了。** source以外のfixture/cache準備/切断/assertion/観測器は同一。別の新規origin/contextを使うのでoriginと実行時刻は異なる。未採用候補は再実行しない。

|条件|origin|browser.version()|初回結果|記録数/drop|
|---|---|---|---|---|
|旧SW、01:20:26 UTC開始|127.0.0.1:36061|26.0|成功1・再試行0・失敗0|40/0（上限128）|
|現SW、01:20:34 UTC開始|127.0.0.1:46517|26.0|成功1・再試行0・失敗0|40/0（上限128）|

|navigation段階（各試行の開始markからのNode受信ms）|旧SW|現SW|
|---|---:|---:|
|request|2.69|3.31|
|server受付→破棄|3.99→4.00|3.86→3.86|
|response status200|6.04|6.19|
|main-frame commit|9.96|9.06|
|DCL|9.98|11.03|
|reloadのDCL待機return|10.17|11.10|
|requestfinished|22.20|18.59|

いずれもonline取得、native cache更新、GET切断fallback、navigation fallback、shell/controller、errors=[]の全既存assertion成功。stage6は新成功試行で直接区別できた。stage2〜5のSW内部は今回は観測していない。この新しい成功記録で旧失敗を補完せず、初回失敗→修正後成功とも報告しない。

この比較から新SWの回帰確定/無影響や内部エラーの解決は判断不能。observer内の要求終了はDCLより後にも観測されるため、DCLを全要求終了の代用にしない。製品変更の追加/取り消しはせず、限定契約改善と実ブラウザー回帰未解決を併記する。

## CI・保存・残件

最新HEADの通常CIはPR冒頭へ記録する。通常CIの固定リストは今回の明示runtime診断および既存pwa.specを扱わない。CIの緑、診断ファイル名、Node14契約でこの公開保留条件を合格へ置換しない。既存テストの45秒/アサーション/pageerror検査を変更しない。

保存UI/プランナー/探索/SW登録/版cache名/保存形式の変更なし。既存の正常保存証拠を再利用し、保存試験の全面反復なし。前回の空母元fixture2非null/4未投入nullの6要素一致と、専用6キー全非null＋完全一致は別証拠として維持。今回の小さいruntime fixtureはStorage APIを使わず、保存6キー保持を新しく検証した試験ではない。

原本は旧root、今回のprotocol・比較JSON・old/current各log/summary/result・契約summaryは新root。新2試行は成功でtrace/video未生成、retry資料なし。旧失敗には初回trace/video/imageあり、他3成功試行はJSON/summaryのみ。旧成功試行のnative context ID、実engine版、SW内部各段階、旧失敗の公開要求IDは取得不能/未計測であり後付けしない。

旧5実null、自然DCL停止、旧SW/通信/Cache API例外、Chromium重複宣言、5-6、iPhone実機/WebKit offlineは未解決・未確認。53例1/49/3、同期外15候補manualを維持。PR151未変更、PR152ドラフト維持、マージ/公開/自動マージ有効化なし。

次の判別する問い1つ: **内部navigationエラーが再発した試行で、browser response通知は観測されるか。** 今回の受動診断で要求失敗のみ/応答後commit失敗を区別する。SW内部の到達・応答決着・本文引渡しの判別は別の不足証拠であり、未計測を未到達とは呼ばない。
