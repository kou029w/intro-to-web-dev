import { type FormEvent } from "react";
import { transition } from "./styles";

interface AddTodoFormProps {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddTodoForm({ text, onTextChange, onSubmit }: AddTodoFormProps) {
  return (
    <form onSubmit={onSubmit} className="relative group">
      <input
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="次はなにをする？"
        className={`w-full p-5 pl-6 rounded-3xl border-none shadow-xl text-lg focus:ring-4 focus:ring-pink-300 ${transition} outline-none text-gray-700 bg-white/80 backdrop-blur-sm`}
      />
      <button
        type="submit"
        className={`absolute right-3 top-3 bottom-3 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded-2xl shadow-md ${transition} active:scale-95 flex items-center`}
      >
        追加
      </button>
    </form>
  );
}
