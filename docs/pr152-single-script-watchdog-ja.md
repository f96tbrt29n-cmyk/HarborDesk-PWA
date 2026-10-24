# PR #152: scriptCount1の自然停止と唯一要素の識別

基準: `52b37295e8779c2d7a99902e5b26d84414808c2d`、CI [39498551953](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/39498551953)。製品・SW・fixture・保存形式・45秒期限・既存アサーションの変更なし。診断の不足1点を補う作業であり、保存5キー実null／自然DCL停止の原因修正ではない。

## 同じ初回失敗資料から確定した範囲

原本: `/workspace/hd152-carrier-parser-20261021/carrier-valid/artifacts/night-policy-reload-carrie-5f01b-enerates-the-mobile-loadout-webkit-parser-on/` の初回trace.zip・video.webm・画像・reload-navigation-evidence.json・pwa-storage-audit.json。サーバー記録は同階層上の `carrier-valid.log`。読取り専用の抽出結果は `/workspace/hd152-single-script-20261021/` の `original-css-analysis.json`、`selected-boundaries.json`、`trace-structure.json`、`limited-dom-path-audit.json`。

以下のmsは単一observeReloadのNode経過時計。nativeのdoc/timeOrigin・at/performance.nowとは直接減算しない。

|観測|同じ失敗試行の記録|限界|
|---|---|---|
|再読込・文書|reload-start 5599、HTML応答6016、navigation6045、新文書native doc=1792530566969 init6050|HTML応答200/SW=true、終了・本文サイズ13343はHTMLについてのみ。全scriptの受渡し完了を意味しない|
|最初のapp.js要求|id184、6059、`app.js?v=580`、owner=frame/type=script|応答・requestfinished・requestfailed・JS resource・loadは欠測。collector要求にnative doc ID／個別frame IDはない。再読込区間・同URLの関連付けであり、文書の同一性をネイティブIDで証明していない|
|43番候補の要求|id226、6068、`update-manager.js?v=580`、owner=frame/type=script|同じ限界。静的HTMLの順序43と要求URLは対応するが、その時点でDOM内に存在した証明ではない|
|先行CSS 28件|同試行のid156〜183。27件で200応答と要求終了（6089〜6149）、失敗通知0|完了した27件は全てresponseのfromServiceWorker=false。CSS通信終了とCSSOM／同期scriptのブロック解除は別|
|残るCSS|id183 `mobile-layout.css?v=580`、6059要求。応答・終了・失敗は欠測|欠測を通信失敗やCSS待ちの原因と断定しない|
|サーバー|21:09:27に版なしmobile-layout.css/app.js/update-manager.jsのGET 200|Pythonアクセスログはステータス出力であり、ブラウザーへの本文読了を示さない。版付きのpage要求と共通IDがなく、SW内部取得との対応も未確定|
|watchdog|36048、native at30405、loading、scriptCount1、走査切詰めfalse、既存6要素全てpresent=false|唯一要素のURL・属性は当時未計測。HTML先頭がapp.jsであることから唯一要素をapp.jsと断定できない|
|load/resource|新文書load0、error0、JS resourceCount0、DCLなし。native/resource/境界drop0|resourceはJSだけを収集。CSSのresource0を意味しない。通知欠測は本文未完了や評価未実行の証明ではない|
|SW|init時controllerは版なしsw.js activated。6075/6076で版付きv580のcontrollerchangeとactivatedを観測|SW内部fetch/body/respondWithは未計測。切替と停止の因果関係は未確定|
|保存|投入済み2キー・未投入null4キー。pre-reload/pagehide/initまで存在・長さ・ハッシュの整合を観測|完全一致比較はDCL後に未到達。ハッシュ一致を完全一致、旧5キー実nullの原因否定には使わない|

初回traceはsnapshots:falseでDOM snapshotなし、networkリソースも空。ブラウザー要求イベントは単独JSONにあり、traceの空欄から未発行とは言えない。traceのcontextとpageは同じで、reload呼出しのpageIdも同じだが、要求ごとのnative文書IDはない。

以前の「42番home-dashboard.js load完了後」とは異なり、今回の新文書にはload0、scriptCount1しか観測されていない。今回を旧42境界の続きとして扱わない。watchdogが新文書で実行されたので「文書内JSが一切実行できない」「45秒全体にわたりJSイベントループが連続占有されていた」はその限定範囲で除外できる。一時的な長時間処理・CSS待ち・script取得／評価待ち・通知経路欠測は残る。43番不在は「一度も挿入されなかった」証明ではない。

## 限定したDOM操作経路の確認

静的45本と当該fixture／診断について、document.open/write/writeln、文書本体innerHTML/outerHTML置換、script選択・削除を確認。

- `update-manager.js:hdLoadScriptAttempt`には同じdata-hd-*属性の旧動的script削除と、error/12秒期限後の削除・再試行がある。通常入口hdStartCurrentAssetsはDCL（又は既にready時のmicrotask）から。静的script全体を削除する処理ではなく、今回の失敗文書で実行された証拠もない。
- home-dashboardのnode.removeは攻略リストの子要素照合。静的scriptはウィジェット外のbody末尾。construction-databaseの変数body.innerHTMLもhdConstructionBody内でありdocument.bodyではない。
- 当該fixtureは再読込前に作成articleのinnerHTMLを設定してbodyへ追加する。文書全体の差替えではない。診断はscript要素を読取るだけ。
- この範囲にdocument.open/write/writelnや文書全体の置換は見つからなかった。ただしコード上の限定確認であり、未観測の実行経路やブラウザー内部状態を否定しない。

## 不足1点の補完と限定実行

判別する問い: loading時の唯一の現在要素はapp.jsか、別URL／inline要素か。原因候補の同一視を避けるための識別であり、単独で通信／評価／挿入履歴は確定しない。

空母夜戦ケースのみ`parserSingleScript:true`。既存30秒watchdogの既存境界記録で、未切詰めかつscriptCount===1の場合だけ`singleScript`に安全なhttp(s) URL（認証・任意query・hash除去）、type、async/defer、connected、既存WeakSetのload/error観測を残す。inline/data本文は取得・記録しない。受信側も同じopt-in／reason／count／truncated条件を検査し、単独JSON・添付・成功時summaryに保持。既存の6要素、3理由上限、128走査、PWAの40境界は維持。新timer／observer／レイアウト取得／本文取得／script変更／SWラッパーなし。

契約19件成功（追加4件）。既存タイマー1本・30000ms、opt-in外／DCL／複数要素への不適用、URL秘匿、独立JSON・添付・raw ring切詰め後summary保持を確認。開発中の契約1件は既存script-errorイベントまで検査した範囲誤りで失敗し、今回の追加境界フィールドへ検査範囲を正した。自然な製品失敗や再試行成功へ合算しない。両ログを保存。

事前条件: 未加工SW、元fixture、45秒、retries=0、WebKit対象1回で結果にかかわらず終了。OFF/ON比較は繰返さない。

結果: 対象1件初回成功、再試行0、失敗0。reload6124→DCL6844→6要素完全一致7802→方針復元7859、pageerror0。2キー非null／4キー未投入nullの元fixtureを維持（全6キー非null試験ではない）。新文書の42load・DCLを保持、境界drop0、切詰めなし。watchdogは正常DCLで取消され、singleScriptの自然採取は未再現。契約による人工入力の保持成功と自然停止時の実採取を区別する。設定と成果物は `target.config.cjs`、`protocol.json`、`target.log`、`target/summary.json`、`target/artifacts/`。成功のためtrace/videoは保持されず、JSON・Storage監査・summary・添付は残る。

## CIの例外検査範囲と残件

基準CI39498551953は必須6ジョブ成功、任意Fullはskip。Chromium683件初回成功、WebKit681件初回成功＋2件再試行成功、最終失敗0。

- night policy: 初回はSWアクセス制御pageerror、DCL・方針復元後のerrors=[]に失敗。
- carrier bomber: 初回はGitHub APIアクセス制御pageerror2件、DCL・方針復元後のerrors=[]に失敗。
- 両初回trace/video/JSONあり。再試行はJSONのみでtraceなし。どちらも今回のDCL停止とは別分類。
- three-planeは初回合格だが外部／ローカルapp-versionアクセス制御pageerror2件が残る。既存検査はstackにhdFSSuggestionHtmlを含む例外だけ（submarineも同じ）。全ページ例外ゼロの証拠ではない。今回その検査範囲を変更していない。

製品修正39801e0・保存UI・攻略探索は変更なし。53例は全条件1／一部49／未確認3、同期外15候補manualを維持。旧5キー実null、旧SW例外と内部要求の対応、Chromium重複宣言、通信／Cache API、5-6、iPhone実機、WebKitオフラインは未解決／未確認。PR152ドラフト維持、PR151未変更、マージ・公開・自動マージ有効化なし。

次の判別可能な作業: 必要な通常CIの対象ケースでloading-watchdogが自然に出た場合、今回のsingleScriptと同じ文書のload/resource/要求履歴を照合し「停止点が最初の静的script付近か、別要素を含む状態か」を判別する。発生がなければ旧唯一要素は未計測のまま残す。成功するまでの反復や旧欠測の成功記録による補完はしない。
