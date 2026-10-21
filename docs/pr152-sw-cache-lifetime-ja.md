# PR #152: キャッシュ更新Promiseの拒否・寿命の限定修正

基準 `0fa53232339c803562fe0b1bfe7d815d0061a345` / CI39508024577。開始時のlocal/remoteは同一、未追跡node_modules以外の変更なし。製品修正は `8c6b97cab8af9081660bc5bd9d47576faaa15898`。公開・マージ・自動マージ有効化はしない。

## 確認した独立欠陥と変更範囲

旧navigation／通常GETは成功したfetchの中で `caches.open(CACHE).then(c=>c.put(...))` を起動するが、そのPromiseを返さず、waitUntilにも渡さず、拒否handlerもない。既存probe試験は正常putとネットワークfallback、旧本文保留試験は通信・実行の分離を扱い、実SW全文のopen／put拒否は未検証だった。CSS／先頭script A/Bは完了証拠を再利用し、反復していない。

今回の修正はfetchを1回だけ開始し、**応答とは独立したキャッシュ更新をdispatch中にwaitUntilへ登録**する。成功応答のcloneをキャッシュ用に1回作り、open→putを返す。キャッシュ更新拒否は、その限定chainで捕捉して固定の警告とエラー名（最大64文字）を出す。URL・本文・認証情報・エラーメッセージはログしない。ネットワーク失敗は元のrespondWith側fallbackに任せる。

|条件（navigation/GET各1）|旧SW|修正SW|
|---|---|---|
|open拒否|元ネットワーク応答を返す、未処理拒否1、寿命登録0|同じ元応答、未処理拒否0、警告1、寿命登録1・完了|
|put拒否|同上|同上。キャッシュは未更新のまま明示警告|
|正常・putを遅延|応答は先に届くが更新寿命を登録しない|応答は先に届き、waitUntilはputの決着までpending。解除後にclone本文を保存|
|ネットワーク失敗→cache hit|cache応答|同じcache応答。open/putなし|
|fallback miss|応答値undefined|同じ。成功レスポンスに置換しない|
|fallback拒否|応答Promiseが拒否|同じ拒否を応答consumerへ伝播。cache更新警告に誤分類しない|

navigationの`./index.html`→`./`、GETの元Request／ignoreSearch:true、非GET不介入も維持。CACHE/ASSETS/install/activateはfetch handler以前のソースがbyte一致。v1.0.580/build580/cache580、登録方法、保存形式は変更なし。Cache API全般、install/activate拒否、ネイティブSW障害全般を解決する修正ではない。

## 実ソースの隔離契約と観測の限界

`tests/sw-cache-lifetime.test.cjs`が各条件を別Node childで起動。`sw-cache-case.cjs`はファイルの**実SW全文をvmで評価**し、fetch handlerへRequest相当／fetch／Cache APIの制御doubleを渡す。install/activateは登録だけで実行しない。実Responseと実Promiseを使い、元応答を直ちに消費してもcloneをキャッシュへ保存できることを検査する。

切り離されたキャッシュPromiseへ試験側then/catchは付けない。processのunhandledRejectionイベントで観測し、event loopを2 turn進めてからwaitUntilに渡されたPromiseを検査する。正常な遅延putだけは、その後に寿命のpendingを観測する。同期登録・元Request・fetch回数1・clone回数1・元本文／clone本文・拒否警告・fallback拒否の伝播も検査。

**限界:** Nodeのprocessイベントlistenerはデフォルトのprocess終了を変えるが、拒否reactionをPromiseへ追加したわけではない。実ブラウザーのServiceWorkerGlobalScopeのunhandledrejectionやworker終了時刻の直接観測ではない。waitUntilのdoubleは登録とPromiseを保持し、実SWの内部寿命実装を再現しない。open／put拒否を実ブラウザー内のネイティブCache APIへ注入した証拠はない。

最終の同一契約14条件を旧／修正ソースで各1回実行：旧8成功・6失敗（open/putの4未処理拒否、正常2条件の寿命未登録）、修正14成功。fallback関係・非GETは旧でも成功。応答は旧open/put拒否でも返っており、「旧SWがこの条件で応答を失った」とは報告しない。

最初の契約snapshotにも旧／修正各14実行がある。同期登録時点・遅延put待ち・clone本文の検査を補う前の開発記録としてbefore/afterへ保持し、最終before-final/after-finalへ合算しない。追加の応答寿命対照ソースも同じ14契約は成功したが、製品採用していない。ブラウザーの初回／再試行件数とNode故障注入の期待失敗を混ぜない。

ブラウザー必須6ジョブとPages静的工程へ14契約のguardを追加した。Pagesを実配信したのではなく、将来実行時の検査を追加しただけ。

## 実ブラウザー回帰: 成功・失敗を分離

全て45秒・workers1・retries0、新しいテストcontextのみ。既存のアサーション／準備処理は変更していない。

|工程|条件・回数|成功|失敗|結果・限界|
|---|---|---:|---:|---|
|関連既存試験|Chromium/WebKit各4、計8|6|2|空母通常・専用6キー・PWA保存再起動は両エンジン成功。pwa.specは両失敗|
|修正前SWのpwa.spec比較|各エンジン1、計2|0|2|WebKitは同じ登録表示検査失敗。Chromiumは別段階のオフライン画面待機期限|
|小さい実SW診断・修正版|各エンジン1、計2|1|1|両方online/GET fallback成功、WebKitの遷移fallbackで内部エラー|
|小さい診断・修正前SW|WebKit1|1|0|同じ遷移まで成功。修正の関与を除外できない|
|応答決着まで寿命を保つ候補との比較|最初の修正版を再実行1＋候補1、WebKit|2|0|最初の修正版も成功して識別できず。候補を製品採用しない|

上記は計15ブラウザー実行、10成功・5失敗、自動再試行0。ただし同じ修正版の診断再実行成功1件を**初回安定成功**へ格上げしない。旧SW比較・人工対照・製品回帰を混ぜた合計を「10件初回成功」とも表現しない。失敗を得るため／成功するまでの追加反復は終了する。

### 保存・起動で確認した範囲

- 空母の元fixtureは2キー非null／4キー未投入nullを維持し、6要素の完全一致と方針復元を両エンジンで検査。全6非nullの証拠ではない。
- 既存retentionFixtureを使う専用条件は投入前後の6キー全非nullと完全一致を両エンジンで確認。初期initが全nullなのは投入前の新規contextで、投入後から再読込init／復元までの全存在と区別する。監査の長さ／ハッシュ一致だけでなく、元テストの文字列完全一致assertionが成功。
- PWA cached runtimeは5キー完全一致、先制対潜4艦・HQ20・所有判定／プランナー復元成功。Chromiumはemulated offline再起動、WebKitは既存条件どおりonline再起動とcache存在の検査。WebKit実機offlineを検証済みにしない。

### pwa.specの失敗と比較

修正版Chromiumはcache/index存在・controller有効・offline更新拒否とcache保持までは成功し、サーバー停止＋setOffline後のreloadでERR_INTERNET_DISCONNECTED。修正前の同じ試験はreload後の#hdWorkspaceNav待機で45秒期限（trace保存等のteardownを含むreported durationは56秒。期限を延長したのではない）。停止段階は異なり、同一原因とも修正の無影響とも断定しない。

修正版／修正前WebKitは共に、active controller/cache/indexが存在する一方、アプリの表示用状態がregisteringで、既存registered/ready検査に失敗。offline操作には未到達。後からevaluateして証拠を変えておらず、状態がその後readyになるかは未確認。判定や待機を緩めて成功化しない。

比較用のpwa.specコピーはserver rootを明示し、`/sw.js`応答だけを保存済み旧ソースに差し替えた。アサーション／45秒は同じ。別origin/contextであり単純な因果証明ではない。

### 実SW／native Cache APIの小さい診断

`tests/sw-cache-runtime.experiment.cjs`と明示configは、同じ実SWバイト列・実Cache APIを新規loopback originで使用し、HTML shellだけを小さいfixtureにする。SW API wrapper／Storage API／request interceptionなし。登録は隔離fixtureのversionなし単一登録であり、製品の二つの登録経路と同じとはしない。

古いindexキャッシュを隔離cacheだけに投入後、online reloadで新shellが返りcacheも更新されること、GETがnetwork本文を返しcacheへ保存されることを確認。続いてserverが接続を切り、GETの別queryがignoreSearch fallbackすることと、navigation fallbackを検査する。ブラウザーのonline状態は保ち、emulated offlineの問題と分ける。

修正版は両エンジンでonline／cache更新／GET fallbackを完了（pageerror配列は0）したが、WebKitはnavigationで内部エラー。試験全体は失敗で、部分成功を合格に置換しない。修正前WebKitは全体成功。その後、最初の修正版と「waitUntilが応答／fallback決着も待つ」候補を各1回比較すると両成功し、仮説を判別できなかった。反復成功で初回失敗を解決済みにせず、候補コードは証拠rootだけに保管。最終sw.jsは最初の最小修正と同一バイト列。

この新規fixtureは開発時に.spec.jsで実行した後、全アサーションを保ったまま**明示診断.experiment.cjs**として記録する。通常CIがこの未解決の遷移条件を検査したとは報告しない。元のpwa.specは元々固定CIリスト外で変更なし、他の既存試験を除外したのでもない。最小診断を含めた私用回帰の失敗は公開保留理由として残す。再現は `npx playwright test -c playwright.sw-cache-runtime.config.cjs`、旧SWを使う場合はHD_SW_CACHE_SOURCEで隔離ファイルを指定。出力先は指定又は時刻別なので原本を上書きしない。

## 証拠と未確認事項

root: `/workspace/hd152-sw-cache-lifetime-20261021/`。

- `sw-before.js`（SHA256 7637e286d38206e577c74bf0f9484ccb87d1ccc48b156811c16c91ab8aeda8b4）、`sw-first-fix.js`（5fe604f7c43ffe020b5a6e8f3643ac4b7ef54d95e297cafab7863fbc4362db41）、未採用`sw-response-barrier-control.js`。
- `before-final.log`/`after-final.log`と各14条件JSON、初版before/after、`barrier-node`を分離保持。
- `browser`、`baseline-offline`、`runtime`、`runtime-before`、`barrier`にsummary/log/各試行の添付。`all-browser-results.json`は分類済み一覧。失敗は初回trace・動画・画像あり、成功時trace/videoなし。いずれも自動retry資料ではない。
- `storage-presence-analysis.json`、元Storage監査／reload JSON、`metadata-check.json`、事前protocol類、初版runtime-source-v1.spec.jsを保持。ハッシュ／存在情報以外のユーザー保存値を新しくログしない。

取得できないのは、実SW内open/put拒否時のnative unhandledrejection・worker終了と、旧自然失敗の未計測段階。今回のprocessイベントや成功記録では補完できない。旧保存5実null、自然DCL停止、旧Cache API／SWアクセス制御例外との因果は未確定。singleScript／要求／resource／load診断は変更しておらず、通常CIで自然停止が出た場合だけ文書・時計・欠測・dropを照合する。

53例は全条件1／一部49／未確認3、同期外15候補manual。Chromium重複宣言、5-6、iPhone実機、WebKitオフラインも残件。PR151未変更、PR152ドラフト、マージ・公開・自動マージなし。通常CIの成功だけでは今回の私用回帰失敗や実機の安全性を解決したことにならない。

次の判別する問い: WebKitの内部遷移エラーはSWのfetch処理へ届く前か、キャッシュ応答の引渡し後か。追加の反復で成功数を増やすのではなく、この境界を区別する証拠が必要。
