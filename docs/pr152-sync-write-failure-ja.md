# PR152: 同期mergeの途中書込み失敗

基準 `82152a7fd2bde5c8ff9fd2f7ab14b07f667aa844`。2026-10-24 UTC。
既存の[読取り保護](pr152-sync-merge-null-ja.md)は再利用し、今回は部分受信の1経路だけを確認した。
自然保存実nullの原因再現ではない。製品コード・SW・保存形式の変更はない。

## 保存順序と既存の失敗処理

実受信ボタン → `hdKcReceiveFromClipboard` → `hdKcHandleBridgeImport` →
`hdKcApplyImport`。必要な既存台帳の読取りを最初の書込み前に済ませる。
今回のships + equipmentだけの部分受信では次の順序になる。

| 順 | 保存先 | 経路 |
| --- | --- | --- |
| 1 | harbordesk-ship-roster-v1 | hdKcMergeRoster → setItem |
| 2 | harbordesk-equipment-v1 | hdKcMergeEquipment → hdSave → setItem |
| 3 | harbordesk-kancolle-equipment-detail-v1 | hdKcMergeEquipment → setItem |
| 4 | harbordesk-kancolle-sync-v1 | 同期詳細・transferReceipt・lastSuccessAtをまとめて保存 |
| 5 | harbordesk-kancolle-last-success-at-v1 | 独立した成功日時marker。既存try/catchで失敗を許容 |

4番目のsyncにはsyncedAt/lastSuccessAtも入る。成功日時の表示はsync内の日時と
独立markerの最大値を使う。5番目の失敗は今回注入しておらず、保証対象外。
その後に同期イベント・成功toast・受信成功表示・ゲームへ戻るフラグへ進む。

3番目の例外は受信入口のcatchへ伝わり、エラー表示とalertになる。
先に済んだ台帳書込みを戻すrollbackはない。受信済み記録の保存へ到達しないため、
同じclipboardデータを再受信できる。この経路の既存試験は読取り異常時の書込み0と
正常な完全/部分同期を確認していたが、途中書込み失敗は未確認だった。

## 固定した人工条件

既存の部分受信fixture・訂正済みのnative getterによる結果採取を再利用。
既存台帳3行ずつ・装備個体情報2件・以前の同期記録/成功日時を投入する。
`normalized-partial`は製品が扱える正規化形式で、実API応答そのものという主張ではない。
実受信ボタンから、1/2番目の保存は元のsetterへ委譲して成功させ、
3番目のdetail保存だけ1回 `QuotaExceededError` を投げる。
同じclipboard文字列を同じボタンから再受信し、復元・消去・receiptリセットは行わない。

| 確認 | 失敗直後 | 同一データの再受信後 |
| --- | --- | --- |
| 台帳2キー | 同期内容が先に反映済み | 意図した部分同期が反映済み |
| 装備個体情報 | 元文字列完全一致 | 新しい熟練度＋未受信個体を保持 |
| 同期詳細/受信済み記録・成功日時marker | 両キーの元文字列完全一致 | 新receipt1件・一致する新成功日時 |
| 表示/通知 | error、成功イベント/toast 0、再操作可能 | success、成功イベント/toast各1 |
| 手動情報 | メモ・改造メモ・装備メモ・tags・割当・目標改修値・未知metadata保持 | 同じ保持条件を検査 |
| 他行/対象外データ | 未受信行の元フィールドを保持、custom-fleets/fleet-calculator/pwaは元文字列完全一致 | 同じ保持条件を検査 |

既存8キーの存在確認だけでなく、変更しないキーは文字列完全一致、変更する行は
保持対象フィールドと意図された変更を検査する。比較用文字列はpage内に置き、
単独JSONは一致判定・書込み先/成否・時刻等だけ。画面操作に伴う対象外の書込みも
otherとして履歴へ残し、全UI設定が不変という保証にはしない。
文書時刻は同一文書内の順序に使い、Nodeの実行時刻と直接減算しない。

## 結果と実行方法

最終fixtureでChromium → WebKit各1回、retries=0、各45秒以内で初回成功。
pageerrorは両方0。途中適用は確認したが、この条件でデータ喪失・成功誤表示・再受信不能は
確認できなかったため、rollback等の製品修正はしない。

初版Chromiumは、対象外書込みも0とする期待値と、正規化でフィールドが追加される
装備行の完全同形を期待した試験側の不備で停止。製品失敗/通常retryと分け、原本を保持。
元のフィールド/値の保持を検査する最終fixtureで、初版が未到達だった再受信も確認した。
その前のコンテナmount先不足は試験本文0件の環境不備で、別記録。

```sh
npx playwright test tests/sync-merge-storage.spec.js --grep 'sync merge partial detail write failure remains retryable without false success$' --project=chromium --workers=1 --retries=0
npx playwright test tests/sync-merge-storage.spec.js --grep 'sync merge partial detail write failure remains retryable without false success$' --project=webkit --workers=1 --retries=0
```

固定imageはPlaywright v1.55.0-noble digest b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29、
Node24.21.0、UID1001、Chromium1187/WebKit2203。既存sync fixture同様SWはblockし、
版取得へ有効なJSON/CORS応答を返す隔離条件。未加工SWの自然CI失敗とは区別する。
局所ではtrace/videoを成功時も保持。試験は既存sync spec内なので通常固定一覧にも含まれる。
単独 `sync-write-failure.json` は通常CIのalways成果物へ追加した。

## 保証しない範囲

複数キーの原子性、一般の書込み失敗、他の故障位置、完全受信、他の受信入口、
rollback失敗、同時/別realm更新はこの1条件で確認していない。
途中失敗から再受信するまで台帳と個体情報は不整合になり得る。全同期が安全という結論ではない。
旧読取り保護の成功を一般の書込み保護へ広げない。

原本 `/workspace/hd152-sync-write-failure-20261024/` にprotocol、原/最終source、
初版fixture不備と最終両エンジンの初回trace/video/JSON、通常CIの確定集計を保持する。
旧原本988ファイルのハッシュ一致を実行前に確認済み。
自然保存実null・DCL停止・SW/通信例外・早期再読込・navigation等は別件として未解決。
PR152ドラフト/公開保留、PR151未変更、53例1/49/3・同期外15候補manualを維持する。
