# センサーと音声をPrompt APIでつなぐ

揺れをPrompt APIで判定してアームで警告し、音声で計測間隔を変更し、センサー状態への質問に答えるサンプルです。
判断と機器の応答を、JSONファイルまたはOPFSに保存します。

## 起動

```bash
npm install
npm start
```

表示されたlocalhostのURLをブラウザで開きます。
Chrome 148以降でPrompt APIの動作を確認し、M5Stack Core2に隣の`m5stack-serial-bridge`を書き込んでください。
操作手順は[教材](https://kou029w.github.io/intro-to-web-dev/web-ai/hardware/sensor-assistant.html)を参照してください。

## 確認

```bash
npm test
```

センサーの集計、コマンドの検証、モデルの出力から機器への送信、OPFSの保存処理を、ブラウザAPIを置き換えて確認します。
実機、音声認識、Prompt APIの推論は、このテストでは確認しません。
