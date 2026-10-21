# PR152: 初回update抑止＋文書破棄＋後続newPageの未確認条件

基準 `cb4a69446eb25bc648845c978e1cde60f5cb2b15`。
製品・SW・保存形式の変更なし。PR152ドラフト・公開保留、PR151未変更。
マージ・公開・自動マージ有効化なし。保存実nullは最優先の未解決として維持する。

## 再利用と差分

前回[文書保持／破棄比較](pr152-initial-document-ja.md)のupdateあり＋保持成功と、
updateあり＋破棄の登録12秒不成立を比較基準として再利用し、再実行していない。
過去のreload＋初回update抑止成功は抑止機構の参考であり、newPageの成功証拠に代用しない。

既存`initialUpdateFixture`をtrueで呼び、初回ソースの定数false→trueだけを変える。
後続ソース・HTML・他入口は前回とバイト一致。登録URL/scope・SW本文・実資産・server/MIME/
no-store・phase切替・close→同じcontext.newPage→gotoの順序・ready処理は維持する。
後続ソースはsuppress=falseで、初回だけ明示updateを抑止する。
register等によるブラウザーの自動更新まで無効化した意味ではない。

Node側の初回ゲートだけを抑止値に対応させる。既定falseの旧ゲートは維持し、trueでは
同一文書/callのawait-resumed→registered-assigned→explicit-update-site→
explicit-update-suppressedを要求する。存在しないupdate-expression-returnedは待たない。
追加Promise反応・決着待ち、fixed sleep、SWラッパー、保存操作は加えない。

初回ソースSHA256 `3ba6281836337222b57c99d96de27d448b3192387928df9c804b29433a8ceb1d`。
前回call側との違いは抑止定数1値のみ。
後続は前回と同じ `3509bc84f98be6f3d6059c0f3539acd965e03f922eb7dc92ee77df5453dba8df`。
配信前ソース・hash・runner差分・実行前protocolを保持した。

## 契約と限定実行

変更ゲート8件＋既存抑止機構6件、計**14契約成功**後にブラウザーを実行した。
抑止markerでの完了、返却markerとの取り違え拒否、同じ文書/call/phase/policy、
旧falseゲート・共通newPage経路・例外伝播・失敗記録、初回だけ0回/後続はupdate有効を確認した。

WebKit26.0/revision2203、Playwright1.55公式既存image/Ubuntu24.04/Node22.18.0を再利用。
同じ127.0.0.1:4188、新規隔離context、初回/後続はcontext共有。
新しい「close with initial update suppressed」だけをgrep選択し、**1回、retries0で終了**。
旧保持/破棄条件は未実行。登録12秒・初回ゲート12秒・全体45秒・既定poll・元例外検査を維持した。

結果は**初回成功1、再試行0、最終失敗0**。本文1.337秒。

- 初回: await継続→registered代入→update-site→suppressedを同一文書/callで確認。
  初回のupdate-expression-returnedはなく、正しい抑止ゲートで準備成立。
- close完了後に同じcontextでnewPageを生成し、後続の共通phase/suppress=falseを確認。
- 後続: register-before/同期返却→await-resumed→registered代入→元update式同期返却。
  1pollでready/complete、元pageerrorゼロassertも成功。
- SW serverは版付き2要求を受付→200 finish→正常closeで記録。
  nativeジョブIDはなく特定のregister/updateへの同定やブラウザー本文読了の証明ではない。
- 初回/後続の境界・状態・server・配送の記録drop/不正/evaluate例外は0。
  drop0だけで一般的な欠測なしとはしない。

## 結論と限界

前回updateあり＋破棄はregister-returnedまでで15poll registering、今回初回抑止＋破棄はready。
**このnewPage・破棄条件でも、初回updateの実行／抑止に伴う差を観測した。**
旧条件は別時点の各1回で、同時の対照・反復・順序相殺ではない。
実行環境変動、close/newPageの時間差、native登録/更新内部段階を排除していない。
初回updateの必要十分性、自然な製品障害の根本原因、native Promise pendingは断定しない。
update削除・登録統合・状態強制などの製品修正は行わず、**この結果で比較を終了する**。

原本 `/workspace/hd152-suppressed-close-20261021/`。
protocol-before-run、source-comparison、served-fixture、source-at-execution、契約/実行ログ、
summary、初回trace1・動画2・初回/後続境界JSON・結果JSON・comparison-analysisを保持。
成功なので失敗画像/error-contextはなく、retry資料もない。
旧比較のmanifest140ファイルはhash変更0、製品153ファイル・node_modulesリンクも維持。

通常CIはpush後の同HEADで確認し、最終結果をPR冒頭と外部証拠へ記録する。
通常CIの緑で旧CI外登録待機・runtime navigation失敗を解消扱いにしない。
必要CIで保存実nullが自然再発すれば、その原本保護と既設境界の解析を優先する。
load後の完全一致検査と既設保存診断は変更しない。

旧5/空母2キー実null、自然DCL停止、navigation内部エラー/現SW関与、通信/SW/Cache API例外、
Chromium重複宣言は別件で未解決。iPhone実機/WebKitオフライン/5-6は未確認。
53例1/49/3、同期外15候補manual、攻略探索保留を維持する。
