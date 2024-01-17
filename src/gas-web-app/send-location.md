# 位置情報を送信する

ここまで説明に沿ってやってきていたら `comment` の後ろに現在地を書き加えれば現在地の緯度・経度を送信できます。

```js
const row = [comment];
```

↓

```js
const row = [comment, here[0], here[1]];
```

このように書き加えればOKです。

## 書式

```js
// コメント, 緯度, 経度
const row = [comment, here[0], here[1]];
```

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
    const row = [comment, here[0], here[1]];

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

スプレッドシートに位置情報が記録されていることを確認してみましょう。
