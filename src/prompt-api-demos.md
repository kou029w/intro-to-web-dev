# Prompt APIサンプル集をブラウザで試す

[Prompt APIサンプル](https://github.com/kou029w/intro-to-web-dev/tree/main/examples)を、インストールなしでオンラインエディター上で動かせます。
[LiveCodes](https://livecodes.io/) と [StackBlitz](https://stackblitz.com/) は、どちらもGitHubリポジトリのディレクトリを直接読み込んで実行できるオンラインエディターです。
コードを直接書き換えて、その場で挙動を確認できます。

各サンプルの詳しい解説は [Prompt API入門](prompt-api.md) を参照してください。

## Prompt API プレイグラウンド

システムプロンプト・ユーザープロンプト・JSON Schemaを自由に入力して、応答をストリーミングで確認できる汎用プレイグラウンドです。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 類義語検索

n-shotプロンプティングと`clone()`によるセッション複製を確認できるサンプルです。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 気象データの説明（Open-Meteo）

APIキー不要のOpen-Meteoから、入力した地名（Tokyo / Osaka / Kyotoなど）の気象データを取得し、自然な日本語の説明と構造化出力（傘の要否判定）に変換します。
地名から緯度経度への変換にもAPIキー不要のジオコーディングAPIを使っています。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-open-meteo" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 気象データの説明（wttr.in）

wttr.inの`format=j1`から取得した英語の天気表現を、日本語に訳しながら説明させます。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-weather-wttr" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 画像を説明してもらう

選択した画像ファイルをPrompt APIに渡し、内容を日本語で説明させます。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 音声を文字起こしする

マイクで5秒録音した音声を、Prompt APIにそのまま渡して文字起こしします。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio?file=script.js&view=preview)

<iframe loading="lazy" allow="microphone; language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## コンテキスト使用量の管理

`session.contextUsage`/`contextWindow`を監視し、モデル自身に会話を要約させて圧縮します。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

<!--
## ツール呼び出し（天気ツール）

`tools`オプションで、モデルが必要に応じて`get_weather`関数を自分で呼び出す様子を確認できます。実験的な機能のため、Chromeのフラグ有効化が必要な場合があります。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>
-->

## 書き起こしのフィラー除去

録音した音声をストリーミングで文字起こしし、続けてフィラー（言い淀み）をストリーミングで除去する2段階パイプラインです。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup?file=script.js&view=preview)

<iframe loading="lazy" allow="microphone; language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-filler-cleanup" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>
