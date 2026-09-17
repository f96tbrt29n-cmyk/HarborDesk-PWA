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
