"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function WorksTopNav() {
  const t = useTranslations("WorksPage.nav");
  const locale = useLocale();

  return (
    <nav
      className="fixed left-1/2 top-4 z-50 flex w-[90%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border border-[#4a4455]/15 bg-[#131313]/70 px-6 py-3 text-sm font-medium tracking-tight shadow-[0_0_60px_rgba(124,58,237,0.04)] backdrop-blur-xl"
      data-aos="fade-down"
    >
      <Link className="text-xl font-bold tracking-tighter text-[#e5e2e1]" href={`/${locale}`}>
        {t("brand")}
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        <Link className="font-semibold text-[#7c3aed]" href={`/${locale}/works`}>
          {t("work")}
        </Link>
        <Link className="text-[#ccc3d8] transition-colors hover:text-[#e5e2e1]" href={`/${locale}#experience`}>
          {t("about")}
        </Link>
        <Link className="text-[#ccc3d8] transition-colors hover:text-[#e5e2e1]" href="#contact">
          {t("contact")}
        </Link>
      </div>

      <button
        className="rounded-full bg-[#7c3aed] px-5 py-2 font-semibold text-[#ede0ff] transition-all duration-200 hover:bg-[#7c3aed]/90 active:scale-95"
        type="button"
      >
        {t("resume")}
      </button>
    </nav>
  );
}
