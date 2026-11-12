# 1-3 normal/CFJ・1-4 J回避：有限攻撃機配備の限定確認

2026-11-12 JST。起点87c8f053、旧記録5962c77b／検証source00927721からの証拠整理を閉鎖後、専用領域で実施。製品コードの具体的欠陥は見つからず、製品変更は0。

## 既存証拠との差と入力

既存のstock0案内・参照表示を、新しい実配備成功へ流用しない。対象は1-3/0/normal、同CFJ、1-4/0/j-avoid。登録出典・分岐範囲を再利用し、低速対応・DD4・1-4潜水母艦の区別と初期分岐ランダムを維持した。

共通は飛鷹改1、空通常枠、九七式艦攻★0・AA0を1機。1-3は夕張改二特＋DD4、1-4は大鯨＋DD4。既知マスターのtype8許可・通常4枠18/18/18/12を独立確認し、未配備＋4配備先の5状態、最大1機/1艦を期待値とした。探索結果を期待値へ写していない。

任意攻撃能力目標1、装備個数、数値制空、経路必須と勝利を分離。実艦の識別は合成gameShipId/rosterId等で検査するが、実装備個体IDや固定枠指定は入力にない。その保護・実個体の重複防止は未確認。

## 試験側の訂正とNode

初回Nodeは2 tests/0 pass/2 fail、night目標の存在を誤って期待したassertionで停止（ブラウザー保存操作は未開始）。equipmentKindsの許可フィルターを実際の生成目標と混同した前提だった。現行のhdMapEquipNeeds→hdSEProfiles→hdFEEquipmentRequirementsを静的に追い、1-3/1-4とも既定night目標なしを明示する期待へ訂正した。

1-3は実生成carrier目標1を満たしtargets-met、未完了案内なし。1-4は制空個数2・対空目標1が残りincomplete。各4候補の評価数、在庫・合法性・上限10000/depth24・例外/待機を維持した。旧テスト全文12905B・SHA256 1d335876…を既知patchの厳密逆変換で保持し、初回実測と完全一致を確認。初回TAP/host原本は無変更。

ブラウザー実行前に、graph経路のrouteAssessmentを書き込む製品保存契約へ新規fixtureの期待構築を補完した。旧helper・旧ケースは変更せず、別の自己完結helperを追加。保存値本文をアサーション失敗ログへ出さないよう、完全一致はメモリー内のbooleanで検査した。検査の削除・期限延長はない。

訂正後Nodeは2/2初回成功。3選択の実探索と3×5状態をまとめて検査。既存812群はsource資格を確認して再利用し、新規814群を局所実行したとは扱わない。

## 代表実操作と保持

| 代表 | 実操作 | 確認と限界 |
| --- | --- | --- |
| Chromium 1-3ナビ | 5412ms、retry0、探索3・切替2・保存1・reload1、6phase | normal空枠から配備→保存→CFJで既存配備再評価→normalへ戻す→reload→再探索前保存値比較→再探索表示 |
| WebKit 1-4 J回避編成内 | 8303ms、retry0、探索2・保存1・reload1、4phase | 空枠から配備→保存→reload→保存カードgear/未完了記録・保存値比較→同一新文書再探索 |

固定image digest b27e719e…、Node24.21.0、Playwright1.55.0、Chromium1187/WebKit2203、workers1/retries0、45秒/結果12秒を維持。通常一覧は実測C/W各938・82file、W339/164/251/184。導入済みcacheをread-only bindし、依存/image/browser/runtimeの大容量コピー・再導入は0。

保存の配備・理由・全文はafter-saveとafter-load-saved（新探索前）で比較。6艦の識別/順序・他編成・metadata・利用者目標・Night/air/drop sentinelを保持。11比較キーは意図差custom/route goalsの2＋他9不変であり、11不変とは記載しない。

Cの完了案は未完了用saved-searchカードを表示しない。再探索前はナビ保存元の見出しと保存raw保持を確認し、gear本文DOMは再探索後に確認。Wは再探索前の保存カードgearと未完了記録を表示確認。明示false/nullを成功へ変換していない。編集は再実行せず、既存の変更しない証拠を再利用する。全D確認済みへは格上げしない。

収集と独立readerは46原本/2plan/物理試行を照合しPASS_WITH_GAPS。gapは保持した初回Node失敗で、後の成功で補完していない。C/Wは各1回ともsourceExact・同試行metadata契約適合、pageerror/drop/missing0。trace/video/screenshotは0。保存不一致の陽性はなかったが、全保存安全性の証明へ広げない。

## 236セルと残件

28/172/36→**28/175/33**。1-3normal B/D・1-4J回避Bの3セルだけ未確認→一部。CFJはnormal保存済gearを保持して再評価した実操作で、空枠からの新規配備はNodeのみなのでB未確認を維持。J回避Dは既存一部へ同じ区分の証拠追加だけ。A/C/基準/59行/旧53区分は不変。

固定枠・実装備個体ID、他在庫・搭載不可/枠競合/情報不足の全実操作、全目標の十分性、新規編集、CFJ自身の空枠配備・保存操作は残る。targets-metを全経路固定・発動・撃破・勝利へ広げず、incompleteを不可能/購入必須へ換算しない。

通常smokeは最終sourceのpush後、同SHAの自動起動と照合して重複なく1回確認する。記録だけ追加CIは0。次はCFJ自身の空枠配備と2-2/2-3のNode-only範囲から共通の不足を選び、既存成功を繰り返さない。

前CI42951416369は既存資料だけでC936/0/0 W928/5/3・3成功3失敗/取消0を回収。10件load後click非表示/全文未到達とNight既知getter初回1件、3最終失敗を試行別保持し、旧根因/実値/5ログ欠測は未確定のまま。今回の成功で補完しない。

証拠専用領域：/workspace/harbordesk-handoff-_gnvlnto/continuation-one-area-finite-carrier-batch-20261112。private原本/shared許可metadataを分離、Gitへは製品/通常試験/記録だけ。PR152ドラフト・未公開、4-5隔離12件と別草稿、Night/掘り凍結、旧原本・main競合と保護対象を保持。main統合・PR151・版・SW・本番・マージ・公開・自動マージは行わない。
