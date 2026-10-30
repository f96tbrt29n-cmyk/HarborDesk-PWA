# 7-4 ABEJLP：六隻例の出典一致域と索敵式の未照合

> 最終7-4 ABEJLP CI（2026-10-30）：検証source7fd5298e／CI41007168230 attempt1は4smoke成功・C2/W4失敗、取消/timeout0、Full skipped。公式C876/0/1、W862/12/3はpassed/flaky/failedのcase outcomeで、初回/物理件数へ換算しない。自身7-4の6初回summaryは保存または安全中止後/load後のstrict30比較を完了し、局所完了5＋自身CIWknown初回の直接証拠でDだけ一部→確認済み、21/142/73→22/141/73。局所Wknownのload未到達・caller欠測、secondary7-3Wready初回load未到達と別retry1完了はそのまま保持。全6checkout/env/実imagepull/Node527・source24照合はCI配信filehash実測とは別で、body原本/trace欠測とcasepassedログ導出の境界を残す。[最終記録](pr152-seven-four-ja.md#2026-10-30-自身初回ci確定)。以下は各時点の履歴。

以下の「代表操作6初回と未到達」「台帳と残件」は局所記録時点の履歴。現在の台帳は22/141/73で、末尾の自身初回CI確定を参照する。

collectorの6summary/raw同試行比較・frame/traceCRC/更新前current605のsource-bindingを正式閉鎖し、root公開GOで記録した。台帳基準は21/139/76。実装開始sourceは62d81722、7-3記録だけをFFした台帳基準は69591040で、元16WIP byteと旧7-3原本/欠測を保持した。

対象は7-4/0/default（rows配列index55）。元の航空戦艦1＋重巡1＋雷巡1＋駆逐2＋海防1を代表例とし、六隻を実ゲームの最低数や全編成への推奨十分数にしない。

## 出典・数値式と最小改善

ぜかまし・艦これwiki・舰娘百科の保存三資料と、独立raw57＋policy6の値・順序を保持した。rawのready24/missing17/manual13/partial2/source-ready-runtime-model-unknown1、有限domainでのready18/missing16/manual21/partial2を区別し、CD・六隻外・大鷹系等8件のmanual適用差を元literalへ書き戻さない。

Jの係数4、33未満の逸れ、33以上37未満のランダム域、37以上の継続条件は、司令部補正0.35/既存0.4の適用証明ではない。実計算はformula/manual/available:false/score:nullのまま。rawスコア注入や表の成立を実アプリreadyにしない。既知の始点C/E→G等の編成不一致は数値未判定で消さず、編成見直しへ案内する。partialが後段graphのready fallbackで成立へ昇格しないガードも有限対照で確認し、graphデータ自体は変更しない。

対潜比較3組は所持数と同じ艦への実配備数を分け、1〜2組を配備済みにしない。元六隻の合法な同艦・別通常枠の候補、在庫、未確認を表示する。対潜3組・夜戦1組・開放後の任意基地1部隊を通行必須、先制対潜人数、必要十分数、購入数量へ変換しない。利用者の明示0と保存目標を保持する。

## Nodeと別の純契約

関連Node20ユニークはroute/親legacy12＋placement7＋audit1を別に確認したもの。route反例の最初の短token前提誤りを原本保持し、登録tokenだけ訂正したAO1/DD1/DE4のE→G反例は期待失敗、after12は1回成功。限定逆比較は他52preset×4modeのroute/speed全208と親96/196/204で、全500件以上や全入力の不変を主張しない。

placement変更前1件はactual対潜1組を配備済みと表示して期待失敗し、2組へのループは未到達。変更後初回4成功/3wrapper構文失敗。凍結旧helper末尾の行コメントを閉じ括弧へ連結したharnessの改行2箇所だけ訂正し、失敗3タイトルだけ3成功。成功4件の反復0、7ユニークを単一7成功にしない。旧renderer33/helper24比較も有限範囲だけである。

audit追加1件は両監査treeを独立source57/policy6・別適用差8・実formula gateへ照合し初回成功、旧19再実行0。純summary producer2＋consumer2は別の4契約で成功。Node20や純契約を保存/loadの台帳creditへ換算しない。

## 代表操作6初回と未到達

固定PW1.55.0/Node24.21.0/C1187/W2203/公式noble digest。局所workers1/retries0/repeat1、45秒/12秒、探索10000/beam5/depth24を保持した。通常CIのChromium workers2/WebKit workers1/retries1は別の既存設定であり、公開specは局所1/0を通常CIへ要求しない。一覧はC/W各877、新規3、各局所selector count1、構文13件。public source605とprivate local.config1を含むruntime606を区別し、両phaseの前後一致を確認した。

テストのversion GETには固定app-version JSONを入力する。これはこの操作の固定入力であり、製品の実ネットワーク通信成功・本番更新やキャッシュの安全性を確認した証拠ではない。

|状態|局所初回結果・確認範囲|
|---|---|
|known|C成功。開始時はASW目標3組/配備2組で「配備済み」と表示せず、night0を確認して有限在庫からASW3/night1へ実配備、保存配備と探索案が一致。Wは同じfirst-search/保存編集後30項目・6anchor・追加0/7比較元キー/他保持まで通過したが、load後search-button非表示待機中に試験45秒timeout。load全文は未到達|
|stock|C/W成功。ASW0/3のソナー/投射機各登録0・必要3・あと3個、night0/1の魚雷登録0・必要2・あと2個、同じ艦の別通常枠と候補を提示。全候補への配備や購入量を保証せず、対潜・夜戦の比較カードでは調達buttonを出さない。保存/メモ編集/同一reload文書load全文を完了|
|unknown|C/W成功。別の独立未知艦行と未知装備に対し、元編成を上書きせず安全中止。6行＋追加0・30項目/6anchorを維持し、同一reload文書でmanualを再表示、全文保持を完了|

knownの有限入力14個にはソナー3・投射機3・魚雷2のほか、戦闘機2・水偵2・高角砲1・対空電探1を含む。航空/対空装備等も合成の任意戦闘比較入力であり、通行や数値式、全目標の同時配備、発動率、必要十分数、購入個数の根拠ではない。

6ユニーク/物理6は初回5成功/1Wknown失敗、反復/追加診断/条件変更0。saved6は保存または安全中止後の読取り6件を表し、保存書込み成功6回ではない。known/stock4件は保存・メモ編集、unknown2件は安全中止・編集なし。load全文完了5件はCknown/stock/unknownとWstock/unknownで、Wknown欠測1はそのまま保持する。summaryはsamples11・saved6・load5、strict30/6anchor/6→6/追加0はsaved6/load5一致、pageerror0。knownのsaved gear差とknown/stockのCUSTOM差は予定された配備・メモ編集によるもので、全6のidentitiesExactはtrue。unknownのgearMatchesProposalは両engineともnullである。

Wknownはsavedを通過したがload=null/未到達、navigation採取失敗1で失敗した後文書/callerは欠測。missingを保存不一致陽性や成功へ読み替えず、別の成功試行や旧7-3/CIの結果で埋めない。表示変更元、配送/handler開始、共通原因は未確定。未実行だったWstock/Wunknownだけを同じ凍結sourceのphase2で初回完了し、Wknownは反復しなかった。

全状態のroute/scoutingはformula manual、search incomplete・registeredReadyfalseを維持した。総合readinessはknown manual、stock/unknown missingで、数値未判定が他の確定不足を消さない。knownという状態名は総合readyを意味しない。この数値未判定自体は保存/loadの完了を否定しないが、Wknownの実操作未到達を理由にDは一部へ留める。

## 台帳と残件

基準21/139/76から、同じ7-4/0のB/C/Dを未確認→一部とする3セルだけ21/142/73へ更新。Aはsource差・数値式/HQ補正・全目標数量の根拠が残るため一部維持。他58行・旧53/判定基準/分母236を変えず、一部を50%等へ換算しない。

source差/六隻外/CD/大鷹系等の適用域、実索敵式、全数量/全在庫/搭載/枠競合/探索打切り、任意基地、graph全体/旧目標履歴/実出撃・勝利は未完。7-3と旧CIの原本・欠測・第2G不一致は変更しない。通常CIは未開始で、rootが関連commit/pushと同HEADsmoke1回を重複なく確認する。次は7-5の独立準備を予定する。privateの保存値本文・実行時実値JSON・原本traceは公開記録へ含めない。


局所原本の正式閉鎖は216ファイル/73,591,759bytes。6件のrawとsummaryは同じ試行の保存/load観測へ一致し、trace6のCRCと動画6のSHA、両phaseの606runtime実ファイルと更新前current public605のhashを確認した。606にはprivate local.config1を含む。image digestの固定指定と、各caseのNode/PW実測版・driver registry/executableに基づくインストール済みbrowser revision照合を区別する。browser.versionを独立測定した記録ではなく、まだCI run/配信filehashの証拠とはしない。collector result SHAは`510835f8776e9a2f0a86c102c2755935b88ed4bb6f6034bf7906ae15266ae0f8`、source-binding SHAは`427dc23141c741c31ba49508143ae806ea4d0d6785f98033f8c6f942f9b6c0fb`。


## 2026-10-30 自身初回CI確定

2026-10-30 CI追記：[7-4 ABEJLP](pr152-seven-four-ja.md#2026-10-30-自身初回ci確定)の検証source`7fd5298e7248ebeb6b71c67dae7c0a579e0b7991`／[41007168230](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41007168230)、attempt1・dispatch1/再実行0。4smoke成功/2失敗・Full skipped・取消/timeout0。自身6初回summaryの全厳密比較完了を確認し、局所C3＋Wstock/unknownの5完了と自身CI Wknown初回を6代表へ直接対応してDだけ一部→確認済み。21/142/73→22/141/73の1追加セル、一連の695基準21/139/76からdistinctはB/C/D3セル。A/B/C・他58行/旧53/基準236は不変。

公式C passed876/flaky0/failed1、W862/12/3は各877caseの最終outcomeで、初回成功数/物理試行数ではない。primary7-4は各caseのinitial開始1/retry0と完全な最終failed/flaky一覧への非掲載からcase passedを導出し、個別物理PASS行はnull。小summary6原本はstage completed・6行/追加0・30項目/6anchor・比較元7キー/他保持・例外/nav0の保存後/load後比較完了を示すが、未受領の7-4 C/Wbody/trace原本を取得済みにしない。saved6はknown/stock4の保存・メモ編集とunknown2の安全中止後読取りであり、保存書込み成功6回ではない。局所Wknownの45秒非表示/load全文未到達・後文書caller欠測/nav1は別試行として不変。

|代表対象|Dに用いた直接の完了証拠|保持する別試行の限界|
|---|---|---|
|Cknown/stock/unknown|同source/fixtureの局所3初回・全文load完了|旧記録のまま|
|Wstock/unknown|同source/fixtureの局所2初回・全文load完了|旧記録のまま|
|Wknown|自身CI41007168230初回・stage completed、保存後/load後strict30等の全文比較完了、例外/nav0|局所初回のload未到達・後文書caller欠測/nav1を補完しない|

自身CIはこの6代表すべての初回で全期待比較を完了した。Dは上表の独立した正の証拠を同じ対象へ対応した評価であり、失敗初回の穴を埋めた扱いではない。既存named保護2件はinitial開始各1/retry0・最終failed/flaky非掲載からpassedを導出する別分母で、保存/load6件へ加算しない。数値式のmanualを総合readyへ変換せず、knownの総合manual、stock/unknownのmissingを保持する。

secondary7-3 firstは初回6のうち5完了、Wready初回はsaved strict20＋空2行通過/load全文未到達・nav1、別retry1が完了した。旧7-3資料や失敗初回を補完しない。C2/W4のunknown-ASWは全59行losの説明2文字列（marginNote/numericModelUnverified）比較が128行で不一致となり、初回/retryとも保存参照設定前に停止。数値条件や保存不一致の陽性ではない。別6WIPで根拠ある監査訂正を準備し、Node前1失敗→後2成功、必要C/W対象は準備中で製品変更なし。この検証sourceの2文字列は変更しない。W4の3-4ready/5-4required-missingは初回/retryともload後search-button非表示45秒でload全文未到達、失敗文書caller/handler開始は不明。W1 drop-hunt初回は事前UI/件数assert通過後の最終例外検査でversion access-control2件、全文storage比較はなく初回trace未生成。保存不一致陽性や全保存安全、共通原因を断定しない。

全6jobの完全checkout HEAD、固定Node24.21.0/PW1.55.0/C1187/W2203、実image digest pull、各Node527/527/0と期待source24原本照合を確認。実ファイルhashは局所期待snapshotの確認であり、CI配信filehashの独立実測ではない。13artifact中9件4,452,232bytesをserver SHA/外側CRC一致で受領、4件512MiB超は要求/分割せず、7-4 C/Wのbody/traceは欠測。正式attempt run-log ZIPは別の11,416,985bytes/102membersでCRC正常。受領innertrace1はretry由来で、初回trace0を初回失敗0へ換算しない。記録だけの追加CIは起動せず、次7-5第1ABDFGHKは独立WIP12の静的準備・未実行とする。

未受領4archiveはC2 attempt-diagnostics 1,181,223,459bytes、W4 attempt-diagnostics 653,203,951bytes、C2 smoke 2,369,955,692bytes、W4 smoke 1,314,076,995bytes。summary原本13件はprimary7-4初回6＋secondary7-3初回6/retry1で、分母を混ぜない。fixed version JSONは引き続き試験入力であり、製品の実ネットワーク通信成功や本番更新/cache安全の証明ではない。privateの保存値本文・実行時実値JSON・原本traceは公開記録に含めない。

source-binding SHAは`89235093a4f5451fc083565d77121e4f968f91f42b6f711b38097098f93672ab`、collector closure SHAは`59b7e1e4cdc991f3abb0201d95553a8e694ddc6f692588c87822fde7c68c7608`、正式run-log ZIP SHAは`1ffeb1897b36e165159b8609f327af1ed30c6368c7d2b945e9eb8f8259dd116e`。rootによるsource commit/push後の初回CI結果であり、検証7fd5298eと後続の記録commitを区別する。新保存不一致等の停止基準、PR152ドラフト・未公開/main競合・保護対象、旧7-3原本/第2G/各欠測は維持する。
