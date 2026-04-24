import { GripVertical, Layers3, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TechnicalContentItem } from "@/types/admin";

type TechnicalListProps = {
  items: TechnicalContentItem[];
  onEdit: (item: TechnicalContentItem) => void;
  onDelete: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
};

export default function TechnicalList({
  items,
  onEdit,
  onDelete,
  onReorder,
}: TechnicalListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Technical Stack</h2>
          <span className="rounded bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-bold text-[#d2bbff]">
            {items.length} TOTAL
          </span>
        </div>
      </div>

      <div className="admin-scrollbar max-h-[65vh] space-y-4 overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`admin-card-smooth glass-panel group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:bg-[#2a2a2a]/40 ${
              draggingId === item.id ? "opacity-60 ring-1 ring-[#7c3aed]/40" : ""
            }`}
            draggable
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDragStart={() => setDraggingId(item.id)}
            onDrop={() => {
              if (!draggingId || draggingId === item.id) return;
              onReorder(draggingId, item.id);
              setDraggingId(null);
            }}
          >
            <div className="flex h-10 w-8 shrink-0 items-center justify-center text-[#6b6478]">
              <GripVertical size={16} />
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#4a4455]/20 bg-[#f5f7fb] shadow-inner shadow-black/10">
              {item.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={item.title} className="h-8 w-8 object-contain" src={item.icon} />
              ) : (
                <Layers3 className="text-[#4a4455]" size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-[#e5e2e1]">{item.title}</h3>
              <p className="line-clamp-1 text-xs text-[#ccc3d8]">{item.description || "-"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#7c3aed] hover:text-white"
                onClick={() => onEdit(item)}
                type="button"
              >
                <Pencil size={16} />
              </button>
              <button
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#93000a] hover:text-white"
                onClick={() => onDelete(item.id)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
