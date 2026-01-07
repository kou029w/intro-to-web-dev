# TanStack Query入門

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/49bdc143-7554-4af7-ae13-dce3386249e4)

データ取得をもっと簡単に、もっと強力に。TanStack Query（旧React Query）は、サーバー状態管理の決定版ライブラリです。キャッシュ、バックグラウンド更新、楽観的更新まで、複雑な非同期処理をシンプルに扱えます（便利ですね）。

## この記事で学べること

- TanStack Queryの基本概念
- `useQuery`によるデータ取得
- ローディング・エラー状態の扱い方
- `QueryClient`によるグローバル設定
- 再検証のタイミング制御（focus/staleTime/gcTime）
- 条件付きフェッチ（enabled）
- `useMutation`によるデータ更新と楽観的更新

## TanStack Queryとは

TanStack Queryは「サーバー状態」を管理するためのライブラリです。

サーバー状態とは、APIから取得したデータのこと。これはクライアント状態（フォームの入力値やモーダルの開閉など）とは異なり、以下の特徴があります。

- **リモートに保存されている**：サーバー上にあるデータ
- **非同期で取得・更新する**：ネットワーク越しにやり取り
- **他のユーザーが変更する可能性がある**：常に最新とは限らない
- **古くなる可能性がある**：キャッシュの有効期限管理が必要

TanStack Queryはこれらの課題を解決し、キャッシュ管理・バックグラウンド更新・エラーハンドリング・再試行などを自動で行ってくれます。

## まずは使ってみる

インストール（プロジェクトで一度だけ）

```bash
pnpm i @tanstack/react-query
```

基本の使い方：

```ts tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

// QueryClientを作成（アプリで1つ）
const queryClient = new QueryClient();

export default function App() {
  return (
    // アプリ全体をProviderで囲む
    <QueryClientProvider client={queryClient}>
      <Profile />
    </QueryClientProvider>
  );
}

function Profile() {
  const { data, error, isPending } = useQuery({
    queryKey: ["user", 1], // キャッシュのキー
    queryFn: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
      return res.json();
    },
  });

  if (isPending) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました</p>;

  return (
    <div>
      <h2>{data.name}</h2>
      <small>ID: {data.id}</small>
    </div>
  );
}
```

> **Note:** `queryKey`はキャッシュを識別するためのキーです。同じキーを持つクエリはキャッシュを共有します。`queryFn`はデータを取得する非同期関数です。

## ローディング・エラー・データ

`useQuery`が返す状態は以下のとおりです。

- `isPending`: まだデータがない状態（初回読み込み中）
- `isError`: エラーが発生した状態
- `isSuccess`: データ取得に成功した状態
- `data`: 取得したデータ
- `error`: エラー情報
- `isFetching`: バックグラウンドで再取得中

```ts tsx
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodoList,
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  // ここに到達したらisSuccess === true
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

> `isPending`でも既にキャッシュがあれば`data`が存在する場合があります（バックグラウンド更新中）。`isFetching`で更新中かどうかを確認できます。

## QueryClientでグローバル設定

`QueryClient`にデフォルトオプションを設定できます。

```ts tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分間はキャッシュを新鮮とみなす
      gcTime: 1000 * 60 * 5, // 5分間キャッシュを保持
      retry: 3, // 失敗時に3回リトライ
      refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

主要なオプション：

- `staleTime`: この時間が経過するまでデータを「新鮮」とみなす（デフォルト: 0）
- `gcTime`: 未使用のキャッシュを保持する時間（デフォルト: 5分）
- `retry`: エラー時のリトライ回数（デフォルト: 3）
- `refetchOnWindowFocus`: タブに戻ったら再取得（デフォルト: true）

## 再検証タイミングをコントロール

TanStack Queryは様々なタイミングでデータを再取得します。

```ts tsx
const { data } = useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  staleTime: 1000 * 30, // 30秒間は再取得しない
  refetchOnWindowFocus: true, // フォーカス時に再取得
  refetchOnReconnect: true, // ネットワーク復帰時に再取得
  refetchInterval: 1000 * 60, // 1分ごとにポーリング
});
```

- `staleTime`: データが「古い」と判断されるまでの時間
- `refetchOnWindowFocus`: タブに戻ったとき
- `refetchOnReconnect`: ネットワーク復帰時
- `refetchInterval`: 定期的なポーリング（ミリ秒）

## 依存キーと条件付きフェッチ

`enabled`オプションで条件付きフェッチを実現できます。

```ts tsx
function UserDetail({ id }: { id?: number }) {
  const { data, isPending } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetch(`/api/users/${id}`).then((r) => r.json()),
    enabled: !!id, // idがあるときだけフェッチ
  });

  if (!id) return <p>ユーザーを選択してください</p>;
  if (isPending) return <p>読み込み中...</p>;

  return <div>{data.name}</div>;
}
```

`queryKey`に変数を含めると、その値が変わったときに自動で再取得されます（依存キー）。

```ts tsx
function UserPosts({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ["posts", userId], // userIdが変わると再取得
    queryFn: () => fetchUserPosts(userId),
  });
  // ...
}
```

## useMutationでデータを更新

データの作成・更新・削除には`useMutation`を使います。

```ts tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo: string) =>
      fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ text: newTodo }),
        headers: { "Content-Type": "application/json" },
      }).then((r) => r.json()),
    onSuccess: () => {
      // 成功したらtodosのキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate("新しいタスク")}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "追加中..." : "追加"}
    </button>
  );
}
```

### 楽観的更新（Optimistic Update）

サーバーの応答を待たずにUIを先に更新し、失敗したらロールバックするパターンです。

```ts tsx
const likeMutation = useMutation({
  mutationFn: (postId: number) =>
    fetch(`/api/posts/${postId}/like`, { method: "POST" }),
  onMutate: async (postId) => {
    // 進行中のクエリをキャンセル
    await queryClient.cancelQueries({ queryKey: ["post", postId] });

    // 現在のデータを保存
    const previousPost = queryClient.getQueryData(["post", postId]);

    // 楽観的に更新
    queryClient.setQueryData(["post", postId], (old: Post) => ({
      ...old,
      likes: old.likes + 1,
    }));

    return { previousPost };
  },
  onError: (err, postId, context) => {
    // エラー時はロールバック
    queryClient.setQueryData(["post", postId], context?.previousPost);
  },
  onSettled: (data, error, postId) => {
    // 成功・失敗に関わらず再取得
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  },
});
```

## DevToolsで状態を確認

TanStack Query DevToolsを使うと、キャッシュの状態やクエリの動作を視覚的に確認できます。

```bash
pnpm i @tanstack/react-query-devtools
```

```ts tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

開発モードでのみ表示され、本番ビルドでは自動的に除外されます（便利ですね）。

## やってみよう！

1. `queryKey`を`["user", 2]`に変えて、別のユーザーを取得してみる
2. 同じ`queryKey`を持つコンポーネントを2つ配置して、キャッシュ共有を確認
3. `staleTime: 30000`を設定して、30秒間は再取得しないことを確認
4. `refetchInterval: 5000`で5秒ごとにポーリングする様子を確認
5. DevToolsでキャッシュの状態を観察
6. `useMutation`で楽観的更新を実装してみる

## SWRとの違い

同様のライブラリにSWR（Vercel製）があります。選択の参考に：

| 特徴             | TanStack Query   | SWR                |
| ---------------- | ---------------- | ------------------ |
| バンドルサイズ   | やや大きい       | 小さい             |
| 学習コスト       | やや高い         | 低い               |
| 楽観的更新       | 組み込みサポート | 手動実装           |
| Mutation専用Hook | `useMutation`    | なし（手動で実装） |

シンプルなデータ取得ならSWR、複雑なミューテーションや状態管理が必要ならTanStack Queryがおすすめです。

## ポイント（まとめ）

- TanStack Queryは「サーバー状態」を管理するライブラリ
- `useQuery({ queryKey, queryFn })`でデータ取得
- `queryKey`でキャッシュを識別・共有
- `isPending`/`isError`/`data`で状態を判定
- `QueryClient`でグローバル設定（staleTime, gcTime, retry）
- `enabled`オプションで条件付きフェッチ
- `useMutation`でデータ更新（CRUD操作）
- `invalidateQueries`でキャッシュを無効化して再取得
- 楽観的更新で高速なUX実現

## 参考リンク

- TanStack Query 公式 <https://tanstack.com/query/latest>
- TanStack Query ドキュメント（日本語） <https://tanstack.com/query/latest/docs/framework/react/overview>
- JSONPlaceholder <https://jsonplaceholder.typicode.com/>
