# PR152: classic scriptの期限到達と安全な再試行

2026-10-22。基準`32172631ff39d2158e1fa6682da153a30fe434c4`。
この記録はpush前の制御再現とローカル回帰を記す。最終HEAD/CIの成否・初回/再試行内訳はPR冒頭を正とする。
旧Chromium自然2件との因果は未確定。保存実null・自然DCL停止・登録待機・navigation内部エラーの修正とは扱わない。

## 独立して確認した欠陥

既存loader-order対照は製品の関数を使うが、本文は人工の定数1個だった。
今回の新しい隔離HTTP試験は、update-manager.jsの先頭から公開hdLoadScriptを含む部分を**そのまま**配信し、
実quest-progress-extension.js（先頭のglobal const HD_QUEST_PROGRESS_KEYを保持）を製品ローダーが取得する。
試験が対象moduleのscriptを二重挿入する構成ではない。

初回HTTP本文は先頭1文字だけを送ってから13秒保留。再要求も初回本文の解放まで保留し、初回→再要求の順に送る。
元の製品タイマー12秒と再試行間隔80msは変更しない。全体45秒・retries0。
moduleの前後に置いた評価開始/完了カウンター、fixture内のscript追加/除去/load/error観測は隔離配信だけ。
実moduleの宣言・関数・イベント処理は変更せず、依存する任務データ等だけを最小fixtureで供給する。
HTTPの送信/finishと、ブラウザーの評価・loadは別イベントとして保存する。

修正前は、12秒で初回script除去→製品のretry=1要求→13秒で初回本文解放→**除去済み初回scriptが評価**→
再要求の評価で`SyntaxError: Identifier 'HD_QUEST_PROGRESS_KEY' has already been declared`が発生。
pageerrorが出ても再要求のloadが来るため、旧loaderはtrue/okを返した。
これが今回制御条件で確認した競合である。旧自然2件の評価順序を復元した証拠ではない。

### fixture不備との分離

中断前の最初の試行は任務数を15と誤って期待して失敗した。同時に上記の製品例外をJSON/traceで観測している。
実moduleの追加任務は13件＋fixture1件=14件。この期待値を訂正した**同じ最終fixture**を使い、
旧loaderソースだけを選択した補完対照をChromiumで1回実施し、末尾pageerrorゼロ検査で同じSyntaxErrorにより失敗した。
テストのパス差（Node import/ソース読取り）以外を戻すとリポジトリfixtureと一致することも契約で確認。
元の試行は訂正/上書きせず保持。成功・失敗が出るまでの反復ではない。

## 修正後の契約

- 期限到達は「未実行が確定したresource error」と同じではない。12秒で呼出し元へfalseと警告を返すが、
  元のclassic scriptは除去せず、競合する再要求を発行しない。
- そのnative load/errorが来るまでは同じ公開Promiseを保持する。同時/後続の呼出しでも新しいscriptを挿入しない。
  未完了の通信を無期限にawaitするAPIにはしない。警告は既存の固定位置toastスタイルを使い、本文を押し下げない。
  戻らない場合の手動再読込を案内し、保存の消去/自動復元はしない。
- 後から本当にloadしたらhdLoaded/okへ更新する。最初に返ったfalseをtrueへ書き換えることはしない。
  正常load後の別呼出しは既存要素を利用してtrueとなる。
- 遅延loadで一度省略された依存moduleは、元のasset passが終了してから通常のhdEnsureCurrentAssetsを共有して再開する。
  元からloadedのmoduleを再評価しない。新しい期限延長/バックグラウンド再試行ループはない。
- script要素の明確なerrorでは、従来どおり最大1回・80ms後の再試行を許可する。期限後にerrorが届く場合も同様。
  最後まで失敗すればfalse/errorと警告を維持する。
- 正常起動時の読込み順・登録経路・SW本文・版/build/cache・保存形式は変更しない。
  回復処理の想定外の拒否を成功へ変換しない。既存pageerror検査も残す。

loadだけで任意のmodule内の実行例外や全機能の正常性を保証する変更ではない。
一般の実行例外をURL等で除外せず、対象試験では実機能とpageerrorゼロを別に検査する。

## 回帰と中断後の復帰

|実行|結果/範囲|
|---|---|
|最初の修正前Chromium 1回|fixture件数誤り＋製品重複宣言を別記録|
|最終fixture＋旧loader Chromium 1回|重複宣言でpageerrorゼロ検査失敗、retry0|
|修正後4条件×Chromium/WebKit|8件初回成功、retry0。通常/13秒保留/503→error再試行/同時公開呼出し|
|中断直前の実アプリ2回|警告を待つexpect12秒が製品の12秒より早く終了。本文解放/復帰には未到達。製品回帰成功には数えない|
|修正した実アプリ2対象×両エンジン|4件初回成功、retry0。quest本体と、guardedな後続patchを持つfleet-calculator本体|
|関連既存5ケース×両エンジン|10件初回成功、retry0。保存/方針/5モード/プランナー/同期|
|Node契約|最終5件成功。期限・共有・遅延load・期限後error・依存復帰の共有・想定外拒否の観測|

実アプリ回帰はHTML/UI/通常資産とloaderを使い、対象本文の保留と評価カウンターだけを隔離する。
外部要求は明示的なJSON/画像fixture、SWはblockのためSW/PWAの修正成功とは扱わない。
初回要求へ同時参加した呼出しは同じPromiseで、12秒後false/error/警告となったことを確認。
サーバーが事前に定めた本文解放へ到達した後、実際に表示した任務進捗ボタンをクリックし加算1回を確認。
後続の公開読込みはtrue、要求は同文書で1回、評価開始/完了も1回。

fleet-calculatorケースでは、false時点でfleet-calculator-fix.jsの要求がないことと、遅延load後に1回取得されることを確認。
その後の実プランナー画面で「装備追加」をクリックし、追加1個を確認。
同じ試行で再読込し、新文書でも評価1回・進捗加算1回・装備追加1回、各module要求は新文書分だけ増えた。
2対象/両エンジンとも既存41moduleのokと画面操作、pageerrorゼロまで到達した。
API内部の状態がokになっただけの成功とは区別する。

### 最初の通常CIで分かった回帰fixtureの不足

`af818b6`のCI39723815861では、WebKitのfleet-calculator実アプリ試験が初回/retryとも45秒で失敗した。
両試行とも遅延load後の任務加算/装備追加は成功し、再読込後の任務ボタンがdetach→hiddenとなった段階で止まった。
初回/retryのtrace/video/JSON/配信sourceを別々に保持。moduleのload状態が全okでも、既存asset pass末尾の
hdInitLoadedModulesや画面準備の完了とは同じでない。旧fixtureはその完了前に内部APIで画面を開ける構成だった。
実行順のどの描画が隠したかまでは特定せず、製品側の画面障害がすべて解消したとはしない。

fixtureだけを修正し、**新たなasset passを起動せず既存HD_CURRENT_ASSETS_PROMISEがnullへ戻ること**を待ち、
実ナビの任務タブ/画面選択から開く。元の機能操作・評価数・要求数・加算数・保存・再読込・例外検査は維持。
固定sleep/期限延長/強制click/製品初期化の追加呼出しはない。
変更したfleet-calculatorケースをChromium→WebKit各1回、retry0で確認し、2件初回成功（24.545秒/22.624秒）。
この結果は変更前の最終失敗と分け、通常CIの最終結果はPR冒頭へ記す。

同CIの別のWebKit再試行は調達リストの`fleet-loadout-planner.spec.js:444`。
DCL後にhdPLLoad().find(map=1-6)がundefinedで、gearItems参照が失敗。初回は動画/PNG/error-contextのみ、traceはretryだけ。
直接のgetItem結果やStorage監査はなく、null/読取り例外/JSONや行の変化を区別できない。
旧5キー実nullへ同一視せず、原因未確定の保存関連初回失敗として保持する。成功retryから初回の欠測を補完しない。

完了済み8件は中断後に再実行していない。その時点のsource snapshotと最終sourceの差は、
警告の固定位置表示/文言と回復時の想定外拒否を警告だけに変換しない変更。最終HEADの通常CIでも新6ケース/engineを実行する。
初回成功件数は全ケースのページ例外ゼロの保証ではなく、各ケースに元からある例外検査範囲による。

## 保存と公開保留

関連回帰のPWA投入5キーは同じ再読込文書のload/complete後も非null・文字列完全一致。
空母夜戦の投入2キーも同じく完全一致で、未投入4キーのnullを異常や全6非nullへ読み替えない。
専用6キー試験は全非nullと故障注入中の全6文字列不変を確認し、通常の新規プラン保存も元プランを保持。
2-5北の全5モード/保存再読込、所持提案からプランナーへの反映も成功。
今回、利用者の実データ/実機iPhoneを検査したわけではなく、遅延条件の既存全プロフィールの安全性まで保証しない。

SWキャッシュは引き続きv580、SW bytesも基準と同一。版の更新や公開はしない。
旧保存実null・自然DCL停止・早期再読込・runtime navigation内部エラー・SW/通信/Cache API・旧自然重複宣言の因果は未確定。
53例1/49/3、同期外15候補manual、5-6/iPhone実機/WebKitオフライン一般未確認を維持。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。

## 証拠と恒久実行

原本: `/workspace/hd152-module-loader-recovery-20261022/`。before/after/appは中断前のまま保護。
再開分: `resume-20261022/`（baseline-final/app-final/related、初回trace/video/JSON、served-source、source/hash、原本照合）。
最初の通常CI原本は同配下`ci/`、準備修正後の限定2件は`app-ci-fix/`。別試行を上書きせず保持。
旧原本118ファイルはhash差異0。snapshotを書き換えたり失敗後にevaluate/storageStateを追加したりしていない。

新ブラウザー2ファイルを通常CIの固定test:browser一覧へ追加。Node契約もbrowser/pagesの必須工程へ追加。
CIでは新ケースの初回失敗traceをretain-on-failure/snapshots=falseで保持し、JSON/配信sourceも再試行成功時を含め退避する。
元の45秒・expect12秒・pageerrorゼロ・既存保存比較は変更しない。

```sh
npx playwright test tests/module-loader-recovery.spec.js tests/module-loader-app-recovery.spec.js --project=chromium --retries=0
npx playwright test tests/module-loader-recovery.spec.js tests/module-loader-app-recovery.spec.js --project=webkit --retries=0
node --test tests/module-loader-recovery.test.cjs
```

自然な保存実nullが必要CIで再発した場合は、その初回原本と既設Storage/script-error/load後境界を優先して解析する。
