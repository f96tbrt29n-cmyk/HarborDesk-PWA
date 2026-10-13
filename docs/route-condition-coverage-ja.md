# 海域ルート条件の登録状況調査

v1.0.570の登録済み編成例を調査。艦種・隻数を解釈できることは、全分岐・ランダム逸れ・ゲージ段階・索敵条件の網羅を意味しません。海域ごとの出典を確認して、経路と分岐条件を明示的なデータに整理する必要があります。

| 海域 | 登録編成例 | 速力条件あり | 数値索敵データあり | 出典 |
|---|---:|---|---|---|
| 1-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-1/) |
| 1-2 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-2/) |
| 1-3 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-3/) |
| 1-4 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-4/) |
| 1-5 | 3 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-5/) |
| 1-6 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/1-6/) |
| 2-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/2-1/) |
| 2-2 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/2-2/) |
| 2-3 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/2-3/) |
| 2-4 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/2-4/) |
| 2-5 | 2 | あり | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/2-5/) |
| 3-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/3-1/) |
| 3-2 | 2 | なし | なし |  |
| 3-3 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/3-3/) |
| 3-4 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/3-4/) |
| 3-5 | 2 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/3-5/) |
| 4-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/4-1/) |
| 4-2 | 2 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/4-2/) |
| 4-3 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/4-3/) |
| 4-4 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/4-4/) |
| 4-5 | 3 | あり | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/4-5/) |
| 5-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-1/) |
| 5-2 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-2/) |
| 5-3 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-3/) |
| 5-4 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-4/) |
| 5-5 | 2 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-5/) |
| 5-6 | 3 | あり | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/5-6/) |
| 6-1 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/6-1/) |
| 6-2 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/6-2/) |
| 6-3 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/6-3/) |
| 6-4 | 1 | あり | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/6-4/) |
| 6-5 | 2 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/6-5/) |
| 7-1 | 1 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/7-1/) |
| 7-2 | 2 | あり | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/7-2/) |
| 7-3 | 2 | なし | なし | [攻略資料](https://zekamashi.net/kancolle-kouryaku/7-3/) |
| 7-4 | 1 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/7-4/) |
| 7-5 | 3 | なし | あり | [攻略資料](https://zekamashi.net/kancolle-kouryaku/7-5/) |

## 次の実装順

1. 同期装備スロットが欠ける場合の先制対潜基礎値採用を防止。完全な同期値は維持し、未確認は未判定とする。
2. ゲージ・出撃経路ごとのルート分岐条件と索敵閾値を出典付きで追加。未登録の条件は成立としない。
3. 艦別発動条件・装備ボーナスを出典と更新時点付きで整備。推測による性能追加を避ける。
4. 代替探索の上限・探索終了理由を明示し、見つからないことと解がないことを区別する。
5. 配備案とプランナーの索敵ボーナス・艦個体・改修値・搭載数の完全一致を検証する。
