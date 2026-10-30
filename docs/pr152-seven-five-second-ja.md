# 7-5第2ABDFJOQ：分岐と任意装備の接続

2026-10-30 JSTの局所・CI確定記録。検証sourceは`972b63a4a7761903c1f8d88fa04c61b136c89984`。PR152ドラフト・未公開を維持する。

軽空母2＋軽巡1＋駆逐3のnative低速艦隊を旧「軽空母1以下」だけで不成立にせず、B/D/Jの出典一致条件で判定する。駆逐2＋海防1の代替も扱い、艦種・隻数の問題は編成見直しへ案内する。対潜・対地・PTの具体部品と合法な搭載先を表示し、任意比較・利用者指定・経路必須を混ぜない。

## 条件と反例

対象は7-5/index1/default、第1K突破後にQが開放され、F→J・O→Qを選ぶ条件付きのABDFJOQ。選択だけで実際の開放状態を推定せず、Mギミックを第2の必須条件へ加えない。記事とKCのB/D/J優先順を別々に評価し、Jの低速指定組合せ・高速＋救済・先行Nを区別する。正空を含む艦隊はB/Dが通ってもJ→Oとは限らない。Qの数値索敵は非適用/score:nullで、Mや第3の閾値・基地数量を流用しない。

独立31案はraw出典一致17成立/9不一致/5未判定、有限モデルは六隻外1案を未判定へ分け16/9/6。六隻を実ゲーム最低数へ読み替えない。別actual6・未知艦の別役割充足・明示requirements/旗艦/両速力入力を確認し、既知の不成立を未知で消さない。D高速＋の優先差、日本語wiki本文403、CD/LHA等は未確認を残す。

旧製品対照は固定Node24/imageで1回だけ。最初のCVL2に対するnew-ready期待がmissing≠readyで失敗し、旧制限まで到達した。後続DE/FBBはその試行では未到達で、新しい成功で補完しない。実画面の修正前誤表示や実データ喪失を観測した意味ではない。復旧後のmanifest追補は現在の再照合と停止前採取を分離した。

## 自動配備・不足・既存入力

PT既定1組は既存の汎用比較で、第2の十分性・通行必須・購入数量ではない。元cap-pt行がない場合だけboolean生成フラグを補い、既存行はlast-wins、originの有無/型、正数数量、label/choice/metadata、明示strategyを保持する。省略された表示名/装備種/出典だけ既定で補完する。単品PT目安と組目標を足さない。明示夜戦方針は利用者指定として表示し、autoで新しい夜戦CI目標を追加しない。

raw preset descriptorのorigin未指定と、route草稿の「later phase／unimplemented」注記は当時の凍結履歴である。raw descriptor自体は今もそのままで、FEのmerged要件・PT目的区分・候補案内は今回の別段階で実装済み。凍結31期待/旧コメントを現在未実装という証拠へ転用しない。

不足例は副砲/見張員を各1所持・機銃0の有限入力で、選択された3部品例の機銃あと1、ソナー/投射機各1、陸戦隊/内火艇各1の部品不足と搭載先を確認した。候補は在庫や他目標との同時配備の証明ではない。PT3部品は同艦の合法な異なる通常3枠への完全割当を要し、2枠でのpairwise可を成立にしない。水上機は実許可・正容量が必要、未知は未判定、搭載不可/枠競合は購入不足と分ける。全0在庫で選ばれる汎用2部品例は別Node境界とし、第2固有の十分性へ昇格しない。

実画面の代表は元actual6を変更せず、同艦種の山風改二丁667を使う別合成variant。有限12品で対潜1・PT1・対地1の比較が充足しても、制空未選択と探索incomplete/終了理由は残り、最適・手持ち不可能・購入必須・勝利保証と表示しない。元編成について確定したのは選択tank166/type24＋amph167/type46例の完成搭載先が無いことだけで、他対地recipeや全探索を不可能とはしない。5品/4枠競合は全5品が合法な別の単艦合成モデルで確認し、元編成の事実と混ぜない。

## 固定環境と局所結果

固定Playwright1.55.0 image digest b27e719e…、Node24.21.0、C1187/W2203、workers1/retries0/repeat1、45秒/12秒・10000候補/beam5/depth24・既存待機/取消/例外検査を維持。Node境界29/29、別audit1、別producer2＋consumer2が成功し、変更しない成功の反復0。通常一覧はC/W各883、新3と6selector各1。準備guardの2停止はbrowser0のまま保存・訂正し、物理試行6へ数えない。版GET2件の固定JSONはテスト入力で、実ネットワーク/製品版取得成功の検証ではない。

|状態|Chromium初回|WebKit初回|
|---|---|---|
|成立variant|配備・保存・メモ編集・同一reload文書load全文/strict30完了|保存/編集後strict30通過。load再探索click非表示45秒で全文未到達|
|有限在庫不足|具体部品/搭載先・意図した配備の保存/編集/load全文完了|保存/編集後strict30通過。load再探索click非表示45秒で全文未到達|
|情報不足|安全中止・元全文/装備保持・編集なし・同一文書load後再表示完了|同じ安全中止/保持を完了|

6初回は4passed/2timedOut、各1回・反復0。保存または安全中止後の読取り6件とload全文4件を区別し、適用保存・メモ編集を通ったcaseはknown/stockの4件、unknown2件は安全中止/編集なし。これは実Storage/save呼出し回数の実測ではなく、その回数は未計測。到達分は30識別項目/6anchor/6行・追加0、比較元7キー・他編成/他map・第1/第3目標・metadataを保持。known/stockは提案gearと完全一致する意図した変更で、元gear完全一致とはしない。unknownは元gear/全文を保持した。

W2件はload後clickで要素が解決されても非表示。配送・handler開始・表示変更元・原因は不明、各nav採取失敗1。load全文/同一文書の最終比較・最終例外assertは未到達で、採取pageerror0を最終検査成功へ換算しない。別試行成功で埋めず、原本を保持し追加診断/強制click/固定待機/期限延長0。到達比較の保存不一致陽性0は一般的な保存安全性の証明ではない。

局所はbase80b156f5上の未コミット差分を固定し、公開source629＋private local config1のruntime630で実施。source manifest SHA-256 `d734071f332c0e049a6c81d88d230962d6fca9166c96a63fc9be90012df20788`。最終Gitは新しい専用記録を加えるため同じ件数とはせず、確定HEADで別確認する。原本/実値はprivate、sharedは許可metadataだけから別生成し、sanitizer/原本加工/外部アップロード0。

## 進捗と残件

局所時点では23/143/70からこの行のB/C/Dだけ未確認→一部、23/146/67とし、W成立/不足load全文未到達のためDを確認済みにしなかった。後述の同定済みCI直接証拠を追加し、現在はDだけ一部→確認済み、24/145/67。A/B/C・他58行・旧53区分・全59scouting・判定基準236は不変。

D15出典差/JP403/CD・LHA/六隻外、全戦闘目標数量・在庫/代替/枠競合、W2のcaller/原因、実ゲージ/到達/勝利・旧目標履歴互換は残る。旧CI410294の末尾分類訂正(receive-controls結果不明)・全W nullと、旧非表示/通信/自然実null/DCL等は別記録のまま維持する。

<!-- seven-five-second-ci-start -->
## 2026-10-30 最終HEAD smoke確定

検証source `972b63a4a7761903c1f8d88fa04c61b136c89984`／[CI41060471226](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41060471226)、attempt1・dispatch1/再実行0。run failureは5smoke成功・W4失敗、Full skipped・取消0。公式C882 passed/1 flaky/0 failed、W874/8/1はcase outcomeで、厳密な初回成功数・物理試行数へ換算しない。通常CIはC workers2/W workers1・retries1で、局所workers1/retries0とは別条件。全6jobの実Node footerは各566/566/0、checkout/source・固定image実pull・Node24.21.0/PW1.55.0/C1187/W2203が一致した。Git期待source630件は局所source629＋private設定1のruntime630とは集合が異なる。期待Gitの照合であり、CIの実HTTP配信filehashを独立実測した証拠ではない。

自身6ケースのcase outcomeは5passed/1flaky/0failedで、初回件数とは別分母である。同定済みsummary原本は初回6件（保存/安全中止後読取6・load全文5）＋別retry1件（読取1・load全文1）の7件で、保存書込み回数ではない。未知の初回2件は安全中止/編集なし、known/stock初回4件とknown retry1の適用編集は別試行として扱う。C3・W不足/未知は初回5件が全比較完了。W成立初回は保存/編集後strict30・他保持を通過し、load後のsearch buttonが解決済みでも非表示で試験総45秒期限時に`locator.click`の非表示待機で停止（helper82前半、試験caller125:44）。結果表示12秒assertは未到達。click配送・handler/探索開始・表示変更元/原因は記録がなく、nav採取失敗1。別retry1は同一source/inputで保存または安全中止から同一reload文書load全文・strict30・他編成/metadata・最終例外検査まで完了した。局所C3＋W未知、CI W不足初回＋W成立retry1の直接証拠で6代表の全列挙操作を満たすため、既存D基準のままDだけ確認済みへ更新する。初回限定/flaky除外を追加せず、旧localW2件と今回初回の欠測は別記録のまま残す。全体安定性・旧非表示原因の解決ではない。

W4唯一の最終failedは6-4 BDCFN ready。初回/retryともsearch button非表示のclick待機中の試験総45秒期限（caller164:44）で、結果表示assertは未到達。C2 upstream初回は`boundingBox:null`後、診断引数`added.height`のTypeErrorで最終height検査未到達（storage nullではない）。W1 drop-hunt初回はUI検査後の最終errors[]で版取得access-control、初回trace/発生時刻/呼出し元は欠測。成功した別retryをその失敗初回の欠測へ流用せず、同じ停止型でも同原因やG2との因果は未確認とする。追加診断・試験・CI反復は行わない。

12 artifact中9件8,237,806Bと同attempt正式ログZIPを保持。tiny summary26件はG2/G1/7-4/7-3第1のmetadata原本で、原本trace取得とは呼ばない。512MiB超のC2 attempt・W4 attempt・W4 smokeの3件は未要求でbody/trace欠測、W1はretry traceだけ受領。許可metadataだけを記録し、保存値本文/認証情報/原本traceはcommitしない。collector最終closure SHA-256は`454d55146cc55e119b7df2c25d89c86270988635f4fc13b828b6d508dd0dfdaf`。独立最終readerの照合を経てCI1136件＋artifact129件の計1265ファイルを再hash一致で閉鎖した。9受領ZIPのbytesと、展開物/receiptを含むartifact129件のbytesは別分母である。検証sourceと後続の記録commit HEADは区別し、記録だけの新CIは起動しない。
<!-- seven-five-second-ci-end -->

次は第3ABDFJOPTの選択表示scopeの独立確認、その後の候補は3-1 source-only。PR152ドラフト・未公開/main競合を維持し、main統合/PR151/版/SW/本番/マージ/公開/自動マージは行わない。
