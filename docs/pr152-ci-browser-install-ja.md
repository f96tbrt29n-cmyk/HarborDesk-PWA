# PR152: ブラウザー導入工程の固定

基準: e488cde1db5fe26b09fd5dc2a2338338ec5639df。製品コード・SW・保存形式・版番号は変更しない。

## 取得済み原本で確認した工程

| CI / ジョブ | ブラウザー導入step | aptの取得結果 | ブラウザー本体 |
| --- | --- | --- | --- |
| 39854554263 / WebKit 2 | 41分47秒 | 117MB / 41分25秒 | v2203の取得・展開 約2.3秒 |
| 同 / WebKit 3 | 42分01秒 | 115MB / 41分29秒 | v2203の取得・展開 約2.8秒 |
| 同 / WebKit 4 | 42分04秒 | 117MB / 41分42秒 | v2203の取得・展開 約2.4秒 |
| 39929324552 / WebKit 1 | 45分05秒、取消 | apt Get/Ign中で終了、展開開始未観測 | 取得開始未観測、試験本文0件 |
| 同 / WebKit 2・4 | 36秒 / 33秒 | 通常完了 | 通常完了 |

`Fetched ... in ...` はapt自身の取得集計。Get間の空白だけから内部原因は断定しない。
遅延時の取得先はazure.archive.ubuntu.com、Ubuntu noble。ネットワーク・配信元・実行基盤のどこが原因かは未確定。
同じジョブのNode準備・npm依存取得は数秒～14秒。ブラウザーアーカイブ取得を主原因とは扱わない。
旧取消・空母夜戦最終失敗・自然実nullの記録はそのまま保持する。

## 変更と根拠

公式 `mcr.microsoft.com/playwright:v1.55.0-noble` をmanifest digest
`sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29` で固定する。
amd64 manifestは `sha256:ffc33305f7b4b04057ae4a0caa70aad4fde87454fb403a1a22e7f931707dfcf9`。
毎ジョブのapt導入を、公式イメージに含まれる依存・ブラウザーの検証へ置き換える。
イメージpullの時間・可用性は新しい依存であり、キャッシュ命中は前提にしない。

- [公式Docker説明](https://playwright.dev/docs/docker): ブラウザーとシステム依存を同梱、npmパッケージは別途必要。
- [1.55.0のCI手順](https://github.com/microsoft/playwright/blob/v1.55.0/docs/src/ci.md): GitHub Actionsのcontainerとuser 1001の例。
- [1.55.0のDockerfile](https://github.com/microsoft/playwright/blob/v1.55.0/utils/docker/Dockerfile.noble): nobleとビルド時のinstall --with-deps。

`npm install` とsetup-node 24は維持。バージョン不一致・実体欠損を自動修復せず失敗させる。
`tests/ci-browser-environment.cjs` は毎ジョブでnpm/image版、revisionディレクトリ、実行ファイルを確認し、
選択ブラウザーを既定の起動引数で起動、隔離ページの描画を確認して閉じる。共有ライブラリ不足も起動失敗となる。
追加の製品要求・保存操作はしない。キャッシュが命中しても検証は省略しない。

## 実行環境の差

旧ジョブはホストUbuntu 24.04.5 + 実行時apt、新ジョブはホストubuntu-latest上のコンテナUbuntu 24.04.2。
イメージ内ライブラリ・フォントはビルド時のものへ固定される。カーネルはホスト共有。
Nodeはイメージ内の22.18.0を使用せず、既存setup-nodeで24系を使用する。
Playwright 1.55.0、Chromium/headless-shell 1187 (140.0.7339.16)、WebKit 2203 (26.0)、FFmpeg 1011を維持。
ブラウザーは `/home/runner/.cache/ms-playwright` から `/ms-playwright` へ移る。
公式CI例に従い非root user 1001、`--init --ipc=host` を指定する。コンテナの権限・プロセス・IPC条件は旧ホスト実行と同一ではない。
製品の起動引数・Playwright設定は変更しない。45分・45秒・5秒undo、全6ジョブ、固定ケース、並列数、retry、例外検査、成果物保持も維持する。
任意Fullにも同じ導入方法を適用するが、今回の通常CIでは従来どおりskip。

## 検証と限界

ローカルは同じイメージ、user 1001、Node 24実体を読み取り専用で持ち込み、両ブラウザーの起動・描画を各1回確認する。
ホストの既存node_modulesは権限・リンクを変更せず、検証用コピーのみ読取り可能にする。
最初の環境確認でコピー前の権限不足とmetadataのpackage exports制約を検出した。試験本文や製品失敗ではなく、通常CI前に検証用コード・配置を訂正した。
設定比較でmatrix、全期限、固定ケース、テスト設定、製品・SW未変更を確認する。
変更後の通常CIはpushによる1回のみ。確定結果・導入時間・初回/retry資料はPR冒頭と証拠rootへ記録する。

原本: `/workspace/hd152-undo-storage-20261023/` と `/workspace/hd152-clear-site-data-20261023/`。
今回: `/workspace/hd152-ci-install-20261023/` (旧571ファイルのハッシュ一致確認、工程抽出、公式ソース、設定比較、起動確認、CI資料)。

導入改善と製品障害は別判断。自然実null、DCL停止、SW/通信/Cache API例外、早期再読込、navigation内部エラー等は未解決。
新環境の成功で旧環境の欠測を埋めない。保存存在・ヘッダー診断は既設のまま、追加診断や修復入口の変更はしない。
37海域53例は1/49/3、同期外15候補manual、iPhone実機・WebKitオフライン・5-6未確認を維持。
PR152ドラフト・公開保留、PR151未変更、マージ・公開・自動マージなし。
