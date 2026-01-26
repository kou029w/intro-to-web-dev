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
    if (completed === undefined) return todos;
    return todos.filter((t) => t.completed === completed);
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
    if (!todo) return undefined;
    if (patch.title !== undefined) todo.title = patch.title;
    if (patch.completed !== undefined) todo.completed = patch.completed;
    save(todos);
    return todo;
  },
  delete(id: number) {
    let todos = load();
    todos = todos.filter((t) => t.id !== id);
    save(todos);
    return true;
  },
} satisfies TodoRepo;
