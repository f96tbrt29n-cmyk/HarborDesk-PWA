# 提督手帳 - 艦これ攻略ビューア PWA

Apple署名・Xcode・Macなしで使える、静的PWAの試作です。

## 機能
- 海域 / 任務 / 遠征の攻略情報を横断検索
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
- `app-version.json`、`update-manager.js`、`sw.js` のバージョンとbuildを揃えて更新します。
- mainへのpushで構文・キャッシュ整合性・全テストをChromium / WebKitで確認し、成功後にPagesへ公開します。WebKitはSafari系の互換性確認であり、iPhone実機テストの代替ではありません。
- Actionsでは最新mainのコミットSHAとrunのHEADが一致すること、テストとDeployの両ステップが成功したことを確認します。古いrunのcancelledは最新runの結果とは別です。
- iPhoneでは公開後に「更新確認」→「今すぐ更新」で反映できます。Mac・Xcodeは不要です。
- ローカル検証時は `npm install --no-save --no-package-lock @playwright/test@1.55.0`、`npx playwright install --with-deps chromium webkit` を実行し、別ターミナルで `python3 -m http.server 4173`、続いて `npx playwright test` を実行します。


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
