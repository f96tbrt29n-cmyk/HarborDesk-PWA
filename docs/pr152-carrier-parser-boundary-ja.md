# PR152 空母夜戦保存のparser境界診断

2026-10-21 JST、基準4d80b8f39420031465290297c31b49d58fa95195 / CI39472643899からの継続。開始時local/remote一致、追跡差分なし。既存node_modulesリンクと証拠を保持。本差分は診断・契約・記録のみ。製品39801e0、保存形式、SW本文/登録処理、版580、攻略/探索/保存UIは変更しない。

## 設定と記録の意味

対象はnight-policy-reload.spec.jsの `carrier night CI policy persists and regenerates the mobile loadout` 1ケース。通常CIではparserBoundary=true、parserLoadBoundary=42。限定OFFはproject metadata parserBoundary=falseで指定する。他の夜戦ケースは従来設定、PWAは引き続き40番load境界。40と42の両方は採取しない。

既存のscript load/error、30秒watchdog、DCLを再利用し、新timer/MutationObserver/全量DOM snapshot/layout/本文取得/script変更/SW APIラッパーは追加しない。同一文書につき選択load・watchdog・DCLの各理由を最大1回、計3件。送信元は同じ理由の再採取を抑制し、受信側も理由別に枠を保持して重複をparserBoundaryDroppedへ数える。生native ringは既存1024件、summaryの3件は独立して成功時単独JSONにも残る。受信側は設定した40または42のreasonだけを受け付ける。

先頭128 script要素のみを実際に読み、6つの既存対象名の有無、最初の一致要素のconnected/URL/ordinal/async/defer/type/load・error観測を保持。追加のmatchCountは**走査範囲内**の一致数、ordinalsは先頭4件まで、matchesTruncatedはその位置一覧の切詰め。同じURLの重複/動的挿入の可能性を識別し、ordinal=43だけで静的HTMLの43番と断定しない。最初の一致要素の属性が他の重複要素にも当てはまるとはしない。DOM上限truncatedとは別の上限である。

|記録|解釈|
|---|---|
|その理由のparser-boundaryなし|その時点の存在は未観測。不在とはしない|
|記録あり、present=false、truncated=false|当該採取時、全script collectionに対象名の一致なし|
|present=null、truncated=true|先頭128で見つからず、上限外は判別不能|
|present=true|範囲内で一致を観測。static起源/通信完了/評価完了は未証明|
|matchCount>1、またはtruncated=true|重複・上限外のため唯一の要素という推定は不可|

受信欠測、Resource Timing欠測、script load欠測、SW内部未計測をこの三値へ混ぜない。存在/不在からpreload等の内部通信発行を断定しない。

## 契約検証と事前限定条件

Nodeはnative5件/evidence10件、15件初回成功。既存PWA40境界も契約で維持。人工契約では、42だけの発火、対象あり/なし、watchdog、同一理由の重複、128番より先を読まないこと、不明null、重複位置4件への切詰め、受信3枠、raw ring切詰め後のsummary/単独JSON保持を確認。人工契約のwatchdogを自然停止の証拠にしない。

隔離プロフィール・WebKit・未加工SW・元fixture・45秒・retries0、OFF1回→ON1回、結果に関わらず2回で終了と事前指定した。専用6非null fixture(retentionFixture)は有効にしない。PWA比較/既存SW契約/2-5北組合せは反復しない。証拠rootは `/workspace/hd152-carrier-parser-20261021`、protocol.json/configとログを保持。

初版のprivate grepを全タイトル先頭へ固定したため0ケース/No tests foundになった。ログをcarrier.logへ保持し、private設定のみを訂正、--listで対象2件だけと確認してから実行した。製品/元アサーション不備やテスト再試行ではない。

## 限定実行の結果（2回で終了、再試行0）

**OFFは最終失敗**。reload6527→DCL7316→6要素比較8072→方針復元8122msまで到達したが、7668msのpageerror `Service Worker context closed` / `Cannot load .` で既存ゼロ検査が失敗した。stackは空。DCL停止ではなく、発生文書/API/内部要求との対応も未確定。例外除外・SW無効化・成功を得る再実行はしない。parser設定OFFのため境界/Watchdog/DCL parserメタデータなし（native DCLはあり）、nativeDropped0。

**ONも最終失敗、自然45秒DCL停止**。profileはunmodified SW/allow/resourceTiming=true/parserBoundary=true/parserLoadBoundary=42。reload5599ms、新文書doc=1792530566969。Node受信36048ms、文書at30405msのloading-watchdogを保持した。scriptCount=1/truncated=false、全6対象がpresent=false、43 update-manager.jsのmatchCount=0/ordinals=[]。選択42loadとDCLは未観測（全script load0、readyState loading）。したがって採取の3枠中1件であり、記録上限で境界/DCLを落とした結果ではない。nativeDropped0/parserBoundaryDropped0/resourceDropped0/bufferFull0。Resource Timing完了0、pageerror0だが正常ではない。

|ON新文書の観測|1 app.js|40～42|43 update-manager.js|44/45|
|---|---|---|---|---|
|page/context request|6059ms id184|6068ms id223～225|6068ms id226|6068ms id227/228|
|response/requestfinished/requestfailed|いずれも欠測|同左|同左|同左|
|Resource Timing / load|欠測|欠測|欠測|欠測|
|30秒parser一致|本診断6名の対象外、collection全体は1要素|false|false|false|
|評価完了マーカー / SW内部処理|未計測|未計測|未計測|未計測|

HTMLはSW応答200、Node受信6016ms、requestfinished6068/6069ms、報告本文サイズ13343 bytes。init時controllerは版なしsw.js/activated、観測上6075msに版付きv580/activatingへcontrollerchange、6076msにactivated、30秒もactivated。ブラウザー要求とnativeイベントの**受信ms**は同じNode時計、native atは文書時計なので直接減算しない。SW切替と停止の因果、応答/body/SW引渡しのどこかは未確定。

新しく除外できる範囲は、この文書の30秒で「43が既にDOMにあった」「43の不在表示が診断欠測/128上限のためだった」という説明。43のrequestは実際に記録されているため「DOM不在なら要求通知もない」はこのケースでは成立しない。ただし内部取得経路がpreloadだという確定も、元CIの未記録要求の補完もしない。新文書では42loadのDOM採取自体が未実行だったが、旧文書の採取や初期化によるタイミング介入は残り、診断無影響/根本原因解決とはしない。

保存はONのpre-reload→pagehide→新initで投入2キー非null・長さ87/74とハッシュ一致。他4キーは元からnull。app.js load/DCL/復元後比較は未到達で、それ以降未確認。ハッシュ一致を完全一致としない。OFFは元6要素文字列比較成功だが、全6非nullの証拠ではない。旧5実nullとは区別する。

両失敗とも初回trace.zip/video.webm/画像/reload-navigation-evidence.json/pwa-storage-audit.jsonを保持。再試行自体なし。失敗後evaluate/storageState/自動復元なし。ONのlocal-natural-stop-analysis.json、storage-boundaries.json、local-results.jsonは原本からの読取り専用解析。動画35秒抽出も保存する。原本はcarrier-valid/artifacts配下。

## 通常CIと残件

この診断をコミット/push後、通常必須6ジョブを確認し、結果と新しい自然失敗の有無はPR冒頭へ最終HEADに対応して記録する。ローカル2失敗/人工契約/0ケースの選択不備/通常CI初回・再試行を合算しない。今回の局所目的は停止時に43DOM存在を区別できる設定/保持であり、製品不具合を解決したものではない。

次は通常CIの同ケースで、同一文書の選択42load/watchdog/DCLとrequest/resource/load/SW状態を照合する。自然停止が出なければ追加のOFF/ON反復をせず、この設定で次の関連実行の証拠を待つ。旧自然停止の欠測を新成功で補完しない。

PR152はドラフト維持、マージ/公開/自動マージなし。PR151未変更。製品39801e0の限定保存保護を維持し、旧5null、45秒DCL、旧SW例外と内部register/update対応、Chromium重複宣言、旧通信/Cache APIは未解決。53例1/49/3、同期外15候補manualを維持し、5-6/iPhone実機/WebKitオフラインは未確認。データ消去・アプリ削除・開発者ツールを利用者へ要求しない。
