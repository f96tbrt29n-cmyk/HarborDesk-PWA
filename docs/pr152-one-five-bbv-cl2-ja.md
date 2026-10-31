# 1-5/index1 ADFGJ：航戦1＋軽巡2＋駆逐1の限定対応

> 基準HEAD `a3a6c6a749fe02a26a535613d9665c6a1e762fb9`。新sourceは未commit。出典/製品・Node/modelと新C/W6代表の全初回成功までを確認した。原本回収/独立closureまで閉鎖し、新sourceHEAD/通常CIだけ未確定である。27/151/58・PR152ドラフト/未公開を維持する。

## 利用者から見た変更範囲

[登録出典](https://zekamashi.net/kancolle-kouryaku/1-5/)の航戦1＋軽巡2＋駆逐1は、従来の航戦1＋駆逐3/航戦1＋軽巡1＋駆逐2の有限例だけではmanualとなり、水爆カードも数量未判定だった。同一入力の実ソース対照でmanual/水爆数量nullからready/既存任意水爆1へ変わることを確認した。既知の四隻例を一つ追加するだけで、未確認のCL2DD2や2–3隻へ一般化しない。

製品差分はFE/SEの2ファイル・一意4anchorで、直前の承認ソースへ完全復元できる。存在するinfoを既定条件へ照合するguardと利用者の明示条件/目標、探索/保存/待機/取消/上限/版/SWは維持する。対潜3組・航戦水爆1は既存任意モデルで、通行必須数・先制対潜人数・購入必須・火力/勝利へ読み替えない。未知型・未知枠は未判定を保持する。

## 出典境界・合法搭載と案内

取得済み出典を使う独立21編成期待と、Nodeの23literal境界を別集合として対象域/D/F/G優先を照合した。全21件それぞれを一対一でruntime実行したとは主張しない。軽巡は既知の通常CLを算入し、練巡/雷巡/航巡/潜水母艦を名前だけで同じ型にしない。提案時点の静的対照と、後のNodeで実行した同一入力対照を区別する。

合成fixtureは扶桑改二411・神通改二159・那珂改二160・夕立改二144。両CLの通常枠[1,1,1]はソナーtype14/爆雷投射機type15を別枠へ合法搭載でき、水爆type11は不可。独立した7装備の通常枠配備で任意ASW3/水爆1の成立例を確認した。1枠への2部品競合、未知profile、航戦の未知航空容量を分け、未知容量は水爆数量非表示のmanualとする。

有限stockの三式爆雷投射機あと1個/瑞雲あと1個は既存任意モデルとの差で、購入必須数ではない。小型ソナー/投射機はCL/DDの別合法通常枠へ、航戦の大型ソナー＋投射機は既存の別カタログ案として扱う。瑞雲候補は航戦の既知正容量枠だけにする。全在庫・全枠組合せを確認済みにはしない。

## 確定したNode/modelと未実施範囲

新actual13＋既存歴史guard4の計17検査が成功した。最初のcontainer actor1001は権限exit126でNode開始前に停止し生成0。実host actor1000へ訂正した次phaseでactual13は成功したが、controllerがspec出力をTAPとして読んだためnull判定で止まった。原本を保持してread receiptを訂正し、13を繰り返さず未実施guard4だけ別phaseで実施した。製品試験失敗や成功目的の反復へ数えない。

新生成器はknown/stock/unknown各1回、計3回だけ。knownは802候補/targets-met/route ready・総合ready、stockは683/incomplete/route ready・総合missing、unknownは504/incomplete/route manual・総合missing。全exhaustive=falseであり、不可能/最適/購入必須を結論しない。Nodeモデル値をブラウザー値へ移さない。元canonicalと前CL1DD2のknown/stock/unknownは全build/measure/route/明示目標が直接一致し、known/stockのHTMLも一致した。旧生成器呼出し0である。この比較はsourceに束縛された実assert成功の証拠で、旧新object全文の組を別保存して独立に再比較した証拠ではなく、unknown HTML全体一致も主張しない。未登録装備の割当1件は未解決であり、合法/readyへ扱わない。

統合proofは`aab3ed5da92db38425ca2804b1892be683b99e308b78e9c12b84fd05baf002b5`。metadata producer2/consumer2はunit/schema正規化の完全一致を根拠に既存の純検査を再利用し、新しい艦型やブラウザーの成功とはしない。fixture昇格はpreparationStateだけで入力/操作の他bytesは一致した。public659/runtime660のfreeze manifestは`63005326f462637c91721c87dc1ae4d806e8b8117fb13965efd05234eae2d7d2`。preflight実一覧はC/W各898、新spec各3、各単独対象1選択でbrowser/試験0だった。局所source結合はCIやHTTP served hashではない。Node/model独立review `a6f4a25f8921daf8587b2b0b77922376a35af529b78712d48f3f597cf4a67330`も閉鎖した。

新C/W成立/不足/未知各代表の計6件は全初回成功・retry0。workers1・45秒/結果12秒と既存操作/アサーションを維持した。保存/メモ編集4件と未知安全中止2件、同一文書loadの既存検査を通過し、各20の厳密識別項目を保存側120/load側120検査した。known/stockの追加空行は各2、unknownは追加0で、保持不一致陽性0・hostの追加ブラウザー読取り0、source/schema/producer結合は全件一致した。

原本からの初回→load後候補数はC/W共通でknown802→0、stock683→456、unknown504→504。knownの終了理由categoryはbeam-limit→bounded-search、stock/unknownは両方beam-limitで、全12探索exhaustive=false。返却艦名/gear配列・全goals・whole measure・他目標metadataは全6直接一致、whole searchはknown/stockで差分、unknownで一致した。全raw input・返却plan全体・評価call数は欠測のまま。

known/stockの保存時の元全文/元gear/元identity配列falseは提案装備/メモと4→6行の意図差で、提案保存trueと厳密空行2を確認した。unknownは元全文true・4+0で提案比較null、安全中止を保持。load全文は全6一致した。原本timeOriginの12snapshotではnav drop/failure/visibleDrop/pageerrorが0で、summaryの独立frame ID/URL/drop専用欄はない。解析範囲の専用frame ID欄がないことを、未解析trace内のframe情報不在へ広げない。

collectionは原本812件/54,636,607Bをbytes/hash・許容atimeを除く属性/file-setまで独立照合して不変。runtime660/public659/prep6が一致し、trace6ZIPのCRC実669memberとvideo6件のEBML headerを確認した（再生/replay0、旧730memberを流用しない）。aggregate `eaf088bccbc6e72c488f165db5bf441de32b0067a616653468c51497896bc914`、manifest `f70e50fbb434b69c9bd6c29cd295c418c9edb7a1cbdeaa13ea2c87c9358d4367`、独立review `f5c7003f2b7ecaf61e2e69f1c8336eb044f7e2b0df3dccab118fea9cf62895c6`で閉鎖した。実値/原本はprivate、共有は許可metadataだけとし原本sanitizerは実行しない。新sourceHEAD/通常CIはpendingで、局所first pass6やraw drop/traceを旧試行/将来CIへ流用しない。

## 旧履歴と残件

旧CI41175351013/source6c08381fはC895/0/0完全、W1–3小計672/0/0、W4 smoke取消・全W最終結果nullのまま。旧新/旧canonical各W3の保持metadata完了はframework passedと分け、未取得2大容量archiveの内部inventory/保存値本文/trace/videoは今回の資料で補完しない。

同じ1-5行の代替追加なので全236status・27/151/58・他58行・旧53と旧local/CI履歴は変更0。今回の有限source/Node/model/6代表の操作保持を、海域全体完成へ広げない。次候補CL2DD2は今回未実施で、2–3隻・全目標/在庫/機種/改修/枠競合/同期/実ゲームと分けて独立確認する。新たな保存不一致・破壊疑い等の停止条件、PR152ドラフト/未公開・main競合・既知残件・保護対象を維持する。
