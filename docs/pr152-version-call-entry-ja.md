# PR152: 版取得開始と文書/遷移のcall-only診断

基準d79df2b85bfff7a8303cf1bc1d37f2f322676b27、CI39527033334（必須5成功/1失敗、Chromium683初回成功、WebKit680初回成功/2再試行成功/1最終失敗）。回収済み初回/再試行資料とSWなし安定/遷移保留対照は再利用し、反復していない。原本保持。今回の変更はテスト診断/契約/資料のみ。製品SW・保存・取得処理・1200ms・版/cache/登録方式を変更しない。

## 計測と意味的範囲

空母夜戦保存の対象1ケースだけ、既存の初期化前にversionCallProbeをaddInitScriptで登録する。各新文書に独立して実行し、performance.timeOriginを既存Storage/native監査と同じ文書IDにする。scriptのload capture時にupdate-manager.jsの評価完了を検出し、hdCheckForUpdate/hdFetchLatestVersion/hdFetchVersionMetaをcall-only wrapperへ置換する。製品配信ソース自体の加工はないが、この対象文書のglobal関数identity/reflective name/lengthとstackは変わる。

wrapperはstrictな非async method。引数を先読み・String変換せずargumentsをReflect.applyで渡し、receiver、元の同期throw、返却Promise/オブジェクト同一性を維持する。結果へのthen/catch、fetch/タイマー全体/SWの置換、追加要求、結果待ち・遷移待ちを追加しない。親子IDは元関数が同期部分を開始する間だけ連携し、await後の継続まで親を引き継ぐものではない。

記録するのは開始、文書/timeOrigin/文書内at、API名/呼出ID/親ID、定型分類とsource行番号だけ。自動1200ms/明示操作、外部/localは現在の製品source行（484/356、31/32）とcallerの照合による。値・引数URL自体は読まないため、外部/localは**source callsite分類**であり内部要求URL/IDの証明ではない。任意query、保存値、認証情報、本文、返却結果は出力しない。

init/install記録で、文書ごとの設置時刻・設置API・window load後/completeの可能性を残す。initのみなら未設置、installが後なら設置遅れの可能性として扱い、呼出記録なしを呼出なしにしない。script再評価で関数が置換されればload時に再設置するが、同じwrapperは多重化しない。console配送自体の欠測は残る。診断配送の例外だけはカウントして元の関数呼出を継続し、製品例外は捕捉/除外しない。

既存reload-evidenceのNode performance受信clockへversion-entryを保存する。文書毎24記録、drop明示、DCL後の失敗や成功summaryでも保持。文書ID/atはStorage/nativeの同じ文書と対応する。Storage receivedAtのDate.now、Node performance、文書performance、browser trace時計を直接混ぜて減算しない。pageerror/公開requestに呼出IDやnative文書IDは追加できていないため、近接だけで個別内部要求との対応を確定しない。

stack採取・console配送・追加init scriptによるCPU/受信順の介入はある。Promise反応/worker寿命は追加しないが、無影響な観測とは主張しない。通常テストのpageerror検査は不変。

## 契約・開発時設定不備

新規6契約と変更した受信側の既存12契約、計18成功。receiver/元引数/返却Promise同一性、then不読取り、同期throw、拒否Promiseの正常consumerへの伝播、元関数の引数先読みなし、自動/明示caller分類、source callsite、文書別/遅い設置/多重化回避、配送不調時も元呼出維持、DCL後保持/上限/drop/秘密情報除外を確認。

最初の開発snapshotではstrict directiveとdefault parameterの構文不整合で2ファイルの読込みが失敗し、修正後に18契約を実行した。contracts.logとcontracts-fixed.logは別保存。ブラウザー/自然失敗と合算しない。

最初の対象configは完全タイトルに対するgrepを過剰にanchorして0件を選択し、ブラウザー試行なしで終了。target.config.cjs/target.log/target/summary.jsonをそのまま保持。別のselected-target.config.cjsで選択を直し、--listで1件を確認してから**実ブラウザーは1回だけ**実行した。これはfixture準備不備であり、製品の初回失敗や再試行ではない。

## 限定ローカル実行（各1回のSW比較ではない）

WebKit、元fixture、未加工SW、retries0、45秒。対象の実試行1件成功、再試行0、最終失敗0、pageerror0。追加反復なし。旧文書の版取得開始はreloadの約143ms前で、**遷移中開始/例外の自然再現は未確認**。成功を根本解決の証拠にしない。

|既存Node performance受信clock ms|doc / call|
|---|---|
|87 init / 444 install|旧doc1792557521548、3API設置、load前|
|6492 hdCheckForUpdate|旧doc、id1、自動timer callsite484|
|6492 hdFetchLatestVersion|同doc、id2、parent1|
|6492/6493 hdFetchVersionMeta|同doc、id3/4、parent2、外部31/local32 callsite|
|6635 reload要求|版取得開始はこの前|
|7001 init / 7302 install|新doc1792557528175、3API設置、load前|
|7385 DCL待機return|新文書|
|8117 六要素比較後 / 8344 方針復元|既存assertion成功|

旧callの文書内at6437/6438を、Storage pagehideの**同じ旧docのat**と照合可能。新initも同じdoc/timeOriginでStorageへ対応する。Node時計へ別時計のatを足して旧pagehide時刻を捏造しない。設置遅れ記録なし、version drop0、配送例外counter0（配送完全性の証明ではない）。新文書は設置確認ありだが、その自動timerが発火するまで通常テストを延長せず、記録終了後の呼出は未確認。

元fixtureは2非null/4未投入nullの6要素完全一致を維持し、全6非null試験と区別する。保存API/fixture/方針assertionの変更なし。明示更新確認はwrapper契約でcaller分類を検証した範囲であり、今回の対象で明示操作を追加したのではない。

## CIと証拠・未確定事項

新しい通常CIの対象SHA・最終集計はPR152冒頭へ記録する。この診断が有効なのは同specの空母夜戦1ケースだけ。通常CIの各自然試行でも同じ開始記録が残るが、小さいruntime navigation失敗条件を通常CIへ含めたものではない。

evidence: `/workspace/hd152-version-call-entry-20261021/`。事前protocol、契約ログ、0件選択の設定不備、selected-targetのlog/summary/reload JSON/Storage監査、local-analysis.json。成功のためlocal初回trace/videoは生成されていない。取得済み自然失敗の初回/再試行trace等は前rootへ保持し、新成功で欠測を補完しない。

原因が確定した製品欠陥の追加修正はなし。旧CIの自然なversion例外について開始文書/呼出しと例外/内部要求の直接対応は依然不足。小runtime navigation内部エラー/新SW関与、旧5実null、自然DCL、旧SW/通信/Cache API、Chromium重複宣言を別件として未解決維持。53例1/49/3、同期外15候補manual、5-6/iPhone実機/WebKit offline未確認。PR151未変更、PR152ドラフト/公開保留、マージ/公開/自動マージ有効化なし。

次の問い: 自然CIで旧docのversion entryがreload要求と旧pagehideの間に入るか。入った場合も、pageerrorにはdoc/呼出IDがない限界を併記し、取得開始の事実と内部失敗理由を分離する。
