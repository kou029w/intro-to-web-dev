# 気象データの説明（wttr.in）

[wttr.in](https://wttr.in/)の`format=j1`から東京の現在の気象データを取得し、Prompt API（`LanguageModel`）で自然な日本語の説明に変換するサンプルです。

[気象データの説明（Open-Meteo）](../prompt-api-weather-open-meteo/)がコード側で天気コードを日本語ラベルに変換してから渡すのに対して、このサンプルは`weatherDesc`に含まれる英語の天気表現（例: `"Patchy rain nearby"`）をそのままモデルに渡し、日本語への翻訳も含めて説明させる構成です。

> **Note**\
> wttr.inは`format=3`のような1行のテキスト形式も提供していますが、ブラウザからの`fetch()`ではUser-Agentの違いにより整形済みのHTMLページが返ってきてしまい、しかもPrompt APIの入力上限を超えるほど長くなります。
> `format=j1`（JSON形式）はUser-Agentに関わらず生のJSONが返るため、こちらを使っています。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npx serve .
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
