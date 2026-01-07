# useSWR入門

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/8d68e3cb-c371-4400-9dbf-7b7547414543)

データ取得をもっと楽に、もっと速く。そんな願いを叶えるのが Vercel 製のデータフェッチングライブラリ「SWR」です。Reactの`useEffect + fetch`よりもシンプルに、キャッシュや再検証（Revalidation）まで面倒を見てくれます（便利です）。

## この記事で学べること

- SWRの基本概念（Stale-While-Revalidate）
- 最小コードでのデータ取得
- ローディング・エラー表示のパターン
- グローバル設定（SWRConfig）
- 再検証のタイミング制御（focus/reconnect/interval）
- ミューテーション（書き込みとキャッシュ更新）
- 依存キー・条件付きフェッチ

## 基本概念：Stale-While-Revalidate とは

SWRは「手元のキャッシュ（stale）をすぐ表示しつつ、裏で最新データを取りに行き（revalidate）、更新できたらUIを差し替える」という戦略です。ユーザーは待たされず、でもデータは新鮮。いいとこ取りというわけです。

## まずは使ってみる

インストール（プロジェクトで一度だけ）

```bash
pnpm i swr
```

基本の使い方：

```ts tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Profile() {
  const { data, error, isLoading } = useSWR(
    "https://jsonplaceholder.typicode.com/users/1",
    fetcher,
  );

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました</p>;

  return (
    <div>
      <h2>{data.name}</h2>
      <small>ID: {data.id}</small>
    </div>
  );
}
```

> **Note**: `fetcher`は「URLを受け取ってデータを返す関数」。SWRはこの`fetcher`にURL（キー）を渡して実行します。

## ローディング・エラー・データ

SWRは状態管理も内蔵しています。

- `isLoading`: まだ最初のデータがない状態
- `error`: フェッチに失敗したときのエラー
- `data`: フェッチ済みデータ（キャッシュを含む）

> すでにキャッシュがあれば`isLoading`でも`data`がある、という状態も起こり得ます（SWRの肝です）。

## SWRConfig でグローバル設定

```ts tsx
import { SWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

> **Note**: ここで指定した`fetcher`がデフォルトになります。各コンポーネントで省略可能に（楽ですね）。

## 再検証タイミングをコントロール

- `revalidateOnFocus`: タブに戻ったら再取得（ユーザーに最新を見せる）
- `revalidateOnReconnect`: ネットワーク復帰で再取得
- `refreshInterval`: 定期ポーリング（ms）。`0`で無効

```ts tsx
const { data } = useSWR("/api/notifications", { refreshInterval: 10_000 });
```

## 依存キーと条件付きフェッチ

キー（第1引数）に`null`を渡すとフェッチしません。必要な条件がそろうまで待てます。

```ts tsx
function UserDetail({ id }: { id?: number }) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/users/${id}` : null, // idがないときはフェッチしない
  );
  // ...
}
```

キーを配列で表現して、`fetcher`側で受け取ることもできます。

```ts tsx
const fetchUser = (_key: string, id: number) =>
  fetch(`/api/users/${id}`).then((r) => r.json());
const { data } = useSWR(["user", 123], fetchUser);
```

## ミューテーションでUIを即時更新

`mutate`はキャッシュを書き換え、UIを即時反映させる関数です。サーバー反映を待たずに「先に見た目を更新」できます（便利）。

```ts tsx
import useSWR, { mutate } from "swr";

function LikeButton({ postId }: { postId: number }) {
  const key = `/api/posts/${postId}`;
  const { data } = useSWR(key);

  const onLike = async () => {
    // 楽観的更新（optimistic UI）
    mutate(
      key,
      { ...data, likes: (data?.likes ?? 0) + 1 },
      { revalidate: false },
    );
    try {
      await fetch(`${key}/like`, { method: "POST" });
      // サーバー確定後に再検証
      mutate(key);
    } catch {
      // 失敗したら再検証で正しい値に戻す
      mutate(key);
    }
  };

  return <button onClick={onLike}>👍 {data?.likes ?? 0}</button>;
}
```

## SWRでのエラーハンドリング戦略

```ts tsx
import useSWR, { SWRConfig } from "swr";

const fetchJSON = <T,>(url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });

function User() {
  const { data, error, isLoading, mutate } = useSWR("/api/me", fetchJSON);
  if (isLoading) return <p>読み込み中</p>;

  // エラーハンドリング (1) … ここでは利用者に「何が起きたか」「どうすべきか」を明確に伝える
  // 利用者が回復できるように mutate を提供
  if (error) return <button onClick={() => mutate()}>再試行</button>;

  return <div>{data.name}</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // エラーハンドリング (2) … ここでは開発者向けに「何が起きたか」をプライバシーに配慮した範囲で伝える
        // 具体例: グローバル通知やSentry送信など
        onError(err) {
          console.error("[SWR Error]", err);
        },
        shouldRetryOnError: true,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

## やってみよう！

1. URLを`/users/2`に変えて結果の差を確認
2. 同じコンポーネントを2つ置いて、2回目が高速表示（キャッシュ命中）されることを体験
3. ネットワークを「Slow 3G」にしてSWRの体験を比較（Chrome DevTools > Network）
4. `refreshInterval: 5000` を設定して、一定間隔でデータが更新される様子を確認
5. `mutate`で「楽観的更新」を体験（いいねボタンなど）
6. 条件付きフェッチで「フォーム入力完了まで待つ」UIを実装

## ポイント（まとめ）

- SWRは「キャッシュ優先＋裏で再取得」の戦略
- `useSWR(key, fetcher)` が基本形
- 状態（loading/error/data）を内蔵していてUIが簡単
- `SWRConfig`で全体方針を一括設定
- フォーカス/再接続/ポーリングで最新化タイミングを制御
- `mutate`でキャッシュを書き換えてUIを即反映
- `null`キーで条件付きフェッチ、配列キーで柔軟に渡す

## 参考リンク

- SWR 公式 <https://swr.vercel.app/ja>
- JSONPlaceholder <https://jsonplaceholder.typicode.com/>
