# プロキシ確認ガイド

社内ネットワークやセキュリティが厳しい環境では、プロキシ設定が必須になることがあります。まずは自分の環境で通信ができているか確認し、問題がある場合のみ設定を行えば大丈夫です。

このガイドでは、各種開発ツール (npm、Git、AWS CLI等) でプロキシ環境下での通信確認方法と設定方法を学んでいきましょう。

## HTTP通信の確認方法

### Webブラウザー

この文が見えていればOKです。

### NPM

Step1. Node.jsのインストール

- [Node.jsのインストール - Node.jsを使う](https://kou029w.github.io/nodejs-hands-on/installing-nodejs.html)

Step2. ターミナルでコマンドを実行

ターミナルで次のコマンドを実行して、レジストリとHTTP通信できることを確認します。

```
npm ping
```

数秒以内に “npm notice PONG” というメッセージが表示されていればOKです。

![](https://hackmd.io/_uploads/r115WpBpn.png)

“ERROR: connect ECONNREFUSED” など “ERROR” から始まるメッセージが表示される場合はNGです❌

### Git

Step1. Gitのインストール

- [Git for Windows](https://gitforwindows.org/)
  - [インストール方法](https://hackmd.io/nVSphlXbRpe9IW7uz_18Lg)
- (Macは最初からインストールされているため不要)

Step2. ターミナルでコマンドを実行

GitがHTTP通信できることを確認します。

GitHubのリポジトリのクローンを行うコマンド:

```
$ git clone <https://github.com/octo-org/octo-template.git>
Cloning into 'octo-template'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.
```

- [リポジトリをクローンする - GitHub Docs](https://docs.github.com/ja/repositories/creating-and-managing-repositories/cloning-a-repository)

期待通りリポジトリがクローンされていればOKです。

“fatal: unable to access” や “Failed to connect to …” というメッセージが表示される場合はNGです❌

リモートリポジトリの一覧を確認するコマンド: `git ls-remote`

```
$ cd octo-template
$ git ls-remote
From <https://github.com/octo-org/octo-template.git>
c85af0e5e5798047462143a13c1b455ee1275a64        HEAD
c85af0e5e5798047462143a13c1b455ee1275a64        refs/heads/main
b9b26d9eaaea5750bf9a937a6683294a3786b449        refs/pull/3/head
8e3150bce9b6af556e6ebd7307db3bfd0d7852db        refs/pull/3/merge
```

期待通りリモートリポジトリが表示されていればOKです。

“fatal: unable to access” や “Failed to connect to …” というメッセージが表示される場合はNGです❌

### AWS CLI

Step1. AWS CLIのインストール

- [AWS CLI の最新バージョンを使用してインストールまたは更新を行う - AWS Command Line Interface](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html)

Step2. 初期設定

- [AWS CLI を設定する - AWS Command Line Interface](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-configure.html)
- [認証とアクセス認証情報 - AWS Command Line Interface](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-authentication.html)

Step3. ターミナルでコマンドを実行

AWS CLIがHTTP通信できることを確認します。

例えば: S3バケットの一覧を確認するコマンド

```
aws s3 ls
```

S3バケットの一覧が期待通り表示されていればOKです。

![](https://hackmd.io/_uploads/SJp3O6rTh.png)

“Failed to connect to proxy URL:” や “Unable to …” から始まるメッセージが表示される場合はNGです❌

### AWS SDK

確認するコマンドはありません。 [AWS SDKのプロキシの設定](about:blank#AWS-SDK%E3%81%AE%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%AE%E8%A8%AD%E5%AE%9A)後、変更したコードが期待通り動作すればOKです。

### VSCode (Visual Studio Code)

確認するコマンドはありません。 拡張機能のインストールなど期待通り動作すればOKです。

## Webブラウザーのプロキシの設定

- Chrome/Edge/Safari: システムのネットワーク設定から行います。それぞれのOSの設定を確認してください。
  - Windows 11: [Windows でプロキシ サーバーを使用する - Microsoft サポート](https://support.microsoft.com/ja-jp/windows/windows-%E3%81%A7%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B-03096c53-0554-4ffe-b6ab-8b1deee8dae1) ［スタート］ ボタンを選択し、[設定] > [ネットワークとインターネット] > [プロキシ] >［手動プロキシセットアップ］ で、［プロキシ サーバーを使用］ の横にある ［セットアップ］ を選択 > ［プロキシ サーバーの編集］ ダイアログ ボックス > ［プロキシ サーバーを使用］有効化・［プロキシ IP アドレス］ および ［ポート］ ボックスに、プロキシ サーバー名または IP アドレスとポートをそれぞれのボックスに入力・［ローカル (イントラネット) アドレスにプロキシ サーバーを使用しない] チェック ボックスをオン > [保存] を選択
  - Mac: [Macでプロキシサーバ設定を入力する - Apple サポート (日本)](https://support.apple.com/ja-jp/guide/mac-help/mchlp25912/mac)
- Firefox: [https://support.mozilla.org/ja/kb/connection-settings-firefox](https://support.mozilla.org/ja/kb/connection-settings-firefox)

## NPMのプロキシの設定

環境変数 `HTTP_PROXY` と `HTTPS_PROXY` に適切なプロキシのURLを設定します。

下記ではプロキシのURLの例として `http://user:pass@proxy.example.com:8080` を示しています。実際の自分の環境に合わせたURLに変更して実行してください。

### Windows - PowerShellの場合

```powershell
$env:HTTP_PROXY="<http://user:pass@proxy.example.com:8080>"$env:HTTPS_PROXY="<http://user:pass@proxy.example.com:8080>"
```

### Windows - コマンドプロンプトの場合

```
set HTTP_PROXY=http://user:pass@proxy.example.com:8080
set HTTPS_PROXY=http://user:pass@proxy.example.com:8080
```

### 上記以外 - BashやZshなどの場合

```bash
export HTTP_PROXY=http://user:pass@proxy.example.com:8080
export HTTPS_PROXY=http://user:pass@proxy.example.com:8080
```

設定を行ったら、通常通り `npm` コマンドを実行して、エラーが出ないことを[確認](about:blank#HTTP%E9%80%9A%E4%BF%A1%E3%81%AE%E7%A2%BA%E8%AA%8D%E6%96%B9%E6%B3%95)してみましょう。

## Gitのプロキシの設定

[NPMのプロキシの設定](about:blank#NPM%E3%81%AE%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%AE%E8%A8%AD%E5%AE%9A)と同様に、環境変数 `HTTP_PROXY` と `HTTPS_PROXY` を設定します。

## AWS CLIのプロキシの設定

[NPMのプロキシの設定](about:blank#NPM%E3%81%AE%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%AE%E8%A8%AD%E5%AE%9A)と同様に、環境変数 `HTTP_PROXY` と `HTTPS_PROXY` を設定します。

- [https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-proxy.html](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-proxy.html)

## AWS SDKのプロキシの設定

Step1. [NPMのプロキシの設定](about:blank#NPM%E3%81%AE%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%AE%E8%A8%AD%E5%AE%9A)と同様に、環境変数 `HTTP_PROXY` と `HTTPS_PROXY` を設定します。

Step2. `@smithy/node-http-handler` と `proxy-agent` をインストールします。

```bash
npm i @smithy/node-http-handler proxy-agent
```

[https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/node-configuring-proxies.html](https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/node-configuring-proxies.html)

Step3. ProxyAgentを使います。

例:

```jsx
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { ProxyAgent } from "proxy-agent";
const agent = new ProxyAgent();
const s3Client = new S3Client({
  requestHandler: new NodeHttpHandler({
    httpAgent: agent,
    httpsAgent: agent,
  }),
});
export default s3Client;
```

## VSCodeのプロキシの設定

プロキシ環境下で使用する場合、拡張機能のインストールに失敗することがあります。 そういったケースでは、設定 > Http: Proxy (`http.proxy`) にプロキシのURLを指定すると機能します。
