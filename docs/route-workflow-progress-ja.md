# 59行×4項目の進捗（未公開PR152）

照合基準 `743645f57590cc42c0d88ca79d7c4db49341a620`。既存53例を選択目標で展開した59行、37海域が分母。全ゲームルートではない。A/B/C/Dは今回の4項目名であり、旧案内表の証拠記号A/B/C/Dとは別。

旧53例の全条件1／一部49／未確認3は維持。旧「必須接続」集計も別尺度で、後述の236セルへ換算しない。

## 判定基準

- A: 経路条件と目標値の根拠・適用範囲・判定。確認済みには全登録条件と目標の数量/必須・推奨・利用者指定の根拠が必要。条件単位の成功、構造選択、未確認数量の残る行は一部。暫定資料しかない5-6は未確認。
- B: 同じ行の手持ち在庫からの実配備。確認済みにはその行の全適用目標の配備・合法性・有限在庫を確認する証拠が必要。特定条件/所持代替だけの実行は一部。共通コード・全マスター仮想所持の艦選択だけは未確認。
- C: 同じ行の具体的な不足/未判定案内。確認済みには対象装備/数量/搭載先と在庫不足・搭載不可・枠競合・情報不足・探索打切りの全適用区分の証拠が必要。特定条件だけは一部。案内コードの存在だけは未確認。
- D: 同じ行の保存・編集・同一reload文書load/complete後の再表示と他編成/metadata保持。全列挙の操作が明記された同定可能な証拠のみ確認済み。保存/loadや目標編集の一部だけは一部。別行の共通回帰は流用しない。

「一部」は任意の50%へ換算しない。確認済み/59以外の進捗率を作らない。4列全体は全行に適用されるため非該当0。個別条件に数値指定がないことは列全体の非該当ではない。

## 集計

|項目|確認済み|一部|未確認|非該当|分母|
|---|---:|---:|---:|---:|---:|
|A|0|56|3|0|59|
|B|0|20|39|0|59|
|C|0|20|39|0|59|
|D|4|18|37|0|59|

2026-10-28追補：[5-4最終整理](pr152-five-four-closeout-ja.md)は既存証拠で終了し、追加実行0・状態変更0。基準236セル3/115/118の下に閉じた限定残件と4分類を別記した。続く[2-5北F分岐](pr152-two-five-north-f-ja.md)では高速3戦艦の有効枝と選艦/不足案内を接続し、C/W各1初回で保存・編集・同一文書load後の完全一致まで確認したためDだけ一部→確認済み。前3/115/118→後4/114/118、変更1セル。A/B/Cの全条件完了へは広げない。7-3 Gと他行は維持。

## 行別対応

|海域/index/選択目標・経路|A 根拠/判定|B 自動配備|C 不足案内|D 保存/編集/load|同じ行の限定実行記録|
|---|---|---|---|---|---|
|1-1/0/default AC|一部|一部|一部|一部|[pr152-registered-example-completion-ja](pr152-registered-example-completion-ja.md)|
|1-2/0/default AE|一部|一部|一部|一部|[pr152-ae-speed-ui-ja](pr152-ae-speed-ui-ja.md)|
|1-3/0/normal CFJ / A(DB)EFJ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|1-3/0/cfj CFJ|一部|未確認|未確認|一部|[route-1-3-verification-ja](route-1-3-verification-ja.md)|
|1-4/0/normal BCF(E)HL / AD(EH/GJ)L|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|1-4/0/j-avoid BCFEHL / ADEHL|一部|未確認|未確認|一部|[route-1-4-verification-ja](route-1-4-verification-ja.md)|
|1-5/0/default ADEJ|一部|一部|一部|一部|[route-goal-guidance-ja](route-goal-guidance-ja.md)|
|1-5/1/default ADFGJ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|1-5/2/default ADFGJ|一部|一部|一部|一部|[asw-route-targets-ja](asw-route-targets-ja.md)|
|1-6/0/default AEGFBN|一部|一部|一部|一部|[asw-remaining-targets-ja](asw-remaining-targets-ja.md)|
|2-1/0/default C(E)DH|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|2-2/0/default CE(GH)K|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|2-3/0/default ボス方面・経路ランダム|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|2-4/0/default ボス方面・経路ランダム|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|2-5/0/default BFJO|一部|一部|一部|確認済み|[pr152-north-los-ui-ja](pr152-north-los-ui-ja.md) / [pr152-north-drum-domain-ja](pr152-north-drum-domain-ja.md) / [F分岐と代表操作](pr152-two-five-north-f-ja.md)|
|2-5/1/default CEIO|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-1/0/default CFG|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-2/0/normal CG(H)FL / CEFL|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-2/0/fastPlus CEFL / CGFL|一部|一部|一部|一部|[pr152-fastplus-route-ui-ja](pr152-fastplus-route-ui-ja.md)|
|3-2/0/fastest CEFL|一部|一部|一部|一部|[route-3-2-verification-ja](route-3-2-verification-ja.md)|
|3-2/1/normal CG(H)FL / CEFL|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-2/1/fastPlus CEFL / CGFL|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-2/1/fastest CEFL|一部|一部|一部|一部|[pr152-route-target-scope-ja](pr152-route-target-scope-ja.md)|
|3-3/0/default ACGM|一部|一部|一部|確認済み|[current-auto-loadout-coverage-ja](current-auto-loadout-coverage-ja.md)|
|3-4/0/default ACEGJP|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|3-5/0/default FGK|一部|一部|一部|一部|[pr152-south-scouting-ui-ja](pr152-south-scouting-ui-ja.md) / [pr152-scouting-options-ja](pr152-scouting-options-ja.md)|
|3-5/1/default BDHK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|4-1/0/default CFDGJ / ABDGJ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|4-2/0/default ACL / BDCL|一部|一部|一部|一部|[asw-remaining-targets-ja](asw-remaining-targets-ja.md)|
|4-2/1/default ACL / BDCL|一部|一部|一部|一部|[asw-remaining-targets-ja](asw-remaining-targets-ja.md)|
|4-3/0/default CDHN / CFHN|一部|一部|一部|一部|[pr152-land-set-routes-ja](pr152-land-set-routes-ja.md)|
|4-4/0/default AEIK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|4-5/0/default ADHT / CDHT|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|4-5/1/default ADHKT / CDHKT|一部|一部|一部|一部|[pr152-port-attacker-set-ja](pr152-port-attacker-set-ja.md)|
|4-5/2/default ADHT / CDHT|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-1/0/default BCFJ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-2/0/default BCEFO|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-3/0/default DGIOKEQ|一部|一部|一部|一部|[pr152-5-3-speed-ui-ja](pr152-5-3-speed-ui-ja.md) / [pr152-5-3-branches-ja](pr152-5-3-branches-ja.md)|
|5-4/0/default ADEHIJMP|一部|一部|一部|確認済み|[pr152-five-four-battleship-ja](pr152-five-four-battleship-ja.md) / [潜水艦除外の追加確認](pr152-five-four-submarine-ja.md) / [M→P免除と局所未到達](pr152-five-four-scouting-exemption-ja.md) / [限定仕上げ](pr152-five-four-completion-ja.md)|
|5-5/0/default BKPS|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-5/1/default BFDHNOS|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-6/0/default ABC2DEG|未確認|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-6/1/default IJKLN|未確認|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|5-6/2/default IOQUXZ|未確認|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-1/0/default AFGHK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-2/0/default CEJK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-3/0/default ACEGHJ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-4/0/default BDCFN|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-5/0/default ACDGM|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|6-5/1/default BFIJM|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-1/0/default DEGHK|一部|一部|一部|一部|[asw-route-targets-ja](asw-route-targets-ja.md)|
|7-2/0/default CEG|一部|一部|一部|一部|[asw-route-targets-ja](asw-route-targets-ja.md)|
|7-2/1/default BCDIM|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-3/0/default ACE|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-3/1/default ACDGJP / ACDGIJP（G分岐未確認）|一部|一部|一部|確認済み|[pr152-seven-three-gij-ja](pr152-seven-three-gij-ja.md) / [pr152-seven-three-speed-ja](pr152-seven-three-speed-ja.md)|
|7-4/0/default ABEJLP|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-5/0/default ABDFGHK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-5/1/default ABDFJOQ|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|7-5/2/default ABDFJOPT|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|

## 根拠と限界

行別の理由・試験ソース・残件・変更前後集計は[機械可読表](route-workflow-progress.json)。旧[59行の条件別案内表](route-goal-guidance-ja.md)と[53例の検証範囲](route-requirement-validation-scope-ja.md)を照合した。最新は[2-5北F分岐](pr152-two-five-north-f-ja.md)と[5-4最終整理](pr152-five-four-closeout-ja.md)。[5-4中央の限定仕上げ](pr152-five-four-completion-ja.md)は再利用する履歴。[5-4 M→P索敵免除](pr152-five-four-scouting-exemption-ja.md)は旧試行と未到達の履歴。[D→Eの潜水艦除外](pr152-five-four-submarine-ja.md)は再利用する履歴。前回の[元艦種上限](pr152-five-four-battleship-ja.md)は再利用する履歴。7-3は[限定根拠確認](pr152-seven-three-g-evidence-limit-ja.md)で未確認を維持。前回の[7-3 G/I/J](pr152-seven-three-gij-ja.md)は履歴。前回の[高速条件](pr152-seven-three-speed-ja.md)は当時の記録として保持。

- 一部は50%等へ換算しない。確認済み数/59のみを列ごとに数える。
- 同じ行の条件単位の成功は列全体の完了と異なる。今回A/B/Cの全体確認済み0は個別条件の成功0を意味しない。
- 原本が新環境に移送されていない過去分はコミット済み記録/試験ソースと現行CIを照合。旧環境にアクセスせず、原本を新たに再解析したとはしない。
- 未確認は本棚卸しで同定できる証拠なし。製品機能がないという意味ではない。
- 実ゲームの全編成・全分岐・任務・勝利・iPhone・一般探索網羅は分母外。

次の1ルート候補：3-3/index0 ACGMのA/C/Gの接続。今回は実装・実行しない。

自然保存実null・DCL停止等は未解決。PR152ドラフト・公開保留、main競合未解消、PR151/main/版/SW/本番の変更・マージ・公開・自動マージなし。
