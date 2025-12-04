# AI支援ツール活用法

AI支援ツールは、コーディング作業を支援してくれる強力なツールです。コード補完、リファクタリングの提案、バグ修正、ドキュメント生成など、様々な場面で活躍します。
ここでは主要なAI支援ツールの導入方法と使い方を学びましょう。

## AI支援ツールの導入

```bash
# Claude Code
npm i -g @anthropic-ai/claude-code
# インストール後 claude コマンドで起動

# Gemini CLI
npm i -g @google/gemini-cli
# インストール後 gemini コマンドで起動

# Codex
npm i -g @openai/codex
# インストール後 codex コマンドで起動

# GitHub Copilot CLI
npm i -g @github/copilot
# インストール後 copilot コマンドで起動
```

### 学習リソース

- [Claude Code 概要](https://docs.claude.com/ja/docs/claude-code/overview)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [OpenAI Codex](https://developers.openai.com/codex/cli/)
- [GitHub Copilot CLI](https://docs.github.com/ja/copilot/concepts/agents/about-copilot-cli)

## プロジェクトでの活用例

実際のプロジェクトで活用する場合の例：

```bash
# プロジェクトディレクトリで起動
cd your-project
claude

# 例: HTMLファイルの生成
> 簡単なHTMLファイルを作成して

# 例: ファイルの検索
> このディレクトリにあるJavaScriptファイルを一覧表示して

# 例: 依存関係の説明
> package.jsonを読んで、使用している依存関係を説明して

# 例: コンポーネントの生成
> Reactのユーザープロフィールコンポーネントを作成して
> 名前、メールアドレス、アバター画像を表示する機能が欲しい

# 例: バグ修正の支援
> src/utils/formatDate.jsにバグがあるみたい。確認して修正して

# 例: リファクタリング
> このファイルのコードをTypeScriptに変換して、型定義も追加して
```

指示に応じて適切なファイル操作やコード生成を行ってくれます。

## 注意点

AI支援ツールは強力ですが、いくつか注意すべき点があります:

### セキュリティ

- **機密情報を含めない**: APIキーやパスワードなどの機密情報をプロンプトに含めないようにしましょう
- **依存関係の確認**: 生成されたコードが安全なライブラリやフレームワークを使用しているか確認しましょう

### 効果的な使い方

- **具体的な指示**: 曖昧な指示より具体的な指示の方が良い結果が得られます
- **コンテキストの提供**: 関連するファイルや要件を明示することで、より適切な提案が得られます

### コードの品質管理

- **生成コードのレビュー**: AIが生成したコードは必ず自分で確認しましょう
- **テストの実施**: 生成されたコードが期待通り動作するかテストしましょう

## ポイント

- AI支援ツールを使う際は、**セキュリティ**と**コード品質**に注意が必要
- **具体的な指示**と**コンテキスト提供**で、より良い結果が得られる
- 生成されたコードは必ず**レビューとテスト**を行う
