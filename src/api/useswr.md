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

const API_BASE = "https://jsonplaceholder.typicode.com";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

function UserDetail({ userId }: { userId: number }) {
  const { data, error, isLoading } = useSWR<{
    id: number;
    name: string;
    email: string;
  }>(`${API_BASE}/users/${userId}`, fetcher);

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました</p>;

  return (
    <div>
      <h4>{data.name}</h4>
      <p>{data.email}</p>
      <small>ID: {data.id}</small>
    </div>
  );
}
```

> **Note**: `fetcher`は「URLを受け取ってデータを返す関数」。SWRはこの`fetcher`にURL（キー）を渡して実行します。エラー時は例外を投げることで、SWRの`error`状態が有効になります。

## ローディング・エラー・データ

SWRは状態管理も内蔵しています。

- `isLoading`: まだ最初のデータがない状態
- `error`: フェッチに失敗したときのエラー
- `data`: フェッチ済みデータ（キャッシュを含む）

> すでにキャッシュがあれば`isLoading`でも`data`がある、という状態も起こり得ます（SWRの肝です）。

## SWRConfig でグローバル設定

```ts tsx
import { SWRConfig } from "swr";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

function Providers({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}

// 使い方
function App() {
  return (
    <Providers>
      <UserDetail userId={1} />
    </Providers>
  );
}
```

> **Note**: ここで指定した`fetcher`がデフォルトになります。各コンポーネントで`fetcher`を省略可能に（楽ですね）。

## 再検証タイミングをコントロール

- `revalidateOnFocus`: タブに戻ったら再取得（ユーザーに最新を見せる）
- `revalidateOnReconnect`: ネットワーク復帰で再取得
- `refreshInterval`: 定期ポーリング（ms）。`0`で無効

```ts tsx
function UserDetail({ userId, enableRefresh = false }) {
  const { data, error, isLoading } = useSWR<{
    id: number;
    name: string;
    email: string;
  }>(`${API_BASE}/users/${userId}`, {
    refreshInterval: enableRefresh ? 5_000 : 0, // 5秒ごとに再フェッチ
  });

  // ...
}
```

> **Note**: `refreshInterval`を使うと、一定間隔でデータが自動更新されます。リアルタイム性が必要な場面で便利です。

## 依存キーと条件付きフェッチ

キー（第1引数）に`null`を渡すとフェッチしません。必要な条件がそろうまで待てます。

```ts tsx
function Profile() {
  const [userId, setUserId] = useState("");
  const [submittedUserId, setSubmittedUserId] = useState("");

  // submittedUserIdが空の場合はフェッチしない
  const { data, error, isLoading } = useSWR(
    submittedUserId ? `${API_BASE}/users/${submittedUserId}` : null,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmittedUserId(userId.trim());
      }}
    >
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="ユーザーID"
      />
      <button type="submit">検索</button>
    </form>
  );
}
```

> **Note**: フォーム入力が完了して「検索」ボタンを押すまでリクエストは発生しません。

## ミューテーションでUIを即時更新

`mutate`はキャッシュを書き換え、UIを即時反映させる関数です。サーバー反映を待たずに「先に見た目を更新」できます（便利）。

```ts tsx
function Profile() {
  const [submittedUserId, setSubmittedUserId] = useState("");

  const { data, error, mutate } = useSWR(
    submittedUserId ? `${API_BASE}/users/${submittedUserId}` : null,
  );

  // 存在しないユーザーをローカルで「作成」する（mutateでキャッシュに直接書き込む）
  const createDummyUser = () => {
    mutate(
      {
        id: Number(submittedUserId),
        name: `ダミーユーザー ${submittedUserId}`,
        email: `dummy${submittedUserId}@example.com`,
        phone: "000-0000-0000",
      },
      { revalidate: false }, // サーバーに再リクエストしない
    );
  };

  // エラー時に再試行
  const retry = () => mutate();

  // ...
}
```

> **Note**: `mutate()`を引数なしで呼ぶと再フェッチ、データを渡すとキャッシュを直接書き換えます。`{ revalidate: false }`でサーバーへの再リクエストを抑制できます。

## SWRでのエラーハンドリング戦略

エラー発生時の回復パターンを見てみましょう。

```ts tsx
function Profile() {
  const [submittedUserId, setSubmittedUserId] = useState("");
  const [shouldRetryOnError, setShouldRetryOnError] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    submittedUserId ? `${API_BASE}/users/${submittedUserId}` : null,
    { shouldRetryOnError }, // エラー時の自動リトライを制御
  );

  return (
    <>
      {error && !isLoading && (
        <div>
          <p>ユーザー {submittedUserId} が見つかりません</p>
          <button onClick={() => mutate()}>再試行</button>
          <button onClick={createDummyUser}>ユーザーを作成</button>
        </div>
      )}

      {data && !error && (
        <div>
          <p>{data.name}</p>
          <p>{data.email}</p>
        </div>
      )}
    </>
  );
}
```

> **Note**: `shouldRetryOnError`オプションでエラー時の自動リトライを制御できます。手動で再試行させたい場合は`false`に設定し、`mutate()`で明示的に再フェッチします。

## やってみよう！

![https://developer.stackblitz.com/img/open_in_stackblitz.svg](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/useswr?file=src%2FApp.tsx)

サンプルコードには3つのセクションがあります。

### 1. キャッシュ共有 + 定期更新

- 同じURLを参照する複数のコンポーネントがキャッシュを共有することを確認
- ユーザーIDを切り替えて、2回目以降は即座に表示される（キャッシュヒット）ことを体験
- DevTools Networkで1回のみリクエストされることを確認
- 「自動更新」チェックボックスで5秒間隔の`refreshInterval`を体験

### 2. キーの先行切り替え

- IDを変更すると、IDは即座に切り替わるがデータは後から到着する様子を観察
- SWRのキー変更でリクエストが発生する仕組みを理解

### 3. 条件付きフェッチ + エラーハンドリング

- IDを入力して「検索」を押すまでリクエストが発生しないことを確認
- 存在しないID（11以上）を入力してエラーハンドリングを体験
- 「再試行」ボタンで`mutate()`による再フェッチを体験
- 「ユーザーを作成」ボタンで`mutate()`によるキャッシュ書き込みを体験

> **Tip**: Chrome DevTools > Network を「低速 4G」にすると、SWRの挙動がより分かりやすくなります。

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
