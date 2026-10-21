# PR152: 初期登録準備後のPWAオフライン回帰

基準 `6894efa6c77e85b1082b0f9d075171c62490d76b`。
製品・SW・登録方式・版/cache・保存形式は変更していない。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。

## 二つのケースと保証の範囲

|ケース|初回reloadの準備|確認する範囲|
|---|---|---|
|既存 `PWA service worker caches app shell and survives offline reload`|従来どおりgetRegistrations件数>0後にreload。初回の対象登録完了は待たない|早期reload経路と、その後の既存アサーション。失敗経路を残す。今回は再実行しない|
|新規 `PWA prepared registration survives offline update refusal and stopped-origin reload`|上記に加え、同じ初回文書でアプリ状態と対象workerを最大12秒poll|準備後のreload・登録12秒待機・scope/controller/cache/index・オフライン強制更新拒否・cache名維持・停止originへのreload・UI/module・元の2地点のpageerrorゼロ検査|

後続のアサーション経路は共用。既存ケースはprepared=falseのため新しいゲートを通らない。
元の45秒全体期限、poll間隔、各個別期限・アサーションは維持した。
準備待機に固定sleep/networkidleを追加していない。元の強制更新検査内の100msは存置した。
新ケースには診断配信metadataを拒否するガードがあり、同じ実HTML/UI/全資産/SWをファイルの
バイト列のまま配信する。隔離originを止める既存HTTPサーバーを使用する。

このPWAケースには保存キーの投入・完全一致検査がない。保存安全性を保証しない。
別の既存PWA投入5キー、空母夜戦投入2キー/未投入4キーのload後完全一致、
専用6キーの全非null＋完全一致検査は変更しない。旧保存実nullをこの成功で打ち消さない。

## 未加工配信での準備条件と限界

`update-manager.js`のhdEnsureServiceWorkerは版付きregisterの既存await後にregisteredを代入し、
その後にupdate式・ready処理を開始する。app.jsの版なし入口はこの状態を代入しない。
新規の隔離context/origin・初回文書で、同一evaluateの読み取りから次の全条件を要求する。

- HD_SERVICE_WORKER_STATUSがregisteredまたはready。
- getRegistration(対象scope)のscopeが初回originの`/`と完全一致。
- active.scriptURLが同じoriginの`sw.js?v=<app-version.jsonのbuild>`と完全一致。
- active.stateがactivated。同じtimeOriginを維持し、文書変更・evaluate例外は失敗。

件数・controller存在・navigator.serviceWorker.readyだけでは通過しない。
通常のgetRegistration読み取りと既定pollのみで、製品のregister/update/readyを追加呼出しせず、
Promise反応・script加工・SW加工・Storage操作・製品のテスト専用APIを追加しない。
成功/失敗とも最大64サンプルのJSONを保存し、失敗後は追加evaluate/storageStateを行わない。

これは**アプリの公開状態と対象active workerが整ったこと**の証拠である。
隔離診断の同一callのawait-resumed→registered代入→update式同期返却の受信履歴とは異なる。
状態には呼出しIDがなく、特定nativeジョブの同定・updateの決着・Promise状態を証明しない。
追加poll/getRegistrationは非ゼロの通信・タイミング負荷があり、無影響とは断定しない。

## 再利用する実行手順とCI範囲

既存の正式なPlaywright1.55.0環境を使う。まず選択だけ確認する。

```sh
npm run test:pwa:prepared -- --list
npm run test:pwa:prepared
```

専用configは新ケースのみ×Chromium/WebKit、各1回、retries=0、workers=1、45秒。
初回trace/video・JSONを成功時にも保存する。`test-results/pwa-prepared`と
`playwright-report/pwa-prepared`は次回実行で上書きされ得るため、次の必要実行前に原本を
別の証拠ディレクトリへ退避し、ファイルハッシュを保存する。成功までの再実行はしない。

**公開前の必須確認項目**として、両エンジンの初回準備/再読込後登録/強制更新拒否/cache維持/
停止origin reload/UI/例外検査を段階別に確認する。一部成功だけで公開可にしない。
既存早期reloadケースの失敗は別に追跡する。新ケースへの置換で消さない。
必要な新しい切り分けを行う時だけ、元のケースも独立して選択できる。

```sh
npx playwright test tests/pwa.spec.js --grep 'PWA service worker caches app shell and survives offline reload$' --project=webkit --workers=1 --retries=0
```

通常CI `npm run test:browser`の固定一覧には**二つのpwa.specケースとも含まれない**。
Fullジョブもship-master-compatibilityのみであり、本ケースをカバーしない。
通常CIには新しい準備helperのNode契約のみ追加する。CIの緑を専用PWAの成功に代用しない。

## 今回の限定実行

事前protocolと選択確認後、新ケースだけChromium→WebKit、各1回・retry0で終了した。
既存公式image `mcr.microsoft.com/playwright:v1.55.0-noble`を再利用し、再構築・別版切替なし。
未加工配信。旧人工比較・update抑止・早期reloadの再実行なし。

|エンジン|初回準備|reload後登録|強制更新拒否/cache維持/最初のerrors=[]|停止origin reload/後続UI/最後のerrors=[]|結果|
|---|---|---|---|---|---|
|Chromium|成立、対象v580 activated|成立|成功|reloadでERR_INTERNET_DISCONNECTED。DCL/末尾検査へ未到達|初回失敗1、retry0、最終失敗1。本文11.975秒|
|WebKit|成立、対象v580 activated|成立|成功|DCL・UI/module/controller・末尾errors=[]成功|初回成功1、retry0、最終失敗0。本文11.994秒|

両方の準備履歴・登録履歴はdrop0/evaluate例外0。
初回契約のundefinedモックが既定readyへ変換された不備1件、--listで0件となったgrep不備を
ブラウザー実行前に訂正した。これらは製品失敗や自然再発とは別。
新規5契約＋既存8契約成功。grep訂正後は関連5契約/選択を確認し、対象2実行を確定した。

旧の隔離成功対照では停止origin文書がregister catch/errorへ進みながらUI/cache検査は成功した。
今回はWebKit末尾の同一evaluateではready/complete。これで旧catch/errorの記録を取り消さない。
未加工配信にはawait/catchの境界マーカーがないため、今回の途中のcatch不在・native決着を
推定しない。Chromiumは後段文書での正常状態読取りへ未到達。
初回traceのnetwork記録は両方0件であり、内部要求・本文転送の原因特定に使えない。
サーバーソースの無加工経路と入力バイトhashを保存したが、独立したbrowser本文hashではない。

## 証拠と未解決

原本 `/workspace/hd152-prepared-pwa-regression-20261021/`。
事前protocol/選択、契約、source/hash、target/summary.json、初回trace/video、失敗PNG、
初回準備/後続登録/段階JSON、実行ログを保持。再試行自体がない。
基準の証拠 `/workspace/hd152-initial-registration-gate-20261021/` 等は再取得/上書きしない。
通常CI結果は対象SHAとともにPR冒頭と外部証拠へ記録する。

恒久化できたのは、未加工配信で準備を確認し、同じ後続PWA検査を繰り返し選択できる手順。
両エンジンでPWA全体成功・全般的オフライン安全性を確認したとはしない。
次の問いは、**Chromiumの停止origin reloadで、キャッシュ応答からnavigation commitまでの
どこでERR_INTERNET_DISCONNECTEDとなるか、初回traceの既存証拠で判別できるか**。
今回は追加実行せず、既存runtime navigation内部エラーとの同一原因も未確定のまま残す。

最優先の旧保存実null、早期reload登録待機、今回/過去のDCL停止、runtime navigation内部エラー、
現SW関与、通信/Cache API/旧SW例外、Chromium重複宣言は別件として未解決。
53例1/49/3、同期外15候補manualを維持。5-6/iPhone実機/WebKitオフライン一般は未確認。
