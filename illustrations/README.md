# 挿絵の生成プロンプト集

研修「動かして学ぶ Prompt API・Web Serial API」（2026年12月）の教材に入れる挿絵を、外部の画像生成AI（ChatGPTなど）で作るためのプロンプト集です。
このファイルは作業用で、本（`src/`）には含めません。
挿絵はそのままスライドにも使うため、すべて16:9で作ります。

## 運用の方針

- 毎回、講師の分身キャラクターの参考画像を添付し、「このキャラクターを使う」と伝えます。
  文章の指定だけでは、髪型やメガネの形が挿絵ごとに変わりやすいためです。
- 文字は画像生成AIに描かせません。
  日本語の文字は崩れやすいので、ラベルは生成後にスライドツールや画像編集ツールで重ねます。
  プロンプトには「no text, no letters」を必ず入れます。
- 図やテキストを重ねられるよう、画面の片側（約40%）を無地の背景のまま空けます。
  分身をどちら側に置くかは、各挿絵のプロンプトで指定します。
- 実在する製品のロゴ、ブランド名、ブラウザのアイコンは描かせません。
  M5Stack Core2は「画面付きの手のひら大の四角い機器」、ブラウザは「アドレスバーのある汎用の窓」として描かせます。
- 生成した画像は`src/assets/illustrations/`に、各挿絵で指定したファイル名のPNGで保存します。
  文字を重ねた版をスライド用に別に作る場合は、`-slide`を付けた名前（例：`prompt-api-offline-slide.png`）にします。

## 共通の指定

各挿絵のプロンプトの前に、次の指定をそのまま付けます。
英語版を使い、日本語版は内容の確認用です。

### キャラクター指定

```text
Use the attached reference image as the main character. Keep the same face, hairstyle, glasses, and clothing in every image.
Character: a friendly young man drawn in a chibi style with a large head and a small body (about 3 heads tall).
Short black hair with a few strands sticking out, black square-framed glasses, a calm gentle smile.
He wears a black hoodie with white drawstrings.
```

```text
添付した参考画像のキャラクターを主人公にしてください。顔、髪型、メガネ、服装はどの画像でも同じにします。
キャラクター：デフォルメされた頭身（約3頭身）の穏やかな青年。
黒髪で少しはねた短髪、黒縁の四角いメガネ、穏やかな笑顔。
白いひもの付いた黒いパーカーを着ている。
```

### 画風指定

```text
Style: soft hand-drawn flat illustration, thick black outlines, simple shapes, limited muted colors, no gradients, no realistic shading.
Background: plain solid beige (pale peach) background with no pattern.
Aspect ratio 16:9. Leave a wide empty area of plain background for adding diagrams and text later.
No text, no letters, no numbers, no logos, no brand names anywhere in the image.
```

```text
画風：やわらかい手描き風のフラットなイラスト、太めの黒い輪郭線、単純な形、くすんだ少数の色、グラデーションや写実的な陰影はなし。
背景：模様のないベージュ（淡いピーチ）の無地。
縦横比16:9。図やテキストを後から重ねるため、無地の背景を広く空ける。
画像の中に文字、数字、ロゴ、ブランド名を描かない。
```

## Day1の挿絵

### 1. ブラウザ＝統合ランタイム

- 配置先：`src/web-platform.md`の冒頭（執筆中のため、見出しは確定後に合わせます）
- ファイル名：`src/assets/illustrations/web-platform-runtime.png`
- 場面：分身がブラウザの窓を指さし、窓から言語モデル、USB機器、ファイル、マイクへ線が伸びています。
  2日間で使うAPIが、すべてブラウザから呼び出せることを示します。
- 重ねる文字：「ブラウザ」「Prompt API」「Web Serial API」「File System Access API」「Speech Recognition API」
- 代替テキスト：ブラウザの窓から言語モデル、USB機器、ファイル、マイクへ線が伸び、講師がその窓を指さしている

```text
The character stands on the left side, pointing to the right at a large generic web browser window (a rounded rectangle with an empty address bar and three dots, no icons).
From the browser window, four simple lines branch out to four small icons arranged around it: a friendly glowing chat bubble with a small sparkle (an AI model), a small square palm-sized device with a screen connected by a USB cable, a paper document with a folded corner, and a microphone.
Keep the right third of the image as empty plain background around the icons so labels can be added.
```

### 2. 機内モードでも動くPrompt API

- 配置先：`src/prompt-api.md`の「# Prompt API入門」の直後
- ファイル名：`src/assets/illustrations/prompt-api-offline.png`
- 場面：機内モードのノートPCの横で、分身が画面の中のAIと会話しています。
  モデルが端末内で動き、通信が発生しないことを示します。
- 重ねる文字：「機内モード」「端末の中で動く」
- 代替テキスト：機内モードのノートPCの中のAIと、講師が吹き出しで会話している

```text
The character sits at a desk on the left side, chatting happily with a laptop.
On the laptop screen there is a small friendly chat bubble character (an AI) answering with a speech bubble that contains only simple wavy lines, not letters.
A small airplane symbol floats above the laptop, and a Wi-Fi symbol with a slash through it is next to it, showing the laptop is offline.
Leave the right 40% of the image as empty plain background.
```

### 3. 構造化出力で判断結果を受け取る

- 配置先：`src/prompt-api.md`の「## 構造化出力で判断結果を得る」
- ファイル名：`src/assets/illustrations/prompt-api-structured-output.png`
- 場面：AIから出てくる長い文章の紙を、分身が形の決まった枠に入れて、決まった欄だけのカードに整えています。
  自然文ではなく、スキーマに従ったJSONを受け取ることを示します。
- 重ねる文字：「自然文」「JSON Schema」「判断結果」
- 代替テキスト：AIが出した長い文章を、講師が型枠に通して欄の決まったカードに整えている

```text
On the left, a friendly AI chat bubble character pushes out a long, messy, curling paper scroll covered with wavy lines.
In the center, the character holds a simple rectangular frame (like a stencil or mold) and passes the scroll through it.
On the right side of the frame, a neat card comes out with three tidy rows of boxes and a check mark, no letters.
Keep the upper area of the image as empty plain background.
```

### 4. サンプル集を試す

- 配置先：`src/prompt-api-demos.md`の「# Prompt APIサンプル集をブラウザで試す」の直後
- ファイル名：`src/assets/illustrations/prompt-api-demos.png`
- 場面：分身が、カードのように並んだ小さなブラウザの窓を順に指さしています。
  窓にはそれぞれ天気、画像、音声、ツールの絵があり、サンプルを選んで試せることを示します。
- 重ねる文字：「プレイグラウンド」「天気」「画像の説明」「文字起こし」「ツール呼び出し」
- 代替テキスト：天気、画像、音声、工具の絵が入った小さなブラウザの窓が並び、講師が指さしている

```text
The character stands on the left side, pointing to the right at a neat grid of six small generic browser windows arranged like cards.
Each window shows one simple picture: a sun and cloud, a framed photo of a mountain, a sound wave, a wrench, a speech bubble, and a magnifying glass.
Leave space under each window for a short label, and keep the windows simple with no icons other than these pictures.
```

### 5. モデルを用意してもらうか、持ち込むか

- 配置先：`src/webassembly.md`の「## Prompt APIとの比較」
- ファイル名：`src/assets/illustrations/webassembly-bring-model.png`
- 場面：左では、ブラウザがモデルを手渡しています。
  右では、分身がモデルの入った箱を自分でブラウザに運び込み、箱の中で歯車（Wasm）とGPUのチップが働いています。
- 重ねる文字：「Prompt API：ブラウザが用意する」「WebLLM：アプリが持ち込む」「Wasm」「WebGPU」
- 代替テキスト：左はブラウザがAIを手渡す場面、右は講師がAIの入った箱をブラウザに運び込む場面

```text
A split composition divided into left and right halves by empty space.
Left half: a large generic browser window with small arms gently hands a friendly AI chat bubble character to a small user figure.
Right half: the character carries a cardboard box into another browser window; inside the open box are a friendly AI chat bubble character, a gear, and a computer chip with a small lightning symbol.
Leave empty plain background above each half for headings.
```

### 6. 保存先を選ぶか、アプリ内に保存するか

- 配置先：`src/file-system.md`の「## 保存先を選ぶ方法とアプリ内に保存する方法」
- ファイル名：`src/assets/illustrations/file-system-two-storages.png`
- 場面：分身がブラウザの窓の中から書類を持ち出し、PCのフォルダーにしまっています。
  隣では、ブラウザの窓の中にある鍵付きの引き出しに、別の書類がしまわれています。
- 重ねる文字：「File System Access API：PCのファイル」「OPFS：オリジンごとの領域」
- 代替テキスト：講師が書類をPCのフォルダーにしまい、隣ではブラウザ内の鍵付きの引き出しに書類が入っている

```text
In the center there is a large generic browser window.
On the left, the character reaches out of the browser window and places a paper document into a yellow folder on a desk outside the window.
On the right, inside the browser window, there is a small drawer with a lock, holding another paper document.
Keep empty plain background above the folder and above the drawer for labels.
```

## Day2の挿絵

### 7. ブラウザから機器を動かす全体像

- 配置先：`src/web-serial/index.md`の「## 全体像」
- ファイル名：`src/assets/illustrations/web-serial-overview.png`
- 場面：分身がノートPCとCore2風の小型機器をUSBケーブルでつなぎ、機器にはサーボモーターのアームがつながっています。
  アプリのインストールもサーバーも使わずに、ブラウザから機器を動かすことを示します。
- 重ねる文字：「ブラウザ」「USBシリアル」「Core2」「アーム」
- 代替テキスト：講師がノートPCと小型の機器をUSBケーブルでつなぎ、機器の先に小さなロボットアームがある

```text
The character sits on the left with a laptop showing a generic browser window.
He holds a USB cable that connects the laptop to a small square palm-sized device with a screen and three buttons below the screen (a generic microcontroller box, no logo).
The device is wired to a small desktop robot arm made of two hobby servo motors with a simple gripper.
Leave the upper right area as empty plain background.
```

### 8. 1ビットずつ、1行ずつ届く

- 配置先：`src/web-serial/web-serial-api.md`の「## シリアル通信の仕組み」
- ファイル名：`src/assets/illustrations/web-serial-bits.png`
- 場面：PCと機器をつなぐ1本のケーブルの上を、小さな玉（ビット）が一列に並んで進みます。
  受け取った側では、分身が改行ごとに区切られた細長い紙を1枚ずつ受け取っています。
- 重ねる文字：「1ビットずつ」「115200bps」「1行に1メッセージ」
- 代替テキスト：ケーブルの上を小さな玉が一列に進み、講師が改行で区切られた紙を1枚ずつ受け取っている

```text
On the right, a small square palm-sized device with a screen sends a single long cable to the left.
Along the cable, small round beads in two colors travel in a single line, one after another.
On the left, the character stands next to a laptop and receives narrow paper strips one at a time, each strip a single line of wavy marks.
Keep the area above the cable as empty plain background.
```

### 9. センサー値をグラフで見る

- 配置先：`src/web-serial/sensor-monitor.md`の「## 動かしてみる」
- ファイル名：`src/assets/illustrations/sensor-monitor-shake.png`
- 場面：分身が片手で小型機器を揺らし、ノートPCの画面のグラフが波打っています。
  静止時と揺らしたときで値が変わることを示します。
- 重ねる文字：「静止」「揺らす」「加速度」
- 代替テキスト：講師が小型の機器を手で揺らし、ノートPCの画面のグラフが大きく波打っている

```text
The character stands on the left, shaking a small square palm-sized device with a screen in one hand, with small motion lines around it.
The device is connected by a USB cable to a laptop on the right.
The laptop shows a simple line chart with three colored lines: flat on the left part, then wavy on the right part.
Keep the upper area as empty plain background.
```

### 10. 数値をラベルにしてからモデルに渡す

- 配置先：`src/web-serial/sensor-ai.md`の「## 数値をそのまま渡さない」
- ファイル名：`src/assets/illustrations/sensor-ai-summarize.png`
- 場面：小型機器から細かい数値の粒がたくさん流れ出し、分身がそれをじょうごで集めて、短いカードにまとめています。
  そのカードをAIに手渡し、AIが判断を返します。
- 重ねる文字：「センサー値」「集計とラベル付け（コード）」「判断（モデル）」
- 代替テキスト：機器から出た細かな粒を講師がじょうごで集め、短いカードにまとめてAIに手渡している

```text
On the left, a small square palm-sized device with a screen releases a stream of many tiny dots and dashes.
In the center, the character holds a large funnel that collects the stream; below the funnel, a single small card with three short bars comes out.
On the right, the character hands the card to a friendly AI chat bubble character, which holds up a round traffic-light style sign (green, yellow, red circles).
Keep the upper area as empty plain background.
```

### 11. 可動範囲を確かめる

- 配置先：`src/web-serial/servo.md`の「## 可動範囲を確かめる」
- ファイル名：`src/assets/illustrations/servo-range.png`
- 場面：分身がノートPCのスライダーを少しずつ動かし、机の上のアームの横には分度器のような扇形の目盛りがあります。
  扇形の両端には止まる位置の印があり、安全に動かせる範囲を記録することを示します。
- 重ねる文字：「最小の角度」「最大の角度」「ここで止める」
- 代替テキスト：講師がスライダーを動かし、アームの横の扇形の目盛りに止める位置の印がある

```text
The character sits on the left, carefully moving a slider on a laptop screen with one finger, with a focused but calm expression.
On the right, a small desktop robot arm made of hobby servo motors sits on the desk, with a large semicircular protractor-like fan shape behind it.
Two small flags mark the stopping points near both ends of the fan shape. The tick marks have no numbers.
Keep the upper right area as empty plain background.
```

### 12. 音声はどこで文字になるか

- 配置先：`src/web-serial/speech-recognition.md`の「## 音声が処理される場所」
- ファイル名：`src/assets/illustrations/speech-recognition-where.png`
- 場面：分身がマイクに話しかけています。
  上の道では声が雲（サーバー）まで行って戻り、下の道では声がノートPCの中だけで文字になります。
- 重ねる文字：「サーバーで認識」「端末内で認識（processLocally）」「言語パック」
- 代替テキスト：講師がマイクに話しかけ、声がサーバーの雲を経由する道と、ノートPCの中だけで処理される道に分かれている

```text
The character stands on the left, speaking into a handheld microphone, with a few sound wave arcs coming out.
From the microphone, two dotted paths go to the right.
The upper path goes up to a large white cloud with a small server rack inside, then comes back down to a laptop.
The lower path goes straight into the same laptop, where a small box (a language pack) sits inside the screen.
Leave empty plain background next to each path for labels.
```

### 13. 声でアームを動かす

- 配置先：`src/web-serial/voice-servo.md`の「# 声でサーボモーターを動かす」の直後
- ファイル名：`src/assets/illustrations/voice-servo.png`
- 場面：分身がマイクに話しかけると、ノートPCを通じて机の上のアームが向きを変え、グリッパーで小さなブロックをつかみます。
- 重ねる文字：「もう少し右に」「つかんで」
- 代替テキスト：講師がマイクに話しかけ、机の上の小さなロボットアームがブロックをつかんでいる

```text
The character stands on the left, speaking into a microphone with an empty speech bubble.
In the middle, a laptop with a generic browser window is connected by a USB cable to a small square palm-sized device with a screen.
On the right, a small desktop robot arm made of hobby servo motors turns with curved motion lines and grabs a small colored block with its gripper.
Keep the empty speech bubble and the upper area clear for adding text later.
```

### 14. モデルの出力を3か所で確かめる

- 配置先：`src/web-serial/voice-servo.md`の「## モデルの出力を検証する」
- ファイル名：`src/assets/illustrations/voice-servo-validation.png`
- 場面：AIが出した指示のカードが、3つの関所を順に通ってアームへ向かいます。
  分身は2つ目の関所で、カードの角度を定規で確かめています。
- 重ねる文字：「スキーマ」「ブラウザのコード」「ブリッジ」
- 代替テキスト：AIが出したカードが3つの関所を順に通り、2つ目の関所で講師が定規で確かめている

```text
On the left, a friendly AI chat bubble character hands out a small card.
The card travels to the right along a path through three simple gates (like small toll booths), placed at even intervals.
At the second gate, the character checks the card with a ruler and a magnifying glass.
At the far right end of the path, a small desktop robot arm made of hobby servo motors waits.
Leave empty plain background above each gate for labels.
```

### 15. 揺れを見張り、アームで知らせる

- 配置先：`src/web-serial/sensor-assistant.md`の「## 異常な揺れからアームでの警告へ」
- ファイル名：`src/assets/illustrations/sensor-assistant-alert.png`
- 場面：机の上の小型機器が揺れ、AIの判断を受けたアームが持ち上がって合図しています。
  分身はノートPCの前で、状態を質問する吹き出しを出しています。
- 重ねる文字：「異常な揺れ」「警告」「今、揺れていますか」
- 代替テキスト：揺れている小型の機器の横でアームが持ち上がって合図し、講師がノートPCの前で質問している

```text
On the right, a small square palm-sized device with a screen shakes on the desk, with small motion lines and a tiny exclamation-shaped spark (no text).
Next to it, a small desktop robot arm made of hobby servo motors raises its arm upward like a warning signal.
On the left, the character sits in front of a laptop that shows a friendly AI chat bubble character, and he asks a question with an empty speech bubble.
Keep the empty speech bubble and the upper left area clear for adding text later.
```

## 本文に挿絵を入れる書き方

mdBookでは、画像のパスをMarkdownファイルからの相対パスで書きます。
画像は`src/assets/illustrations/`に置くので、章のファイルの位置によって先頭が変わります。

`src/`直下の章（`src/prompt-api.md`など）では、次のように書きます。

```markdown
![機内モードのノートPCの中のAIと、講師が吹き出しで会話している](assets/illustrations/prompt-api-offline.png)
```

`src/web-serial/`の章では、1つ上の階層に戻ります。

```markdown
![講師がマイクに話しかけ、机の上の小さなロボットアームがブロックをつかんでいる](../assets/illustrations/voice-servo.png)
```

挿絵は見出しの直後か、見出しの下の最初の段落の後に置きます。
重ねる文字を本文でも説明する場合、代替テキストは場面の説明にとどめ、ラベルを繰り返しません。
