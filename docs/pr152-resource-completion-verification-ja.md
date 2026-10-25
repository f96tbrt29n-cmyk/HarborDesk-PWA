# PR #152：自然停止2件とresource完了の切り分け

2026-10-19 JST。基準160a66e、CI39160390327。PRはドラフト維持。製品/SW/保存形式/攻略条件/45秒期限は変更しない。実機iPhone、WebKitオフライン、5-6は未確認。

## 原本から確定できる範囲

初回trace/video/要求JSON/SW状態/ジョブログを保持し、再試行の成功資料と分離した。traceはsnapshots=false、networkストリームは0byte。Resource Timingは元の試行では採取しておらず、終了したcontextから遡って取得できない。元の標準Pythonサーバーのアクセスログはヘッダー出力で、本文送信終了ではない。

|段階|空母3機保存の初回|PWAオンライン再起動の初回|
|---|---|---|
|HTML|200/SW応答、requestfinished、報告body size=Content-Length=13343|同左|
|最後の静的script load|39 eo-tracker.js、新文書413ms|42 home-dashboard.js、新文書293ms|
|次のscript|40 quest-database.js、観測ID220/3799ms|43 update-manager.js、page/context要求記録なし|
|44/45|観測ID224/225、3800msに要求のみ|要求・応答・終了・loadすべて記録なし|
|ブラウザーの未終了要求|40〜45の6本。response/requestfinished/requestfailedなし|観測した要求は全終了。43〜45の内部取得不存在を意味しない|
|サーバー|40〜45の版付きGET記録なし|43〜45の版付きGET記録なし|
|SW切替|bare→版付き、native243ms。245ms activated|bare→版付き、native137ms。142ms activated|
|30秒観測|loading、版付きactivated、installing/waitingなし|同左|
|DCL/例外|新文書のnative DCLなし、pageerror0/nativeDropped0|同左|
|保存の最終検証|DCL待ちの後なので未到達|同左|

Node観測IDはブラウザープロトコル/SW内部の要求IDではない。Node受信時刻とnative performance時刻を混ぜてSW切替・実送信の厳密な因果順を断定しない。切替後にもscript loadは進み、watchdog/getRegistrationも応答した。main thread全面停止やPlaywright waiterだけの見逃しとは異なる観測だが、SWが原因という証明ではない。

「復元未到達」は最終検証工程のこと。app.js先頭には同期的なconst state=load()があり、script1のloadを観測しているため、保存状態の読込が一切始まっていないとは言えない。一方、艦隊台帳UIのinitShipRosterはDCLリスナー。方針/所有状態/保存値の最終確認はDCL後に実行するテストで、初回は未到達。読出し値の履歴はないので、全データの復元成功も消失も断定しない。

|候補となる段階|今回の判定|
|---|---|
|1 要求未発行|PWAでは通知欠測。内部取得の未発行は未確定|
|2 要求後・応答未到着|空母3機で要求通知/ヘッダー欠測を観測。SW到達前・内部・通知欠落を未分離|
|3 ヘッダー後の本文未完了|停止したscriptでは未確認。HTML本文の報告完了とは分ける|
|4 本文完了後の実行待ち|停止したscriptの本文完了証拠がないため未確定|
|5 計測イベントの欠落|nativeDropped0でもブラウザー側の通知完全性は保証できず、除外しない|

## 追加した最小限の計測

既知の再読込ケースのinit scriptだけにPerformanceObserver(type=resource, buffered=true)を追加。同一originの.js完了エントリーを文書ごと128件まで保存。startTime/fetchStart/workerStart/requestStart/responseStart/responseEnd/サイズ等を数値allowlistで記録し、認証情報・任意query・本文は記録しない。native load/error、requestfinished、DCLとは別イベントにする。新たなfetch/body reader、DOM/layout採取、タイミングバッファ変更、fetch/registerのラップはしない。

バッファfull/上限drop/利用不可を明示。既存30秒watchdogとDCLでtakeRecordsを排出し、成功時もresource完了の要約を保持する。resourceCount等はresourceStatsAt時点の集計で、後続resource callbackとは区別する。resource entryなし、responseEnd/transferSize等の0、callback受信順から通信失敗やcache/network応答元を推測しない。通常CIは未加工SW/標準Pythonサーバーのまま。

サーバーのrequest-accepted/copy-start/prefix-flushed/copy-returned/flush-returned/copy-failedは、明示--gate-scriptの隔離サーバーだけ。IDはサーバー内の別名前空間。copy/flushが戻ったことはサーバー側の書込み処理で、ブラウザー本文読了やpeer ACKの証拠ではない。公開SW・通常サーバーは変更しない。

## 隔離対照と影響確認

- 本文保留対照：両エンジン×SW無効/計測SWの4件、再試行0ですべて初回成功（35.4秒）。44の1024bytes送出後に保留、45はrequestfinished済みでも44/45のloadとDCLは未到達。解除後、サーバーcopy/flush終了（44のsourceBytes=15888）、resource完了、requestfinished、load、DCLを別々に記録。自然停止の再現とはしない。
- 保留中のWebKit/SW無効の1観測では45のrequestfinishedがあるのに、resourceエントリーはまだ受信していなかった。他の3ケースは45のentryを記録。callbackの配送/確定の時点も異なり得るため、欠測だけでは失敗にしない。44は解除後にentryを観測。
- 未加工SWのON/OFF比較：6キー非nullの専用fixture、両エンジン計4件が初回成功/再試行0/pageerror0。全6文字列の再読込後一致を検査。WebKitのreload→DCLはOFF960/ON858ms、6キー確認はOFF1749/ON2011ms。ChromiumはDCL OFF881/ON944ms、6キーOFF2234/ON2440ms。各1回・順序固定なので性能差の統計評価や計測の無影響証明はしない。
- 初版の影響比較はgrepの完全一致指定が不適切でNo tests found。テスト未実行の設定失敗資料も保持し、成功4件へ合算しない。
- Nodeの診断12件成功。完了と実行/DCLを混同しないこと、上限/秘匿、バッファを変更しないこと、未完了の収集を待たずに資料を保存することを検査。対象回帰と最新CI結果はPR本文へ記録する。

対象の空母3機保存/PWA再起動×両エンジン4実行は、3初回成功/1最終失敗/再試行0。WebKitのPWAがpage.reload/DCL待ちで45秒期限に達した。失敗を成功に置き換える再実行は行わず、trace/video/JSON/logをtargetsへ保持した。

これは未加工SW＋今回の受動resource計測を使ったローカルの自然停止であり、元CIの2件・人工本文保留とは別試行。新文書の1〜4番はrequest/response/requestfinished/resource完了/loadを確認、5番map-plans.js〜45番はpage/context要求・resource完了・loadの記録なし。30秒時点はloading、resource observerはobserving、記録4件/drop0/bufferFull0/nativeDropped0。SWはnative361msに切替、369msに版付きactivated。1〜4番のworkerStartは360ms、responseEndは375〜382ms、最後のloadは4番。5番以降の内部発行・SW到達・本文状態はなお不明。欠測だけで段階1や通信失敗と断定しない。

成功した空母3機WebKitにはGitHub API鮮度取得2URLのアクセス制御pageerrorがあったが、DCL/方針検査は完了。失敗したPWAはpageerror0。通信例外と停止を同一原因にしない。各回の全例外をJSONへ保持し、元の機能アサーションや期限は緩めていない。

## 2-5北・その他の未確認

既存の両エンジン16候補資料を再利用し、15候補の差分を艦・装備位置・改修値ごとに抽出した。差分を含む候補数は扶桑13、那智12、鈴谷/熊野/妙高/羽黒各4（重複を含む）。すべて専用fixtureの観測値であり、実ゲームの艦娘別ボーナス根拠ではない。数値差を0や推測性能で埋めない。15候補の索敵はmanual、全16候補の総合registeredReady=falseを再確認した。

2枠・3枠の部分領域の全列挙比較は維持。一般探索の網羅性や同期外索敵ボーナスが証明されたわけではない。53例は全条件1/一部49/未確認3。通信/Cache API例外、Chromium元重複宣言2件も未解決で、今回のpageerror0の停止と混同しない。製品の推測修正、期限/アサーション緩和、skip、PR151変更、マージ/公開は行わない。

**自然停止の根本原因は未確定。** 次の自然な失敗でresource responseEnd/decoded sizeとブラウザー要求・native load・DCLを照合する。追加の内部SW計測が必要になった場合も隔離環境に限定し、計測による挙動変化を区別する。大量反復は行わない。

原本：/workspace/hd152-script44-20261018/ci-160a66e。追加証拠：/workspace/hd152-resource-timing-20261019（existing-evidence-availability、failure-stage-classification、body-control、impact-valid、north-bonus-gaps、targets）。
