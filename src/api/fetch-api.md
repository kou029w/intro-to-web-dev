# fetch APIの基本

JavaScriptでAPIリクエストを送るためのfetch APIについて学んでいきましょう。前回Thunder Clientで体験したAPIリクエストを、今度はコードで実装してみます。

## fetch APIとは

fetch APIは、JavaScriptでHTTPリクエストを送るためのモダンな方法です。ブラウザに標準搭載されており、Promiseベースで使いやすく設計されています（昔のXMLHttpRequestより遥かに簡単です）。

### fetch APIの特徴

- **Promise ベース**: async/await で読みやすいコードが書ける
- **標準搭載**: 追加ライブラリ不要
- **柔軟**: あらゆるHTTPリクエストに対応
- **モダン**: 現代的なJavaScriptの書き方

## 基本的な使い方

### 最もシンプルなGETリクエスト

```javascript
// 基本形
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('エラー:', error));

// async/await版（推奨）
async function getPost() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('エラー:', error);
  }
}

getPost();
```

### レスポンスの確認

fetch APIは、サーバーからレスポンスが返ってくれば成功とみなします：

```javascript
async function getUser() {
  const response = await fetch('/api/users/123');

  // ステータスコードをチェック
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const user = await response.json();
  return user;
}
```

## POSTリクエストでデータを送信

### ユーザー作成の例

```javascript
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error(`作成に失敗しました: ${response.status}`);
  }

  const newUser = await response.json();
  return newUser;
}

// 使用例
const userData = {
  name: '田中太郎',
  email: 'tanaka@example.com'
};

createUser(userData)
  .then(user => console.log('作成されたユーザー:', user))
  .catch(error => console.error('エラー:', error));
```

### フォームデータの送信

```javascript
async function updateProfile(formData) {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.get('name'),
      email: formData.get('email')
    })
  });

  return await response.json();
}
```

## よく使うパターン

### 認証付きリクエスト

```javascript
async function authenticatedRequest(url, options = {}) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json();
}

// 使用例
try {
  const userProfile = await authenticatedRequest('/api/profile');
  console.log(userProfile);
} catch (error) {
  console.error('認証エラーまたはリクエストエラー:', error);
}
```

### クエリパラメータの追加

```javascript
function buildURL(baseURL, params) {
  const url = new URL(baseURL);
  Object.keys(params).forEach(key =>
    url.searchParams.append(key, params[key])
  );
  return url.toString();
}

async function searchUsers(query) {
  const url = buildURL('/api/users', {
    search: query,
    page: 1,
    limit: 10
  });

  const response = await fetch(url);
  return await response.json();
}

// 使用例
const results = await searchUsers('田中');
// リクエスト先: /api/users?search=%E7%94%B0%E4%B8%AD&page=1&limit=10
```

## エラーハンドリング

### 包括的なエラー処理

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // HTTPエラーをチェック
    if (!response.ok) {
      // サーバーからのエラーレスポンスを読み取り
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // JSON以外のエラーレスポンスの場合
        errorMessage = await response.text();
      }

      throw new Error(errorMessage);
    }

    // Content-Typeをチェックして適切にパース
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }

  } catch (error) {
    // ネットワークエラーやその他の例外
    if (error instanceof TypeError) {
      throw new Error('ネットワークエラー: サーバーに接続できません');
    }
    throw error;
  }
}
```

### 実用的な使用例

```javascript
// ユーザー情報を取得して画面に表示
async function displayUserInfo(userId) {
  try {
    const user = await apiRequest(`/api/users/${userId}`);

    // 画面更新
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;

  } catch (error) {
    // エラーメッセージを表示
    document.getElementById('errorMessage').textContent =
      `ユーザー情報の取得に失敗しました: ${error.message}`;
  }
}
```

## リクエストのキャンセル

長時間のリクエストをキャンセルできるようにしましょう：

```javascript
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  // AbortControllerでキャンセル可能にする
  const controller = new AbortController();

  // タイムアウト設定
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('リクエストがタイムアウトしました');
    }
    throw error;
  }
}

// 使用例
try {
  const response = await fetchWithTimeout('/api/slow-endpoint', {}, 3000);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error.message); // "リクエストがタイムアウトしました" など
}
```

## 実践的なAPI クライアントクラス

再利用しやすいAPIクライアントを作ってみましょう：

```javascript
class APIClient {
  constructor(baseURL, defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  }

  // 便利メソッド
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );

    return this.request(url.pathname + url.search);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// 使用例
const api = new APIClient('/api', {
  'Authorization': 'Bearer your-token-here'
});

// GET /api/users?page=1
const users = await api.get('/users', { page: 1 });

// POST /api/users
const newUser = await api.post('/users', {
  name: '佐藤花子',
  email: 'sato@example.com'
});
```

## まとめ

fetch APIを使うことで、JavaScriptからAPIリクエストを簡単に送れるようになりました：

### ポイント

- **fetch API**: JavaScriptでHTTPリクエストを送るモダンな方法
- **async/await**: Promise ベースで読みやすいコード
- **エラーハンドリング**: response.ok でステータスをチェック
- **JSON処理**: response.json() でデータを取得
- **柔軟性**: GET、POST、PUT、DELETE すべて対応
- **キャンセル**: AbortController でリクエスト中断可能

次の記事では、Reactのコンポーネント内でfetch APIを使う方法について学んでいきましょう。useEffectフックと組み合わせて、コンポーネントのライフサイクルに合わせたAPI呼び出しを実装します。
