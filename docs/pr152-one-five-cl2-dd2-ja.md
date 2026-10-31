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
