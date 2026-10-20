# PR152: 自然DCL停止の40→41境界とSW観測の介入

基準: d61f821e5526002ea462dbad86795b55bbaac017 / CI39458798000。2026-10-21 JSTの調査。製品修正39801e0は読取り例外/JSON構文エラーの限定UI保護として固定し、再実装・再検証していない。本差分は診断/契約テスト/記録のみ（331fb0cとreceiver契約補完コミット）。製品JS、公開SW、保存形式、版580は変更しない。

## 元の自然停止で確認できる境界

原本は `/workspace/hd152-ui-storage-20261020/ci-webkit4/pwa-cached-reload-PWA-cach-e464a-ith-Chromium-offline-reload-webkit/` の初回trace.zip、video.webm、reload-navigation-evidence.json、pwa-storage-audit.json。再試行はJSONのみで初回traceの代用にしない。サーバーは同rootのci-job-118752518694.log。再解析の抽出は `/workspace/hd152-parser-boundary-20261021/baseline-boundary-analysis.json`、traceのreload抽出はbaseline-trace-reload.json。

Node側events.ms/nativeEvents.msは同じperformance.now()-started。nativeのdoc=1792514248055、atはその文書の時計。受信msと同一視しない。サーバーの壁時計と直接減算しない。

|観測|40 quest-database.js|41 expedition-database.js～45 strategy-goals.js|
|---|---|---|
|page/context request|確認 id163|欠測（内部未発行の証明ではない）|
|response|200、fromServiceWorker=falseを確認|欠測|
|requestfinished / 本文サイズ|確認、15242 bytes|欠測|
|Resource Timing完了|確認、responseEnd=28.899ms（要求基準）|欠測、未完了要求でentryがない可能性も残る|
|script load|Node受信4457msに確認|欠測|
|script評価完了の専用印|未計測（loadと同一視しない）|未計測|
|parserによるscript要素挿入|未計測|未計測|
|SW内部fetch/cache/body/handoff|未計測|未計測|

reload開始4088ms。HTML id151は要求4094→200/SW応答4271→requestfinished4300/4301ms、本文13343 bytes。リポジトリのHTMLも13343 bytesで、41～45のタグは40の後に通常の同期scriptとして存在する。転送完了の記録はparserがそこまで挿入した証明ではない。39 eo-trackerも通信終了/Resource Timing/loadを確認。先行CSS28要求は全てrequestfinished、最後4430ms。CSS解析/適用/ブロッキング状態は未計測であり、通信記録だけで完全除外しない。40のソース末尾はイベント/タイマー登録で、専用評価完了マーカーはない。

30秒診断の受信34292/34293msでもloading、最後40。controllerはsw.js?v=580/activated、registration installing/waitingはnull。pageerror0でもDCL未完了。これはSW内部処理の成功・失敗を確定しない。SimpleHTTPRequestHandlerのGET200はcopyfileより前のstatus記録で、送信本文完了は未計測。インストール時の版なし41～45 GET200を、再読込の版付き要求と同一視しない。

動画5秒/35秒の抽出画像はbaseline-video-5s.png/35s.png。画面の一部は描画されているが、DCL/方針復元完了の証拠ではない。初回失敗はpage.reloadの45000ms全体期限であり、アサーション不一致ではない。

保存は同じcontext d784c41a-5f85-49ee-8ea4-0f61c1f1bb9e、ページ、origin内でpre-reload→pagehide→新文書init→app.js loadの5キー全非null、長さ379/77/745/3154/19とprefixFnv32が一致。これは**長さ/ハッシュ一致であり完全一致ではない**。DCL/比較時点に未到達で以後未確認。旧5実nullの境界は補完しない。削除監査がないだけで物理削除を否定しない。

## 旧自然停止との必要列だけの比較

|資料|最後load|次のscriptのrequest/response/end|Resource Timing|parser位置|
|---|---|---|---|---|
|resource-timing-20261019 CI 空母3機|39|40～45は要求あり/応答と終了欠測|当時未計測|未計測|
|同CI PWA|42|43～45は全て欠測|当時未計測|未計測|
|同root local-natural-stop-audit|4|5以降欠測|4本の完了あり、以降欠測|未計測|
|今回CI39458798000 PWA|40|41～45は全て欠測|40本の静的script完了、以降欠測|未計測|

共通はloading/DCL未確認と後続load欠測。停止境界も要求通知の有無も異なるため、一つのscript内容やSWを共通原因と確定できない。ブラウザーが未発行/応答待ち/本文待ち/実行待ち/プロトコル計測欠落の各候補が残る。

## 1つの判別問いと限定実行

問いは「停滞中の新文書に41番script要素が既に挿入されているか」。存在すれば挿入以降へ絞れ、不在ならDOM挿入前という観測になる。ただし不在もpreload/内部要求の未発行を証明せず、存在も本文/評価完了を証明しない。

parserBoundaryは既存script40 load、既存30秒watchdog、DCLで6要素のメタデータを採るPWA専用opt-in。新タイマー、MutationObserver、レイアウト/HTML本文読取り、script書換え、Storage操作、SW API置換はない。最大128要素を走査し、6要素の有無/番号/属性/load・error観測のみ保持する。既存console経路への追加処理・送信による時間的介入はゼロとは保証しない。各文書3件を成功時もsummaryに保持し、失敗後evaluate/storageStateは行わない。

事前条件は未加工SW、WebKitオンラインPWA、同じ専用fixture、45秒、retries0、OFF1回/ON1回、2回で終了。`pwa.config.cjs`、pwa.log、pwa/summary.json、各ケースのJSONを同証拠rootへ保存した。**2回とも初回成功、再試行0、自然停止は未再現**。5キーの既存文字列完全一致アサーションと所有/司令部Lv/先制対潜復元検査が成功し、auditでも前後5キー全非null。6番目のPWA状態キーはこのfixtureでは未投入のためnullであり、専用6キー保護の新証拠ではない。

ONではscript40 load時点はscriptCount40/41なし、DCL時点は45/41～45あり・load観測あり。OFF/ONのDCL native時刻930/808msは文書ごとの1試行であり性能改善/無影響の証明ではない。別の動的script読込みがあり、最終scriptLoads=85を静的script数と混同しない。自然停止の原因は未確定のまま、追加反復しない。

## SW register/update観測の意味的限界

app.js:658のload入口は版なしregister('./sw.js')、update-manager.js:11は版付きregister→13でupdate、440には別の手動更新経路がある。旧nativeアクセス制御例外には文書ID/API呼出IDがなく、public sw.jsの200/終了と内部登録/更新要求の同一性は不明のまま。

隔離したblank.htmlと**専用no-op worker**（tests/fixtures/sw-api-observer、scopeも同ディレクトリ）だけでAPI観測の可否を検証した。アプリや通常PWAにこのラッパーは注入しない。call-only観測は文書ID/呼出ID/受信thisの識別子/引数の型と安全な文字列URL/返却オブジェクトID/同期throwの識別子を記録し、Reflect.applyで元receiver/元引数を渡し、返却値・throwをそのまま返す。オブジェクト引数のtoString/scope getterを先読みしない。文書時計読取り・配列追加・ラッパー自体の時間的/stack上の介入は残る。完全な呼出元スタックやobject options.scope、settlement、内部要求IDは未観測。handled Promiseの完了結果まで非介入で対応付けられるとは主張しない。

Node契約はreceiver/引数/同期throw/返却identityとthenプロパティ非接触を確認。call-onlyの関数本体をstrictにし、null/undefined receiverがラッパーでglobalThisへ変換されないことも確認した。両ブラウザーの実native register/updateは返却Promise同一、引数変換とscope getter各1回、receiver、無効receiverのnative結果との一致、pageerror0を確認。これは登録障害や元の自然失敗を再現する試験ではない。

別の人工Promise対照では、call-onlyはunhandledrejectionが届き、拒否用thenを付けるoutcome observerでは届かなくなる。両方とも返却Promiseは同一で、拒否reactionは後続checkpointの前に実行される。両エンジンで各対照1回成功、合計4ブラウザー契約実行。人工例外を通常アプリのpageerrorゼロ検査へ除外登録したのではない。既存instrumentSW=true方式はURLも変えthenも付けるため、旧コメントの「同一Promiseなら無影響」を訂正した。通常の未加工SW条件はこの方式を使わない。

## 結果と残件

Node契約13件（native3/evidence9/call-only1）は成功。最初のブラウザー契約4件・PWA対照2件も初回成功。その後receiver=null/undefinedの契約を追加した際、結果配列へ旧文字列用toBeを残したfixture不備2件が発生した（両結果は同じ3個のTypeErrorだった）。値のtoStrictEqualへ変更し、strictなnative転送も確認した最終の該当2件は各エンジン1回/再試行0で初回成功。変更のない人工Promise2件/PWA2件は反復しない。fixture不備の動画/画像/sw-strict.logを保持、この途中snapshotでは初回traceなし。最終fixtureは失敗時初回traceを保持する設定。sw-final/summary.jsonとsw-call-strict-contract.logが契約補完後の証拠で、前snapshotの結果へ合算しない。期限・既存アサーション/pageerror検査は緩和しない。共通保存UIや探索を変更していないため完了済みUI/6キー/攻略回帰は再実行せず、通常CIで既存の関連ケースを確認する。SW隔離契約specは固定リストのnpm test:browserには含めず、明示実行したローカル診断として分離する。331fb0cのCI39472215041は契約補完前snapshotで、最終HEADのCIへ合算しない。診断は正常時の観測機能まで確認できたが、自然停止中のDOM挿入境界はまだ未採取である。実際の製品欠陥を今回新たに修正したとは報告しない。

既存ログ/初回trace/再試行JSONは保持。1回exec開始前のtransport disconnectがあり、pwd確認後に未開始コマンドだけ再実行した（テストのやり直しではない）。既存未追跡node_modulesリンクは保持、コミットしない。

次の具体的作業は、今回の通常CIでPWAの自然停止が出た場合だけ、30秒parser-boundaryと最後load/要求終了を同じ文書で照合すること。未再現なら新たな大量反復をしない。保存5null、45秒DCL、旧SWアクセス制御/通信/Cache API、Chromium重複宣言は未解決。53例は全条件1/一部49/未確認3、同期外15候補manual、2-5北限定探索は維持。5-6、iPhone実機、WebKitオフラインは未確認。PR152ドラフト・PR151未変更、マージ/公開/自動マージなし。
