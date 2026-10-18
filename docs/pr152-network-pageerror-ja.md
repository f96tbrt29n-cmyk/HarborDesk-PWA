# PR #152：通信pageerrorと鮮度判定の切り分け

2026-10-18 JST。基準e0035f3、CI39082308913。ドラフト維持、マージ・公開なし。保存形式・攻略閾値・SW・ローダー・版/build/cacheは変更しない。

## 取得済み資料の比較

前CIはChromium669初回成功、WebKit668初回成功/1再試行成功。爆撃CI方針の初回失敗は45秒停止ではなく、追加したpageerrorゼロの検査での失敗。reload開始3433ms、document要求3442ms、通信pageerror3444ms、HTML応答3457ms（200/fromServiceWorker=true）、遷移3507ms、DCL3914ms、方針復元4070ms。再読込→DCL481ms、方針復元637ms。再試行は例外なしで復元完了。機能アサーション成功と例外ゼロを区別する。

ローカルの前回final（7初回成功/1失敗/再試行0）も方針復元まで完了。reload開始11176ms、upstream例外11247ms（+71ms）、sw.js?v=580の通信例外11280ms（+104ms、空stack）、DCL11934ms、復元13641ms。CIの+11msと同じタイミングとは言わない。

共通するupstream要求：

- https://api.github.com/repos/Tibowl/api_start2/commits/master
- https://api.github.com/repos/poooi/poi/commits/master

stackはhdDXGithubHead（diagnostics-center.jsのfetch）→hdDXUpstreamFreshness→hdDXCollect。エラーはFetch API cannot load ... due to access control checks。呼出元は製品の診断機能で、fixtureがこの通信を生成しているわけではない。Promise.allSettledで拒否を捕捉し、error/fresh=nullへ変換する。WebKit/Playwrightはネイティブの通信コンソールエラーもpageerrorへ変換する。独立WebKitの不正ACAO対照でも、Promise拒否を捕捉しwindow.error/unhandledrejectionが0なのに同形式のpageerrorが出た。これは形式の再現で、元のサーバー応答の原因確定ではない。

SWは全GETを扱うため、upstreamを必ず迂回するとは言えない。HTMLがSWから返った事実はupstream応答の証明ではない。元の応答ヘッダー、要求取消とページ破棄の順序、SW内部要求の記録が不足しており、実際のCORS拒否・遷移による取消・実行環境をまだ切り分けられない。

## 確認できた製品不具合と最小修正

両upstream取得失敗でもchecked=true/stale=false/fresh=nullとなり、画面が緑の「最新」を表示した。修正前の専用Chromiumテストで再現（1失敗、資料保持）。これは通信失敗の実害として確認できた誤表示であり、45秒停止や通信エラー自体の根本原因とは別。

製品修正5bb28e6は、両比較がbooleanとして完了している場合に限り「最新」とする。片方失敗・両方失敗・旧キャッシュの比較不能は「確認不可」、確認された差分は「更新待ち」。診断issueにも比較不能を残す。通信処理・再試行・SW・TTL・保存形式・配備探索は変えない。

## 検証と追加計測

- 初期4シナリオ＋既存有限在庫16候補回帰：両エンジン4実行初回成功。
- 最終6シナリオ（両失敗/片失敗/正常一致/差分/不正ACAO/失敗キャッシュ再読込）：両エンジン2実行初回成功。専用fixtureの6保存キー、6個体ID、有限在庫・改修・搭載合法性、索敵49.458745、基礎制空66、プランナー状態と再読込を検査。
- 影響検査は要求を制御するためSWを遮断する既存数値検証設定。SWやオフラインの検証に読み替えない。不正ACAOで意図的に出た例外を記録し、元の方針テストのpageerrorゼロ条件は維持。
- 新しいコンテキスト計測を使った実SWありの爆撃CI方針：Chromium/WebKit計2件初回成功（20.1秒）、再試行0。両方にupstream requestfailedがあるがpageerrorは0、方針復元完了。WebKitはLoad request cancelled、Chromiumはnet::ERR_FAILED。WebKitの取消は記録時刻12982msに集中し、応答status/ACAOは得られていない。原因解決とはしない。
- Nodeテスト22件成功、変更JSの構文とgit diff --check成功。

対象3方針ケースだけ、従来のページ記録に加えてブラウザーコンテキストのupstream API/SWスクリプト要求・応答・失敗を限定記録する。status/fromServiceWorker/ACAOを保存し、ページ側で見えない要求を補う。ページ例外は除外・抑制しない。期限・アサーションは緩めない。snapshots=falseのtraceにはネットワーク記録も含まれないため、別の段階JSONで補う。source・操作・画面画像・動画は残す。

## 未解決と次に必要な証拠

元の45秒再読込停止は初回trace/段階JSONが不足し、今回の短時間で復元済みの通信例外と同一原因とは言えない。次の自然な失敗で、要求発行→応答/取消→主フレーム遷移→DCL→復元とSW/ACAOを突き合わせる。

Chromiumの元の重複宣言2件は未解決。遅延した旧scriptの再評価は対照実験で再現したが、元2件の評価順序は未観測。診断snapshot負荷下の別モジュール重複とも区別し、ローダーを推測修正しない。

2-5北の恒久16候補回帰を維持。同期外15候補は索敵未確認、全16候補とも総合攻略可能ではない。同期外ボーナス差分と一般探索の網羅性は未検証。53例は全条件検証済み1/一部49/未確認3のまま。5-6、実機iPhone、WebKitオフラインは未確認。PR #151は変更しない。

証拠：/workspace/hd152-network-impact-20261018/（before/after/final/policy-contextのログ、JSON、trace、画像、動画）。元資料はhd152-reload-20261018-nextおよびそれ以前の証拠ディレクトリへ保持。
