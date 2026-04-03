"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProjectItem, ProjectTone } from "@/types/portfolio";
import SectionHeading from "../ui/SectionHeading";

function toneClasses(tone: ProjectTone) {
  if (tone === "secondary") {
    return {
      badge: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30",
      link: "text-[#adc6ff]",
    };
  }

  if (tone === "tertiary") {
    return {
      badge: "bg-[#cebdff]/20 text-[#cebdff] border-[#cebdff]/30",
      link: "text-[#cebdff]",
    };
  }

  return {
    badge: "bg-[#d2bbff]/20 text-[#d2bbff] border-[#d2bbff]/30",
    link: "text-[#d2bbff]",
  };
}

export default function ProjectsSection() {
  const t = useTranslations("Portfolio.projects");
  const items = t.raw("items") as ProjectItem[];
  const first = items[0];
  const second = items[1];
  const third = items[2];

  return (
    <section className="py-32" id="projects">
      <div data-aos="fade-up">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article className="group relative h-[500px] overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] md:col-span-2" data-aos="fade-up" data-aos-delay="50">
          <Image alt={first.alt} className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105" fill src={first.image} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 space-y-4 p-10">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${toneClasses(first.tone).badge}`}>
              {first.tag}
            </span>
            <h4 className="text-3xl font-extrabold tracking-tight">{first.title}</h4>
            <p className="max-w-md text-[#ccc3d8]">{first.description}</p>
            <button className={`inline-flex items-center gap-2 text-sm font-bold ${toneClasses(first.tone).link}`} type="button">
              {t("viewCaseStudy")} <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
            </button>
          </div>
        </article>

        <article className="group relative h-[500px] overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b]" data-aos="fade-up" data-aos-delay="120">
          <Image alt={second.alt} className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105" fill src={second.image} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 space-y-4 p-10">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${toneClasses(second.tone).badge}`}>
              {second.tag}
            </span>
            <h4 className="text-2xl font-extrabold tracking-tight">{second.title}</h4>
            <p className="text-sm text-[#ccc3d8]">{second.description}</p>
            <button className={`inline-flex items-center gap-2 text-sm font-bold ${toneClasses(second.tone).link}`} type="button">
              {t("viewCaseStudy")} <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
            </button>
          </div>
        </article>

        <article className="group relative h-[400px] overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] md:col-span-3" data-aos="fade-up" data-aos-delay="180">
          <Image alt={third.alt} className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-105" fill src={third.image} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-12">
            <div className="max-w-xl space-y-4">
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${toneClasses(third.tone).badge}`}>
                {third.tag}
              </span>
              <h4 className="text-3xl font-extrabold tracking-tight">{third.title}</h4>
              <p className="text-[#ccc3d8]">{third.description}</p>
              <button className={`inline-flex items-center gap-2 text-sm font-bold ${toneClasses(third.tone).link}`} type="button">
                {t("viewCaseStudy")} <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
