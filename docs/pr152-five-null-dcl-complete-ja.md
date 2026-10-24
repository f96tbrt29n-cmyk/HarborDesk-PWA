# PR152: 自然CIの5キー実null — DCLからcompleteまでの境界

基準/原本CI対象: `d2ae01b823fc14caaffb3ec08e4091dd9ddf6527` / [39585630823](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/39585630823)。
今回の変更は読取り専用の原本解析、対象PWAだけの診断補完、契約、記録。製品/SW/保存形式/版/攻略判定は変更しない。
PR152ドラフト・公開保留。PR151未変更、マージ・公開・自動マージ有効化なし。

## 原本の保護と試行の区別

原本 `/workspace/hd152-initial-update-20261021/` をそのまま保持。
新しい解析 `/workspace/hd152-five-null-boundary-20261021/` の `originals-sha256.json` は、初回trace/video/画像/audit/reload JSON/error-context、再試行2JSON、ZIP、ジョブログの10ファイルについて、前回manifestとのSHA256一致を確認する。
CI ZIP SHA256: `f526bfbf8dfe3b5cc31106fba3976b95f6615ba757d732480859610325a36203`。
ZIPのGitHub digest照合済み記録も再利用。原本の上書き・再取得・失敗後のブラウザー読取りは行わない。

初回は `ci-webkit4/pwa-cached-reload-PWA-cach-e464a-ith-Chromium-offline-reload-webkit/`。
初回trace・動画・画像・Storage監査・reload JSONあり。再試行は同名`-retry1/`の2JSONのみで、初回traceや動画の代用にしない。
ジョブログ `ci-webkit4-job.log` はHTTPアクセス記録も含む。時刻窓を抽出したが、接続/登録ジョブ/request IDや本文送信完了を記録するサーバーではない。
今回資料に元々ないブラウザープロセス内部記録は取得できない。

## 文書・時計・読取り条件

- 旧文書timeOrigin `1792579047883.0002`、新文書 `1792579050603`。
- 監査context label `591b2ccf-1cb9-4dc0-b656-20737df72fd0`、page label `existing-fixture-page`。
- trace native context `browser-context@630e2826bba14e85ea241d2ad9126ba5`、page `page@69531fdcd77061597cb497bd76b28b7f`。
- 観測origin `http://127.0.0.1:4173`、同じpageで1回reload。監査labelはnativeストレージ領域IDではない。
- 以下の数値は新文書の`performance.now()`。各`readAt`は**getItemが返った直後、digest計算前**。
- `snapshot.at`は全キー読取り/比較後。Node`receivedAt`やtraceの単調時計とは直接減算しない。traceでは同じconsole payloadを介して対応できるが、配送遅延がある。
- キーは順次読み、同じms値は時計の粒度も反映する。原子的な5キー同時変化を観測していない。
- 新文書の全採取で`storageIdentitySame=true`、`getItemUnchanged=true`、getter/getItem読取り例外なし。JS wrapper同一性であって、native backing store同一性・物理保存状態の証明ではない。

## キー別の境界

| キー（harbordesk-接頭辞） | 最後の非null: stage / sequence / readAt ms | 長さ | 最初の実null: stage / sequence / readAt ms |
| --- | --- | ---: | --- |
| custom-fleets-v1 | controllerchange / 6 / 387 | 379 | readystatechange(complete) / 7 / 2695 |
| equipment-v1 | controllerchange / 6 / 387 | 77 | readystatechange(complete) / 7 / 2695 |
| ship-roster-v1 | controllerchange / 6 / 387 | 745 | readystatechange(complete) / 7 / 2695 |
| fleet-calculator-v1 | controllerchange / 6 / 387 | 3154 | readystatechange(complete) / 7 / 2695 |
| kancolle-sync-v1 | controllerchange / 6 / 387 | 19 | readystatechange(complete) / 7 / 2695 |

各キーの境界は**その387ms読取りの返却後〜2695ms読取りの返却まで**。どの順序で変わったかは不明。
全5キーの長さ/比較用prefix FNV32はpre-reload→旧pagehide→新init→app.js load→DCL→controllerchangeで一致。完全一致とは表現しない。
6番目`harbordesk-pwa-v1`は投入しておらず、最初からnull。専用6キー全非null試験とは別。
初回の元アサーションは、監査関数を介さない`keys.map(k=>localStorage.getItem(k))`が5個の実nullを返して失敗した。
trace `call@525` の返却は5個の`{v:'null'}`。読取り例外をnullへ変換したものではない。
再試行の完全一致成功は初回の安全性・物理復元の証拠にしない。今回は新しい完全一致/6キー試験を実行していない。

## 同じ新文書のイベント順

| 文書時刻ms | 観測 | 保存状態/限界 |
| ---: | --- | --- |
| 149 | initのキー別readAt（snapshot.at=150） | 5非null。native controllerは版なしactivated |
| 160 | storageイベント、registration-initial | 5非null。storageイベントのkey/oldValue/newValueは未計測 |
| 226 | app-script-loaded | 5非null。loadは関数ごとの実行履歴ではない |
| 346 | readystatechange interactive | 5非null |
| 347 | 監査DOMContentLoaded | 5非null。別のnative DCL listenerは349ms |
| 387 | controllerchange監査 | **最後の5非null**。版付きsw.js?v=580/activating |
| 387〜389 | native installed→activating→controllerchange→activated、registration-controller | 版付きactive。Storageを追加読取りした記録ではない |
| 452〜455 | 9動的scriptのload | fleet-calculator/command-center等。個々の保存関数呼出しは未計測 |
| 2682〜2683 | 4 script error | equipment-acquisition-guide / fleet-calculator-fix / resource-budget / expedition-fleet-manager-patch。この時点のStorage未計測 |
| 2695 | readystatechange complete | **最初の5実null**。controllerは版付きactivated |
| 2695 | 監査load、native window-load | 5実null。trace内ではcomplete監査→ready-state→load監査→window-loadの順 |
| 2715 | pageshowキー別readAt（snapshot.at=2716） | 5実null |
| 3811 | application-ready-before-comparison | 5実null。起動待機は完了し、元の保存比較へ進んだ |
| 3859〜3860 | 版なしSWへのcontrollerchange | 最初のnullより後。traceのみ残る追加監査sequence11も5null |

PWA初回のDCLは完了しており、別ケースの潜水艦45秒DCL停止ではない。
今回の通信内部エラーは**4 request ID (266〜269)**。page/context両方の通知を8件の独立要求と数えない。旧49要求の事象を流用しない。
該当要求はNode側reload記録で5417〜5418msにrequest/requestfailedを受信し、response/requestfinishedは欠測。
traceにも4つのinternal-error consoleがあり、同じtrace時計で最初のnull監査より前。
ネイティブscript-errorの文書時計とは対応資料を併記するが、Node時刻を文書時刻へ直接置換しない。
サーバーには初回文書での同URL200と後段retry付き200がある。新文書の失敗4要求と同一だと証明する識別子はなく、200を失敗要求の本文完了証拠にしない。

## 保存操作と狭めたソース確認

監査で観測した対象操作はすべて旧文書。IDは文書内番号。

| 操作ID | key | before→成功後sequence | scope/caller |
| --- | --- | --- | --- |
| 1 | roster | 6→7 | fixture / evaluate |
| 2 | sync | 8→9 | fixture / evaluate |
| 3 | equipment | 10→11 | fixture / evaluate |
| 4 | custom fleets | 12→13 | fixture / saveCustomFleets→evaluate |
| 5 | calculator | 19→20 | application-or-runtime / hdFCSaveAll→hdFCSaveState→hdFCImportOwnedPlan→evaluate |

1〜4はfixture-start〜fixture-end、5はその後の明示提案取込。どれもsetItem、before/成功後の対があり、失敗後記録なし。
**新文書の387〜2695msを含む全観測期間に、対象setItem/removeItem/clear記録なし。**
これは削除不存在の証明ではない。対象Storageの同realm prototypeを通る、string key/clearだけが監査対象。
別realm/保存済みnativeメソッド参照/プロパティ代入・delete/ブラウザー内部/外部操作/ラッパー変更/配送欠測は対象外または未検証。
`getItemUnchanged`は書込みラッパーの完全性検査ではない。

既存15群監査は再利用し、今回到達可能な入口だけを読み取った。

| 候補 | 今回の到達証拠と制約 |
| --- | --- |
| DCLでのhdStartCurrentAssets→動的モジュール起動 | 9動的script loadがあり経路進行を確認。内部各関数・保存の全実行履歴はない |
| roster/cf master ID移行 | script load/該当DCL入口あり。fixtureのmasterIdは既存設定済み。changed時だけsetItemで、削除経路なし。呼出しごとの実行は未計測 |
| プランナー初期値作成/同期HQ refresh | モジュールは454ms load。書込み条件付きコードは存在するが、対象write監査なし。5キーを削除する経路ではない。39801e0読取り例外修正と実nullは別問題 |
| 自動同期のname/hash/message入口 | importモジュール/80ms timerのコードは存在。有効payload/適用操作の証拠なし。全message/window.nameを記録していないため未実行断定不可 |
| 手動backup/snapshot復元・rollback | removeItem/setItemの実経路はある。traceにクリック/ファイル/confirm/復元呼出しなし。低層JS直接呼出しの包括記録はない |
| personal-home自動snapshot | localStorageを読みIndexedDBへ保存するコードで、自動復元ではない。今回personal-homeのloadは2976ms、依存loaderは失敗4scriptのretryを待つ。387〜2695msの入口実行証拠なし。load時刻だけを評価開始の正確な時刻とはしない |
| 新文書loadの版なしregister/版付きregister、自動版取得1200ms、import450ms、planner420ms | **最初のnullはcompleteでloadより前**。通常の新文書load-dispatchで起動するこれらを、最初のnullの先行原因にはできない。内部SWジョブ・旧文書で開始した処理まで否定しない |
| SW activation/claim | 切替の監査時にも5非null、次の版なし切替はnull後。SWはCacheStorageを扱いlocalStorageの直接APIを持たない。ブラウザー内部への間接関与は未判別 |
| fixture/reset/context close | traceで再読込後は起動待機→監査mark→比較だけ。失敗前にcontext/page close/crash/disconnected記録なし。物理プロセス/領域内部の正常性は未計測 |

## 上限・欠測・時計

Storage JSONは38イベント中32監査、旧sequence1〜22/新1〜10で連続、Node drop0。文書上限256/Node上限1024に未到達。
初回traceには同じ32payloadに加え、監査finishがlistenerを外した後のsequence11/controllerchangeが1件残る。
この1件を「JSONの上限drop」としない。traceとJSONの採取終了境界の差である。
各key長さは65536未満でprefix計算の切詰めなし。ただしFNV32は非暗号学的比較で完全一致の証明ではない。
16KiBを超えるconsole/JSON parse失敗/outer diagnostic catch/console配送欠落はdropに計上されない。連続sequenceとdrop0だけで全操作の完全捕捉とはしない。
reload側nativeDropped0/resourceDropped0、summary-only。詳細イベントは初回traceのconsoleから回収可能だった。
native summaryの最終SW状態を、387msや2695msの状態に置き換えない。

## 結論と最小補完

**確定**: 同じ観測文書/JS Storage identityで5キーが非nullから実nullへ変わり、読取り例外ではない。元テストの直接getItem比較も失敗。
**未確定**: 物理削除、読取り領域異常、ブラウザー内部異常、監査外操作のどれか。SW切替・4内部エラーとの因果も未確定。
コードの存在だけで保存処理を原因にしない。新文書load処理だけでの説明と、旧49要求を今回へ流用する説明は支持されない。

次の問いを**「最初のscript-errorイベント時点で、5キーは既にnullか」**に限定する。
既存原本には2682〜2683msの保存読取りがないため、元失敗への答えは得られない。
`observeStorage(...,{scriptErrorBoundary:true})`を対象PWAだけで有効化し、既存document capture errorで最初のSCRIPT errorに既存snapshotを1回だけ追加。
新timer/要求/SW API/Storage書込み/本文/レイアウト/失敗後evaluateなし。これでもイベント配送・順次6読取り/最大65536単位digest・console出力のタイミング介入はある。
他の監査対象ケースは既定falseで不変。既存の45秒・アサーション・例外検査を変更しない。
nullなら境界を387→最初のerrorまでに狭められ、nonnullならerror→completeを調べる。いずれも物理消失やSW原因を確定する診断ではない。

契約は8件成功。opt-in/既定OFF/一度だけ/IMG対象外/例外とnullの区別/値非出力/Storage非変更/配送失敗を確認。
固定したローカルWebKit試行はretries0・1回。**既定パスにブラウザー実体がなくlaunch前失敗**で、テスト本文・監査設置・保存比較へ未到達。製品失敗/自然再発/初回成功のどれにも加算しない。traceはlaunch失敗記録のみ、動画/監査JSONなし。
この結果にかかわらず追加反復しない。初回script-error診断の実ブラウザー観測は必要な通常CIで確認する。
製品欠陥は確定していないため製品修正/修正前後成功/新しいデータ安全性宣言はない。

## CIと残件

原本CI39585630823: 必須6成功、Full skipped。Chromium683初回成功、WebKit681初回成功/2再試行成功、最終失敗0。
再試行はPWA実5nullと潜水艦45秒DCL停止の2件で別分類。通常CIの成功でどちらも解決済みにしない。
新差分のCIと対象SHAはPR冒頭で別記し、原本の件数へ合算しない。旧SW/現SW比較や初回update対照は再実行していない。
登録待機、runtime navigation内部エラー、旧通信/Cache API/版取得例外、Chromium重複宣言、5-6、iPhone実機/WebKitオフラインは残件。
53例は全条件1/一部49/未確認3、同期外15候補manualを維持。iPhone利用者への消去・削除再追加・開発者ツール要求なし。
