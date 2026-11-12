# 1-3 normal/CFJ・1-4 J回避：有限攻撃機配備の限定確認

2026-11-12 JST。起点87c8f053、旧記録5962c77b／検証source00927721からの証拠整理を閉鎖後、専用領域で実施。製品コードの具体的欠陥は見つからず、製品変更は0。

## 既存証拠との差と入力

既存のstock0案内・参照表示を、新しい実配備成功へ流用しない。対象は1-3/0/normal、同CFJ、1-4/0/j-avoid。登録出典・分岐範囲を再利用し、低速対応・DD4・1-4潜水母艦の区別と初期分岐ランダムを維持した。

共通は飛鷹改1、空通常枠、九七式艦攻★0・AA0を装備1個。1-3は夕張改二特＋DD4、1-4は大鯨＋DD4。既知マスターのtype8許可・通常4枠18/18/18/12を独立確認し、未配備＋4配備先の5状態、最大1機/1艦を期待値とした。探索結果を期待値へ写していない。

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

収集と独立readerは46原本/2plan/物理試行を照合しPASS_WITH_GAPS。gapは保持した初回Node失敗で、後の成功で補完していない。C/Wは各1回ともsourceExact・同試行metadata契約適合、pageerror/drop/missing0。trace/video/screenshotは0。この局所C/Wで保存不一致の陽性はなかったが、全保存安全性の証明へ広げない。

## 236セルと残件

28/172/36→**28/175/33**。1-3normal B/D・1-4J回避Bの3セルだけ未確認→一部。CFJはnormal保存済gearを保持して再評価した実操作で、空枠からの新規配備はNodeのみなのでB未確認を維持。J回避Dは既存一部へ同じ区分の証拠追加だけ。A/C/基準/59行/旧53区分は不変。

固定枠・実装備個体ID、他在庫・搭載不可/枠競合/情報不足の全実操作、全目標の十分性、新規編集、CFJ自身の空枠配備・保存操作は残る。targets-metを全経路固定・発動・撃破・勝利へ広げず、incompleteを不可能/購入必須へ換算しない。

通常smokeは最終sourceのpush後、同SHAの自動起動と照合して重複なく1回確認する。記録だけ追加CIは0。次はCFJ自身の空枠配備と2-2/2-3のNode-only範囲から共通の不足を選び、既存成功を繰り返さない。

前CI42951416369は既存資料だけでC936/0/0 W928/5/3・3成功3失敗/取消0を回収。10件load後click非表示/全文未到達とNight既知getter初回1件、3最終失敗を試行別保持し、旧根因/実値/5ログ欠測は未確定のまま。今回の成功で補完しない。

証拠専用領域：/workspace/harbordesk-handoff-_gnvlnto/continuation-one-area-finite-carrier-batch-20261112。private原本/shared許可metadataを分離、Gitへは製品/通常試験/記録だけ。PR152ドラフト・未公開、4-5隔離12件と別草稿、Night/掘り凍結、旧原本・main競合と保護対象を保持。main統合・PR151・版・SW・本番・マージ・公開・自動マージは行わない。


## 2026-11-12 JST：通常CIの確定結果と別件保留

検証source **4ecd179907e91731c8bf4c38bc3b0289b43fb21c**／[CI43154691544](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/43154691544) attempt1。通常push後に同SHAの自動起動0を2回照合し、smoke要求1回・再実行0。C1/C2/W2 job success、W1/W3/W4 failure、取消0、Full skipped、run failure。

公式passed/flaky/failedは **C937/1/0、W926/7/5**。各938例/82fileの完了をcompactと照合した。logical集計を厳密な初回成功数・物理試行数へ換算しない。Nodeゲートは6job成功、実測Node patchはv24.21.0。814は通常設定値であり、CI数値footerは未採取。CI registryの実pull digestも独立取得したとは記載しない。

今回対象2タイトル×C/Wの4試行は全てretry0 passed。navigator6/inline4phase・保存配備/理由/全文の再探索前比較が同試行で適合、criticalfalse/pageerror/drop/missing0。navigator完了案のカード非適用false、inlineカード適用true、他phaseの未実施nullをそのまま扱う。CFJ controlは既存配備の保持で、新規CFJ配備Bへは加算しない。

非成功18物理試行は、load後search-click非表示12、pageerror末尾比較3、後続reload navigation停止1、load後aggregateの文書識別不一致1、操作位置欠測timeout1に分類。個別詳細例外が欠測の3試行、raw実値JSON未採取18、hidden表示変更元12の欠測を保持する。

最終失敗5 logicalケースは、WebKitの7-1 DEGHK ready、7-5第1ABDFGHK stock、5-5 BKPS exempt、同readyのload後クリック非表示（各初回/retry）と、carrier bomber CIの末尾pageerror比較（初回/retry）。前者の後段全文比較は未到達、後者は同試行のgetter復元比較後の外部access-control例外検査で停止した。旧cv-three/cv-fighter2 getter不一致を今回解決したとは扱わない。Cのsortie初回は後続boot/navigation段階で停止しretry成功。6-5ready初回timeoutの正確な操作位置は欠測。いずれも保存破壊や今回との因果を推測しない。

### 1-5 unknown初回：当該操作を保留

同CI/W4/job130971778255/testId735200b5db9b4482d896-f143ddd0985ea38f3445/retry0は、route-one-five-middle.spec.js:126:25のload後aggregate比較で停止。unknownの安全中止経路で、配備反映・memo編集は行っていない。load-readには到達しており、非表示クリック未到達とは別経路である。

既存の追加small route-summary 1件を同run/source/job/member/retryへ対応付け、初回の **sameDocument=false** を確認した。これはperformance.timeOriginと先に採取したdocの完全一致比較であり、実際に文書が切り替わったとの断定ではない。初回のcustomExact/sourcesExact/other/otherMap/otherPlanner/procurement、readyStateComplete/routeManual、identity比較はtrueだった。保存全文・露出した保持項目の不一致陽性は確認していない。

一方、aggregateのmetadata/openingAswCount等はsummaryへ全て露出しておらず、timeOrigin実値・変更元も欠測。sameDocumentだけが失敗原因、保存安全性、データ喪失とは確定しない。retryのsameDocument=true/成功は別試行として保持し、初回の欠測を補完しない。summary自体にはsource/run/testId/retryの自己束縛がなく、公式artifactと一意のspec/state・通常/retry1 member directory・compactによる対応付けという限界を明記した。

独立レビューでは、旧known/stock保存編集・unknown安全中止の6代表や追加代替の直接証拠を無効にする根拠はないため、1-5/1 Dの既存確認済みを機械的に格下げしない。ただし今回の当該操作は成功にせず保留し、行の残件へ追記した。今回3セル変更とは別で **28/175/33を維持**する。

次に必要な観測は、既存load-readの戻り値から未露出のaggregate期待項目を、集約assert前に許可boolとして残すこと。追加Storage read/保存/reload/待機は不要だが、今回は実行しない。製品の保存処理は0変更である一方、共通経路の間接影響や原因を否定する証拠でもない。推測修正・追加診断・成功目的反復は行わない。

### 回収・閉鎖

terminal原文3、公式注記6、主small12ZIP（453697B/88members）を公式size/digest/CRCと照合し、canonical/sharedの独立readerはPASS（CI自体はfailure）。追加W4 summaryは14838B/16membersとして別領域へ保持し、主12のsealed collectionは変更していない。rootの独立読取りも初回/retryの分離・露出bool・公式source/run対応を照合しPASS_WITH_GAPS。

W4の同文Run Summary2コピーは同じjobの本文完全一致を確認して1論理注記とし、原本2件を残した。非TTY転送準備のEOFはURL投入前/GET0として別記録し、専用TTYのecho無効を確認後にstdinだけで受け渡した。URL/token/保存値本文は共有せず、各File Service GET1・connector再要求0、資格情報変更0・原本sanitizer実行0。

証拠は専用領域のprivate/ci-4ecd1799-v1/、shared/ci-results.json、private/ci-review/。最終manifest/独立照合はこの記録pushとwriter停止後に別保存し、確定結果をPR現状欄へ記載する。記録だけの追加CI/ブラウザー0。CFJ空枠/2-2・2-3の計画はprivate/next-batch-preparation/plan.jsonへ保持し、今回の保留を欠測回収だけの新実験へ広げない。
