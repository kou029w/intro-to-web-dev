import type { Todo, TodoRepo } from "./types.js";

const key = "todos";

function load(): Todo[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  return JSON.parse(raw) as Todo[];
}

function save(todos: Todo[]) {
  localStorage.setItem(key, JSON.stringify(todos));
}

export const todo = {
  all(completed?: boolean) {
    const todos = load();
    return typeof completed === "boolean"
      ? todos.filter((t) => t.completed === completed)
      : todos;
  },
  get(id: number) {
    return load().find((t) => t.id === id);
  },
  create(title: string) {
    const todos = load();
    const todo = {
      id: (todos.at(-1)?.id ?? 0) + 1,
      title,
      completed: false,
    };
    save([...todos, todo]);
    return todo;
  },
  update(id: number, patch: Partial<Todo>) {
    const todos = load();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    if (patch.title !== undefined) todo.title = patch.title;
    if (patch.completed !== undefined) todo.completed = patch.completed;
    save(todos);
    return todo;
  },
  delete(id: number) {
    const todos = load().filter((t) => t.id !== id);
    save(todos);
    return true;
  },
} satisfies TodoRepo;
