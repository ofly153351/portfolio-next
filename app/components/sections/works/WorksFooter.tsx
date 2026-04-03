"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function WorksFooter() {
  const t = useTranslations("WorksPage.footer");

  return (
    <footer
      id="contact"
      className="mt-20 w-full border-t border-[#4a4455]/15 bg-[#131313] py-12 text-xs uppercase tracking-widest text-[#ccc3d8]"
      data-aos="fade-up"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
        <div className="order-2 flex gap-12 md:order-1">
          <Link className="transition-colors duration-300 hover:text-[#7c3aed]" href="#">
            {t("github")}
          </Link>
          <Link className="transition-colors duration-300 hover:text-[#7c3aed]" href="#">
            {t("linkedin")}
          </Link>
          <Link className="transition-colors duration-300 hover:text-[#7c3aed]" href="#">
            {t("twitter")}
          </Link>
        </div>
        <div className="order-1 text-center md:order-2 md:text-right">{t("copyright")}</div>
      </div>
    </footer>
  );
}
