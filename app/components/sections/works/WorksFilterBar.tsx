"use client";

import { useTranslations } from "next-intl";
import type { FilterItem } from "@/types/works";

export default function WorksFilterBar() {
  const t = useTranslations("WorksPage.filters");
  const items = t.raw("items") as FilterItem[];

  return (
    <section className="mx-auto mb-12 max-w-7xl px-8" data-aos="fade-up" data-aos-delay="70">
      <div className="flex flex-wrap items-center gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            className={
              item.active
                ? "rounded-full border border-[#4a4455]/20 bg-[#2a2a2a] px-6 py-2.5 text-sm font-medium text-[#e5e2e1] transition-all hover:border-[#d2bbff]/50"
                : "rounded-full border border-[#4a4455]/10 bg-transparent px-6 py-2.5 text-sm font-medium text-[#ccc3d8] transition-all hover:bg-[#1c1b1b] hover:text-[#e5e2e1]"
            }
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
