import { DatabaseSync } from "node:sqlite";
import type { Todo, TodoRepo } from "./types.js";

const db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL CHECK (completed IN (0, 1)) DEFAULT 0
  )
`);

export const todo = {
  all(completed?: boolean) {
    let result: Todo[] = [];

    switch (completed) {
      case true:
        result = sql.all`SELECT * FROM todos WHERE completed = 1`;
        break;
      case false:
        result = sql.all`SELECT * FROM todos WHERE completed = 0`;
        break;
      default:
        result = sql.all`SELECT * FROM todos`;
    }

    return result.map((todo) => ({
      ...todo,
      completed: Boolean(todo.completed),
    }));
  },
  get(id: number) {
    const result = sql.get`SELECT * FROM todos WHERE id = ${id}`;
    return result && { ...result, completed: Boolean(result.completed) };
  },
  create(title: string) {
    const result = sql.run`INSERT INTO todos (title) VALUES (${title})`;
    return this.get(result.lastInsertRowid);
  },
  update(id: number, patch: Partial<Todo>) {
    if (patch.title !== undefined) {
      sql.run`
        UPDATE todos
          SET title = ${patch.title}
          WHERE id = ${id}`;
    }

    if (patch.completed !== undefined) {
      sql.run`
        UPDATE todos
          SET completed = ${Number(patch.completed)}
          WHERE id = ${id}`;
    }

    return this.get(id);
  },
  delete(id: number) {
    sql.run`DELETE FROM todos WHERE id = ${id}`;
    return true;
  },
} satisfies TodoRepo;
