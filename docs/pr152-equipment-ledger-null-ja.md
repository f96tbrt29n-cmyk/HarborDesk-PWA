# PR152: 装備フォームの実null後上書き保護

2026-10-22。基準 `85ba301fb85d2b504555dc96565dc8de4bd6213d`。
既存15群監査と`pr152-null-read-overwrite-ja.md`を再利用し、E/Rの読取り→書込み入口だけを差分確認。
自然実nullの発生原因と、その後の上書き防止は別である。存在診断の追加/反復はしない。

## 対象入口と既存保護

E=`harbordesk-equipment-v1`、R=`harbordesk-ship-roster-v1`。
下表の「未保護」はキー存在あり/値だけ実nullの場合。コード上の経路と実際の制御再現を区別する。

| 読取り→書込み入口 | 呼出し元・意図 | 実null時の従来動作 / 保護 |
| --- | --- | --- |
| E: hdLoad→equipmentForm submit→hdSave | 台帳の追加/編集、装備候補から開く登録フォームも同じ入口 | []から新行/編集行だけ保存し既存他行を失う。今回この1入口を実画面で再現/保護 |
| E: hdLoad→削除→hdSave | data-eq-deleteの利用者操作 | []なら対象idがなくreturnし、この分岐からは書かない。追加修正なし |
| E: hdLoad→undo callback→hdSave | 削除後「元に戻す」 | []から戻す1行だけ保存し得る。未保護・未再現 |
| R: rosterLoad→shipRosterForm→rosterSave | 手動追加/編集 | 追加は[]へ1行、編集は対象idがなく[]のまま保存し得る。未保護・未再現 |
| R: rosterLoad→削除 / rosterSyncCanonical | 削除ボタン / 公式名同期 | []ならid不在でreturnし書かない。追加修正なし |
| R: rosterLoad→undo→rosterSave | 削除後「元に戻す」 | []へ1行だけ保存し得る。未保護・未再現 |
| R: rosterMigrateMasterIds | 起動/描画時の旧形式移行 | []ならchanged=falseで書かない。追加修正なし |
| E/R: 既存JSON読取り→hdKcMergeEquipment/Roster | hdKcApplyImport、適用ボタン/clipboard/許可postMessage/name/hash受信 | []からincomingを保存し、手動計画/メモ等の保持材料を失い得る。部分/完全同期とも既存metadata依存であり、明示全置換として安全扱いしない。未保護・今回未再現 |
| R: JSON読取り→hdDXRepairShipIdentity→setItem | 確認ダイアログ付きMASTER ID/艦名修復ボタン | 読取り[]でもRを保存するコード上の経路。保存Fも伴う。未保護・未再現 |
| E/R: hdLoad/rosterLoadによる台帳描画・計算 | 起動/表示/探索 | これらの読取り自体は空表示になり得るが、ただちに書く処理ではない |
| E/R: backup/snapshot復元helper | 利用者確認後の明示的全体置換。低層APIは引数で置換 | 退避collectorは列挙されたキーの実nullで止まる(db40e22)。正常な明示置換契約は維持。列挙にも見えない場合/任意payloadを直接渡す低層呼出しの包括保護ではない |
| E/R: hdSave/rosterSave/setItem自体 | 完成配列を受け取る低層writer | 読取り入口ではなく、すべてを一律に禁止する変更はしない。呼出し元ごとの保護が必要 |

新文書の最初からキーのown/列挙も見えない実nullを、正常未保存と区別できるとはしない。
旧自然保存異常のtraceに、上記フォーム/同期merge/修復/復元が実行された証拠を今回で補完しない。

## 同じ実保存入口で確認した独立欠陥

隔離contextの実HTML/製品JS/装備台帳を使用。合法な既存2装備行（同期由来情報・改修計画・他行メモ含む）と他5キーを投入。
画面から追加または編集ダイアログを開き、実保存submitのcapture入口でEのgetItemだけ実nullへ切替える。
元のnative getItem参照では元文字列を引き続き読め、native own-propertyもtrue。元データを物理削除する対照ではない。
native setItemへ委譲するspyでE書込みを数え、UI操作の結果をassert前の通常手順で取得する。失敗後の追加evaluate/storageStateはしない。

修正前Chromium add/edit各1回は、いずれもE書込み1、E元文字列完全一致false、他5キー一致true、全6キー非nulltrue。
フォームは警告なしで閉じた。この反例は「キー非null維持」だけでは上書き破壊を検出できないことも示す。
同じnull注入・実submit手順/アサーションで修正後の元文字列完全一致・書込み0・実画面警告/入力保持を検証する。
故障はStorage読取りの人工制御。SWはこの人工対照に限りblock、既存version応答fixtureはJSON/CORS契約を満たす。
通常PWA/未加工SW条件の自然失敗と混同しない。旧存在診断・ローダー・P上書き保護対照は再実行しない。

## 最小修正

装備フォームの書込み前だけ`hdLoadEquipmentForSave`で読む。
raw実nullかつ現在のown-propertyがtrueなら分類済み読取りエラーにし、読取り例外/JSON構文エラーも空配列へ潰さない。
フォームはこれらの読取り失敗を画面で通知してsubmitの既定closeを止め、書込み・成功更新へ進めない。
入力を保持し、読取り回復後に同じ保存ボタンから再開できる。新規表示時/正常保存時には古い警告を解除する。
共通のread-only `hdLoad`、hdSave writer、同期merge、艦娘フォーム、復元/rollbackは変更しない。

正常未保存のraw null/own false、既存の空配列文字列[]は従来どおり作成/通常保存を許可。
新しい永続マーカー/形式/自動復元/自動再保存/正常未保存の一律禁止なし。
getItem→own→setItemは原子的transactionではなく、並行変更を一般に防ぐものではない。
キー存在も見えない異常、JSONとして有効な不正schema/文字列null、書込み障害一般、他入口は今回の包括保証外。

## 回帰・証拠

null/読取り例外/JSON構文不正×追加/編集の6ケースは元6キー全非null＋厳密な文字列完全一致、E書込み0、UI警告/入力保持/未処理pageerrorゼロを確認。
各ケース内で故障解除後に再保存し、書込み1、他の装備行・同期metadata・他5キーの保持と実画面復帰を確認する。
正常未保存/既存[]からの追加→通常編集の2ケースも含め、Chromium/WebKit各8ケース、retries0/全体45秒で確認。
初版afterは12成功/4fixture不備。throw4件では、製品submitの後の試験用採取getItemも意図した例外を投げ、結果採取が未完了となった。
採取側だけnull/読取り例外を区別して記録するよう訂正し、元pageerrorゼロ検査を残してこの4件だけ再実行、4成功。
12成功を反復せず、初版fixture不備を製品失敗/再試行成功へ合算しない。beforeのnull2件の制御条件・保存経路は同じ。
元文字列完全一致と書込み0、ダイアログを開いたままの警告、入力保持、読取り回復後の再保存を確認。
既存P読取り例外/JSON保護は製品ソース不変、成功済み証拠を再利用し、通常CIの既存回帰も維持。

`/workspace/hd152-equipment-ledger-null-20261022/`にprotocol、旧/新ソース、before/afterの初回trace/video/JSON/画面証拠を保存。
before2期待失敗は制御反例、after/通常CIとは合算しない。最終実行結果・CI SHA/初回/retry/最終失敗はPR冒頭へ記録。
新テストは既存のtest:browser固定一覧へ追加し、通常CIでも実行。期限/アサーション/例外検査は緩めない。
必要CIで自然実nullが出たら、その試行の値・own・列挙境界を原本から解析する。成功目的のCI再実行はしない。

自然消失原因/旧DCL/早期reload/navigation/通信・SW等は未解決の別件。PR152ドラフト・公開保留、PR151未変更。
マージ/公開/自動マージ有効化なし。53例1/49/3・同期外15manualを維持。
