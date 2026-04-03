"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  Code2,
  Cpu,
  Gauge,
  Layers3,
  Network,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CaseStudy, WorksCaseMockProps } from "@/types/works";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function WorksCaseMock({ slug }: WorksCaseMockProps) {
  const t = useTranslations("WorksSlug");
  const locale = useLocale();

  const items = t.raw("items") as Record<string, CaseStudy>;
  const fallback = items["nova-intelligence"];
  const study = items[slug] ?? {
    ...fallback,
    slug,
    hero: {
      ...fallback.hero,
      title: titleFromSlug(slug),
    },
  };

  const architectureIconMap = {
    memory: Cpu,
    layers: Layers3,
    hub: Network,
    cloud_sync: Cloud,
  };

  const architectureToneMap = {
    primary: "text-[#d2bbff]",
    secondary: "text-[#adc6ff]",
    tertiary: "text-[#cebdff]",
    muted: "text-[#ebe1ff]",
  };

  const featureIconMap = {
    bolt: Zap,
    lan: Workflow,
    security: ShieldCheck,
    auto_mode: Gauge,
  };

  const featureToneMap = {
    primary: "text-[#d2bbff]",
    secondary: "text-[#adc6ff]",
    tertiary: "text-[#cebdff]",
    muted: "text-[#d2bbff]",
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] antialiased selection:bg-[#7c3aed] selection:text-[#ede0ff]">
      <nav
        className="fixed top-0 z-50 w-full border-b border-stone-800/20 bg-stone-950/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(124,58,237,0.04)]"
        data-aos="fade-down"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <Link className="text-xl font-bold tracking-tighter text-stone-200" href={`/${locale}`}>
            {study.nav.brand}
          </Link>
          <div className="hidden gap-8 text-sm font-medium tracking-tight md:flex">
            <Link className="border-b-2 border-violet-500 pb-1 text-stone-100" href={`/${locale}/works`}>
              {study.nav.work}
            </Link>
            <Link className="text-stone-400 transition-colors hover:text-stone-200" href={`/${locale}#experience`}>
              {study.nav.about}
            </Link>
            <Link className="text-stone-400 transition-colors hover:text-stone-200" href="#contact">
              {study.nav.contact}
            </Link>
          </div>
          <button
            className="rounded-xl bg-[#7c3aed] px-5 py-2 text-sm font-semibold text-[#ede0ff] transition-all duration-200 hover:bg-violet-600 active:scale-95"
            type="button"
          >
            {study.nav.resume}
          </button>
        </div>
      </nav>

      <main className="pb-20 pt-24">
        <header
          className="relative flex min-h-[819px] flex-col items-center justify-center overflow-hidden px-6 text-center"
          data-aos="fade-up"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_70%)]" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#d2bbff] opacity-80">{study.hero.eyebrow}</p>
            <h1 className="mb-6 text-5xl font-black tracking-tighter text-[#e5e2e1] [text-shadow:0_0_30px_rgba(124,58,237,0.3)] md:text-7xl lg:text-8xl">
              {study.hero.title}
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-xl font-medium leading-relaxed tracking-tight text-[#ccc3d8] md:text-2xl">
              {study.hero.subtitle}
            </p>
            <div className="group relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] shadow-2xl backdrop-blur-xl">
              <Image
                alt={study.hero.alt}
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                fill
                src={study.hero.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-40" />
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-8 py-24 lg:grid-cols-12" data-aos="fade-up">
          <div className="space-y-16 lg:col-span-7">
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#d2bbff]">
                <span className="h-px w-8 bg-[#d2bbff]/30" /> {study.overview.challengeTitle}
              </h2>
              <p className="text-xl font-light leading-relaxed text-[#ccc3d8]">{study.overview.challengeBody}</p>
            </div>
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#d2bbff]">
                <span className="h-px w-8 bg-[#d2bbff]/30" /> {study.overview.solutionTitle}
              </h2>
              <p className="text-xl font-light leading-relaxed text-[#ccc3d8]">{study.overview.solutionBody}</p>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] p-10 backdrop-blur-xl lg:col-span-5" data-aos="fade-left">
            <h3 className="mb-8 text-lg font-bold tracking-tight text-[#e5e2e1]">{study.overview.architectureTitle}</h3>
            <div className="space-y-8">
              {study.overview.architecture.map((item) => {
                const Icon = architectureIconMap[item.icon];
                const toneClass = architectureToneMap[item.tone];

                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a2a2a] ${toneClass}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e5e2e1]">{item.title}</h4>
                      <p className="mt-1 text-xs leading-normal text-[#ccc3d8]">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="mb-24 bg-[#1c1b1b] py-24" data-aos="fade-up">
          <div className="mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
              {study.metrics.items.map((item) => {
                const tone =
                  item.tone === "primary" ? "text-[#d2bbff]" : item.tone === "secondary" ? "text-[#adc6ff]" : "text-[#cebdff]";

                return (
                  <div key={item.label} className="space-y-2">
                    <div className={`text-6xl font-black tracking-tighter ${tone}`}>{item.value}</div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-7xl px-8" data-aos="fade-up">
          <h2 className="mb-16 text-3xl font-black tracking-tighter">{study.accomplishments.title}</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {study.accomplishments.items.map((item, index) => {
              const Icon = featureIconMap[item.icon];
              const toneClass = featureToneMap[item.tone];

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] p-10 backdrop-blur-xl transition-all duration-300 hover:bg-[#2a2a2a]"
                  data-aos="fade-up"
                  data-aos-delay={index * 60}
                >
                  <Icon className={`mb-6 ${toneClass}`} size={34} />
                  <h3 className="mb-4 text-xl font-bold">{item.title}</h3>
                  <p className="leading-relaxed text-[#ccc3d8]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-7xl px-8" data-aos="fade-up">
          <h2 className="mb-12 text-center text-sm font-bold uppercase tracking-widest text-[#ccc3d8]">{study.gallery.title}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group overflow-hidden rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] md:col-span-2 md:row-span-2">
              <Image
                alt={study.gallery.images[0].alt}
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                height={980}
                src={study.gallery.images[0].image}
                width={1600}
              />
            </div>
            <div className="group aspect-square overflow-hidden rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)]">
              <Image
                alt={study.gallery.images[1].alt}
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                height={800}
                src={study.gallery.images[1].image}
                width={800}
              />
            </div>
            <div className="group aspect-square overflow-hidden rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)]">
              <Image
                alt={study.gallery.images[2].alt}
                className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                height={800}
                src={study.gallery.images[2].image}
                width={800}
              />
            </div>
            <div className="group h-64 overflow-hidden rounded-2xl border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] md:col-span-3">
              <Image
                alt={study.gallery.images[3].alt}
                className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                height={500}
                src={study.gallery.images[3].image}
                width={1800}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-8 py-32 text-center" data-aos="zoom-in">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#4a4455]/15 bg-[rgba(28,27,27,0.6)] p-16 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 to-transparent" />
            <h2 className="relative z-10 mb-8 text-4xl font-black tracking-tighter md:text-5xl">{study.cta.title}</h2>
            <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] px-8 py-4 font-bold transition-all hover:brightness-110 active:scale-95"
                href="#"
              >
                <Code2 size={18} /> {study.cta.viewGithub}
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#4a4455]/20 bg-[#2a2a2a] px-8 py-4 font-bold transition-all hover:bg-[#3a3939] active:scale-95"
                href={`/${locale}/works`}
              >
                <ArrowLeft size={18} /> {study.cta.backToProjects}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="w-full bg-stone-950 pb-10 pt-20" data-aos="fade-up">
        <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <div className="text-lg font-black uppercase tracking-tighter text-stone-200">{study.footer.brand}</div>
          <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest">
            <Link className="text-stone-500 opacity-80 transition-colors hover:text-violet-400 hover:opacity-100" href="#">
              {study.footer.github}
            </Link>
            <Link className="text-stone-500 opacity-80 transition-colors hover:text-violet-400 hover:opacity-100" href="#">
              {study.footer.linkedin}
            </Link>
            <Link className="text-stone-500 opacity-80 transition-colors hover:text-violet-400 hover:opacity-100" href="#">
              {study.footer.twitter}
            </Link>
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-500">{study.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
