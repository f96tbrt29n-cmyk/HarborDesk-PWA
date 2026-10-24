# PR152: 潜水艦保存回帰のload後補完

基準33f9a38。原因修正・診断追加ではなく、interactiveで終了できた保存試験の範囲を拡張する。
製品/SW/保存形式、元fixture、45秒試験期限、既存診断は変更しない。
prepared保存保持/hash対照/診断適用の完了済み限定試験は反復しない。

## 元検査と追加検査

元のsub-radar→sub-late選択、配備成立/増設なし/横幅、reloadのDCL待機、
hdSENightPolicy('1-1')='sub-late'、hdFSSuggestionHtml stack限定のpageerror検査を残す。
既存PWA/空母の順序を再利用し、元検査の後に次を追加する。

1. waitForLoadState('load')。既にload済みでも正しく扱い、固定sleep/networkidle/待機延長はしない。
2. DCL直後に記録した同じ再読込文書（timeOriginとorigin/path）であることとreadyState=complete。
3. 保存6キーの文字列完全一致（nullを含む）。ハッシュ比較や非nullだけの判定ではない。
4. 方針キーのraw文字列完全一致、方針読取り関数のsub-late復元、元と同じstack限定例外検査。

元fixtureの投入式と元の操作/待機/assertをSHA契約で維持する。
追加した比較部分だけを旧core SHA対象から除き、元経路を置き換えない。

## 比較対象・基準

|キー（harbordesk接頭辞）|元fixtureとの関係|
|---|---|
|equipment-v1|魚雷2個・潜水艦電探1個を投入|
|ship-roster-v1|伊58改/実masterId/個体93/Lv90/増設0を投入|
|custom-fleets-v1/fleet-calculator-v1/kancolle-sync-v1/pwa-v1|未投入。前後null同士の一致も検証し、全6キー非nullとはしない|
|night-ci-policy-v1|元UIの方針変更が書き込む別キー。今回からraw完全一致の対象に含める|

基準は元のsub-late保存操作と配備確認の後、reload要求前に採取する。
投入2キーと方針キーの存在も確認し、元から失われた値を保持基準として成功化しない。
未投入4キーは存在を強制せず、実際の基準値に対して完全一致を判定する。

方針実装はsortie-equipment-check.jsの定数/読取り関数と
fleet-loadout-planner.jsのchange handlerを確認。読取りはJSON parseとenum検査のみで、
選択時は既存objectにmapの値をmergeしsetItemする。起動時に意図された書換えはない。
よってraw文字列も完全一致対象。読取り関数の復元判定と別に確認し、raw差分を意味の同じJSONで許容しない。

## 本文を成果物へ出さない比較

Playwrightのevaluate返却値はtraceのaction resultに記録され得る。
生の保存文字列をevaluateで返したり比較引数として渡したりせず、公開exposeBindingで
基準とload後の値をNodeメモリーへ渡し、文字列===で比較する。
返却/単独JSON/添付にはキー・存在・長さ・一致真偽・文書/時刻・方針読取り結果だけを出す。
バインディングはテストの比較用で、保存API/SW/Promiseのラッパーや常時監視ではない。
永続マーカー/保存書込み/自動復元/別ページ/追加通信/固定タイマーは追加しない。
追加RPC/読取り/ファイル出力によるタイミング影響はある。

不一致前にも正常な手順でpost-load-storage-verification.jsonを保持する。
失敗後の追加evaluate/storageState/保存読取りは行わない。
基準と判定JSONのglobsを通常CIの既存always成果物へ追加。
読取りは非原子的であり、一括保持/消失の瞬間や物理削除を証明しない。

## 検査範囲と実行

例外assertは元と同じhdFSSuggestionHtml stack限定を前後2地点で使用する。
除外追加や対象拡大はしない。通常の試験合格を全ページpageerrorゼロと報告しない。
DCL停止/load待機失敗/6キー不一致/raw方針不一致/方針復元不一致/例外検査失敗を別分類にする。

固定image/PW1.55.0/C1187/W2203/UID1001/Node24.21.0。
比較・保持・元経路契約23件と--list各1件を確認後、C→W各1回/retries0/45秒で実施。
通常CIの固定一覧に元から含まれるケースであり、変更push後のCI1回を別集計する。

```sh
npx playwright test tests/night-policy-reload.spec.js --grep 'submarine night CI policy regenerates the mobile owned loadout and persists the selected set$' --project=chromium --workers=1 --retries=0
npx playwright test tests/night-policy-reload.spec.js --grep 'submarine night CI policy regenerates the mobile owned loadout and persists the selected set$' --project=webkit --workers=1 --retries=0
```

初回trace/video/監査/reload/比較JSON/配信ソース/環境を
`/workspace/hd152-submarine-post-load-20261024/`へ保持。
確定結果は同rootのresult-ja.mdとPR冒頭へ記録する。
自然実null/DCL停止は未解決。今回成功しても旧原因の証拠や解決とはしない。
一般オフライン/iPhone実機は未確認。PR152 draft/公開保留、PR151未変更。
マージ/公開/自動マージなし。53例1/49/3・同期外15候補manual維持。

## 今回の局所結果（通常CIとは別）

C→W各1回/retries0、両方初回成功・再試行0・最終失敗0。
元のDCL/方針/stack限定例外検査を通過し、追加load/complete/同一文書、保存6キー完全一致、
方針raw文字列完全一致、方針sub-late、同じstack限定例外検査まで到達。
投入2/未投入4を維持し、方針キーを含め7比較すべて一致。全6キー非null試験とはしない。
両方の初回trace/video/単独比較JSON/既存監査/reload JSONを保持。
trace API引数/結果に投入2キーと方針の保存本文がないことを実ファイルで確認（fixtureソースの既知リテラルは保持）。
局所の全pageerror記録数と、実際に検査するstack限定範囲は分けて結果JSONに記録。
旧自然実null/DCL停止の原因解決とは扱わず、今回の確認範囲の拡張で成功とする。
