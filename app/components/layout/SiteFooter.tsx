"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SiteFooter() {
  const t = useTranslations("Portfolio.footer");

  return (
    <footer
      id="contact"
      className="mt-32 w-full border-t border-[#4a4455]/10 bg-[#131313] py-12"
      data-aos="fade-up"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
        <div className="text-sm uppercase tracking-wide text-[#ccc3d8]">{t("copyright")}</div>
        <div className="flex gap-8">
          <Link className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100" href="#">
            {t("github")}
          </Link>
          <Link className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100" href="#">
            {t("linkedin")}
          </Link>
          <Link className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100" href="#">
            {t("twitter")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
