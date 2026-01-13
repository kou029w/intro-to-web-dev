# fetch APIの基本

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/659e6f27-4966-464a-b2b1-f8a4897e4a9b)

JavaScriptでAPIリクエストを送るためのfetch APIについて学んでいきましょう。前回Thunder Clientで体験したAPIリクエストを、今度はコードで実装してみます。

## この記事で学べること

- fetch APIの基本構文と使い方
- PromiseとAsync/Awaitの関係
- GETリクエストの実装方法
- POSTリクエストの実装方法
- エラーハンドリングの基本パターン
- AbortControllerによるキャンセル処理

## fetch APIとは

`fetch`は、ブラウザに標準で備わっているAPIリクエスト用の関数です。XMLHttpRequest（XHR）の後継として登場し、現在のWeb開発ではこちらが主流です。Node.js 18以降でもネイティブサポートされているので、サーバーサイドでも同じ書き方で使えます（便利ですね）。

### 最小構成

```js
fetch("https://jsonplaceholder.typicode.com/posts/1");
```

たったこれだけでHTTPリクエストが送れます。ただし、このままでは結果を受け取れません。`fetch`は**Promise**を返すので、適切に処理する必要があります。

## Promiseとasync/await

`fetch`を使いこなすには、JavaScriptの非同期処理を理解しておく必要があります。

### Promiseとは

Promiseは「将来の結果を約束するオブジェクト」です。APIリクエストのように時間がかかる処理の結果を扱うために使います。

```js
// fetchはPromiseを返す
const promise = fetch("https://jsonplaceholder.typicode.com/posts/1");
console.log(promise); // Promise { <pending> } (DevToolsで確認可能)
```

### .then()で結果を受け取る

```js
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then((response) => {
    console.log("レスポンスを受け取りました");
    return response.json(); // これもPromiseを返す
  })
  .then((data) => {
    console.log(data.title);
  });
```

`.then()`をチェーンでつなげて、順番に処理を書けます。ただ、ネストが深くなると読みにくくなりがちです。

### async/awaitで読みやすく

`async/await`を使うと、非同期コードを同期的な見た目で書けます。

```js
async function getPost() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  const data = await response.json();
  console.log(data.title);
}

await getPost();
```

`await`は「Promiseの結果が返ってくるまで待つ」という意味です。`await`を使うには、関数に`async`キーワードを付ける必要があります。

> **Note**: この記事では主に`async/await`形式で解説します。現代のJavaScript開発ではこちらが主流です。

## GETリクエスト

データを取得する基本パターンを見ていきましょう。

### 基本形

```js
async function fetchUser(id) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
  );
  const user = await response.json();
  return user;
}

// 使用例
const user = await fetchUser(1);
console.log(user.name); // "Leanne Graham"
```

### ヘッダーを付ける

APIによっては、リクエストヘッダーの指定が必要です。

```js
async function fetchWithHeaders(url) {
  const response = await fetch(url, {
    method: "GET", // GETの場合は省略可能
    headers: {
      Accept: "application/json",
      "X-Custom-Header": "value",
    },
  });
  return response.json();
}

await fetchWithHeaders("https://jsonplaceholder.typicode.com/users/1");
```

### クエリパラメータの扱い

URLにパラメータを付けるには`URLSearchParams`が便利です。

```js
async function searchUsers(query, limit = 10) {
  const params = new URLSearchParams({
    q: query,
    _limit: limit.toString(),
  });

  const url = `https://jsonplaceholder.typicode.com/users?${params}`;
  const response = await fetch(url);
  return response.json();
}

// 使用例
const results = await searchUsers("Leanne");
console.log(results);
```

`URLSearchParams`はエンコードも自動でやってくれます（日本語なども安全に扱えます）。

## POSTリクエスト

データを送信する場合はPOSTメソッドを使います。

### 基本形

```js
async function createPost(post) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  const created = await response.json();
  return created;
}

// 使用例
const newPost = await createPost({
  title: "Hello World",
  body: "This is my first post",
  userId: 1,
});
console.log(newPost.id); // 101（サーバーが割り当てたID）
```

### 重要なポイント

1. **`method: "POST"`** を指定する
2. **`Content-Type: application/json`** ヘッダーを付ける
3. **`JSON.stringify()`** でオブジェクトを文字列に変換する

`JSON.stringify()`を忘れると、サーバーには`[object Object]`という文字列が送られてしまいます（よくあるミスです）。

### PUT/PATCH/DELETEも同様

```js
// PUT: リソース全体を置き換え
async function updatePost(id, post) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    },
  );
  return response.json();
}

// DELETE: リソースを削除
async function deletePost(id) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    {
      method: "DELETE",
    },
  );
  return response.ok; // 成功ならtrue
}

// 例
await updatePost(1, { title: "Updated", body: "Updated body", userId: 1 });
await deletePost(1);
```

## エラーハンドリング

`fetch`のエラー処理には注意点があります。

### fetchは404でも例外を投げない

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/9999");
console.log(response.ok); // false
console.log(response.status); // 404
// でも、例外は発生していない！
```

`fetch`が例外を投げるのは、**ネットワークエラー**（サーバーに到達できない場合）だけです。HTTP 404や500などのエラーレスポンスは、正常なレスポンスとして返ってきます。

### response.okを確認する

```js
async function fetchPost(id) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}

await fetchPost(9999); // HTTP 404の場合、例外が投げられる
```

`response.ok`は、ステータスコードが200-299の範囲なら`true`になります。
開発者がレスポンスを確認し適切に対処できるようになっています。

## AbortControllerによるキャンセル

リクエストを途中でキャンセルしたいケースがあります（画面遷移時など）。

### 基本的な使い方

```js
const controller = new AbortController();

// 10msでキャンセル
setTimeout(() => controller.abort(), 10);

try {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    signal: controller.signal,
  });
  const data = await response.json();
  console.log(data);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("リクエストがキャンセルされました");
  } else {
    throw error;
  }
}
```

> **Note**: Reactでは、コンポーネントのアンマウント時にリクエストをキャンセルするのがベストプラクティスです。詳しくは「[useEffectによる非同期処理](use-effect.md)」で解説します。

## TypeScriptでの型付け

TypeScriptを使う場合、レスポンスの型を定義しておくと安全です。

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const user: User = await response.json();
  return user;
}
```

`response.json()`の戻り値は`any`なので、型を明示的に付けることで、以降のコードで型チェックが効きます（タイプミスに気づけて助かります）。

## やってみよう！

1. ブラウザの開発者ツール（Console）で以下を実行してみましょう

```js
// GETリクエスト
const res = await fetch("https://jsonplaceholder.typicode.com/users");
const users = await res.json();
console.log("ユーザー数:", users.length);
```

2. POSTリクエストを試してみましょう

```js
// POSTリクエスト
const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "テスト", body: "本文", userId: 1 }),
});
const created = await res.json();
console.log("作成されたID:", created.id);
```

3. エラーハンドリングを確認

```js
const res = await fetch("https://httpbin.org/status/404");
console.log("ok:", res.ok); // false
console.log("status:", res.status); // 404
```

4. タイムアウトを体験

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 100); // 100msでキャンセル

try {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    signal: controller.signal,
  });
} catch (e) {
  console.log("エラー種別:", e.name); // "AbortError"
}
```

## ポイント（まとめ）

- **fetch**: ブラウザ標準のHTTPリクエスト関数。Promiseを返す
- **async/await**: 非同期処理を同期的な見た目で書ける構文
- **response.json()**: レスポンスボディをJSONとしてパース
- **response.ok**: ステータスコードが200-299ならtrue
- **JSON.stringify()**: POSTで送るデータをJSON文字列に変換
- **AbortController**: リクエストのキャンセルに使う
- **fetchは404で例外を投げない**: 必ず`response.ok`をチェックする

## 参考リンク

- MDN: fetch API <https://developer.mozilla.org/ja/docs/Web/API/Fetch_API>
- MDN: async/await <https://developer.mozilla.org/ja/docs/Learn_web_development/Extensions/Async_JS/Promises>
- MDN: AbortController <https://developer.mozilla.org/ja/docs/Web/API/AbortController>
- JSONPlaceholder <https://jsonplaceholder.typicode.com/>
