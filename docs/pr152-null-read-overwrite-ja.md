# PR152: 実null読取り後の上書きと退避データの保護

2026-10-22。基準 `51c00d8cfb22e6a4feb16d71399179ffd4fd4853`。
既存15群の監査は [保存変更経路](pr152-storage-write-paths-ja.md)、例外/JSON構文保護は
[4入口とUI境界](pr152-ui-storage-sw-followup-ja.md)を再利用。今回はgetItemが実nullを返す分岐だけを追う。
旧自然実nullの消失原因と、nullを空データ扱いして後から上書きする欠陥は別である。

## 5キーの差分確認

|対象|起動・自動経路とnullの扱い|明示保存/同期の書込み候補|今回の保護・限界|
|---|---|---|---|
|F: custom-fleets|cfMigrateMasterIdsは{}ならchanged=falseで書かない|フォーム/自動編成/配備保存のloadCustomFleets→saveCustomFleets。同期連携はupdatedがある場合だけ保存|移行の空読取りに追加修正なし。明示mergeの{}からの保存はコード上の候補で、今回の人工回帰/保護には含めない|
|E: equipment|台帳/計算の読取りだけでは保存しない|hdLoad→フォーム/削除/undo→hdSave、hdKcMergeEquipment→手動計画の保持merge→保存|nullから[]として計画行が見えなくなるコード上の候補。今回これらのUI/mergeを変更・全面検証していない|
|R: ship-roster|rosterMigrateMasterIdsは[]ならchanged=falseで書かない|rosterLoad→フォーム/削除/undo→rosterSave、hdKcMergeRoster→手動メモ等の保持merge→保存|移行の空読取りに追加修正なし。明示mergeの[]由来の置換は今回未検証・未保護|
|P: fleet-calculator|hdFCStateはnull→{}→初期state追加→保存。HQ反映は{}ならchanged=falseで書かない|strictのstate/save/reset/importの4入口。提案選択は保存が成功した後|実ブラウザーで元文字列の上書きを再現し、今回4入口を保護。HQの空読取りに追加修正なし|
|S: kancolle-sync|起動時のname/hash/messageは有効payload/receipt等がなければ書かない|hdKcApplyImportがpreviousを読み、有効な同期結果を最後にsetItem。previous=nullなら以前のHQ/receipt等は参照できない|コード上の経路確認のみ。旧自然失敗での有効取込実行証拠はなく、今回の修正は同期取込一般のtransaction化ではない|

F/E/R/P/Sの正式キー名は既存JSONを参照。初期化・移行・自動保存がすべて空を再保存するわけではない。
実行可能な上記経路と、旧自然失敗時に実行された証拠を区別する。過去の不足資料の再取得・自然再発待ちはしていない。

## 独立して確認した2経路

### プランナー

実HTML/製品保存API/既存の合法な赤城提案fixtureを使う。先に同一文書でPの非nullを読み、
以後getItem(P)だけnullを返すが、元のStorage文字列とキーのプロパティ存在は残す隔離対照。
修正前hdFCStateはwrites=1、元文字列比較falseとなり、他海域の既存プランが落ちた。
提案UIも保存・選択へ進んだ。これは人工的な読取り異常で、旧自然5実nullの原因再現ではない。

strict読取りだけ、`raw===null && Object.prototype.hasOwnProperty.call(localStorage,key)`なら
分類済みの読取りエラーとして中止する。read-only fallbackは維持し、既存UI境界が警告/再読取りを表示する。
空データとしての成功表示・自動復元・無言の例外除外は行わない。保存・選択へ進まないこと、
読取り回復後の通常操作で他プランを保持して再開できることを確認する。

### バックアップ/スナップショット

hdCaptureHarborLocalStorage/hdPHHarborDataは、列挙したキーのgetItemがnullでもpayloadへ入れていた。
実際のhdApplyBackupTransaction/hdPHRestoreTransactionと実rollback helperをVM隔離環境で使用。
各5キーについて読取りだけnullとし、適用処理が書込み前に失敗する条件を注入すると、修正前は
null値が退避され、rollbackのstringだけ残す処理が対象キーを削除した。10条件とも元文字列比較false。
通常の復元確認UIを通した自然障害の再現とはしない。

修正は列挙済みキーのnullで収集を中止し、書込み/rollback/IndexedDB登録・世代削除へ進ませないもの。
自動/手動snapshotは既存の失敗表示を使い、正常に保存できた後に表示を解除する。
JSON書出し/共有も同じcollectorで失敗を通知し、不完全なファイルや成功マーカーを作らない。
明示復元時にpayloadにないキーを除去する既存契約や、正常なrollback処理自体は変更しない。
既に記録済みのnull入りpayload、低層helperへ任意payloadを直接渡す場合の包括保護は今回の保証外。

## 正常な未保存との区別と保護の限界

- 新規Pがnullかつプロパティなしなら従来どおり初期作成・通常保存できる。空の保存領域からのbackup収集も可能。
- Pでは現在のプロパティ存在、backupでは同一収集中のキー列挙を根拠とする。永続マーカーや保存形式変更はない。
- 同一文書で以前に非nullだったという事実だけを永続的な禁止条件にしない。正当な削除/置換後の作成を一律禁止しない。
- 新文書の初回からnullで、キー存在も観測できない場合、初回利用/物理消失/領域の読取り異常は区別できない。
  この場合を根拠なく異常扱いする機能はない。旧5実nullでもキーAPIがどう見えたかの欠測を補完しない。
- null値のJSON文字列、JSONとして有効だがschema不正、書込み失敗一般、他のmerge経路は別範囲。
- 列挙/プロパティ確認も原子的snapshotではない。他contextによる途中削除なら中止して再操作を促すが、削除の原因を断定しない。
- メソッド監査に削除記録がないことだけで物理削除を否定しない。今回の対照は実体の文字列が残る条件に限定。

## 検証・証拠

原本 `/workspace/hd152-null-overwrite-20261022/`。旧原本/loader完了証拠は変更しない。
初回ローカル2件はserver cwd誤りでDirectory listingへ到達したfixture不備（保存試験未到達）。
設定だけ訂正したbefore-correctedに、製品初期化による上書き/提案UIの初回trace・動画・JSONを保持。
Node初版のsnapshot関数抽出にwindow代入を含めた不備も、製品のrollback欠陥と別記録。
訂正済み同じ契約のnode-before-correctedは10失敗/正常2成功、node-afterは全条件の文字列保持を確認する。

正常な未保存、実null API4入口、提案UI、編集/reset/render、回復後再操作、snapshot/書出しUIを両エンジンで確認。
ローカル故障/復帰30実行は初回成功、Nodeは既存例外/JSON保護11＋新契約14=25件成功。
関連既存18実行は17初回成功/1最終失敗（retry0）。失敗はWebKit空母夜戦の再読込DCL45秒。
新文書は34番map-equipment-owned.jsまでload、script-error/pageerrorは0。以降loadingを維持し、保存比較には未到達。
投入E/Rの2キーはpre-reload→pagehide→新init→app.js loadの最終監査まで非null・長さ/ハッシュ一致。
四つの未投入nullを異常と数えず、ハッシュを文字列完全一致へ読み替えない。後段のcomplete/loadでの保存状態は未確認。
初回trace/video/reload JSON/Storage監査を保護し、同じ失敗を取る再実行・推測修正はしない。
専用fixtureでは投入6キーと選択キーの全非nullと文字列完全一致を確認し、存在/長さ/比較boolだけを新規記録へ出す。
PWA5キー/空母2投入＋4未投入のload後完全一致を、全6キー非null試験と区別する。
例外/不正JSONの既存試験、通常保存/復元/同期/プランナー/2-5北の関連回帰を維持する。
最終SHA・通常CIと初回/retry/最終失敗の内訳はPR冒頭を正とし、途中snapshot/fixture不備を合算しない。

ローダーの完了済み限定試験は追加実行しない。必要な通常CIの固定一覧は変えず、そこに含まれる既存回帰を省略しない。
45秒/12秒、既存アサーション/例外検査は維持。自然保存実nullが出たら原本と既設境界を優先解析する。
自然DCL停止、早期再読込、runtime navigation内部エラー等は別件で未解決。消失原因の修正とは報告しない。
PR152 draft/公開保留、PR151未変更。マージ/公開/自動マージ有効化なし。53例1/49/3・同期外15manualを維持。
