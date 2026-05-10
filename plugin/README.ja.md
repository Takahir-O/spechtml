[English](./README.md) | **日本語**

# spechtml プラグイン

Compact TOON、決定論的な HTML レンダリング、可視 ID ベースのパッチによって、人向けドキュメントと LLM 向け入力を同期し続ける Claude Code プラグイン。

## インストール

```shell
/plugin marketplace add Takahir-O/spechtml
/plugin install spechtml@spechtml
```

インストール後、スキルは `/spechtml:spechtml` として利用できる。利用者が TOON ベースのドキュメント作成・編集を依頼すると Claude が自動起動する。

## スキルの動作

1. Compact TOON のソースファイルを書く(編集の真実源)
2. `id10` 形式の可視リファレンス ID 付き HTML を生成する
3. 「id10 を初心者向けに書き直して」のような人の指示を受け取る
4. 3 行の TOON パッチを生成して in-place で適用する
5. HTML を再生成する

利用者は生成された HTML を読んで指示を出すだけ。レンダリングとパッチ適用はすべてスキルが実行する。

スキルの完全な定義は [skills/spechtml/SKILL.md](./skills/spechtml/SKILL.md) を参照。

## プラグイン構成

```
.claude-plugin/
  plugin.json              # プラグインマニフェスト
skills/
  spechtml/
    SKILL.md               # スキル本体
    runtime/               # TOON レンダラ + パッチ適用器のソース
    runtime/dist/          # esbuild が生成する実行用バンドル
    references/            # スキルが必要時に読み込む補足ドキュメント
README.md
README.ja.md
LICENSE
```

## ローカル開発

```bash
claude --plugin-dir .
```

このディレクトリ配下のファイルを変更したら、Claude Code 内で `/reload-plugins` を実行すれば再起動なしで反映される。

開発用ソース、サンプル、設計ドキュメントを含む完全なリポジトリは以下:
https://github.com/Takahir-O/spechtml

## 依存ライブラリ

サプライチェーン防御のため、ランタイム依存は正確なバージョンで固定:

- `@toon-format/toon` 2.2.0
- `zod` 4.4.3

ランタイム(TOON パース・正規化・レンダリング・パッチ適用)は esbuild で `runtime/dist/*.bundle.js` にバンドル化済み。プラグイン install 時に `npm install` は走らず、Node 側で実行時にネットワーク取得もしない。

flowchart を含む HTML ページは、ブラウザ表示時に Mermaid(`mermaid@11.14.0`)を `cdn.jsdelivr.net` から SRI 固定で読み込む。これは唯一のネットワーク経路で、flowchart を含まないページは完全オフラインで開ける。

## ライセンス

MIT — [LICENSE](./LICENSE) を参照。
