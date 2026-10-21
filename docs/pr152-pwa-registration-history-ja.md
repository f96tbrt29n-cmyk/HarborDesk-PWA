# PR #152: 同じpollから登録状態を保持する

基準 `7b56df555c563b2fad7d953ca9e817fcfc8f75ad` / CI `39549164936`。
PR152はドラフト・公開保留。製品、SW、登録経路、版/cache、保存形式、版取得call-only診断を変更しない。
旧比較は再実行せず、旧証拠は`/workspace/hd152-pwa-registration-ready-20261021/`に保持した。

## 変更範囲

`pwa-registration-ready.cjs`は同じpollのevaluateから状態値と文書メタデータを返す。
成功判定・分類・JSON化はNode側で行う。状態をfalseに変換して失わない。

- 状態はidle/registering/registered/ready/error/unsupported/undefined/unexpectedを区別する。
- timeOrigin、文書内時刻、readyState、安全なURL、main-frame判定は状態と同じevaluateで取得する。
- Node開始・受信時刻、process内のpage/context識別番号を保持する。timeOriginは対応付けの手掛かりで、native文書IDではない。
- 最新64サンプル、最新32イベントを保持し、古いものを落とした件数を記録する。
- evaluate例外は例外サンプルとして残し、元の例外を再throwする。falseやundefined状態に置換しない。
- 成功・失敗とも`pwa-registration-state.json`へ保存し、Playwrightにも添付する。
- 失敗後のevaluate/storageStateはない。待機前に終了した場合はnot-entered/サンプル0として区別する。
- optionalなNodeイベントはpageerrorの指紋、登録失敗警告の指紋、main-frame遷移、load、DCLのみ。
  URLはquery/fragment/認証部分を除外。想定外文字列・例外・警告は長さ/hash中心で、保存値を読まない。
  イベントにはnative文書IDがなく、近接時刻だけで文書やregister呼出しに帰属させない。

pollは12000ms、既存Playwright既定間隔、registered/readyの成功条件を維持。
全体45秒・既存後続アサーション・例外ゼロ検査を維持した。
新timer、登録呼出し、native Promise観測、script/SW API置換、保存領域操作は追加しない。
既存CIの診断保存パターンに当該JSONを加えたが、通常CIの固定ブラウザーリストは変更しない。
pwa.spec/runtimeは引き続き通常CI外である。

## 人工契約

ブラウザー実行前に7件成功。実登録入口ソースによるpending/拒否の既存契約に加え、
非成功値・未定義・想定外、同時取得文書情報、元のevaluate例外、失敗時の退避、上限/drop、
文書変更、未採取と未定義の区別を確認した。故障契約は制御pollを使い、通常の12000ms設定と
intervals未指定を検査する。時間待ちの再現や自然失敗とは扱わない。

実ブラウザー実行後、function/symbol等が転送でundefinedになっても実undefinedと混同しないよう、
同じ一度の状態読取りにtypeofタグを追加し、契約を1件追加した。最終8件成功。
この補完後のブラウザー追加実行は行っていない。
今回観測した文字列idle/registeringの分類・成功条件は補完前後で同じ。
実行時ソースは初回traceから抽出し、最終ソースと区別して保持する。

## WebKit対象1回の結果

条件と終了条件は`/workspace/hd152-pwa-status-history-20261021/protocol.json`。
元HTTP fixture・fresh origin/context・未加工SW、WebKit26.0/Playwright1.55、45秒、retries0。
初回成功0、再試行0、最終失敗1。予定した1回で終了し、追加反復はしていない。

以下は同じJSON内のNode相対時計。文書内時刻やtrace時計と直接減算しない。

| 観測 | Node ms | 状態・文書情報 |
| --- | ---: | --- |
| 待機開始 | 6199.663 | 12000ms上限の既存poll |
| サンプル1受信 | 6269.927 | idle / interactive / 文書内1923ms |
| page loadイベント受信 | 6329.717 | native文書IDなし |
| サンプル2受信 | 6420.993 | registering / complete / 文書内2076ms |
| サンプル14受信 | 17257.887 | registering / complete / 文書内12913ms |
| 待機失敗記録 | 17259.280 | 完了状態を観測できず、元のpoll期限検査で失敗 |

全14サンプルのtimeOriginは`1792562377011.0002`で一致、pageId1/contextId2。
idle1件→registering13件、evaluate例外0、サンプルdrop0、イベントdrop0。
これらは離散サンプルであり、間の全時刻の状態を観測したとはしない。

製品ソースではupdate-manager評価時にidle、load入口からhdEnsureServiceWorkerを呼び、
register直前にregistering、await後にregistered、ready後にready、catchでerrorを書き込む。
今回は初期状態の後にloadイベントとregisteringを観測し、
**アプリ側の登録開始後に完了状態を確認できなかった段階**へ分類できた。
文書切替やevaluate例外を登録失敗と取り違えた結果ではない。
native Promiseがpendingなのか、決着後の継続処理・状態更新の問題なのかは未計測であり、原因確定ではない。
今回だけで製品の状態管理欠陥は確認していない。

元のnative/cache/scope snapshot、offline更新、停止originでのreloadは未到達。
旧試行のcontroller/cache観測を今回の事実へ転用しない。
登録失敗警告はこの観測区間で0件（配送欠測の可能性まで否定しない）。
pageerrorは待機開始前の2件で、traceにはdiagnostics-centerのGitHub取得アクセス制御例外が記録されている。
これを登録待機や旧DCL停止の原因と結び付ける証拠はない。
traceのnetwork記録は0で、要求の未発行や内部SW通信の成否を意味しない。

## 介入と限界

同じpollで返す小さなメタデータ、Node分類、限定イベント配送、trace/video収集には負荷がある。
Promise反応を付けないことだけでタイミング無影響とはしない。
JSON書込みは待機終了後のNode処理で、保存領域には触れない。
上限を超えると初期記録が欠け、dropで明示する。未定義状態・記録なし・evaluate例外は別である。
旧失敗の欠測を今回の記録で補完しない。

原本: `/workspace/hd152-pwa-status-history-20261021/`。
contracts.log（7件）、contracts-final.log（8件）、target.log、target/summary.json、
初回trace/video/image、単独JSONと添付JSON、target-analysis.json、実行時ソースを保持した。
再試行はない。通常CI最終結果・取得範囲はPR冒頭と同ディレクトリのfinal-result.jsonへ記録する。

次の問いは、この文書の版付きregisterが未決着なのか、決着後の継続・状態更新が進まないのかを、
native Promiseへの反応追加なしでどこまで区別できるか。
旧5キー実null、自然DCL停止、版取得例外、navigation内部エラーと現SW関与、通信/Cache API、
Chromium重複宣言は別件のまま。53例1/49/3、同期外15候補manualを維持。
5-6、iPhone実機、WebKitオフラインは未確認。PR151変更、マージ、公開、自動マージ有効化は行わない。
