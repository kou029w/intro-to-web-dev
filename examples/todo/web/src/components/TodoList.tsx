import { type MouseEvent } from "react";
import { type Todo } from "../types";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (e: MouseEvent, id: number) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 font-bold animate-pulse">
        タスクなし！平和な一日だ... 🍵
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => onToggle(todo.id, todo.completed)}
          onDelete={(e) => onDelete(e, todo.id)}
        />
      ))}
    </ul>
  );
}
