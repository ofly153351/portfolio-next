import { Pencil, Trash2, UploadCloud } from "lucide-react";
import type { ProjectContentItem, ProjectFormState } from "@/types/admin";

type ProjectListProps = {
  items: ProjectContentItem[];
  onEdit: (form: ProjectFormState) => void;
  onDelete: (id: string) => void;
};

export default function ProjectList({
  items,
  onEdit,
  onDelete,
}: ProjectListProps) {
  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Active Inventory</h2>
          <span className="rounded bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-bold text-[#d2bbff]">
            {items.length} TOTAL
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((project) => (
          <div
            key={project.id}
            className="admin-card-smooth glass-panel group flex items-center gap-6 rounded-2xl p-5 transition-all duration-300 hover:bg-[#2a2a2a]/40"
          >
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#4a4455]/20 bg-[#0e0e0e]">
              {project.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={project.title}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                  src={project.images[0]}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#4a4455]">
                  <UploadCloud size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate font-bold text-[#e5e2e1] transition-colors group-hover:text-[#d2bbff]">
                  {project.title || "Untitled Project"}
                </h3>
                <span className="rounded bg-[#0566d9]/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-[#adc6ff]">
                  {project.tag || "draft"}
                </span>
              </div>
              <p className="mb-3 line-clamp-1 text-xs text-[#ccc3d8]">{project.description || "-"}</p>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a4455]">
                {project.images.length} assets
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#7c3aed] hover:text-white"
                onClick={() =>
                  onEdit({
                    title: project.title,
                    url: project.projectUrl ?? "",
                    description: project.description,
                    tag: project.tag,
                    images: project.images,
                  })
                }
                type="button"
              >
                <Pencil size={16} />
              </button>
              <button
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#93000a] hover:text-white"
                onClick={() => onDelete(project.id)}
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
