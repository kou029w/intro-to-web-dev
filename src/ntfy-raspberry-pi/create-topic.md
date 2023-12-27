# トピックの作成

ntfy.shを利用するには、まずトピックを作成します。

トピックにアクセスし[購読]することで通知を受け取ることができるようになります。
このときのURLは忘れないようにメモしておきます。

新しいトピックを作成してみましょう:

<script>
  const topicId = crypto.randomUUID();
  const a = document.createElement("a");
  a.href = `https://ntfy.sh/${topicId}`;
  a.textContent = a.href;
  document.querySelector("main").append(a);
</script>
