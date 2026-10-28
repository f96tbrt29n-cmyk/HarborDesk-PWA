# 5-2 F索敵監査期待値の訂正

基準はb2a1427cc199c18dc4a8af128f342bbc024190b1。CI40706076586のC2/W4初回・retryは、59行の完全一致監査における5-2期待値の欠落で対象固有の探索/保存/loadより前に停止した。旧未到達を今回の成功で補完しない。

## 独立した根拠と範囲

[登録出典](https://zekamashi.net/kancolle-kouryaku/5-2/)の保存済みF分岐表は上から優先し、33式係数2で63未満H、63以上70未満ランダムH、Hを免れた場合/70以上は空母系2以下かつ戦艦級2以下でOへ進む。63は確定逸れ域の上端を含まず、70は索敵安全域の下端を含む。間の範囲をO到達不可能や購入必須とはしない。艦種条件も必要で、5-2に一律高速や高速+索敵免除はない。司令部Lv120未満の余裕+1推奨は閾値変更と区別する。

参照KCwikiの63境界重複、本文71、別係数0.35の76、L→Kの別条件は留保し、このF表と混ぜない。出典全体の不一致が解消したとは扱わない。製品los(2,70,63)は妥当なので変更せず、監査JSONの5-2該当行scouting.checks[0].failBelowだけ63を追加した。他58行、完全一致検査、製品/保存schema/期限/探索/待機/取消/例外検査は不変。

## 検証

固定image/PW1.55.0、Node24.21.0、C1187/W2203を維持する。Nodeは影響するfive-two-routes12件が初回成功。追加2件は実hdFEScoutingの62.99 missing、63/69.99 partial、70 ready、HQ/艦索敵入力欠測、速力による免除なし、および独立literalと監査/製品の両一致。合成算術を実ゲーム入力の証明とはしない。

前回阻害されたunknown opening ASWケースだけをC/W各1回、workers1/retries0で通常版確認する。元の安全中止/保存値全文保持、reload後同一文書の未判定再探索と全文比較、同期値回復後再探索・元の例外検査を維持し、操作や保存呼出しを追加しない。保存/編集の既存5-2代表成功はソース/入力不変で再利用する。C/Wとも初回成功、各59行一致、unknown→after-load-unknown→synced-value-recoveryの3段階に到達。保存操作時exact/other、load後complete/exact/otherは全true、pageerrors0。実行は各1回で、前段のCLI grep開始アンカー誤りによる0選択（ブラウザー0）を別保存し、runnerの選択だけ訂正した。

旧5-2のload後非表示/caller欠測・出典待ち・全在庫/枠の検証不足は保持し、5-2全体完了/公開可能とはしない。236セル11/122/103の変更0。

原本/実値/traceはprivateに分離しcommit/外部アップロード対象外。旧3件のCI回収追記は元worktreeで保持し、今回の記録へ同じ事実を引き継ぐ。5-5準備は別worktreeで保持する。PR152ドラフト・未公開、main競合と既知残件を維持し、PR151/main/版/SW/本番/マージ/公開/自動マージは変更しない。


## 修正後CI確定（2026-10-29）

HEAD2225f6004c08f3a7e86481a7d6914317797d7654の[通常smoke40733236149](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/40733236149)はattempt1・6成功、Full skipped。自動起動0を確認した通常起動1回、再実行0。C1/C2各419初回、W1/W2各210初回、W3は209初回、W4は198初回/11retry成功/最終失敗0。合計C838/0/0・W827/11/0を全6ジョブ自身の公式注記で照合した。全6自己環境はNode24.21.0/PW1.55.0/C1187/W2203一致。

主対象OASW未知例はCの全419初回成功/固定選択と、Wの自身初回原本を区別する。W原本はconnections59、5-2の係数2/70/63、unknown→after-load-unknown→synced-value-recovery、saved.exact/otherとafter.exact/otherすべてtrue、complete/pageerrors0。C2試行ZIP1,071,187,797bytesは512MiB上限で未要求・raw欠測、他ジョブで補完しない。

8成果物中7件454,102,787bytesをSHA/CRC照合してprivate保持。W4失敗初回11件は、load第2click非表示8、明示的load保持bool全true後の例外検査2、import保持の到達段階不明1。後者は17.367秒video/PNG/contextのみでtrace/対象専用JSON/停止行が欠測。connector joblogs Transport closedと別既存gh api redirect Forbiddenを各1回記録し、失敗経路反復/認証変更なし。別の人工診断JSONや成功retryを初回証拠へ転用しない。値不一致/null/消失のpositive記録は得られておらず、欠測だけで新保存不一致や旧原因解決とはしない。

新5-2 W不足/未知は初回2結果/load全文一致、W成立は初回load第2click非表示で最終比較未到達、retryは別試行として成功。旧W不足の欠測/caller不明は埋めず、5-2全体未完了・D一部を維持。今回CI記録による236セル変更0。新方針に従い、停止条件が確認されていない独立5-5限定範囲の反映へ進める。原本89件のmanifestを保持し、private資料/保存値本文/traceをcommitしない。
