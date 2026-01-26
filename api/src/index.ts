import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// serve static files from the web build output
app.use("*", serveStatic({ root: "../web/dist" }));

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

let todos: Todo[] = [
  { id: 1, title: "Honoの使い方を学びました", completed: true },
  { id: 2, title: "HonoとReactアプリを連携させよう", completed: false },
];

let nextId = 3;

app.use("/api/*", cors());

app.get("/api/todos", (c) => {
  switch (c.req.query("completed")) {
    case "true":
      return c.json(todos.filter((t) => t.completed));
    case "false":
      return c.json(todos.filter((t) => !t.completed));
    default:
      return c.json(todos);
  }
});

app.get("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  return c.json(todo);
});

app.post("/api/todos", async (c) => {
  const body = await c.req.json();
  const todo = {
    id: nextId++,
    title: body.title,
    completed: false,
  };
  todos.push(todo);
  return c.json(todo, 201);
});

app.put("/api/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  if (body.title !== undefined) {
    todo.title = body.title;
  }

  if (body.completed !== undefined) {
    todo.completed = body.completed;
  }

  return c.json(todo);
});

app.delete("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  todos = todos.filter((t) => t.id !== id);

  return c.json({ message: "Todo deleted" });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
