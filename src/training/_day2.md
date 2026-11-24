---
marp: true
theme: training
lang: ja
size: 16:9
paginate: true
transition: fade 0.3s
title: Day 2 声とセンサーでアームを動かす
---

<!-- _class: cover seq -->
<!-- _paginate: false -->
<!-- _backgroundImage: url('assets/avatar-wave.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

![WebDINO Japan](assets/webdino-logo-horizontal.svg)

## Day 2

# 声とセンサーで<br>アームを動かす

M5Stack Core2 をブラウザーにつなぐ

> 2026年12月2日　10:00〜17:00

---

<!-- _class: cols timetable -->

# 今日の時間割

### **午前**

| 時刻 | 内容 |
| --- | --- |
| 10:00 | Day 1 の振り返り、機材の配布 |
| 10:15 | Core2 の配線と動作確認 |
| 10:45 | Web Serial API の基礎 |
| 11:25 | センサー値をモニターする |
| 12:05 | 昼休み |

### **午後**

| 時刻 | 内容 |
| --- | --- |
| 13:05 | センサー値を Prompt API で解説させる |
| 13:35 | サーボの可動範囲を記録する |
| 14:05 | Speech Recognition API の基礎 |
| 14:35 | 声でアームを動かす |
| 15:10 | センサーと音声をつなぐ |
| 16:05 | グループワーク |
| 16:45 | 振り返りと質疑（17:00 終了） |

> 休憩は 11:15、14:25、15:55 に10分ずつ

---

<!-- _class: cols -->
<!-- _backgroundImage: url('assets/avatar-laptop.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

# 機材と組分け

### **1人1台**

- M5Stack Core2 for AWS
- USB-C ケーブル（データ通信対応）
- 温湿度センサー ENV Ⅲ

### **2人で1台**

- サーボ2つのアーム
- ブレッドボード（配線済み）
- サーボ用の5V電源

センサーの演習は各自の Core2 で、サーボの演習からはアームをつないだ Core2 を2人で交代で操作する

---

<!-- _class: part -->

PART 1

# Core2 をつなぐ

## 配線とブリッジ

---

<!-- _class: wiring -->

# 配線を確かめる

| つなぐもの | Core2 の側 |
| --- | --- |
| チャンネル0（旋回）の信号線 | Port B（黒）、G26 |
| チャンネル1（グリッパー）の信号線 | Port C（青）、G14 |
| サーボの GND | Core2 の GND と共通 |
| サーボの電源（赤） | Core2 ではなく、別の5V電源へ |
| ENV Ⅲ | Port A（赤） |

信号線は 330Ω の抵抗を挟んで GPIO へ。配線を誤ったときに流れる電流を抑える

> Port B と Port C は、底面ユニットの側面にある

---

<!-- _class: seq -->

# 電源を入れる前の3点

* **変換ケーブルの赤い線**を切断し、絶縁してあるか
  サーボにつなぐと、Core2 が再起動することがある
* **電解コンデンサー**の足の長いほう（＋）が5V か
  逆につなぐと、発熱して破裂することがある
* **サーボの電源**は別の5Vで、GND だけ共通か
  PWM 信号の電圧は GND を基準に読み取られる

---

<!-- _class: split -->

# `ping` で応答を確かめる

```json
{
  "board": "core2",
  "servo": true,
  "channels": 2,
  "imu": true,
  "env": true,
  "type": "ok",
  "command": "ping"
}
```

モニターのサンプルの「コマンドを送る」欄から `ping` を送る

**`"channels": 2`**
2つの関節を動かせる

**`"board": "unknown"`**
ブリッジの `BOARD` を指定して書き込み直す

**`"env": false`**
ENV Ⅲ が Port A に挿してあるか

---

<!-- _class: proto -->

# ブリッジとの取り決め

コマンドは1行のテキスト、応答は1行の JSON

| コマンド | 動作 |
| --- | --- |
| `ping` | 生存確認。機種、チャンネル数、センサーの有無 |
| `servo 0 90 1 45` | チャンネルごとの角度（0〜180度） |
| `release` | 信号を止めて脱力させる |
| `sensor on` / `off` | センサー値の送信を開始、停止 |
| `sensor 500` | 送信間隔をミリ秒で指定（既定は100） |

```json
{"type": "error", "command": "servo", "message": "angle out of range: 200"}
```

> コマンドは人が手で打って確かめられるようにテキスト、応答は `JSON.parse()` だけで読めるように JSON

---

<!-- _class: part -->

PART 2

# センサー値を読む

## モニターと Prompt API

---

<!-- _class: cols -->
<!-- _backgroundImage: url('assets/avatar-point-left.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

# 静止時と揺れたときの値

### **机に置いたまま**

- 1本だけ約1G（向きで約−1G）
- 残り2本は 0G 付近
- 重力の分を測っている

### **傾ける、揺らす**

- 約1G がほかの軸にも分かれる
- 揺らすと線が細かく上下する

`sensor 500` でグラフの伸びが遅くなる

---

<!-- _class: aggregate -->

# 何を集計してから渡すか

直近30件（100ミリ秒ごと、約3秒）から計算し、ラベルを付ける

| 項目 | 計算 | ラベル |
| --- | --- | --- |
| 傾き | 加速度の平均と画面の法線のなす角 | ほぼ水平、裏返し など |
| 揺れ | 加速度の大きさの標準偏差 | 静止、小さな揺れ、大きな揺れ |
| 回転 | 角速度の大きさの最大値 | 数値のみ |
| 落下 | 大きさが 0.3G を下回った瞬間 | あり、なし |

揺れの境目（0.02G と 0.1G）は目安。モニターで見た静止時と揺れの値で決め直す

> Core2 のボタン A でも判断が始まる。モデルの準備は、初回だけ画面のボタンから

---

<!-- _class: part -->
<!-- _backgroundImage: url('assets/avatar-think.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

PART 3

# アームを動かす

## サーボと音声

---

<!-- _class: punch -->

# サーボの可動範囲を記録する

1. サーボの電源を入れてから接続する。両方の関節が90度に動く
1. スライダーを少しずつ動かし、止まる角度を探す
1. 値を大きくしたときの向きも記録する（例：左を向く、閉じる）
1. 記録したら「脱力させる」を押す

声の演習では、記録した範囲の外へはコードが動かさない

「ジー」と鳴ったら、そこから5〜10度戻した値を記録する

---

<!-- _class: speech -->

# 声を認識する場所

| 設定 | 認識する場所 | 必要なもの |
| --- | --- | --- |
| 既定 | Google のサーバー | ネットワーク接続 |
| `processLocally: true` | PC 内 | 日本語の言語パック |

```js
await SpeechRecognition.available(
  { langs: ["ja-JP"], processLocally: true });
// "available" なら PC 内で認識できる
```

マイクが使えないときは、同じ指示を文字で入力する

> 言語パックは、基礎のサンプルで「端末内で処理する」を選ぶと取得できる。声でアームを動かすサンプルは、取得済みのときだけ PC 内で認識する

---

<!-- _class: hint -->

# `hint` と例を、自分のアームに合わせる

```js
const JOINTS = [
  { name: "base", channel: 0, label: "旋回", min: 0, max: 180, home: 90,
    hint: "値を大きくすると左、小さくすると右を向く。90度が正面" },
  // grip も記録した値で書き換える
];
```

* `min`／`max`：記録した可動範囲
* `hint`：値を大きくしたときの動きを、モデルが読む文で書く
* 向きが逆なら、例の `add` の符号をすべて逆にし、`base=120` を `60` に

> Core2 につなぐ前に、文字の入力でモデルの出力を確かめる

---

<!-- _class: part -->
<!-- _backgroundImage: url('assets/avatar-point-left.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

PART 4

# センサーと音声をつなぐ

## 連携例とグループワーク

---

# 連携例を起動する

```bash
cd examples/sensor-assistant
npm install
npm start
```

* 「モデルを準備」を押してから「Core2 に接続」
* 動かすのはチャンネル0（旋回）だけ
* 「戻す角度」と「警告の角度」を、記録した可動範囲に合わせる

> ファイルの選択と機器への接続があるので、`http://localhost` のページで試す

---

<!-- _class: flow alarm -->

# 揺れへの警告

1. Core2
   - 100ミリ秒ごとの値
1. コードで集計
   - 2秒以上の集計で<br>揺れ 0.1G 以上
1. Prompt API
   - `level`: alert
1. **コードが送る**
   - `servo 0 120`

* 角度はモデルに作らせない。設定した角度をコードが検証して送る
* 推論中は次の判断を始めない。間隔は5秒以上、警告は解除まで1回
* アームの台座は固定して試す

> ここでの「異常」は演習で決めた条件とモデルの判定。故障の診断ではない

---

<!-- _class: interval punch -->

# 計測間隔を声で変える

| 段階 | 中身 |
| --- | --- |
| 指示 | 「計測間隔を500ミリ秒にして」 |
| モデルの出力 | `"kind": "set_interval", "intervalMs": 500` |
| コードの検証 | 100〜1000ミリ秒の整数か → `sensor 500` |
| Core2 の応答 | `"command": "sensor", "interval": 500` |

`intervalMs` が500、3秒分が約6件なら完了。「10ミリ秒」は拒否される

モデルの値ではなく、Core2 の応答で確かめる

---

<!-- _class: cols qa -->

# 状態への質問と記録の保存

### **状態への質問**

- 「今、揺れていますか」と送る
- `kind` は `query`。機器へは送らない
- 「温度は何度ですか」：集計にない温度を補っていないか

### **記録の保存**

- 判断、指示、送ったコマンド、Core2 の応答を JSON ファイルへ
- OPFS に保存し、再読み込みして表示
- `sent` は送った記録。動きは目で見る

モデルの返事、コードが送ったコマンド、Core2 の応答を照合して終える

---

<!-- _class: cols -->
<!-- _backgroundImage: url('assets/avatar-idea.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 60px bottom 36px -->
<!-- _backgroundRepeat: no-repeat -->

# グループワーク

### **課題の例**

- つかんで運ぶ
- 緊急停止（すぐ `release`）
- 返事を読み上げる
- `warning` でも小さく警告

### **小さく作って動かして確かめる**

- 1つの動作が動いてから次を足す
- 例を1つ足したら、出力を確かめる
- 動いた状態に戻せるようにする

組で1つ選び、サンプルを改造する

---

<!-- _class: trouble -->

# 困ったときは

| 症状 | 確かめること |
| --- | --- |
| 選択画面に Core2 が出ない | ドライバー、抜き差しで消えるポート |
| 「接続できませんでした」 | UIFlow2 や別のタブがポートを開いたまま |
| サーボが動かない | 5V電源、GND の共通、`ping` の `"channels": 2` |
| 動いた瞬間に Core2 が再起動 | サーボの電源を Core2 から取っていないか |

> ほかの症状：kou029w.github.io/intro-to-web-dev/troubleshooting.html

---

<!-- _class: cover end seq -->
<!-- _paginate: false -->
<!-- _backgroundImage: url('assets/avatar-wave.jxl') -->
<!-- _backgroundSize: 180px -->
<!-- _backgroundPosition: right 60px bottom 30px -->
<!-- _backgroundRepeat: no-repeat -->

![WebDINO Japan](assets/webdino-logo-stacked.svg)

モデルの出力が正しいかを見極める基準は、

# 現場で値を見てきた人が持っている

> 教材：kou029w.github.io/intro-to-web-dev
