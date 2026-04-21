"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { HeroContent, SkillItem } from "@/types/portfolio";
import HeroSection from "./HeroSection";
import SkillsSection from "./SkillsSection";

type LandingIntroClientProps = {
  locale: string;
};

export default function LandingIntroClient({ locale }: LandingIntroClientProps) {
  const [heroContent, setHeroContent] = useState<HeroContent | undefined>(undefined);
  const [skillItems, setSkillItems] = useState<SkillItem[] | undefined>(undefined);

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
        }));
        setSkillItems(mappedSkills.length > 0 ? mappedSkills : undefined);
      } catch {
        if (!active) return;
        setHeroContent(undefined);
        setSkillItems(undefined);
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
    </>
  );
}
