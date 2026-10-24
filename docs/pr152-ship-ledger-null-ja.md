# PR152: 艦娘フォームの実null後上書き保護

2026-10-22。基準 `6654502f3306e2d16c92c519eaf29e508773ab95`。
装備フォームとCI39771112474の回収は完了として再利用し、今回の対象は艦娘フォームの追加・編集保存入口だけとする。
自然実nullの発生原因と、読取り異常後に既存台帳を上書きする独立欠陥は区別する。

## 入口と修正前の実証

既存の入口別監査 `pr152-equipment-ledger-null-ja.md` のRフォーム行を再利用した。
`addShipRoster` / `data-roster-edit` → `openShipRosterDialog` → 実保存ボタン →
`shipRosterForm submit` → `rosterLoad` → `rosterSave` が今回の経路である。
従来の `rosterLoad` は実null・読取り例外・JSON構文エラーを空配列へ変換する。
追加はその空配列へ新規1行を追加、編集は対象idがなく空配列のまま保存し、どちらも台帳全体を失い得る。
起動・描画用の読取り、undo、同期merge、修復入口は今回再監査・変更しない。

隔離HTTP配信の実HTML・製品JS・実フォームで、同期metadata付き既存2艦と他5保存キーを投入した。
実submitのcapture入口でgetItem(R)だけnullとし、元文字列とnative own-propertyを保持する。
試験側から削除・復元・空配列の投入はしない。保存操作は元setItemへ委譲するspyで数える。
修正前Chromium追加/編集各1回は、ともにR書込み1・元文字列完全一致false・他5キー完全一致true・全6キー非nulltrue。
警告なしでダイアログを閉じ、成功通知も1回表示した。同じfixture・元アサーションを修正後にも使う。
装備の再現結果を艦娘の実証に代用していない。人工的な読取り異常であり、旧自然実nullの原因再現ではない。

## 保存入口だけの最小保護

フォーム保存前だけ `rosterLoadForSave` を使う。
raw実nullかつ現在own-property=trueなら読取り異常として止める。
getItem例外とJSON構文エラーも空配列へ潰さず、フォームで明示的な保存失敗警告を表示する。
submitの既定closeを止め、入力と編集idを保持し、書込み/成功通知へ進まない。
読取り回復後は同じフォームの保存ボタンから再操作できる。新規表示/正常読取り後は古い警告を除く。
共通のread-only `rosterLoad`、低層 `rosterSave`、その他保存入口は変更しない。

正常未保存のraw null/own falseと、既存の空配列文字列は新規作成・通常編集を許可する。
新しい永続マーカー・保存形式・自動復元・自動初期化は追加しない。
getItem→own→setItemは非原子的で、同時更新一般の保護ではない。
新文書でキー存在も見えない異常は正常未保存と区別できない。
JSONとして有効な不正schema/文字列null、書込み障害一般、undo・同期merge・修復等は今回の保証外。

## 回帰と証拠

`tests/ship-ledger-storage.spec.js` は実null+own true/読取り例外/JSON構文不正×追加/編集の6件、
正常未保存/既存[]からの作成→通常編集の2件を扱う。
異常時は元6キー全非nullと文字列完全一致・R書込み0・成功通知0・画面警告・入力保持を検査する。
故障解除後は書込み1、意図した手動変更だけ、他艦行・個体ID/装備位置等の既存metadata・他5キーを保持する。
採取側は前回訂正済みのnative getter参照と例外分類を再利用し、故障getterの例外を製品失敗に混ぜない。
証拠は通常手順のassert前に採り、失敗後の追加evaluate/storageStateは実行しない。
pageerrorゼロ、45秒、retries0を維持。人工対照だけSW block/正常JSON version fixtureを使用し、自然CIと別分類にする。

新ケースを通常CIの固定一覧へ追加し、既存の保存load後完全一致・存在監査・例外検査を変更しない。
修正後はChromium8件/WebKit8件、計16件がすべて初回成功（再試行0/最終失敗0、fixture不備0）。
修正前2件と修正後は同一のtest sourceを使い、採取側訂正や条件変更で成功化していない。
通常CIのChromium選択は714件/39ファイルで、新しい8件を含むことを実行前に確認した。
最終ローカル/CIの初回・再試行・最終失敗内訳はPR冒頭と証拠rootの結果記録へ記載する。
`/workspace/hd152-ship-ledger-null-20261022/` にprotocol、before/afterの初回trace・動画・JSON、旧/新ソースを保持する。
装備フォーム・ローダー・保存存在診断の完了済み対照を反復しない。

自然実nullの原因、DCL停止・早期reload・navigation内部エラー・通信/SW例外等は未解決の別件。
PR152ドラフト・公開保留、PR151未変更、マージ/公開/自動マージ有効化なし。
53例1/49/3、同期外15候補manual、5-6/実機iPhone/WebKitオフライン未確認を維持する。
