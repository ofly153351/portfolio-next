"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { FeaturedProject, ProjectCard } from "@/types/works";

export default function WorksProjectGrid() {
  const t = useTranslations("WorksPage.projects");
  const locale = useLocale();
  const featured = t.raw("featured") as FeaturedProject;
  const cards = t.raw("cards") as ProjectCard[];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 md:grid-cols-2">
      <article
        className="group relative overflow-hidden rounded-xl border border-[#4a4455]/10 bg-[#1c1b1b] transition-all duration-500 hover:border-[#d2bbff]/20 md:col-span-2"
        data-aos="fade-up"
      >
        <div className="flex h-full flex-col lg:flex-row">
          <div className="relative h-[400px] overflow-hidden lg:h-auto lg:w-3/5">
            <Image
              alt={featured.alt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              fill
              src={featured.image}
            />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-[#1c1b1b] via-transparent to-transparent lg:block" />
          </div>

          <div className="flex flex-col justify-center p-8 lg:w-2/5 lg:p-12">
            <div className="mb-6 flex gap-2">
              {featured.tags.map((tag, index) => (
                <span
                  key={tag}
                  className={
                    index === 0
                      ? "rounded bg-[#7c3aed]/20 px-2 py-1 text-[10px] tracking-widest text-[#d2bbff]"
                      : "rounded bg-[#0566d9]/20 px-2 py-1 text-[10px] tracking-widest text-[#adc6ff]"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-4 text-3xl font-bold tracking-tight">{featured.title}</h3>
            <p className="mb-8 leading-relaxed text-[#ccc3d8]">{featured.description}</p>
            <Link
              className="inline-flex items-center gap-2 font-semibold text-[#d2bbff] transition-all hover:gap-4"
              href={`/${locale}/works/nova-intelligence`}
            >
              {featured.cta}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>

      {cards.map((card, index) => (
        <article
          key={card.title}
          className="group overflow-hidden rounded-xl border border-[#4a4455]/5 bg-[#1c1b1b] transition-all duration-500 hover:border-[#d2bbff]/20"
          data-aos="fade-up"
          data-aos-delay={80 + index * 70}
        >
          <div className="relative h-64 overflow-hidden">
            <Image
              alt={card.alt}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              fill
              src={card.image}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#131313]/40 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
              <div className="flex gap-4">
                <span className="rounded-full bg-[#353534] p-3 text-[#e5e2e1]">
                  <Eye size={18} />
                </span>
                <span className="rounded-full bg-[#7c3aed] p-3 text-[#ede0ff]">
                  <Link2 size={18} />
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span
                  key={`${card.title}-${tag}`}
                  className="rounded border border-[#4a4455]/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#ccc3d8]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
            <p className="mb-6 text-sm text-[#ccc3d8]">{card.description}</p>
            <button className="border-b border-[#4a4455] pb-1 text-sm font-medium text-[#e5e2e1] transition-colors hover:border-[#d2bbff]" type="button">
              {card.cta}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
