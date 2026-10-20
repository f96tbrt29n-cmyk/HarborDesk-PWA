# PR152 保存経路・通信条件・有限探索（2026-10-20）

## 基準と分類

開始時のlocal/remote HEADは442e5e5b710a6ca657bc746850ab3594f1471d65、mainは7f114a6。作業差分なし（既存node_modulesリンクだけ未追跡）。基準CI39410619128は必須6成功、Chromium672初回成功、WebKit671初回成功/1再試行成功。PR152ドラフト、PR151には変更しない。

修正した製品欠陥、fixture契約不備、意図した人工故障、未再現の自然失敗を分ける。45秒期限、元のアサーション/pageerrorゼロ検査は緩めない。

## 1. 保存経路と確認した別件欠陥

[入口/実行条件/対象キー/方法/既存テスト/旧失敗証拠の一覧](pr152-storage-write-paths-ja.md)、[JSON](pr152-storage-write-paths.json)を追加。低層backup/snapshot適用helperは複数キーを削除できるが、旧traceで呼び出された証拠はない。メソッド監査に削除がないだけでブラウザー内部の物理消失を否定しない。

プランナーのhdFCLoadAllがStorage.getItemの例外を{}へ変換するため、hdFCStateの初期値保存/hdFCSaveStateで、別海域の保存プランが消えることを隔離VMで確認した。両経路とも修正前は例外なし/書込み1回/元プラン消失。既存実ソースでの回帰は2失敗/通常経路1成功となった。

初版ではStorage読取り例外を伝播させ、書込みを防ぐことをNode3件/実ブラウザー2件で確認。その後、読取り専用の一覧取得への波及を避け、最終版はhdFCLoadAll(strict)とし、state初期作成/save/reset/提案取込の4入口だけstrict=trueに限定した。読取り専用は従来のfallbackを維持する。書込み経路はStorage例外とJSON構文エラーを元のまま伝播し、空データとして上書きしない。レビュー時の新2ケース（読取り互換/不正JSON保護）は初版で失敗、最終Node5件で成功。実ブラウザーの該当2件も最終版で再確認し、いずれも初回成功/再試行0。実ブラウザーではstate/save/resetの各呼出しに読取り例外を注入し、6キー非null/完全一致、例外の同一性、復旧後の通常保存が他プランを保持すること、pageerrorゼロを確認した。例外を除外/握り潰して成功にしていない。

**この別件欠陥は、旧5キーnullの原因と確定していない。** 旧記録は例外ではなく実null。正しい未保存と読取り異常のnullの区別、JSON構文として有効だがschemaが異なる値、他のmerge経路の読取り例外影響等は包括的に解消していない。API例外が起きた際のUI通知も今回の小変更で全面整備したものではない。

旧5nullの境界は再読込前の5文字列→起動待ち後の5nullの間。旧pagehide/init/DCLの保存値は未計測で、補完しない。同じorigin/contextの記録を尊重する。新しい自然失敗は今回の限定試験では観測していない。442e5e5の境界診断は再実装せず、失敗後のevaluate/storageState取得/自動復元もしない。

## 2. 通信の応答条件

SW無効の隔離ページで製品hdFetchVersionMeta/hdFetchLatestVersionの実ソースを使い、各条件/各エンジン1回（14+4観測実行、再試行0）を実施。正常、外部204、外部503、local503、両503、要求受付後/ヘッダー前の遷移取消、明示CORS不一致、両要求abortを分離した。

- 旧fixtureの204はJSON本文を持たず、version取得のJSON契約を満たさない。ただしPlaywright1.55は省略されたcross-origin CORSヘッダーをOrigin付きで補完するため、「指定なし=実応答CORS欠如」ではない。14試行では旧pageerrorは再現せず、単純な取消でも同じ例外は観測しなかった。
- 明示した誤ったAccess-Control-Allow-Originでは、WebKitのみ外部versionのaccess-control pageerror1件を観測。Promise.allSettledによるlocal fallback自体は成功した。Chromiumではpageerrorなし。これはその人工条件での因果であり、旧初回の応答ヘッダーと同じだった証拠ではない。旧local fallback側のaccess-control例外も説明しきれていない。
- HTTP503/abortの失敗は製品Promiseで処理され、fallback成功または期待するversion fetch failedへ到達。今回の条件ではpageerrorなし。CORS例外、Cache API例外、DCL停止、5nullを統合原因にしない。

製品fetch処理には根拠のない変更を加えない。sync-receive-uiのfixtureだけ、versionを正常200 JSON/CORS、外部失敗/local失敗/両失敗は明示503にした。その他の外部要求の既存扱いは維持。初回traceを保持し、version要求/応答ヘッダー/終了・失敗を値や署名URLなしで単独JSONへ保存する。新しい版比較/受信/再読込の4ケースと既存2ケースを両エンジンで実施し、12件初回成功。新4ケースは全6キー非nullを前後に確認し、完全一致/受信状態/pageerrorゼロを検査する。URLによる例外除外はしない。

これはfixture契約の修正であり、旧初回の通信pageerrorの根本原因解決とは宣言しない。人工的な誤CORS条件のpageerrorを通常の通信成功へ合算しない。

## 3. DCL仮説1つ、2実行で終了

仮説は「同じscopeに対する版付き/版なしSW登録URLの切替が関与する」。WebKit空母夜戦保存の通常条件1回、隔離fixtureでregister URLをv580へ正規化した条件1回。未加工SWの本文は同一、retries=0、元45秒/元アサーションを維持し、事前protocolへ条件/回数/hashを記録した。

両方初回成功。新文書のcontrollerchangeは通常1回/対照0回、DCLは各773ms/365ms、pageerror0、6キー非null保持/方針復元成功。1回ずつなので性能差の統計や一般的な否定証明ではない。切替だけが必ず停止を起こすという説明には反例となるが、タイミング条件下での関与は否定できない。未再現で終了し、追加反復はしなかった。この2試行は初版f7f8a6bのplanner実装で実施した開発snapshotで、最終strict書込み限定化後にDCL対照を再実行していない。対象の静的script/SW/夜戦fixtureは同じ。

元の自然停止はHTML本文終了、script1〜45の要求記録のみ、30秒loading/resource0、SW activated。通信未発行/本文停滞/SW原因を欠測だけで確定しない。登録正規化fixtureも製品修正や自然停止原因の証明へ置き換えない。

再現用生成器tests/sw-registration.experiment.cjsは新しい証拠ディレクトリだけへコピー/設定を出力し、既存証拠を上書きしない。実行したprivate copyとはrequireの絶対表記だけが異なる。通常CIにこの登録正規化は導入しない。

## 4. 2-5北の新しい有限領域

固定土台は同じ6艦、主砲、異なる2艦のドラム缶、3大型電探。既存7変数のうち扶桑の通常slot2/3、羽黒slot2、那智slot2の4枠を自由にした領域を追加。他のcritical枠/全増設は固定、同期seed shortcutは無効。数値選択は空/強風改二/水観★4/水観★0の4^4=256通りで、在庫・搭載可否・制空42以上・索敵49以上を独立oracleで列挙すると6候補。

製品探索は両エンジンで65候補を調べて独立6候補中の1件を返した。索敵49.45874542459708、制空66、低速/ドラム缶2艦/在庫/固定枠保持。返却ベクトルは[2,1,1,1,2,2,3]で独立列挙に含まれる。新ケース2件初回成功。既存2/3枠の探索上限は変更せず、新4枠だけmaxExamined2500/depth4。探索はbeam-limit/exhaustive=falseであり、存在と返却1件の一致を、候補6件すべてを製品が発見した証明や一般探索の網羅性にしない。registeredReadyはfalseのまま。

同期外15候補の[艦形態/Lv/装備/改修/通常slot位置/不足根拠](pr152-north-unsynchronized-bonus-gaps.json)を旧資料から対応付けた。入力41等は専用合成fixtureで、実ゲームの艦別ボーナス出典ではない。差分を0と仮定しない。15候補は索敵manualを維持。

FC共通読取りの変更に対し、5モード・装備交換保護・2/3枠・個体ID/空スロット・司令部/在庫更新・保存/再読込/プランナー再判定・PWA5キー一致の関連18実行を両エンジン/再試行0で実施し、すべて初回成功。初回/再試行の証拠は別資料で保持する。

## 証拠と残件

証拠ルートは/workspace/hd152-path-audit-20261020。planner-read-before-measurement/前後ログ、planner、response/extra-response（意図した誤CORSを含む）、sync、dclとprotocol/比較、north、regression、既存原本は従来の証拠ルートに保持。新しい自然失敗がなかったため、この限定試験に自然失敗の初回traceはない。修正前の隔離失敗と人工制御をその代用にしない。CI最終結果はPR冒頭/最新結果欄へ記録する。

53例は全条件1/一部49/未確認3のまま。5null/旧45秒DCL停止/旧通信2例外/Chromium重複宣言2件/Cache API例外は未解決。5-6、実機iPhone、WebKit offlineも未確認。PR152ドラフト維持、PR151変更なし、マージ/公開/自動マージ有効化なし。
