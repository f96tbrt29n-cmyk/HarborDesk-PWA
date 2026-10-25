# PR152: PWA5キーと空母2キーの実null比較・共通の最小診断

基準 `0f11b7971b69a0241f0493e6ab5a99591b5654b0` / [CI39593082891](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/39593082891)。
今回も**診断・契約・記録のみ**。製品/SW/保存形式/登録経路/版/攻略探索は変更しない。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。

## 原本と同じ形式の比較

旧原本を再取得・上書きせず、前回manifestのPWA側103ファイルと空母側70ファイルをSHA256で照合し、すべて不変。
原本PWAは `/workspace/hd152-initial-update-20261021/ci-webkit4/pwa-cached-reload-PWA-cach-e464a-ith-Chromium-offline-reload-webkit/`。
原本空母は `/workspace/hd152-five-null-boundary-20261021/ci-webkit4/night-policy-reload-carrie-5f01b-enerates-the-mobile-loadout-webkit/`。
どちらも初回trace/video/画像/audit/reload JSON/ジョブログを保持し、retryは別ディレクトリの2JSONのみ。成功retryのtrace/videoは元々ない。

今回の読取り専用抽出は `/workspace/hd152-dual-storage-boundary-20261021/originals-same-format.json`。
原本consoleから同じ文書のnative/Storage記録を抽出した。保存値本文の再出力・ブラウザーへの追加evaluate/storageStateはない。

| 観測 | PWA初回（CI39585630823） | 空母夜戦初回（CI39593082891） |
| --- | --- | --- |
| 文書timeOrigin | 1792579050603 | 1792582615374 |
| 投入済み監査キー | 5、残り1は最初からnull | equipment/rosterの2、残り4は最初からnull |
| 最後の非null | controllerchange / sequence6 | controllerchange / sequence6 |
| 最初の実null | readystatechange complete / sequence7 | readystatechange complete / sequence7 |
| 監査DCL | 347ms、5非null | 351ms、2非null |
| native DCL listener | 349ms | 357ms |
| script-errorの最初 | 2682ms（4script） | 4561ms（9script） |
| 失敗区間内のscript-error時Storage | 未計測 | 未計測 |
| complete監査のキーreadAt | 2695ms | 4857ms（snapshot.atは4858ms） |
| window-load listener | 2695ms | 4858ms |
| 通信internal-error console | 4件 | 39件 |
| browser requestfailed（採取期間全体） | internal 4要求 | internal 39要求、取消5要求。取消をinternalへ合算しない |
| 新文書の対象Storage操作 | setItem/removeItem/clear記録なし | 同左。ただし方針キーは監査対象外 |
| getter/getItem例外 | なし | なし |
| Storage JS identity / getItem | 同一 / 初期捕捉時から変更なし | 同左 |
| storageイベント | snapshot1件、key等は旧原本で未計測 | 同左 |
| 最終失敗 | 元の直接getItemが5null、完全一致assert失敗 | 方針cv-fighter2に対しauto。元の6要素比較へ未到達 |

### キー別readAt（文書内ms）

| ケース | キー（harbordesk-接頭辞） | 最後の非null / seq6 | 最初の実null / seq7 |
| --- | --- | ---: | ---: |
| PWA | custom-fleets-v1 | 387 | 2695 |
| PWA | equipment-v1 | 387 | 2695 |
| PWA | ship-roster-v1 | 387 | 2695 |
| PWA | fleet-calculator-v1 | 387 | 2695 |
| PWA | kancolle-sync-v1 | 387 | 2695 |
| 空母 | equipment-v1 | 436 | 4857 |
| 空母 | ship-roster-v1 | 436 | 4857 |

各readAtはgetItem返却後・digest前。snapshot時刻で代用しない。
同じmsでも順次読取りであり、一括消失を証明しない。時刻は**それぞれの文書performance.now**で、異なる文書/試行間を減算しない。
要求通知のmsは別のNode単調時計、receivedAtはNode壁時計。trace時計は同じconsole payloadとの対応にだけ用い、文書時計と直接減算しない。
console通知とネットワーク要求発行/本文完了も同一事実ではない。

両方ともDCLを完了し、版なしactiveから版付きSWのcontrollerchangeで非null、その後script-error群、completeで実nullを観測した。
native SW状態とStorage callbackは別の採取であり、切替の瞬間にキーが変わったとはしない。
PWAでは最初のnullより後に版なしへの次切替も記録されるが、空母の採取には同じ後段記録がない。
片方の成功、イベント近接、同様の順序だけで相手の異常否定や共通原因確定をしない。
空母のautoには未設定/未知値/読取り・JSON例外等の戻り分岐があり、**方針キー自身の実nullを確認した意味ではない**。

## 操作・欠測の限界

PWA旧文書にfixtureの4 setItemと提案取込1 setItem、空母旧文書に対象equipment/rosterの2 setItemのbefore/成功後を観測した。
今回の新文書区間には対象writeなし。明示方針保存は対象6キー外で、この監査から全Storage書込み不在とは言えない。
別realm、保存済みnative参照、プロパティ操作、ブラウザー内部操作、ラッパー変更、配送欠測は除外できない。
同じJS Storageオブジェクトでもnative backing storeが正常だったとは証明できない。

PWA監査sequenceは旧1〜22/新1〜10、空母は旧1〜16/新1〜9で連続。文書256/Node1024上限未到達、Node drop/native dropとも0。
PWA初回traceにはJSON採取終了後のsequence11が1件残る。空母の新文書はtrace/JSONとも9件。
16KiB超過console、parse失敗、診断catch、配送欠落はdropへ計上されない。drop0は全記録の完全捕捉の証明ではない。
比較用FNV32/長さ一致は完全一致ではない。元の未投入nullを実消失として加算しない。
旧storageイベントのkey/area/oldValue/newValueを、新しい成功記録で後付け推定しない。

**確定したのは2件それぞれの実null境界。物理削除と保存領域読取り異常、通信/SWとの因果は未確定。**
旧15群監査や登録update/別ページ/攻略探索の比較は繰り返していない。

## 同じ診断を2対象へ適用

`scriptErrorBoundary:true`はPWA cached restartと空母夜戦保存の2ケースだけ。
既存snapshotを最初のSCRIPT errorで文書ごと1回採り、IMGは除外、他ケースは既定OFF。
新timer/MutationObserver/SWラッパー/要求/初期化/復元/失敗後evaluateは追加しない。

既存storage listenerはsnapshotを1回採るまま、同じレコードへ次だけを追加した。

- `keyKind=target/other/null`。対象キー名だけ保持し、対象外キー名は出力しない。nullをclear実行証明としない。
- `oldValueIsNull/newValueIsNull`。本文、値の複製、認証情報は出力しない。
- `storageAreaSame`は捕捉localStorageとのJS同一性。別領域の物理状態や発生元actorを確定しない。
- query/hash/資格情報を除いたHTTP(S) event.url。
- `storageEvent.observedAt`は既存listener開始時の文書performance.now。文書/context/pageは同じsnapshotのメタデータ。

Storage読取りは従来snapshotの6回のまま。イベント情報の読取り失敗はerror名として記録し、nullを捏造しない。
イベントなしでも削除否定不可、イベントありでも物理削除/発生元確定不可。
URL処理・既存snapshotの順次読取り/ハッシュ・console出力の負荷はあり、完全に無介入とは表現しない。

契約10件成功: 対象設定、別文書で再び1回、IMG除外/既定OFF、値非出力、null区別、読取り回数不変、area不一致、失敗時単独JSON保持。
通常CIの既存Node工程へこの契約ファイルも追加し、同じ条件の確認をCIへ残す。

## 実行環境と固定した限定実行

ホストはDebian13/Node24.19.0。既存Playwright1.55.0、WebKit2203/26.0を確認。
最初のmetadata補助コマンドはpackage exports指定不備で失敗（対象0件）。正しいmetadata読取り後、ホストlaunchはlibGLESv2不足で未起動。
正式な`playwright install --with-deps webkit`はroot認証不足で停止。認証設定を変更せず、host検査のスキップもしていない。

代替の正式環境は公式 `mcr.microsoft.com/playwright:v1.55.0-noble`、digest
`sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29`。
コンテナのPlaywright1.55.0/WebKit2203/26.0をlaunch/closeで確認してから対象実行へ進んだ。
Ubuntu24.04/Node22.18.0であり、ホストや通常CIのNode24と実行環境は同一ではない。ブラウザー版の無断切替ではない。
repository/node_modulesは読取り専用、専用証拠ディレクトリと/tmpだけ書込み可。利用者プロフィールはmountしない。
元server/fixture/SWを使用。host loopback、継承proxy、既存CA bundle読取り専用を使用し、認証情報は出力/変更していない。

実行前protocolに**PWA→空母、各1回、workers1、retries0、全体45秒/expect12秒、結果に関係なく終了**を固定。
--listでそれぞれ1件だけ選択されることも確認した。追加反復はない。

| 対象 | 本文実行 | 初回結果 | 初回script-error診断 | drop |
| --- | ---: | --- | --- | --- |
| PWA | 1回/11.1秒 | 成功、元5キー完全一致/プラン連携検査へ到達 | 設置true、script error0、発火0 | Storage0/native0 |
| 空母 | 1回/9.6秒 | 成功、元6要素一致/方針復元/元pageerrorゼロ検査へ到達 | 設置true、script error0、発火0 | Storage0/native0 |

空母は2非null/4未投入nullのままであり、専用6キー全非null試験ではない。
PWA storageイベントはother・旧新値非null・areaSame=false、空母はother・旧null/新非null・areaSame=false。
これらから未公開の対象外キー名やsession/localの物理領域を推定しない。
今回実nullは再現せず、最初のscript-error境界も取れていない。両成功を根本解決や旧失敗の補完にしない。
成功時保持設定により新試行のtrace/videoはなく、単独/添付audit・reload JSONとserver/logを保持。

原本/新試行/契約/環境導入失敗/公式container確認は `/workspace/hd152-dual-storage-boundary-20261021/` に分離。
最新コミットの通常CI URL/SHA/初回・再試行内訳はPR冒頭と同証拠rootに記録し、基準CIや限定2件と合算しない。

次の判別する問いは、**投入キーの実nullが最初のSCRIPT errorイベントで既に成立しているか**。
両対象へ同じ単回診断を設置済み。nullなら最後の非null→errorまで、非nullならerror→後続最初のnullへ絞れるが、因果確定ではない。
45秒DCL停止、登録待機、runtime navigation内部エラー、旧通信/Cache API等は別件の未解決として維持。
53例1/49/3、同期外15manual、5-6/iPhone実機/WebKitオフライン未確認。利用者へ消去・アプリ再追加・開発者ツールを要求しない。
