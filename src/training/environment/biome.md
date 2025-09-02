# Biomeによるコード品質管理

この章では、コードの品質を自動的にチェック・整形してくれる「Biome」について一緒に学んでいきましょう。Biomeは比較的新しいツールですが、従来のESLintやPrettierよりもずっと高速で、設定も簡単です。使い始めると、コードがとてもきれいに保たれるようになりますよ。

## 学習目標

- Biomeを使ったコードチェックと整形方法を覚える
- ESLintやPrettierの代わりとしてBiomeを使う
- コードの品質を自動で保つ仕組みを理解する
- エディタとの連携やチーム開発での活用方法を学ぶ

## Biomeって何？

### 基本的な概念

**Biome**は、JavaScript、TypeScript、JSON、CSSのコードを「きれいに」「正しく」してくれるツールです。従来は複数のツールを組み合わせて使っていた機能を、一つのツールで提供してくれます。

### Biomeの魅力

- **とても高速**: Rustという言語で作られているので、従来ツールより10倍以上速い
- **オールインワン**: リンティング・フォーマット・import整理を一つで
- **設定不要**: デフォルトの設定ですぐに使える
- **エディタ連携**: VS Codeでリアルタイムにチェックしてくれる
- **簡単導入**: 既存のプロジェクトにも簡単に追加できる

### 従来のツールとの比較

今まではいくつかのツールを組み合わせる必要がありました：

| 機能           | ESLint | Prettier | Biome          |
| -------------- | ------ | -------- | -------------- |
| コードチェック | ✅     | ❌       | ✅             |
| 見た目整形     | 一部   | ✅       | ✅             |
| 処理速度       | 普通   | 普通     | **とても速い** |
| 設定の難しさ   | 複雑   | 簡単     | **とても簡単** |
| プラグイン依存 | 多い   | 少ない   | **なし**       |

Biome一つで全部できるので、覚えることが少なくて済みますね。

## Biomeをインストールしよう

### 1. プロジェクトへのインストール

```bash
npm install --save-dev @biomejs/biome
```

### 2. 初期設定

```bash
# Biome設定ファイルの生成
npx @biomejs/biome init
```

### 3. package.jsonスクリプト設定

```json
{
  "scripts": {
    "lint": "biome lint ./src",
    "lint:fix": "biome lint --write ./src",
    "format": "biome format ./src",
    "format:fix": "biome format --write ./src",
    "check": "biome check ./src",
    "check:fix": "biome check --write ./src"
  }
}
```

#### コマンドラインでの実行

**リンティング**

```bash
# リンティングチェック
pnpm run lint

# 自動修正付きリンティング
pnpm run lint:fix

# 特定ファイルのリンティング
pnpm exec biome lint src/App.tsx
```

**フォーマッティング**

```bash
# フォーマットチェック
pnpm run format

# フォーマット適用
pnpm run format:fix

# 特定ファイルのフォーマット
pnpm exec biome format --write src/App.tsx
```

**統合コマンド（推奨）**

```bash
# リンティング・フォーマット・import整理を一括実行
pnpm run check:fix

# ドライラン（何が変更されるかプレビュー）
pnpm run check
```

### 2. 基本的な設定例

**基本的なbiome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.5/schema.json",
  "formatter": {
    "enabled": true
  },
  "linter": {
    "enabled": true
  },
  "assist": {
    "enabled": true
  }
}
```

## エディタ統合

### VS Code 設定

**拡張機能のインストール**

```bash
# VS Code拡張機能
code --install-extension biomejs.biome
```

**settings.json**

```json
{
  // Biome を優先フォーマッタに設定
  "editor.defaultFormatter": "biomejs.biome",

  // 保存時にフォーマット適用
  "editor.formatOnSave": true,

  // 保存時にコード修正
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },

  // 他のフォーマッタを無効化
  "prettier.enable": false,
  "eslint.enable": false
}
```

## トラブルシューティング

### よくある問題と解決法

**特定ルールの無効化**

```typescript
// ファイル全体で無効化
// @biome-ignore lint/suspicious/noExplicitAny: legacy code

// 行単位で無効化
const data: any = getValue(); // @biome-ignore lint/suspicious/noExplicitAny: external API
```

**フォーマット結果が期待と違う**

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentSize": 2,
    "lineWidth": 100,
    "ignore": ["**/*.generated.ts"]
  }
}
```

## まとめ

この章で学んだポイント：

- **Biomeの基本**: リンティング・フォーマット・import整理を一つのツールで可能
- **インストールと設定**: `npm install --save-dev @biomejs/biome` と `npx @biomejs/biome init` で簡単導入
- **VS Code連携**: 保存時に自動でコード品質チェック・整形
- **実践的な使い方**: `pnpm run check:fix` でコード品質を自動改善

Biomeを使うことで、コードの品質を保ちながら、フォーマットやリンティングの設定に悩む時間を減らせます。まずはVS Codeの拡張機能をインストールして、保存時の自動フォーマットから試してみましょう！
