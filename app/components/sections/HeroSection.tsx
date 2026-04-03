"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import AssistantCard from "../ai/AssistantCard";

export default function HeroSection() {
  const t = useTranslations("Portfolio.hero");

  return (
    <section className="grid min-h-[819px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
      <div className="space-y-8" data-aos="fade-up">
        <div className="space-y-4">
          <span className="inline-block rounded-full border border-[#4a4455]/20 bg-[#1c1b1b] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d2bbff]">
            {t("badge")}
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            {t("titlePrefix")} <span className="text-gradient">{t("name")}</span>
          </h1>
          <h2 className="text-2xl font-medium text-[#ccc3d8] md:text-3xl">{t("subtitle")}</h2>
          <p className="max-w-lg text-lg leading-relaxed text-[#ccc3d8]/80">{t("description")}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            className="flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] px-8 py-4 font-bold text-[#ede0ff] shadow-lg shadow-[#7c3aed]/20 transition-all hover:opacity-90"
            type="button"
          >
            {t("viewProjects")} <ArrowRight size={16} />
          </button>
          <button
            className="min-h-11 rounded-xl border border-[#4a4455]/30 px-8 py-4 font-bold transition-colors hover:bg-[#2a2a2a]"
            type="button"
          >
            {t("getInTouch")}
          </button>
        </div>
      </div>

      <div data-aos="fade-left" data-aos-delay="120">
        <AssistantCard />
      </div>
    </section>
  );
}
