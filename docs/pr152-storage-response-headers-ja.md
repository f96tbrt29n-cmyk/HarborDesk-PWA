# 保存消去指示ヘッダーの限定診断

基準 `fecf6d2bf990c5681e32e74ff40c0a685b582230`。旧原本解析は完了として再利用し、
修復入口の保護追加・自然実nullを得る追加反復・製品/SW/保存形式の変更はしない。
証拠root: `/workspace/hd152-clear-site-data-20261023/`。
旧 `/workspace/hd152-undo-storage-20261023/` のmanifest299ファイルはサイズ/SHA256一致を確認。

## 配信側の限定確認

通常の配信はGitHub Pagesの静的artifact、テストは `python3 -m http.server`。
対象PWA/空母夜戦fixture、現行SW、Pages workflowにClear-Site-Dataを設定する経路は見つからなかった。
隔離SW計測サーバーの追加ヘッダーもCache-Control/Content-Type/Content-Length/Last-Modifiedで、
localStorage消去指示ではない。PWA既存の外部204 routeもこのヘッダーを指定しない。
このコード確認は旧自然失敗の応答にヘッダーがなかった証拠ではない。

localStorageのHTTP消去指示を調べるため、今回は標準の **Clear-Site-Data** だけを対象にする。
Cookie/Set-Cookie/認証情報/全ヘッダー/本文を新たに採取しない。
Cache-Controlや通常のキャッシュ更新をlocalStorage削除指示とは扱わない。

## 対象・取得・保持

`observeReload`の追加option `storageHeaders` は既定OFF。
既存PWA cached restartと空母夜戦保存の2ケースだけtrue。
元のSW条件・既存PWA route・fixture・登録/試験期限・比較/例外検査を維持する。
PWA5投入キー、空母2投入/4未投入、専用6キー全非null試験は区別したまま。

- 既存page responseと既存のfiltered context responseイベントを使う。contextの観測URL範囲を広げない。
  既存要求IDでpage/context重複を排除し、sourceを保持。要求/応答のnative文書IDはない。
- `Response.headerValue('clear-site-data')` のみを非同期取得する。追加fetch/interception/本文取得、
  SW/app Promiseラッパー、保存操作は追加しない。
- 通常試験のassertion・成果物退避は取得Promiseをawaitしない。診断Promiseの拒否は診断内で分類し、
  元のpageerror検査・アプリ例外は変更しない。新タイマーなし。
- responseAt/lookupStartedAt/lookupCompletedAt/capturedAtは既存observer開始からのNode monotonic ms。
  responseAtはイベントhandler処理時刻であり、ブラウザー内部の受信瞬間ではない。
  Storageの文書時計と直接減算せず、既存の文書境界/受信時刻と照合する。
- 要求ID、query/hash/userinfoを除いたURL/origin、status、fromServiceWorker、取得時刻/結果だけを採取。
  対象ヘッダーも既知のquoted directiveのallowlist、未知要素数、長さ、切詰めのみ保持する。
  任意のヘッダー内容や例外messageを出力しない。未知/切詰めがある時に「storage指示なし」と結論しない。

取得結果は常に同じ `reload-navigation-evidence.json` の `storageHeaders` へ保存し、既存の
always-upload patternで成功/失敗/retryの各ディレクトリに残す。
失敗後の追加evaluate/storageStateや自動復元はない。

|状態|記録上の区別|
|---|---|
|取得でき、API結果null|outcome=obtained / header.presence=absent|
|取得でき、文字列（空文字含む）|outcome=obtained / presence=present、directive情報|
|同期throw/非同期拒否/不正なAPI結果|outcome=failed / 限定errorName、header=null|
|採取終了まで未決着|pending-at-capture-end、lookupCompletedAt=null。退避は待たない|
|応答通知あり、512 unique response上限などで未採取|responseNotCollectedCount / limitedResponseEvents|
|既存要求記録あり、応答通知なし|responseNotObserved。failed/finished/unfinished-at-capture-endも分離|
|未応答一覧の上限128超過|responseNotObservedDroppedに数える。不存在と解釈しない|

capturedAtより後の診断Promise決着は退避済み記録を更新しない。内部SW要求/ブラウザー内部処理/配送欠測、
イベント外での保存消去は観測できない。fromServiceWorker=trueをCache API hitや本文完了とはしない。
追加Protocol問合せ・Node処理にはタイミング影響があり、旧未加工条件と完全同一とは主張しない。

## 確認済み範囲と実行手順

契約はあり/なし、同期throw/拒否、未完了、上限/応答通知なし、秘匿化、既定OFF、対象2件のみ、
失敗時JSON/添付保持、元pageerror保持を検査する。既存reload契約も含め計20件が初回成功。

```
node --test tests/response-storage-headers.test.cjs tests/reload-evidence.test.cjs
```

隔離WebKit配線確認は1回、retries0/全体45秒。
既存Playwright1.55.0の公式v1.55.0-noble imageでNode22.18.0/WebKit26.0を使用。
新context/SW block/実アプリ・保存データなしのHTTPfixtureで、未認識の`hd-diagnostic-noop`だけを
Clear-Site-Dataへ設定し、消去を指示するstorage/cache/cookies/*は配信していない。
存在取得1件、observerErrors0/上限超過0。responseAt約43.10ms、取得完了約47.06ms。
人工的な保存消去や自然実nullの原因再現ではなく、公開APIと保存経路の配線確認である。
`tests/response-storage-headers.experiment.cjs` は通常CIの固定ブラウザー一覧には含めない。
配線fixture自体の再実行は不要。trace/video/結果JSON/実行configを証拠rootに保持する。

新契約を通常CIのNode工程へ追加。対象2件は既存の固定ブラウザー一覧に含まれる。
今回の通常CIはpush後の1回のみとし、対象SHA/最終job/初回・retry・最終失敗はPR冒頭と証拠rootへ記録する。
前CI39854554263の必須3成功/3取消、空母夜戦最終test failure1件、WebKit全体未集計を上書きしない。
導入遅延があれば導入工程と試験工程を分け、45秒/45分を延長しない。

## 解釈と維持事項

自然実nullを観測した場合だけ同試行の値/own/列挙、最後の非null/最初のnullと応答記録を照合する。
ヘッダーがあってもorigin、directive、当該ブラウザーの適用有無が不明なら原因確定にしない。
なかった場合も取得できた応答に限った結論とし、未応答/取得失敗/未完了/上限/内部要求を除外しない。

undoの限定保護と自然実nullの発生原因は別。旧5実null、DCL停止、早期reload、navigation内部エラー、
SW/通信/Cache API等は未解決。53例1/49/3、同期外15候補manual、iPhone実機/WebKitオフライン未確認を維持。
PR152ドラフト・公開保留、PR151未変更。マージ/公開/自動マージ有効化なし。
