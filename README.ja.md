[English](./README.md) | **日本語**

# spechtml

軽量な Compact TOON を書くと、整った HTML / Markdown を得られる。

人と LLM のドキュメントループを回す Claude Code プラグイン:

```txt
Compact TOON
  -> 人が読む HTML を生成
  -> id10 のような可視リファレンス ID 付き
  -> 人は id を指して編集を依頼
  -> LLM は TOON パッチを返す
  -> スクリプトが Compact TOON を更新
  -> スクリプトが HTML を再生成
```

## インストール(Claude Code プラグイン)

```shell
/plugin marketplace add Takahir-O/spechtml
/plugin install spechtml@spechtml
```

プラグインの使い方の詳細は [plugin/README.ja.md](./plugin/README.ja.md) を参照。

## リポジトリ構成

```
.
├── .claude-plugin/
│   └── marketplace.json    # マーケットプレイス目録(リポジトリルート必須)
├── plugin/                 # /plugin install で配布される全て
│   ├── .claude-plugin/plugin.json
│   ├── skills/spechtml/    # SKILL.md, runtime/, runtime/dist/, references/
│   ├── README.md / README.ja.md
│   └── LICENSE
├── package.json            # 開発用スクリプト(build, test, lefthook, render shortcut)
├── package-lock.json
├── build.mjs               # runtime/dist/*.bundle.js を生成する esbuild 設定
├── lefthook.yml            # pre-push の npm audit / test / build
├── .nvmrc                  # Node 24(Active LTS)
├── .editorconfig
├── CHANGELOG.md
├── SECURITY.md
├── README.md / README.ja.md
└── LICENSE
```

ローカル限定の `dev/` ワークスペースは git 管理外で、個人ドラフトと検証用 HTML 出力を置く場所。配布プラグインには含まれない。

## プラグインのローカル動作確認

```bash
claude --plugin-dir ./plugin
```

`plugin/` 配下を変更したら、Claude Code 内で `/reload-plugins` を実行すれば再起動なしで反映される。

## ローカル開発

```bash
npm install                 # 開発依存のインストール + lefthook hook 登録
npm run build               # runtime/dist/*.bundle.js を再生成(runtime ソース変更後に必須)
npm test                    # plugin/test/ の node:test スイート
npm run render:spec-ja      # Compact TOON サンプルを HTML に変換(ローカルのみ)
npm run audit:root          # 本番依存の脆弱性監査
```

`render` 系スクリプトは git 管理外の `dev/` ワークスペースを参照する。新規 clone 直後は `dev/examples/` を自分で用意するまで失敗する。

## 依存ライブラリのポリシー

ランタイム依存はすべて正確なバージョンで固定(`^` や `~` 接頭辞なし)し、`package-lock.json` の integrity ハッシュで改ざんを防ぐ。サプライチェーン攻撃に対する多層防御。ランタイムは `plugin/skills/spechtml/runtime/dist/*.bundle.js` に esbuild でバンドル済みのため、配布プラグインは `npm install` を実行せず、実行時にも依存を取得しない。

[lefthook](https://github.com/evilmartians/lefthook) が管理する pre-push git hook が、root ワークスペースに対して `npm audit --omit=dev --audit-level=moderate`、`npm test`、`npm run build` を並列実行する。moderate 以上の脆弱性、テスト失敗、ビルド失敗のいずれかで push を拒否する。

CI では `npm install` の代わりに `npm ci` を使ってロックファイルを厳格適用する。

## ライセンス

MIT — [LICENSE](./LICENSE) を参照。
