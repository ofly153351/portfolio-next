"use client";

import { useTranslations } from "next-intl";

export default function WorksHeader() {
  const t = useTranslations("WorksPage.header");

  return (
    <header className="relative mx-auto mb-20 max-w-7xl px-8" data-aos="fade-up">
      <div className="max-w-3xl">
        <span className="mb-6 inline-block rounded-full border border-[#4a4455]/30 bg-[#2a2a2a]/50 px-3 py-1 text-[10px] uppercase tracking-widest text-[#d2bbff]">
          {t("badge")}
        </span>
        <h1 className="mb-8 text-5xl font-bold leading-[1.1] tracking-tighter md:text-7xl">
          {t("titlePrefix")} <span className="text-[#ccc3d8]">{t("titleAccent")}</span>
        </h1>
        <p className="max-w-2xl text-lg font-light leading-relaxed text-[#ccc3d8] md:text-xl">{t("description")}</p>
      </div>
    </header>
  );
}
