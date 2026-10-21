# PR152: 初回文書の明示updateだけを抑止する比較

基準 `57c329ba4513e4405840f768c0f6d019041bd764` / CI `39580013448`。
製品コード/SW本文/登録方式/版/cache/保存形式は変更しない。
PR152ドラフト・公開保留、PR151未変更。マージ・公開・自動マージ有効化なし。

## 再利用と新しい差分

前回のBは初回await継続→registered、新文書register-returnedまでを確認したが、
update呼出し地点の観測がなく、今回と同じ文書phase・分岐条件もなかった。
したがって前回資料は参考として再利用し、厳密に対応したupdate対照には置換しない。
A/B/Cの全面再実行、内部Promise記録の再探索、完了済みPWA試行は行わない。

元のB runnerを共通のtest-only moduleへ移し、新しい2条件も同じHTTP/準備/アサーションを使用する。
元のA/B/C入口はその共通runnerを呼ぶ。通常CIの固定ブラウザーリストにはどちらの実験も含めない。

`initial-update-fixture.cjs`は同じB配信ソースへ共通の診断/分岐を加える。
条件間の初回ソース差分は**const __hdSuppressExplicitUpdate=false/trueの1値だけ**。
再読込後ソースは両条件ともfalseで、バイト一致する。

```js
__hdRegProbe('explicit-update-site',__hdRegProbeCall);
if(__hdSuppressExplicitUpdate){
  __hdRegProbe('explicit-update-suppressed',__hdRegProbeCall);
}else{
  reg.update().catch(()=>{}); // 元の式・receiver・拒否処理
  __hdRegProbe('explicit-update-expression-returned',__hdRegProbeCall);
}
// その後の元のready処理も維持する
```

expression-returnedはupdate式と既存catch登録が同期的に返った観測で、update Promise決着ではない。
追加then/catch/finally、完了待ち、sleep、再登録、waitUntilはない。
初回の明示updateを抑止しても、register等に伴うブラウザーの自動更新は抑止しない。

## 初回/新文書の区別と介入

サーバー側phaseをinitialで開始し、**既存のreload-request記録とpage.reload呼出しの間**でreloadedへ切り替える。
HTTP handlerは要求受付時にphaseを捕捉し、非同期read後に別phaseへ取り違えない。
HTML要求回数（SW precacheでも増える）、storage、controller状態からphaseを推測しない。
新timer/init scriptやphase設定用evaluate、追加要求/待機はない。

配信ソースに同じphase定数を入れ、境界と同じpollの文書メタデータへphase/抑止値を保持する。
新文書で古いcached初回ソースが動いた場合は、timeOrigin/phaseの不一致として比較無効にする。
サーバーのentryResponsesは**本文を準備した時点のhash/phase**で、ブラウザー本文読了ではない。
新文書のpoll/境界のphaseと併用し、サーバー記録だけで実行ソースを断定しない。
文書timeOriginはnative文書IDではなく相関情報。context labelは条件間で同じ場合があり、
試行ディレクトリ/policy/originと初回traceのcontextIdを併用する。

両条件はこの仕組み・metadata/console配送・phase分岐・source加工・trace/videoを共有する。
それらには負荷とタイミング介入があり、無介入の自然条件ではない。
合成BにはアプリUI/CSS/背景処理/自動版取得がなく、初期installやページ遷移の時間も製品と異なる。

## 実行前の契約

新fixture6件＋関連recorder7件、合計**13件成功**後に実行した。
初回1値差分、新文書完全一致、HTML/他入口不変、元register/ready/reject契約、
updateを待たないこと、初回だけ0回/新文書は両方1回、receiver/引数、拒否/同期throw、
診断配送失敗、phase記録・不正metadata拒否を確認。
以前の全契約やA/B/Cの手動反復はしない。通常CIの必要な契約工程とは分けて扱う。

## 固定した実行条件と結果

順序は**初回updateあり→初回update抑止、各1回、retries0**で固定し、結果にかかわらず終了した。
WebKit26.0/Playwright1.55、fresh context/異なる127.0.0.1 origin、同じ現SWと実precache資産、
同じno-store/MIME、手動cache投入なし。
元のgoto DCL→表示→getRegistrations>0（20秒上限）→1回reload DCL→表示→登録12秒pollを維持。
全体45秒・既定poll間隔・登録成功条件・pageerrorゼロ検査を変更しない。

| 条件 | 初回文書での操作 | 再読込後 | 結果 |
| --- | --- | --- | --- |
| あり | await継続→registered→update-site→元update式の同期返却を観測 | register-returnedまで。15pollすべてregistering/complete | 12秒で不成立、初回成功0/再試行0/最終失敗1 |
| 抑止 | await継続→registered→update-site→suppressedを観測 | await継続→registered→元update式の同期返却。3pollでready | 初回成功1/再試行0/最終失敗0 |

両方で初回操作地点と対応する実行/抑止マーカーが同じ初回文書にあり、**操作は有効**。
新文書の両方でphase=reloaded/suppress=falseを観測し、目的外に新文書のupdateを抑止していない。
あり側では新文書await後に進んでおらず、新文書のupdateを実際に呼んだとはしない。

| 観測 | あり | 抑止 |
| --- | --- | --- |
| origin | 127.0.0.1:35153 | 127.0.0.1:37471 |
| 初回timeOrigin | 1792578696341 | 1792578710448 |
| 新文書timeOrigin | 1792578696449 | 1792578710543 |
| SW要求 | 版付き1要求、200 finish/正常close | 版付き2要求、各200 finish/正常close |

要求IDにはnative文書/登録ジョブIDがなく、2要求を特定のupdate/registerへ断定対応しない。
server finishはブラウザー本文引渡しやPromise決着ではない。記録なしから内部未発行としない。
全trialのdrop/不正メッセージ/evaluate例外/trace内pageerrorは0。
待機で失敗したあり側は後段のpageerrorゼロassert未到達であり、assert成功とは表現しない。
抑止側は元のpageerrorゼロassertも成功した。全ページの例外安全性や自然障害解決の証明ではない。

新文書の共通ソースSHA256:
`3509bc84f98be6f3d6059c0f3539acd965e03f922eb7dc92ee77df5453dba8df`。
初回あり: `193a19d5774c9cb95b1a7589876781065dfddaba7a5ff6a682e9bda092c05cc0`。
初回抑止: `3ba6281836337222b57c99d96de27d448b3192387928df9c804b29433a8ceb1d`。
原/加工ソースと差分を保存。失敗後の追加evaluate/storageState、自動復元は実行しない。

## 判断と次の問い

比較側だけ成功し、**この合成B・この各1回では初回の明示updateの関与を示す限定証拠**を得た。
ブラウザー内部のupdateジョブ/Promise決着は測っておらず、自然な製品不具合の原因確定ではない。
update削除、登録統合、readyへの代入、期限延長等の製品修正はしない。

次に判別すべき問いは、**初回updateがある文書を破棄せず別ページを開く場合にも、新しい登録の未完了が出るか**。
文書破棄がこの差に必要かを分ける候補であり、今回の結果から既に必要と断定しない。
その追加対照は今回実行していない。

原本: `/workspace/hd152-initial-update-20261021/`。
protocol-before-runs.json、契約13件ログ、両初回trace/video/単独・添付JSON、配信ソース/hash/diff、
comparison-analysis.jsonを保持。再試行はない。CI結果は同ディレクトリとPR冒頭へ記録する。
元PWA/runtime・CI外B/Cの失敗は通常CIの緑で解消扱いにしない。
旧5実null、自然DCL停止、navigation内部エラー、現SW関与、版/SW/通信/Cache API例外、
Chromium重複宣言等は別件の未解決/未確認として維持。
53例1/49/3、同期外15候補manual、5-6/iPhone実機/WebKitオフライン未確認を維持。
