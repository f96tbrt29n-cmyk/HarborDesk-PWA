# PR #152：再読込の段階記録とpolicy fixtureの契約

2026-10-18 JST。基準937663b、CI39079102444。製品コード・保存形式・攻略閾値・版/build/cacheは変更しない。ドラフト維持、マージ・公開なし。

## 初回資料で分かる範囲

前CIはChromium668初回成功、WebKit667初回成功/1再試行成功。空母爆撃CI方針の初回は配備成立・画面幅検査後、page.reload(domcontentloaded)で45秒全体期限に到達。初回video（50.168秒）とerror-contextは保存、traceはretry1のみで、限定JSONもこのケースにはなかった。再試行traceのreloadは約368ms。再試行の速度から初回の速度を推定しない。

初回動画末尾はスタイル付きHOME、専用fixtureの艦娘1/装備2。サーバーGETがない期間はSW/ブラウザーキャッシュ内の要求を観測できず、要求未発行とも区別できない。初回のネットワーク要求、SW応答、DCL、同期復元・描画の正確な到達順序は依然不足している。保存6キーの不一致は確認していないが、初回停止後の一致を確認したとも報告しない。

前CIの成功対象2件のJSONには起動と再読込のDCLが各2回。Chromiumは再読込要求→DCL 3.308秒/2.130秒・例外0。WebKitはそれぞれreload前3698ms/3672msに `s.missing.length` の例外を1件記録。メッセージだけでstack/自然な呼出し元は残っていなかった。テスト成功をページ例外0と扱わない。例外があっても再読込成功した事実は、45秒停止の原因と即断しない理由でもある。

## fixtureで確認した問題と最小修正

前回の限定契約比較を再利用：policyテストの部分的な編成オブジェクトにはmissing/info/filled/lowなどがなく、hdFSSuggestionHtmlへ直接渡すとfleet-suggester.js212:24で同じ例外が発生。実際のhdFSGenerateの戻り値では描画成功。自然発生CIの呼出し元までは同定していないが、共有の描画関数へ流れるfixtureが契約を満たさない問題は確認できる。

対象3件のhdFSPlansは、実際の所持台帳を読むhdFSGenerateから「駆逐1/正規空母1」の結果を得る形へ変更。装備方針テストとして元から指定したneeds=[]は維持。所有1艦の選択と実際の描画が成功することも検査し、例外を防ぐためだけの製品側fallbackは追加しない。既存の装備・CI成立・増設・画面幅・保存方針のアサーションは残し、未捕捉pageerrorがないことを追加検査する。

これはfixture契約の修正であり、Safariの初回reload停止の製品修正ではない。

## 足りない証拠を残す計測

夜戦DD・空母戦闘機・空母爆撃CIの3件だけをnight-policy-reload.spec.jsへ移動し、通常CIリストへ追加。元の3件を削除したままにはせず、同じ題名・アサーション・45秒期限・モバイル条件を維持。Playwrightのtraceはworker設定のためdescribe内で変更できず、ファイル単位で対象を限定する必要がある。

Node側にreload-start/reload-domcontentloaded/policy-restoredの単調時刻を残す。request/response（fromServiceWorker）/requestfailed/主フレーム遷移/DCL/load、pageerrorのname/message/stackも保存。再読込で記録を消さず、finallyの退避はブロックされたページのevaluateに依存しない。初回失敗のtraceと動画も既存のCI artifact対象に残す。

### 診断自身の負荷も区別する

最初のretain-on-failure設定（DOM snapshotsあり）の限定実行は8件中6成功/Chromium2失敗・再試行0。失敗資料はafter-resultsへ保持。1ケースのsnapshot最大15.899秒/合計25.994秒、もう1ケースは最大7.912秒/合計22.996秒。重複宣言（HD_AG_NAME_ALIASES/HD_RESOURCE_GOALS_KEY/hdEFCheckV44Base）も発生し、equipment-acquisition-guide.jsは初回HTTP 200/8.198ms、再試行要求は約17.2秒後。診断を追加したこの実行は元のWebKit初回失敗と同一条件ではない。

過去にもmain contextでの大きなDOM採取が予約描画を遅らせる証拠があるため、最終の対象3件はsnapshots=falseでfirst-failure traceを保持する。ネットワーク・操作・source・画面画像・動画・Node段階/例外記録は残す。製品のDOMや期限、検証条件を変える回避はしない。元のChromium重複宣言2件の評価順序は未確認のまま。今回の新しい別モジュールの重複宣言をその原因確定へ読み替えない。

## 2-5北

独立列挙した有限在庫16候補を実配備形式へ変換する回帰を恒久化。艦種/低速/ドラム缶2艦などの他の必須条件、改修別在庫、搭載合法性、33式と制空の独立数値を同時検査する。同期と同じ1候補と異なる15候補を区別し、同期外15候補は索敵未確認・総合攻略可能falseを要求する。全16候補を一般探索が必ず発見する検証ではない。

同期表示索敵D、装備素性能R、現在ボーナスB_oldに対し、新配備ではsqrt(D-R-B_old+B_new)の差分が必要。既存資料の2021年表を現行仕様へ外挿せず、KC3Kai固定コミットdb1e102da2315299d543cfc90003929dc377c111のFleet.eLos4/Ship.nakedLoSとの照合を継続。新しいボーナス値や0扱いは登録しない。

全条件検証済み1／一部49／未確認3を維持。2-5北の同期外ボーナス・一般探索網羅性、5-6、実機iPhone、WebKitオフラインは未確認。保存6キー・個体ID・改修・装備位置・5モード・同期/プランナーの既存成功証拠は保持する。

## 証拠の場所

既存 `/workspace/hd152-reload-20261018/` は変更・削除しない。今回 `/workspace/hd152-reload-20261018-next/`。before.logはdescribe内trace指定不可による設定エラーでテスト未実行。before-stackは元fixtureでWebKit3初回成功/再試行0、自然例外は再現せず。afterは上記6成功/2失敗、最終診断設定の結果はPRへ記録する。

### 最終設定のローカル結果

finalは8実行中7初回成功/1失敗/再試行0（約1.2分）。全6件のpolicy機能アサーションとpolicy-restored段階には到達。WebKitの夜戦DD1件は、追加した「ページ例外0」の検査で失敗した。記録されたのは上流GitHub API2件のFetchアクセス制御と、sw.jsへのアクセス制御1件。hdDXGithubHead→hdDXUpstreamFreshness→hdDXCollectのstackを保持。例外の発生は約11247～11280ms。missing例外ではなく、ネットワーク/ブラウザー環境と製品の因果は未確定。Service Workerを無効化したり、例外検査から除外したりして合格扱いにはしない。新設定でも安定成功を主張せず、CIとの結果差を記録する。

新規16候補回帰は両エンジン初回成功。同じ同期候補1/未知の15を区別し、他の必須条件と在庫/搭載合法性も通過。Node24件成功。既存の保存6キー等は前回の成功証拠を保持し、今回の8件で全機能を改めて網羅したものではない。製品ファイルとデータ形式は変更していない。
