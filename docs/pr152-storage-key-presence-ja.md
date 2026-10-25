# PR152: 実null境界のキー存在・列挙を補完する診断

2026-10-22。基準 `db40e22f6ca2a0b2a7d686cc865cc6b65f654a0d`。
製品・SW・保存形式・版・ローダーは変更せず、既存の保存監査だけを補完する。
CI39731167972の空母初回SWアクセス制御例外と、retry1の投入E/R実nullを別事象として保持。
旧retry1はDCL seq6/readAt312msで非null、最初のSCRIPT error seq7/readAt22655msで実null。
その原本にはキー存在・列挙がなく、新しい成功記録で欠測を埋めない。

## 対象と取得順序

`keyPresence:true`はPWA cached restartと空母夜戦保存だけ。既定OFF。
既存のinit/pagehide/DCL/complete/load/最初のSCRIPT error/明示比較境界を使い、新イベントやタイマーは増やさない。

1. 対象キーごとに、既存getItemを1回実行。`readStartedAt`、既存`readAt`、存在/長さ/hashまたは既存読取り例外を保持。
2. 同じキーのown-property存在を確認し、`ownStartedAt/ownReadAt/ownProperty`を付ける。例外は`ownProperty:null/ownError`。
3. 全対象の値/own確認後、同じStorageのlengthを取得、捕捉したStorage.keyで0から順に最大128件走査、最後にlengthを取得。
4. `lengthBefore/After`と各取得時刻、開始/終了時刻、走査数/上限/切詰め/観測した変化/例外を記録。
   一致した対象キーだけindex/観測時刻を保持。対象外キー名・保存値本文・任意queryは出力しない。

既存のJS Storage identity/getItem変更確認も維持。identityが変わった場合の現Storage値読取りは従来からの分岐で、今回追加した再読取りではない。
新しいgetItem呼出し、保存操作、sentinel、自動復元、SWラッパー、Promise観測、失敗後evaluate/storageStateはない。
元の2投入非null/4未投入null fixture、元の保存比較・同じ文書のload後完全一致・方針復元・例外ゼロ・45秒を保持。

## 解釈と限界

- `ownProperty`はその呼出し時点の結果、`enumerated`は完了した限定走査で見えたかを表す。単一の原子的snapshotではない。
- 列挙の例外、128上限、前後length差、途中null/重複index名など観測した変化があると、全対象の`enumerated:null`（不明）。
  部分走査の正の一致は`enumerationMatch`へ残すが、全走査の確定値へ昇格させない。
- own-property自体の例外は独立して不明。列挙エラー時にown確認が成功していても、両者を原子的な存在判定にまとめない。
- lengthが同じでもキーの置換/順序変更や別contextの変更を検出しきれない。`complete:true`は走査手順の完了であり、同時点の全Storage状態の証明ではない。
- 同じ丸め時刻でも取得は順次。getItem→own→列挙の間の実変更もあり得る。値null/存在trueの対応は観測区間の不整合の証拠であり、native保存の同時状態や原因確定ではない。
- 両存在情報が見えなくても物理削除、保存領域異常、ブラウザー内部処理は区別できない。正常未投入のnullと、直前まで投入済みだったキーの異常を区別する。
- getItemの回数は増やさないが、6回のown確認・length2回・最大128回のkey読取り・時刻採取・JSON配送の負荷を追加する。
  メタデータAPIもブラウザー内部へアクセスし、タイミングやバックエンド挙動への影響をゼロとはしない。
- 既存の文書256記録/Node1024記録/16KiB console受信上限は変更しない。drop0でも配送/parse/診断catchの完全捕捉を証明しない。

## 契約と限定実行

既存契約を拡張し15件成功。正常存在、正常未保存、元文字列を残した値だけnull、own例外、列挙例外/上限/途中変化、
取得順序、getItem追加なし/書込みなし、対象外名/本文非出力、製品の元例外/戻り値保持、失敗時単独JSON保持を確認。
これは人工診断契約であり、自然実nullの原因再現ではない。

既存のPlaywright1.55.0公式noble imageを再利用。SW未加工/allow、WebKit元空母夜戦1ケース、retries0、45秒。
初回の`--list`はアンカー付きgrepが全タイトルと合わず0件（ブラウザー実行0）。選択だけ訂正し、1件を確認してから1回実行。
**1初回成功/0再試行/0最終失敗、11.6秒**。結果に応じた追加反復はしない。

新文書doc1792665493232で、init566ms→DCL984ms→load3378ms→追加比較後3490ms。
投入E/Rは値非null/own=true/列挙true、未投入F/P/S/coreは値null/own=false/列挙false。
各列挙はlength前後10/走査10/上限128/切詰めfalse/観測変化false/例外なし。
同じ丸めms内に全操作が入る記録もあり、取得間隔0ms表示を原子性の証拠にしない。
元6要素文字列完全一致、load後の同一文書/complete/6要素完全一致/方針cv-fighter2/既存例外検査を通過。
script-error境界は設置確認済み/発火0。**自然実null境界は未観測**。旧失敗の解決・補完ではない。

## CI・証拠

既存通常CI固定一覧は対象PWA/空母夜戦を含み、既存Node工程がこの契約ファイルを実行する。固定一覧/再試行設定は変えない。
push後の最終CI結果はPR冒頭へ記録し、この限定1回と合算しない。CIの自然保存異常があれば既設境界の解析を優先する。

`/workspace/hd152-storage-presence-20261022/`にprotocol、旧/新配信ソース、契約ログ、選択訂正、実行ログ、単独監査/要求JSON、動画、比較添付を保存。
成功試行のtraceは元のretain-on-failure設定により生成されない。旧初回/retry traceと原本は別領域で不変。
CIでは失敗試行の既存trace/video/JSON保持設定を維持。欠測を別試行で埋めない。

次は必要な通常CIで自然実nullが出た場合に、同じ文書/境界の値・own・列挙・取得区間を照合する。
出なければ診断設置確認と異常境界未観測で終了し、停止やnullを得るための追加反復はしない。
PR152ドラフト・公開保留、PR151未変更。マージ/公開/自動マージ有効化なし。
保存実null/DCL/早期reload/navigation/通信・SW等の未解決、53例1/49/3・同期外15manualを維持。
