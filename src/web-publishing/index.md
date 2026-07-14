# Webサイトを公開する

作成したWebサイトを無料で公開する方法を紹介します。

## GitHubを使う

GitHub <https://github.com> を使うことでより本格的にWebサイトを公開できます (このガイドもそうです)。

GitHubを使うにはアカウントの作成が必要です。まずGitHubの無料アカウントを作成しましょう。

Webページを公開する流れ:

1. [GitHubでのアカウントの作成](https://docs.github.com/ja/get-started/quickstart/creating-an-account-on-github)
2. [GitHub Pagesサイトの作成](https://docs.github.com/ja/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Cloudflare Dropを使う

Cloudflareが提供する [Cloudflare Drop](https://www.cloudflare.com/drop/) を使うと、アカウントを作らなくても静的なファイル(HTML、CSS、JavaScript、画像、フォントなど)が入ったフォルダやZIPファイルをアップロードするだけですぐにWebサイトを公開できます。

Webページを公開する流れ:

1. <https://www.cloudflare.com/drop/> にアクセスする
2. 公開したい静的アセット(静的HTML、CSS、JavaScript、画像、フォント)を含むフォルダまたはZIPファイルを、ページ上にドラッグ&ドロップする
3. アップロードが完了すると、1時間有効な一時的なライブプレビューが表示される

公式ドキュメント: [Cloudflare drag-and-drop (Changelog)](https://developers.cloudflare.com/changelog/post/2026-07-08-cloudflare-drag-and-drop/)

表示されるプレビューは1時間だけ有効です。この間にサイトのテスト、プレビューURLの共有、またはデプロイの取得を行うことができます。1時間を過ぎるとプレビューは失われるため、サイトを継続して公開したい場合はこの期間内にデプロイを取得(保存)しましょう。

## Netlify Dropを使う

Netlifyが提供する [Netlify Drop](https://app.netlify.com/drop) も、Cloudflare Dropと同様にフォルダをドラッグ&ドロップするだけでWebサイトを公開できるサービスです。

Webページを公開する流れ:

1. <https://app.netlify.com/drop> にアクセスする
2. 公開したいHTMLファイルなどが入ったフォルダを、ページ上にドラッグ&ドロップする
3. アップロードが完了すると公開用のURLが発行される

公式ドキュメント: [Netlify Drop quickstart (Netlify Docs)](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/)

サイトを継続して管理・更新したい場合は無料のNetlifyアカウント作成が必要です。

自分に合った方法でWebサイトを公開してみましょう!
