"use client";

import type { PortfolioInfoContent } from "@/types/admin";

type PortfolioInfoEditorProps = {
  info: PortfolioInfoContent;
  labels: {
    sectionTitle: string;
    ownerNameField: string;
    titleField: string;
    subtitleField: string;
    aboutField: string;
    emailField: string;
    phoneField: string;
    locationField: string;
    githubField: string;
    linkedinField: string;
    instagramField: string;
  };
  onChange: (field: keyof PortfolioInfoContent, value: string) => void;
};

export default function PortfolioInfoEditor({ info, labels, onChange }: PortfolioInfoEditorProps) {
  return (
    <section className="admin-enter space-y-4">
      <h2 className="text-lg font-bold text-[#e5e2e1]">{labels.sectionTitle}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50"
          onChange={(event) => onChange("ownerName", event.target.value)}
          placeholder={labels.ownerNameField}
          type="text"
          value={info.ownerName}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50"
          onChange={(event) => onChange("title", event.target.value)}
          placeholder={labels.titleField}
          type="text"
          value={info.title}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("subtitle", event.target.value)}
          placeholder={labels.subtitleField}
          type="text"
          value={info.subtitle}
        />
        <textarea
          className="min-h-24 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 py-2 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("about", event.target.value)}
          placeholder={labels.aboutField}
          value={info.about}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50"
          onChange={(event) => onChange("contactEmail", event.target.value)}
          placeholder={labels.emailField}
          type="text"
          value={info.contactEmail}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50"
          onChange={(event) => onChange("contactPhone", event.target.value)}
          placeholder={labels.phoneField}
          type="text"
          value={info.contactPhone}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("location", event.target.value)}
          placeholder={labels.locationField}
          type="text"
          value={info.location}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("github", event.target.value)}
          placeholder={labels.githubField}
          type="url"
          value={info.github}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("linkedin", event.target.value)}
          placeholder={labels.linkedinField}
          type="url"
          value={info.linkedin}
        />
        <input
          className="min-h-11 rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1] transition-all duration-200 focus:border-[#7c3aed]/50 md:col-span-2"
          onChange={(event) => onChange("instagram", event.target.value)}
          placeholder={labels.instagramField}
          type="url"
          value={info.instagram}
        />
      </div>
    </section>
  );
}
