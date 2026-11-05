> 2-5 CEIO Eの通常CI追補（2026-11-05 JST、主P/独立Oはqualified封鎖・照合済み）：source `03c4759b`／CI42024915243 attempt1は5smoke成功・W4公式45分上限取消・Full skip。passed/flaky/failedは全C910/0/0、W1–3小計683/0/0、W4 footer無し・全W未確定。全6ownNode677pass/0failとNode24.21.0/PW1.55/C1187/W2203/image/checkout一致。対象C3は正式ownC2全455passと通常smoke進行/initial namespaceの結合で初回成功、typed-only metadataの保存/load各90項目・stage完了/pageerror0を確認。rawE/perOriginal未取得で再生成/原値再比較はなく、対象W3はmetadata/開始表示/最終結果/比較が欠測（未開始とはしない）。局所6成功と旧欠測を分離し28/153/55変更0。以下のCI待ち文は局所記録時点の履歴。

# 2-5 CEIO：Eの軽巡1＋駆逐4先行条件

2026-11-05 JST。基準 `f37b7e20`、前検証source `32a87a09`。検証source `03c4759ba4ecf594b1f96daf608ae9a36968cc11` は通常push済み、記録HEADは未確定。CI42024915243 attempt1はdispatch済みで最終結果は未確定。局所6例を主P/独立Oの封鎖記録と照合した時点の記録。

元コードは、出典にある軽巡1＋駆逐4の先行Iにも、元の軽空母/DD3例の高速条件・艦種例を課していた。既知六隻の正規/装甲空母1＋軽巡1＋駆逐4だけへ例外を限定し、速力条件と不要な缶/タービン目標を除外した。DD3の高速条件や利用者の明示目標は維持する。

## 根拠と境界

Eは戦艦級1以上のGが最優先、その後に軽巡1以上＋駆逐4以上のI、次に正規/装甲空母＋重巡級2以上のG、軽巡1以上＋駆逐3以上かつ高速のIが続く。軽巡へ雷巡/練巡、駆逐へ海防を合算しない。取得済み2026-10-31出典原文を再確認した範囲で、CV系/CVL略記差や稀艦種を推測統一しない。 これらは今回未検証の適用範囲を示し、現UIの全経路で一律manualになるという新しい保証ではない。

新scopeは2-5/index1/CEIO・6非空行/全艦種既知・CV/CVB1CL1DD4で、present routeInfo/suggestion.infoの6キーが全てcanonical一致する場合だけ。既知不一致は未知情報で消さず、速力だけが未知でもこのE枝自体は成立を確認できる。未知速力の検査はnormalized実predicate境界だけで、ブラウザーのマスターを改変した実証ではない。

Iの係数1/HQ120で31未満H・31以上34未満ランダム・34以上固定O、HQ域外/交換後ボーナスの参考値と未判定は不変。E/Iの成立だけで全経路や戦闘勝利を保証しない。全infoの最大値統合を新たに実装したものではなく、従来のrouteInfo||suggestion.info優先を維持する。通常generatedFromMap:falseの利用者装備目標は保持し、特殊複合flagの互換性まで一般化しない。

## 製品とNode

製品2ファイル・8アンカーの全文逆変換/再適用を独立確認。FEの装備目標フィルター・I数式、OC/FS/FC/保存本体は変更していない。元の艦隊自動生成はCVL/DD3例のままで、DD4を新たに自動艦生成する改善ではなく、選択・保存した実編成の判定接続である。旧保存presetのgear文章だけが異なっても、ships/name/flagshipと6キー導出・検索条件が不変である静的互換確認を行った。任意の旧/custom形式まで保証するものではない。

固定Node新15＋関連light15の30項目は全初回成功、16コマンド。旧sourceの同じ低速CL/DD4入力はE/route missing・speedTarget10、新sourceはE/I/route ready・speedTarget0を実対照で確認した。DD3高速、上位BB/重巡条件、未知/既知不一致、明示目標、合法LS装備・在庫不足・搭載不可・枠競合、既存I/北の関連境界を確認。fullgenerator0は選択callbackの静的経路/宣言の会計で、計測counterではない。

## 実操作と初回fixture不備

固定image b27、Node24.21.0、Playwright1.55.0、C1187/W2203、workers1/retries0、試験45秒/結果12秒を維持する。版情報URL2件のGETは既存の固定JSON入力fixtureであり、この成功は実ネットワークや製品の版取得成功を検証したものではない。旧access-control例外の原因・更新UIの最終状態は未確認のまま保持する。

初回前にDD3のタービンstockGap期待0→1の静的更新漏れを訂正した（試験起動0、製品/入力不変）。初回Cknownはsaved-readで10.444秒のfixture層比較失敗。measure/route/savedcontractのprefix付きdetail・条件/reason/status/ratio/childrenは同一だが、既定required-check再評価だけがbare detailで、異なる層を直比較していた。保存/編集の識別30項目・元キー/他編成/metadata保持を観測し、load比較は未到達、pageerror0・失敗後evaluate/read0。元保存値の異常を確認した失敗ではない。初期の静的試験レビューではこの層差を見落としており、その旧reviewも変更せず保持した。

新specだけで同じcontract層を完全比較し、prefix付きdetail===宣言reason＋colon＋bareと、load後のbare/reason完全一致も確認する最小訂正を行った。prefix除去・reason省略・待機/期限/例外検査の緩和、保存/読取りAPIの追加はない。製品/入力/prepareE/generatorは不変なのでNode30は再実行せず再利用した。

訂正後C/W各3（known:低速DD4/I35、missing:低速DD3・缶1/タービン0、unknown:既知DD4/HQ欠測）は訂正後ソースで各1回成功した。known/missingの数値4例は欠けた観測済み主砲1個を有限在庫から合法枠へ戻す代表、unknown2は最初から主砲がありHQを未判定に残す。DD4へ不要なタービンを案内せず、DD3の同じLS艦には合法タービン1の在庫不足を分ける。缶を追加購入する条件や、編成変更が不可能という意味にしない。

6論理/7物理で、初回fixture失敗と必要訂正後の再検証1を分離し、成功目的の反復0。最終6例の自動配備→保存→メモ編集→同一新文書load/complete後再探索・区分/理由/保存値・他編成・metadata保持、保存180/load180識別項目を主P/独立Oで照合済み。初回保存30は別観測で、全物理断面なら保存210/load180だが、初回load未到達を成功で補完しない。既存読取りでの直接一致観測とtyped metadataの照合であり、全保存本文を別コピーした二次比較とはしない。

全観測の探索区分はincomplete/non-exhaustiveを保持し、known/unknownはbounded-search、元DD3不足はbeam-limitの理由が残る。候補counterはknown/unknown各0、DD3不足は初回20/load後41で、評価呼出し数は未採取。「最適」「手持ちでは不可能」「購入必須」とせず、E/Iの局所readyと全readinessの未完了を分ける。pageerrorは全7試行0。

主Pは原本320件のbytes/SHA/記録済み属性を照合し、trace7件のCRC1047memberとcanonical動画7件の存在を確認した（動画再生0）。初回一時領域の同byte/SHA動画コピー1件も320原本に含めて保持し、8本のpathを8試行へ換算しない。共有候補7件は許可型metadataだけで、保存値本文は含めない。既存通常一覧C/W各910件から新各3件の選択と、実出力6pathの既存workflow対象への一致を確認した。CIの実出力や最終結果をこの局所検査から推定しない。 最終public685ファイルはcommit sourceとruntimeの対応を照合し、HTTPで実配信したソースハッシュは未採取。独立確認はproducerと別のraw/hash/projection再計算だがruntime recipe作者との独立性には限界があり、保存本文の独立二次比較はない。

## 残件・進捗

同じCEIO行の条件追加なので28確認済み/153一部/55未確認・236セルの変更0。A/B/Cは一部、Dは従来の同じ行の代表操作の根拠を保持し、今回の限定操作を加えても全条件/全装備/全在庫の網羅とはしない。HQ120外、CVLのみ/稀艦種・他隻数/出典差、全目標数量/改修/枠競合/同期ボーナスを未確認に残す。 CVL-only既知6隻の低速例は既存例/高速arm由来missingが残る。出典待ちという台帳区分はそのUI表示を根拠ある経路不可能/高速化で解決へ格上げしない。今回対象外。

旧CI42001989505の両jobはsmoke中に公式45分上限で取消、その後にalways-uploadが開始していた。uploadが最初の期限到達工程とはしないが、内部の遅さの原因や旧target6の結果は不明。4smoke成功・C1小計454/0/0・W1–3小計681/0/0・全C/W/旧target6の保持/終了結果nullは維持し、今回結果で補完しない。

次は4-2/index0 ACL/BDCLの任意対空CI案内。非選択Hの「制空不要」をマップ全体文字列へ結合することで選択経路のprofileが抑制される静的未接続を確認する。index1共通部の重複を避け、強制CI1・調達数を作らず任意表示と選択方針を分ける。今回は未実装/未試験。PR152ドラフト・未公開と原本・保護対象を維持する。

局所封鎖参照：主P canonical `cc84ccb05e2eb7d99a4a215a712684a8b24df19f5b23ff49c0e2f2c20f5c1d9f`、manifest `796bda68e30fee95fb490e2d66e017d57e7ebec85b5902af388387b478f0fe4d`、独立O join `a9b6dfe71942419ef0758374b0a06c2a36cc8fb0639b41f2fe44623bba1ee8c7`。原本は専用領域 `continuation-two-five-ceio-e-20261105/private/` に保持し、本文・trace・動画をcommitしない。

## 通常CI42024915243の確定部分と欠測

5smoke成功・W4は公式45分上限でjob/smokeが取消、Full skip。全Cの正式passed/flaky/failedは910/0/0、W1–3小計683/0/0で、W4 footerが無いため全Wは未確定。各jobのNode677pass/0fail、固定Node/PW/ブラウザーrevision/image/checkoutを実測照合した。Nodeの6job分を別の4062論理検査へ換算しない。dispatch1・rerun0・手動cancel0。

EのC known/missing/unknownは各初回成功。根拠はownC2の完全455pass footer、正常smoke中の対象progress、initial namespace、sourceと対応するtyped producer metadataの結合で、metadataのcompletedだけを合格根拠にしていない。stage完了/pageerror0、保存/loadの識別各30×3=90と元キー/他編成/metadata一致flagを確認した。取得可能な8ZIP/95memberには対象raw JSON/perOriginalが無く、元の実値再比較やmetadata再生成は未実施。numeric trial終了コードも欠測。WのE3は表示/metadata/最終結果/比較を観測できず、未開始とも成功とも断定しない。

取得eligible8ZIP370,154B/95memberのCRC/サイズ/SHA一致。512MiB超2原本は未要求で内部未読のため、全原本不存在や生成未達とは断定しない。W4の16診断headerは最終failed数/物理試行数ではない。初回/明示retryを別記録とし、night系の例外検査と他ケースのload後再探索click非表示を停止段階として分類した。後者の全文比較は未到達、表示変更元・原因・旧障害との同一性は不明。観測範囲で新規保存不一致の陽性記録は見ていないが、保存安全性の証明にしない。

未知艦の実行済みNode境界はCV1CL1DD3＋未知6th、browserのunknownは既知DD4/HQ欠測。CL1DD4＋未知carrierは今回静的確認だけで、他の既知不成立が無いcanonical情報ではcontract/final manualを維持する。既知BB＋未知/HQ不足のmissing保持とは別の境界であり、全未知入力へ一般化しない。追加試験/セル変更0。

次の候補：4-2/index0 ACL / BDCLの任意対空CI装備例の表示だけを最小候補Aとして確認する。単純なprofile復活はhdSEChecks minCount1を自動生成するため採らず、未選択時にSEgoals/必須数量/不足数を作らない。専用選択UI/keyは現製品に無く、目標化UI・保存互換/ID移行/数量/搭載先案内は別設計B。index1共通部は重複検証せず、CI発動/通行/勝利や調達数を保証しない。今は設計/静的確認だけで未実装・未試験・セル差0。

CI回収対象は原本548fileのset/bytes/SHA/記録済みfile属性が一致。一方、171dirのatimeだけに差があり、他dir属性は一致した。変更元/原因は未確定、時刻の書戻し・旧baseline変更は行わず、file内容破壊や製品の保存不一致と同一視しない。directory差ref `10b6da6f9eaec874db87eab376fe04de08b47c14a35c6a9af131a6a62cebc8e5`。

主Pはqualified封鎖済み（canonical `5b0f3c01197dd6f47d9823043546df5a5dc841da78a11fbdbfc60491a9f7aab1`、manifest `deef7095b400990b053791a409e84248b11fc2869364bc460ee0741022ef1d81`）。初回の属性guard停止と新規resumeの成功は別記録で、試験再実行ではない。原本の書戻し・旧baseline置換・既存partial上書きはなく、追加API/取得/試験0。qualification ref `974720c5be77c2160407d4d2611c23323e76ba4ce2507d6d5dc8f7181a42a214`。独立Oは1回のoffline照合で12項目一致し、既存171dirのatime差以外の追加差0を確認した。main review `9a3dbb3458324726bab7e35b61e6cf171a4d639f6971bc5a7c22f8fe1efc0bfe`、最終join `3dd82d2b9190257019e96e0ce220cbb3b6271f401f84970ae67d393242783a29`、manifest `eef2c62a9b23d5e34e944513ccbae66434a8b589cdfa3764cf507dfb4568b8f7`、closure `4dc07c5e826f0b88ae30855d6bdd1fe2d14f5ac195eb8dafe449cfac123af82f`。runtime recipe作者との独立性には限界があり、typed-onlyをraw本文の二次比較へ格上げしない。既存局所封鎖版と旧CI/旧失敗の欠測を今回成功で補完しない。
