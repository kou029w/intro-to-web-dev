import { useEffect, useRef } from "react";
import { useIntersection } from "react-use";
import useSWRInfinite from "swr/infinite";
import "./App.css";

const API_BASE = "https://jsonplaceholder.typicode.com";
const PAGE_SIZE = 10;

async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

function Posts() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;

    const query = new URLSearchParams({
      _page: (pageIndex + 1).toString(),
      _limit: PAGE_SIZE.toString(),
    });

    return `${API_BASE}/posts?${query}`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
  );

  const bottomRef = useRef(null);
  const intersection = useIntersection(bottomRef, { rootMargin: "100px" });

  const posts = data ? data.flat() : [];
  const isEnd = data && data[data.length - 1]?.length < PAGE_SIZE;

  useEffect(() => {
    if (intersection?.isIntersecting && !isValidating && !isEnd) {
      setSize(size + 1);
    }
  }, [intersection?.isIntersecting, isValidating, isEnd, setSize, size]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>Posts</h1>

      {posts.map((post) => (
        <article
          key={post.id}
          style={{ borderBottom: "1px solid #eee", padding: "1rem 0" }}
        >
          <h3>
            {post.id}. {post.title}
          </h3>
          <p>{post.body}</p>
        </article>
      ))}

      <div ref={bottomRef} style={{ height: "1px" }} />

      {(isLoading || isValidating) && <p>読み込み中...</p>}
      {isEnd && <p style={{ color: "#888" }}>すべて読み込みました</p>}
    </div>
  );
}

function App() {
  return <Posts />;
}

export default App;
