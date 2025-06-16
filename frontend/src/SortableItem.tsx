import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({
  id,
  value,
  checked,
  onChange,
}: {
  id: number;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style }}
      {...attributes}
      role="none"
      className="border border-gray-300 bg-white px-3 py-2 shadow"
    >
      <div
        {...listeners}
        tabIndex={-1}
        style={{ cursor: "grab" }}
        className="d-inline-block active:cursor-grabbing px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Drag"
      >
        &#9776;
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-blue-500 w-4 mx-2 h-4"
      />
      <span className="ml-2 text-gray-800">{value}</span>
    </div>
  );
}
