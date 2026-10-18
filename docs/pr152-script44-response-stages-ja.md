# PR152：44・45番scriptの要求・応答元・本文段階

2026-10-18 JST、基準3de7ebf。製品コード・公開SW・保存形式・45秒期限は変更しない。PR151変更なし、PR152ドラフト維持・マージ/公開なし。

## 未加工SWでの自然停止：CI39127017545

初回空母爆撃方針の元trace/動画/JSON/jobログを再利用。観測側要求IDは44番map-strategy-navigator.js?v=580が228、45番strategy-goals.js?v=580が229。ブラウザープロトコルのrequestIdとは別。双方Node受信時刻2722msにpage/context request、以後response/requestfinished/requestfailedなし。本文完了は不明で、要求の物理送信完了も保証しない。

|段階|43 update-manager|44 map-strategy-navigator|45 strategy-goals|
|---|---|---|---|
|要求イベント|あり|あり|あり|
|ヘッダー応答/要求終了|あり/あり|欠測/欠測|欠測/欠測|
|native script load|新文書309ms|なし|なし|
|本文読了|要求終了＋loadを観測|未確認|未確認|
|SW内部fetch/cache/handoff|未計測|未計測|未計測|

初期controllerはbare sw.js activated、新文書194msに版付きinstalling、195msにcontrollerchange/activating、199msにactivated。Node受信順は要求2722ms→controllerchange2723msだが、通知受信時刻とnative時刻は異なるため「44の実送信より後に切替」と断定しない。43のloadは切替より後。30秒観測時はloading、lastScript43、controller/active版付きactivated、installing/waitingなし。timer/getRegistrationは動いており、観測時点のmain thread全面停止ではない。native DCLはなく、Playwright waiterだけの見逃しでもない。

サーバーログの21:24:06.741〜21:24:55.200 JSTは版付き1〜43のGETヘッダー記録各1、44/45は0。版なしprecache GETと区別する。欠測からSW fetch未到達/ブラウザー内部queueを断定せず、200ヘッダーから本文完了とも断定しない。動画35秒は部分的なホームUI、trace.networkは0byte。原本を上書きせず[抽出JSON](pr152-script44-natural-audit.json)へ保存。

## 隔離SW内部計測

元4境界に44/45を追加。同じRequestオブジェクトのSW内IDをfetch-event、network、cache-match、cache-put、respondWith引渡しへ引き継ぐ。ブラウザー側観測IDとは別名前空間であり、URL/時刻/workerを併用する。ネットワークResponseとCache.matchのResponseをWeakMapで区別し、handoff-responseへsource=network/cacheを付ける。

cache-put-completeは製品SWが既に作ったcloneの消費完了で、ブラウザー本体の本文完了とは別。追加clone/arrayBuffer/毎回clients.matchAllはしない。cache-matchの解決は本文読了としない。cacheの本文はbrowser requestfinished/loadで確認する。stageの受信順を厳密な因果順にせず、MessagePort/Promise wrapperによるworker寿命・タイミング影響は未除外。

有界history192件、Node buffer1024件。通常CIは未加工SWのまま。内部計測・キャッシュseed・通信故障・no-storeは専用サーバー/明示configの新規プロフィールだけ。認証情報/本文/任意queryは保存しない。Node検査は応答同一性、同一要求ID、余分なfetch/clone/本文readerがないこと、put完了前のhandoff、cache応答元を検証。

## ネットワークとCache APIの対照

playwright.script44.config.cjsはretries=0/workers=1/45秒。両エンジン×未加工/計測の各ケースで、版付きSW activatedと44/45のCache API seedを条件で確認。network-first reloadの後、対象2URLだけサーバーで接続を閉じ、fetch rejectからcache fallbackへ進める。HTTP503はfetchが成功解決するため代用しない。ブラウザーをofflineにはせず、WebKitオフライン検証とも扱わない。

初版6件は3成功/3失敗。2件の計測ケースでは2回目がHTTPキャッシュから返り、期待したSW cache fallbackを通らなかった。未加工Chromiumの機能成功もcache経路の証明にはしない。WebKit未加工1件はsw.jsアクセス制御pageerrorで失敗し、2reloadと保存比較は完了。根本原因は不明、資料を保持する。

初版のresponse.fromServiceWorker=trueやcontroller activatedだけでも、新しいSW fetchが発生した証明にならない例があった。私用serverの対象2応答だけno-storeにしてHTTPキャッシュ再利用を排除した。Cache APIには保存でき、SWソース/通常serverは変更しない。これは実験条件の修正で、製品の不具合修正ではない。合格条件・期限・pageerror0検査は維持。

修正版の4ケースは全初回成功、再試行0/pageerror0。両エンジンの計測SWで44/45各々、network-start→headers/source network、cache-put-complete、handoff source network、browser requestfinished/loadを確認。故障時はnetwork-failed→cache-match hit→handoff source cache、browser requestfinished/loadとDCLを確認。保存6キーのその時点の文字列/nullは各reload前後で一致。全6キー非nullの専用プロフィールは前回成功証拠を再利用し、この対照で追加の網羅を主張しない。

## 44の本文保留と45の実行順

未加工SWの自然失敗そのものを再現した実験ではない。SW無効と計測SWそれぞれで、44のヘッダー/先頭1024bytesを送出後、明示releaseまで本文を保留。45のrequestfinishedと43のloadがあっても、44/45のload・DCLはなくnative loading。SW有効では44のnetwork headers/handoff/cache-put-startは到達、cache-put-complete/browser requestfinishedは未到達。解除後にput完了・44/45のload・DCLまで進む。

最終版は両エンジン×SW無効/計測の4件全初回成功、再試行0/pageerror0。network、SW clone本文消費、応答引渡し、ブラウザー終了、script load、DCLを分けられた。自然失敗は45の転送完了さえ未確認なので、この模型と同じ原因とはしない。通常SW/計測SWの速度差や成功回数から解決も宣言しない。

## 旧CIの再試行3件

|ケース|初回失敗|初回の復元|再試行|通信/Cache例外との関係|
|---|---|---|---|---|
|空母爆撃CI方針保存|45秒reload/DCL待ち|未到達|復元成功|pageerror0。上記43→44境界。例外がないことを正常扱いしない|
|潜水艦夜戦CI方針保存|45秒reload/DCL待ち|未到達|sub-late復元成功|初回native/要求JSONとtrace欠測、動画/context/再試行traceは保持。44境界との同一原因は不明|
|同期受信状態/保存/復元|最後のerrors=[]検査|同期受信・保存・再読込UI検査は通過|成功|SW block。raw/local app-version.jsonアクセス制御例外。更新確認URLに対応するが初回stack/要求取消詳細不足。CORS/外部204fixture/遷移取消を未分離|

Cache Context is stoppedの過去資料は発信context/stack不明。以前「復元後」とした箇所は、3de7ebfでreload開始後/DCL前、後に復元成功と訂正済み。元API鮮度診断fetch、新しい更新確認fetch、45秒停止を共通原因にしない。

## 2-5北と検証区分

2枠の恒久回帰と16候補は保持。追加は扶桑2枠＋那智1枠を可変にした3枠部分領域。他の艦/装備枠/ドラム缶2艦/電探/低速などは固定。独立全列挙の数値解4件と、同期候補shortcutなしの製品探索を照合。両エンジンとも26評価で同期と同じ解（索敵49.458745/制空66）を発見、beam-limit/exhaustive=falseと総合registeredReady=falseを保持。新規2実行初回成功・再試行0。

一般探索の網羅性・同期外15候補の索敵ボーナスは未確認で、0補完しない。全5モード/保存6キー/同期・プランナーは既存証拠と通常CIで維持する。53例は全条件検証済み1/一部49/未確認3、証拠のみ台帳へ追加。Chromium元重複宣言2件、5-6、実機iPhone、WebKitオフラインも未確認。

**自然停止の根本原因は未確定。** 44のSW fetch到達前/内部/ブラウザーdispatchのどこで待つかが元試行では未計測。今回、隔離時の各段階と応答元を検証したが、SW登録統合/timeout/製品loaderは推測変更しない。既存証拠：/workspace/hd152-passive-sw-20261018、追加証拠：/workspace/hd152-script44-20261018。最新CI結果はPR本文へ記録する。


## 初回trace欠測を繰り返さないための限定保持

新CI39133010384ではWebKitのPWAキャッシュ/オンライン再起動が初回45秒DCL待ちで再試行成功。初回動画/context、再試行traceは保持したが、元のon-first-retry設定では初回trace/native JSONがない。44境界と同じ原因とは断定しない。キー比較へ未到達なので、この初回を保持成功とも不一致とも扱わない。

既知の潜水艦夜戦保存とPWA再起動の2件だけに、未加工SWの受動観測と初回trace（snapshots=false）/動画/段階JSON保持を追加。Playwright 1.55はdescribe内trace設定を認めず、初版の設定検査はテスト未実行で失敗した。資料を保持し、潜水艦は既存night-policy-reload.spec.js、PWAはpwa-cached-reload.spec.jsへ移動してファイル単位で限定。通常の他ケースには適用しない。

元の2ケースの準備・機能アサーション/待機条件を、観測用追記を除いたテキスト照合で一致確認。PWAのhelperも同一、SW allow/Chromiumのみoffline/WebKit onlineの分岐を保持。45秒/expect期限変更、skip、pageerror除外なし。PWAの比較対象は従来の5保存キーのままで、6キー全非nullの証拠は別の既存プロフィールを維持する。

移動後の対象4実行は両エンジン初回成功・再試行0（46.8秒）。Chromiumのオフライン検査とWebKitのオンライン検査を分ける。npmの通常CI一覧へPWA移動先を加え、旧ファイルから移した2ケースを重複させない。収集は各エンジン672件で維持（--listは実行成功数ではない）。原本/照合記録/設定失敗と最終結果はfocused-reload*、moved-case-equivalence.json、collection.logへ保存。製品修正ではなく、次の自然停止を採るための診断変更。


## 40c3595の自然な初回失敗とfixtureの別問題

CI39158760058のWebKitは671初回成功/1再試行成功、最終失敗0。新しく失敗したのは「carrier three-plane CI policy persists and regenerates the mobile loadout」で、ケース全体45秒期限をpage.reload/DCL待ちで消費した。直前の装備/方針検査は通過、初回の再読込後方針検査は未到達。初回video/contextとretry traceを保持、初回trace/nativeはこのケースには未設定で欠測。成功した再試行を安定解決としない。

原ジョブログのケース開始19:33:11.046 UTC、root GET19:33:11.283、2回目root GET19:33:15.008、retry開始19:34:03.122。2回目root以降は同期script1〜34の版付きアクセス記録があり、35〜45はない。ヘッダー出力だけで本文読了/loadを判定せず、SW経路の欠測とも区別する。旧PWAの1〜13記録/14以降欠測、元の43 load/44以降未確認とは同一境界としない。今回の既知ケースも既存night-policy-reload.spec.jsへ移して初回trace/未加工SW受動記録を残す。45秒・待機/機能アサーションは維持する。

追加観測した潜水艦ケースは初回復元成功だが、3753msにhdFSSuggestionHtml内のs.missing.length TypeErrorが記録された。元のテストがhdFSPlansへmissing/low/info等を持たない部分スタブを返しており、背景再描画の正規入力契約に違反する。これはfixture不備の証拠であり、製品や45秒停止の原因確定ではない。潜水艦と同型の空母3機fixtureだけ、既存3方針fixture同様のhdFSGenerateから正式な提案を作る。元の在庫・個体ID・レベル・slots/装備方針・元の機能アサーションを維持し、単一の指定個体を生成したことと、実rendererが例外なく受理することを即時確認する。描画関数由来のpageerror0検査を追加し、全例外は引き続き記録する。

同じ潜水艦初回にはreload-start4235ms、raw/local app-version.jsonのアクセス制御例外4249ms（stackはhdFetchVersionMeta→hdFetchLatestVersion→hdCheckForUpdate）、SW版付きURLの空stack例外4251ms、DCL4675ms、方針復元4857msもあった。これら3通信例外とfixtureのTypeErrorを別分類とする。API鮮度照合2URLはその前に200/ACAO=*/requestfinishedを観測しており、このraw版情報取得の例外と取り違えない。取消/CORS/実行環境/SWの責任範囲は未確定。復元に成功したため通信例外を正常扱いにはせず、同時に45秒停止との同一原因も断定しない。

全原本と抽出は /workspace/hd152-script44-20261018/ci-40c3595 に保持。製品/SW/保存形式の変更なし。追加fixture修正と初回保持の局所結果・最新必須CIはPR本文へ記録する。53例は1/49/3のまま。


追加fixture初版の局所4実行は空母3機2初回成功/潜水艦2失敗/再試行0。潜水艦の新しい即時個体検査が失敗した。hdFSPresetInfoのトークンは「潜水艦1」で、hdFSTypeMatchesは潜水艦/潜水空母を含む。「潜水空母1」はパーサーに未登録だったため、正式なトークンへ修正。個体検査は緩めず、失敗した潜水艦2実行のみ追加確認し両エンジン初回成功・再試行0（23.3秒）。空母3機の成功を理由なく再実行しない。各ケースの元の機能検査列と45秒期限を維持、スタブ生成だけは上記理由で変更した。fixture-after（2成功/2失敗）とfixture-sub-valid（2成功）は別資料として保持。収集数は引き続き672件/engine。CI結果はPRへ記録する。
