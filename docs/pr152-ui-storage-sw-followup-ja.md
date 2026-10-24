# PR152 保存保護のUI境界とSW初回例外（2026-10-20）

基準4794497c74c58750c1d73e13c55da8b9bfae49eb / CI39419540860。開始時remote/localとも同じ、main7f114a6、追跡差分なし。既存未追跡node_modulesリンクと証拠は保持。PR152ドラフト、PR151未変更、マージ/公開/自動マージ有効化なし。

## 保存保護の4入口と今回の範囲

|strict入口|従来の証拠|追加した証拠/画面境界|
|---|---|---|
|hdFCState|Storage例外の同一性/保存拒否、JSON構文不正の初期化拒否|実際の描画で読取り不能を表示。再読取り操作まで空の計算結果/成功表示を出さない|
|hdFCSaveState|直接APIのStorage例外/他プラン維持|JSON構文不正の保存拒否をNodeで追加。実際の追加操作はhdFCMutate経由でstate/saveへ入り、分類された読取り失敗だけをUI境界で通知|
|hdFCReset|実ブラウザーのStorage例外/全6キー保持|JSON構文不正の直接API拒否と、実際の確認ダイアログ後の失敗表示/再読取りを追加|
|hdFCImportOwnedPlan|正常な赤城提案の取込/個体・装備位置/古い提案拒否|既存owned-plan-calculatorの合法fixtureでStorage例外/JSON構文エラー時のAPI拒否、全6キー+選択キー非null/完全一致、他海域プラン保持。実際の計算反映ボタンの失敗通知と、故障解除後の通常取込を追加|

APIテスト内でcatchする契約検査と、画面から発火する故障試験を分ける。後者ではAPI例外をevaluateでcatchせず、pageerrorゼロ・保存不変・警告・復帰を検査する。Nodeでは無関係な例外がUI境界をそのまま通過することも確認する。

今回確認したUI欠陥は、前回のstrict化後の読取り例外が画面イベント/描画から未処理で外へ出ること。修正前のChromium提案反映/装備追加2ケースでpageerrorを再現した（before配下に初回trace/動画/画像）。UIは厳格読取りで分類された例外だけを通知し、取込/移動を中止する。描画は読取り不能表示と再読取りボタンを返す。API自体のthrow、元データ、選択の保存順序、正常取込の判定は維持する。空データ化、自動復元、例外URL除外はない。

持続するStorage読取り障害では、別の読み手も動いた。初回資料のstackからhdDXLocalHealth→hdPHHarborData、hdPHRender→hdPHHealth、load→hdPHAutoSnapshotの未処理例外を特定。診断/ホームの読取り専用healthはunavailable/未確認を表示し、ゼロ件/正常とは表示しない。自動snapshotのload入口は失敗をホームへ明示する。snapshot本体のpayload読取りは例外のまま中断し、空payloadとして保存しない。正常書込みや復元手順は変更しない。

途中のfixture不備も分離する。故障をPlaywrightのclickより前に有効にすると、予約済み描画が先に読んで対象ボタンを差し替えた。また解除を再読取りclickより先に行うと、正常描画がボタンを取り去った。初回traceにはdetached/missing locatorが残る。最終fixtureは実際のclickのcapture段階で故障/解除を切替える。イベントの取消/合成click/待機追加/期限延長はしない。このfixture修正と自然な45秒DCL停止を混同しない。

JSONとして有効な不正schema、実null、他merge経路、書込み失敗一般、全画面の保存故障対応は今回の全面保証に含めない。今回のStorage例外/JSON構文エラー保護を旧5キー実nullの原因修正としない。

## 取得済みSW初回traceの追加解析（追加反復なし）

対象はCI39419540860のWebKit空母爆撃CI保存。reload-evidence.cjsのphase/pageerror/DCLは、同じNode performance.now()-startedでmsを記録している。reload3589→pageerror3899→DCL4191→方針復元4374の順序はこの同じ時計内で比較できる。

JSONではnativeDetailsReason=summary-onlyだが、初回traceのconsoleに既存native計測が残っていた。そこから16件のinit/DCL/SW/pagehide等を抽出した。traceTimeは別の時計なので上のmsへ直接加減算しない。nativeのdoc/atも別の文書時計であり、イベントの受信順と同一視しない。

同じ0-trace.traceの受信時計での順序:

|traceTime|観測|
|---:|---|
|21473.482|旧文書window-load|
|22099.460|旧文書controllerchange、版なしsw.js activating|
|22137.365|updatefound、scopeはhttp://127.0.0.1:4173/、版付きsw.js?v=580 installing|
|22478.307|native access-control pageError、stack空、文書IDなし|
|22479.861〜22480.395|旧文書で版付きinstalled/activating、版なしredundant、controllerchange|
|22481.700|旧文書pagehide|
|22492.443|新文書init、controllerは版なしactivated|
|22699.543|新文書native DCL|

これは例外瞬間の完全なSWスナップショットではない。エラー通知に文書IDがないため、直前/直後の旧文書イベントだけから発生文書を決めない。

コード上の呼出し元はapp.jsのload→register('./sw.js')、update-manager.jsのload→hdEnsureServiceWorker→register('./sw.js?v=580',{scope:'./'})→reg.update()。明示scope/既定scopeはいずれもこのページでは/。未加工SW計測はregister/updateをwrapしておらず、旧資料にAPI呼出しID・Promise結果・内部要求IDはない。

page/context側id147（版なし）/148（版付き）には200/要求終了がある。id148はreload前3512msに終了。失敗した内部登録/update要求と同じである証拠はなく、対応不能を維持する。成功した通常/URL正規化各1回の比較も再利用し、反復しない。今回は新しいSW計測や実験を追加していない。製品の登録処理/SW本文も変更しない。

次に判別する問いは1つ：「再発時のnative例外を、どの文書のpublic register/update呼出し・結果へ対応付けられるか」。旧資料の再集計では内部要求IDを回復できない。追加する場合は隔離した空母爆撃ケースだけ、引数/receiver/戻りPromise/既存reject処理を変えない呼出しID計測の可否を先に検証する。通常/正規化比較や失敗待ち大量反復は行わない。

## 証拠/未解決

今回/workspace/hd152-ui-storage-20261020。before/after/caller/complete/fixture-final/ui-final等の途中snapshotも残し、失敗・fixture不備・最終結果を合算しない。初回SW原本は/workspace/hd152-path-audit-20261020/ci-webkit4、今回の抽出はbaseline-native-sw-from-first-trace.json。旧sync初回traceは元々未保持。Chromium旧全文ログはredirect403で未取得、公式ジョブ注記は取得済み。

保存5null/自然DCL停止/旧version通信/Cache API/Chromium重複宣言は未解決。53例1/49/3、2-5北4枠256通りから数値解1件の証拠と同期外15候補manualを維持。5-6/実機iPhone/WebKit offlineは未確認。利用者へデータ消去やSafari開発者ツールは要求しない。最終HEADと通常CI/初回・再試行の区分はPR冒頭へ記録する。

最終ローカル結果（retries=0）：Node11件成功。focused-finalの新規API/提案UI/プランナーUI10実行（5ケース×両エンジン）は初回成功、関連regression14実行（正常提案取込/同期HQ/古い提案/装備位置/2-5北5モード2種/自動配備から計算への反映）も初回成功。planner-operation-finalの4実行はfixture修正時の中間証拠として別に保持し、10件へ加算しない。途中snapshotでは未処理例外/fixture期限到達が残っており、成功へ書換えない。最終fixtureは全6キーと選択キーの存在・長さ・ブラウザー内の厳密比較結果だけを返し、保存値本体は新規診断へ出力しない。正常復帰で意図したプラン/選択だけが変わることも確認する。
