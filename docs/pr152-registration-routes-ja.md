# PR152: 登録経路を分けた有限対照

基準 `5619fa38c68a1cb538db937f2522995adc9215fa` / CI `39559981539`。
前回の結果回収・PR更新・契約15件・WebKit PWA限定実行を再実行しない。
製品変更なし、PR152はドラフト・公開保留、PR151未変更。

## 既存記録の可観測性と探索の終了

使用中はPlaywright **1.55.0**、WebKit **26.0**、browser revision **2203**。
一度だけ既存trace/JSONの種類、installed SDKの公開型とWebKit adapterを読み取り確認した。

| 対象 | 既存の具体的証拠 | 判定 |
| --- | --- | --- |
| native registerの同期返却 | 前回の文書timeOrigin＋callId＋register-returned | 確認済み。API返却自体での同期停止ではない |
| 対象native Promiseの決着状態 | Promise handle、内部状態、settlement記録がない | 未採取。await後の欠測からpendingとしない |
| 内部登録ジョブの段階/ID | 既存traceはSDK呼出し/console、内部register-job記録なし | 後付けで識別不能 |
| worker/controllerの状態 | 既存境界メタデータのcontroller | 別事実。新しい登録の完了を示さない |
| サーバーの応答終了 | 前回の版なしsw.js request1 / status200 / finish | ブラウザー本文読了・register完了と同一視しない |
| 公開された診断入口 | types.d.tsのnewCDPSession/serviceWorkersはChromium限定 | WebKitの公開SWジョブ監視APIとして転用しない |

確認箇所: `playwright-core/browsers.json`、公開`types/types.d.ts`のnewCDPSession/serviceWorkers、
`lib/server/webkit/wkExecutionContext.js`、`wkBrowser.js`、`wkWorkers.js`。
通常のJSHandle.getPropertiesはオブジェクトが必要で、実装もenumerable properties中心。
今回native返却値のhandleは保存せず、旧ページも終了している。追加evaluateで当時のPromiseを回収できるとは扱わない。
private session/Runtimeコマンド、Promiseへの追加then/catch、workerへの新しい介入は使用しない。
WebKit自体に内部情報がないという主張ではなく、**取得済み資料と今回利用できる公開経路では判別不能**という結論。
ここで内部記録の探索を終了し、欠けた項目を後付けの成功資料で補完しない。

## 再利用した対照と不足

前回の製品全体PWA試行は、旧/新文書とも版付きregister-returnedまで、新文書15pollでregistering。
旧版なしruntimeはevaluateから明示登録し、その後キャッシュ投入/再読込/障害へ進む。
これらは完了済み証拠として維持するが、load入口・準備・観測完了条件が同じではない。
したがって、同一の最小fixtureでA/B/Cを揃えた比較には不足する。製品PWA試行や旧runtimeは再実行しない。

## 隔離fixtureと実行前に固定した条件

`tests/registration-routes.experiment.cjs`は通常CIの固定ブラウザーリスト外。
`registration-route-fixture.cjs`で合成HTMLと2本のfixture入口を作り、製品ファイルは書き換えない。

- **A→B→Cの順に各1回、retries0**。WebKit26.0、新規context、条件ごとに異なる127.0.0.1 origin。
- 現行SW全文と実際のprecache資産を配信。全条件で同じHTTP/no-store/MIME、手動キャッシュ投入なし。
- goto DCL→表示→getRegistrations.length>0（既存PWAと同じ20秒上限）→1回reload DCL→表示→登録完了poll。
- 全体45秒・登録12秒・Playwright既定poll間隔。controllerは完了条件の代用にしない。
- Aは版なしだけ、Bは版付きだけ、Cは版なし→版付きの順に2つのwindow load listenerから開始。
  先のlistenerの完了を待って次を開始しない。版なしは`./sw.js`のみ、版付きは`./sw.js?v=580`/scope`./`。
- 既存の境界/サーバーrecorderを再利用。bare call1001 / versioned call1 / URL / timeOriginで区別。
  同じpollのevaluateでbare状態・製品登録状態・文書情報をまとめて読む。各履歴64件、server32件、drop明示。
- 失敗後の追加evaluate/storageStateなし。結果にかかわらず終了、追加の比較/障害試験なし。

**元の製品条件との差**: 合成HTMLにはアプリUI/CSS/背景処理/版取得タイマーがない。
版付き関数本体は実際のhdEnsureServiceWorker（既存update/ready処理を含む）を再利用。
版なし製品入口はcatchのみだが、fixtureは同じ1回のnative呼出しをawaitして完了gateを得る。
これは追加のthen/catch観測ではないものの、Promise反応の意味・タイミングを変更する。
bareの完了状態は独立したfixture変数へ書き、製品HD_SERVICE_WORKER_STATUSを代用・改変しない。
合成indexはSWのprecacheにも入る。他の資産/SWは実バイト列だが、製品PWAの起動やcache全体と同じとはしない。
source加工、console配送、trace/video、pollも負荷を持つ。機構対照を自然条件や製品修正成功に置き換えない。

## 契約と実行結果

実行前に新fixture4件＋変更に関連するrecorder7件、合計**11件成功**。
有効入口だけ1回呼ぶこと、receiver/引数、load開始順、拒否時のcatchと非成功状態、
版なし/版付きメタデータの退避、timer/保存操作/追加Promise観測を加えないことを確認。
旧readiness8件やSW14件の手動反復はしない（通常CIの必要な契約工程とは別）。

| 条件 | 初回/再試行/最終失敗 | 再読込後の状態 | 最後に確認した境界 | サーバーSW記録 |
| --- | --- | --- | --- | --- |
| A 版なしだけ | 成功1/0/0 | bare registering→registered、3poll。製品状態idleを維持 | 新文書bare await-resumed→完了代入 | 版なし受付→200 finish→通常close、1要求 |
| B 版付きだけ | 成功0/0/失敗1 | 同じ新文書でversioned registering、15poll、12秒不成立 | 新文書versioned register-returned。await/catch以降なし | 版付き受付→200 finish→通常close、1要求 |
| C 両方 | 成功0/0/失敗1 | 同じ新文書でbare/versionedともregistering、15poll、12秒不成立 | 新文書両register-returned。両await/catch以降なし | 版なし受付→200 finish→通常close、1要求。版付き記録なし |

origin: A `http://127.0.0.1:39349`、B `http://127.0.0.1:42757`、C `http://127.0.0.1:36521`。
新文書timeOrigin: A `1792575995477`、B `1792575996445`、C `1792576010509`。
各試行の時計は別プロセスの可能性もあるため、条件間のNode時刻を直接減算しない。
境界/サーバー/状態のdrop、不正メッセージ、evaluate例外は全条件0。
traceに記録されたpageerrorは全条件0（機構fixtureの範囲。通常CIの全ページ例外ゼロを意味しない）。

Bの**初回文書**では版付きawait-resumed→registered代入まで確認し、その後1回reloadした。
Cの初回文書ではbareのawait-resumed→完了代入を確認したが、版付きのawait継続記録はない。
旧/新文書を混同しない。B/CともDCL・load・継続的な状態読取りには到達し、DCL停止とは別である。
native Promiseの決着は直接測っておらず、await後の記録欠測から未決着とは断定しない。
全条件に初回trace/video/単独・添付JSONを保持し、再試行資料はない。
不成功result JSONのoutcomeは最後の段階`waiting`を保持し、最終失敗判定はPlaywright summary/ログへ分離する。

## 判定と次の具体的な問い

B単独でも失敗したため、**このfixtureの未完了観測には二経路の同時登録が必須ではない**。
製品での二経路の影響を否定したわけでも、URLやSWを原因確定したわけでもない。
A/BはURLに加え、既存reg.update/ready処理、bareの観測方法なども異なり、これらは独立に操作していない。
各1回は一般的な安定性や回帰の確定に十分ではない。製品修正・登録統合・期限変更は行わない。

次の問いは、**Bの再読込後未完了に、初回文書のawait後に始まる既存reg.update経路が関与するか**。
今回の結果だけでは版付きURL・更新処理・初期install/遷移境界を区別できない。
新たな対照は別途1条件の差を明示して設計する必要があり、今回は追加実行しない。

原本: `/workspace/hd152-registration-routes-20261021/`。
protocol-before-runs.json、contracts.log、served-fixture/*、source-at-execution/*、target.log、
target/summary.json、各初回trace/video/JSON、route-analysis.json、hashと保存確認を保持。
通常CI結果は同ディレクトリとPR冒頭へ記録し、CI外B/Cと元PWA/runtimeの失敗を緑のCIで代用しない。

旧5実null、自然DCL停止、navigation内部エラー/現SW関与、版取得/SW/通信/Cache API例外、
Chromium重複宣言等は別件・未解決。53例1/49/3、同期外15候補manualを維持。
5-6、iPhone実機、WebKitオフラインは未確認。保存領域へ追加操作をせず、製品153ファイルと旧証拠を保持。
PR152ドラフト・公開保留。PR151未変更。マージ・公開・自動マージ有効化なし。
