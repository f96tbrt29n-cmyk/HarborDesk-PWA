# 提督手帳 - 艦これ攻略ビューア PWA

Apple署名・Xcode・Macなしで使える、静的PWAの試作です。

## 機能
- 海域 / 任務 / 遠征の攻略情報を横断検索
- 海域攻略ナビ：海域・編成例と保存編成を選び、ルート・装備・制空・索敵などの不足と次の確認事項を表示
- 攻略目標：海域ナビの不足、前提海域・任務（攻略順・前提海域の目標登録とクリア記録の連動・次の海域への移動を含む。5-6の5-5ゲージ破壊確認は日本時間の月ごとに管理）、基地航空隊の開設準備（前提単発任務・設営隊・資源・7-4開設任務の出撃先別進捗。同じ任務の完了は海域間で共有し、一括追加では達成済みを除外）、必要装備の所持差分（目標から個別装備の入手方法と代替候補を直接表示）、保存編成の育成艦のLv差分を海域別のやることリストへ追加。未完了の任務・編成・装備・育成から次に進める準備を表示し、登録済み目標へ直接移動。未攻略の前提海域がある場合はその海域の準備を先に提示
- カテゴリ絞り込み
- お気に入り保存（iPhone内のlocalStorage）
- 攻略Wikiの元ページへワンタップで移動
- PWA対応（ホーム画面追加 / standalone表示 / オフラインキャッシュ）

## iPhoneで使う
GitHub Pagesで公開後、iPhoneのSafariでURLを開きます。
共有 →「ホーム画面に追加」→ 追加。

## GitHub Pages
このリポジトリには `.github/workflows/pages.yml` を含めています。
Settings → Pages → Build and deployment → Source を `GitHub Actions` にすると、mainへのpushで自動公開されます。

## データ追加
`app.js` の `DATA` 配列にカードを追加します。将来的には `data/*.json` に分離できます。

## 注意
攻略情報はゲーム更新で変わる可能性があります。出撃・装備更新など重要な操作前はリンク先の最新版も確認してください。

## 開発・公開の確認
- `app-version.json`、`update-manager.js`、`sw.js`、`package.json` のバージョンとbuildを揃えて更新します。
- mainへのpushでは `.github/workflows/pages.yml` がまずJavaScript構文、PWAキャッシュ整合性、ランタイム資産、艦娘画像ソース、艦これMASTER意味検証を行います。成功後、PlaywrightのChromium / WebKitを別ジョブで並列実行します。
- ChromiumとWebKitの両方が成功した場合だけPagesのアップロード/Deployへ進みます。公開ゲートでは各ブラウザで安定スモークテストを実行し、どちらかが失敗した場合は公開を止めます。失敗時は `playwright-report` と `test-results` をブラウザ別のActions artifactとして14日間保存します。
- Pull Requestでは `.github/workflows/browser-regression.yml` がChromium / WebKitのSmokeテストを実行します。Actionsの「Browser Regression」→「Run workflow」では `smoke` / `full` を選べ、`full` は216件の回帰テストを各ブラウザ1 workerで実行します。mainへのpushはPages側でSmokeを行うため、重複実行しません。
- GitHubの「Actions」タブで最新mainの `Deploy HarborDesk PWA` を開き、`Run browser regression tests` と `Deploy` が成功していることを確認します。古いrunのcancelledは最新runの結果とは別です。
- WebKitはSafari系エンジンの互換性確認であり、iPhone実機テストそのものではありません。
- iPhoneでは公開後に「更新確認」→「今すぐ更新」で反映できます。Mac・Xcodeは不要です。
- ローカル検証時は `npm install --no-save --no-package-lock`、`npx playwright install --with-deps chromium webkit`、`npm run test:browser` の順で実行します。Playwrightが内蔵HTTPサーバーを起動するため、別ターミナルでのサーバー起動は不要です。
- `npm run test:browser` は公開ゲート用の安定スモークテストです。旧来の216件フル回帰は `npm run test:browser:full` で手動実行でき、現行UIに合わせて順次メンテナンスします。フル回帰の既知の古い期待値はPages公開を止めません。
- `.github/workflows/full-regression.yml` は毎日03:00 JST（18:00 UTC）と手動実行で216件フル回帰をChromium / WebKitそれぞれ1 workerで実行します。これは品質監視用で、失敗してもPages公開済みバージョンを取り下げません。


## 艦これゲーム内データ取込

HarborDeskの「ゲーム同期」から、艦これAPIレスポンスJSONを端末内で解析して以下を反映できます。

- 艦娘: MASTER ID、艦名、Lv、HP、cond、ロック状態、装備メモ
- 装備: 装備MASTER ID、所持個数、改修★、熟練度分布
- 資源: 燃料、弾薬、鋼材、ボーキ、高速建造材、高速修復材、開発資材、改修資材
- 現在艦隊: 艦隊名、所属艦、Lv

対応入力は `svdata={...}` の単一レスポンス、または複数レスポンスを `endpoints` / `records` にまとめたJSONです。主に `/kcsapi/api_port/port`、`/kcsapi/api_get_member/ship2`、`/kcsapi/api_get_member/slot_item`、`require_info` 内の `api_slot_item`、`api_material` を扱います。

DMMのID・パスワード・Cookie・`api_token` はHarborDeskへ保存しません。貼り付けた生レスポンスも保存せず、必要なゲーム情報だけをHarborDesk形式へ変換して端末内に保存します。


### iPhone / Safari 受動キャプチャ（試験機能）

HarborDeskの「ゲーム同期」には、Safari用キャプチャ補助コードをコピーする機能があります。

1. Safariで任意のページをブックマークします。
2. HarborDeskの「ゲーム同期」→「iPhone / Safariでゲーム通信を拾う」を開き、「Safari用コードをコピー」を押します。
3. 先ほどのブックマークを編集し、URL欄をコピーした `javascript:` コードへ置き換えます。
4. 艦これを開き、そのブックマークを実行します。
5. 母港や装備画面などを操作すると、実行後の対応 `/kcsapi/` レスポンスを端末内で収集します。
6. キャプチャパネルの「JSONをコピー」または「JSON保存」からHarborDeskへ持ち込みます。

キャプチャ補助は **レスポンスだけ** を読み取り、HarborDeskで必要な艦娘・装備・資源・艦隊部分へ縮小して保持します。リクエスト本文、`api_token`、Cookie、DMMログイン情報は記録しません。

DMM側のページやiframe構成によってはSafariのブックマークレットからゲーム通信へ届かない場合があります。その場合はJSONファイル/貼り付け取込を利用してください。

部分的な装備レスポンスを複数回取り込んだ場合も、HarborDeskは装備個体IDを使って既存同期データと差分マージします。たとえば同じ装備個体が★4から★6へ改修された場合、★4を残して別物として増やすのではなく、同じ個体を★6スタックへ移動します。


### Safari受動キャプチャ（試験機能）

HarborDeskの「ゲーム同期」には、Safariブックマークから実行できる受動キャプチャ補助を用意しています。

1. HarborDeskの「ゲーム同期」→「iPhone / Safariでゲーム通信を拾う」を開く
2. 「Safari用コードをコピー」を押す
3. Safariで作ったブックマークのURLを、そのコードへ置き換える
4. 艦これを開いてブックマークを実行する
5. 母港・装備画面などを操作して対象レスポンスを取得する
6. キャプチャパネルの「JSONをコピー」または「JSON保存」
7. HarborDeskへ戻り「クリップボードから貼る」またはJSONファイルを選ぶ

キャプチャ対象は必要な `/kcsapi/` レスポンスのみで、リクエスト本文、`api_token`、Cookie、DMM認証情報は記録しません。DMM側のページ/iframe構成によってはSafari上で実行できない場合があります。その場合はJSONファイル/貼り付け取込を使用してください。

部分的な `slot_item` データは既存同期済み装備へ差分マージされます。同じ装備個体が改修されて★値が変わった場合はゲーム内装備個体IDを使って旧★スタックから新★スタックへ移動します。


### ゲーム現在艦隊の利用

ゲーム同期で取得した第1〜第4艦隊は「ゲーム現在艦隊」として表示され、艦娘・Lv・同期できた装備を確認できます。攻略海域を選択している場合は、その艦隊を同じMASTER IDと装備メモ付きでHarborDeskの「自分用編成」へコピーできます。同じゲーム艦隊を同じ海域へ再コピーすると、ゲーム同期由来の保存編成を更新します。


### 遠征・入渠タイマー同期

ゲーム同期で `api_port/port` または `api_get_member/ndock` を取り込むと、艦これゲーム内の遠征帰投時刻と入渠完了時刻をHarborDeskの既存タイマーへ反映します。

- 遠征は `api_deck_port[].api_mission` から艦隊番号・遠征ID・終了時刻を取得
- 入渠は `api_ndock` からドック番号・艦の個体ID・完了時刻を取得
- HarborDeskで手動作成したタイマーは残し、ゲーム同期由来の同じ艦隊/ドックだけ更新
- Safari受動キャプチャでも `api_get_member/ndock` を必要項目だけに縮小して取得
