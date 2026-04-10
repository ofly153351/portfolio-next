export type AdminMenuKey = "technical" | "projects" | "portfolioInfo";

export type TechnicalContentItem = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type ProjectContentItem = {
  id: string;
  tag: string;
  title: string;
  description: string;
  image?: string;
  images: string[];
};

export type PortfolioInfoContent = {
  ownerName: string;
  title: string;
  subtitle: string;
  about: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
};

export type AdminContent = {
  technical: TechnicalContentItem[];
  projects: ProjectContentItem[];
  portfolioInfo: PortfolioInfoContent;
};
