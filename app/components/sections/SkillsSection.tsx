"use client";

import { BrainCircuit, Code2, Layers3, Server } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SkillItem } from "@/types/portfolio";
import SectionHeading from "../ui/SectionHeading";

const icons = [Layers3, Server, Code2, BrainCircuit];
const glows = ["bg-[#d2bbff]/5", "bg-[#adc6ff]/5", "bg-[#eaddff]/5", "bg-[#7c3aed]/10"];

type SkillsSectionProps = {
  items?: SkillItem[];
};

export default function SkillsSection({ items: itemsFromApi }: SkillsSectionProps) {
  const t = useTranslations("Portfolio.skills");
  const translatedItems = t.raw("items") as SkillItem[];
  const items = itemsFromApi && itemsFromApi.length > 0 ? itemsFromApi : translatedItems;

  return (
    <section className="py-32" id="skills">
      <div data-aos="fade-up">
        <SectionHeading centered eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = icons[index] ?? Code2;
          const glow = glows[index] ?? "bg-[#d2bbff]/5";

          return (
            <article
              key={item.title}
              data-aos="zoom-in-up"
              data-aos-delay={index * 80}
              className="group relative overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] p-8 transition-all duration-500 hover:bg-[#2a2a2a]"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition-all group-hover:opacity-100 ${glow}`} />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#4a4455]/20 bg-[#353534]">
                <Icon className="text-[#d2bbff]" size={24} />
              </div>
              <h4 className="mb-2 text-xl font-bold">{item.title}</h4>
              <p className="text-sm text-[#ccc3d8]">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
