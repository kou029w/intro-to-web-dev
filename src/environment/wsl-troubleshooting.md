# WSLトラブルシューティング

WSL (Windows Subsystem for Linux) 環境で Web 開発を行う際に遭遇しやすい問題と、その対処法をまとめています。

## プロジェクトの作業ディレクトリについて

**基本方針:** プロジェクトは `/home/ユーザー` 以下に作成し、VS Code の Remote - WSL 拡張機能でアクセスすることを推奨します。

| パス             | ファイルシステム | おすすめ度 |
| ---------------- | ---------------- | ---------- |
| `/home/ユーザー` | Linux (ext4)     | ✅ 推奨    |
| `/mnt/c/Users/…` | Windows (NTFS)   | ⚠️ 非推奨  |

`/mnt/c/` 以下は Windows のファイルシステムを WSL からマウントしたものです。ここで作業すると、ファイル監視やパフォーマンスの問題が発生しやすくなります（詳しくは後述）。

## `/mnt/c/` 以下でファイル監視が動かない

### 症状

`/mnt/c/Users/…` にあるプロジェクトで `pnpm dev` を実行すると、ファイルを編集しても開発用サーバーが自動で再起動しない（ホットリロードが効かない）ことがあります。

### 原因

`/mnt/c/` は Windows のファイルシステム (NTFS) を WSL からマウントしたパスです。Linux のファイル変更検知の仕組み（inotify）が正しく動作しないため、`tsx watch` や Vite の HMR などがファイル変更を検出できません。

### 対処法

#### プロジェクトを `/home/` 以下に移動する（推奨）

```bash
# プロジェクトを移動
cp -r /mnt/c/Users/yourname/projects/my-app ~/my-app
cd ~/my-app
pnpm install
pnpm dev
```

これが最も確実な解決方法です。`/home/` 以下であれば Linux ネイティブのファイルシステム (ext4) が使われるため、ファイル監視が正常に動作します。

## VS Code で `/home/` 以下のファイルが開けない

### 症状

プロジェクトを `/home/` に移動したものの、VS Code でファイルを開く方法がわからない、または Windows 側の VS Code から直接アクセスできない。

### 対処法

#### Remote - WSL 拡張機能を使う

VS Code の **Remote - WSL** 拡張機能をインストールすると、WSL 内のファイルを直接編集できるようになります。

1. Windows 側の VS Code で拡張機能 [`ms-vscode-remote.remote-wsl`](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) をインストール
2. WSL のターミナルからプロジェクトディレクトリに移動して `code .` を実行

```bash
cd ~/my-app
code .
```

VS Code が WSL モードで開き、`/home/` 以下のファイルをシームレスに編集できます。左下に「WSL: Ubuntu」のような表示が出ていれば正しく接続されています。

## `pnpm create hono` など実行時に GitHub API エラーが出る

### 症状

`pnpm create hono@latest` を実行し、テンプレート選択後に以下のようなエラーが出る場合があります。

```
throw new Error(`Error running hook for ${templateName}: ${e instanceof Error ? e.message : e}`);

Error: Error running hook for nodejs: Failed to fetch https://api.github.com/repos/honojs/starter/tarball/v0.19
```

テンプレートの tarball を GitHub API からダウンロードする段階で失敗しています。

### 考えられる原因

- ネットワーク環境（プロキシ、ファイアウォール、VPN）が GitHub API へのアクセスをブロックしている
  - [プロキシ確認ガイド](../api/proxy.md) を参照
- Windows 側のバイナリが意図せず参照されている
- WSL の DNS 設定の問題

### 対処法

#### 1. 環境情報の確認

まず、WSL 内で正しいバイナリが使われているか確認します。

```bash
# 各コマンドのパスを確認
which node
which pnpm
which git
which curl
```

`/mnt/c/` から始まるパスが表示された場合、Windows 側のバイナリが参照されています。WSL 内にインストールされたツールが正常に使われるように設定してください（[mise によるツール管理](mise.md) を参照）。

#### 2. GitHub API への接続テスト

```bash
curl -I https://api.github.com
```

ステータスコード `200` が返れば接続は正常です。エラーが出る場合はネットワーク環境を確認してください。([プロキシ確認ガイド](../api/proxy.md) を参照)。

#### 3. テンプレートを手動で取得する

GitHub API 経由のダウンロードが失敗する場合でも、Web ブラウザーや `git clone` で直接取得できることがあります。

**Hono のテンプレートの場合:**

```bash
# git clone でテンプレートを取得
git clone https://github.com/honojs/starter.git
cp -r starter/templates/nodejs my-hono-app
cd my-hono-app
pnpm install
```

テンプレートの一覧は <https://github.com/honojs/starter/tree/main/templates> から確認できます。

**Vite のテンプレートの場合:**

```bash
# git clone でテンプレートを取得
git clone https://github.com/vitejs/vite.git --depth 1
cp -r vite/packages/create-vite/template-react-ts my-vite-app
cd my-vite-app
pnpm install
```

テンプレートの一覧は <https://github.com/vitejs/vite/tree/main/packages/create-vite> から確認できます。

## ポイント

| やること                                  | 説明                                                               |
| ----------------------------------------- | ------------------------------------------------------------------ |
| プロジェクトは `/home/` 以下に置く        | `/mnt/c/` ではファイル監視やパフォーマンスに問題が出やすいので注意 |
| VS Code Remote - WSL を使う               | `/home/` 以下のファイルを快適に編集可能                            |
| `which` コマンドで確認                    | Node.js や pnpm が Windows 側のものではなく WSL 内のものか確認     |
| GitHub API エラー時の最終手段は手動で取得 | `git clone` などでテンプレートリポジトリから直接コピー             |
