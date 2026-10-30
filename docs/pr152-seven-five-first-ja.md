> 復旧・W4訂正（2026-10-30 JST）：実コマンド成功で接続回復を確認し、7-5第2草稿12件を保持して通常作業を再開。旧W4の末尾sync-merge分類はregex漏れとして訂正し、実末尾receive-controlsの個別結果は不明。全W nullと23/143/70は不変、after/C/W成功の追加0。[追補](pr152-seven-five-first-ja.md#2026-10-30-実行接続復旧とw4進捗解析訂正)。以下は各時点の履歴。

> 最新確定（2026-10-30）：訂正後source0cb16ded／CI41029470607は5smoke成功・W4はjob45分上限取消、smoke自体cancelled。公式C880/0/0、W1〜3小計660/0/0、全Wはnull。自身7-5第1の6初回操作summaryは保存/適用編集・同一文書load全文/strict30・他保持まで完了し、同じ行のDだけ確認済み、23/143/70。旧local未到達/caller欠測やW4物理case outcomeは補完しない。[確定記録](pr152-seven-five-first-ja.md#2026-10-30-訂正後ci0cbの確定)。以下は各時点の履歴。

> 最新：初回CI41026417307はNodeの旧隣接文字列契約1件で停止しbrowser未開始。製品不変で当該1検査だけを意味に沿うVM確認へ訂正、局所1成功。訂正後CIは未開始。旧local5完了/Wstock未到達と22/144/70は別証拠のまま保持する。

# 7-5第1ABDFGHK：経路判定と選択装備の接続

対象は7-5/index0/default、F→G・H→Kを選ぶ第1目標Kだけ。元の航巡1・雷巡1・軽巡1・駆逐2・水母1は編成例で、実在6艦の駆逐1＋海防1への置換を旧「駆逐2以上」だけで不成立にしない。第1の装備欄へ混ざっていた第2の対地表示を外し、ソナー/爆雷投射機各1の任意セットに同艦・別通常枠の候補を示す。夜戦補助1個は旧任意比較のまま、第1専用の夜戦CI1組を新設しない。末尾の旧gear再代入で詳細案内が失われる接続も修正した。

## 根拠と適用範囲

記事/KCのB/Dを優先順に別評価して一致域を扱う。軽巡は雷巡・練巡と別、護衛は駆逐＋海防で、Dの軽巡＋駆逐へ海防を足さない。高速＋B救済、最速D救済と、それより先行する空母・重い編成等の条件を区別する。Dの高速＋Fと戦艦級＋正空＋重巡級3以上Eの優先差は未判定。日本語wikiは1回403の原本を保持し本文未取得のまま。六隻は今回の評価範囲で実ゲームの最低数ではなく、ゲージ開放・実到達・勝利は未確認。

既存source52/policy8、別actual3、別joint-unknown1を凍結保持した。主反例は最上改二特506・北上改二119・矢矧改二乙668・夕立改二144・占守改376・千歳甲106のnative低速艦隊で、艦種/隻数の見直しを装備購入へ送らない。索敵はKで非適用/score:null、M/第3の閾値や0点へ置き換えない。先制対潜人数の未指定・明示0・既存目標は保持する。第2/第3の登録・旧出撃目標/通過履歴・保存処理は変更していない。

## 検証と未到達

Nodeは新route10＋影響親4、追加placement6＋audit1、具体的gear guard追加後の既存last1。異なる成功21種類、物理成功22で、重なる1件は修正後の必要検証。旧DD2制限と旧第2対地表示/ASW案内未接続の2対照は予定失敗で、実画面の修正前誤表示や実喪失を観測した証拠ではない。有限逆比較は他52preset×4、親94/192/200/204、renderer39/helper20であり全入力の不変を主張しない。native376占守改3枠と、別の合法2枠境界517占守は別fixtureとして扱った。純producer2/consumer2は別のmetadata契約で成功。

固定image/PW1.55.0、Node24.21.0、C1187/W2203、workers1/retries0/repeat1、45秒/12秒、探索10000/beam5/depth24を維持。smoke一覧はC/W各880、新3・6selector各1。元version GET2件の固定JSONは試験入力であり、実ネットワーク/製品版取得成功の検証ではない。

|状態|Chromium初回|WebKit初回|
|---|---|---|
|known|ASW0→1組・夜戦補助0→1個を有限8品から配備。保存/メモ編集/load全文とstrict30完了|同じ操作を完了|
|stock|在庫0のソナー/投射機各必要1、同艦別通常枠候補、旧夜戦補助1個の任意不足。保存/編集/load全文完了|保存/編集後strict30を通過。load後再探索clickが非表示で45秒、load全文未到達|
|unknown|未知艦/未知装備を未判定とし、安全中止・元CUSTOM完全一致、編集なし、load後も保持|同じ操作を完了|

6初回は5成功/1未到達、反復0。保存または安全中止後の厳密30項目/6anchor/6→6追加0は6件、load全文は5件。保存書込み/メモ編集4件と安全中止/編集なし2件を区別する。全到達分で比較元7キー・他編成/他map・第2/第3目標・metadata・配備案を保持した。索敵非適用を充足へ置換せず、air未選択等の探索不完了と終了理由を保持し、手持ち不可能・購入必須・最適とは表示しない。

Wstockは新文書のload後click待機で要素が解決されるが非表示。クリック配送/handler開始/表示変更元は欠測、nav採取失敗1で、同原因・保存消失とは断定しない。追加診断/強制click/固定待機/期限延長0。同じ試行を反復せず、未実施Wunknownだけ同じ617source/一覧証拠の別phaseで初回実施した。

## 台帳と残件

22/141/73から7-5第1のB/C/Dだけ未確認→一部、22/144/70。AはD出典差/未取得本文/六隻外・LHA等のモデル境界/全数量根拠を残す一部。全在庫・代替・枠競合・戦闘方針の網羅、Wstock全文未到達/caller/原因、第2/第3や旧履歴の互換・実ゲーム到達は未完。他58行/旧53/定義/236を維持し、海域全体完了や公開可能とはしない。

local収集台帳191ファイル67,358,793bytes（原本/別生成metadata/束縛記録を含む）、trace6 CRC、動画7path/6uniqueSHAを保持。共有候補は許可された版/環境/ソースhash・件数/到達段階/終了コード/直接比較boolから別生成し、原本sanitizer・アップロード0。source public616/runtime617、両phase同hashと旧phase866の保持を確認。これは固定runtimeからの配信であり、HTTP応答filehashを独立実測したとはしない。

検証source基準633b079cと訂正CI記録d347aad8を分離し、旧WIP22を保持した別worktreeへ記録8文書以外の608ファイルをbyteexact移植、旧CI記録8文書だけを保持して統合した。製品/試験差分は検証時と一致し、記録変更のための試験反復はしない。関連commit/通常push・最終source smoke1回はこの局所記録時点で未開始。

PR152ドラフト・未公開/main競合、旧7-2/7-3第2G、保存異常/自然実null/DCL/通信/非表示等の原本と欠測を保持。main統合/PR151/版/SW/本番/マージ/公開/自動マージなし。


## 2026-10-30 初回CIのNode契約訂正

source `f090e9c40b8d7d0f4ee90f51fb0c5fec0b87822c`／CI41026417307 attempt1・dispatch1/再実行0は、全6jobのNode546 tests/545pass/1failで停止し、C/Wのbrowser検証・smokeは未開始。Full skipped、公開artifact0、PW case outcomeはnullである。ステップ名にservice workerを含むが、その製品障害と分類しない。正式attempt ZIP427,167bytes/90members/CRC正常を1回取得し、初回原本を保持した。

唯一の失敗は旧7-4 placement末尾検査の、panel呼出しORの隣接文字列assertだった。7-5のfirstscopeを追加すると同じ4引数呼出しでも文字列が隣接しなくなる。後段ASWの同様な隣接前提も静的に確認したが、このCIでは最初のassertで未到達。製品・保存処理の欠陥とせず、元の引数/対象scopeを保つ検査へ訂正した。実panel式8境界と実capability branchのASW3艦/night4艦、strict生成フラグ/目的/経路/型付きindex9境界×2をVMで確認し、基地quantity/FEfilterの元assertと旧6タイトル本文を維持する。単に期待文字列へ合わせたりassertを削除したりしない。

独立静的レビュー後、固定image/Node24.21.0で失敗したこの1titleだけを1回実行し成功。旧CIをbefore根拠として再利用し、他545検査・製品ソース・fixture・C/W局所6は変更/反復0。旧Wstockのload全文未到達や旧CIの未開始を、この単体成功で補完しない。236セル22/144/70は変更0。関連する試験契約訂正と本記録を独立commit・通常pushし、訂正後sourceの通常smokeを1回確認する。これは具体的な訂正後検証であり、同じHEADの成功目的の再実行ではない。


## 2026-10-30 訂正後CI0cbの確定

検証source `0cb16ded18d52e95151a783459660c5526a7e4ce`／[CI41029470607](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41029470607)、attempt1・dispatch1・再実行0・手動取消0。5smoke成功、W4 jobは公式45分上限で取消、smoke step自体もcancelledであり「smoke失敗終了後に取消」ではない。run cancelled、Full skipped・Pages未起動。公式C880 passed/0 flaky/0 failed、W1〜3小計660/0/0、W4と全Wのcase outcome集計はnull。初回成功数や物理試行数へ換算しない。

同source自身7-5第1の初回summary6件はすべてcompleted。known/stock4件は自動配備・保存・メモ編集、unknown2件は安全中止・元保持を区別し、同一reload文書のload後再探索/再表示とCUSTOM全文の元assert、30識別項目/6anchor/6行・追加0、比較元7キー・他編成/metadata保持を通過した到達証拠である。summary本文を保存実値の独立再読やW4個別物理PASSへ変換しない。旧local Wstockの45秒非表示/load全文未到達/nav1/caller・handler・原因欠測は別試行のまま保持する。

小summaryは計19原本で7-5第1初回6、別unit7-3第1初回6、別unit7-4初回6＋retry1を分離。7-4 Wstock初回は保存後strict30通過後のafter-load-searchでclick非表示45秒、load比較未到達/nav1、別retry1はcompleted。caller/handler/原因は欠測で、retryや別unit成功で補完しない。generic unknown-ASWのCは自身の完結440passed reporterと元assert制御フローからcase outcome/strict59経路通過を導出するが、Wは初回開始→次case開始のみで個別PASS/完結footerがなくcase/物理結果/strict59到達はnull。

既存D定義の全列挙操作に同じ行の直接証拠を対応できたため、7-5/0/defaultのDだけ一部→確認済み。22/144/70→23/143/70の1セル変更。自身の一連では旧22/141/73からdistinctはB/C/Dの3セル、今回依頼基準20/137/79からは7-3第1・7-4・7-5第1のB/C/D計9セルだけ。A/B/C・他58行、判定基準・59行×4項目=236・旧53区分・一部を割合換算しない基準は維持する。全在庫/枠競合/数量根拠や海域全体完了・公開可能を意味しない。

全6job自身の完全checkout HEAD・固定image実pull・Node24.21.0/PW1.55.0/C1187/W2203と、実測Node546 tests/546 pass/0 failを確認。Git期待source617ファイルの照合はCI配信ファイルhashの独立実測とは別である。正式attempt run-log ZIP11,570,409bytes/101membersを1回取得、CRC正常、SHA-256 `75a0132b6344bb6758cf0ebc311a38980a674e3237507c65056b40960f41a88b`。C2 attempt1,658,082,732bytes/W4 attempt686,716,946bytesは512MiB上限超で要求/分割0、詳細raw/trace欠測を保持する。発行10成果物中8件322,695bytesを受領し、body/trace/video受領0は生成0や失敗0ではなく欠測。15診断block（module回復counter検査1、night reload後通信例外1、click非表示13）は公式failed件数へ換算せず、試行別に保持した。2026-10-30再解析で訂正：旧「末尾sync-merge」は進捗regex漏れによる誤分類で、実末尾はreceive-controls。sync-mergeは次caseへ進むが個別PASS/比較は不明、実末尾の結果も不明である（下記追補）。閉鎖receipt SHA-256 `4b4475a22ceac5a82d8625d2b647959849a7938f3dce262d8f72613ca218a545`。原本加工・外部アップロード0、記録のみの追加CIは起動しない。

残件はD高速＋の出典優先差・JP403・六隻外/LHA等のモデル境界、全目標数量/在庫/競合、旧非表示/通信/自然実null/DCLの原因、旧目標/履歴互換の対象外範囲。PR152ドラフト・未公開/main競合を維持し、main統合/PR151/版/SW/本番/マージ/公開/自動マージは行わない。次は7-5第2ABDFJOQの独立改善であり、旧原因を解くための反復や推測修正をしない。


## 2026-10-30 実行接続復旧とW4進捗解析訂正

実行接続は軽いpwdと両worktreeのGit読取り成功で回復を確認した。記録基準HEAD2e0eccc0と検証source0cb16dedの差はdocs8件だけ。復旧時点で旧/新worktreeの7-5第2草稿12件を閉鎖SHAと全件一致で保持し、空き約11.66GiB・inode9%、既存Docker/起動container0、固定image・Node24.21.0/PW1.55.0・設定revision C1187/W2203を確認した。管理API表示だけを復旧根拠にせず、環境の削除・初期化・再作成は行っていない。

旧製品Node対照1回はCVL2のmissing≠readyでexit1、後続DE/FBBは未到達。保存済みraw/resultと元runnerのverify→result書込み順を独立に照合し、現在のruntime622/旧WT622/private22とbefore全636原本が一致した。追補は復旧後の新しいmanifest/独立読取りであり、当時未採取だった別post-run-protection・最終manifest・独立readerや切断中の観測を過去として埋めない。recovery closure SHA-256 `07984a92977db7aa829c39d358b9d5b46c697046b89cc4677eaff6a24ca8f009`。

2026-10-30 JST訂正：旧W4解析の「末尾sync-merge/ordinal220」は、globalな `(retries)` 付き進捗をregexが落とした解析上の誤分類だった。取得済み原文には235開始表示（220 initial-startラベル＋15個別retry#1-start）があり、global `(retries)` の15表示と個別retry suffixを区別する。開始表示を終了/PASS/failed数へ換算せず、期待shard一覧の未照合分から未開始件数を推定しない。

実際の最末尾は`tests/sync-receive-ui.spec.js:58`の`receive controls stay tappable at narrow and landscape widths`、18:38:19.3590345 JST開始から2.0120573秒後にcontext cancel。個別終了/PASS・UI assert到達・receive呼出し/完了は不明。当該caseには保存値全文の直接比較assert自体がないため、全文比較「未到達」とは分類しない。旧sync-merge220は次221開始へ進むが、その個別PASS/保存比較結果はnullのままである。

15診断headerと19 error section（initial15/retry1は4）を公式failed件数や物理retry成功数へ換算しない。5smoke成功・W4 smoke/jobは45分上限cancelled、C880/0/0・W1〜3小計660/0/0とW4/全W nullは不変。自身19 summary・既存D根拠、旧試行のcaller/handler欠測も保持する。新解析は既存の閉鎖収集物1107ファイル（受領原本・期待ソース・派生記録を含む）を前後SHA一致で照合し、追加API/download/試験/CIは0。512MiB超の2archive（1,658,082,732/686,716,946bytes）は未要求、body/trace/video欠測を残して回収を打ち切った。正本audit SHA-256 `a2bae6f6597495fac46d3a1b36b376dbd1f64d1719c82eb63a1c2c9e185738c6`。

復旧により7-5第2ABDFJOQの通常作業を再開する。本追補はafter15・C/W操作の新成功を追加せず、23確認済み/143一部/70未確認と全59行の状態・条件/索敵・旧53区分・定義・分母236を変更しない。未実施の通常検証と新PT草稿は別記録とし、検証済み扱いにしない。PR152ドラフト・未公開、main競合/既知残件/旧原本を保持し、main統合/PR151/版/SW/本番/マージ/公開/自動マージなし。
