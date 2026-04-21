import { Link2, PlusSquare } from "lucide-react";
import type { ProjectFormState } from "@/types/admin";

type ProjectFormCardProps = {
  isBusy: boolean;
  form: ProjectFormState;
  onChange: (next: ProjectFormState) => void;
  onUploadImages: (files: FileList | null) => void;
  onSubmit: () => void;
};

export default function ProjectFormCard({
  isBusy,
  form,
  onChange,
  onUploadImages,
  onSubmit,
}: ProjectFormCardProps) {
  return (
    <div className="admin-card-smooth glass-panel relative overflow-hidden rounded-3xl p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#7c3aed]/10 blur-[80px]" />
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
          <PlusSquare size={18} />
        </div>
        <h2 className="text-xl font-bold text-[#e5e2e1]">New Project Details</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Project Title
          </label>
          <input
            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            placeholder="E.g. Quantum Analytics Engine"
            type="text"
            value={form.title}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Project URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]" size={14} />
            <input
              className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] py-3 pl-10 pr-4 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
              onChange={(event) => onChange({ ...form, url: event.target.value })}
              placeholder="https://project-url.com"
              type="url"
              value={form.url}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Description
          </label>
          <textarea
            className="w-full resize-none rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            placeholder="Briefly describe the architectural vision and technical challenges..."
            rows={4}
            value={form.description}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Tag
          </label>
          <input
            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, tag: event.target.value })}
            placeholder="AI / INFRA / WEB3"
            type="text"
            value={form.tag}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Project Images
          </label>
          <label className="admin-btn-smooth inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#4a4455]/40 bg-[#0e0e0e] px-3 py-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#7c3aed]/60">
            Upload Multiple Images
            <input
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              multiple
              onChange={(event) => onUploadImages(event.target.files)}
              type="file"
            />
          </label>

          {form.images.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative overflow-hidden rounded-lg border border-[#4a4455]/30 bg-[#111114]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`project-upload-${index + 1}`}
                    className="h-20 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={image}
                  />
                  <button
                    className="admin-btn-smooth absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#131313]/85 text-xs font-bold text-[#ffb4ab] hover:bg-[#93000a] hover:text-white"
                    onClick={() =>
                      onChange({
                        ...form,
                        images: form.images.filter((_, imageIndex) => imageIndex !== index),
                      })
                    }
                    type="button"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          className="admin-btn-smooth w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-4 text-xs font-bold tracking-widest text-[#e5e2e1] shadow-xl shadow-[#7c3aed]/20 disabled:opacity-60"
          disabled={isBusy}
          onClick={onSubmit}
          type="button"
        >
          DEPLOY TO REPOSITORY
        </button>
      </div>
    </div>
  );
}
