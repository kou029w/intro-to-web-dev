# 気象データの説明（Open-Meteo）

APIキー不要の[Open-Meteo](https://open-meteo.com/)から、入力した地名の現在の気象データを取得し、Prompt API（`LanguageModel`）で自然な日本語の説明に変換するサンプルです。
[chrome.devのWeather Demo](https://chrome.dev/web-ai-demos/)はOpenWeatherMap（要APIキー）を使っていますが、このサンプルはAPIキーなしで動かせるOpen-Meteoに置き換えています。

地名から緯度経度への変換には、こちらもAPIキー不要の[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding)を使っています。
「Tokyo」「Osaka」「Kyoto」のようなローマ字表記で検索すると、「東京都」「大阪市」「京都市」のような日本語の地名で結果を受け取れます（漢字やかなでの直接検索は未対応です）。

次の3点を確認できます。

- 2つのAPI（ジオコーディング→気象予報）を組み合わせる方法
- 構造化されたJSONデータを、そのままではなく前処理してからモデルに渡す設計
- `responseConstraint`にJSON Schemaを渡し、「傘が必要かどうか」を構造化データとして受け取る方法

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
