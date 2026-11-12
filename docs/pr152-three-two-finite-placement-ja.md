# 3-2：有限電探装備艦数と同艦内速力セット

2026-11-13 JST。基準e956db13d6c6b28b06b68be9a2e14e327d9effb4。新専用worktreeで、既存の案内成功と新規配備・保存の不足分を分けた。具体的な製品不備は確認せず、製品・保存形式・期限・探索条件・SW・版を変更しない。追加はNode1ファイル5検査、既存UI末尾2例、通常登録と小型summary回収、限定記録。

## 適用条件と独立した有限期待

既存の登録出典と分岐・速力表を再利用した。通常は軽巡1＋駆逐5または駆逐6の登録条件を扱い、速力/電探装備艦の一律要求を追加しない。H回避は全艦rank15以上＋電探装備艦1隻、CEFL/CGFLの候補で、最速rank20以上＋電探4艦のCEFL固定と別条件。電探2個を同艦へ載せても1艦。経路条件、戦闘推奨、発動資格・率・勝利を別にする。[既存根拠と範囲](route-3-2-verification-ja.md)。

| 入力/対照 | 独立した小集合・限定期待 |
| --- | --- |
| 通常index0・夕張改二特＋駆逐5 | 通常20枠、既存魚雷2を同艦に保持、電探1 stack。合法空18枠＋未配備1＝19状態。電探1個/1艦、任意目安1、速力必須なし |
| H回避index1・駆逐6 | Ташкент改4枠＋他5艦3枠。既存T5/新缶6/魚雷2、在庫T6/新缶6/魚雷2/電探1、★0・増設なし。空6枠のT/R追加43状態・同時配置30・H条件witness10 |
| 速力6艦成立から電探追加 | 空5枠＋未配備＝6状態、電探を追加するwitness5。成立済み速力を維持 |
| 電探1艦成立から不足T補完 | 空5枠＋未配備＝6状態、最後の同艦Tを補うwitness1。成立済み電探艦数を維持 |

候補ラベルは数え上げ用で実装備個体IDではない。fill-only部分集合の存在/上限を示し、元装備をfixed/lock指定したものでも、製品が全候補を網羅した証明でもない。通常inventory/master/type/slot exclusionsの生データから搭載を確認し、slotIndex重複、既知大型電探の搭載不可、stock0、未知艦、beam-limitを別に検査する。

Hの初期速力は20/20/15/15/15/10で、補完後は全艦15以上。HAの★7新缶代替も含めた生成turbine目標下限は4で、今回★0入力で使うT6/缶6と異なる。実配備数を全般的な必須数・購入数にしない。radar-for-required-turbineとturbine-for-only-radarの悪い合法交換をregressionとして拒み、空き枠の合法controlを認める。利用者指定電探2個の保持も別検査。

## 初回期待不備・採取不備と訂正後Node

初回Nodeは5検査中4成功/1失敗。5contextは全採取したが、group2のnormal0 complete期待で停止し、その後のH固有assertは未到達。後の成功で初回のassert通過へ補完しない。通常の枝判定・電探配備・魚雷2・stock/合法性は採取できた一方、未選択制空参考値が追加されて4目標・未完了だった。

独立rawデータではHは0、全海域最大は経路外Kの56。hdFCMapEnemyAirCandidatesは海域全体を候補にし、未選択のnormalは56×1.5＝84を参考値としてmanual/unresolved/strategyに残す。H回避/最速だけairNotRequiredへ接続され、normalの図の説明文だけではこの参考を消さない。hdOCShortageGoalsはunresolvedを調達不足から除外し、未選択airは探索継続対象から除外する。根拠なく0・充足・確定不足・購入数へ変換せず、現在の未選択/利用者指定を保持する期待へ訂正した。normalの制空非適用・利用者選択との接続改善は今回推測実装しない。

初回Node24の既定reporterはspecで、実ℹ footer5/4/1を旧controllerのTAP専用parserがnullとして残した。元stdout/controller/終了1を保持し、独立readerで元specを再導出する。次回はTAP reporterを明示し、具体的な期待訂正後に関連5検査を1回だけ再検証して5成功/0失敗。製品・入力・上限10000/depth24を変えず、通常のair84未判定/shortage除外とH12成立を検査した。旧Node7は当時のソースと異なるため歴史的境界根拠のみで、現ソースの新規成功へ加算しない。

actual default searchはnormal0=38、normal1=18、H両欠=405、速度成立済73、電探成立済73の候補評価を各試行で記録した。Hはtargets-metでもbeam-limit理由・exhaustive:falseを保持し、最適/全探索とはしない。normal1はNode-onlyでnight装備不足と参考制空未判定/beam-limitを残し、UI/saveの成功へ流用しない。

## 代表C/Wの配備・保存・load

固定image digest b27e719e…・Node24.21.0/PW1.55.0/C1187/W2203、worker1/retry0、45秒/結果12秒。既存cacheをreadonly bind、single container lock、導入/pull/依存コピー0。Chromium normal-navigatorとWebKit fastplus-inlineを各初回で完了した。各検索2/保存1/reload1、選択目標切替0/新編集0。entryの海域・経路・艦隊選択は既存helperで行う。

各同試行4phase(initial/after-save/after-load-saved/after-load)で、有限配備・合法枠・電探個数/艦数・Hの同艦T/C、保存配備・理由・全文・個体順/他編成metadataと対象外データを直接比較。after-load-savedは新探索前の保存値比較。11rawキーはcustom1だけ意図差・他10不変、Night raw6との共通は5キーで、fleet-calculatorはparsed own/他planner比較という別範囲。全保存キーraw完全保護とは称さない。固定枠/実装備個体IDは入力になく保護未確認。

通常は参考制空の未判定を含むincompleteで、保存理由markerを保存直後と同一reload文書load後に確認。初回保存理由と、再探索後の現理由（候補評価0でair待ちだけになり得る）は別に保つ。Hは12目標充足、incomplete保存marker非適用false。ナビの再探索前gear本文DOMは未確認でraw配備を照合、inlineはgear DOMも確認。false/null/非適用は観測成功へ変換しない。

50原本・旧新2planとNode/UI原文版を独立照合しPASS_WITH_GAPS。gapは初回Nodeの不合格とcontroller counter不一致で、今回UI2は各4phase・sameDocument全true・missing/drop/pageerror0。新規保存不一致は観測していない。原本private、sharedは型付き許可metadataのみ、trace/video/screenshot0、sanitizer/保存値本文の共有0。

## 登録・進捗・保留

同じnormal --list原文からC/W各943/82file・WebKit339/164/256/184・2case×C/W4が各selected1と確認。これは登録で実操作成功ではない。通常Nodeは既存814配置＋新5＝819/27fileで、局所に既存814を再実行していない。最終sourceの通常push後に既存runと照合してsmokeを重複なく1回確認し、記録だけで追加CIを起動しない。

28/180/28→28/184/24。3-2/0/normal B/D、3-2/1/fastPlus B/Dの4セルのみ未確認→一部。A/C・normal1・最速・定義/236/59行/旧53は不変。全装備/全在庫/全目標・新編集・iPhone実機・最適性は未確認。

既存CI43228941365（検証source ab81d0c5）のNight W4・submarine night policy初回は、night-policy-reload.spec.js:144で停止。文書/readyState比較後のload後6rawキーaggregateで、どのキーか欠測、続く専用policy145–146/末尾例外147は未到達。同CI W2・identity repair roster throw初回はdiagnostics-repair-storage.spec.js:68のfault aggregateで内訳欠測、recovery未到達/reload0。retry成功から補完しない。既存資料だけで分類し、保存消失や共通原因を断定しない。専用Night選択/Node binding/repair fault helperを3-2は使わないが、generic Storage/boot/reloadと5rawキー等は共有する。再開には各同初回verdictで不一致キー/項目を識別する観測1点が必要で、追加再現/診断は0。旧Night getter、1-5識別二値/caller欠測、掘り、4-5隔離12件・別草稿・原本を保持する。

次候補は3-5上BDHK／5-5中央下BFDHNOSの有限索敵装備配備・保存/loadを共通単位で読取り設計。33式/HQ/ボーナス不足は別の未判定を保持する。海域全体完了へ広げない。専用証拠領域は`/workspace/harbordesk-handoff-_gnvlnto/continuation-three-two-finite-radar-batch-20261113`。

PR152はドラフト・未公開。main統合、PR151・版・SW・本番、マージ・公開・自動マージは変更しない。
