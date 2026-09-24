# 受講環境の事前確認

Prompt APIのハンズオンでは、ブラウザに組み込まれた言語モデル**Gemini Nano**を各自の端末で動かします。
モデルは初回利用時に数GBのダウンロードが必要で、端末の性能が足りないと利用できません。
当日にダウンロードやトラブル対応で時間を使わないよう、受講前に次のチェックリストと動作確認ページで準備を済ませてください。

## チェックリスト

### ブラウザ

- **Google Chrome 148以降**をインストールしている（`chrome://settings/help`でバージョンを確認）

教材はGoogle Chromeを前提にしています。
Edgeなど他のChromium系ブラウザでも、動作確認ページで利用可能と判定されれば動作します。
ただし、組み込まれている言語モデルが異なるため、応答の内容や品質は教材の例と異なります。
FirefoxやSafariはPrompt APIを搭載していないため、受講できません。

### OS

- 次のいずれかのプラットフォーム
  - Windows 10 / 11
  - macOS 13（Ventura）以降
  - Linux
  - ChromeOS（Chromebook Plus）

AndroidやiOSなどのスマートフォンやタブレットでは受講できません。

### ストレージ

- Chromeのプロファイルがあるドライブに、**22GB以上の空き容量**がある

モデル本体は数GBですが、空き容量が22GBを下回るとダウンロードが始まりません。
ダウンロード後に空き容量が10GBを下回ると、モデルは自動的に削除されます。

### GPUまたはCPUとメモリ

次のどちらかを満たしている必要があります。

- GPUのVRAMが**4GBを超える**
- GPUを使えない場合、**メモリ16GB以上かつCPU 4コア以上**

VRAMやメモリの容量は、次の方法で確認できます。

| OS      | 確認方法                                                               |
| ------- | ---------------------------------------------------------------------- |
| Windows | タスクマネージャー →「パフォーマンス」→「GPU」「メモリ」               |
| macOS   | Appleメニュー →「このMacについて」（AppleシリコンはGPUとメモリを共有） |
| Linux   | `nvidia-smi`、`free -h`、`nproc`など                                   |

### ネットワーク

- モデルのダウンロード（数GB）に、Wi-Fiや有線など**従量課金でない回線**を使える

テザリングなど従量課金の回線では、ダウンロードが始まらない場合があります。
会場の回線は大勢で共有するためダウンロードに時間がかかります。
次の動作確認ページで、受講前にダウンロードを済ませてください。

## 動作確認ページ

チェックリストを確認したら、次のページで実際に動作するかどうかを確かめます。
「ダウンロードして試す」ボタンを押し、応答の文章が表示されれば準備完了です。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check?file=script.js&view=preview)

<iframe loading="lazy" allow="language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

最小限の確認で済ませたい場合は、DevToolsのコンソールで次のコードを実行します。
`"available"`が返れば準備完了です。
それ以外の結果が返ったときは、次節「うまくいかないとき」の表で対処を確認します。

```js runnable
console.log(await LanguageModel.availability());
```

## うまくいかないとき

`LanguageModel.availability()`の結果ごとの対処は次のとおりです。

| 結果                   | 状態                   | 対処                                                         |
| ---------------------- | ---------------------- | ------------------------------------------------------------ |
| `"available"`          | 利用可能               | 対処は不要です                                               |
| `"downloadable"`       | モデルが未ダウンロード | 動作確認ページのボタンを押してダウンロードします             |
| `"downloading"`        | ダウンロード中         | 完了するまで待ちます                                         |
| `"unavailable"`        | 利用不可               | ストレージ、GPU、メモリの要件を満たしているか確認します      |
| `ReferenceError`が発生 | APIが存在しない        | ChromeのバージョンとブラウザがChromium系かどうかを確認します |

`chrome://on-device-internals`を開くと、モデルのダウンロード状況や端末の性能の判定結果を詳しく確認できます。
解決しない場合は、`chrome://on-device-internals`の表示内容とエラーメッセージを控えて講師に相談してください。

## 参考

- [Get started with built-in AI | Chrome for Developers](https://developer.chrome.com/docs/ai/get-started)
- [Prompt API入門](prompt-api.md)
