# CFJ／2-2・2-3：有限配備の未確認部分をまとめた検証

2026-11-12 JST。起点4e2323b929c557651c3c2281fd491c263507058d／前回検証source4ecd1799。旧証拠・専用領域・保留を保持し、新worktreeで実施。製品の具体的な不備は見つからず、製品・保存処理の変更は0。通常UI試験3件と小型summary登録、限定記録のみを追加した。

## 1-5の既存資料と独立性gate

対象はCI43154691544、source4ecd1799、W4/job130971778255、1-5 ADFGJ unknownの初回。取得済み公式原文・compact・追加small route-summaryの同じrun/source/job/spec/state/member/retryだけを対応付けた。retryや別の成功で初回を補完しない。旧原本は変更しない。

期待した文書は、page.reload(waitUntil load)とhdReady待機を終え、診断設置関数の呼出しを通過した後、ナビを開く前にperformance.timeOriginをNode側docへ返した新reload文書である。比較はload-read内のperformance.timeOrigin===doc。期待値docと実際に比較したtimeOriginの実数値は、手元の取得済み原本には収録されていない。原本trace/実値JSONも未取得であり、値が同じ別試行から推測しない。

初回は再探索呼出し・load-readのevaluate戻りまで到達し、route-one-five-middle.spec.js:126:25のaggregate toMatchObjectで停止した。同試行のsummaryではsameDocument=false。customExact/sourcesExact/other/otherMap/otherPlanner/procurement、readyStateComplete/routeManual、計算されたidentity保持flagはtrueだった。ただしaggregateのmetadata/openingAswCount等は全て露出せず、識別実値/callerも欠測なので、失敗がsameDocumentだけとは確定しない。

aggregate以後のsamples件数・proposalRouteのassert、load identityの詳細assert、errors-emptyのassertとcompletedへの到達は未確認/未到達。既に計算されたsummary identity flagがtrueでも、後段の詳細assertを通過したとは記載しない。unknownは元入力の安全中止分岐であり、明示的な配備反映・memo編集は行っていない。保存消失・実文書切替・書込み成功回数は推測しない。

旧1-5の診断wrapperはhdWSApply/hdWSRevealElementを対象に、元this/引数/同期戻り値/例外をReflect.applyで保持しfinallyで上限64件を採取する。呼出し通過は確認できるが、reload文書への設置結果installed/failuresはassertされていないため正常設置済みやcaller採取済みとは扱わない。事前捕捉した関数参照、後からの置換、直接DOM/CSS、Promise後段の直接変更は観測外。失敗後のevaluate/snapshotは採らない契約である。

今回の有限配備helpersはこのinstallNavigation/snapshotNavigationを呼ばず、旧412680Bのtest prefix・1-5 spec/observer/製品を保持し、新top-level名の衝突やtest.use/describe.configure変更もない。boot・製品保存/ナビ・timeOrigin厳密比較の基本構造は共有する。この比較を緩和せず、旧1-5ヘルパーや製品を推測修正せず、新不適合を成功化しない条件で独立バッチを進めた。共通runtime原因を排除した証明ではない。

1-5当該操作は保留、旧Dの同定済直接証拠は維持。既存原本の解析だけで追加再現は0。次に必要なら、同じ既存load-readの戻りから未露出aggregateの判定boolと実際に比較した識別二値を採る案を別途判断する。追加Storage read/保存/reload/待機や、保存値本文の共有は不要で、今回は実施しない。

## 既存Node証拠と独立期待

既存one-area Node成功2群とtwo-area Node成功2群のraw footer・実plan・sourceを再確認し、現在の89 rootJS・共通fixture・各test本文が一致した範囲だけを再利用した。新規Node unit実行は0。これは今回UI/save/load成功の証拠ではない。通常CI Node814設定も変更していない。

| 対象と局所代表 | 入力/独立候補 | 期待する限定結果 |
| --- | --- | --- |
| 1-3/0/CFJ・Chromiumナビ | 飛鷹改/夕張改二特/DD4、空枠、九七式艦攻AA0装備1個、合法通常4枠/未配備含む5状態 | 装備1個・装備艦1、生成任意目標1。CFJを選択した空枠から新規配備 |
| 2-2/0/default・WebKit編成内 | 既知CV2/CA2/CL1/AV1、空枠、同装備1個、合法通常8枠/9状態 | 装備艦1、任意目標2は未達。残る艦の案内と在庫差を区別 |
| 2-3/0/default・Chromiumナビ | 既知BB1/CV2/CA2/AV1、空枠、同装備2個、8合法枠、独立ラベル単位73状態 | 装備2個を別々の空母2艦。任意目標2は満たしても他目標は別 |

2個のoracleは区別用ラベルの全配備56・別艦32を含む。ラベルは実装備個体IDではなく、探索結果を期待値へ流用しないための独立小集合である。製品が全73候補を網羅したとは主張しない。実装備個体IDと固定枠指定は入力にないため、その保護・実個体の重複防止は未確認。確認するのは有限stackと合法な配備先・重複枠なし・装備艦数である。

CFJの前回対照はnormal保存済みgearの保持で、新規配備はNode-onlyだった。今回は初回sourceが空枠であることを実比較したinitialEmptySourceExactを初回true、後続nullとして記録した。前回normal/J回避・2-1/2-4のUI成功は再実行せず、新3経路へ流用しない。旧2-x seedの2-1/else2-4 fallthroughは使わず、新規fixtureだけをmap別明示descriptorで構成した。

## 新しい実操作と保持

| caseId | 局所代表・初回 | 実操作 |
| --- | --- | --- |
| cfj-empty | Chromium、5241ms、retry0 | 空枠CFJ→配備→保存1→reload1→保存配備/理由/全文比較→同新文書再探索 |
| two-two-partial | WebKit、9817ms、retry0 | 空枠から1艦配備→不足を残す案を保存→同じ4phase |
| two-three-full | Chromium、4859ms、retry0 | 空枠から2艦へ配備→保存→同じ4phase |

全case検索2・選択切替0・保存1・reload1。workers1/retries0、45秒/結果12秒、探索上限10000/depth24・元の待機/取消/例外検査を維持。固定Playwright1.55.0 image digest b27e719e…/Node24.21.0/Chromium1187/WebKit2203を既存cacheのreadonly bindで使い、依存/image/browser/runtimeの大容量コピーや再導入は0。時間は各1回の試験所要時間で、性能改善の計測ではない。

4phase(initial/after-save/after-load-saved/after-load)の同試行で、有限在庫・合法通常枠・装備個数と装備艦数・配備と理由・保存全文・他編成/metadata・対象外データを直接比較した。after-load-savedは新探索前の保存値比較で、後の成功から初回を補完しない。11キーの実差分は保存customだけで、他10は不変。旧選択切替バッチの意図差2+不変9を転記しない。

CFJは登録比較目標targets-metなので未完了saved-record非適用。2-xは他の制空等が残りincompleteで、任意個数・装備艦数・数値制空・経路必須を別に扱う。2-2の任意2艦に対する1艦未達を、通行不成立・購入必須へ変換しない。2-3の任意2艦達成も全経路/連戦・発動・撃破・勝利の保証ではない。

WebKit編成内の2-2は再探索前の保存カードgear表示も確認。ナビのCFJ/2-3は再探索前gear本文DOMを確認したとはせず、保存raw全文と再探索後配備表示を分けた。family/caseId別の明示false/nullは成功へ変換しない。新編集は再実行せず、Dは一部のみとする。

新3ケースは各初回physical passed、sourceExact、各4phase、sameDocument全到達phase true、pageerror/drop/missing0。46原本と実plan・対照sourceを別実装のreaderで照合しlocal PASS。今回3ケースの成功で旧1-5の識別値欠測や他の失敗を補完せず、一般保存安全性も保証しない。原本はprivate、sharedは型付き許可metadataだけ。trace/video/screenshot0、保存値本文はメモリー内で完全比較する。

## 登録・セル・残件

実preflightはC/W各941・82file、WebKit339/164/254/184、C/W×caseId3のtargetMatrix6が各selected1。これは同じnormal --list原文による登録確認で、追加browser実行や反対側browser成功ではない。通常smokeは最終sourceの通常push後、同SHA自動起動と照合して重複なく1回要求した。確定結果は後段に記載する。記録だけで追加CIを起動しない。

28/175/33→**28/180/28**。CFJ B、2-2 B/D、2-3 B/Dの5セルだけ未確認→一部。CFJ Dは既存一部へ追加証拠で変更0。A/C・旧1-5D・定義236/59行/旧53は維持。一部を50%換算せず、未実施browserや全条件へ流用しない。

全在庫/全艦・未知情報・固定枠・実装備ID・一般探索の網羅性/最適性・全目標十分性・新規編集は残る。次候補は3-2選択別の有限電探装備艦数/速力セット配備と保存/loadを共通単位で、既存証拠との差だけ静的確認する。

旧CI43154691544はC937/1/0 W926/7/5・3job成功3失敗/取消0、旧target4初回成功、旧1-5文書識別不適合と欠測を別保持。今回のCIを旧単独バッチ結果や旧欠測の補完には使わない。夜戦/掘り/1-5保留、4-5隔離12差分・別草稿・原本・main競合を保持する。

証拠専用領域：/workspace/harbordesk-handoff-_gnvlnto/continuation-finite-carrier-gap-batch-20261112。PR152はドラフト・未公開。main統合・PR151・版・SW・本番・マージ・公開・自動マージは変更しない。

## 最終sourceの通常smokeと残す欠測

source **ab81d0c5d094a0c4191ac831ed9399b144b8fed4**、[CI43228941365](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/43228941365)。同SHAのrun一覧2回とbranchを照合し、未受付を確認して通常smokeを1回要求、再実行0。smokeはC1/C2/W1成功・W2/W3/W4失敗、取消0。C940/1/0・W916/15/10は各941 logical例のpassed/flaky/failedで、初回成功数・物理試行数へ換算しない。

| caseId | Chromium | WebKit |
| --- | --- | --- |
| cfj-empty | 初回passed・4phase保持適合 | 初回passed・4phase保持適合 |
| two-two-partial | 初回passed・4phase保持適合 | 初回passed・4phase保持適合 |
| two-three-full | 初回passed・4phase保持適合 | 初回passed・4phase保持適合 |

対象6はcaseId/browser/retry/sourceを対応付け、各保存直後・reload後再探索前・再探索後の配備/理由/全文/対象外データと同一文書を確認。critical false・missing/drop/pageerror0。局所3例は別証拠とし、CI全体の成功へ広げない。セルは自経路の限定証拠による5遷移だけで28/180/28を維持する。

11 small ZIP（435,850B/91members）は公式digest/size/CRC一致。C2 prerequisite-import（4,873,759B）は2MiB上限超で未要求、split/大ZIP fallbackなし。36件のnonpass物理記録を同試行で分類：load後再探索click待機13、load後末尾pageerror配列2、DCL pageerror配列3、safe-abort aggregate1、Night load後6キーaggregate1、layout診断null1、最初の操作未特定15。個別例外本文18件欠測、複数の異なる注記のerror順も不明を保持する。同じ段階を同原因とは扱わない。

独立CI照合はPASS_WITH_GAPS。監査bindingのscope参照が説明文字列で上書きされていたため、原binding/旧reader/初回監査失敗を保持し、開始前にhash固定したbeforeReview内の同じscope資料を実file/bytes/hashで照合する限定v2 readerへ訂正した。絶対/相対パスは同じ解決済みファイルへ正規化した。canonical/shared/試験結果と原本は不変、新試験・CI0。

### 新しいNight load後保持の懸念を別保留

同CI W4/job131219362652、submarine night policy、testId60c90c2ba9dde6a78d19-8e16765ad72c8efe9ca1の初回はnight-policy-reload.spec.js:144:88で停止。文書比較142とreadyState143は通過し、load後の先頭6キー完全一致aggregateが失敗した。対象はcustom-fleets/equipment/ship-roster/fleet-calculator/kancolle-sync/pwaの6キーで、専用helperが実getItem文字列/nullをNode memory内のpost-selection baselineと直接比較する。

不一致キー・各exactMatch/実値・個別例外本文は欠測。夜戦方針自体の第7キー完全一致145、最終選択policy146、末尾例外147は未到達。retry成功で初回を補完せず、旧初回getter懸念とも同原因にしない。保存破壊・製品欠陥は未確定のまま、Nightの当該load後保持操作を追加保留する。

有限配備とgeneric Storage/boot/reloadは共有するが、専用Night選択UI・専用Node binding比較helperは今回使わない。対象6例の保持成功はこの初回の欠測や一般保存安全性を解消しない。確実にverdictを含む小型artifactは確認できず、大容量diagnosticsは取得せず打切。次に必要な観測は同じ初回の6キー別present/length/exactMatchで、不一致キーを識別する1点。既存資料または別途選択する限定観測で期待した変更かを判断できることが再開条件で、新規診断・再試験・推測修正は0。

### repair故障注入のsafe-abort検査も未確定として分離

同CI W2初回の`identity repair roster throw stops writes and recovers through the real button`はdiagnostics-repair-storage.spec.js:68のfault aggregateで停止した。故障clickとverdict採取は返却したが、writes空/完了0/全体・他キー完全一致/own/warningという期待のどの項目が不適合かと個別例外本文は欠測。recovery操作は未到達、reload0。書込み発生・保存不一致・原因は確定せず、retry成功で初回を補完しない。当該roster-throw故障注入の修復/safe-abort確認を追加保留し、次の観測は同初回fault verdictのフィールド別判定1点とする。

今回有限配備は専用repair入口と故障注入helperを使わない。generic Storage/custom/rosterは共有するため一般原因を排除したとはせず、自経路の実比較と独立した読取りだけを続ける。保存比較不適合を正常化する修正や追加再現は行っていない。

旧1-5・Night getter・掘り・4-5隔離12件と原本を保持する。次の3-2有限電探装備艦数/速力セットは独立読取り設計までで、新実装/操作は未実施。記録追補は別commitとし追加CIを要求しない。PR152ドラフト・未公開、保護対象は維持する。
