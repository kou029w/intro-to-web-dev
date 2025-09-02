# miseによるツール管理

この章では、開発ツールのバージョン管理を簡単にしてくれる「mise」と、Web開発に欠かせない「Node.js」について一緒に学んでいきましょう。最初は設定が少し面倒に感じるかもしれませんが、一度覚えてしまえば開発がグッと楽になります。

## 学習目標

- Node.jsの役割とJavaScriptランタイムについて理解する
- miseを使った開発ツールの管理方法を覚える
- プロジェクトごとに違うバージョンを使い分ける方法を学ぶ
- パッケージマネージャの基本的な使い方を学ぶ

## Node.jsって何？

### JavaScriptが動く場所

ブラウザー

- Chrome (V8エンジン)
- Firefox (SpiderMonkeyエンジン)
- Safari (JavaScriptCoreエンジン)

サーバーサイド

- Node.js (V8エンジン)
- Deno (V8エンジン)
- Bun (JavaScriptCoreエンジン)

従来、JavaScriptはブラウザでしか動きませんでした。しかし、**Node.js**の登場により、サーバーでもJavaScriptが使えるようになったのです。

### Node.jsの魅力

**技術的な特徴：**

- **V8 エンジン**: Googleが開発した高性能なJavaScriptエンジン
- **イベントループ**: 非同期処理がとても得意
- **豊富なエコシステム**: npmで何十万ものパッケージが利用可能

**主な用途：**

- Webサーバーの作成（Express、Fastify、Hono等）
- ビルドツールの実行（Vite、Webpack等）
- コマンドラインツールの開発
- フロントエンド開発環境（React、Vue等）

### Node.jsのバージョンについて

Node.jsは定期的に新しいバージョンがリリースされます。基本的には**LTS（Long Term Support）版**を選んでおけば安心です。

```bash
# Node.js のリリースサイクル
偶数バージョン (20, 22, 24) → LTS版（長期サポート）
奇数バージョン (21, 23, 25)  → Current版（最新機能）

# おすすめのLTSバージョン
24.x.x  # 最新のアクティブLTS
```

## miseって何？

### 基本的な概念

**mise** は、プログラミング言語や開発ツールのバージョンを管理してくれる便利なツールです。「このプロジェクトではNode.js 22を使って、あのプロジェクトではNode.js 24を使いたい」といった要望を簡単に実現できます。

mise で管理できる主なツール:

- **[Node.js](https://mise.jdx.dev/lang/node.html)**: JavaScriptランタイム
- **[Python](https://mise.jdx.dev/lang/python.html)**: プログラミング言語
- **[Go](https://mise.jdx.dev/lang/go.html)**: プログラミング言語
- **[pnpm](https://mise.jdx.dev/lang/node.html#pnpm)**: Node.jsパッケージマネージャ

他にも多数の言語やツールをサポートしています。詳しくは [公式ドキュメント](https://mise.jdx.dev/) を参照してください。

### miseの魅力

- **統一されたコマンド**: 異なる言語やツールを同じ方法で管理できる
- **プロジェクト単位の設定**: `mise.toml` ファイルでバージョンを指定
- **高速**: Rustで作られているのでとても速い
- **自動切り替え**: フォルダ移動時に自動でバージョンが切り替わる

### 従来のバージョン管理ツールとの比較

従来は言語ごとに異なるツールを使う必要がありました：

| ツール | 管理対象       | 速度       | 設定ファイル    |
| ------ | -------------- | ---------- | --------------- |
| mise   | 多言語・ツール | とても速い | mise.toml       |
| asdf   | 多言語・ツール | 普通       | .tool-versions  |
| nvm    | Node.jsのみ    | 普通       | .nvmrc          |
| pyenv  | Pythonのみ     | 普通       | .python-version |
| rbenv  | Rubyのみ       | 普通       | .ruby-version   |

miseなら1つのツールで全部管理できるので、覚えることが少なくて済みます。

## miseをインストールしよう

### 1. インストール方法

```bash
# mise のインストール (全プラットフォーム共通)
curl https://mise.run | sh

# または、各OS固有の方法
# Windows (PowerShell): irm https://mise.run/install.ps1 | iex
# macOS: brew install mise
# Linux: curl https://mise.run | sh
```

### 2. シェル設定

**Bash**

```bash
echo "eval \"\$(${HOME}/.local/bin/mise activate bash)\"" >> ~/.bashrc
source ~/.bashrc
```

**Zsh**

```bash
echo "eval \"\$(${HOME}/.local/bin/mise activate zsh)\"" >> ~/.zshrc
source ~/.zshrc
```

**Fish**

```bash
echo "${HOME}/.local/bin/mise activate fish | source" >> ~/.config/fish/config.fish
```

### 3. Node.jsのインストール

```bash
# プロジェクトディレクトリで実行
cd my-project

# Node.js最新LTS版をインストール
mise use node@24

# パッケージマネージャ pnpm もインストール
mise use pnpm@latest
```

これで `mise.toml` というファイルが自動的に作成されます：

```toml
[tools]
node = "24"
pnpm = "latest"
```

このファイルをGitで管理することで、チーム全員が同じバージョンのツールを使えるようになります。

## Node.jsが使えるか確認しよう

```bash
# Node.jsのバージョン確認
node --version
# → v24.x.x と表示されればOK

# npmのバージョン確認（Node.jsに標準で付属）
npm --version

# pnpmのバージョン確認
pnpm --version
```

## パッケージマネージャについて

### パッケージマネージャって何？

Node.jsの世界では、他の人が作った便利なコード（パッケージ）を簡単に使うことができます。そのパッケージを管理してくれるのが「パッケージマネージャー」です。

### 主なパッケージマネージャー

**1. npm（Node Package Manager）**

Node.jsと一緒にインストールされる標準のパッケージマネージャーです。

```bash
npm install package-name       # パッケージをインストール
npm install --save-dev package-name  # 開発用パッケージとしてインストール
npm run script-name           # スクリプトを実行
```

**2. pnpm（推奨）**

「performant npm」の略で、高速で効率的なパッケージマネージャーです。

```bash
pnpm add package-name         # パッケージをインストール
pnpm add -D package-name      # 開発用パッケージとしてインストール
pnpm run script-name          # スクリプトを実行
```

**pnpmの利点：**

- **高速**: npmより3倍以上速い
- **省ディスク**: 同じパッケージを複数プロジェクトで共有
- **厳格**: 依存関係の問題を早期発見

このカリキュラムでは **pnpm** を使用することを推奨します。

## package.jsonの基本

### package.jsonって何？

`package.json` は、プロジェクトの設定と依存関係を記録するファイルです。

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### 重要なフィールド

- **name**: プロジェクト名
- **version**: バージョン番号
- **scripts**: `pnpm run` で実行できるコマンド
- **dependencies**: 本番環境で必要なパッケージ
- **devDependencies**: 開発環境のみで必要なパッケージ

### スクリプトの実行

```bash
# package.jsonのscriptsに定義されたコマンドを実行
pnpm run dev      # 開発サーバー起動
pnpm run build    # ビルド実行
pnpm run test     # テスト実行
```

## 基本的な使い方（mise）

### 1. 利用可能なツールの確認

```bash
# 利用可能なツール一覧
mise search

# Node.jsの利用可能バージョン
mise ls-remote node

# インストール済みツール確認
mise ls
```

### 2. バージョンの設定

**グローバル設定**

```bash
# システム全体のデフォルトバージョン
mise use --global node@24
mise use --global pnpm@latest
```

**プロジェクト設定**

```bash
# プロジェクトディレクトリで実行
cd my-project
mise use node@24
mise use pnpm@latest
```

### 3. 現在のバージョン確認

```bash
# 現在使用中のバージョン
mise current
```

## トラブルシューティング

1. **mise が見つからない**

```bash
# パスの確認
which mise
echo $PATH

# シェル設定の再読み込み
source ~/.bashrc  # or ~/.zshrc
```

2. **古いバージョンマネージャとの競合**

```bash
# nvm, pyenv などを無効化
# ~/.bashrc から該当行を削除またはコメントアウト
# export PATH="$HOME/.nvm:$PATH"  # ← これをコメントアウト
```

3. **プラグインのインストールエラー**

```bash
# キャッシュクリア
mise cache clear

# プラグイン再インストール
mise plugin uninstall node
mise plugin install node
```

## 実習課題

### 1. 環境確認

```bash
# miseのバージョン確認
mise --version

# Node.jsのバージョン確認
node --version

# pnpmのバージョン確認
pnpm --version
```

### 2. 簡単なプロジェクトの作成

```bash
# プロジェクトフォルダ作成
mkdir my-first-project
cd my-first-project

# Node.jsとpnpmの設定
mise use node@24
mise use pnpm@latest

# package.jsonの作成
pnpm init
```

### 3. パッケージのインストールと実行

```bash
# Viteをインストール
pnpm add -D vite

# package.jsonにスクリプトを追加（手動で編集）
# "scripts": {
#   "dev": "vite"
# }

# 開発サーバー起動
pnpm run dev
```

## ポイント

この章で学んだことをまとめておきます。

**Node.jsについて：**

- **JavaScriptランタイム**: ブラウザ以外でもJavaScriptを実行できる環境
- **V8エンジン**: Googleが開発した高性能なJavaScriptエンジンを使用
- **LTS版**: 長期サポート版で、安定性を重視するプロジェクトにおすすめ
- **豊富なエコシステム**: npmで何十万ものパッケージが利用可能

**miseについて：**

- **統一管理**: 複数の開発ツールのバージョンを1つのツールで管理
- **プロジェクト単位**: フォルダごとに異なるバージョンを自動切り替え
- **チーム開発**: `mise.toml`で全員が同じ環境を構築可能

**パッケージマネージャについて：**

- **npm**: Node.js標準のパッケージマネージャ
- **pnpm**: 高速で効率的、このカリキュラムで推奨
- **package.json**: プロジェクトの設定と依存関係を記録

これらを使うことで：

- ✅ 異なるプロジェクトで異なるNode.jsバージョンを簡単に使い分けられる
- ✅ チーム全員が同じツールバージョンで開発できる
- ✅ 新しいメンバーの環境構築が簡単になる
- ✅ 豊富なnpmパッケージを活用できる
- ✅ モダンなWeb開発ツールが使える

最初は覚えることが多くて大変かもしれませんが、miseとNode.jsに慣れてしまえば、Web開発がとても効率的になりますよ。実際に手を動かしながら、少しずつ覚えていきましょう！
