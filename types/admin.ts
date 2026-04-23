export type AdminMenuKey = "dashboard" | "technical" | "projects" | "portfolioInfo";

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
  projectUrl?: string;
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
  github: string;
  linkedin: string;
  instagram: string;
};

export type AdminContent = {
  technical: TechnicalContentItem[];
  projects: ProjectContentItem[];
  portfolioInfo: PortfolioInfoContent;
};

export type AdminUiState = "idle" | "loading" | "success" | "error";

export type ProjectFormState = {
  title: string;
  url: string;
  description: string;
  tag: string;
  images: string[];
};

export type TechnicalFormState = {
  title: string;
  description: string;
  icon: string;
};
