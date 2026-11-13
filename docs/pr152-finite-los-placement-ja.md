# 3-5上／5-5中央下：有限索敵配備と保存/load

2026-11-13 JST。基準は記録HEAD `a4846ed8c9ae37384e5e8f402dc8c34930da9f9a`、前バッチ検証source `d05a0751`とは別。専用worktreeで既存原本と4-5隔離を保持した。具体的な製品欠陥は再現せず、**試験・登録・記録のみ**を追加する。製品89 JS、保存形式、版/SW、期限・待機・探索上限・取消は不変。

## 対象と合格条件

対象は`3-5/1/default` BDHKと`5-5/1/default` BFDHNOS。A/B/C/Dは既存59行×4＝236セルの定義を維持する。Bは同じ行の有限在庫からの実配備、Dは同じ行の保存・編集・同一reload文書load/complete後表示と他編成metadata保持が全条件。今回の特定装備と保存/loadだけではB/Dは一部、新編集なしのDを確認済みへ上げない。

登録出典は[3-5](https://zekamashi.net/kancolle-kouryaku/3-5/)／[5-5](https://zekamashi.net/kancolle-kouryaku/5-5/)。既存の[出典・適用範囲と案内検証](pr152-upper-central-scouting-guidance-ja.md)と登録コードを照合した。3-5は正規空母3・重巡1・雷巡1・駆逐1（赤城/加賀/蒼龍/妙高/北上/雪風）、6隻・戦艦＋空母3以下・空母2以上・揚陸0。5-5は戦艦2・航巡1・軽巡1・駆逐2（長門/陸奥/鈴谷/阿武隈/雪風/時雨）、6隻・戦艦2以下・空母/潜水0・駆逐2以上を保つ。

これらはdocumented-example契約の構造条件で、全優先分岐graphの検証ではない。登録索敵は33式：3-5係数4/安全側40、5-5係数2/安全側66。今回閾値を新規確定・統一せず、safe-onlyで下限未満を確定逸れへ変換しない。選択はmap/index1/presetで結び付ける。入力fleetの`routeGoal:'default'`は保持するが、graph目標を持たないbuilt planのrouteGoalは空文字が正しい。BKPSや速力免除の条件を中央下へ輸入しない。

## 独立した有限入力と実結果

装備は22号対水上電探（master28・type12・索敵5・★0）を合計0/1/2個、61cm四連装(酸素)魚雷（master15）を2個。登録数には現在配備を含む。実DBの艦種/個艦搭載許可・通常枠・除外を独立に読み、同一艦枠の二重使用、未登録装備、集計在庫超過がないことを返却案の生配備から数える。搭載0の通常枠でも電探は合法で、航空機の機数条件とは別。魚雷2個の同艦セットと元の担当艦を保持する。

| 入力 | HQ・観測索敵 | 電探 登録/初期/観測 | 実返却個数 | 数値の判定 |
| --- | --- | --- | --- | --- |
| 3-5在庫2 | HQ/6艦索敵なし | 2/0/0 | 2 | sync/manual |
| 5-5在庫2 | HQ120・各艦gameLos100 | 2/1/1 | 2 | 交換後bonus/manual |
| 3-5在庫1 | HQ/6艦索敵なし | 1/0/0 | 1 | sync/manual、任意2未達 |
| 3-5在庫0 | HQ/6艦索敵なし | 0/0/0 | 0 | sync/manual、任意2未達 |
| 5-5最終装備を観測済み | HQ120・有効索敵400×6（時雨raw410） | 2/1/2 | 2 | 84、登録数値条件ready |
| 5-5初期数値成立を保護 | HQ120・有効索敵400×6（時雨raw405） | 2/1/1 | 1 | 78のreadyを保持、任意2未達 |

通常枠は上22／中央下21。fill-only候補集合は順に211/19/21/1/19/19状態で、未配備も含む。これは小集合の物理的存在対照で、製品の全候補網羅・fixed/lock指定ではない。必要数を製品探索結果から逆算しない。

既知の33式は、観測装備を差し引いた艦索敵平方根の和＋係数×電探索敵5×0.6×個数−ceil(HQ×0.4)＋2×(6−隻数)。有効400×6では2個84、1個78を独立に計算した。raw100の初期1個は50＋√95＋6−48＝17.7467943448という参考値だが、2個へ交換後は観測装備との一致が失われ、ボーナス未確認を残す。参考計算23.74679を確定充足へ変換しない。

既知78を保つ例では物理的な2個案18通りが存在しても、数値根拠を未判定へ壊す交換を採らず1個を維持した。任意の個数目安、数値索敵条件、経路必須・全目標・戦闘勝利は別。0/1個の任意未達や候補未発見を、確定した通行不足・購入必須・手持ちで不可能へ変換しない。全6探索はincomplete/beam-limit・exhaustive:falseで、既知数値ready例も全目標完了ではない。

## 固定枠・装備個体IDを別項目にする

枠ロックは現行solver入力/slot/search DTOに存在せず、固定枠保護は未確認。取込みのgameLockedは艦のapi_lockedで、装備枠ロックではない。未対応フラグを合成して通過を保護証拠にしない。

実装備IDは取込み詳細キー`harbordesk-kancolle-equipment-detail-v1`のgameEquipId/masterEquipId/star/alvに存在する。合成の異なる個体IDを持つ4行を用い、Nodeは書込み0・詳細キー原文一致、UIは配備前/保存後/load後の詳細キー原文一致を確認した。これは対応済み保存範囲のID保持である。solverの在庫と返却装備はname/star/stackKeyによる集計で個体IDを割り当てないため、個体単位の選択・固定・重複防止は未確認。名称別個数と合法枠の重複防止とは別の限界で、アプリ全体に個体IDがないとはしない。

## 局所操作と証拠

固定digest image/Node24.21.0/PW1.55.0/Chromium1187/WebKit2203を既存cacheからreadonly bindし、pull/依存導入/大容量runtimeコピー0、single container lockで重複起動0、各終了後の稼働0を確認した。Nodeは初回1コマンド・2TAP検査/6contextが成功、再試行0。期待値の実行後訂正0。実行前に新規UIだけの生文字列/例外配列matcherを一致bool/件数へ補正し、v1原文を保持した（試験失敗ではない）。

Chromium上ナビとWebKit中央下inlineは各初回成功・workers1/retries0。各検索2/明示保存1/reload1/新編集0/選択目標切替0、45秒/結果12秒・上限10000/depth24を維持した。同試行のinitial/after-save/after-load-saved/after-loadを直接比較し、新探索前の保存配備・保存理由・全文、origin/新文書/同一文書load、他編成/metadata、対象外キーと初期化済み他plannerを照合した。fleet-calculatorの自案は意図変化、他plannerはparsed投影の別範囲で、全キーraw不変とはしない。

上ナビの再探索前gear本文DOMは未確認(false)だがraw保存配備は照合。中央下はDOMも確認。未実施null/非適用falseを成功へ変えない。双方は数値manualと未完了理由を保存/load後も保持し、詳細IDキーを含む12キーの対象別比較を行った。pageerrors・checkpointのdrop/missingは各0（掘り周回の旧欠測とは別）。trace/video/screenshots0、保存値本文や原本をsharedへ出さず、型付き許可metadataのみ別生成する。

42原本・4実行記録(Node/preflight/C/W)を独立再読してPASS・gap0。合成入力、限定装備/通常枠、各1回の観測であり、一般探索最適性・全海域/全装備・実ユーザーデータ安全性を証明しない。旧原本は変更しない。

## 登録・セル・保留

通常一覧はC/W各945/82ファイル、新2タイトル×C/W4件の選択を実確認。WebKit339/164/258/184の和集合/重複0を確認した。これは登録で実操作成功ではない。通常Nodeは既存819＋新2＝821の設定で、局所に819を繰り返さない。最終source6b46af26を通常pushし、同SHAのsmoke1回を確認した（結果と停止記録は下節）。記録だけの追補で追加CIを起動しない。

28/184/24→28確認済み/188一部/20未確認。`3-5/1/default`と`5-5/1/default`のB/D計4セルだけ未確認→一部。Bは今回装備・有限入力、Dは保存/load部分に限り、新編集や全目標/全失敗区分を完了へ広げない。A/C、確認済み28、236セル/59行/旧53/基準は不変。

旧CI43329894547（検証d05a0751）はC943/0/0・W932/10/1と5smoke成功/W4失敗を保持。5-5 BKPS初回/retryのload後click非表示・全文未到達、6-5初回の停止段階欠測を今回の成功から補完しない。Night getter/旧load6aggregate、repair fault aggregate、1-5識別、掘り、4-5隔離12件/別草稿/原本は別保留で、generic Storage/boot/reload共有の原因は確定も除外もしない。新たな保存不一致は今回観測していないが、旧異常解決とはしない。

最小残件は同対象の編集操作・全適用目標/全在庫/特殊枠の未確認範囲と、solver個体ID/固定枠を扱わない契約の限界である。本バッチで別海域へ実装を広げない。証拠領域は`/workspace/harbordesk-handoff-_gnvlnto/continuation-finite-los-batch-20261113`。

PR152はドラフト・未公開、main競合を維持。main統合・PR151・版・SW・本番・マージ・公開・デプロイ・ドラフト解除・自動マージを行わない。

## 同source通常CIと実行領域の停止（2026-11-13 JST）

検証source `6b46af267f3a230a1b12a9c9f5ca3c645884cd76`／[CI43359339548](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/43359339548) attempt1。完全SHA・workflow・対象branchの実行一覧を2回確認して未受付0件を照合し、通常smokeを1回だけ要求、12:29:47 JST（03:29:47Z）に受理された。再要求/再実行0。公式job結果はsmoke3成功（C1/W1/W3）・2失敗（W2/W4）・C2取消、実在するFull jobはskipped。C2はsmoke本体が13:14:51 JST（04:14:51Z）にcancelled、後段の資料保持が続き、ジョブも取消終了した。取消原因を期限設定だけで断定しない。

### 対象4例と全体結果を分ける

新2タイトル×C/Wの4例はretry0の物理statusがすべてpassed。同じ試行の4phase×4例＝16phase、53boolean/null×16＝848値と20count×16＝320値がsourceの期待と一致した。新探索前の保存配備・理由・全文、同一reload文書、他編成/metadata、取込み詳細IDキーの比較は適合、対象のcritical false/missing0。期待値falseの28値と、非適用・未実施を表すnull120値をそのまま保持し、trueへ変えない。新編集0、solver個体割当/固定枠は未確認のまま。

Cの対象2例はC2にあり、物理passed・保持比較通過でも、C2の論理finalOutcomeは全472例nullのため論理最終成功とは扱わない。全Chromiumのpassed/flaky/failedは未確定。C1小計はlogical expected473、C2は446物理pass終了・2開始/終了なし・24未開始。全Cの919物理passを945例の論理完結へ換算しない。Wの対象2例は論理expectedで完了した。

全WebKitは小型compact結果のlogical passed/flaky/failedが**928/14/3**、945例完結。初回の物理statusは928passed/14timedOut/3failed、retryは14passed/3timedOutで、論理集計と別の分母。公式ログから直接確認できたのはW2単体158/4/2だけで、全Wの数字は小型JSON集計である。全6ジョブの通常Node検査工程successを確認したが、数値footerとHDLOFINITE原文は今回CI資料では未観測、821は設定数のまま。局所2TAP成功をCIの数値footerへ流用しない。

### 失敗・新しい保留

最終3失敗はW2の2-5 CEIO scouting guaranteed／unknownと、W4の3-1 CFG stock。各初回/retry計6試行はtimedOutだが、取得した同試行資料の停止操作・段階・保存比較の到達は欠測。旧load後非表示と同原因/同段階とは推定しない。

別のflaky初回3failedは、carrier Night、H回避stock、release stale-recoveryであり、最終3失敗と別の試行である。carrier NightのW4初回（job131668885457、test `60c90c2ba9dde6a78d19-ddede08445c7737f9800`、retry0）は `tests/night-policy-reload.spec.js:90:27` の `expect(afterLoad.values).toEqual(saved.values)` が失敗位置。**load後保存配列一致の懸念を新たに保留**する。配列実値・不一致キー・原因は未採取、保存消失は未確定。retry1passedで初回を補完せず、後続policy/例外検査を初回到達済みにしない。旧Night getter・submarineのload6aggregate144・repair fault68とは別の証拠として保持し、Nightの追加実行・推測修正を行わない。

H回避stock初回は末尾の例外配列ゼロ検査位置で、具体的例外と保存比較operandは未取得。release初回はhash観測poll位置で、保存操作の失敗とは特定できない。source順の到達根拠を保存値原文の観測へ変換せず、retry成功と分離する。今回の有限索敵4例の成功は、これらや旧CI43329894547のBKPS/6-5欠測を解決しない。

### 原本の可用性と限定回収

局所検証・42原本の独立PASS・source通常push後にexec-server切断/timeoutが発生し、同じenvironment IDでも元 `/workspace/harbordesk-handoff-_gnvlnto` は不可視となった。提供された起動待機がreadyになった後の実読取りでもH/P/Wはfalse、別receipt領域のみ可視。削除・初期化・環境再作成や元領域の推測復元は行っていない。原本の消失は未確定で、元作業ツリー/容量/原本の現在状態は現物未確認。停止前の確認を現在へ流用しない。

元 `continuation-finite-los-batch-20261113/private/` の42原本・局所plan/manifest/独立照合・レビュー/CI準備/closure v1は最後に確認した所在であり、現在取得済みではない。元PのCI binding/init・最終manifest/最終互換照合は未完。4-5隔離12件/別草稿も停止前一致・現在不可視を分ける。

実装・アプリ実行を停止し、既存GitHub runだけを別の `/workspace/scratch/harbordesk-ci-43359339548-receipts-20261113` へ回収した。小型12ZIP計504026B・102membersの公式size/SHA-256/CRC、安全なpathとsource/run/job/shard/retryの対応を独立再読した。転送再試行0・大容量/対象外archive要求0、署名URLは永続保存せず、private原本とshared型付きmetadataを分離。新しいNode/ブラウザー/CI実行やsanitizerは行っていない。

**CI限定receipt整合性**の独立確認であり、全CI成功、一般保存安全性、元42原本の再取得、元P全体の最終封鎖を意味しない。限定manifest SHA `e9ba173c5d478fa05e09ccc7c1db69e42aef0a9756e2417bb9a05e32f36a86cd`、限定独立review SHA `6c32126f0227f179ba39eefe08cc58bfefd4767f1b047b102636f357501a9978`。一部公式footer/個別例外・保存配列operand・全C論理結果等の欠測を保持する。

GitHubの進捗JSON本文は連携の空応答/HTTP400で再取得できず、推測で再作成・上書きしない。source時点のJSON blob `b26308fce9cdaa5436d3d8c2aa6125ba16b6d847` はそのまま保持し、同JSON内のCI pendingはsource時点の計画記録である。今回CIの確定結果は本節・進捗Markdown先頭・PR現状欄へ記録する。セル表と集計の28確認済み/188一部/20未確認は変更0。

再開の最小作業は元workspaceへの安全なアクセス回復後に、HEAD/差分、42原本/局所manifest、隔離12件を内容照合すること。Night新懸念は同初回の配列内訳が得られるまで対象を保留し、元の欠測を新試行で補わない。別海域への拡張・追加試験は行わず、PR152ドラフト・未公開、main競合、PR151/版/SW/本番未変更、マージ/公開/自動マージなしを維持する。

