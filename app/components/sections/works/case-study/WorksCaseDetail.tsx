"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, GitFork } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { adminApi } from "@/lib/admin-api";
import type { ProjectContentItem } from "@/types/admin";

type WorksCaseDetailProps = {
  slug: string;
};

function normalizeLocale(locale: string) {
  return locale.startsWith("th") ? "th" : "en";
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findProject(items: ProjectContentItem[], slug: string) {
  const decoded = decodeURIComponent(slug);
  return items.find((item) => item.id === decoded || safeSlug(item.title) === decoded || item.title === decoded);
}

function imageSources(project: ProjectContentItem) {
  const fromImages = project.images.filter((image) => typeof image === "string" && image.trim().length > 0);
  const cover = project.image && project.image.trim().length > 0 ? [project.image] : [];
  return Array.from(new Set([...cover, ...fromImages]));
}

function isLocalAsset(src: string) {
  return src.startsWith("http://localhost:") || src.startsWith("https://localhost:");
}

export default function WorksCaseDetail({ slug }: WorksCaseDetailProps) {
  const locale = useLocale();
  const t = useTranslations("Portfolio.projectDetail");
  const [project, setProject] = useState<ProjectContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await adminApi.getPublicContent(normalizeLocale(locale));
        const projects = response.data?.content?.projects ?? [];
        if (!active) return;

        const found = findProject(projects, slug) ?? null;
        setProject(found);
      } catch {
        if (!active) return;
        setProject(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [locale, slug]);

  const images = useMemo(() => (project ? imageSources(project) : []), [project]);
  const heroImage = images[0] || "";
  const galleryImages = images.slice(1);

  if (loading) {
    return (
      <section className="pb-24 pt-8" data-aos="fade-up">
        <p className="text-sm text-[#ccc3d8]">{t("loading")}</p>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="pb-24 pt-8" data-aos="fade-up">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm text-[#d2bbff]" href={`/${locale}`}>
          <ArrowLeft size={16} />
          {t("backToHome")}
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-[#f5f3ff]">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-sm text-[#ccc3d8]">{t("notFoundDescription")}</p>
      </section>
    );
  }

  return (
    <section className="pb-24 pt-8">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm text-[#d2bbff]" href={`/${locale}#projects`}>
        <ArrowLeft size={16} />
        {t("backToProjects")}
      </Link>

      <article className="overflow-hidden rounded-3xl border border-[#4a4455]/20 bg-[#17161b] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <header className="relative min-h-[360px] md:min-h-[460px]" data-aos="fade-up">
          {heroImage ? (
            <Image
              alt={`${project.title} cover`}
              className="absolute inset-0 h-full w-full object-cover"
              fill
              priority
              sizes="100vw"
              src={heroImage}
              unoptimized={isLocalAsset(heroImage)}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.3),transparent_45%),#16151a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111015] via-[#111015]/65 to-transparent" />

          <div className="relative z-10 flex h-full items-end p-6 md:p-10">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {project.tag ? (
                  <span className="rounded-full border border-[#d2bbff]/35 bg-[#d2bbff]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#d2bbff]">
                    {project.tag}
                  </span>
                ) : null}
                {typeof project.index === "number" ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#c9c2da]">
                    {t("order", { value: project.index })}
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#f5f3ff] md:text-5xl">{project.title}</h1>

              <p className="max-w-2xl whitespace-pre-line text-sm leading-7 text-[#d6d0e4] md:text-base">
                {project.description?.trim() || t("noDescription")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {project.projectUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                    href={project.projectUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} />
                    {t("visitProject")}
                  </a>
                ) : null}

                {project.repoUrl ? (
                  <a
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#24222b]/70 px-4 py-2 text-sm font-semibold text-[#e5e2e1] transition-all duration-300 hover:border-[#7c3aed]/40 hover:bg-[#2d2a36]"
                    href={project.repoUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GitFork size={16} />
                    {t("viewRepository")}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {galleryImages.length > 0 ? (
          <section className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="80">
            {galleryImages.map((src, index) => (
              <div
                className={`group relative overflow-hidden rounded-2xl ${index === 0 ? "md:col-span-2 lg:col-span-2 h-[260px] md:h-[320px]" : "h-[220px] md:h-[260px]"}`}
                key={`${src}-${index}`}
              >
                <Image
                  alt={`${project.title} image ${index + 2}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fill
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  src={src}
                  unoptimized={isLocalAsset(src)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-80" />
              </div>
            ))}
          </section>
        ) : null}
      </article>
    </section>
  );
}
