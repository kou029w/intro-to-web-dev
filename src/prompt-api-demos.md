# Prompt APIサンプル集をブラウザで試す

[examples/](https://github.com/kou029w/intro-to-web-dev/tree/main/examples)配下にある9個のPrompt APIサンプルを、インストールなしでオンラインエディタ上で動かせます。
**StackBlitz**と**LiveCodes**は、どちらもGitHubリポジトリのディレクトリを直接読み込んで実行できるオンラインエディタです。
コードを直接書き換えて、その場で挙動を確認できます。

> **Note**\
> Prompt API（`LanguageModel`）をiframe内で動かすには、本来`<iframe allow="language-model">`のような明示的な許可が必要です。
> StackBlitzやLiveCodesの埋め込みプレビューがこの許可を伝えるとは限らないため、AIの応答部分が動かない場合は、埋め込み右上のリンクから新しいタブで開いて試してください。
> マイクを使うサンプル（音声関連）も同様に、新しいタブで開いたほうが権限を許可しやすくなります。

各サンプルの詳しい解説は [Prompt API入門](prompt-api.md) を参照してください。

## Prompt API プレイグラウンド

システムプロンプト・ユーザープロンプト・JSON Schemaを自由に入力して、応答をストリーミングで確認できる汎用プレイグラウンドです。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 類義語検索

n-shotプロンプティングと`clone()`によるセッション複製を確認できるサンプルです。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 気象データの説明（Open-Meteo）

APIキー不要のOpen-Meteoから、入力した地名（Tokyo / Osaka / Kyotoなど）の気象データを取得し、自然な日本語の説明と構造化出力（傘の要否判定）に変換します。
地名から緯度経度への変換にもAPIキー不要のジオコーディングAPIを使っています。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 気象データの説明（wttr.in）

wttr.inの`format=j1`から取得した英語の天気表現を、日本語に訳しながら説明させます。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 画像を説明してもらう

選択した画像ファイルをPrompt APIに渡し、内容を日本語で説明させます。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 音声を文字起こしする

マイクで5秒録音した音声を、Prompt APIにそのまま渡して文字起こしします。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" allow="microphone" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" allow="microphone" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## コンテキスト使用量の管理

`session.contextUsage`/`contextWindow`を監視し、モデル自身に会話を要約させて圧縮します。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## ツール呼び出し（天気ツール）

`tools`オプションで、モデルが必要に応じて`get_weather`関数を自分で呼び出す様子を確認できます。実験的な機能のため、Chromeのフラグ有効化が必要な場合があります。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

## 書き起こしのフィラー除去

録音した音声をストリーミングで文字起こしし、続けてフィラー（言い淀み）をストリーミングで除去する2段階パイプラインです。

[GitHubで見る](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup) ・
[新しいタブでStackBlitzを開く](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup?file=script.js&view=preview) ・
[新しいタブでLiveCodesを開く](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup)

<details>
<summary>▶ StackBlitzをこのページで開く</summary>
<iframe loading="lazy" allow="microphone" src="https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup?embed=1&file=script.js&view=preview&hideNavigation=1&hideDevTools=1" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>

<details>
<summary>▶ LiveCodesをこのページで開く</summary>
<iframe loading="lazy" allow="microphone" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup&console=open" style="width:100%; height:500px; border:0; border-radius:0.5rem;"></iframe>
</details>
