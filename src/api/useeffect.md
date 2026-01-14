# useEffectによる非同期処理

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/6d9b22a2-bedd-43aa-b46b-5dafa570fe3a)

Reactでデータのリアルタイムの送信など外部への副作用を記述をしたい。そんなときに欠かせないのが`useEffect`です。発火のタイミング、クリーンアップ、依存配列などの基本を、実例で身につけましょう（簡単にできます）。

## この記事で学べること

- useEffectの基本と依存配列の意味
- データ取得のベストプラクティス（AbortControllerでのキャンセル）
- ローディング/エラー表示のパターン
- ありがちな落とし穴（無限ループなど）

## useEffectの基本

`useEffect`は「レンダーのあと」に実行される副作用（データ取得や購読など）を記述するためのフックです。

```ts tsx
import { useEffect, useState } from "react";

function UserCard({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser({ id: userId, name: `ユーザー${userId}` });
  }, [userId]);

  return <h2>{user?.name || "loading..."}</h2>;
}
```

この例では：

- `useEffect`の第1引数：実行したい副作用 (ここでは `setUser` で仮の名前をセット)
- `useEffect`の第2引数：依存配列 (`[userId]` なので、userIdが変わるたび実行)

> **Note**\
> 復習
>
> 依存配列（`[]`）が空だと、マウント時に1回だけ実行されます。

## データ取得（非同期）を正しく書く

`useEffect`内でasync関数を直接渡すのではなく、中で宣言して呼び出します（細かいですが大事です）。

```ts tsx
import { useEffect, useState } from "react";

function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    return () => controller.abort();
  }, [userId]);

  if (!user || loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "crimson" }}>エラー: {error}</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <small>ID: {user.id}</small>
    </div>
  );
}
```

重要なポイント：

1. **AbortController**: コンポーネントがアンマウントされたときにfetchをキャンセル
2. **3つの状態管理**: loading（読み込み中）、error（エラー）、user（成功時のデータ）
3. **依存配列 `[userId]`**: userIdが変わるたびに新しいデータを取得
4. **クリーンアップ関数**: `return () => controller.abort()` で前のリクエストをキャンセル

なぜAbortControllerが必要か：ユーザーが素早く別のユーザーに切り替えたとき、古いリクエストが完了してしまうと、新しいデータが古いデータで上書きされる問題が起きます。

> **Note**: ループやダブルフェッチを避けるため、依存配列に`user`や`loading`を安易に入れないようにしましょう。必要最小限にするのがコツです。

## 無限ループを避けるコツ

- 依存配列には「外から与えられる値」や「関数の安定化済み参照（useCallbackなど）」のみを入れる
- データを`setState`した結果に依存して再度`fetch`しないようにする
- オブジェクト/配列リテラルは毎回新しい参照になるので注意（`useMemo`で安定化）

## 型安全に書く

TypeScriptでは、APIから受け取るデータの型を定義しておくと、タイプミスや不正なアクセスを防げます。

```ts
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};
```

使用例：

```ts tsx
const [todo, setTodo] = useState<Todo | null>(null);

// 後でこう使える
if (todo) {
  console.log(todo.title); // OK
  console.log(todo.titl); // エラー！タイプミスに気づける
}
```

なぜ型を定義するのか：APIのレスポンス形式が変わったときや、プロパティ名を間違えたときに、コンパイル時に気づけるからです。

## やってみよう！

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/useeffect?file=src%2FApp.tsx)

1. 上の`UserCard`をコピーして、`userId`を切り替えるボタンを用意
2. 切り替え時に前のリクエストがキャンセルされることを確認（Networkタブで`(canceled)`が出るはず）
3. `https://jsonplaceholder.typicode.com/users/9999`にリクエストしてエラー表示をテスト

## ポイント（まとめ）

- `useEffect`は「レンダー後の副作用」を書く場所
- 依存配列は最小化して無限ループを回避
- ローディング/エラー状態を適切に管理してUXを向上
- 非同期のリクエストの中断には`AbortController`を使う

## 参考リンク

- React Docs: useEffect <https://react.dev/reference/react/useEffect>
- MDN: AbortController <https://developer.mozilla.org/ja/docs/Web/API/AbortController>
