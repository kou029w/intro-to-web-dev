import { useState } from "react";
import useSWR from "swr";

async function fetcher(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
}

function FilmList({ onSelect }) {
  const { data, error, isValidating } = useSWR(
    "https://ghibliapi.vercel.app/films",
    fetcher,
  );

  if (error) return <p className="text-red-500">エラー</p>;
  if (!data) return <p className="animate-pulse">読み込み中…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🎬 映画</h2>

      {isValidating && (
        <div className="fixed bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-xs text-white shadow">
          バックグラウンドで再取得中…
        </div>
      )}

      <select
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 shadow"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">-</option>
        {data.map((f) => (
          <option key={f.id} value={f.id}>
            {f.original_title} - {f.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilmDetail({ id }) {
  const { data, isValidating } = useSWR(
    id && `https://ghibliapi.vercel.app/films/${id}`,
    fetcher,
  );

  if (!id) return <p className="text-gray-500">👆 選択して詳細表示</p>;
  if (!data) return <p className="animate-pulse text-gray-500">読み込み中…</p>;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="relative">
        <img
          src={data.movie_banner}
          alt={data.title}
          className="h-64 w-full object-cover"
        />
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-2xl font-bold">
          <ruby>
            {data.title}
            <rt className="text-sm font-normal">{data.original_title}</rt>
          </ruby>
        </h3>
        <p className="text-gray-700">{data.description}</p>
        <div className="text-sm text-gray-500">
          ディレクター: {data.director} / プロデューサー: {data.producer}
        </div>
      </div>

      {isValidating && (
        <div className="fixed bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-xs text-white shadow">
          バックグラウンドで再取得中…
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [id, setId] = useState(null);

  return (
    <div className="max-w-xl mx-auto min-h-screen p-8 flex flex-col gap-4">
      <h1 className="text-center text-4xl font-extrabold text-gray-800">
        SWR + Studio Ghibli API 🎬
      </h1>
      <div className="rounded-xl bg-white/70 p-4 text-sm text-gray-700 shadow">
        <h3 className="font-semibold">確認方法</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            DevTools → Network → <b>3G</b>
          </li>
          <li>どれかの「映画」を選択</li>
          <li>
            一度選択した映画の画像＋説明が<b>即表示</b>される
          </li>
          <li>
            タブを切り替えて戻す（<code>revalidateOnFocus</code>）
          </li>
          <li>数秒間「バックグラウンドで再取得中…」が表示される</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">
          ※ キャッシュ（stale）を即表示しつつ、裏で最新データを取得しています
        </p>
      </div>
      <div className="mx-auto flex flex-col max-w-6xl gap-8">
        <FilmList onSelect={setId} />
        <FilmDetail id={id} />
      </div>
    </div>
  );
}
