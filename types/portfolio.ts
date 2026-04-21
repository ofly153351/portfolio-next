export type SkillItem = {
  title: string;
  description: string;
};

export type HeroContent = {
  ownerName: string;
  subtitle: string;
  about: string;
};

export type ProjectTone = "primary" | "secondary" | "tertiary";

export type ProjectItem = {
  tag: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  tone: ProjectTone;
};

export type ArchitectureList = {
  items: string[];
};
