"use client";

import { CheckCircle2, FileCode2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ArchitectureList } from "@/types/portfolio";

export default function ArchitectureSection() {
  const t = useTranslations("Portfolio.architecture");
  const list = t.raw("list") as ArchitectureList;

  return (
    <section className="grid grid-cols-1 items-center gap-16 py-32 lg:grid-cols-2" id="experience">
      <div className="order-2 lg:order-1" data-aos="fade-right">
        <div className="overflow-hidden rounded-2xl border border-[#4a4455]/20 bg-[#0e0e0e] p-6 font-mono text-sm shadow-2xl">
          <div className="mb-6 flex items-center gap-2 border-b border-[#4a4455]/10 pb-4 text-[#ccc3d8]">
            <FileCode2 className="text-[#d2bbff]" size={18} />
            <span>{t("codeTitle")}</span>
          </div>
          <div className="space-y-1">
            <p className="text-[#d2bbff]">&lt;app-root&gt;</p>
            <p className="pl-4 text-[#ccc3d8]">&lt;app-navbar /&gt;</p>
            <p className="pl-4 text-[#ccc3d8]">&lt;main class=&quot;content-canvas&quot;&gt;</p>
            <p className="pl-8 text-[#adc6ff]">&lt;app-hero-ai /&gt;</p>
            <p className="pl-8 text-[#ccc3d8]">&lt;app-skills /&gt;</p>
            <p className="pl-8 text-[#ccc3d8]">&lt;app-projects /&gt;</p>
            <p className="pl-4 text-[#ccc3d8]">&lt;/main&gt;</p>
            <p className="pl-4 text-[#ccc3d8]">&lt;app-footer /&gt;</p>
            <p className="text-[#d2bbff]">&lt;/app-root&gt;</p>
          </div>
          <div className="mt-8 border-t border-[#4a4455]/10 pt-4 text-xs italic text-[#ccc3d8]/70">{t("codeHint")}</div>
        </div>
      </div>

      <div className="order-1 space-y-6 lg:order-2" data-aos="fade-left" data-aos-delay="100">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#d2bbff]">{t("eyebrow")}</h3>
        <h2 className="text-4xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-lg text-[#ccc3d8]">{t("description")}</p>
        <ul className="space-y-4">
          {list.items.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <CheckCircle2 className="text-[#d2bbff]" size={20} />
              <span className="text-[#ccc3d8]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
