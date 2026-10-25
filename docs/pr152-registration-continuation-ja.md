# PR152: 隔離配信での既存register継続境界

基準 `4bd4082e6dff6aab4fabf9e5adee64254861ab08` / CI `39553169717`。
PR152はドラフト・公開保留。製品変更なし。PR151、版/cache、保存形式、SW本文を変更しない。
前回の状態pollと旧比較を再利用し、比較・成功待ちの反復はしない。

## 不足と今回の変更

前回は同一文書のidle→registeringのみ確認し、native返却・既存await継続は未計測だった。
`pwa.spec`の隔離サーバーへproject metadata `registrationContinuation: true`を指定した場合だけ、
`update-manager.js`の配信内容を厳密な一意アンカーで加工する。ディスク上の製品は変更しない。
指定がない通常条件では加工せず、SWは指定の有無にかかわらず元バイト列で配信する。

- native register直前、同期返却直後、既存awaitの正常継続直後、registered代入後、catch入口、error代入後。
- 文書timeOrigin/文書内時刻、安全なURL、呼出しID、登録URL/scope、既存controllerのURL/状態。
  呼出しIDは文書ごとの連番なので、文書対応と併用する。timeOriginはnative文書IDではない。
- passive controllerchangeと計測設置地点。controllerのURLはqueryを除くため、版付き/版なしのworker同定には使わない。
- 既存状態pollとpage load/DCL/警告の記録を再利用。Nodeのprocess-wide performance開始値を加え、
  同じプロセス内の受信時刻を対応付ける。ブラウザー時計と直接減算しない。
- サーバーはsw.jsだけ受付、response finish、finish後/前のclose、request abortedを記録する。
  versionは数値vのみ許可し、その他queryは保持しない。finishはブラウザー本文読了ではない。
- newest64境界記録、newest32サーバー記録、drop/不正メッセージ件数。成功・失敗とも独立JSONへ保存。

元のnative呼出しを一時変数へ分離し、その返却値を既存awaitへ渡す。receiver、引数、例外、
既存update/ready処理は維持し、then/catch/finally反応・register/update・waitUntil・timerを追加しない。
同期メタデータ読取り、console配送、passive listener、配信時加工とhash計算、trace/videoは負荷・順序へ介入する。
無影響の計測とは扱わない。計測配送だけの例外は製品操作と分離する。native Promiseの決着を直接観測しない。
元await後の記録欠測だけでPromise pendingと断定しない。

原ソースSHA256: `186527db6be79198fcfe49951173736c24ee30f776cc90f98f137d7dc71e73f9`。
配信ソースSHA256: `4863e662ee446ee024ad711d2ca9e8fd6ae8629105580c6efd460d623d585ee9`。
原本・加工後全文・差分は証拠ディレクトリに保持する。

## 実行前の人工契約

新7件と既存readiness8件、合計15件成功後にブラウザーを実行した。
receiver/引数/返却値、awaitによるthen読取り1回、境界順、同期throw/await拒否/後続update throw、
診断配送例外と製品エラーの分離、失敗時退避・追加evaluateなし、上限/drop、安全なURL、
実HTTPでの版あり/なし応答finishと通常closeを確認する。
最初の契約実行2件はconsoleモックのtype()不足で失敗し、修正した。自然失敗ではなくfixture不備。
そのログも保持した。製品SW契約への変更はなく、既存Node14契約の手動反復はしない。

## WebKit対象1回

WebKit26.0/Playwright1.55、新規context・127.0.0.1:33837の隔離origin。
未加工SW、上記配信加工、元45秒・登録12秒・既定poll間隔・retries0。初回成功0/再試行0/最終失敗1。
登録待機失敗で終了し、native/cache/scope snapshot、offline更新、停止origin再読込は未到達。
後続の元アサーションは変更していない。失敗後の追加evaluate/storageStateは実行していない。

以下のNode時刻は**同じプロセスのperformance.now**。ブラウザー時刻は別時計。

| 観測 | Node ms | 文書/状態・境界 |
| --- | ---: | --- |
| 旧文書の計測設置 | 1226.474 | timeOrigin=1792566349758.0002 / idle / loading |
| 旧文書 register直前 | 5356.599 | call1 / registering / controllerなし |
| 旧文書 native同期返却 | 5356.687 | call1 / await継続は未観測 |
| 版なしsw.js受付 | 5393.925 | server request1、native文書/呼出しIDなし |
| 同じHTTP応答finish | 5396.081 | status200 / writableFinished=true |
| finish後の通常close | 5396.313 | 切断失敗ではない |
| 新文書の計測設置 | 5850.470 | timeOrigin=1792566354312 / idle / loading |
| 新文書DCL通知 | 5907.702 | Nodeイベント自体にはnative文書IDなし |
| 新文書controllerchange | 6048.324 | 同じtimeOrigin / idle / activating |
| 新文書 register直前 | 7822.036 | call1 / registering / controller activated |
| 新文書 native同期返却 | 7822.708 | call1 / 同じ文書、complete |
| page load通知 | 7822.783 | Nodeイベント、native文書IDなし |
| 登録poll開始 | 8108.056 | 既存12秒/既定間隔 |
| 最初のpoll受信 | 8113.907 | 新文書 / registering / complete |
| 15回目poll受信 | 20059.358 | 新文書 / registering / complete |
| 登録待機失敗 | 20061.498 | 元の成功条件不成立 |

旧・新文書ともregister-before/register-returnedを確認した。
await-resumed/registered-assigned/catch-entered/error-assignedは記録なし。
新文書の15サンプルはすべて同一timeOrigin・registering、evaluate例外0。
境界7件/64、サーバー3件/32、状態15件/64、状態イベント7件/32、drop全0、不正メッセージ0。
登録失敗警告・pageerrorの観測はこの試行で0。配送外の例外や全ページの安全性証明ではない。

これで「APIが同期的に返らず、その呼出し自体でJSが停止した」はこの2回の呼出しについて除外できる。
await正常継続やcatchの実行、native Promiseの決着状態は依然未確定。
既存activated controllerは、新しい版付きregisterの完了証拠ではない。
サーバーに版付きsw.jsの受付/finish/close記録はなく、版なしだけを観測した。
記録欠測は内部要求の未発行、ネットワーク未完了、版付きPromiseのpendingを証明しない。
版なしHTTP request1と特定register呼出しの同一性もnative IDがなく確定できない。
HTTP finishをブラウザー本文引渡し・register成功に置換しない。

## 判断と次の問い

製品欠陥や修正は今回確認していない。登録入口はなお失敗し、通常CI外の公開保留理由である。
通常CIが成功してもこの失敗・runtime navigation内部エラー・現SW関与の未確定を代替しない。
次の問いは、今回の版付きregisterについて**既存awaitの継続が来ない間に、ブラウザー内部の登録ジョブが
どの段階まで進んだか**を、Promise反応を追加せず既存ブラウザー/SW通信記録で識別できるか。
成功までの反復や登録方式変更はしない。

原本: `/workspace/hd152-registration-continuation-20261021/`。
protocol.json、contracts.log/契約最終ログ、target.log、target/summary.json、初回trace/video/image、
単独と添付の状態JSON/継続JSON、配信差分とhash、実行時テストソースを保持。
再試行はない。今回の資料に取得不能はない。通常CIの取得範囲・最終結果はPR冒頭と同ディレクトリへ追記する。

保存領域への新しい読取り/操作はない。製品153ファイルと旧証拠のhashを前後比較する。
旧5キー実null、自然DCL停止、navigation内部エラー、版/SW/通信/Cache API例外、Chromium重複宣言は
別件のまま。直前CIのChromium再読込停止・取消boundingBox null・WebKit取込表示未更新も別分類で維持。
53例1/49/3、同期外15候補manual、5-6/iPhone実機/WebKitオフライン未確認を維持する。
PR152ドラフト、PR151未変更。マージ・公開・自動マージ有効化はしない。
