> 最終CI追補 2026-11-13T21:24:48+09:00：本文末尾「修正後CI43418204272の確定結果」が現在の結果。CIソース2a2792e3と記録追補HEADを分離する。

> 最新採用追補 2026-11-13T20:31:28+09:00：本文末尾「採用・修正後CI」が現在の方針。従前の禁止/未コミット記述は各時点の履歴として保持する。

> 最新追補 2026-11-13T19:19:21+09:00：本文末尾「CEIO表示巻き戻りの原因・最小修正・関連検証」が現在の結果。従前本文は初期局所調査の履歴として原文を保持する。

# CI43359339548の局所追補：Night採取漏れとCEIO操作停止

2026-11-13 JST。今回の新cloneのHEADは `9018a19181fc14314e3608e1ceb0644ebfa3c8e9`。旧CIの検証ソースは `6b46af267f3a230a1b12a9c9f5ca3c645884cd76`。今回の実行対象は9018a191上の未コミット試験差分であり、6b46af26そのものの再実行ではない。push・commit・CI起動は行わない。

## 旧保持照合との分離

新領域は `/workspace/scratch/harbordesk-pr152-resume-20261113-piuo1j3_`。旧workspaceの復元ではない。局所42原本、旧保留原本、4-5隔離12件、旧作業ツリーの未コミット差分の保持照合は「アクセス待ち・未完了」を維持する。既存保持確認記録とCI専用245件を変更せず、新しい結果で代用しない。今回の再開指示は新ソースの独立調査だけに適用する。

## 既存CIの分類

CI43359339548 attempt1/source6b46af26は3ジョブ成功・2失敗・1取消、Full skipped。全Chromium論理集計は未確定。WebKit compactのpassed/flaky/failedは928/14/3で、厳密な初回成功・物理試行数への読み替えをしない。

既存compact原本ではWebKit初回928 passed/14 timedOut/3 failed。初回nonpassed17例と同じcaseのretry17例を全件対応し、retryは14 passed/3 timedOut。最終失敗はCEIO guaranteed/unknownと3-1 CFG stock。初回の操作箇所が確認できるのはNightのload後6キー配列比較、H回避stockのpageerror配列検査、stale recoveryのhash-navigation pollの3例で、残14例は停止操作・保存比較到達が欠測。

17例の各試験ファイルは有限索敵バッチで変更されていない。ただし登録・共走負荷・タイミング等の間接影響は除外できない。「今回との関係確定」「無関係確定」はいずれも0、証拠不足として扱う。対象有限索敵4例の初回保持比較成功を、他の失敗やC2最終判定へ転用しない。

C2は開始からsmoke取消まで45分で設定と一致し、取消は試験工程中。大きな資料uploadは取消後114秒で、uploadだけで上限に達したとはしない。公式取消理由本文は取得不能。beginのみ2例・未開始24例・472 logical outcomes nullを別記する。

追加取得はrun/jobs/check-run一覧が成功。W4ログ専用取得はTransport closed。注記本文・直接job詳細は連携endpoint非対応の400で取得不能。注記の存在数と本文は区別し、認証変更・制限回避・同じ取得失敗の反復をしない。

詳細は新領域の `private/ci43359339548-all-seventeen-classification.json`。既存6例の記録も残す。

## 最小の試験側補正

製品欠陥・fixture誤りは確定していない。Nightの従来のload後比較は90行目で失敗すると、95行目の結果JSONに未到達だった。既存のafterLoad読取り結果から、明示した元6キー順の存在・長さ・文字列完全一致だけをNode内で計算し、元処理のfinally完了後にも保持する。

Storage操作、page.evaluate、保存、reload、待機、timerは追加しない。DCL後とload後の元の完全一致・同一文書・complete・方針・例外検査は維持する。保存値本文を追加metadataへ出さない。採取エラーが元の例外を上書きしないようにし、元の失敗がなければ採取エラーで失敗する。既存submarine比較関数と他Nightケースは不変。静的レビュー初版の例外優先順位指摘は実行前に訂正し、初版・最終レビューを別保存した。

## 今回の実行と結果

固定image digest b27e719e…、Node24.21.0、Playwright1.55.0、WebKit2203。新規導入は新領域だけで行い、ソースはreadonly mount、同時containerは1、終了後0。環境初回は新harnessファイルの読取り権限で停止し、Node/browser未開始。権限補正後の実試験と分けて保存した。

- Node：既存7＋新契約4＝11件、実初回成功、retry0。期待値の実行後変更0。
- carrier Night/WebKit：実初回成功、retry0。DCL後・同一文書load後の元の6キー比較、方針と元の例外検査を通過。6キー中、元の非null2／null4を保持した。全6非nullの証拠ではない。今回再発なしであり、旧CI初回の実配列・不一致キー・原因は欠測のまま。
- CEIO guaranteed/WebKit：実初回timeout、retry0。初回探索・自動配備・保存・メモ編集後の案/元艦/他編成/metadata比較は通過。reload後のroute=1確認まで到達し、再探索clickが非表示待機で45秒総期限に達した。新探索・load後全文比較は未到達。
- CEIO unknown／3-1 CFG stock：局所計画の最初の失敗で停止したため未実施。既存CIの失敗を局所成功で補完しない。

CEIOの同一試行traceでは海域攻略ナビのframeからguide「攻略情報を探す」へ切り替わっている。hdMSNOpenは正常return、buttonは存在するが67回のactionability確認が非表示で停止した。クリック配送・探索ハンドラー開始は未確認。探索が遅いとは判定しない。呼出し元stackは採取されておらず、製品/fixtureの具体的欠陥、旧CIとの同原因、保存消失を断定しない。期限後の状態を期限内成功へ変えない。追加診断・反復・推測修正は行わない。

CEIO内側summaryのlocal markerは今回未設定のため既定false/nullであり、CI実行への紐付け証拠にはしない。新領域の外側plan・source manifest・実行記録で局所実行と区別する。737 tracked sourceを試験後に全件bytes/SHA256で照合し差分0を確認した。この文書は試験後の記録だけである。

## 残件と次の最小作業

公開保留を解除しない。旧保存不一致・各凍結対象の未解決、通常CIの失敗/取消が残る。Nightの今回成功で旧原因や保存安全性を証明しない。

原因未確定の操作停止として、CEIOの同一文書Nav→guide切替の「変更先と呼出し元stack」が次に必要な最小観測1点。取得後に予定された呼出しかをコードへ対応付けてから修正を選ぶ。既存の表示切替診断を再利用できるか先に確認し、固定待機・強制クリック・期限延長は使わない。

旧資料の保持照合再開には、旧保存領域または由来を照合できる既存バックアップ、局所manifestと42原本、旧保留原本一覧、4-5隔離12件の原本/差分一覧が別途必要。新clone・新出力を代用品にしない。

236セルは28確認済み/188一部/20未確認のまま。進捗表の格上げ0。PR152ドラフト・未マージ・未公開、main競合と保護対象を維持。製品・版・SW・main・PR151・本番は変更0。

## CEIO表示巻き戻りの原因・最小修正・関連検証（継続作業）

この節が最新の結果で、上記は初期局所調査時点の履歴。HEADは9018a191のまま、旧CI対象6b46af26を区別する。旧原本の保持照合は独立したアクセス待ちとして維持し、旧workspace探索は行っていない。push・commit・新CI・マージ・公開は0。

### 再現した原因

CEIO成立/WebKitの同一再読込文書で、起動時のguide復元が予約したscrollが、後続の明示ナビ移動後に実行されていた。対象module原文の末尾へ既存observerの設置だけを追加し、操作前のinstall用evaluateを省いた対照で再発を捕捉した。

|文書内時刻ms|記録|
|---:|---|
|2406|hdWSRestoreStartupContext → hdWSOpenAnchorId → hdWSApplyでguideを復元し、元の0ms scrollを予約|
|2737|hdMSNOpen → hdWSShowElement → hdWSRevealElementでmapStrategyNavigatorへ明示移動|
|2838|旧scroll（元workspace-tabs.js129）→ workspace-compat.js18 → hdWSShowElement → hdWSRevealElementがguideを再選択|

元の表示先は、保存前の「編成を編集」操作で選ばれたguideとして再読込へ引き継がれていた。起動復元自体は正当だが、予約済みcallbackが新しいdirect navigationの有無を確認しなかった。互換処理は、隠れたトップsectionへのscrollIntoViewをnavigationとして扱うため、古いscrollが新しい選択を上書きした。再探索clickは非表示待機で45秒総期限に達し、2回目の探索・最後のload全文比較は未到達だった。

原文SHA256は0485e5442428d8978d2d8828457199fbff9191c653d814d973cb13c6f852dbaf、診断配信版は5fafd99dbc0e57a678fc83fb1cf9f49355534e33053aa3487b1cc3474a7eec9f。原文45796bytesを配信版49011bytesの完全prefixとして保持し、元module2要求・配信2・採取失敗0、両文書のinstalledイベントを確認した。診断負荷はある。入口外の直接DOM変更・保持済みalias・設置前呼出しは観測対象外で、producerの最終drop/failure合計はnull、観測下限とreceiver側の確定値を区別する。

この一再現の原因は特定できたが、旧CI43359339548や過去の別試行の呼出し元欠測を同原因と断定しない。

### 製品修正と保証

workspace-tabs.jsの2箇所に限定した。

- hdWSOpenAnchorIdの0ms scroll：自分のdirect-navigation epochを捕捉し、callback時に現在値と一致する場合だけ元のscrollを実行。
- hdWSHandleAnchorの70ms scroll：自分のShow処理後のepochを捕捉し、同様に古いcallbackを失効。

新しい待機・timer・Storage操作は加えていない。遅延0/70ms、既存の期限、探索上限、例外検査、元の試験の保存/読取り/reload回数を維持した。古い無効navigation自体を取消すため、それに伴うworkspace/historyの余分な保存は実行されなくなり得る。実Storage総呼出し数が修正前と同数とは主張しない。

背景Apply/refreshのseq変化と、新しい明示選択のepoch変化を区別した。新しいNavと新しいguide選択をともに保持する。hashchange自身が予約するOpen、同期再入などの別境界は今回の修正範囲外であり、すべての遅延navigationを解決したとは扱わない。workspace-compat・探索・装備判定・保存形式・版・SWは変更していない。

### 診断・境界検査・初回記録

既存route-navigation-observerの2入口wrapperを再利用し、opt-inで同じmetadataだけをNodeへstream化した。保存値本文・引数/返値/例外本文は新規採取せず、stackのquery/fragmentを除去する。this/引数/返値/例外、元assertion/finallyを保持する。finishはNode保存だけで、失敗後の追加page.evaluateは行わない。採取失敗は元の例外を優先し、元失敗がなければ採取エラーでfailする。

- 初期evaluate設置の診断：CEIO成立・情報不足・3-1在庫不足のW各初回成功。原因解決の証拠にはしなかった。
- source末尾設置の契約初回：14成功/1失敗。成功route callbackの返却値に依存したtest doubleの誤前提を、route.fulfillの実引数をcaptureする形へ最小訂正した。helperの応答・製品・期待する保証は不変。この段階のbrowserは未開始。
- 契約訂正後：15成功。その後のsource末尾設置CEIO成立/W実初回はtimeoutし、上記の原因stackを採取した。
- 実ソース14関数と全文compatを使う同一の合成モデル6条件：修正前4成功/2期待違反、修正後6成功。期待値を製品結果へ合わせて変更していない。DOM/layout/時計/queueは合成で、実試行と別証拠にする。
- 修正後Node：新stale-scroll15・observer15・既存hash7＝37成功。正当なscroll、古いscroll取消、新しいguide、背景Apply、scroll=false、元例外を検査した。通常smokeの既存Node gateへ関連2ファイルを登録し、CI条件/期限は変更していない。

各試行の初回・再実行理由・未開始をprivate/trialsの別ディレクトリへ保存。PW retriesはすべて0で、成功目的の反復はしていない。

### 診断OFFの修正後実操作

指定digest/Node24.21.0/PW1.55.0/C1187/W2203、workers1・retries0・45秒/12秒・上限/待機/取消/元assertionを維持。

|対象|初回結果|保持確認|
|---|---|---|
|CEIO成立/W|成功|保存・編集・同一文書load後の全文/配備/理由・元6艦identity30・他編成/metadata|
|CEIO情報不足/W|成功|同上。HQ不足のmanualを保持|
|3-1 CFG在庫不足/W|成功|同上。任意攻撃不足・制空未判定・route readyを分離|
|CEIO成立/C|成功|同じ保存・編集・load後比較|
|既存startup/navigation回帰/C・W|各成功|元assertを保持し、予約済み0/70msと新しいNav/guideの境界を追加|
|追加Night起動回帰/W|失敗|DCL後6キー一致は通過、元の例外検査で停止しpost-load比較は未到達|

CEIO成立の合成入力ではcoef1/HQ120/score35でgate/route readyだが、任意索敵・攻撃目標不足や未選択制空は残り、総合missingのまま。CEIO情報不足は有限電探1を配備してもHQ欠測のmanual、3-1在庫不足は任意攻撃0/2と制空reference52を充足認定せず未判定として保持した。在庫超過はなく、これらを経路全体の確定や勝利保証へ広げない。3-1のsaved.customExact=falseは元fixtureからの意図したapply/edit差分で、保存後全文保持はload.customExact=trueで検査した。

追加したC/W回帰は、後続の正当なproduct70ms scrollの発火を条件pollで待ち、古いguide scroll0回と最終Navの両方を検査する。固定待機・強制クリック・新timer・全prototype置換をせず、対象要素spyはReflect.applyで元処理を通し、終了時に元descriptorを戻す。

### 別件Nightと公開残件

追加Night/Wはremote main/app-version.jsonとlocal app-version.jsonの2要求のaccess-control例外で、現在84行（旧82）の元errors=[]検査に失敗した。DCL後6キー一致と方針は通過、同一文書load後の比較には未到達。前回の成功や旧CI90行目の配列不一致とは別試行・別停止で、欠測を補完しない。両版要求は既存hdFetchVersionMeta → hdFetchLatestVersion → hdCheckForUpdateのload起点であり、今回のworkspace guardに直接の通信変更はない。間接的なtiming因果は未確定。例外を無視せず、追加反復・版fixture変更・製品fetch修正へ広げていない。

旧CIの初回nonpassed17と各retry、C2取消/未開始/未確定の分類は既存JSONを再利用する。今回の正常3例を、旧失敗の保存比較通過へ置き換えない。今回のcauseが過去14timeoutにも共通かは未確定。新CIは禁止のままで、旧C2取消理由本文、全Chromium最終論理集計、旧Night実配列は欠測を維持する。

新しい仕様判断はこの2callback修正には不要。公開判断には旧保存安全性保留・別件Night例外・通常CI失敗/取消の確認が残る。旧42原本・旧保留・4-5隔離12件は独立したアクセス待ち・未完了のまま。今回の新clone/出力を代用品にしない。

236セルは28確認済み/188一部/20未確認を維持。限られた編成と操作列を行全体の完了へ上げない。PR152はドラフト・未マージ・未公開。今回の変更は未コミットで、push・CI起動・main統合・PR151・版・SW・本番・マージ・公開は実施していない。

## 採用・修正後CI（実行許可後の追補）

今回の指示でcommit・正しいPR152ブランチへの通常push・通常smoke1回が許可された。前節までの「未コミット」「push/CI禁止」は当時の履歴として残し、この節以後の状況と区別する。マージ・公開・ドラフト解除は引き続き行わない。

### 採用範囲

- 恒久的なNight失敗metadata保持を独立commit `d9d5ff3dcee75876b2e2abad6e381f6c39dc173c` にまとめた。既存の6キー読取りから存在/長さ/完全一致を生成し、URLは有限timeOriginとHTTP(S) origin+pathnameに限定する。query/fragment/userinfo/余分な文書属性・保存本文を出さない。元の例外はfalsy値も含めて保持し、元失敗がなければ採取失敗でfailする。compact成果物に新JSONを明示登録し、retry成功後も初回資料を退避する。
- 製品のepoch guard、15件のstale-scroll Node契約、既存releaseケースのC/W回帰、Node gateへのstale-scroll登録、本追補を次の製品修正commitにまとめる。
- 一時診断4ファイル（route-navigation-observer本体/契約のconsole/source-install拡張、CEIO/3-1のopt-in wiring）と、observer用の新Node登録tokenは採用しない。未stageのローカル差分として保持し、破棄・上書きしない。private資料・原本trace・保存本文・実値はcommitしない。

### Night版取得2例外の切分け

既存試行の旧文書の自動load1200ms更新処理が、Node側reload開始後・旧pagehide前に外部main/app-version.jsonとlocal app-version.jsonの2取得を開始した。pageerror2件もその時間帯に発生した。公開request/responseの全記録にこの2版要求はなく、HTTP status・CORS header・TLS/proxy/ブラウザー内部の状態は欠測である。環境要因、実CORS応答不備、製品/診断のどれが原因かは確定しない。

Nightには版mock・外部204置換・故障注入がなく、SWは元のnetwork-first/cache fallbackでallow。既存の製品fetchはno-store/キャッシュバスターと失敗処理を使う。version-call診断はstrictな非async call-onlyで元Promise/this/引数/返値を保持するが、identity/stack/timingへの介入は残り、その関与も除外しない。3-5の204 fixture不整合を無条件に流用できない。製品・fixture・環境を修正する根拠が足りないため、例外除外・正常JSON化・期限変更をせず、修正後CIでこの未検証範囲を確認する。

### 既存CLIで追加取得できた旧CI公式注記

取得は既存ghの通常API経路で行い、認証・プロキシ設定を変更していない。旧CI43359339548/source6b46af26の同job/同試行の注記だけを使用する。

- C2の公式理由は「The job has exceeded the maximum execution time of 45m0s」。従前の公式理由欠測はこの取得範囲で訂正する。ケース内訳の未開始・途中取消・全Chromium未確定は変えない。
- CEIO成立/情報不足と3-1在庫不足は各初回/retryの6物理試行で、公式caller stackを同SHAソースへ対応付け、保存/編集後の指定検査を通過した後の、load後2回目search click非表示と確認できた。最終load全文比較は未到達。切替元stackと実値JSONは依然欠測で、今回の再現と同原因とは断定しない。
- 旧Night初回90行目の公式注記では、保存基準6要素はstring2/null4、load後はnull6。差分は艦台帳・装備台帳の2キーだけstring→nullと同SHAのキー順から対応付けられる。保存本文は転記しない。同一文書/completeと先行DCL比較を通過した後の不一致で、後続方針/例外/JSON検査は未到達。物理削除・不可視化・Storage障害・原因は未確定のまま。旧5null等や今回の版取得例外と同原因としない。原本JSONの欠測と旧原本保持待ちも変えない。

### 局所証拠の再利用とCI受付

通常の正当な起動scrollを保ち、新しい明示選択を優先する保証は、既成功のstale-scroll15契約・既存hash7契約とC/W回帰で確認済み。製品コードはその成功試験から変更していないので局所UIを繰り返さない。恒久metadataのprivacy投影を変更した分だけ、固定Node24.21.0の13契約を1回実行し全成功した。

pushでは正しい作業ブランチ `codex/required-route-invariants` とリモートHEADを照合し、forceを使わない。自動起動した通常smokeがあれば利用する。自動起動がない場合だけ同じ対象SHAの通常smokeを1回要求し、重複を避ける。旧CIの失敗・今回の初回/retry・修正後CIの結果を分離する。CI対象SHA・URL・確定結果は受付/終了後にこの追補とPR現状欄へ記録する。

セル28/188/20・59行236セル、旧原本のアクセス待ち、PR152ドラフト・未マージ・未公開、版/SW/main/PR151/本番未変更を維持する。

## 修正後CI43418204272の確定結果

CI対象は製品修正commit `2a2792e3fb2a4f19e4a88ec5a49ac687c17c39c0`、親は恒久metadata保持commit `d9d5ff3dcee75876b2e2abad6e381f6c39dc173c`。通常push先はPR152の `codex/required-route-invariants`。自動runがないことをworkflow・branch・完全SHAで照合した後、通常smokeを1回だけ要求した。[CI43418204272](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/43418204272) はworkflow_dispatch/attempt1で、再要求・再実行・条件変更は0。この追補は終了後の記録だけであり、CI対象ソースと記録HEADを区別する。

|ジョブ|最終状態|ケース結果と限界|
|---|---|---|
|Chromium C1|成功|473例が初回passed、retryなし|
|Chromium C2|取消|472予定、427初回passed、beginのみ2、未開始43。runFinished=false/fullStatus=null、全472のfinalOutcome=null|
|WebKit W1|成功|339 passed / 0 flaky / 0 failed|
|WebKit W2|失敗|163 passed / 0 flaky / 1 failed|
|WebKit W3|成功|257 passed / 1 flaky / 0 failed|
|WebKit W4|成功|184 passed / 0 flaky / 0 failed|

smokeは4成功/1失敗/1取消、run全体failure、Fullは意図どおりskipped。WebKitの論理集計は943 passed/1 flaky/1 failed。物理初回945試行は943 passed/2 failed、retry2試行は1 passed/1 failedであり、初回成功とretry成功を分ける。Chromiumは初回終了900 passedを観測したが、終了欠測2・未開始43を含み、全Cの論理最終集計には換算しない。

C2の公式理由は45m0sの最大実行時間超過。smoke本体がcancelledで、その後の資料uploadだけが上限原因とはしない。beginのみの2例は `route-south-scouting` のunknownと `route-target-scope` のfixed CEFL ready。最初の停止操作・後段比較は欠測であり、探索遅延や非表示と推定しない。C2原job logは既存gh通常経路がForbidden、既存GitHub連携がTransport closedで各1回失敗したため打切り。認証変更・同経路反復・大容量ZIP全回収はしない。

### 対象の到達とNight

- 起動復元の拡張release回帰はC/Wとも初回成功。通常復元と正当scrollを残し、新しい明示選択を優先する既存局所証拠を再利用した。stale-scroll15契約は実Open/Handleの境界、既存hash7は診断保持関連であり、startup全動作の7検査とは呼ばない。6smokeジョブのNode gateとbrowser verifyも成功した。
- CEIOの成立/ランダム域/情報不足、3-1 CFGのknown/stock/unknownはWebKitで全6例初回成功。保存・編集・同一文書load後の元の全文/配備/理由/対象外データ比較まで到達。CEIO/CFGのChromium計6例はC2取消により未開始で、W成功や局所成功で補完しない。
- NightはW4全5例が初回成功/retryなし。C2でも5例それぞれの初回onTestEnd passed/errorCount0を観測したが、runner全体は未完で各finalOutcome=null。これを全CやC2の最終成功へ広げない。
- 対象carrier NightはC/Wそれぞれ、元のDCL後6キー比較、同一文書load後の完全一致、policy、元の例外検査まで通過した。同じ物理試行の新metadataも6キーexactMatch=true、先頭2非null/残4nullを維持。全6非nullの証拠ではない。旧CI初回の2キーnull読取り、局所Nightの版取得2例外と別試行の結果であり、旧原因の解明・保存安全性の一般証明にはしない。

### 今回の失敗と修正判断

W2のH回避stockは初回/retryとも `route-fastplus-ui.spec.js:50:509` の元errors=[]検査で、remote main/local app-version.jsonのaccess-control2例外により失敗。先行するload全文・他編成/他海域比較は通過した。W3のfixed CEFL stock初回も `route-target-scope.spec.js:39:382` の同じ種類の例外検査で失敗し、retryは成功した。これは非表示待機や保存比較不一致として分類しない。

同SHAのコードと公式注記では版取得処理の直接変更はないが、今回の修正との間接timing影響は除外できない。製品/試験/実行環境の原因を選べず、環境要因や旧Nightと同原因とは断定しない。今回変更に関連する新規製品回帰や、無関係と確定できる失敗の根拠は得られていない。推測修正・mock追加・例外除外・期限延長・成功目的の再実行は行わない。C2取消の下位原因も原ログ欠測のため未確定であり、次の限定観測/修正を選ぶ前に必要な証拠を区別する。

公開判断上は版取得例外によるCI失敗、C2取消と未検証範囲、旧保存不一致・凍結対象の原因未確定、main競合が残る。今回の正常Nightで旧保留を解除しない。追加の仕様判断を要する変更や、根拠のない修正には進んでいない。

### 回収と保持

新CIの資料は新領域 `private/adoption/ci/43418204272/` に分離した。小17ZIP計574465bytesは公式artifact SHA-256/byteと一致。collectorの `final-classification.json`、`final-manifest.json`、`retrieval-gaps-final.json` と、Nightの `night-review/night-compact-analysis-v2.json` が今回の引継ぎ先。巨大raw trace/video ZIPとC2原job logは未取得。受領・未取得・比較未到達は別に記録する。

一時診断4ファイルとworkflowのobserver登録tokenは未コミットのまま保持し、採用commitへ混ぜていない。旧局所42原本・旧保留・4-5隔離12件/旧作業ツリーの保持照合はアクセス待ち・未完了。新CI資料の照合や旧CI専用245ファイルの一致で代用しない。元領域の復旧探索は反復していない。

236セルは28確認済み/188一部/20未確認のまま、変更0。装備個体単位の配備/重複防止と固定枠保護は未確認のまま。PR152ドラフト・未マージ・本番未公開、main競合、PR151/版/SW/本番未変更、マージ・デプロイ・ドラフト解除・自動マージなしを維持する。この記録だけの通常pushでは追加CIを要求しない。

新CI資料だけの独立readbackはPASS_WITH_RECORDED_GAPS。collector manifest244件の実一覧/bytes/SHA-256、17ZIPの公式digest/size、抽出173memberが一致し、raw6compact/公式注記/ジョブ結果と集計も一致した。記録は `private/adoption/ci/43418204272/independent-readback-review.json`。既知の未取得/未開始/終了欠測を含む判定であり、旧原本保持照合や全CI成功を意味しない。
