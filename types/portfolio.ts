export type SkillItem = {
  title: string;
  description: string;
  icon?: string;
};

export type HeroContent = {
  ownerName: string;
  subtitle: string;
  about: string;
};

export type PortfolioProjectItem = {
  id?: string;
  index?: number;
  tag: string;
  title: string;
  description: string;
  repoUrl?: string;
  projectUrl?: string;
  image?: string;
  images?: string[];
};

export type ArchitectureList = {
  items: string[];
};
