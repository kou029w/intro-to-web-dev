# トピックの作成

ntfy.shを利用するには、まずトピックを作成します。

新しいトピックを作成してみましょう: <span class="ntfy-url"></span>

<script type="module">
  const topicId = crypto.randomUUID();
  const a = document.createElement("a");
  a.href = `https://ntfy.sh/${topicId}`;
  a.textContent = a.href;
  document.querySelector(".ntfy-url").append(a);
  document.querySelector(`input[name="endpoint"]`).value = a.href;
</script>

トピックにアクセスし[購読]することで通知を受け取ることができるようになります。
このときのURLは忘れないようにメモしておきます。

## 使用方法

メッセージの送信:

```js
// ここはntfy.shのURLに書き換えます
const endpoint = "https://ntfy.sh/mytopic";
const message = `<メッセージ本文>`;
const res = await fetch(endpoint, { method: "POST", body: message });
```

## 送信してみよう！

サンプルコード:

```js
const message = `現在の時刻は ${new Date().toTimeString()} です`;
await fetch(endpoint, { method: "POST", body: message });
```

`endpoint =`

<form onsubmit="(e) => e.preventDefault(),
  fetch(new FormData(this).get(`endpoint`), {
    method: `POST`,
    body: `現在の時刻は ${new Date().toTimeString()} です`,
  })
    .then((r) => (document.querySelector(`.result`).textContent = `HTTP/2 ${r.status}\n\n`,r))
    .then((r) => r.json())
    .then((j) => document.querySelector(`.result`).textContent += JSON.stringify(j, null, 2));
">
<input type="url" name="endpoint" required placeholder="https://ntfy.sh/mytopic … ntfy.shのURL" autocomplete="off" style="width: 80%; padding: 4px" />
<input type="submit" value="実行" />
</form>

レスポンス:

<pre><code class="result language-http">null</code></pre>
