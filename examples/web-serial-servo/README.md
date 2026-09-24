# サーボモーターを動かす

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/web-serial-servo?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-servo)

スライダーで、PCA9685に接続したサーボモーターの角度を指定するサンプルです。
関節ごとの可動範囲を確かめるために使います。

## 動かし方

Chrome 89以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [サーボモーターを動かす](../../src/web-serial/servo.md) で解説しています。
