import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { todo } from "./todo/sqlite.js";

// repositories
const repo = {
  todo,
};

const app = new Hono();

// serve static files from the web build output
app.use("*", serveStatic({ root: "../web/dist" }));

app.use("/api/*", cors());

app.get("/api/todos", (c) => {
  switch (c.req.query("completed")) {
    case "true":
      return c.json(repo.todo.all(true));
    case "false":
      return c.json(repo.todo.all(false));
    default:
      return c.json(repo.todo.all());
  }
});

app.get("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));
  const todo = repo.todo.get(id);

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  return c.json(todo);
});

app.post("/api/todos", async (c) => {
  const body = await c.req.json();
  const todo = repo.todo.create(body.title);
  return c.json(todo, 201);
});

app.put("/api/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const todo = repo.todo.update(id, {
    title: body.title,
    completed: body.completed,
  });

  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  return c.json(todo);
});

app.delete("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));
  const deleted = repo.todo.delete(id);

  if (deleted) {
    return c.json({ message: "Todo deleted" });
  } else {
    return c.json({ message: "Todo not found" }, 404);
  }
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
