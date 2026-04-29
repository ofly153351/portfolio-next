"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { adminApi } from "@/lib/admin-api";
import type { PortfolioInfoContent } from "@/types/admin";

function normalizeLocale(locale: string) {
  return locale.startsWith("th") ? "th" : "en";
}

export default function SiteFooter() {
  const t = useTranslations("Portfolio.footer");
  const locale = useLocale();
  const [info, setInfo] = useState<PortfolioInfoContent | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminApi.getPublicContent(normalizeLocale(locale));
        setInfo(response.data?.content?.portfolioInfo ?? null);
      } catch {
        setInfo(null);
      }
    };
    void load();
  }, [locale]);

  const hasGithub = info?.github?.trim();
  const hasLinkedin = info?.linkedin?.trim();
  const hasInstagram = info?.instagram?.trim();
  const hasEmail = info?.contactEmail?.trim();

  return (
    <footer
      id="contact"
      className="mt-32 w-full border-t border-[#4a4455]/10 bg-[#131313] py-12"
      data-aos="fade-up"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
        <div className="text-sm uppercase tracking-wide text-[#ccc3d8]">{t("copyright")}</div>
        <div className="flex flex-wrap justify-center gap-6">
          {hasGithub ? (
            <Link
              className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100"
              href={info.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("github")}
            </Link>
          ) : null}
          {hasLinkedin ? (
            <Link
              className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100"
              href={info.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("linkedin")}
            </Link>
          ) : null}
          {hasInstagram ? (
            <Link
              className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100"
              href={info.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("instagram")}
            </Link>
          ) : null}
          {hasEmail ? (
            <Link
              className="text-sm font-bold uppercase tracking-widest text-[#ccc3d8] opacity-80 transition-colors duration-300 hover:text-[#7c3aed] hover:opacity-100"
              href={`mailto:${info.contactEmail}`}
            >
              Email
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
