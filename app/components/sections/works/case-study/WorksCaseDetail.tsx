"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, GitBranch, Calendar, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { adminApi } from "@/lib/admin-api";
import { isHttpUrl, resolveAssetUrl, resolveAssetUrls } from "@/lib/asset-url";
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
  const fromImages = resolveAssetUrls(
    project.images.filter((image) => typeof image === "string" && image.trim().length > 0),
  );
  const coverImage = resolveAssetUrl(project.image);
  const cover = coverImage ? [coverImage] : [];
  return Array.from(new Set([...cover, ...fromImages]));
}

export default function WorksCaseDetail({ slug }: WorksCaseDetailProps) {
  const locale = useLocale();
  const t = useTranslations("Portfolio.projectDetail");
  const [project, setProject] = useState<ProjectContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      <section className="min-h-[60vh] py-24" data-aos="fade-up">
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-12 space-y-4">
            <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-[60vh] py-24" data-aos="fade-up">
        <div className="mx-auto max-w-5xl px-6">
          <Link
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#a78bfa] transition-colors hover:text-[#c4b5fd]"
            href={`/${locale}`}
          >
            <ArrowLeft size={16} />
            {t("backToHome")}
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white">{t("notFoundTitle")}</h1>
          <p className="mt-4 text-lg text-white/60">{t("notFoundDescription")}</p>
        </div>
      </section>
    );
  }

  const hasLinks = project.projectUrl || project.repoUrl;

  return (
    <section className="pb-32 pt-8">
      {/* Back Link */}
      <Link
        className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
        href={`/${locale}#projects`}
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {t("backToProjects")}
      </Link>

      {/* Hero Section - Clean & Modern */}
      <div className="mb-12" data-aos="fade-up">
        {heroImage ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-white/5 md:aspect-[21/9]">
            <Image
              alt={`${project.title} cover`}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={heroImage}
              unoptimized={isHttpUrl(heroImage)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>
        ) : null}
      </div>

      {/* Content Grid */}
      <div className="mx-auto max-w-5xl px-6 lg:px-0">
        {/* Meta Tags Row */}
        <div className="mb-6 flex flex-wrap items-center gap-3" data-aos="fade-up" data-aos-delay="50">
          {project.tag ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-medium text-[#a78bfa]">
              <Tag size={12} />
              {project.tag}
            </span>
          ) : null}
          {typeof project.index === "number" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/50">
              <Calendar size={12} />
              {t("order", { value: project.index })}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h1
          className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {project.title}
        </h1>

        {/* Description */}
        {project.description?.trim() ? (
          <p
            className="mb-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-xl"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            {project.description.trim()}
          </p>
        ) : null}

        {/* CTA Buttons */}
        {hasLinks ? (
          <div className="mb-16 flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="200">
            {project.projectUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
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
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                href={project.repoUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Github size={16} />
                {t("viewRepository")}
              </a>
            ) : null}
          </div>
        ) : null}

        {/* Image Gallery */}
        {galleryImages.length > 0 ? (
          <div data-aos="fade-up" data-aos-delay="250">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-white/40">Gallery</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((src, index) => (
                <button
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5 transition-transform hover:scale-[1.02]"
                  key={`${src}-${index}`}
                  onClick={() => setSelectedImage(src)}
                  type="button"
                >
                  <Image
                    alt={`${project.title} image ${index + 2}`}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={src}
                    unoptimized={isHttpUrl(src)}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Lightbox Modal */}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedImage(null)}
          tabIndex={0}
          role="dialog"
          aria-label="Image preview"
        >
          <button
            className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            onClick={() => setSelectedImage(null)}
            type="button"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              alt="Preview"
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              src={selectedImage}
              width={1200}
              height={800}
              unoptimized={isHttpUrl(selectedImage)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
