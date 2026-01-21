# VS Code環境設定

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/21296247-8526-4ee4-a4d7-f85974c81a2a)

この章では、Web開発に欠かせないエディタ「Visual Studio Code（VS Code）」について一緒に学んでいきましょう。VS Codeは無料で使えて、しかもとても高機能なエディタです。最初は設定が少し大変かもしれませんが、一度設定してしまえばとても快適に開発できるようになります。

## 学習目標

- VS Codeの基本的な使い方を覚える
- Web開発に便利な拡張機能を知る
- 効率的なコーディング環境を作る
- AI開発ツールとの連携方法を学ぶ

## VS Codeってどんなエディタ？

### VS Codeの魅力

VS Codeにはこんな素晴らしい特徴があります：

**使いやすさ：**

- **Language Server Protocol (LSP)**: プログラミング言語のサポートが充実
- **豊富な拡張機能**: 必要な機能を自由に追加できる
- **TypeScript統合**: マイクロソフト製なので、TypeScriptとの相性が抜群
- **リモート開発**: コンテナやクラウド環境でも開発できる

**パフォーマンス：**

- Electronベースながら軽快に動作（非常に最適化されています）
- 大きなファイルでも安定して動作
- メモリ使用量も効率的

## VS Codeの画面構成を覚えよう

### ワークスペースの構成

VS Codeの画面は、いくつかのエリアに分かれています。最初は覚えにくいかもしれませんが、慣れてしまえばとても使いやすいですよ。

![](assets/vscode.dio.png)

### キーボードショートカット

#### ファイル・ナビゲーション

```bash
# ファイル操作
Ctrl/Cmd + N           # 新規ファイル
Ctrl/Cmd + O           # ファイルを開く
Ctrl/Cmd + P           # クイックオープン（ファイル検索）
Ctrl/Cmd + Shift + P   # コマンドパレット
Ctrl/Cmd + W           # タブを閉じる
Ctrl/Cmd + Shift + T   # 最近閉じたタブを再度開く

# ナビゲーション
Ctrl/Cmd + G           # 行番号で移動
Ctrl/Cmd + Shift + O   # シンボル検索（関数・変数）
F12                    # 定義へ移動
Alt + F12              # 定義をピーク表示
Ctrl/Cmd + -           # 前の位置に戻る
```

#### 編集・検索

```bash
# 基本編集
Ctrl/Cmd + /           # コメントアウト
Ctrl/Cmd + [           # インデント減らす
Ctrl/Cmd + ]           # インデント増やす
Shift + Alt + F        # フォーマット

# マルチカーソル
Ctrl/Cmd + D           # 選択した単語と同じものを次々選択
Ctrl/Cmd + Shift + L   # 選択した単語と同じものを全て選択
Alt + Click            # マルチカーソル
Ctrl/Cmd + Alt + Up/Down # カーソルを上下に追加

# 検索・置換
Ctrl/Cmd + F           # ファイル内検索
Ctrl/Cmd + H           # 置換
Ctrl/Cmd + Shift + F   # 全体検索
Ctrl/Cmd + Shift + H   # 全体置換
```

#### ワークスペース管理

```bash
# パネル・サイドバー
Ctrl/Cmd + B           # サイドバー表示切り替え
Ctrl/Cmd + J           # パネル表示切り替え
Ctrl/Cmd + `           # ターミナル表示切り替え

# エディタ管理
Ctrl/Cmd + \           # エディタを分割
Ctrl/Cmd + 1/2/3       # エディタグループ間移動
Ctrl/Cmd + Shift + E   # Explorer表示
Ctrl/Cmd + Shift + G   # Git表示
```

## Web開発推奨拡張機能

### コード品質・フォーマッター

#### Biome

```json
{
  "biome.enabled": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

- ESLint + Prettier の代替
- 超高速なリンター・フォーマッター
- Rust製で軽量

### Git統合強化

#### GitLens

- インラインブレーム表示
- コミット履歴のリッチな可視化
- ファイル履歴とHeatmap

### HTTP・API開発

### AI支援開発

#### GitHub Copilot

```json
{
  "github.copilot.enable": {
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "javascriptreact": true
  }
}
```

- AIによるコード提案
- コンテキストを理解したコード生成
- ドキュメント生成支援

### 開発効率化

### 言語サポート

#### Pretty TypeScript Errors

- TypeScriptのエラーメッセージを読みやすく整形
- エラーの原因と解決策を視覚的に表示
- 型エラーの理解を大幅に向上

TypeScriptのエラーメッセージは、初心者にとって理解しにくいことがあります。この拡張機能は、エラーメッセージを色分けし、構造化して表示することで、問題の把握と解決を容易にします。

特に複雑な型エラーや、ジェネリクスに関するエラーメッセージが読みやすくなり開発効率が向上します。

### UI/UXサポート

#### Tailwind CSS IntelliSense

- クラス名補完
- カラープレビュー
- CSS値のホバー表示

## まとめ

## ポイント

この章で学んだ重要なことをまとめておきますね。

- **VS Code**: 無料で高機能なコードエディタ
- **拡張機能**: 必要な機能を自由に追加できる仕組み
- **IntelliSense**: コード補完や型情報の表示機能
- **統合ターミナル**: エディタ内でコマンドを実行できる機能
- **デバッガー**: コードの動作を詳細に確認できるツール

VS Codeを使うことで：

- ✅ 効率的なコード編集ができる
- ✅ 豊富な拡張機能で機能を拡張できる
- ✅ 統合開発環境としてすべての作業を一箇所で完結できる
- ✅ Gitとの連携でバージョン管理が簡単
- ✅ AI支援でコード作成が効率化される

最初は設定や拡張機能の選択に迷うかもしれませんが、まずは基本的な機能から慣れていき、必要に応じて少しずつカスタマイズしていくのがおすすめです。VS Codeは開発者にとって強力な味方になってくれますよ！
