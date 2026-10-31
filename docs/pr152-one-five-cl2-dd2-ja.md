> 最新CIはsource `48399416`／CI41197582954の[末尾追補](#2026-10-31-通常ciの証拠追補)を参照。局所のWIP/CI pendingは当時の履歴として保持する。

# 1-5/index1 ADFGJ：軽巡2＋駆逐2の限定対応

基準HEADは`b248bf13f53b00b89f80fa696c38070a6b071a36`。既知四隻の例拘束を解き、新C/W6代表の操作保持まで確認した。局所原本/独立証拠は閉鎖済みで、新source/通常CIはpending。進捗27/151/58・PR152ドラフト/未公開を維持する。

## 利用者から見た差分

[登録出典](https://zekamashi.net/kancolle-kouryaku/1-5/)の軽巡2＋駆逐2でも、従来は航戦を含む例への拘束で最終routeがmanualだった。同じ入力の実対照でreadyへ接続し、航戦例の水爆1/砲撃二巡をこの編成へ流用しない専用案内にした。既知BBV0のdefault水爆目標/カードは元から非適用であり、この正しい挙動は変えず、0充足には置換しない。未知艦/枠から水爆不要を断定せずmanualを保持する。明示したASW/water/OASWの数量・起源・目的・metadataと、既存info guardは維持する。

D/F/Gの先行順・既知不一致と未知の区別を保ち、適用はindex1の既知plainCL2＋DD2四隻だけ。index2/DD4を混ぜず、mapの汎用フラグを一括解除しない。三隻CL2DDは登録条件との確定不一致を検査済みで、編成見直しの対象とし装備購入へ送らない。他の二～三隻構成は未網羅である。

合成入力は神通改二159・那珂改二160・島風改229・夕立改二144。各艦の通常枠にソナー/投射機を別々に合法搭載し、手持ち瑞雲1を不要なdefault目標/配備/不足案内へ使わないことを確認した。任意ASW3組に対する有限stockの三式爆雷投射機あと1はモデルとの差で、通行必須/先制対潜3人/購入必須数ではない。在庫不足・搭載不可・一枠競合・profile不明・探索incompleteを区別し、未完了から不可能/最適を結論しない。

## 検証の区分と操作保持

Node初回13件は10成功/3検査不備失敗。VMのOpeningAsw未読込と非対象nullを[]とした期待をNode1fileだけ訂正し、失敗3＋未実施guard4の必要7件が成功した。論理17/実20subtestを分け、初回3失敗は原本のまま保持する。初回に成功したモデル3は再生成せず、新gen計3/旧0/訂正後探索0。旧3cohort9状態のwhole build/measure/route・明示目標とknown/stock HTMLのassert一致を確認した。これは性能測定ではない。

新C/Wの成立/不足/未知各1、計6例は全初回pass・retry0。workers1、45秒/結果12秒と操作/保存回数/例外検査を維持し、保存/メモ編集4・未知安全中止2、同一文書load6、保存/load各120識別比較・厳密空行8+8、他編成/海域/planner/調達metadata保持を確認した。追加browser読取り0・観測保持不一致陽性0。known/stockの元snapshot差は提案/編集/空行の意図差、unknownの提案比較nullは非該当として区別する。

記録されたname/gear配列・全goals/measure/他目標metadataは初回→loadで全6直接一致、whole searchはknown/stock差分・unknown一致。全raw入力/full返却plan/評価call数は未採取で、全plan一致とはしない。全12検索は非網羅、stockはroute ready/装備missing、unknownはroute/readiness manualを保持する。局所sourceのpublic665/runtime666結合はCIやHTTP served hashではない。

## 証拠と残件

詳細manifest・個別raw payloadはprivateに保存する。Node最終proof：`private/independent-review-20261031/node-and-model-final-proof.json`（SHA `0849eb60bdfa28ef05ef43f2a361d9f83cbb36d575c6fa2b2492306160d3d2fe`）。局所集計：`private/local-browser-collection/aggregate.json`（SHA `1906ce7c6b7c59a7ef7dd8f68fe5e4479688670abebf81006e6465494ee3b5e3`）。原本827file/58,462,462B、trace6 CRC765member/video6 EBML・再生0は今回の実数で、旧unitの数を流用しない。最終独立review：`private/local-browser-independent-review/review.json`（SHA `460bf3459ac5f132a6a7631b58bfc72e2ed5162e9babe7d61a3e222c6410f551`）も不整合0で閉鎖した。原本内容・属性/atimeと全665公開sourceの確認を含み、詳細はprivate manifestに保持する。

同じ行の追加なので236status・27/151/58は変更0。旧CIの初回load/nav/raw/archive/atime欠測は今回成功で補完しない。次はindex1軽巡1＋駆逐3の出典・DFG優先・例拘束を独立確認する（今回literalではmanual維持の範囲で、次対象は未実施）。index2/DD4、他構成/全在庫/枠/同期、旧操作不安定/原因・欠測は別残件として保持する。main統合/PR151/版/SW/本番/merge/publish/auto-mergeは行わない。

## 2026-10-31 通常CIの証拠追補

検証sourceは`48399416013bf54b9fff7ea53ceee2ba97958239`、[CI41197582954](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41197582954) attempt1。dispatch1/同HEAD起動前0・後1、5smoke job成功/W4 smokeとjob取消、Full skipped。全6jobそれぞれNode実測628/628成功・fail/cancel/skip0、Node24.21.0/PW1.55.0/C1187-W2203/imageb27e/checkoutMを確認した。記録追記HEADは未定で検証sourceと分ける。

全C901/0/0は完結footer。Wは1–3の小計675/1/0だけで、W4は45分job上限によるsmoke中断/footer欠測、全Wはnull。passed/flaky/failedを厳密な全体初回成功数/物理試行数へ換算せず、195/225進行から未実施数/最終結果を推定しない。

4cohort24caseの公式個別証拠はC12初回pass、W12最終framework不明。canonical WknownとBBVCL1 Wstockの初回2件はload後hidden-click失敗で、retry1のframework結果もnullである。保存または安全中止後の読取りとしてJSON26記録を直接照合し、canonical/CL1各7trialの保存140/load120、BBVCL2と新light各6trialの保存120/load120を確認した。新lightは6metadata completed/同一文書load6だがW3をrunner passへ昇格しない。全観測strict比較は保存520/load480、不一致/保持陽性0。初回2件は保存20/loadnull、失敗後nav未採取counter=nullを保持し、retry metadataの完了で初回未到達を埋めない。

対象26のpageerrorは明示0、navigationCollectionFailuresは24明示0/2null。独立frame/origin/drop・全入力/full返却plan/評価数は未採取。JSONには数値attempt欄がなく、専用unit prefix/state/project・公式artifact/jobと同じlogの明示retryで束縛した。これはsource-produced比較flagの直接照合で、raw保存値本文の別再比較や未観測範囲の保存安全性の証明ではない。

他のW2は実Storage読取りに繋がるgetterの提案装備star欄12秒poll不一致からretry1pass。実key/origin/document/raw値・成功write・default初期化分岐実行は未観測で、memory-only/保存後消失と断定しない。専用save/load比較はない。関連2件を含むW4は観測18caseの初回error群＋明示retry失敗2を保持し、5-3speedexemptは指定save/load比較後のaccess-control pageerror配列assert、他17はload後非表示click45秒/load全文未到達と分けた。原因/callerや旧失敗との同一性は未確定で、失敗回避の条件変更/追加診断へ広げない。

原本はprivate。取得9ZIP/2,890,071B/88memberは公式size/digestとSHA/CRC、log ZIP11,701,766B/101memberは取得receipt・SHA/CRCを確認した（いずれも各1要求）。2上限超archiveの内部は未取得のまま。CLIartifact/Range/署名URL保存0。poll11はlocal controllerのARG_MAXでprocess開始前に保存欠測となった。製品/exec transport切断とは分け、v2poll12の別の正常記録で欠測を補完しない。今回原本514file/154dirは2snapshot間の内容/全観測属性/一覧が一致したが、最初のsnapshot以前は未観測で、旧Pのatime1差を解消したとはしない。主原本は封鎖後変更せず、外部独立joinで最終閉鎖した。

主集計：`private/ci-execution-41197582954/canonical-ci-collection.json`（SHA `40af3205b145d95d1661fdb47c20f6b09e5226f2a7cebae5aa7e98b4bc4b6cc2`）。最終独立join：`private/ci-independent-review-preparation/final-primary-manifest-join-review.json`（SHA `56d372a013758ca40c403d7baee851c65c4680bba453fc2b5bb561b9a2a3ede2`）。metadata/分類/詳細manifestと原本は、この参照連鎖からprivateに保持し公開記録へ列挙しない。

27/151/58・236status・全旧historyは変更0。次CL1DD3は出典/DFGのsource-only照合までで、実装/操作未実施、水爆defaultは既存の正しい非適用ロジックを変更不要とする静的計画だけ。記録only通常push[skip ci]は別途実施し追加試験/CIは0。PR152ドラフト/未公開と保護対象を維持する。
