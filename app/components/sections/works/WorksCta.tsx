"use client";

import { useTranslations } from "next-intl";

export default function WorksCta() {
  const t = useTranslations("WorksPage.cta");

  return (
    <section className="mx-auto mt-32 max-w-7xl px-8 text-center" data-aos="fade-up">
      <div className="relative overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#2a2a2a]/30 p-16">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#7c3aed]/10 via-transparent to-transparent" />
        <h2 className="relative mb-6 text-4xl font-bold tracking-tight">{t("title")}</h2>
        <p className="relative mx-auto mb-10 max-w-xl text-[#ccc3d8]">{t("description")}</p>
        <button
          className="relative rounded-full bg-[#d2bbff] px-10 py-4 text-lg font-bold text-[#25005a] transition-all hover:shadow-[0_0_30px_rgba(210,187,255,0.3)] active:scale-95"
          type="button"
        >
          {t("button")}
        </button>
      </div>
    </section>
  );
}
