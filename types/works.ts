export type FilterItem = {
  label: string;
  active?: boolean;
};

export type FeaturedProject = {
  tags: string[];
  title: string;
  description: string;
  image: string;
  alt: string;
  cta: string;
};

export type ProjectCard = {
  tags: string[];
  title: string;
  description: string;
  image: string;
  alt: string;
  cta: string;
};

export type ArchitectureIcon = "memory" | "layers" | "hub" | "cloud_sync";
export type WorksTone = "primary" | "secondary" | "tertiary" | "muted";
export type MetricTone = "primary" | "secondary" | "tertiary";
export type FeatureIcon = "bolt" | "lan" | "security" | "auto_mode";

export type ArchitectureItem = {
  icon: ArchitectureIcon;
  title: string;
  description: string;
  tone: WorksTone;
};

export type MetricItem = {
  value: string;
  label: string;
  tone: MetricTone;
};

export type FeatureItem = {
  icon: FeatureIcon;
  title: string;
  description: string;
  tone: WorksTone;
};

export type GalleryImage = {
  image: string;
  alt: string;
};

export type CaseStudy = {
  slug: string;
  nav: {
    brand: string;
    work: string;
    about: string;
    contact: string;
    resume: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    alt: string;
  };
  overview: {
    challengeTitle: string;
    challengeBody: string;
    solutionTitle: string;
    solutionBody: string;
    architectureTitle: string;
    architecture: ArchitectureItem[];
  };
  metrics: {
    items: MetricItem[];
  };
  accomplishments: {
    title: string;
    items: FeatureItem[];
  };
  gallery: {
    title: string;
    images: GalleryImage[];
  };
  cta: {
    title: string;
    viewGithub: string;
    backToProjects: string;
  };
  footer: {
    brand: string;
    github: string;
    linkedin: string;
    twitter: string;
    copyright: string;
  };
};

export type WorksCaseMockProps = {
  slug: string;
};
