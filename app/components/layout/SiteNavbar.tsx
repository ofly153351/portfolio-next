"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SiteNavbar() {
  const t = useTranslations("Portfolio.nav");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-1/2 top-4 z-[100] w-[92%] max-w-5xl -translate-x-1/2" data-aos="fade-down">
      <nav className="rounded-full border border-[#4a4455]/25 bg-[#131313]/70 px-4 py-3 backdrop-blur-md shadow-[0_0_60px_rgba(124,58,237,0.04)] sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-tighter text-[#e5e2e1]">{t("brand")}</span>

          <div className="hidden items-center gap-8 md:flex">
            <Link className="text-[#ccc3d8] transition-colors hover:text-[#e5e2e1]" href="#projects">
              {t("projects")}
            </Link>
            <Link className="text-[#ccc3d8] transition-colors hover:text-[#e5e2e1]" href="#experience">
              {t("experience")}
            </Link>
            <Link className="text-[#ccc3d8] transition-colors hover:text-[#e5e2e1]" href="#contact">
              {t("contact")}
            </Link>
          </div>

          <button
            className="hidden min-h-11 rounded-full bg-[#7c3aed] px-5 py-2 font-medium text-[#ede0ff] transition-transform hover:scale-95 active:scale-90 md:inline-flex"
            type="button"
          >
            {t("hireMe")}
          </button>

          <button
            aria-expanded={isOpen}
            aria-label={t("toggleMenu")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#4a4455]/30 text-[#e5e2e1] md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {isOpen ? (
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-[#4a4455]/30 bg-[#1c1b1b]/90 p-3 md:hidden">
            <Link className="min-h-11 rounded-xl px-3 py-2 text-[#e5e2e1]" href="#projects" onClick={() => setIsOpen(false)}>
              {t("projects")}
            </Link>
            <Link className="min-h-11 rounded-xl px-3 py-2 text-[#e5e2e1]" href="#experience" onClick={() => setIsOpen(false)}>
              {t("experience")}
            </Link>
            <Link className="min-h-11 rounded-xl px-3 py-2 text-[#e5e2e1]" href="#contact" onClick={() => setIsOpen(false)}>
              {t("contact")}
            </Link>
            <button className="min-h-11 rounded-xl bg-[#7c3aed] px-4 py-2 text-left font-semibold text-[#ede0ff]" type="button">
              {t("hireMe")}
            </button>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
