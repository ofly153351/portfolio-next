import { PlusSquare } from "lucide-react";
import type { TechnicalFormState } from "@/types/admin";

function resolvePreviewSrc(icon: string): string {
  const value = icon.trim();
  if (!value) return "";
  if (value.startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
  }
  return value;
}

type TechnicalFormCardProps = {
  isBusy: boolean;
  form: TechnicalFormState;
  onChange: (next: TechnicalFormState) => void;
  onUploadIcon: (file: File | null) => void;
  onSubmit: () => void;
};

export default function TechnicalFormCard({
  isBusy,
  form,
  onChange,
  onUploadIcon,
  onSubmit,
}: TechnicalFormCardProps) {
  const previewSrc = resolvePreviewSrc(form.icon);

  return (
    <div className="admin-card-smooth glass-panel relative overflow-hidden rounded-3xl p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#7c3aed]/10 blur-[80px]" />
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
          <PlusSquare size={18} />
        </div>
        <h2 className="text-xl font-bold text-[#e5e2e1]">New Technical Item</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Technical Title
          </label>
          <input
            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            placeholder="E.g. Redis"
            type="text"
            value={form.title}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Description
          </label>
          <textarea
            className="w-full resize-none rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            placeholder="Cache and memory store"
            rows={4}
            value={form.description}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
            Icon URL or SVG
          </label>
          <textarea
            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
            onChange={(event) => onChange({ ...form, icon: event.target.value })}
            placeholder="https://.../redis.svg or <svg ...>...</svg>"
            rows={4}
            value={form.icon}
          />
        </div>

        {previewSrc ? (
          <div className="rounded-2xl border border-[#4a4455]/20 bg-[#0e0e0e] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
              Icon Preview
            </p>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f7fb] shadow-inner shadow-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Technical icon preview" className="h-10 w-10 object-contain" src={previewSrc} />
            </div>
          </div>
        ) : null}

        <label className="admin-btn-smooth inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#4a4455]/40 bg-[#0e0e0e] px-3 py-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#7c3aed]/60">
          Upload Icon (svg/png)
          <input
            accept="image/svg+xml,image/png"
            className="hidden"
            onChange={(event) => onUploadIcon(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>

        <button
          className="admin-btn-smooth w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-4 text-xs font-bold tracking-widest text-[#e5e2e1] shadow-xl shadow-[#7c3aed]/20 disabled:opacity-60"
          disabled={isBusy}
          onClick={onSubmit}
          type="button"
        >
          ADD TO TECHNICAL STACK
        </button>
      </div>
    </div>
  );
}
