# ローカル開発環境セットアップ

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/7f05eaf1-dc02-463d-a7f8-1960688152a2)

自分のパソコンでWeb開発を始めるために必要な環境の準備について一緒に学んでいきましょう。最初は設定することがたくさんあって大変に感じるかもしれませんが、一度セットアップしてしまえば快適に開発できるようになります。

## 学習目標

- Web開発に必要なツールの全体像を理解する
- どのパソコンでも同じように開発できる環境を構築する
- 効率的で使いやすい開発環境を作る

## 開発環境の全体像

### 基本的なツール構成

Web開発に必要なツールはいくつかあり、それぞれに役割があります。

**必須ツール:**

- **エディタ**: VS Code (推奨), Cursor, Zed（コードを書くためのソフト）
- **ランタイム**: Node.js (推奨), Deno, Bun
- **バージョン管理**: Git (推奨)
- **ツール管理**: mise (推奨), asdf, volta
- **AI支援ツール**: GitHub Copilot, Codex, Claude Code, Gemini CLI

**推奨ツール:**

- **仮想環境**: WSL2 (Windows), Docker
- **ターミナル**: Windows Terminal, Warp, WezTerm, iTerm2
- **シェル**: Bash, Zsh, Fish
- **ブラウザ**: Chrome, Safari, Firefox
- **HTTP クライアント**: curl, Thunder Client (VS Code)

## OS別セットアップガイド

### Windows (推奨: WSL2 使用)

1. **WSL2 セットアップ**

```powershell
# 管理者権限でPowerShellを起動
wsl --set-default-version 2
wsl --install Ubuntu

# WSL2での作業推奨
wsl
```

2. **Windows Tools**

```powershell
# Windows Terminal (推奨)
winget install Microsoft.WindowsTerminal

# VS Code
winget install Microsoft.VisualStudioCode

# Git for Windows
winget install Git.Git
```

3. **WSL2内でのセットアップ**

```bash
# Ubuntu/Debian内で実行
sudo apt update && sudo apt upgrade -y
sudo apt install curl build-essential git -y
```

### macOS

1. **Homebrew インストール**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **基本ツール**

```bash
# 開発ツール
xcode-select --install

# エディタとブラウザ
brew install --cask visual-studio-code
brew install --cask google-chrome

# ターミナル
brew install --cask wezterm  # または iterm2
```

### Linux (Ubuntu/Debian)

1. **システム更新とビルドツール**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl build-essential git -y
```

2. **VS Code インストール**

```bash
# 公式リポジトリから
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update
sudo apt install code
```

3. **Google Chrome インストール**

```bash
# 公式リポジトリから
curl -sSL https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install google-chrome-stable
```

## コマンドライン操作

### 基本的なターミナル操作

```bash
# ナビゲーション
pwd                     # 現在のディレクトリを表示
ls -la                  # ファイル一覧（詳細表示）
ls -la | grep node      # grep でフィルタリング
cd directory            # ディレクトリ移動
cd -                    # 前のディレクトリに戻る
cd ~                    # ホームディレクトリに移動

# ディレクトリ・ファイル操作
mkdir -p path/to/dir    # 階層ディレクトリ作成
touch file.txt          # 空ファイル作成
cp -r source dest       # ディレクトリをコピー
mv old_name new_name    # ファイル/ディレクトリ名変更
rm -rf directory        # ディレクトリを強制削除

# ファイル内容操作
cat file.txt            # ファイル全体表示
head -n 10 file.txt     # 先頭10行表示
tail -n 10 file.txt     # 末尾10行表示
grep "pattern" file.txt # パターン検索
find . -name "*.js"     # ファイル検索
```

### プロセス管理

```bash
# プロセス操作
ps aux                  # 全プロセス表示
pgrep node              # Node.jsプロセスを検索
top                     # リアルタイムプロセス監視
kill pid                # プロセスID指定で終了
pkill node              # プロセス名で全て終了

# バックグラウンド実行
node --run dev &        # バックグラウンドで実行
Ctrl+Z                  # プロセスを一時停止
jobs                    # ジョブ一覧
fg                      # フォアグラウンドに復帰
```

## モダンシェル環境の構築

### Git設定

```bash
# グローバル設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"

# SSH キー生成
ssh-keygen -t ed25519 -C "your.email@example.com"

# SSH設定 (~/.ssh/config)
Host github.com
  HostName github.com
  User git
```

### 開発支援ツールのインストール

```bash
# mise経由でツールインストール
mise install node@24
mise use --global node@24

# グローバルパッケージ
npm i -g @biomejs/biome
```

## 環境確認とテスト

```bash
# 研修用ディレクトリに移動
mkdir -p web-dev-2025/test
cd test-environment

# mise.toml 作成
mise use node@24

# 動作確認
node -v
node -e 'console.log(process.version)'

# package.json 作成
npm init -y

# 依存関係インストール
npm i -D react react-dom typescript @types/react @types/react-dom
```

<!-- ## トラブルシューティング -->

## まとめ

### 開発環境構築のポイント

- **一貫性**: mise によるツールバージョン管理
- **再現性**: 設定ファイルによる環境の再現
- **効率性**: ターミナル操作の習得と自動化

### 🔄 継続的改善

- 新しいツールの評価と導入
- チームでの共有
