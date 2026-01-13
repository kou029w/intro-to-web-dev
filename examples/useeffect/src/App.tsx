import { useEffect, useState } from "react";
import "./App.css";

// ========================================
// UserCard: ユーザー表示コンポーネント
// ========================================
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    return () => controller.abort();
  }, [userId]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "crimson" }}>エラー: {error}</p>;
  if (!user) return null;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        minWidth: "200px",
      }}
    >
      <h2>{user.name}</h2>
      <small>ID: {user.id}</small>
    </div>
  );
}

// ========================================
// User
// - IDを変更して結果の差を確認
// ========================================
function User() {
  const [userId, setUserId] = useState(1);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>useEffect + fetch</h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          ユーザーID:
          <select
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        <UserCard userId={userId} />
        <UserCard userId={userId} />
        <UserCard userId={userId} />
      </div>
    </section>
  );
}

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <header>
        <h1>useEffect + fetch でデータ取得</h1>
        <p style={{ color: "#666" }}>
          Chrome DevTools &gt; Network で挙動を確認できます。
        </p>
      </header>

      <User />
    </div>
  );
}

export default App;
