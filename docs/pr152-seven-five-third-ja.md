# 7-5第3ABDFJOPT：選択経路の装備表示

2026-10-31 JSTの局所・CI確定記録（実試行UTC2026-10-30）。出典確認日30日は保持。局所の253基準WIPと、通常pushした検証source1b4f9ab6／CI41086731653、後続の記録HEADを分ける。PR152ドラフト・未公開を維持する。

## 利用者から見た変更

第3Tを選択しても従来は海域全体の装備カードを表示し、第2Q向けの対地セットが混ざる接続だった。選択したABDFJOPTの範囲を表示へ渡し、第3の既定カードから対地/PTを外す。Tの説明も「対地装備」の1語だけを除き、第2の説明は残す。これは対地装備の全敵への物理的無効や、到達・勝利を判定する修正ではない。実画面の修正前誤表示や実喪失は未観測で、旧製品対照はNodeの表示期待値で確認した範囲である。knownは経路条件成立でも、既存の任意航空攻撃0/1が不足し制空はmanualで、装備全体が準備済みという意味ではない。

対空/対潜は既存の任意比較として残す。夜戦補助1個をCI1組へ読み替えず、新しいauto CI目標は追加しない。明示した魚雷/主砲CI方針は利用者指定として表示し、既存の種類・数量2/4・choice・metadataはNode対照で保持する。任意比較・経路必須・利用者指定を区別し、明示した対地等の目標を削除しない。

## 根拠と今回変えない範囲

対象は7-5/index2、F→J・O→Pを選ぶABDFJOPT。第2撃破とMのS勝利1回という開放条件を説明するが、選択や艦種から実際の開放状態を推定しない。記事のT向け航空・対潜または煙幕・夜戦の説明と、第2Q向け対地/PTの説明を分け、cached出典6件と独立11表示intentを照合した。記事はKCを参照しており、独立した実ゲーム出撃の多数決ではない。日本語wiki本文403と出典の限界は保持する。

変更はPanelの第3選択引数、選択第3の表示filter/注記、T.airの1語だけ。3製品は逆置換でbeforeとbyte一致し、15保護関数・FE/map/route/数値索敵・探索・保存・目標ID/通過履歴・global recipe/profile/cacheは不変。CA/DEと低速例外の453行、登録安全域63未満のランダム/不足帯は出典待ちのまま。現在の登録数値判定を、実ゲームの確定逸れや購入必須へ拡張しない。

## 境界・入力契約の結果

- 固定Node24.21.0で、旧表示対照1件は通常カードassertで期待どおりsemantic失敗。新表示6件、影響する既存4件は成功し、成功済み範囲の反復はしない。表示6/親4は追加browser2件より前のsource633で取得し、G2記録だけを進めた253基準と現635でも同じ製品3のhashを保つため再利用する。source635で全10件を再実行したという記録にはしない。first/second/他map/legacy2引数の有限出力・処理回数対照であり、全入力やG3の実Storage保持の証明ではない。
- 私有の実関数入力契約2件は初回1成功/1失敗。未知例を一律manualとした期待値が、艦種5条件manualと明示入力の登録索敵目標未達missingを混ぜていた。入力・製品を変えず、その内訳を別々にassertする訂正後、失敗した1件だけ成功した。known成功と既存10件は再実行していない。
- stockの同期generatorは1回だけ実行し、examined748/yield14、終了beam-limit・非網羅、元装備との返却完全一致・route readyを確認。これはNode内の候補探索で、ブラウザー時間・操作・保存成功ではない。ソナー1/投射機0の部品不足を、経路必須や購入必須へ変換しない。
- 純metadataは5familyのproducer2＋Python consumer2、spec構文が成功。hostがspec出力をTAPと誤認した集計だけを既存stdout再解析で訂正し、試験を再実行していない。旧4familyの保護と新thirdのcontext/hash照合を区別する。

元保存の未知装備は安全中止で保持し、rawのload再評価manualと、提案の数値条件missingを別々に確認した。探索提案ではBuildが安全に扱えない装備を除外する一方、保存保持issueにより元原文への書込みを禁止する。提案の明示数値目標missingは未知艦種manualと別の状態であり、元データ喪失・一律艦種不一致を意味しない。C/W未知例はこのraw/proposal別期待と安全中止・元全文保持を実操作で確認した。旧目標/履歴2キーの実互換は別に未確認を残す。

## 実操作・保存の結果

|代表|Chromium初回|WebKit初回|
|---|---|---|
|同期した成立入力|必要期待訂正後：保存/編集/load全文完了|保存編集後通過、load再探索非表示・全文null|
|有限在庫不足|保存/編集/load全文完了|保存/編集/load全文完了|
|未知装備/艦情報|安全中止/元全文保持/load完了|安全中止/元全文保持/load完了|

実行条件は固定PW1.55.0 image/Node24.21.0/C1187・W2203、workers1/retries0、総45秒/結果12秒、10000候補/beam5/depth24、既存待機・取消・例外検査を維持する。既存7キー・識別項目・他編成/metadataの直接比較と、保存可能な案の編集/loadまたは安全中止の元全文保持を、実際の到達段階で記録した。実一覧はC/W各886、新3件と6局所selector各1を確認した。訂正後の公開source635とprivate設定1のruntime636は別集合で、最終Gitは専用doc追加後に別計測する。

`harbordesk-active-sortie-session-v1` と `harbordesk-sortie-objective-pref-v1` の旧目標/通過履歴sentinelは未seed。15保護関数のbyte一致や過去の共通証拠、既存7キー保持を、この2キーの新しいG3実互換保持へ換算しない。保存値本文・原本trace・認証情報はprivateに保持し、共有用は許可metadataだけから別生成する。

<!-- seven-five-third-local-start -->
訂正前Cknownは結果後に期待manual/実missingで失敗し、保存/loadと最終例外assertは未到達。既存の任意carrier-attack目標1/count0が不足、route/LOS readyと制空manualが併存するため、入力・製品を変えず期待を分離した。air-only終了理由の不適切な期待も根拠を確認して訂正し、必要なCknown再検証を旧失敗と別に実施した。

訂正phaseのC/W6件は5完了/1W成立失敗。完了5例はCknown/Cstock/Wstockの適用保存・メモ編集・同一reload文書load全文/strict30と、C/Wunknownの安全中止/編集なし・元全文保持/loadである。W成立は保存編集後strict30/6anchorと全8保持判定を通過したが、総45秒期限時にload後search buttonが非表示でclick待機停止（82:47/試験caller116:44）。結果表示12秒assertとload全文は未到達/null。pageerror採取0は最終例外assert成功を意味せず、nav採取失敗1・click配送/handler/探索開始は未確認で、load後停止文書の表示変更元/原因は欠測。初回文書のguide切替stackは別記録として存在するが、load後文書snapshot採取失敗1の欠測へ流用しない。W不足/未知はそれまで未実施だった独立した各初回で全文まで完了し、失敗W成立は反復しない。

旧Cknown1期待失敗＋訂正Cknown1必要再検証＋残5初回＝物理7で、同sourceの成功目的反復0。訂正phaseの6読取り/5load全文と適用編集4case・安全中止2caseを分け、Storage書込み呼出し数は未実測null。到達分の保持不一致陽性0は一般的な保存安全性の証明ではない。公開source635 manifest7945493f…とprivate設定を加えた実runtime636 a59a0772…を同一集合と扱わず、specは31992B/SHA26d5624a…、formatter/fixtureは不変。純4契約はed4cf062…を根拠に再利用し、旧成功を再実行していない。collector閉鎖SHA-256は`26ec31ff8ac8e4030b12950da7ad2b58cb6609358f23b3a7638bce44b8c557cb`。last2 manifestの137,582Bはmanifest自体のbytesで、元714ファイル23,598,632Bのpayloadとは別分母である。
<!-- seven-five-third-local-end -->

## 進捗と残件

局所では24/145/67から同じ第3行B/C/Dだけ未確認→一部、24/148/64としてDを一部に留めた。後述のCI直接証拠でDだけ確認済み、25/147/64とし、旧Cknown初回と旧localW成立の未到達はそのまま保持する。他58行・旧53区分・全59scouting・236セルの定義は変えない。

全戦闘目標の数量/必要十分性・全在庫/合法枠/同時配備・代替、数値索敵の出典待ち、既存single-target情報不足表示、実Storageの旧目標/履歴、実ゲージ/到達/勝利は残る。第3専用carrier/ASW搭載先helperは未接続で、具体搭載先の接続未完も成功扱いにしない。

<!-- seven-five-third-ci-start -->

## 2026-10-31 最終source CI確定

検証source `1b4f9ab60c985a3315c99e4dc68b73d19b549b3f`／[CI41086731653](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41086731653)、attempt1・workflow_dispatch実受理1回/再実行0。run failure、5smoke成功/W4失敗、Full skipped・取消0。公式C886 passed/0 flaky/0 failed、W869/11/6はcase outcomeで、厳密な初回成功数や物理試行数へ換算しない。failed6はH回避stock、5-5免除、5-1成立、6-4成立、6-1成立、固定CEFLstockの6ケースで、注記だけのdistinct3タイトルへ縮約しない。


|job|conclusion|passed|flaky|failed|
|---|---|---:|---:|---:|
|C1|success|443|0|0|
|C2|success|443|0|0|
|W1|success|222|0|0|
|W2|success|222|0|0|
|W3|success|221|0|0|
|W4|failure|204|11|6|

全6jobで実Node572/572/0、checkout1b4・実image pull b27e・Node24.21.0/PW1.55.0/C1187/W2203が一致。Git期待636 manifest84094c7d…は局所runtime636と別集合で、CI実HTTP配信hashの独立実測ではない。記録commit HEADは後続で、検証source1b4と分ける。cwd未指定の最初のCLI失敗は送信前の準備失敗であり、CIを2回起動した意味ではない。

自身G3は初回C3＋W成立/未知の5件が全文まで完了。W不足初回は保存編集後strict30/6anchorを通過後、総45秒期限時のload再探索click非表示で停止し、load全文はnull・結果表示12秒assertは未到達。別retry1は全文/strict30/他保持/最終例外検査まで完了した。同source/inputの同定済み6代表にこの直接証拠を対応し、既存D定義のままDだけ一部→確認済み、24/148/64→25/147/64。初回限定/flaky除外は追加せず、最終closureと独立PASSで根拠を照合した。旧Cknown期待失敗と旧localW成立load未到達を、新しい成功で補完しない。

5familyのtiny原本33件はinitial30＋採取retry3。保存後読取33・load読取31・stage completed30は別指標で、不一致陽性0を一般保存安全性へ広げない。実PWのhash付きmember名/contextをsourceから同定するprivate consumer訂正は対象7契約を1回成功し、旧4pureと製品試験を反復していない。G3原本7件もinitial読取6/load5＋retry読取1/load1と分け、書込み回数へ換算しない。7-4未知初回はload/strict30等は到達一致後の最終errors[]でaccess-control2件、retry完了は別記録である。

他の最終失敗4ケースは両試行のload後非表示click待機、H回避/固定CEFLの2ケースは両試行の最終errors[] access-control配列比較。後者の直前load比較通過は同source制御順からの導出で、raw実値JSON/trace取得済みの意味ではない。表示変更元/例外原因/旧障害との同原因やG3因果は未確定。例外検査は維持し、調査を拡張せず試行別原文を残す。

正式attempt ZIPは1要求で11,646,536B・102member/CRC正常、SHA-256 `bc98e05726fa2ecba847f6fadbb413015b646cb58f11bfbbce325216058c6dcf`。11成果物中8 logical artifacts/310,724B（環境6＋tiny2）を受領したが、C2 attempt1,655,857,936B・W4 attempt546,114,328B・W4 smoke1,100,287,395Bは上限超で未要求、raw trace/実値JSON欠測を維持。W1のCLI0B Forbiddenは取得阻害として保持し、同じ失敗経路を反復せず各小成果物を既存connector/FileServiceで各1回取得した。raw trace/videoの受領は0で、formal ZIPはrun-log、tinyはmetadataである。collector閉鎖SHA-256 `2f0c7d522c35ff32e2dc790926c6b548e3b1007f879f0c987725cd5f6de74878`、1283ファイル31,031,336Bをhash照合し保存した。独立最終review SHA-256 `16f10e91d7fa564f92831f390ac95bba6395efc32a165a94005477272cd493b9`で全件と試行区分を照合し、記録のみの新CIは起動しない。
<!-- seven-five-third-ci-end -->

次の3-1では、閉鎖source-only設計9＋代替編成addendumは当時JS/UI未実行の記録として保持する。以後の3-1検証・未コミット差分は別WT・別記録で、UI未実行・セル加算0。G3の証拠や成果へ合算しない。

PR152ドラフト・未公開、main競合・旧原本・既知残件を保持。main統合/PR151/版/SW/本番/マージ/公開/自動マージは行わない。
