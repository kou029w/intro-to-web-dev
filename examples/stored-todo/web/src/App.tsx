import { useState, type FormEvent, type MouseEvent } from "react";
import useSWR from "swr";
import { type Todo } from "./types";
import { Header } from "./components/Header";
import { FilterButton } from "./components/FilterButton";
import { AddTodoForm } from "./components/AddTodoForm";
import { TodoList } from "./components/TodoList";

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
    const optimisticData = todos.map((todo: Todo) =>
      todo.id === id ? { ...todo, completed: newCompleted } : todo,
    );
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
      <div className="max-w-md mx-auto flex flex-col gap-8">
        <Header />
        <div className="flex justify-center">
          <FilterButton
            showAll={showAll}
            onToggle={() => setShowAll(!showAll)}
          />
        </div>
        <AddTodoForm
          text={text}
          onTextChange={setText}
          onSubmit={handleAddTodo}
        />
        <div className="pb-20">
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </div>
      </div>
    </div>
  );
}
