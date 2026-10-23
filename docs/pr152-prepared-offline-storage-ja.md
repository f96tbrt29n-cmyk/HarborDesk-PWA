# PR152: 登録準備後・停止origin再読込の保存保持

基準31760d7。製品HTML/JS/SW未加工の別ケース
`PWA prepared storage survives stopped-origin reload after load`を追加する。
元の早期再読込とprepared登録ケース・期限・後続アサーションは残す。
自然実nullの原因再現・解決を目的とする試験ではない。

## 投入と比較

既存`strategy-import-preservation.spec.js`の6キー構造、オンラインPWA保存保持の
既存監査・load後完全一致の方法を利用する。context/originは試行ごと独立。

|キー（harbordesk-接頭辞）|投入理由・代表データ|
|---|---|
|custom-fleets-v1|1-2の保存編成、時雨改二・個体777・空き通常装備位置を含む装備メモ|
|equipment-v1|ソナー2個★4と爆雷1個★0、装備メモ|
|ship-roster-v1|実マスターID、Lv99、個体777、空き枠・増設未開放・手動メモ|
|fleet-calculator-v1|保存編成に対応する司令部Lv88・素索敵45・装備★4|
|kancolle-sync-v1|司令部Lv88・代表資源。外部同期通信は実行しない|
|pwa-v1|blankStateから作成した資源4321/8765/1234/9876と既知保存日時|

保存編成・計算は既存公開保存関数を使用する。表示選択の補助キー
`harbordesk-fleet-calculator-selection-v1`も公開選択関数で設定するが、
これは6キー比較の対象外（実際の製品定数を参照）。新しい永続マーカーではない。

投入直後の文字列とオンライン再読込後の文字列を区別する。
オンライン側でload・台帳/編成/プランナー表示を確認した後、全6キー非nullの
**文字列そのもの**を比較基準として保持する。seedからの変化はキー別真偽を記録し、
変化なしを仮定しない。保存本文はJSONへ出さない。

## 実行と保証範囲

初期登録準備12秒→オンライン再読込・登録待機12秒→既存scope/controller/cache/index
検査→オンライン基準→offlineで強制更新拒否・cache名維持・pageerrorゼロ→
offline解除→サーバー停止・Node側接続失敗確認→最終再読込。
Chromiumは最終offline ON、WebKitはOFFのまま停止originを使用する。
固定sleepは新設せず、元の強制更新試験内の100msも変更しない。

最終文書はDCL直後のtimeOrigin/URLを記録し、元のUI/module/controller/pageerror検査を
通過してからloadを待つ。既にload済みでも対応できる`waitForLoadState('load')`を使用。
同じ文書・completeと全6キー非null＋文字列完全一致を確認後、実際の台帳UI・
資源入力値・保存編成・プランナーの表示を確認し、pageerror検査も再度行う。
正常な画面遷移だけで描画し、期待データの直接表示・API差替えはしない。

登録errorとconsole error/warningは、pageerrorゼロとは別に記録する。
既存Storage監査（値の存在・長さ/参考ハッシュ・own/列挙・script-error境界）と
既存reload/ヘッダー診断を再利用。計測によるイベント/読み取り負荷は残る。
失敗後にevaluate/storageStateや自動復元は行わず、採取済みJSONをfinallyで保存する。

初回traceはon（DOM snapshotsなし）、video on。全体45秒、retries0。
固定imageはv1.55.0-nobleの既存digest、Chromium1187/WebKit2203、Node24.21.0。
Nodeは公式配布SHASUMS256で照合。元コンテナ内Node22への切替はしない。

```sh
npm run test:pwa:prepared -- --list
npm run test:pwa:prepared -- --grep 'PWA prepared storage survives stopped-origin reload after load$' --project=chromium --retries=0
npm run test:pwa:prepared -- --grep 'PWA prepared storage survives stopped-origin reload after load$' --project=webkit --retries=0
```

`test:pwa:prepared`は元preparedと新保存ケースの2ケース×2エンジンを選択する。
今回の実行は上記grepで**新ケースだけ各1回**。通常CIの固定`test:browser`には
pwa.spec.jsが入らないため、本ケースは公開前の別必須確認。Full一覧には含まれるが、
PRのFullスキップを実行済みとは扱わない。文字列比較契約は通常CIのNode工程に追加。

原本: `/workspace/hd152-prepared-storage-20261023/`。
局所結果と通常CI結果は別集計し、確定結果はPR冒頭と原本rootの結果記録へ記す。
一般的なオフライン動作・複数回更新・全保存領域・iPhone実機は未確認。
旧自然実null、DCL、早期再読込、navigation、登録/通信/Cache API例外、hash旧失敗、
12px差は未解決。53例1/49/3・同期外15候補manualを維持。

## 今回の局所結果（通常CIとは別）

固定環境・Node24.21.0、Chromium→WebKit各1回/retries0。
両方初回成功（再試行0、最終失敗0）。全6キーはオンライン基準からload後に文字列完全一致、
台帳・資源・保存編成・計算UI復元と追加pageerrorゼロも通過。
両方ともseed→オンライン基準の文字列変更なしだったが、比較基準の定義は正規化後のまま。
同じ試行の登録/console情報と到達時刻・文書は`local-results.json`に保存。
試験本文未開始のmount/アクセス権/CLI grep不備はenvironment配下へ別記し、
製品失敗・再試行成功に合算しない。ブラウザー試験を成功目的で反復していない。

本結果は代表6キー・今回の2試行の範囲拡張。旧自然実nullの不存在や原因解決を意味しない。
