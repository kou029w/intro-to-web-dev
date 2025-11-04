# Web開発研修

この章は、実践的なWeb開発スキルを短期間で身につけることを目的とした研修カリキュラムです。ハンズオン中心の構成で、ローカル環境のセットアップからAPI設計、Edge/サーバーレス技術（Hono/HonoX）を使ったフルスタック開発、そしてチームでの開発演習までを扱います。

### 学習の目標

- モダンなローカル開発環境を自信を持って構築できる
- HTTP/RESTや非同期処理の基礎を理解し、外部APIと連携できる
- HonoやHonoXを使った軽量なサーバー/APIを設計・実装できる
- 型安全（TypeScript）とテストを取り入れた堅牢な開発フローを実践できる
- 小さなチームでプロジェクトを企画・実装し、成果を発表できる

### 前提条件

- HTML/CSS/JavaScript の基礎知識

### 進め方（推奨）

1. 環境構築パート（Environment）を最初に終わらせ、ローカルで実行できる状態を作る
2. REST APIと非同期処理の章でHTTPの基本とfetch等の使い方を押さえる
3. Honoハンズオンでサーバー側の基本を学び、HonoXでフロントとAPIの連携を実践する
4. 演習（Practice）で小さなプロジェクトを作り、最後に発表・レビューを行う

所要時間は全体で数週間〜1ヶ月程度（学習ペースや研修スコープにより変動）を想定しています。短期間で集中的に進める場合は、演習を縮小して重要なトピックに絞ると良いです。

### 演習と評価

各パートには演習課題があり、手を動かして学ぶことを重視しています。最終的には小規模なチームでの開発演習を通して以下を評価します：

- 要件定義と設計の妥当性
- 実装の正確さと型安全性（TypeScript）
- テストの有無と品質（ユニット/統合）
- デプロイやドキュメントの整備

成果はプロジェクトのデモと簡単なレポートで共有してください。

### フィードバック / 問い合わせ

学習中の質問・改善提案・教材の誤りなどは「[質問・提案・問題の報告](../issues.md)」をご覧ください。研修担当者やメンターに直接相談しても構いません。

## Web開発環境構築

- [モダンWebアーキテクチャ概要](environment/architecture.md)
- [ローカル開発環境セットアップ](environment/local-setup.md)
- [miseによるツール管理](environment/mise.md)
- [VSCode入門](environment/vscode.md)
- [Git/GitHub基礎](environment/git-github.md)
- [React環境構築](environment/react-setup.md)
- [TypeScript導入](environment/typescript.md)
- [Biomeによるコード品質管理](environment/biome.md)
- [AI支援ツール活用法](environment/ai-agents.md)
- [基本的な開発の流れ](environment/workflow.md)

## REST APIと非同期処理

- [REST API基礎](api/rest-basics.md)
- [GitHubで学ぶREST API実践](api/rest-api-practice.md)
- [HTTPリクエストとJSON](api/http-json.md)
- [fetch APIの基本](api/fetch-api.md)
- [useEffectによる非同期処理](api/useeffect.md)
- [useSWR入門](api/useswr.md)
- [エラーハンドリング戦略](api/error-handling.md)
- [プロキシ確認ガイド](api/proxy.md)

## Honoハンズオン

- [Hono概要とEdge-first思想](hono/hono-overview.md)
- [Hello Worldとローカル実行](hono/hello-world.md)
- [ルーティング基礎](hono/routing.md)
- [JSONレスポンスとリクエスト処理](hono/json-handling.md)
- [ミドルウェア活用](hono/middleware.md)
- [ファイル構成とコード分割](hono/file-structure.md)
- [TypeScriptとHono型システム](hono/typescript.md)
- [エラーハンドリング](hono/error-handling.md)
- [環境変数と設定管理](hono/environment.md)
- [デプロイ戦略](hono/deployment.md)

## HonoXによるフルスタック構築

- [HonoX概要とアーキテクチャ](honox/honox-overview.md)
- [プロジェクトセットアップ](honox/project-setup.md)
- [プロジェクト構造とディレクトリ設計](honox/project-structure.md)
- [フロントエンドページ開発](honox/frontend-pages.md)
- [API定義とサーバー関数](honox/api-server-functions.md)
- [型安全なAPI連携](honox/type-safe-api.md)
- [認証とセッション管理](honox/auth-session.md)
- [RPC実装とzodバリデーション](honox/rpc-zod.md)
- [SSR/CSR戦略](honox/ssr-csr.md)
- [テスト戦略](honox/testing.md)
- [デプロイとキャッシュ戦略](honox/deployment-cache.md)
- [CRUD アプリケーション構築](honox/crud-app.md)

## Web開発演習

- [プロジェクト企画と要件定義](practice/project-planning.md)
- [サンプルアプリケーション分析](practice/sample-apps.md)
- [画面設計とDB設計](practice/design.md)
- [開発環境セットアップ](practice/dev-setup.md)
- [開発実践とチーム作業](practice/development.md)
- [成果発表準備](practice/presentation.md)
