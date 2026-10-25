# 全通常海域の登録経路・装備条件（v1.0.576）

2026-10-25の現状は[自動編成・手持ち配備の対応表](current-auto-loadout-coverage-ja.md)を参照。公開579と未公開PR152、37海域53例/選択目標別59行、実装・検証・不足案内の限界を分けている。以下はv576当時の登録記録。

2026-10-13確認。37海域すべて、既存53編成例の経路別条件を構造化した。以下は登録経路の範囲であり、任意の編成や全任務・イベント・全分岐の網羅完了を意味しない。1-2/1-3/1-4/3-2の検証済み分岐グラフは維持。5-6は出典の暫定条件を表示し成立保証を出さない。

## 判定と配備

- 艦種・隻数・実装備後の速力・史実艦・旗艦・33式係数と閾値・装備を載せる異なる艦の数を評価。未知の艦、未確認同期値、未登録経路は未判定を維持。
- 2-5北BFJOは係数1/49以上、配備後の低速艦1隻以上、ドラム缶装備2隻以上。同一艦の複数個や無効スロットは数を増やさない。自動選択は航空戦艦がいなければ低速戦艦の代案も選べる。
- 索敵は選択経路ごとに計算。南ルート・別ゲージ・別分岐の値を流用しない。装備ボーナス差が未確認の提案は、概算が閾値を超えても通行成立と断定しない。
- 対潜海域は複数艦のソナー＋投射機を目標に配備し、手持ち不足も必要組数で表示。先制対潜発動は別判定。
- PT装備は同じ艦のセットを判定し、5-6第1・7-5第2だけの推奨とする。命中率・撃破率を算出するものではない。
- 空母は艦戦・偵察機だけの配置を攻撃機ありと扱わず、各艦の正の搭載枠に攻撃機を推奨。6-3水母は水上爆撃機を推奨。
- 対地・制空・防空・夜戦・渦潮電探・輸送の自動目標を経路/ゲージ別に選ぶ。これらの戦闘準備と通行必須条件は分けて表示する。明示した手動夜戦目標は保持。
- 自動配備・手持ち探索・最適化・保存編成・計算プランナーは共通条件を参照する。既存手動プランナー入力を勝手に上書きしない。保存編成の明示再読込で係数を更新し、装備と素索敵入力を保持。

## 経路一覧

「数値条件未掲載」は登録経路の資料に数値索敵条件が掲載されていない意味。未登録経路の条件なしを示さない。艦種等の個別条件はアプリと `HD_MAP_ROUTE_REQUIREMENTS` に表示。

|海域|登録経路|33式係数 / 必要値|判定範囲|出典|
|---|---|---|---|---|
|1-1|AC|数値条件未掲載|登録例・random|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-1/)|
|1-2|AE|数値条件未掲載|既存分岐グラフ|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-2/)|
|1-3|CFJ / A(DB)EFJ|数値条件未掲載|既存分岐グラフ|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-3/)|
|1-4|BCF(E)HL / AD(EH/GJ)L|数値条件未掲載|既存分岐グラフ|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-4/)|
|1-5|ADEJ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-5/)|
|1-5|ADFGJ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-5/)|
|1-5|ADFGJ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-5/)|
|1-6|AEGFBN|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/1-6/)|
|2-1|C(E)DH|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-1/)|
|2-2|CE(GH)K|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-2/)|
|2-3|ボス方面・経路ランダム|数値条件未掲載|登録例・random|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-3/)|
|2-4|ボス方面・経路ランダム|数値条件未掲載|登録例・random|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-4/)|
|2-5|BFJO|1 / 49以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-5/)|
|2-5|CEIO|1 / 34以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/2-5/)|
|3-1|CFG|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-1/)|
|3-2|選択したC…L目標|数値条件未掲載|既存分岐グラフ|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-2/)|
|3-2|選択したC…L目標|数値条件未掲載|既存分岐グラフ|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-2/)|
|3-3|ACGM|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-3/)|
|3-4|ACEGJP|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-4/)|
|3-5|FGK|4 / 28以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-5/)|
|3-5|BDHK|4 / 40以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/3-5/)|
|4-1|CFDGJ / ABDGJ|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-1/)|
|4-2|ACL / BDCL|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-2/)|
|4-2|ACL / BDCL|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-2/)|
|4-3|CDHN / CFHN|数値条件未掲載|登録例・random|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-3/)|
|4-4|AEIK|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-4/)|
|4-5|ADHT / CDHT|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-5/)|
|4-5|ADHKT / CDHKT|2 / 71以上|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-5/)|
|4-5|ADHT / CDHT|数値条件未掲載|登録例・multiple|[攻略資料](https://zekamashi.net/kancolle-kouryaku/4-5/)|
|5-1|BCFJ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-1/)|
|5-2|BCEFO|2 / 70以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-2/)|
|5-3|DGIOKEQ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-3/)|
|5-4|ADEHIJMP|2 / 45以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-4/)|
|5-5|BKPS|2 / 80以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-5/)|
|5-5|BFDHNOS|2 / 66以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-5/)|
|5-6|ABC2DEG|4 / 65以上|暫定・未判定|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-6/)|
|5-6|IJKLN|4 / 80以上|暫定・未判定|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-6/)|
|5-6|IOQUXZ|4 / 88以上|暫定・未判定|[攻略資料](https://zekamashi.net/kancolle-kouryaku/5-6/)|
|6-1|AFGHK|4 / 25以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-1/)|
|6-2|CEJK|3 / 50以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-2/)|
|6-3|ACEGHJ|3 / 38以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-3/)|
|6-4|BDCFN|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-4/)|
|6-5|ACDGM|3 / 50以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-5/)|
|6-5|BFIJM|3 / 35以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/6-5/)|
|7-1|DEGHK|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-1/)|
|7-2|CEG|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-2/)|
|7-2|BCDIM|4 / 69以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-2/)|
|7-3|ACE|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-3/)|
|7-3|ACDGJP|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-3/)|
|7-4|ABEJLP|4 / 37以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-4/)|
|7-5|ABDFGHK|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-5/)|
|7-5|ABDFJOQ|数値条件未掲載|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-5/)|
|7-5|ABDFJOPT|4 / 63以上|登録例・documented-example|[攻略資料](https://zekamashi.net/kancolle-kouryaku/7-5/)|

## 保存と検証

6種類の既存保存キーは移行・削除・初期化しない。既存routePreset識別を保ち、routeAssessment/proposalに任意の評価情報を追加する。頻回HP同期は追加しない。

v576最終テスト結果はPRに追記する。新規回帰は37/53登録、未知艦、2-5の実スロット・低速維持・ドラム缶分散、複数対潜配備、PT、ゲージ別条件、航空攻撃、保存係数を対象とする。

## 残る範囲

未登録の別編成・任務限定条件・イベント海域・全分岐グラフの追加、5-6暫定条件の確定、艦固有索敵ボーナス差の完全評価、戦闘勝率/撃破保証、実機iPhoneのオフライン再起動は未完了。基地航空隊の部隊数・半径等は既存基地プランナーと経路注意に残し、本隊装備の充足から基地準備まで成立と断定しない。

## PR回帰の修正（2026-10-14）

台帳が保存された状態の再起動では、自動編成が装備判定モジュールより先に初期化されて例外を出し、その後にある経路選択ハンドラーが登録されなかった。初期化時は判定モジュールの準備を確認し、モジュール読込完了時の既存再描画で共通条件を反映する。保存経路から「すべての候補」へ戻す既存回帰に、再起動後もページ例外がない検証を加えた。

個別に与えた隻数・艦種等の条件は、海域の一般的な条件で消さない。所持艦台帳が空のケースは、装備目標の充足と所持艦の未充足・未判定を併記する。

旧テストの架空艦を実艦へ置換し、数値探索のテスト用条件は選択経路のfixtureに設定する。実際の1-1に索敵や敵航空機の条件を追加しない。2-5の統合評価は北経路の係数1/49を検証し、索敵を満たしても低速艦・ドラム缶がない駆逐6隻は経路不足とする。

失敗していた判定8件と全海域候補/経路保存4件はChromiumで再試行なしに成功。その他の最終結果とCIはPRの最新記録を参照。
