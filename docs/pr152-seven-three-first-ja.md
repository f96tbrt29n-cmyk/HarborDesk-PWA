> 最終7-3第1ACE CI（2026-10-30）：検証source62d81722／CI40996265641 attempt1は5smoke成功・W4失敗、Full skipped、job取消0。公式C passed874/flaky0/failed0、W865/7/2はcase outcomeであり初回/物理件数へ換算しない。同source局所完了5＋自身CI Wready初回完了を6代表へ直接対応し、Dだけ一部→確認済み、20/140/76→21/139/76。元基準20/137/79からdistinctはB/C/Dの3セル。局所Wready・自CIWstock初回のload未到達と旧欠測は別試行のまま保持。全6checkout/env/Node510/510/0/実pullと27source照合、7summaryを確認したがCI配信filehashの実測ではない。記録のみの新CIは起動しない。[最終記録](pr152-seven-three-first-ja.md#2026-10-30-最終head-smoke確定)。以下の未開始・D一部は局所時点の履歴。

# 7-3第1ゲージ：P開放前ACEの出典一致域

製品・Node実行時の基準は`0f44f839be65d96b5627fd5951fb05525787c326`。7-2分類確定を別commit `eac1294df69eaa06f1a13b988c6cca8d7426f0a1`へ先に反映し、既存19WIPのbyte不変を確認してから本単位を接続した。対象は59行表の`7-3/0/default`。P開放前を選択契約とし、実ゲームの開放状態は推定しない。通常commit/push・同じ最終HEADのsmoke1回は未開始。

## 出典と最小改善

既存保存資料の[ぜかまし](https://zekamashi.net/kancolle-kouryaku/7-3/)・[艦これwiki](https://wikiwiki.jp/kancolle/南西海域/7-3)・[舰娘百科](https://zh.kcwiki.cn/wiki/南西海域/7-3)のA/C優先表を独立に照合した。保存HTML/hashを確認し追加fetch0。日本語元HTMLの403は残し、保存rendered資料を根拠にした。

元の羽黒1＋駆逐3は4隻の編成例。変更前は羽黒/駆逐/駆逐/海防の`de1`が三出典一致のACE成立であるのにmissingとなった。元43案は値・順序を保持し、第1P1 42案と第2P2 source-only対照1を区別。史実ペアの少数隻優先順など追加8案は別literalとし、第1独立50案はready26/missing17/manual7。

A→CかつC→Eを出典ごとに評価し、一致域だけを判定する。重巡と重巡級、駆逐と駆逐＋海防、軽巡と雷巡/練巡を区別。軽空母のCV系略称、2隻/3隻の史実ペア、揚陸艦、海防戦艦の製品モデル、未知艦の理由は未判定に残す。別に確定した戦艦/正規・装甲空母や5隻以上の不一致は未知艦があっても消さない。

元例の4隻/羽黒/駆逐3を全艦隊へ課さず、利用者が明示した追加艦種・旗艦・速力は維持する。一律高速、数値索敵、経路必須装備数は追加しない。選択ACEの任意夜戦auto-night/night-torpedoを既存の有限在庫/搭載先案へ接続し、夜戦1組は戦闘推奨/利用者指定と説明する。艦種/隻数・出典/情報不足を購入数量へ変換せず、探索未完了を手持ち不可能・購入必須にしない。

## Node・監査・初回失敗

変更前の関連6件は1成功/5失敗、夜戦配置対照2件は2失敗。変更後19件の初回は4成功/15構文失敗。未実行草稿`sevenThreeFirstArticleA`の閉じ括弧2文字（`]}`）の欠落を2文字だけ訂正し、成功4件を反復せず失敗15タイトルだけ再検証して15成功。関連19ユニークの最終成功と初回原本を分けて保持する。第1opt-in外52preset×4modeのroute/speed全208比較、旧7-1の49×2全98、旧7-2の50×4全200と第2ゲージ宣言を保持した。

helper11＋ACE表示scope1は別の1回で12成功。4実艦＋編集時の厳密空2行と安全中止時4行を区別し、元20識別項目、順序/anchor、両末尾行・疎配列の拒否を検査する。製品の保存/editorは変更しない。

旧auditとvalidationのfirst固定4隻/羽黒/DD3を三出典の記述snapshotへ訂正した。製品出力から期待を生成せず、別構築した両条件treeを独立50literalへそれぞれ照合する追加Node1件が固定環境・exact title限定1回で成功。旧19成功の反復0、他58audit行/52validation例・旧53区分1/49/3・接続集計を維持する。この監査記録と新Node1件はUI非依存の差としてsource proofへ分記する。

新しい小summaryはstage/boolean/countだけを出し、欠測はnull、保存値本文は含めない。workflowは既存の大型upload前に当該summaryだけを独立uploadする1stepを追加。既存大archiveの分割/一部取得や上限回避には使わない。純producer2件・consumer2件は各1回成功し、encoder訂正でもsummary関数はbyte不変のため再利用した。CIでの生成/取得成功はまだ未確認。

初回Chromium readyはfirst-searchで失敗し、保存/編集/loadは未到達。fixtureの空装備要素の後にも区切りが残るencoderを、空要素を除いてjoinする1箇所だけ訂正した。逆変換でspec全文が元に戻り、製品/厳密helper/summary/全assertは不変。pure契約の旧空白literal期待1失敗も保持し、そのliteral訂正後1成功を別記する。

## 代表操作と未到達

固定PW1.55.0/Node24.21.0/C1187/W2203/公式noble digest、workers1/retries0/repeatEach1、45秒/12秒。固定一覧はC/W各874件、新規3件、局所8選択は各count1。探索上限・待機・例外検査を緩和しない。 一覧前のprivate checker初回は未解決pathの厳密比較でexit1、一覧/ブラウザー実行0。realpath比較だけ訂正した別候補で構文19件・一覧・598source前後一致が成功し、元のprivate失敗を保持する。

|局所対象|結果と到達段階|
|---|---|
|ready|Cはencoder訂正後の必要再検証で成功。有限魚雷2個を同一艦の別々の通常枠へ配備し、探索案と保存配備を照合。W初回は保存/編集後まで同じ検査を通過したが、load後再探索click非表示で45秒timeout、load全文比較未到達|
|stock|C/W初回成功。経路はready、任意夜戦1組の魚雷登録0/必要2/あと2個と同艦2通常枠、羽黒/夕立/時雨の候補を表示。全候補への配備を要求せず、海防へ同レシピを勧めず、経路必須/購入数量を保証しない。保存/編集/同一load文書全文・他編成metadata保持まで完了|
|unknown|C/W初回成功。経路manual、艦情報未登録を数量不足にしない。反映は元編成を上書きせず安全中止、4行/空追加0を保持。load後manual再表示・同一文書全文保持まで完了|
|既存named保護|C/W初回成功。別必須条件が不足しても満たした史実艦条件を保護。正常3状態の保存/load完了数へ加算しない|

8ユニークは7成功/1Wready失敗、物理9は旧初Cready fixture失敗を含む。正常3状態×C/W6のうち5件が全load比較まで完了。ready/stockの保存編集後は元4艦20識別項目と厳密空2行、安全中止unknownは元4艦/空追加0を検査する。Wreadyも保存配備と探索案、strict20＋厳密空2行、source/他編成/別海域/調達/別プランナー保持は通過した。自動配備・4→6行・メモ編集によるraw identities/realGearExact/customExact falseを保存不一致陽性としない。

Wreadyのnavigation採取失敗は1。採れた1件はreload前文書の予定されたメモ編集guide遷移で、失敗したreload後文書のcallerではない。後文書snapshotは欠測のため、旧文書のstack/guide状態で原因を補完しない。Wready反復・新診断・推測修正なし。初回未到達は別の成功試行でも埋めない。

局所回収は正式閉鎖済み。正常6ユニークはcomplete5/partial1、samples11・saved6・load5、strict20はsaved6/load5、保存不一致陽性0。private原本270ファイル/113,066,345bytes、trace7uniqueのCRC正常、動画9物理ファイル/7uniqueを保持する。named成功2のtraceは既定設定で未生成であり、未採取を0件と扱わない。3つのruntime snapshot各598ファイルの前後一致と訂正後03/04のsource同一を確認した。

## 台帳と次の独立対象

基準20確認済み/137一部/79未確認から、同じfirst行のB/C/Dを未確認→一部とする3セルだけ20/140/76へ更新。Aは出典差と全目標数量の根拠が残るため一部、DもWreadyのload全文未到達を理由に一部。59行×4項目=236セル、他58行・定義・旧53区分を維持し、一部を50%へ換算しない。

軽空母略称/少数隻史実ペア等の出典差、揚陸艦/海防戦艦モデル/未知艦、夜戦の必要十分数・全在庫/搭載/枠競合、図全体・旧出撃目標/通過履歴互換は未完。第2Gの重巡/重巡級不一致は未解決で、graph・SM/SS/SLを変更しない。旧7-1/7-2のload後非表示・未到達、自然実null、DCL/通信等の原因を今回で補完しない。

次の独立候補は7-4/0 ABEJLP。現B/C/D未確認で、駆逐/海防OR・航空艦数・係数4安全域37と任意の対潜/夜戦/基地の適用範囲を分けて確認する。現単位は通常commit/push後、同じ最終HEADのsmoke1回を自動/手動重複なく確認する段階で未開始。PR152ドラフト・未公開、main競合と保護対象を維持し、private保存値本文/trace等を公開記録・commitへ含めない。


## 2026-10-30 最終HEAD smoke確定

7-3第1ACEの最終CIは検証`62d817223a1e72b28f956234a6090b3493c624b0`／[40996265641](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/40996265641)、attempt1・dispatch1/再実行0。5smoke成功/1W4失敗・Full skippedで、公式C874/0/0、W865/7/2はpassed/flaky/failedのcase outcome。局所C3＋Wstock/unknownの5完了と自身CI Wready初回の独立した全文比較/strict20＋空2/全保持/例外0を6代表へ直接対応し、Dだけ一部→確認済み。20/140/76→21/139/76の1セル追加、一連の元20/137/79からdistinctはB/C/D3セルで、A/B/C・他58行/基準236/旧53は維持する。

自身小summary7原本を同source/同fixture・project/state/初回またはretryの同一試行ごとに確認した。completed6試行は各2検索、saved/load全文、比較元7キー/他編成/別海域/調達/別planner、元4艦20識別項目と4順序anchor、ready/stockの厳密空2行またはunknownの空追加0、例外0が一致。unknownのgearMatchesProposal=nullも明示確認した。

|Dの6代表|直接対応する完了証拠|
|---|---|
|C ready/stock/unknown|訂正後同sourceの既存局所3完了（Creadyは必要fixture訂正後の再検証）|
|W stock/unknown|同sourceの既存局所2初回完了|
|W ready|自身CI40996265641・W4初回completed、同一load文書の全文/strict20＋空2/全保持・例外0|

自身小summary7原本はC3各初回completed、Wready/unknown初回completed、Wstock初回load後search非表示待機中に試験45秒上限で停止・retry1completed。局所WreadyとCIWstock初回の全文比較未到達、後文書caller/原因欠測は成功試行で補完しない。全体最終失敗は別対象の5-4 required-missing（初回/retryともload後非表示click待機timeout）と3-5 south unknown（両試行とも保存/load比較後、版取得access-controlのpageerrors検査）。保存比較不一致・同原因・今回変更との因果を断定しない。 Wstock retry1のcompletedは別positiveとして保持するが、上のD更新は局所5＋自身CI Wready初回という直接対応を根拠にする。named保護2件は保存/loadの6代表へ加算しない。全体CIの不成功だけでこの条件単位の直接証拠を格下げしない。

全6ジョブ自身のcheckout62d・Node510/510/0・Node24.21.0/PW1.55.0/C1187/W2203・固定image実pull digestが一致。run/jobHEAD＋checkoutログ＋更新前27source現物/manifestで帰属し、CIで配信したfilehashを実測したとはしない。成果物11中9件496,516,810bytesはserver SHA/外側CRC一致、正式attempt run-log ZIP11,281,584bytesもCRC正常。新小summary2ZIP/7原本とW4自身4試行のraw照合/inner traceCRC4・動画4を保持。C2 raw1,555,485,016bytesとW4 smoke999,354,956bytesは512MiB超で未要求、C本文/trace/video欠測を小summaryで取得済みに変えず、分割/範囲取得・新CIは行わない。 W4は同じ4試行のrawとsummaryを照合済みだが、private保存値本文/traceを公開記録へ含めない。Cは小summaryと同source内hardassertの到達を根拠とし、未取得の本文を独立に再読したとはしない。観測された保存不一致陽性は0、未到達は未到達のままである。

次の独立7-4/0 ABEJLPは別branchでNode12成功が先行し、UI草稿を準備中。実操作・代表保存/load・台帳は未完で7-3の証拠へ加算しない。7-3の出典差/図全体/旧目標履歴/第2G、旧7-1/7-2や非表示/通信の原因残件は保持し、PR152ドラフト・未公開/main競合・保護対象を維持する。検証sourceHEADと後続記録HEADを区別し、記録だけのsmokeは起動しない。


正式閉鎖時の自身8caseは7passed/1flaky（WebKit stock）で、named保護2件を含むcase outcome。7summary原本は初回folder6＋stock retry1の1件、strict20一致はsaved7/load6。これは全試行の物理総数を公式ラベルから推定した値ではない。収集台帳はCI側178ファイル/125,699,867bytes、artifact側121ファイル/532,792,512bytesを再hash照合済みで、サーバー成果物9件の取得byte数とは別尺度。global2件の試行境界は最終正本の一意なoriginal folderだけを使い、reporterの重複header区間を試行数へ数えない。
