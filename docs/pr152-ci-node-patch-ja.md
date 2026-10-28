# 通常smokeのNodeパッチ版を局所検証と揃える

CI `40634077588` / HEAD `b5f706f75e50032bad8d1b8637f9e812ad88370f` の実ログを、各ジョブ自身の記録で照合した。

|ジョブ|実測Node|根拠・欠測|
|---|---|---|
|Chromium shard1 / 122636903443|未確認|全jobログ取得不可。別ジョブの値で補わない|
|Chromium shard2 / 122636903489|未確認|同上|
|WebKit shard1 / 122636903439|24.21.0|既存の環境preflightのJSON出力|
|WebKit shard2 / 122636903474|24.21.0|同上|
|WebKit shard3 / 122636903462|24.22.1|同上|
|WebKit shard4 / 122636903190|未確認|全jobログ取得不可。失敗traceからNode版を推測しない|
|Full|非実行|同runではskip|

未取得3ログは今回の通常コネクター読取りも`Transport closed`で未取得だった。旧取得エラー・原本・各SHA-256と今回の読取り記録をprivateへ保持した。ログがないジョブの実値は設定値や別ジョブの実値で埋めない。旧CIを揃え直す再実行はしない。

設定元は`.github/workflows/browser-regression.yml`のsmoke/fullにある`actions/setup-node@v7.0.0`の`node-version: 24`で、パッチ固定ではなかった。既存preflightもmajor=24だけを検査していた。浮動majorは各runnerの利用可能な版/キャッシュにより異なるパッチを選べるが、各runnerの具体的な解決元までは確定していない。固定Playwright imageはブラウザー/OSの基準であり、その後のsetup-nodeのパッチ版までは固定しない。

次の通常Browser Regressionでは、smokeと同workflowの手動fullを`24.21.0`へ固定し、既存preflightも実際の`process.versions.node`が完全一致するか検査する。局所4-1の固定Nodeも24.21.0を用いる。既存のimage digest、Playwright1.55.0、Chromium1187/WebKit2203、workers/retries、期限・探索条件は変えない。Pagesと別のscheduled full-regression workflowは変更しない。

preflightは実測Node・期待Node・browser名を先に、小さなJSONとして`RUNNER_TEMP/harbordesk-ci-browser-environment/`へ保存する。起動後のブラウザー版/revision等も同receiptへ記録する。Playwrightが開始時に消去する`test-results`の外へ置き、smokeの既存always prerequisite artifactと、同workflowのfullの小さなalways artifactで保持する。preflightより前の失敗やrunner取消ではreceipt自体がない場合もある。保存値・製品本文・認証情報は採取しない。

これは検証環境の差を製品差と混同しないための固定であり、旧WebKit停止・通信例外・製品不具合の原因確定や修正ではない。旧結果は旧環境の結果として維持し、次HEADの実測を別に記録する。appの版番号、SW、本番、PR151/mainは変更しない。
