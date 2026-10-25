# PR152: PWA再起動後の5キーnullの切り分け

## 既存CI 39163241212で確定したこと

45967a2のWebKit初回失敗を再利用した。traceの評価式は `keys => keys.map(k => localStorage.getItem(k))`、引数は取込時と同じ5キーで、戻り値が実際に5つともnullだった。別APIの代替値や診断JSONの欠測値ではない。再起動前には5つの文字列が存在した。

reload/DCLは約280msで完了。その後のアプリ起動待ちが約21.43秒。観測時計23485〜23490msに49要求が `WebKit encountered an internal error` で失敗し、23879msに `hdSortieEquipmentCheckHtml` 未定義の例外、その後にgetItemの5nullを観測した。全45本の静的scriptはload/resource完了を記録しており、この事象を同期script/DCLの45秒停止と分類しない。欠落した動的依存との関係は要調査。

同じtraceのBrowserContextは1つ、ページIDも同じ。記録された主フレーム遷移はすべて `http://127.0.0.1:4173/`。context-optionsにstorageState設定はなく、対象テストは組込みpage/context fixtureを使い、newContext/newPage/storageState/明示的clearを呼ばない。テストの各試行は独立contextなので再試行成功は元プロフィールの回復を意味しない。

ただし同じURL/context/pageであることだけでは、ブラウザー内部の保存領域・プロセス障害を除外できない。旧計測にはStorage操作履歴・crash/disconnected履歴がない。**物理的な消失、読み取り領域の異常、アプリ内部の削除のどれかは未確定**。内部エラーが先行したことは因果関係の証明ではない。

## 呼出し経路の静的確認

製品JSにlocalStorage.clear呼出しやgetItemの置換は見つからなかった。バックアップ取込のhdApplyBackupLocalStorage、スナップショット復元のhdPHApplyHarborDataには、取込内容にないキーをremoveItemする処理がある。呼出し元は取込/復元トランザクションであり、このテストに対応する操作はtraceにない。ただし、実行時の呼出し履歴がない旧失敗について「呼ばれなかった」とまでは断定しない。SWの旧キャッシュ削除はCache Storage操作で、localStorage削除の記録ではない。

## 対象テストのみの追加診断

tests/pwa-storage-audit.cjsをPWA再起動1ケースだけへ導入。公開コード・SW・保存形式・復元処理・攻略判定は変更しない。

- init、DCL、readyState、pagehide/pageshow、load、controllerchange、再起動直前、アプリ起動待ち完了時、既存の一致/復元検査完了時を記録する。起動待ち完了は復元関数内部の完了そのものとは区別する。
- 6キーの存在/長さ/比較用prefix FNV32を記録。最大65536 UTF-16単位までの非暗号学的ハッシュで、超過はtruncatedを明示する。保存値そのものは新しい診断に出さず、元の文字列完全一致アサーションを維持する。
- 専用context識別子・ページラベル・文書timeOrigin・origin・クエリ/認証/hashを除いたURL・SW controllerを記録。crash/close/disconnected、新規ページ生成もNode側で記録する。OS内のNetworkProcess異常を直接検出するものではない。
- Storage.prototypeのsetItem/removeItem/clearは元のメソッドへ先に委譲し、成功した対象操作だけをキーと呼出しスタックで記録。getItemは置換しない。sessionStorageや無関係なキーは記録しない。例外/プロパティ代入/別realm/ブラウザー内部での削除を完全に捕捉するものではない。
- 各文書256記録、Node側1024記録で上限を明示。失敗時は追加evaluate/storageState取得をせず、受信済み履歴を添付する。監視自身が書込み・初期化・自動復元・追加fetchを行わない。
- 単独のpwa-storage-audit.jsonを出力し、CIのalways成果物へ明示追加。初回失敗後に再試行が成功した場合も、初回と再試行のファイルをそれぞれ保持する。ブラウザーconsole/trace内にも同じ受信元記録が残る。

既存の準備データ、45秒期限、アサーション、Chromiumのoffline再読込/WebKitのonline再読込を維持。元のtraceには専用fixture値が含まれるが、今回の追加成果物は値を複製しない。

## 限定ON/OFF比較

未加工SW、隔離contextで両エンジン×診断OFF/ONを各1回、再試行0で実施。4件すべて初回成功。WebKit OFF13.068秒/ON10.599秒、Chromium OFF11.519秒/ON13.088秒。固定順序の各1回なので性能差の評価や計測の無影響証明にはしない。今回nullや49要求エラーは再現していない。

ONの両エンジンで同じcontext/origin内の文書2つ、再読込前後の5キー存在、既存の文字列完全一致、先制対潜4艦/HQ20/個体所有判定が成功。診断は各5回のsetItemを記録し、clear/removeItem、新規ページ、crash/disconnectedは記録なし。6番目のharbordesk-pwa-v1はこの元fixtureでは未投入で前後とも不存在であり、この4件を「6キー非null保持」の証拠にはしない。従来の専用6キーON/OFF検証4件の証拠はそのまま保持し、再実行していない。

診断Node検証16件成功。Storageのreceiver例外/値変換回数/戻り値を維持すること、値とURL秘密の非出力、上限、観測失敗時の挙動、失敗保存時にページ評価やstorageState取得をしないことを確認した。

証拠: `/workspace/hd152-resource-timing-20261019/ci/` の初回trace/video/要求履歴/5null監査と、`/workspace/hd152-storage-audit-20261019/` のcontext-options、impact/summary.json、impact-comparison.json、node-final.log。既存原本は保持。

## 未確定・次の証拠

次の自然な失敗で「pre-reload→pagehide→新文書init→DCL→起動完了前」のキー状態と、削除/上書き履歴、同じcontext/origin、crash/disconnected、49要求失敗の順序を照合する。新文書initですでにnullか、起動中に変化するかを先に切り分ける。成功を増やすだけの反復は行わない。

DCL停止、通信/Cache API例外、Chromium重複宣言2件は別途未解決。2-5北の同期外15候補は索敵未確認、一般探索の網羅性も未証明。53例は全条件1/一部49/未確認3のまま。iPhone実機/WebKit offline/5-6も未確認。PR152はドラフト維持、マージ・公開しない。PR151には変更しない。
