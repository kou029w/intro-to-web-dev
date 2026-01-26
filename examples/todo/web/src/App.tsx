import { useState, type FormEvent, type MouseEvent } from "react";
import useSWR from "swr";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const endpoint = import.meta.env.DEV
  ? "http://localhost:3000/api/todos"
  : "/api/todos";

async function fetcher(url: string, method = "GET", body?: Partial<Todo>) {
  const res = await fetch(
    url,
    method === "GET" && !body
      ? undefined
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        },
  );

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return res.json();
}

export default function App() {
  const [text, setText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const queryKey = showAll ? endpoint : `${endpoint}?completed=false`;
  const { data: todos, error, mutate } = useSWR(queryKey, fetcher);

  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!text) return;
    const newTodo = { id: Date.now(), title: text, completed: false };
    const optimisticData = [...(todos || []), newTodo];

    // UI即時更新 -> API送信 -> 再検証
    try {
      await mutate(optimisticData, false);
      setText("");
      await fetcher(endpoint, "POST", { title: text, completed: false });
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      await mutate();
    }
  };

  const toggleTodo = async (id: number, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;

    // 仮データの作成: 対象のIDだけ completed を反転させる
    const optimisticData = todos.map((todo: Todo) =>
      todo.id === id ? { ...todo, completed: newCompleted } : todo,
    );

    // もし「すべて表示」モードなら、そのまま。そうでなければ、完了済みを除外する。
    const filteredOptimisticData = showAll
      ? optimisticData
      : optimisticData.filter((t: Todo) => !t.completed);

    try {
      await mutate(filteredOptimisticData, false);
      await fetcher(`${endpoint}/${id}`, "PUT", { completed: newCompleted });
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      await mutate();
    }
  };

  const deleteTodo = async (e: MouseEvent, id: number) => {
    e.stopPropagation();

    const confirmDelete = window.confirm("本当に消しちゃう？ 🗑️");
    if (!confirmDelete) return;

    // 仮データの作成: 指定したIDを除外する
    const optimisticData = todos.filter((todo: Todo) => todo.id !== id);

    try {
      await mutate(optimisticData, false);
      await fetcher(`${endpoint}/${id}`, "DELETE");
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      await mutate();
    }
  };

  if (error)
    return (
      <div className="text-center p-10 text-red-500 font-bold">Error! 😢</div>
    );
  if (!todos)
    return (
      <div className="text-center p-10 text-blue-500 animate-pulse">
        Loading... 🚀
      </div>
    );

  return (
    <div className="min-h-screen bg-liner-to-br from-yellow-100 via-pink-100 to-blue-100 p-8 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-liner-to-r from-orange-400 to-pink-600 drop-shadow-sm">
            My ToDo 📝
          </h1>
        </header>

        {/* フィルタ */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-6 py-2 rounded-full font-bold shadow-lg transition-all duration-300 ${
              showAll
                ? "bg-green-400 text-white rotate-1 scale-110"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {showAll ? "未完了のみ表示する" : "👀 すべて表示する"}
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleAddTodo} className="relative mb-8 group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="次はなにをする？"
            className="w-full p-5 pl-6 rounded-3xl border-none shadow-xl text-lg focus:ring-4 focus:ring-pink-300 transition-all outline-none text-gray-700 bg-white/80 backdrop-blur-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-3 bottom-3 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded-2xl shadow-md transition-all active:scale-95 flex items-center"
          >
            追加
          </button>
        </form>

        {/* リスト表示 */}
        <ul className="space-y-4 pb-20">
          {todos.map((todo: Todo) => (
            <li
              key={todo.id}
              onClick={() => toggleTodo(todo.id, todo.completed)}
              className={`
                group relative p-5 rounded-2xl shadow-lg flex items-center justify-between
                transform transition-all duration-300 cursor-pointer select-none
                active:scale-95 hover:shadow-xl hover:-translate-y-1
                ${todo.completed ? "bg-gray-100/80 grayscale" : "bg-white"}
              `}
            >
              <div className="flex items-center gap-4 w-full mr-8">
                {" "}
                {/* mr-8でゴミ箱分のスペース確保 */}
                <div
                  className={`text-2xl transition-transform duration-300 ${
                    todo.completed
                      ? "scale-125 rotate-12 opacity-50"
                      : "scale-100"
                  }`}
                >
                  {todo.completed ? "🎉" : "🔥"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <span
                    className={`text-lg font-bold text-gray-700 transition-all duration-300 block truncate ${
                      todo.completed
                        ? "line-through text-gray-400 decoration-pink-500 decoration-4"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
              </div>

              {/* 削除ボタン */}
              <button
                onClick={(e) => deleteTodo(e, todo.id)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  opacity-0 group-hover:opacity-100
                  bg-red-100 hover:bg-red-500 hover:text-white text-red-500
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 shadow-sm hover:shadow-md hover:rotate-12
                "
                title="削除する"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </li>
          ))}

          {todos.length === 0 && (
            <div className="text-center text-gray-400 py-10 font-bold animate-pulse">
              タスクなし！平和な一日だ... 🍵
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
