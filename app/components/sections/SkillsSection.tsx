"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrainCircuit, Code2, Layers3, Server } from "lucide-react";
import { useEffect, useState } from "react";
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

const AUTO_SLIDE_MS = 10000;

type SkillsSectionProps = {
  items?: SkillItem[];
};

export default function SkillsSection({
  items: itemsFromApi,
}: SkillsSectionProps) {
  const t = useTranslations("Portfolio.skills");
  const translatedItems = t.raw("items") as SkillItem[];
  const items =
    itemsFromApi && itemsFromApi.length > 0 ? itemsFromApi : translatedItems;
  const [cardsPerPage, setCardsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerPage(10);
        return;
      }
      if (window.innerWidth >= 640) {
        setCardsPerPage(6);
        return;
      }
      setCardsPerPage(4);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
  const safePage = page % totalPages;

  useEffect(() => {
    if (totalPages <= 1) return;

    const timer = window.setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [totalPages]);

  const visibleItems = items.slice(
    safePage * cardsPerPage,
    safePage * cardsPerPage + cardsPerPage,
  );
  const columnsClass =
    cardsPerPage === 10
      ? "grid-cols-5"
      : cardsPerPage === 6
        ? "grid-cols-3"
        : "grid-cols-2";
  const canSlide = totalPages > 1;

  return (
    <section className="py-20" id="skills">
      <div data-aos="fade-up">
        <SectionHeading centered eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="relative">
        <div className={`grid grid-rows-2 gap-4 ${columnsClass}`}>
          {visibleItems.map((item, index) => {
            const Icon = icons[index] ?? Code2;
            const glow = glows[index % glows.length];

            return (
              <article
                key={item.title || String(index)}
                data-aos="fade-up"
                className="group relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#4a4455]/20 bg-[radial-gradient(circle_at_30%_0%,#25242c_0%,#1a191e_48%,#151418_100%)] p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-700 ease-out hover:-translate-y-1.5 hover:border-[#7c3aed]/35"
              >
                <div
                  className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl transition-transform duration-700 ease-out group-hover:scale-110 ${glow}`}
                />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="relative z-10 mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-[#f8f9ff] to-[#e8ecff] shadow-[0_18px_42px_rgba(0,0,0,0.26)] transition-transform duration-700 ease-out group-hover:scale-105">
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
                <h4 className="relative z-10 text-base font-semibold tracking-tight text-[#f5f3ff]">
                  {item.title}
                </h4>
              </article>
            );
          })}
        </div>

        {canSlide ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={String(index)}
                  aria-label={`Go to skills page ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === safePage ? "w-6 bg-[#b79cff]" : "w-2 bg-[#4a4455]"
                  }`}
                  onClick={() => setPage(index)}
                  type="button"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Previous skills"
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/30 bg-[#18171d]/90 text-[#d9d3ea] backdrop-blur hover:border-[#7c3aed]/40 hover:text-white"
                onClick={() =>
                  setPage((prev) => (prev - 1 + totalPages) % totalPages)
                }
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next skills"
                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/30 bg-[#18171d]/90 text-[#d9d3ea] backdrop-blur hover:border-[#7c3aed]/40 hover:text-white"
                onClick={() => setPage((prev) => (prev + 1) % totalPages)}
                type="button"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
