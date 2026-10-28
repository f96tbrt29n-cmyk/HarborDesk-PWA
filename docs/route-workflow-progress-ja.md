# 59行×4項目の進捗（未公開PR152）

照合基準 `743645f57590cc42c0d88ca79d7c4db49341a620`。既存53例を選択目標で展開した59行、37海域が分母。全ゲームルートではない。A/B/C/Dは今回の4項目名であり、旧案内表の証拠記号A/B/C/Dとは別。

旧53例の全条件1／一部49／未確認3は維持。旧「必須接続」集計も別尺度で、後述の236セルへ換算しない。

[継続方針](pr152-continuation-policy-ja.md)に従い、以後は対象選定・通常push・最終smokeまで継続する。新たなデータ喪失・明確な回帰・環境/権限阻害・利用者判断を要する仕様変更では、判断点を残して停止する。

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
|B|0|23|36|0|59|
|C|0|23|36|0|59|
|D|9|16|34|0|59|

2026-10-28追補：[5-4最終整理](pr152-five-four-closeout-ja.md)は既存証拠で終了し、追加実行0・状態変更0。基準236セル3/115/118の下に閉じた限定残件と4分類を別記した。続く[2-5北F分岐](pr152-two-five-north-f-ja.md)では高速3戦艦の有効枝と選艦/不足案内を接続し、C/W各1初回で保存・編集・同一文書load後の完全一致まで確認したためDだけ一部→確認済み。前3/115/118→後4/114/118、変更1セル。A/B/Cの全条件完了へは広げない。7-3 Gと他行は維持。

2026-10-28追補：[3-3 ACGM](pr152-three-three-acgm-ja.md)はA/C/Gの優先順と装備推奨を分離し、独立した分岐境界と代表操作を確認する単位。A/B/Cは一部、Dは既存の確認済みを維持する。236セルは前後とも確認済み4／一部114／未確認118で、限定確認による格上げはしない。

2026-10-28追補：[3-4 ACEGJP](pr152-three-four-acegjp-ja.md)で駆逐/海防代替・Pボス構造図・空母別不足案内を接続。C/W3状態各初回成功を根拠に、同じ行のB/Cを未確認→一部、Dを未確認→確認済みとした。前4/114/118→後5/116/115、変更3セル。A/B/Cの全目標完了へ格上げせず、基準・分母236は維持。[load後非表示の共通残件](pr152-post-load-navigation-residual-ja.md)は停止段階だけ照合し、同原因とは扱わない。

2026-10-28追補：[4-1 CFDGJ／ABDGJ](pr152-four-one-routes-ja.md)はランダム始点の同じ登録群として、C/F/Dの優先条件・Jボス図・艦別不足案内を接続。有限在庫の実配備と不足/未知、保存・編集・同一load文書の保持をC/Wで確認し、B/Cを未確認→一部、Dを未確認→確認済み。前5/116/115→後6/118/112、変更3セル。新規試験の誤ったAA目標検査で初回4失敗を保持し、その前提だけ修正した4件の再検証と未知2成功の再利用を区別する。A/B/Cは一部のまま、分母・基準236を維持。[Nodeパッチ固定](pr152-ci-node-patch-ja.md)と旧5-4停止段階整理はセルを変更しない。

4-1の最終CI記録：HEAD `dc174887264bbc4e04a1099aeb27e7e4653be238`、[通常smoke40640755417](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/40640755417)は6成功。Cは初回822/retry成功0/最終失敗0、Wは816/6/0。全6ジョブ自身の環境原本でNode24.21.0を確認。成果物8中7取得、C2詳細ZIPは512MiB上限で欠測。新規4-1 Cの初回成功は公式全822初回成功＋固定選択、Wは取得原本による確認と区別する。W初回失敗6件は各原本を保持し、成功retryで欠測を補わない。旧5-4非表示・空母夜戦等の原因解決とはしない。236セルの変更はこのCI記録追記では0。

2026-10-28追補：[4-2 ACL／BDCL](pr152-four-two-routes-ja.md)は潜水系が先行するA分岐と16接続図、名前/数量/合法枠の不足案内を接続。C/W各4代表が初回成功。index0・1それぞれの成立案で保存/編集/同一新文書load後の再探索と完全一致を確認したため、両Dのみ一部→確認済み。前6/118/112→後8/116/112、変更2セル。A/B/Cと旧53例区分は維持。任意対空CI目標のマップ文字列判定による未接続、全数量根拠/全在庫/枠競合は残る。次は根拠のある別編成を誤って除外している4-4 AEIK。

2026-10-28 実行接続の復旧確認：前回は `exec-server transport disconnected` で4-4準備と4-2 CI原本回収を停止した。今回は軽い実コマンドの成功に加え、両worktreeのHEAD `2f2b78d4`・開始時clean、4-2コミット16件/局所原本8件・移送原文6件・4-4主要出典3件のハッシュ一致を確認した。管理API表示だけを復旧根拠にせず、既存環境/証拠を初期化・削除せず保持した。既存CI40661026429と監視を再利用し、新しいCI/試験は重複起動しない。停止状態を解除し4-4 AEIKの未実装/未検証部分から再開する。この復旧記録による236セル変更は0。

2026-10-28追補：[4-4 AEIK](pr152-four-four-aeik-ja.md)はIの重巡級ちょうど2／正規空母0＋軽巡の代替、E海防条件の出典差、影響する揚陸艦分類の未判定を接続し、17接続図と具体的な不足候補を確認。C/W3代表各初回成功によりB/Cを未確認→一部、Dを未確認→確認済み。前8/116/112→後9/118/109、3セルのみ。A/B/Cは全目標の数量/十分人数・全在庫/枠競合が残るため一部。次は4-5/index1 ADHKT／CDHKTのH分岐・Kの先行潜水系条件を優先し、既存の担当艦セットと他indexの成功証拠は再利用する。

4-2最終CI記録：HEAD `2f2b78d4ebd63b9dd4e999635fc35cfc76985d95`、[40661026429](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/40661026429)は5成功／1失敗、attempt1・再起動なし。C初回826/retry成功0/最終失敗0、W821/4/1。新規4-2 Cは公式全826初回成功＋固定選択、Wは取得した4初回原本の2結果/load完全一致・最終ナビ/ボタン可視/drop0/採取失敗0で確認。全6ジョブのNode24.21.0を各ジョブ自身のreceiptまたはW3ログで確認し、W3 ZIP未取得とは区別する。C2詳細688,906,039bytes・W4全体673,059,317bytesは512MiB上限、W3小型ZIPも取得エラーで欠測。W4試行原本335,020,718bytesは取得・SHA/CRC一致。最終失敗の5-4索敵不足は初回/retry双方が最初の結果/保存/編集/load待機完了後の第2click非表示・未完了。第2結果/最終load比較は未到達、配送/探索開始/表示変更元は不明。既知の停止段階と一致するが同原因・無関係・解決とは断定せず、追加試験/原因調査へ広げない。初回失敗と成功/失敗retryは原本別に保持する。CI集計追記自体の236セル変更0。

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
|3-3/0/default ACGM|一部|一部|一部|確認済み|[current-auto-loadout-coverage-ja](current-auto-loadout-coverage-ja.md) / [A/C/G分岐と代表操作](pr152-three-three-acgm-ja.md)|
|3-4/0/default ACEGJP|一部|一部|一部|確認済み|[分岐・配備・代表操作](pr152-three-four-acegjp-ja.md)|
|3-5/0/default FGK|一部|一部|一部|一部|[pr152-south-scouting-ui-ja](pr152-south-scouting-ui-ja.md) / [pr152-scouting-options-ja](pr152-scouting-options-ja.md)|
|3-5/1/default BDHK|一部|未確認|未確認|未確認|同定できる個別実行記録なし（構造/接続はJSON参照）|
|4-1/0/default CFDGJ / ABDGJ|一部|一部|一部|確認済み|[共通条件・経路差・代表操作](pr152-four-one-routes-ja.md)|
|4-2/0/default ACL / BDCL|一部|一部|一部|確認済み|[共通分岐と代表操作](pr152-four-two-routes-ja.md)／[既存ASW設定](asw-remaining-targets-ja.md)|
|4-2/1/default ACL / BDCL|一部|一部|一部|確認済み|[共通分岐と代表操作](pr152-four-two-routes-ja.md)／[既存ASW設定](asw-remaining-targets-ja.md)|
|4-3/0/default CDHN / CFHN|一部|一部|一部|一部|[pr152-land-set-routes-ja](pr152-land-set-routes-ja.md)|
|4-4/0/default AEIK|一部|一部|一部|確認済み|[代替編成・未判定・代表操作](pr152-four-four-aeik-ja.md)|
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

行別の理由・試験ソース・残件・変更前後集計は[機械可読表](route-workflow-progress.json)。旧[59行の条件別案内表](route-goal-guidance-ja.md)と[53例の検証範囲](route-requirement-validation-scope-ja.md)を照合した。最新は[4-4 AEIK](pr152-four-four-aeik-ja.md)。[4-2 ACL／BDCL](pr152-four-two-routes-ja.md)は再利用する履歴。[4-1](pr152-four-one-routes-ja.md)、[2-5北F分岐](pr152-two-five-north-f-ja.md)、[5-4最終整理](pr152-five-four-closeout-ja.md)は再利用する履歴。[5-4中央の限定仕上げ](pr152-five-four-completion-ja.md)は再利用する履歴。[5-4 M→P索敵免除](pr152-five-four-scouting-exemption-ja.md)は旧試行と未到達の履歴。[D→Eの潜水艦除外](pr152-five-four-submarine-ja.md)は再利用する履歴。前回の[元艦種上限](pr152-five-four-battleship-ja.md)は再利用する履歴。7-3は[限定根拠確認](pr152-seven-three-g-evidence-limit-ja.md)で未確認を維持。前回の[7-3 G/I/J](pr152-seven-three-gij-ja.md)は履歴。前回の[高速条件](pr152-seven-three-speed-ja.md)は当時の記録として保持。

- 一部は50%等へ換算しない。確認済み数/59のみを列ごとに数える。
- 同じ行の条件単位の成功は列全体の完了と異なる。今回A/B/Cの全体確認済み0は個別条件の成功0を意味しない。
- 原本が新環境に移送されていない過去分はコミット済み記録/試験ソースと現行CIを照合。旧環境にアクセスせず、原本を新たに再解析したとはしない。
- 未確認は本棚卸しで同定できる証拠なし。製品機能がないという意味ではない。
- 実ゲームの全編成・全分岐・任務・勝利・iPhone・一般探索網羅は分母外。

次の作業単位：4-5/index1 ADHKT／CDHKT。Kの潜水系ランダム逸れが索敵判定より先、Hの高速＋等によるT直行はK経由と異なる点が未接続のため優先する。既存4-5/0・2と担当艦セット/保存成功証拠は再利用し、実際の旧製品判定との対照を先に確認する。5-1の軽巡過剰制限は次点。

自然保存実null・DCL停止等は未解決。PR152ドラフト・公開保留、main競合未解消、PR151/main/版/SW/本番の変更・マージ・公開・自動マージなし。
