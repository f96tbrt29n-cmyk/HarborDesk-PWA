# PR152: 再読込のload後まで保存回帰を確認

基準 `c41ad002d52261e9f68eca30f521818d7eeb4234`。
前回CI `39599036404` の回収結果と原本を再利用し、再取得・再実行していない。
PR152はドラフト・公開保留。PR151、製品コード、SW、保存形式、登録方式は変更しない。

## 確認できた検証範囲の不足

空母夜戦ケースの従来の順序は、再読込DCL → 方針復元 → 保存6要素の完全一致 →
方針復元マーク → pageerrorゼロ → 診断終了だった。loadを待つ処理はなかった。
診断終了は既存の受信済み記録を保存し、ブラウザーを追加評価せずlistenerを解除する。
よって、診断へload通知がないという事実だけで、終了瞬間のブラウザー状態は断定しない。
一方、原本の同一文書snapshotは、**実際の保存検査の前後がinteractive**だったことを示す。

| 前回CI / 新文書 | 保存比較直前 / ms | 比較後マーク / ms | 当該記録の状態 |
| --- | ---: | ---: | --- |
| Chromium 空母 / 1792585391248.5 | 950.3 | 981 | どちらもinteractive |
| WebKit 空母 / 1792585388590.0002 | 441 | 459 | どちらもinteractive |

時刻はそれぞれの文書のperformance.now。別文書やNode時計とは減算しない。
complete/loadは両空母の採取範囲では未観測であり、配送欠測の可能性も残る。
コード上もload後の検証保証がなかったため、検査の早期終了という不足を補う。

PWAも同じ保証がなかった。前回Chromiumでは比較前にloadが記録されたが、WebKitでは
比較直前713msはinteractive、load756ms、プラン確認後788msはcompleteだった。
後者のcomplete snapshotは長さ/hashであり、load後の文字列完全一致assertの代わりにはならない。
そのためPWAにも同じ最小補完を行い、既存成功例の反復はせず通常CIで確認する。

## テスト変更

- 元のDCL後の保存・方針・例外検査をすべて残す。
- DCL後の文書timeOriginとURLを保持し、`waitForLoadState('load')`後も同一であること、
  `document.readyState === 'complete'`を確認する。既にload済みでも正しく進む。
- 空母は再度6要素の文字列完全一致、`cv-fighter2`、既存pageerrorゼロを確認する。
  元fixtureは投入2キー非null・未投入4キーnull。6要素一致を全6キー非nullと表現しない。
- PWAは元のオフライン/オンライン条件のまま、投入5キーの完全一致と先制対潜目標4、
  司令部Lv20、所持艦整合を再確認してからonlineへ戻す。新しいpageerror検査は導入しない。
- 既存マークと安全な比較結果の添付のみを使う。保存値本文を新たな添付へ出さない。
  監視機構、timer、sleep、networkidle、失敗後evaluate/storageState、復元処理は追加しない。
  全体45秒、既存の個別期限、元のアサーションを維持する。

load未到達はload待機の失敗、保存不一致・方針不一致・pageerrorはそれぞれ別のassert失敗として残る。
失敗した後に検査を進めたり、証拠を追加読取りしたりしない。

## 限定実行（各1回・retries=0で終了）

既存の公式Playwright v1.55.0-noble imageと依存リンクを再利用。
WebKit26.0 / Chromium1187、Node22.18.0、Ubuntu24.04。通常CIのNode24との差は残る。
元の未加工SW、fixture、mobile viewport、trace設定を維持し、Chromium → WebKitの順で各1回。
最初の選択用grepは完全修飾テスト名に一致せず本文0件だった。選択指定のみ訂正し、
この資料を試験準備不備として保存した。製品失敗や実行済み試験の再試行には数えない。

| engine | 初回成功 | 再試行 | 最終失敗 | 本文時間 | 同一新文書のload / ms | load後比較マーク / ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Chromium | 1 | 0 | 0 | 15.177秒 | 5950.6 | 6450.1 |
| WebKit | 1 | 0 | 0 | 11.026秒 | 4010 | 4105 |

両方で元の検査時はinteractive、追加の検査時はcomplete。文書同一性、6要素完全一致、
方針、pageerrorゼロを確認した。投入2キーは非null、未投入4キーはnullのまま。
script-error境界は設置済み・発火なし。Storage drop=0。自然な保存異常は観測しなかった。
成功試験のtrace/videoはretain-on-failureにより残らず、JSON report・監査・要求記録・
サーバーログと比較結果を保持した。初回失敗traceが存在するかのように扱わない。

これは**確認範囲をload後へ拡張して成功した結果**であり、旧保存実nullの解決ではない。
通常CIはこの変更のcommitに対して確認し、最終SHA・内訳はPR冒頭と外部証拠に記録する。
限定2実行と通常CIの件数を合算しない。緑のCIを全ページ例外ゼロと表現しない。

## 原本・残件

今回 `/workspace/hd152-carrier-post-load-20261021/`。
`protocol.json`、`baseline-ending-analysis.json`、`limited-results.json`、各engineのresult/audit/
reload JSON・server log、変更前後ソースを保持。
前回 `/workspace/hd152-dual-storage-boundary-20261021/` のmanifest102ファイルを照合し変更0。
製品・設定等の既存153ファイルのハッシュも変更0。node_modulesのsymlinkを維持。

旧5キー実null、空母2キー実null、潜水艦DCL停止、登録待機、navigation内部エラー、
SW/通信/Cache API例外、Chromium重複宣言は別件の未解決として保持する。
実機iPhone、WebKitオフライン、5-6は未確認。53例1/49/3、同期外15候補manualを維持。
登録update比較・攻略探索は保留。マージ・公開・自動マージ有効化は行わない。

次の問いは、通常実行で保存異常が自然発生した場合、同一文書の最初のscript-errorが
load後の完全一致検査より前か後か、その時点の投入キーが非nullか実nullか。
既設診断で照合し、自然再発を得るだけの反復や新しい診断追加はしない。
