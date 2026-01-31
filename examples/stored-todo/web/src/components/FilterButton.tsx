import { transition } from "./styles";

interface FilterButtonProps {
  showAll: boolean;
  onToggle: () => void;
}

export function FilterButton({ showAll, onToggle }: FilterButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`px-6 py-2 rounded-full font-bold shadow-lg ${transition} ${
        showAll
          ? "bg-green-400 text-white rotate-1 scale-110"
          : "bg-white text-gray-500 hover:bg-gray-50"
      }`}
    >
      {showAll ? "未完了のみ表示する" : "👀 すべて表示する"}
    </button>
  );
}
