"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { ProjectContentItem } from "@/types/admin";
import type { HeroContent, PortfolioProjectItem, SkillItem } from "@/types/portfolio";
import HeroSection from "./HeroSection";
import ProjectsSection from "./ProjectsSection";
import SkillsSection from "./SkillsSection";

type LandingIntroClientProps = {
  locale: string;
};

function mapProjects(items?: ProjectContentItem[]): PortfolioProjectItem[] | undefined {
  if (!items || items.length === 0) return undefined;

  const mapped = [...items]
    .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER))
    .filter((item) => item.title?.trim().length > 0)
    .map((item) => ({
      id: item.id,
      index: item.index,
      tag: item.tag ?? "",
      title: item.title,
      description: item.description ?? "",
      repoUrl: item.repoUrl ?? "",
      projectUrl: item.projectUrl ?? "",
      image: item.image ?? "",
      images: item.images ?? [],
    }));

  return mapped.length > 0 ? mapped : undefined;
}

export default function LandingIntroClient({ locale }: LandingIntroClientProps) {
  const [heroContent, setHeroContent] = useState<HeroContent | undefined>(undefined);
  const [skillItems, setSkillItems] = useState<SkillItem[] | undefined>(undefined);
  const [projectItems, setProjectItems] = useState<PortfolioProjectItem[] | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const normalizedLocale = locale.startsWith("th") ? "th" : "en";

    const load = async () => {
      try {
        const response = await adminApi.getPublicContent(normalizedLocale);
        const content = response.data?.content;
        if (!active || !content) return;

        setHeroContent({
          ownerName: content.portfolioInfo?.ownerName ?? "",
          subtitle: content.portfolioInfo?.subtitle ?? "",
          about: content.portfolioInfo?.about ?? "",
        });

        const mappedSkills = (content.technical ?? []).map((item) => ({
          title: item.title,
          description: item.description,
          icon: item.icon,
        }));
        setSkillItems(mappedSkills.length > 0 ? mappedSkills : undefined);
        setProjectItems(mapProjects(content.projects));
      } catch {
        if (!active) return;
        setHeroContent(undefined);
        setSkillItems(undefined);
        setProjectItems(undefined);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <>
      <HeroSection content={heroContent} />
      <SkillsSection items={skillItems} />
      <ProjectsSection items={projectItems} />
    </>
  );
}
