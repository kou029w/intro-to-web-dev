import { DatabaseSync, type SQLOutputValue } from "node:sqlite";
import type { Todo, TodoRepo } from "./types.js";

const db = new DatabaseSync("data.db");
const sql = db.createTagStore();

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL CHECK (completed IN (0, 1)) DEFAULT 0
  );
`);

function toTodo(result: Record<string, SQLOutputValue>) {
  return {
    ...result,
    completed: Boolean(result.completed),
  } as Todo;
}

export const todo = {
  all(completed?: boolean) {
    const completedValue =
      typeof completed === "boolean" ? Number(completed) : null;

    const results = sql.all`
      SELECT * FROM todos WHERE completed = ${completedValue} OR ${completedValue} IS NULL
    `;

    return results.map(toTodo);
  },
  get(id: number | bigint) {
    const result = sql.get`SELECT * FROM todos WHERE id = ${id}`;
    return result && toTodo(result);
  },
  create(title: string) {
    const result = sql.run`INSERT INTO todos (title) VALUES (${title})`;
    return this.get(result.lastInsertRowid as number)!;
  },
  update(id: number, patch: Partial<Todo>) {
    sql.run`
      UPDATE todos
        SET
          title     = COALESCE(${patch.title ?? null}, title),
          completed = COALESCE(
            ${
              typeof patch.completed === "boolean"
                ? Number(patch.completed)
                : null
            },
            completed
          )
        WHERE id = ${id}
    `;

    return this.get(id);
  },
  delete(id: number) {
    const result = sql.run`DELETE FROM todos WHERE id = ${id}`;
    return result.changes > 0;
  },
} satisfies TodoRepo;
