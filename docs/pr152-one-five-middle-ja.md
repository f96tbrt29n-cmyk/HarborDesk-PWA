# 1-5/index1 ADFGJ：任意装備表示と搭載先の限定改善

> 1-5初回CIと試験契約訂正（2026-10-31 JST）：source96f9ec47／CI41149583450 attempt1は全6smokeジョブがNode前段の同じ旧caller文字列期待で失敗（各581件＝580成功/1失敗）、Full skipped・取消0。ブラウザー起動検証とsmokeは未実施で、C/Wのpassed/flaky/failed・保存/load比較はnull、route metadataは未生成、公式artifactは0件。7-3の既存条件自体は保持され、1-5条件の挿入で隣接文字列assertだけが不成立になった。7-3の有限indexによる実caller評価へ訂正し、新1-5 Node8件の通常wrapper登録漏れを1requireで補完した。固定環境の必要登録検証9件は9成功/0失敗・source変更0。元の局所Node26ユニーク＋Python2とは別の必要検証実行として記録し、ユニーク件数へ9を加えない。製品/browser spec/入力は変更せず局所C/W6を再利用する。セル27/151/58は変更0。訂正後HEAD/CIはpending、次は同じ1-5/1 ADFGJの既知四隻代替。以下のpending等は各時点の履歴として保持する。

基準HEAD `7c5c81349be318c626f3b423a5b69bbfb5d543e7`。専用領域へ分離し、旧草稿・原本を上書きせず再開した。旧v2は実ファイル/manifestを照合して再取得したが、最終v3は旧原本として復元したものではなく、新しく作成した。最終HEAD/通常CIは未反映でpending。PR152はドラフト・未公開。

## 利用者から見た変更

上段カードは汎用対潜1組・水爆なしだったが、同じ選択例の探索は対潜3組と航戦水爆を比較していた。選択した航空戦艦1＋駆逐3の四隻例だけでカード数量を合わせ、ソナー/爆雷投射機の同艦別通常枠と、航戦の正容量通常枠への水爆候補を案内する。未知情報は未判定のまま、数量不明を既定1や充足0へ変えない。

不足例はソナー3/投射機2・水爆0の有限在庫で、投射機あと1個・水爆あと1個という既存任意モデルの内訳と具体候補を表示する。扶桑改二は未所持の大型ソナー「零式水中聴音機」と投射機を別の通常枠に載せられる候補を含む。手持ち小型ソナーの不可とカタログ候補を区別し、全候補艦への装備や購入を要求しない。同時配備・実火力・先制人数・勝利は別判定。

製品は owned-equipment-planner.js と sortie-equipment-check.js の表示/案内2件だけ。route/FE/recipe/汎用集計/保存形式、上限10000/beam5/depth24/port800、待機・取消・45秒/結果12秒、版・SWは不変。厳密map/index/path・generated=true/recommendationで接続し、重複/不明ASW descriptorを未判定にする。6-3水母用のH索敵/航空偵察文言は1-5へ流用しない。

## 出典と適用範囲

[ぜかまし1-5](https://zekamashi.net/kancolle-kouryaku/1-5/)をGET1回/200・retry0で取得。本文295,763B、SHA-256 `1302d96e0b28173413e4108ada2950a3095e56662f39bbdaf18df261f8b3822a`、記事更新2026-09-27。D/F/Gの上から優先する条件、航戦1軽巡0–2駆逐1–3のADFGJ例、潜水艦＋潜水空母と潜水母艦の区別を照合した。水爆1個/対潜3組が新しい通行必須数や攻略の十分数量だとは確認していない。既存の任意比較と先制対潜人数を分ける。

出典にあるCL2DD2・BBV1CL1DD2等の別の既知四隻ADFGJ例は「出典待ち」ではなく、元BBV1DD3例scopeを解除する接続/検証が残る。通常の選択例情報でcontractがreadyでも元例を外す場合、最終hdFERouteはmanual「編成例の登録範囲外。別例の分岐は未判定」とする。利用者の明示制約は別に保持する。2–3隻は現fleet4条件の不一致となる別の範囲で、出典の4隻/4隻以下表記差と全先行条件の照合が残る。フラグだけを解除して全代替へ一般化しない。

## 局所検証

Nodeは境界8＋実モデル5＋影響親10＋純生成2＋実カタログ1＝最終26ユニーク成功、Python純読取り2は別。実カタログ検査の生成器呼出しは0。旧sourceの期待失敗1と、境界fixture前提の初回1失敗→該当titleだけの必要訂正1成功は原本を分けて保持する。

固定image digest b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29、Node24.21.0/Playwright1.55.0/Chromium1187/WebKit2203、workers1/retries0。C/W各3状態の最終6代表が完了した。物理7試行は、旧Cstockの初回期待不備1失敗と最終6代表の合計。成功目的の反復0。

旧Cstockは製品探索の結果を採取した後、「ASW搭載先はDD3だけ」という期待で停止した。マスター個別411は大型ソナーtype40と投射機type15を許可し、手持ち小型ソナーtype14は禁止している。製品/入力を変えず、BBV＋DD3・装備名/別通常枠・未所持候補注記を明示するstock期待だけを訂正した。旧初回の保存/編集/reload/load未到達は新成功で補完しない。旧Cknownの不変な成功は再利用し、他4件は未実施だった初回として実行した。

|C/W各1の状態|経路／総合|初回→load後の候補数|操作と保持|
|---|---|---|---|
|known|ready／ready、比較目標充足|802→0|保存→メモ編集→同一文書load全文。提案装備を保存し、元4艦＋純空2行を保持|
|stock|ready／missing、探索incomplete|683→456|投射機/水爆の任意不足と合法枠候補を表示し、保存→編集→load全文まで完了|
|unknown|manual／missing、探索incomplete|504→504|未知source/装備可否はmanual、上書き拒否・編集なし4＋0で元全文/load保持|

保存または安全中止後の読取り6件は、実保存/メモ編集4件＋安全中止後読取り2件であり、保存書込み6回を意味しない。実perOriginalの4艦×5識別項目を再計数し、保存側120/load側120、実純空行8/8・未知追加0を独立確認。同一新文書load6件、元8キー/他編成/他海域/planner/調達sentinel/metadata保持、頁例外/採取失敗/保持不一致の陽性0。4→6配列化で元identity/gear配列全文比較はknown/stockでfalseだが、元20項目/純空2と提案装備全6行の直接比較はtrue。未知は元全文true、提案比較は非該当。新規調達案の保存耐久性は確認していない。

初回/load後の返却艦名配列・装備配列・全goal object・全measureは直接一致。wholeSearchはknown/stockで差分、unknownで一致。known終了理由配列はbeam-limit→bounded-searchの差を保持し、stock/unknownはbeam-limitのまま。完全なraw入力/返却plan全体/評価呼出し数は未採取nullで、FNVや別試行から補わない。候補数の変化は保存した配備が次の初期入力になる操作であり、性能改善の証拠ではない。全検索exhaustive=falseで最適・不可能・購入必須としない。

## 証拠と残件

最初のruntime manifest `15ac7d19d72a85bfaecf6d2974abda96b5aae2ed7c3021c8759efc2b2d58f479`／spec `9a142a7c…`のCknownを再利用し、残5件は訂正runtime `68f1d9b36cb0bab5eda6ad1a9ea94ad91b443c00f517df82f5f62cd2839214c5`／spec `470fc8b7…`。両者を同じ全ソース実行とはしない。製品/入力/known分岐・共通保存列は直接不変、公開fixture `2746d3a3…`は両者共通。HTTP配信filehashは未実測。

原phase844→回収858 payload（manifest `691f06fc…`、独立`54706a25…`）、訂正phase817→827 payload（manifest `18d026c0…`、独立`36520e01…`）を閉鎖した。canonical集計 `1422a290…`と独立`aeb010c8…`はknown-load理由カテゴリだけを別追補し、新観測・原本改変なし。完全hashは機械可読の今回recordに保存。trace/動画/実値はprivateで保持し、共有は許可metadataだけ・sanitizer/外部upload0。

- 実装不足：出典の既知四隻代替を元例scopeの未判定から接続する作業、全目標/在庫/枠競合の同時配備十分性。
- 検証不足：canonical外・全艦型/全在庫/同期/実機、完全入力/返却plan・評価数。今回の代表操作を全体へ広げない。
- 出典待ち：任意数量の唯一の必要十分性、先制人数・実対潜機代替/火力/発動/勝利、2–3隻を含む表記差/全先行条件。
- 操作不安定：旧load後非表示・通信・自然保存実null/DCLの原因は未解決。今回再発なしで旧失敗を解決扱いにしない。

236セルは1-5/1/defaultのB/C未確認→一部・D未確認→確認済みだけ、26/149/61→27/151/58。A/他58行/旧53/基準は不変。次優先は同じ1-5/1 ADFGJの出典が明確な既知四隻代替(CL2DD2/BBV1CL1DD2)の元例scopeと任意目標適用。まず現canonical修正を通常commit/push・同HEADの通常smoke1回で閉じ、その後に別単位として確認する。既存canonical局所6件を代替編成の成功へ無条件流用せず、2–3隻は出典表記差/全先行条件未照合の別残件として維持する。今回その新調査/試験/製品変更は行っていない。

旧CI41113618989はsource7c/attempt1・5smoke成功/W4失敗・取消0/Full skipped、case内訳/保存比較は欠測のまま。今回の結果で補完しない。最終HEAD/CIはpending、PR152ドラフト・未公開/main競合を維持し、main統合/PR151/版/SW/本番/マージ/公開/自動マージは変更しない。

## 2026-10-31 初回CIとNode試験契約の訂正

製品・実画面の反映sourceは `96f9ec474b44d0e1ab251b756e85698dd0ae2a06`。通常smoke [CI41149583450](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41149583450) attempt1は2026-10-31 09:21:11 JSTに失敗終了した。全6smokeジョブのNode前段は各581件中580成功/1失敗・skip0/cancel0で、共通の1件は `tests/seven-one-identity-preservation.test.cjs:98`。タイトルは「first ACE capability scope filters second-gauge ASW guidance and leaves the legacy second and map-wide render unchanged」、エラーは「the owned panel must pass the selected preset only for the first 7-3 scope」である。

原因は、caller内の `['6-5','7-2'].includes(map)||map==='7-3'&&c.index===0` という隣接文字列に対する旧期待だった。今回その間へ厳密な1-5/index1条件を追加したため、文字列として一致しなくなった。7-3/index0条件と直前のfirst/second/legacy描画検査は保持されている。製品の誤判定や保存不一致を示す失敗ではない。既存のfirst/second/legacy描画検査を残し、7-3の有限indexで実callerの引数・preset同一性・非変更を確認する検査へ訂正した。7-4/index0・7-5/index0/1/2等の他scope不変は独立したソース照合を根拠とし、この7-3検査による実操作確認へ広げない。

同時に、新しい `one-five-middle-boundaries.test.cjs` の8件が通常Node wrapperに接続されていなかった。ブラウザーspecの固定一覧登録とは別の漏れであり、`conditional-speed-ui.test.cjs` へ1requireだけを追加した。訂正はこの2試験ファイルのみ。製品2件・browser spec・合成入力・操作順・保存回数・探索上限・待機・取消・期限・例外検査を変更していない。

訂正後の通常登録経路で、旧caller検査1件＋既存の1-5境界8件、必要な9件が固定image/Node24.21.0で各1回成功した。失敗0・実行中source変更0。局所の最終26ユニーク成功およびPython純読取り2件とは別の必要検証実行として記録し、26へ9を加えたユニーク件数にはしない。最初に生成したJavaScript controllerは改行構文エラーで、子Node試験開始前に停止した。準備失敗の原本を別保持してcontrollerだけを訂正した。これは製品失敗・期待不備による対象試験失敗・成功目的の試験反復ではない。製品/browser spec/入力が不変なので、保存編集4＋未知安全中止2・同一文書load全文まで完了した局所6代表は再利用し、追加ブラウザー反復は行っていない。

CI41149583450ではブラウザー環境検証とsmoke実行が全てskippedで、自身6代表を含むC/Wのpassed/flaky/failed、保存・編集・reload・同一文書load比較は全て未観測（null）。Fullはsmoke選択によりskipped、取消0、retry0。公式artifact一覧は0件で、route metadata/trace/動画はブラウザー未到達により未生成であり、認証失敗や生成済み成果物の取得不能とは区別する。公式注記は各jobのNode exit1と、actionのNode20→24移行/Ubuntu runner移行の2警告で整合し、警告を製品障害と扱わない。

正式attempt1ログZIPは445,017B・90項目、CRCおよびSHA-256 `0438dc2aa49fb961031889b0567ed68d4cae8fe22869b74a2a0c001f43ca5d4c` が一致した。run/jobs・全6check/公式注記・artifact一覧を取得し、取得不能0。各6jobのcheckoutは上記96f9ec47の完全SHA、実pullは固定image digest b27e719e…、Setup Node実測は24.21.0だった。ブラウザーrevisionとHTTP配信filehashは検証step未到達により未採取で、期待ソース648件のGit/作業ツリー/manifest完全一致をその実測へ置き換えない。collectorの134件・2,403,610Bは独立SHA/bytes照合済みで、manifest SHA-256は `1ef4bdf0bdea2d7062da3a7574ad1e89299bba1bf733d75ef997eee87af4824c`。原ログ・実値はprivateを維持し、sanitizer/外部upload0。

236セル27確認済み/151一部/58未確認は今回変更0。CIの未到達を局所成功で補完せず、局所証拠の範囲も拡張しない。旧CI41113618989の5smoke成功/W4失敗・ケース内訳/保存比較欠測は不変。訂正後HEAD/通常CIはpendingであり、具体的な試験契約・登録漏れ訂正後の必要検証として通常CIを1回確認する。同じHEADの成功目的の再実行とはしない。次優先は同じ1-5/index1 ADFGJの出典が明確な既知四隻代替（CL2DD2/BBV1CL1DD2）の元例scopeと任意目標適用で、今回のcanonical局所6件を別構成の成功へ無条件流用しない。PR152ドラフト・未公開/main競合・既知残件を保持し、main統合/PR151/版/SW/本番/マージ/公開/自動マージは行わない。
