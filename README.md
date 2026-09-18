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
