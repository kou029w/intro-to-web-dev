# useEffectによる非同期処理

Reactコンポーネントでデータ取得をしたい。そんなときに欠かせないのが`useEffect`です。発火のタイミング、クリーンアップ、依存配列などの基本を、実例で身につけましょう（簡単にできます）。

## この記事で学べること

- useEffectの基本と依存配列の意味
- データ取得のベストプラクティス（AbortControllerでのキャンセル）
- ローディング/エラー表示のパターン
- ありがちな落とし穴（無限ループなど）

# useEffectの基本

`useEffect`は「レンダーのあと」に実行される副作用（データ取得や購読など）を記述するためのフックです。

```ts tsx
import { useEffect, useState } from "react";

function UserName({ id }: { id: number }) {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    document.title = `User ${id}`; // レンダー後に副作用
  }, [id]); // idが変わるたびに実行

  return <h1>{name || "loading..."}</h1>;
}
```

> **Note**: 依存配列（`[]`）が空だと、マウント時に1回だけ実行されます。

# データ取得（非同期）を正しく書く

`useEffect`内でasync関数を直接渡すのではなく、中で宣言して呼び出します（細かいですが大事です）。

```ts tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string };

export function UserCard({ id }: { id: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users/${id}`,
          { signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: User = await res.json();
        setUser(data);
      } catch (e) {
        if ((e as any)?.name === "AbortError") return; // アンマウント時の中断
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort(); // クリーンアップで中断
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "crimson" }}>エラー: {error}</p>;
  if (!user) return null;
  return (
    <div>
      <h2>{user.name}</h2>
      <small>ID: {user.id}</small>
    </div>
  );
}
```

> **Note**: ループやダブルフェッチを避けるため、依存配列に`user`や`loading`を安易に入れないようにしましょう。必要最小限にするのがコツです。

# 無限ループを避けるコツ

- 依存配列には「外から与えられる値」や「関数の安定化済み参照（useCallbackなど）」のみを入れる
- データを`setState`した結果に依存して再度`fetch`しないようにする
- オブジェクト/配列リテラルは毎回新しい参照になるので注意（`useMemo`で安定化）

# 型安全に書く（ざっくり）

TypeScriptでは、受け取るJSONの型を定義しておくと安心です。

```ts
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};
```

JSONを`Todo`にパースして使うだけで、プロパティのタイプミスに気づけます（助かりますよね）。

# やってみよう！

1. 上の`UserCard`をコピーして、`id`を切り替えるボタンを用意
2. 切り替え時に前のリクエストがキャンセルされることを確認（Networkタブで`(canceled)`が出るはず）
3. `https://httpstat.us/404`にリクエストしてエラー表示をテスト

# ポイント（まとめ）

- `useEffect`は「レンダー後の副作用」を書く場所
- 非同期は`AbortController`でキャンセル対応を入れる
- 依存配列を最小化して無限ループを回避
- ローディング/エラー/成功の3状態をUIで明示

# 参考リンク

- React Docs: useEffect <https://react.dev/reference/react/useEffect>
- MDN: AbortController <https://developer.mozilla.org/ja/docs/Web/API/AbortController>
