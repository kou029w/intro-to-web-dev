# データを送信する

フォームからデータを送信してみましょう。

## 書式

HTMLとJavaScriptでコメント入力欄を作ります。

HTML:

```html
<form>
  <input name="comment" placeholder="コメント" required />
  <button type="submit">送信</button>
</form>
```

- [\<form\>: フォーム要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/form)
- [\<input\>: 入力欄（フォーム入力）要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/input)
- [\<button\>: ボタン要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/button)

JavaScript:

```javascript
// ここはWebアプリのURLに書き換えます
const endpoint = "https://script.google.com/{SCRIPTID}/exec";

const form = document.querySelector("form");

form.addEventListener("submit", async function submit(e) {
  e.preventDefault();
  document.body.style.cursor = "wait";

  const formData = new FormData(form);
  const comment = formData.get("comment");
  const row = [comment];

  await fetch(endpoint, { method: "POST", body: JSON.stringify(row) });

  location.reload();
});
```

- [document.querySelector()](https://developer.mozilla.org/ja/docs/Web/API/Document/querySelector)
- [FormData](https://developer.mozilla.org/ja/docs/Web/API/FormData)
- [location.reload()](https://developer.mozilla.org/ja/docs/Web/API/Location/reload)

## サンプルコード (全体)

```html
<!doctype html>
<meta charset="UTF-8" />
<title>GASで作るWebアプリ - 位置情報メモ</title>
<meta name="viewport" content="width=device-width" />
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet"></script>
<script type="module">
  /** 経緯度の取得 */
  async function getLatLng() {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject),
    );

    return [position.coords.latitude, position.coords.longitude];
  }

  const map = L.map("map").setView([36, 138], 15);

  // OpenStreetMapのデータはOpen Database Licenseのもとに利用を許諾されています。
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
  }).addTo(map);

  // 現在地
  const here = await getLatLng();
  // 現在地にマーカーを表示
  L.circleMarker(here).addTo(map);
  // 現在地に移動
  map.flyTo(here);

  // ここはWebアプリのURLに書き換えます
  const endpoint = "https://script.google.com/{SCRIPTID}/exec";

  const form = document.querySelector("form");

  form.addEventListener("submit", async function submit(e) {
    e.preventDefault();
    document.body.style.cursor = "wait";

    const formData = new FormData(form);
    const comment = formData.get("comment");
    const row = [comment];

    await fetch(endpoint, { method: "POST", body: JSON.stringify(row) });

    location.reload();
  });
</script>

<h1>位置情報メモ</h1>
<div id="map" style="width: 500px; height: 500px"></div>
<form>
  <input name="comment" placeholder="コメント" required />
  <button type="submit">送信</button>
</form>
```

コメントを入力し、[送信] を選択します。

スプレッドシートにコメントのデータが記録されていることを確認してみましょう。
