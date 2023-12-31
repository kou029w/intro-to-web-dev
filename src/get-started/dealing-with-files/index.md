> ― この文書は © 2023 [MDN Web Docsプロジェクト協力者](https://developer.mozilla.org/ja/docs/MDN/Community/Roles_teams#%E5%8D%94%E5%8A%9B%E8%80%85) クリエイティブ・コモンズ [CC BY SA 2.5](https://github.com/mdn/translated-content/blob/main/LICENSE.md) ライセンスのもとに利用を許諾されています。
> 元の文書: <https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web/Dealing_with_files>

# ファイルの扱い

Webサイトは、テキストコンテンツ、コード、スタイルシート、メディアコンテンツなど、多くのファイルで構成されています。ここでは注意すべきいくつかの点を説明します。

## コンピューター上でWebサイトがあるべき場所

コンピューター上のWebサイトの開発作業している時もWebサイトのファイルとフォルダーの構造は実際のWebサイトと同じようにしましょう。

フォルダーは簡単に見つけることができる場所、たとえばデスクトップ上、ホームフォルダーの中、Cドライブのルートなどに置きましょう。

1. Webサイトプロジェクトを保存する場所を選択してください。ここでは `web-projects` （またはそのようなもの）という新しいフォルダーを作成します。これはWebサイトのプロジェクト全体を保存するところです。
2. フォルダーの中に、最初のWebサイトを格納する別のフォルダーを作成します。それを `test-site` と呼びましょう（もっとユニークなものでもOK）。

## ファイル名・フォルダー名には日本語・大文字・空白を使わない

この文書ではフォルダーやファイルに空白のない全て半角小文字の名前を付けるよう求めています。理由は次の通りです。

1. 多くのコンピューター、特にWebサーバーでは、大文字と小文字が区別されます。例えば、Webサイトの `test-site/MyImage.jpg` に画像を置いて、別のファイルから画像を `test-site/myimage.jpg` として呼び出そうとすると、動作しないかもしれません。
2. ブラウザー間、Webサーバー間、プログラミング言語間で、空白の扱いが一貫していません。例えば、ファイル名に空白を使用すると、システムによってはそのファイル名を 2 つのファイル名として扱うことがあります。サーバーによっては、ファイル名の空白を "%20" （URL の空白の文字コード）に置き換えるので、リンクが壊れてしまう結果になります。`my_file.html` のように単語をアンダースコアで区切るよりは、`my-file.html` のようにハイフンで区切った方がよいでしょう。

## Webサイトはどのような構成にするべきか

Webサイトプロジェクトで最も一般的なフォルダー構成は、(1) 目次の HTML ファイル、(2) 画像ファイル、(3) スタイルシート (見た目に関するコード)、(4) スクリプトファイル (JavaScriptのコード) を入れるフォルダーです。作成してみましょう。

1. **`index.html`**: このファイルには、一般的にあなたのホームページの内容、つまりあなたが最初にあなたのサイトに行ったときに見るテキストと画像が含まれています。テキストエディターを使用して、 `index.html` という名前の新しいファイルを作成し、 `test-site` フォルダー内に保存します。
2. **`images` フォルダー**: このフォルダーにはサイトで使用するすべての画像を入れます。`test-site` フォルダーの中に `images` という名前のフォルダーを作成します。
3. **`styles` フォルダー**: このフォルダーには、コンテンツのスタイルを設定するための CSS コード（例えばテキストと背景色の設定など）を入れます。 `styles` というフォルダーを `test-site` のフォルダーの中に作成します。
4. **`scripts` フォルダー**: このフォルダーには、サイトに対話機能を追加するために使用されるすべての JavaScript コード（クリックされたときにデータを読み込むボタンなど）が含まれます。 `scripts` というフォルダーを `test-site` のフォルダーの中に作成します。

> **Note** Windows では、既定で有効になっている**既知のファイルの種類の拡張子を表示しない**というオプションがあるため、ファイル名の表示に問題が発生することがあります。一般に、 Windows エクスプローラーで **\[フォルダーオプション...]** オプションを選択し、**\[登録されている拡張子は表示しない]** チェックボックスをオフにし、 **\[OK]** をクリックすることで、これをオフにすることができます。お使いの Windows のバージョンに関する詳細な情報については、Webで検索してください。

## ファイルパス

ファイルをお互いに呼び出すためには、ファイルパスを提供する必要があります。

画像ファイルは既存の画像を自由に選択して、以下の手順で使用することができます。

1. 以前に選択した画像を `images` フォルダーにコピーします。
2. `index.html` ファイルを開き、次のコードをファイルに挿入します。それが今のところ何を意味するのか気にしないでください。シリーズの後半で構造を詳しく見ていきます。

   ```html
   <!doctype html>
   <html lang="ja">
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width" />
       <title>テストページ</title>
     </head>
     <body>
       <img src="" alt="テスト画像" />
     </body>
   </html>
   ```

3. `<img src="" alt="テスト画像">` という行は、ページに画像を挿入する HTML コードです。画像がどこにあるのかを HTML に伝える必要があります。画像は _images_ ディレクトリー内にあり、`index.html` と同じディレクトリーにあります。ファイル構造の中で `index.html` からその画像に移動するのに必要なファイルパスは `images/your-image-filename` です。例えば、私たちの画像は `firefox-icon.png` と呼ばれており、ファイルパスは `images/firefox-icon.png` になります。
4. `src=""` コードの二重引用符の間の HTML コードにファイルパスを挿入してください。
5. `alt` 属性の内容を入れようとしている画像の説明に変更してください。今回は、 `alt="Firefoxのロゴ"` とします。
6. HTML ファイルを保存し、Webブラウザーに読み込みます（ファイルをダブルクリックします）。新しいWebページに画像が表示されます。

![](website-screenshot.png)

ファイルパスの一般的なルールは次の通りです。

- 呼び出し元の HTML ファイルと同じディレクトリーにある対象ファイルにリンクするには、ファイル名を使用します。例えば `my-image.jpg`。
- サブディレクトリー内のファイルを参照するには、パスの前にディレクトリー名とスラッシュを入力します。例えば `subdirectory/my-image.jpg`。
- 呼び出し元の HTML ファイルの**上階層**のディレクトリー内にある対象ファイルにリンクするには、2 つのドットを記述します。例えば、`index.html` が `test-site` のサブフォルダー内にあり、`my-image.jpg` が `test-site` 内にある場合、`../my-image.jpg` を使用して `index.html` から `my-image.jpg` を参照できます。
- 例えば `../subdirectory/another-subdirectory/my-image.jpg` など、好きなだけ組み合わせることができます。

> **Note** Windows のファイルシステムでは、スラッシュ (/) ではなくバックスラッシュまたは￥記号を使用します（例 : `C:\Windows`）。これは HTML では使用できません。Windows でWebサイトを開発している場合でも、コード内ではスラッシュを使用する必要があります。

## 他にするべきこと

今のところは以上です。フォルダー構造は次のようになります。

![macOS X の finder におけるファイル構造。images フォルダーに画像が入っており、scripts と styles フォルダーは空で、あと index.html がある](file-structure.png)
