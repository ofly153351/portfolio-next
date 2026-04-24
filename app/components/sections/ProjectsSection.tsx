"use client";

import Image from "next/image";
import { ArrowRight, GitFork } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PortfolioProjectItem } from "@/types/portfolio";
import SectionHeading from "../ui/SectionHeading";

type ProjectsSectionProps = {
  items?: PortfolioProjectItem[];
};

const toneClasses = [
  {
    badge: "bg-[#d2bbff]/20 text-[#d2bbff] border-[#d2bbff]/30",
    link: "text-[#d2bbff]",
  },
  {
    badge: "bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/30",
    link: "text-[#adc6ff]",
  },
  {
    badge: "bg-[#cebdff]/20 text-[#cebdff] border-[#cebdff]/30",
    link: "text-[#cebdff]",
  },
] as const;

function normalizeProjects(items?: PortfolioProjectItem[]) {
  if (!items || items.length === 0) return [];

  return [...items]
    .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER))
    .filter((item) => item.title?.trim().length > 0);
}

export default function ProjectsSection({ items }: ProjectsSectionProps) {
  const t = useTranslations("Portfolio.projects");
  const projects = normalizeProjects(items);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-32" id="projects">
      <div data-aos="fade-up">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => {
          const tone = toneClasses[index % toneClasses.length];
          const imageSrc = project.image || project.images?.[0] || "/projects/project-fallback.svg";
          const outbound = project.projectUrl || project.repoUrl || "#";
          const isLocalAsset =
            imageSrc.startsWith("http://localhost:") || imageSrc.startsWith("https://localhost:");

          return (
            <article
              className="group relative h-[420px] overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b]"
              data-aos="fade-up"
              data-aos-delay={Math.min(240, index * 60)}
              key={project.id || `${project.title}-${index}`}
            >
              <Image
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={imageSrc}
                unoptimized={isLocalAsset}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 space-y-3 p-8">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${tone.badge}`}>
                  {project.tag || t("eyebrow")}
                </span>
                <h4 className="line-clamp-2 text-2xl font-extrabold tracking-tight text-[#f5f3ff]">{project.title}</h4>
                {project.description ? (
                  <p className="line-clamp-3 text-sm text-[#ccc3d8]">{project.description}</p>
                ) : null}

                <div className="flex items-center gap-4 pt-1">
                  {outbound !== "#" ? (
                    <a
                      className={`inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 ${tone.link}`}
                      href={outbound}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {t("viewCaseStudy")}
                      <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
                    </a>
                  ) : (
                    <span className={`inline-flex items-center gap-2 text-sm font-bold opacity-70 ${tone.link}`}>
                      {t("viewCaseStudy")}
                      <ArrowRight size={16} />
                    </span>
                  )}

                  {project.repoUrl ? (
                    <a
                      aria-label={`${project.title} repository`}
                      className="inline-flex items-center text-[#c5bdd8] transition-colors hover:text-white"
                      href={project.repoUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <GitFork size={16} />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
