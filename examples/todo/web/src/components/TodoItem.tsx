import { type MouseEvent } from "react";
import { type Todo } from "../types";
import { transition } from "./styles";

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: (e: MouseEvent) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li
      onClick={onToggle}
      className={`group relative p-5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer select-none ${transition} active:scale-95 hover:shadow-xl hover:-translate-y-1 ${
        todo.completed ? "bg-gray-100/80 grayscale" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div
          className={`text-2xl ${transition} ${
            todo.completed ? "scale-125 rotate-12 opacity-50" : "scale-100"
          }`}
        >
          {todo.completed ? "🎉" : "🔥"}
        </div>
        <span
          className={`text-lg font-bold text-gray-700 ${transition} truncate ${
            todo.completed
              ? "line-through text-gray-400 decoration-pink-500 decoration-4"
              : ""
          }`}
        >
          {todo.title}
        </span>
      </div>

      <button
        onClick={onDelete}
        className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-500 hover:text-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center ${transition} shadow-sm hover:shadow-md hover:rotate-12`}
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
  );
}
