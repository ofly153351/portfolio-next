"use client";

import { BrainCircuit, Code2, Layers3, Server } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SkillItem } from "@/types/portfolio";
import SectionHeading from "../ui/SectionHeading";

const icons = [Layers3, Server, Code2, BrainCircuit];
const glows = [
  "from-[#d2bbff]/25 to-[#7c3aed]/10",
  "from-[#adc6ff]/25 to-[#0566d9]/10",
  "from-[#eaddff]/25 to-[#8b5cf6]/10",
  "from-[#7c3aed]/30 to-[#0566d9]/15",
];

type SkillsSectionProps = {
  items?: SkillItem[];
};

export default function SkillsSection({ items: itemsFromApi }: SkillsSectionProps) {
  const t = useTranslations("Portfolio.skills");
  const translatedItems = t.raw("items") as SkillItem[];
  const items = itemsFromApi && itemsFromApi.length > 0 ? itemsFromApi : translatedItems;

  return (
    <section className="py-20" id="skills">
      <div data-aos="fade-up">
        <SectionHeading centered eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, index) => {
          const Icon = icons[index] ?? Code2;
          const glow = glows[index % glows.length];

          return (
            <article
              key={item.title || String(index)}
              data-aos="zoom-in-up"
              data-aos-delay={index * 80}
              className="group relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#4a4455]/20 bg-[radial-gradient(circle_at_30%_0%,#25242c_0%,#1a191e_48%,#151418_100%)] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#7c3aed]/35"
            >
              <div className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl transition-transform duration-500 group-hover:scale-110 ${glow}`} />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-[#f8f9ff] to-[#e8ecff] shadow-[0_18px_42px_rgba(0,0,0,0.26)] transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-1 rounded-xl border border-[#7c3aed]/15" />
                {item.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${item.title} icon`}
                    className="relative z-10 h-14 w-14 object-contain"
                    src={item.icon}
                  />
                ) : (
                  <Icon className="relative z-10 text-[#5b45ff]" size={40} />
                )}
              </div>
              <h4 className="relative z-10 text-base font-semibold tracking-tight text-[#f5f3ff]">{item.title}</h4>
            </article>
          );
        })}
      </div>
    </section>
  );
}
