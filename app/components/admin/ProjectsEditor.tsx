"use client";

import type { ProjectContentItem } from "@/types/admin";

type ProjectsEditorProps = {
  items: ProjectContentItem[];
  labels: {
    sectionTitle: string;
    tagField: string;
    titleField: string;
    descriptionField: string;
    imageField: string;
    imagesTitle: string;
    addImageUrl: string;
    uploadImages: string;
    add: string;
    remove: string;
  };
  onAdd: () => void;
  onChange: (id: string, field: "tag" | "title" | "description", value: string) => void;
  onAddImage: (id: string) => void;
  onChangeImage: (id: string, index: number, value: string) => void;
  onRemoveImage: (id: string, index: number) => void;
  onUploadImages: (id: string, files: FileList | null) => void;
  onRemove: (id: string) => void;
};

export default function ProjectsEditor({
  items,
  labels,
  onAdd,
  onChange,
  onAddImage,
  onChangeImage,
  onRemoveImage,
  onUploadImages,
  onRemove,
}: ProjectsEditorProps) {
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
            className="admin-card-smooth admin-enter rounded-2xl border border-[#4a4455]/25 bg-[#161519] p-4 transition-all duration-300 hover:border-[#7c3aed]/40"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
                onChange={(event) => onChange(item.id, "tag", event.target.value)}
                placeholder={labels.tagField}
                type="text"
                value={item.tag}
              />
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
                onChange={(event) => onChange(item.id, "title", event.target.value)}
                placeholder={labels.titleField}
                type="text"
                value={item.title}
              />
              <input
                className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] md:col-span-2"
                onChange={(event) => onChange(item.id, "description", event.target.value)}
                placeholder={labels.descriptionField}
                type="text"
                value={item.description}
              />
            </div>

            <div className="mt-4 rounded-xl border border-[#4a4455]/20 bg-[#131217] p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#d2bbff]">{labels.imagesTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="admin-btn-smooth min-h-11 rounded-lg border border-[#4a4455]/30 px-3 py-2 text-xs font-semibold text-[#ccc3d8]"
                    onClick={() => onAddImage(item.id)}
                    type="button"
                  >
                    {labels.addImageUrl}
                  </button>
                  <label className="admin-btn-smooth inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#4a4455]/30 px-3 py-2 text-xs font-semibold text-[#ccc3d8]">
                    {labels.uploadImages}
                    <input
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(event) => {
                        onUploadImages(item.id, event.target.files);
                        event.currentTarget.value = "";
                      }}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                {item.images.map((image, index) => (
                  <div key={`${item.id}-img-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                    <input
                      className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
                      onChange={(event) => onChangeImage(item.id, index, event.target.value)}
                      placeholder={labels.imageField}
                      type="text"
                      value={image}
                    />
                    <button
                      className="admin-btn-smooth min-h-11 rounded-lg border border-[#ff6f91]/45 px-3 py-2 text-xs font-semibold text-[#ffb4c4]"
                      onClick={() => onRemoveImage(item.id, index)}
                      type="button"
                    >
                      {labels.remove}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3">
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
