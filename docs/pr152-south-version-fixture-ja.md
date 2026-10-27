# 3-5: 版情報fixtureのJSON応答契約

基準はa31f617f9ab8fbe0772e1d75090fb58797e08676。変更は3-5索敵/保存specの応答fixtureと本記録だけ。
ready/missing/unknownは索敵状態であり、版取得の故障注入ではない。版取得失敗を期待する別specは維持する。

## 応答の範囲

次の2 URLのGETだけ、200/application/json、Access-Control-Allow-Origin:*、固定JSON `{version,build}`を返す。
queryはcache-bustingを含め分類に使わない。

- https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json
- http://127.0.0.1:4173/app-version.json

値は対象版のapp-version.json（1.0.580/build580）から得るテスト入力。実ネットワークや製品の版取得成功を検証した意味ではない。
他のURL・非GETは従来のlocal continue/外部204空本文を維持する。製品fetch、SW、版、期限、探索条件、例外検査、他の故障注入ケースは変更しない。

## 再利用した局所確認

実handlerの対象2 URL/query・非対象URL・非GETの応答と、未変更の製品関数へ固定応答を渡したJSON読取り契約を確認済み。
fixture以外の元操作/アサーションはバイト一致。3状態の応答契約を確認し、ブラウザーは指定の3-5 readyだけを実行した。
固定PW1.55.0 noble digest、Node24.21.0、Chromium1187/WebKit2203、各1回、workers1/retries0、45秒/expect12秒。
両方初回成功・終了コード0。保存・同一文書load後再探索・完全一致・元の例外ゼロ検査を通過。差分不変のため局所試験を繰り返さない。

通常smokeの対象SHAと初回成功/retry成功/最終失敗はPR現状欄へ別記する。失敗試行の原本はprivateに保持し、本変更へ含めない。
旧CI40447266864のaccess-control例外は原因未確定、旧更新UI最終状態は未確認のまま。今回の成功を解決や欠測補完に使わない。
PR152ドラフト・公開保留、main競合と既知残件を維持。main統合、版/SW更新、PR151変更、マージ・公開・自動マージなし。
