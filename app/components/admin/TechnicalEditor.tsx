"use client";

import type { TechnicalContentItem } from "@/types/admin";

type TechnicalEditorProps = {
  items: TechnicalContentItem[];
  labels: {
    sectionTitle: string;
    titleField: string;
    descriptionField: string;
    iconField: string;
    uploadIcon: string;
    save: string;
    add: string;
    remove: string;
  };
  onAdd: () => void;
  onChange: (id: string, field: "title" | "description" | "icon", value: string) => void;
  onSave: (id: string) => void;
  onUploadIcon: (id: string, file: File | null) => void;
  onRemove: (id: string) => void;
};

export default function TechnicalEditor({
  items,
  labels,
  onAdd,
  onChange,
  onSave,
  onUploadIcon,
  onRemove,
}: TechnicalEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#e5e2e1]">{labels.sectionTitle}</h2>
        <button
          className="min-h-11 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-[#ede0ff]"
          onClick={onAdd}
          type="button"
        >
          {labels.add}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="admin-card-smooth admin-enter rounded-2xl border border-[#4a4455]/25 bg-[#161519] p-4"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
                onChange={(event) => onChange(item.id, "title", event.target.value)}
                placeholder={labels.titleField}
                type="text"
                value={item.title}
              />
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
                onChange={(event) => onChange(item.id, "description", event.target.value)}
                placeholder={labels.descriptionField}
                type="text"
                value={item.description}
              />
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] md:col-span-2"
                onChange={(event) => onChange(item.id, "icon", event.target.value)}
                placeholder={labels.iconField}
                type="text"
                value={item.icon ?? ""}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="admin-btn-smooth min-h-11 rounded-lg border border-[#4a4455]/30 px-3 py-2 text-xs font-semibold text-[#d2bbff]"
                onClick={() => onSave(item.id)}
                type="button"
              >
                {labels.save}
              </button>
              <label className="admin-btn-smooth inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#4a4455]/30 px-3 py-2 text-xs font-semibold text-[#ccc3d8]">
                {labels.uploadIcon}
                <input
                  accept=".svg,.png,image/svg+xml,image/png"
                  className="hidden"
                  onChange={(event) => {
                    onUploadIcon(item.id, event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                  type="file"
                />
              </label>
              <button
                className="admin-btn-smooth min-h-11 rounded-lg border border-[#ff6f91]/45 px-3 py-2 text-xs font-semibold text-[#ffb4c4]"
                onClick={() => onRemove(item.id)}
                type="button"
              >
                {labels.remove}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
