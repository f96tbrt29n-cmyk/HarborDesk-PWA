# PR152：3-1 CFGの限定接続と保存操作

> 3-1初回CIとguard訂正（2026-10-31 JST）：source940154dd／CI41107517422 attempt1は全6smokeジョブがNode前段の同じ旧2guardで失敗（各580/578/2）、Full skipped・取消0。C/W試行・保存/load比較は未到達、公式case outcomeは両方null、36件のroute metadataは未生成。旧52/208と8857/9abのhashを保持する明示的な歴史射影＋現CFGの新9番目bindへ訂正し、固定imageで失敗2＋新1の3title/構文3が成功。製品/browser/入力は変更せず局所C/W6を再利用する。元局所Node15unique/16成功実行と追加3passは別記。セル26/149/61は変更0、新訂正HEAD/CIはpending。以下の局所時点pendingは履歴として保持する。


## 2026-10-31 初回CI940の停止と具体的guard訂正

検証source 940154dd2767afc111f8fd70474722a4d25136db／[CI41107517422](https://github.com/f96tbrt29n-cmyk/HarborDesk-PWA/actions/runs/41107517422)、attempt1・smoke受付1回、同HEAD再実行0。6smokeジョブは各1回のNode検査580件/578成功/2失敗で停止し、Full skipped、取消0。失敗は旧7-5第2の他52例「不変」検査（routes 91:1→94:55）と監査canonical hash検査（audit 5:1→12:204）で、意図して変えた3-1条件も旧値との一致を要求していた。初回失敗の原本は保持する。

|確認層|今回確認できたこと|未到達・欠測|
|---|---|---|
|CI前段|全6のcheckout940、image実pull b27e719e…、試験Node24.21.0、Node580/578/2と同じ2assert|PW版・ブラウザーrevisionの実検査は未到達。Actions内部Node20警告を試験Node版へ混ぜない|
|C/W・保存/load|このCIでは呼出しなし|初回/retryのcase結果・公式C/W件数・保存比較はnull。局所成功を代用しない|
|成果物・観測|公開artifact0/download0。正式attempt-log ZIP1件225,106bytes/12membersをCRC/SHA照合、公式注記6ジョブ分|予定36件のroute metadataと環境receipt6は未生成。REST一覧/個別steps連携の2経路ともsteps=[]でstep表は6件欠測。ログ中の実行を0 stepへ変換しない|

訂正は試験3ファイルだけ。旧比較ではapproved 3-1逆変換の現在hash・一意anchor・復元全文hashを検査し、歴史的な他52例×4モード=208と旧fixtureを保持する。auditは現在CFGを実条件/LOS/sourceScopeへ明示bindした上で、旧全体hashの計算だけCFG条件を既存のpre-3-1 snapshotへ戻す。58行の8857d254…と52行の9ab7ae97…は変更しない。現在のCFGは出典から独立した既存8titleを保持し、新9番目でdocs2件の条件・出典・限定範囲とwrapper1回登録を検査する。

固定image/Node24.21.0で、旧失敗2title＋新binding1titleだけを必要検証し3/3成功、構文3件も通過した。検証657 payloadはmanifest 472bf6768aa47de4b0fa4d110289e33d84bd4510203845b746bde7e4883a5b8dで閉鎖。製品4ファイル、通常browser spec/入力と他640ファイルは不変。元の局所Node15ユニーク/成功実行16と、この追加3passを同一runや総件数へ混算しない。変更のない成功8・他Node・C/W6を局所で繰り返さず、全体CI成功は新HEADでの実測待ちとする。期限・探索上限・待機・取消・例外検査は変更しない。

回収Nは761 payload、manifest 81f7bc290dc8021a82172ad089d9f3107f76a43a419fcffb2088b9aa0eec133d、closure 5c13c7bb90c857071e1ccea06650701891828bd2399fd8c74ba853eca523b519。正式解析15件のmanifest 9e1fc1e04f3614307e583f9e596d3f42d5dc558e5706a94f29f423be1f4d4c89、analysis d002378fa543e39301123aec5efad03bfc7f0ed21a051db91f52cc9be4091c10。最終独立照合 6d36fd7279bfd9dc096e843aa8afe98a0c77d5c4a1d091889fd9038680d69faeで全set/bytes/hash・6原文slice・各環境とnull/未到達を確認した。原本・実値はprivate、sharedは許可metadataだけ。

236セル26/149/61は変更0。Dの根拠は同じ行の局所6例の完了で、今回CIには保存/load観測がない。旧CIや旧load非表示・通信例外の欠測を埋めず、原因全体・保存安全性の解決としない。具体的なguardfixと記録の通常commit/push後、新HEADのsmokeを重複なく1回確認する。新訂正HEAD/CIはpending、1-5独立準備と保護対象を維持する。


---

以下は局所確認時点の記録。初回CIの未到達を埋めず、当時のpendingをその時点の履歴として保持する。


2026-10-31 JST。基準HEADは 7ef98ad4775856eee1d921962e6c5cde5720cd80。計測加工を入れない製品差分と通常試験の局所確認で、最終feature HEAD・通常smoke CIはpending。PR152ドラフト・未公開、main競合と公開保留を維持する。

## 利用者から見た変更

- 元の「正規空母2＋重巡1＋雷巡1＋駆逐2」という例だけに拘束され、出典一致の空母2＋駆逐4なども未判定になっていた。C/Fの条件が一致する既知六隻代替を限定して判定し、確認域外は未判定へ残す。
- 実際の装備行が空の場合、例の内訳判定だけで既存の任意空母攻撃機目標が付かない経路があった。3-1/index0/CFGだけ全経路条件を使って既存の空母別比較目標へ接続した。新しい必須数量を作らず、汎用row-upsertは変更しない。
- 攻撃機不足は採用空母それぞれの1個と、名称・合法な通常枠の候補を表示する。在庫0の今回の装備例は2個不足だが、通行必須・同時配備成立・購入数量の保証ではない。艦種/隻数不一致は編成見直し、未知艦/装備は未判定・上書き中止へ案内する。
- 候補図データへC→Fの1辺を追加した。元9辺の順序、nodeラベル、boss Gを保持し、派生レイアウト位置の不変は主張しない。Nodeで実renderer/consumerを確認したが、地図タブの実操作は未確認。

## 根拠と適用範囲

既存の[ぜかまし3-1](https://zekamashi.net/kancolle-kouryaku/3-1/)のC優先表L85–90・艦種定義L99–108と、[日本語wiki](https://wikiwiki.jp/kancolle/北方海域/3-1)のC表L14・F固定L20・例L81–82を照合した。新規HTTP取得0。Cは駆逐＋海防1以下のDが先行する。今回の既知六隻域では戦艦級＋空母系2以下、駆逐＋海防2以上、航空戦艦＋通常軽巡2以下を使い、通常軽巡へ雷巡/練巡を足さない。F→Gは固定。

航戦＋通常軽巡3以上は先行ランダム域を含むため「選択した固定CFGの未成立」とし、確定逸れ・到達不可能・購入必須としない。潜水母艦/水母/補給/潜水系/練巡/揚陸/海防戦艦/未知艦と四・五隻の一般判定は今回の確認域外。既知の別条件の確定不一致は未知情報で消さない。一律速力・数値索敵・特定装備個数の通行必須を追加しない。利用者が選択中の条件と明示速力を保持し、既存の非速力info優先仕様を勝手にANDへ変えない。

製品差分は map-plans.js、fleet-readiness-evaluator.js、owned-equipment-planner.js、map-images.js の4件だけ。探索上限10000/beam5/depth24/port800、既存待機・取消・保存実装・版・SWは変更しない。

## 局所結果

Nodeは新8タイトル＋影響既存7のユニーク15。接続追加に伴う必要部分だけの再検証を含む成功実行は16で、他52登録例の有限208出力比較を全59行/全実操作へ換算しない。旧sourceの意味的対照1件を保持する。

実22ファイル/23spanを使う私的入力契約は、最初の2タイトルが「装備7品を必ず保持」「未登録装備も登録済み合法」とした試験前提で失敗した。known/unknown各1回が実行されstockは未実行だった。入力・製品を変えず、提案に従う意図した装備交換と未登録manualを区別して2タイトルを訂正し、known/stock/unknownの3条件が成功した。旧失敗原本は変更しない。metadata生成側2・読取り側2も別契約として成功。

固定image digest b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29、Node24.21.0、Playwright1.55.0、Chromium1187/WebKit2203。通常smoke一覧は各889、新3件と各局所selector1件を実確認。C→Wの順、各3例をそれぞれ初回1回、workers1/retries0、45秒/結果12秒を維持した。

|対象（C/W各1）|経路／全体|初回→load後の候補数|保存操作と直接比較|
|---|---|---|---|
|known|ready／manual（制空未選択）|175→0|手持ち攻撃機0→2を提案。未指定艦戦は意図して交換し元gearとは差分、提案どおりの保存は一致。保存・メモ編集・load全文まで成功|
|stock|ready／missing|873→873|任意攻撃機0/2、名称と各空母の通常4枠候補を表示。元gear/提案保存が一致し、保存・編集・load全文まで成功|
|unknown|manual／manual|0→0|未登録装備を合法にせず上書き中止、編集なし。元データ全文保持とload全文まで成功|

全6物理試行がpassed・retry0、4保存編集＋未知2安全中止。保存側180/同一reload文書load側180の識別fieldを比較し、他編成・他海域・planner・調達sentinel・metadataと全文を保持した。ページ例外/採取失敗/保持不一致の陽性0。Storage書込み回数は未採取で、既存の読取り箇所による直接比較と区別する。全検索はincomplete/exhaustive=falseを維持し、0候補や推奨不足を最適・手持ち不可能・購入必須へ変換しない。これらの回数は性能比較ではない。

## 証拠と限界

局所実行は公開642ファイル＋専用config1のruntime643、manifest d94ad88fe267bec73c81a38dfb735f438238ab70f86dacd8599c152cba14cb7f。後の公開Git643は新記録を含む別集合で、同数を同一source集合と扱わない。HTTP配信ハッシュは未実測。

原phase849ファイルを前後/複写照合し、回収857 payloadをmanifest bb2491b63fe6aa81e7502627a26f0fc1c26bbee021ce3dfcaf870898125c08dcで閉鎖。closure 8ad74745c0bb3b35c0cd65407cae43247af066b1fd03a3faf06819b985fd4f40、独立照合 bdbe963df61e6a2453afa45a9a241c3db925ac5635abdcd12e88f64b00b1a0de。trace6のCRCと動画6の一意hashを確認した。原本/実値/trace/動画はprivate、共有は許可metadataだけで別生成し、sanitizer・外部upload0。

3-1のAは一部、B/Cは未確認→一部、Dは未確認→確認済みの3セルだけ。25確認済み/147一部/64未確認から26/149/61へ限定更新し、他58行、236セル定義、旧53区分、一部の割合換算なしを維持する。

残件は出典域外、全目標の十分数量、全在庫/搭載不可/枠競合、海域needs空配列/汎用row-upsertの一般仕様、地図タブ操作、旧goal/history二キーのC/W互換。旧load非表示・通信例外・自然保存実null/DCLの原因や欠測を、今回の成功で補完しない。一般の保存安全性や海域全体完了を証明したとはしない。

最終feature HEAD/通常smoke CIはpending。次は1-5/index1 ADFGJの独立source-only照合候補で、具体欠陥を確認するまで製品変更しない。main統合、PR151、版、SW、本番、マージ・公開・自動マージは変更しない。
