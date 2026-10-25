# PR #152: PWA登録状態とテスト準備の切り分け

## 対象と判定

基準は `18b2fd38315c97b8788834fbab37315987e30683`、CI `39545437512`。
製品コード、SW本文、版・cache名、保存形式、版取得call-only診断は変更しない。
PR #152はドラフト・公開保留、PR #151は変更しない。

**固定1200msがアプリ側の登録完了条件ではなかった点をテスト側で是正した。
一方、実ブラウザーでの登録状態失敗は解決していない。**
WebKit対象1回は新しい12秒の登録状態待機で失敗し、後続のオフライン検査には未到達。
通常CIが成功しても、この通常CI外の失敗を成功扱いしない。

## 再利用した初回証拠

原本は `/workspace/hd152-sw-cache-lifetime-20261021/` に保持した。
今回の抜粋と原本ハッシュは
`/workspace/hd152-pwa-registration-ready-20261021/old-registration-observations.json`。
以下の時刻はそれぞれのtrace内の時計であり、試行間で直接減算しない。

| 初回試行 | 固定1200ms待機の開始 | 直後snapshotの完了 | アプリ状態 | native観測 |
| --- | ---: | ---: | --- | --- |
| 現SW | 192778.516ms | 193992.803ms | registering | bare sw.jsがactive、controllerあり、cache580/indexあり、readyが返る |
| 旧SW | 65403.325ms | 66611.012ms | registering | bare sw.jsがactive、controllerあり、cache580/indexあり、readyが返る |

旧SW・現SW比較を再実行していない。どちらも登録状態のアサーションで失敗し、
後続オフライン検査へ進んだ証拠ではない。
native ready/controllerは既存登録の状態であり、版付きregisterの決着を示さない。
旧資料には当該registerの呼出しID・決着結果がなく、pendingを直接立証できない。

## コード上の対応と分類

| 経路 | 開始条件 | 登録 | アプリ状態の書込み |
| --- | --- | --- | --- |
| app.js | window load | `./sw.js` | なし |
| update-manager.js / hdEnsureServiceWorker | window load | `./sw.js?v=580`, scope `./` | 開始時registering、await成功後registered、ready成功後ready、catch時error |
| 元のpwa.spec | DCL後、nav表示後 | 既存native登録を読む | 固定1200ms後に一度だけ検査 |

製品内の当該status代入はupdate-manager.jsの上記経路だけだった。
名前付きhdEnsureServiceWorkerの呼出しはload入口だけで、今回の調査では
「完了後に状態を書き忘れた／上書きした」という製品欠陥を確認していない。
版なし・版付き登録の統合やPromise観測は行っていない。

分類3（テストが必要なアプリ側完了条件を待たない）はコードと隔離契約で確認した。
旧自然失敗について分類1（native registerがpending）と分類2（完了後の状態問題）を
API結果から区別する証拠は不足しており、その点は分類4のまま。

## 最小変更と隔離契約

`tests/pwa.spec.js`の固定待機だけを、`waitForApplicationRegistration`へ置換した。
登録Promiseにthen/catchを追加せず、アプリ状態registered/readyをexpect.pollで確認する。
個別上限は既存expectと同じ12000ms、全体45000msを維持した。
元のregistered/ready、scripts、controller、cache/index、scopeおよび
全後続アサーション・例外ゼロ検査を維持する。

`tests/pwa-registration-ready.test.cjs`は実際のhdEnsureServiceWorkerソースをVMで実行する人工契約。

1. 既存controller/readyあり、新規registerだけpending: 元の一度の状態検査は不成立。
   新しい準備は最初のpendingサンプルでは通過せず、同じ登録を解決した後に通過する。
2. 新規registerを拒否: 既存readyがあってもerrorのまま。成功状態へ置換されない。

各2件成功。最終契約ログは`contracts-final.log`。
最初の実行後に期待URLの固定build580を製品buildからの取得へ一般化し、契約だけを再確認した。
これは自然失敗や実WebKitのpending再現ではない。
通常CIの既存Node契約工程にこの2件を追加した。ブラウザー固定リストは変更していない。

## WebKit限定実行（1回、retries=0）

事前条件・回数・終了条件は`protocol.json`。
未加工の現SW、元のローカルHTTP fixture、一意のloopback originと新規context、
WebKit 26.0 / Playwright 1.55.0、元の45秒期限を使用した。
SW無効化、応答差替え、登録APIラッパー、追加のAPI決着観測はない。
初回trace（snapshots=false）、動画、スクリーンショット、JSON、ログを保持した。

| 段階 | 観測 |
| --- | --- |
| 最初のnative登録数 | 0の後、1を確認 |
| reload | trace6095.140ms開始、6457.486msにDCL待機から復帰 |
| アプリ登録状態待機 | 7921.031–18927.443msの14サンプルがすべてfalse、12秒poll上限で失敗 |
| 状態の内訳 | このpredicateは成功状態かどうかのbooleanだけを返す。idle/registering/error等の区別は未計測 |
| 元のnative/cache/scope snapshot | この試行では未到達。旧試行の結果で補完しない |
| offline更新／停止origin再読込 | 未到達 |

初回成功0、再試行0、最終失敗1。全体期限の延長はなく、約20.1秒で終了した。
失敗後の追加evaluate/storageStateや自動復元は行っていない。
traceには旧文書のreload開始後にGitHub取得のアクセス制御pageerrorが2件記録されている
（diagnostics-center.js / hdDXGithubHead、6125.680msと6126.052ms）。
登録待機失敗との因果は未確定で、元のerrors=[]検査には未到達。
このtraceのnetworkレコードは0で、内部要求の未発行や成功を意味しない。

新しい待機でも通らなかったため、「1200msより長く待てば解決」とは結論しない。
追加反復はしていない。次の判別すべき問いは、同じ文書の既存状態ポーリングで
非成功値の内訳を保持した場合に、load未到達・registering継続・errorのどれが観測されるか。
今回の不足を成功記録や後からのevaluateで埋めない。

## 証拠・残件

今回の原本: `/workspace/hd152-pwa-registration-ready-20261021/`。
`target.log`, `target/summary.json`, `target/artifacts/**/trace.zip`, `video.webm`,
`test-failed-1.png`, `error-context.md`, `target-selected-events.json`を保持する。
対象の初回trace・動画は取得済み。再試行は実施していない。
旧資料にnative登録の決着結果がないことは取得不能と未計測を混同せず、未計測として扱う。

今回ハッシュを採取した製品153ファイルの変更有無は
`product-hashes-before.json`と最終preservation記録で確認する。
保存領域を操作しない変更であり、専用6キー全非nullや完全一致試験を今回再実行したとは報告しない。
旧5キー実null、自然DCL停止、版取得例外、旧SW/通信/Cache API例外、
小規模runtimeのnavigation内部エラーと現SW関与、Chromium重複宣言は別件のまま。
53例は全条件1／一部49／未確認3、同期外15候補はmanualを維持した。
5-6、iPhone実機、WebKitオフラインは未確認。公開・マージ・自動マージ有効化は行わない。
