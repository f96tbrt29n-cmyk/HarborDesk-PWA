# PR152: 初回update文書の保持／破棄と後続newPageの限定比較

基準 `579cef6cc14c9bd56fca20a075229ca3da1a6d2a`。製品・SW・保存形式の変更なし。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。
保存実nullを最優先の未解決として維持し、load後完全一致・既設境界診断を変更しない。

## 再利用と今回の問い

- `57c329b`: B版付き単独でも再読込後register-returnedまででregistering継続。
  二経路の同時登録がこのfixtureの失敗に必須ではなかった。製品原因の確定ではない。
- `d2ae01b`: 初回の明示updateありは失敗、初回だけ抑止は成功。
  初回update地点は両方到達済み。ただしnative updateの決着は直接観測していない。
- 上記各条件・内部記録探索・保存補完の成功試験は再実行しない。

今回の問いは、**初回update式が同期返却した文書を残すか閉じるかに伴い、
同じ方法で開く後続newPageの登録完了に差が出るか**。
旧比較はreloadだったため、この問いへの既存の実行証拠はなかった。

## 実行前に固定した条件

`initial-document.experiment.cjs`は通常CIの固定ブラウザーリスト外。
既存`initialUpdateFixture(source,false)`の初回・後続ソースをそのまま再利用する。
保持／破棄の違いを配信ソースへ入れず、Node側の初回`page.close()`だけで分ける。

1. WebKitで**保持→破棄の順に各1回、retries0**。同一origin `127.0.0.1:4188`。
   条件ごとに新しい隔離context/HTTP server。初回と後続は同じcontextを共有する。
2. 初回goto DCL→表示→既存受信履歴の同一文書/callでawait継続→registered代入→
   update-site→元update式の同期返却を12秒内に確認する。届かなければ準備不成立とする。
3. 両方でserver phaseを既存ラベル`reloaded`へ切替える。
   これは後続**newPage**を表す互換ラベルで、この比較ではreloadを呼ばない。
4. 保持側は初回pageを残す。破棄側だけ`await page.close()`。
   その後は両方同じ`context.newPage()`→同じURLへgoto DCL→表示→登録poll。
5. 後続の共通phase/suppress=false、初回と異なる文書、共有contextを確認し、
   元のregistered/ready成功条件を12秒・既定poll間隔で確認する。全体45秒は維持。
   その後の元pageerrorゼロassertも維持する。

現SW全文・実precache資産・MIME/no-store・scope/versioned URL/ready処理は共通。
追加Promise反応、update/登録呼出し、sleep、timer、waitUntil、保存操作はない。
初回ゲートは既存observerへNode-onlyの`timeline()`を追加し、既に受信した記録だけで判断する。
新しいブラウザー計測やPromise観測は導入しない。serverのSW受付/finish/closeも再利用する。
初回・後続の記録は別JSONへ保存し、失敗後evaluate/storageStateや復元は行わない。

## 比較の有効性と介入

初回ソースSHA256 `193a19d5774c9cb95b1a7589876781065dfddaba7a5ff6a682e9bda092c05cc0`、
後続ソース `3509bc84f98be6f3d6059c0f3539acd965e03f922eb7dc92ee77df5453dba8df`。
どちらも前回updateあり側とバイト一致し、今回の条件間でも同じ。元SWも同一バイト列。
配信前ソース・合成HTML・加工後ソース・hash・protocolを原本として保持する。

契約は新6件＋関連observer7件の**13件成功**後に実行した。同一文書/呼出し/順序の初回ゲート、
保持／close後の同じnewPage/receiver/引数、close例外の伝播、Node履歴上限/dropとコピー、
文書別JSONと失敗結果の保存を確認した。通常CIの契約工程にも新6件を追加する。

合成Bには製品のUI/CSS/背景処理/自動版取得がない。既存ソース加工・console配送・poll・
trace/video・Nodeゲートはタイミングに介入する。closeの待機時間自体も処置に伴う差で、
人工的な待ち時間で揃えない。初回updateがまだpendingだったとは観測していない。
条件ごとのcontextは別だが実行順は固定で、順序効果や実行環境の変動も各1回では排除できない。

## 各1回の結果（追加反復なし）

既存公式Playwright1.55.0-noble、WebKit26.0/revision2203、Ubuntu24.04/Node22.18.0を再利用。
両試行ともworkerIndex=0、別のnative context ID。環境構築や版の切替えはしていない。

| 条件 | 初回文書 | 後続newPage | 結果 / 本文時間 |
| --- | --- | --- | --- |
| 保持 | await→registered→update式同期返却。初回文書を残した | register-returned→await-resumed→registered代入→update式返却。1pollでready | 初回成功1 / 1.417秒 |
| 破棄 | 同じ境界へ到達後close完了、同じcontextでnewPage | register-returnedまで。15pollすべてregistering/complete | 初回失敗1 / 13.642秒（登録12秒不成立） |

再試行0。両条件の初回操作と後続source phaseは有効。DCL/load未到達や準備不足ではない。
初回timeOriginは保持 `1792603640039`、破棄 `1792603641466`。
後続は保持 `1792603640738.0002`、破棄 `1792603642025`。各文書時計とNode時計を直接減算しない。

保持側のserverは版付きSW3要求、破棄側は2要求を記録し、すべて200 finish/正常close。
要求にnative登録ジョブIDはなく、特定のregister/updateへの対応は断定しない。
server finishはブラウザー本文読了・native Promise決着の証拠ではない。
両後続文書で既存controllerはactivatedだったが、対象registerの完了とは別事実。
破棄側のawait後/catch以降は未観測であり、native Promise pendingとは断定しない。

記録drop/不正メッセージ/evaluate例外は0。pageerror記録は両方0。
保持側のみ元pageerrorゼロassertへ到達し成功。破棄側は登録待機で失敗し、同assert未到達。
両方の初回trace・各2動画・初回/後続境界JSON・結果JSONを保持。破棄側は画像/error-contextも保持。
retry資料は存在しない。

## 判断と残件

**この同一origin・合成B・newPage各1回では、初回文書の保持／破棄に伴う差を観測した。**
reloadとnewPageを条件間で混ぜずに差が出たが、自然な製品障害の原因確定ではない。
文書寿命とその時間差、native update/登録内部ジョブのどこが関与するかは区別していない。
製品修正・update削除・登録統合・ready強制・期限変更は行わない。
通常CIの緑で、このCI外の破棄側失敗や元PWA/runtime失敗を解消扱いにしない。
通常CIの最終SHA/結果はPR冒頭と外部記録に残し、限定2試行と別集計にする。

原本 `/workspace/hd152-initial-document-20261021/`。
protocol-before-runs、served-fixture、source-at-execution、contracts.log、target.log、
target/summary.json、初回trace/video/JSON、comparison-analysis.jsonを保持。
旧3ディレクトリ297ファイルのmanifestを確認しhash変更0。node_modulesリンクも維持。

保存5実null/空母2実null、自然DCL停止、navigation内部エラー/現SW関与、版取得/SW/通信/
Cache API例外、Chromium重複宣言は別件で未解決。iPhone実機/WebKitオフライン/5-6は未確認。
53例1/49/3、同期外15候補manualを維持。攻略探索は保留。
今回の差は固定し、成功／失敗を得る反復や内部記録の再探索へ進まない。
必要CIで保存実nullが自然再発した場合は、その原本と既設境界・load後完全一致の解析を優先する。
