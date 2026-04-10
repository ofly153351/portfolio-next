"use client";

import axios from "axios";
import {
  Bell,
  CheckCircle2,
  FolderKanban,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  Layers3,
  Link2,
  Loader2,
  LogOut,
  OctagonAlert,
  Pencil,
  PlusSquare,
  Search,
  Settings,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminApi, type ApiLocale } from "@/lib/admin-api";
import type {
  AdminContent,
  AdminMenuKey,
  PortfolioInfoContent,
  ProjectContentItem,
  TechnicalContentItem,
} from "@/types/admin";
import type { ProjectItem, SkillItem } from "@/types/portfolio";
import AdminDashboardMock from "./AdminDashboardMock";

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLocale(locale: string): ApiLocale {
  return locale.startsWith("th") ? "th" : "en";
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeTechnicalIcon(icon?: string): string | undefined {
  if (!icon) return undefined;
  const nextIcon = icon.trim();
  if (!nextIcon) return undefined;
  return isHttpUrl(nextIcon) ? nextIcon : undefined;
}

function isPortfolioInfo(value: unknown): value is PortfolioInfoContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return [
    "ownerName",
    "title",
    "subtitle",
    "about",
    "contactEmail",
    "contactPhone",
    "location",
  ].every((key) => typeof candidate[key] === "string");
}

function isTechnicalArray(value: unknown): value is TechnicalContentItem[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.description === "string" &&
      (typeof item.icon === "undefined" || typeof item.icon === "string"),
  );
}

function normalizeProjectItem(raw: unknown): ProjectContentItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const imagesFromArray = Array.isArray(item.images)
    ? item.images.filter((image): image is string => typeof image === "string")
    : [];
  const singleImage = typeof item.image === "string" && item.image ? [item.image] : [];
  const images = imagesFromArray.length > 0 ? imagesFromArray : singleImage;

  if (
    typeof item.id !== "string" ||
    typeof item.tag !== "string" ||
    typeof item.title !== "string" ||
    typeof item.description !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    tag: item.tag,
    title: item.title,
    description: item.description,
    image: typeof item.image === "string" ? item.image : images[0],
    images,
  };
}

function sanitizeContentForSave(content: AdminContent): AdminContent {
  return {
    ...content,
    technical: content.technical.map((item) => ({
      ...item,
      icon: normalizeTechnicalIcon(item.icon),
    })),
    projects: content.projects.map((project) => {
      const normalizedImages = project.images
        .map((image) => image.trim())
        .filter((image) => image && isHttpUrl(image));

      const fallbackImage =
        project.image && isHttpUrl(project.image) ? project.image : undefined;
      const primaryImage = normalizedImages[0] ?? fallbackImage;
      const images = primaryImage
        ? Array.from(new Set([primaryImage, ...normalizedImages]))
        : normalizedImages;

      return {
        ...project,
        image: primaryImage,
        images,
      };
    }),
  };
}

export default function BackofficePanel() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Backoffice");
  const tPortfolioSkills = useTranslations("Portfolio.skills");
  const tPortfolioProjects = useTranslations("Portfolio.projects");
  const tPortfolioHero = useTranslations("Portfolio.hero");
  const tPortfolioNav = useTranslations("Portfolio.nav");

  const technicalSeed = tPortfolioSkills.raw("items") as SkillItem[];
  const projectsSeed = tPortfolioProjects.raw("items") as ProjectItem[];

  const fallbackContent = useMemo<AdminContent>(
    () => ({
      technical: technicalSeed.map((item) => ({
        id: makeId("tech"),
        title: item.title,
        description: item.description,
        icon: "",
      })),
      projects: projectsSeed.map((item) => ({
        id: makeId("project"),
        tag: item.tag,
        title: item.title,
        description: item.description,
        image: item.image,
        images: item.image ? [item.image] : [],
      })),
      portfolioInfo: {
        ownerName: tPortfolioHero("name"),
        title: tPortfolioNav("brand"),
        subtitle: tPortfolioHero("subtitle"),
        about: tPortfolioHero("description"),
        contactEmail: "",
        contactPhone: "",
        location: "",
      },
    }),
    [projectsSeed, tPortfolioHero, tPortfolioNav, technicalSeed],
  );

  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>("dashboard");
  const [content, setContent] = useState<AdminContent>(fallbackContent);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState(t("status.loading"));
  const [isBusy, setIsBusy] = useState(false);
  const [uiState, setUiState] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [search, setSearch] = useState("");

  const [projectForm, setProjectForm] = useState({
    title: "",
    url: "",
    description: "",
    tag: "AI",
    images: [] as string[],
  });

  const [technicalForm, setTechnicalForm] = useState({
    title: "",
    description: "",
    icon: "",
  });

  const apiLocale = normalizeLocale(locale);

  const menuLabels: Record<AdminMenuKey, string> = {
    dashboard: "Dashboard",
    technical: t("menu.technical"),
    projects: t("menu.projects"),
    portfolioInfo: t("menu.portfolioInfo"),
  };

  const filteredProjects = content.projects.filter((project) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      project.title.toLowerCase().includes(keyword) ||
      project.description.toLowerCase().includes(keyword) ||
      project.tag.toLowerCase().includes(keyword)
    );
  });

  const filteredTechnical = content.technical.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    );
  });

  const loadContent = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.loading"));

    try {
      const response = await adminApi.getContent(apiLocale);
      const nextContent = response.data?.content;

      if (nextContent && typeof nextContent === "object") {
        const parsed = nextContent as Record<string, unknown>;
        const normalizedProjects = Array.isArray(parsed.projects)
          ? parsed.projects
              .map(normalizeProjectItem)
              .filter((item): item is ProjectContentItem => item !== null)
          : [];

        const contentFromApi: AdminContent = {
          technical: isTechnicalArray(parsed.technical)
            ? parsed.technical
            : fallbackContent.technical,
          projects:
            normalizedProjects.length > 0
              ? normalizedProjects
              : fallbackContent.projects,
          portfolioInfo: isPortfolioInfo(parsed.portfolioInfo)
            ? parsed.portfolioInfo
            : fallbackContent.portfolioInfo,
        };

        setContent(contentFromApi);
      }

      try {
        const technicalResponse = await adminApi.getTechnical(apiLocale);
        if (Array.isArray(technicalResponse.data?.items)) {
          setContent((prev) => ({
            ...prev,
            technical: technicalResponse.data.items.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              icon: item.icon,
            })),
          }));
          setVersion(technicalResponse.data?.version ?? response.data?.version);
        }
      } catch {
        setVersion(response.data?.version);
      }

      setStatus(t("status.loaded"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.loadFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await adminApi.me();
        if (!active) return;
        await loadContent();
      } catch {
        if (!active) return;
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLocale, locale, router]);

  const createProject = async () => {
    const title = projectForm.title.trim();
    if (!title) {
      setUiState("error");
      setStatus(t("status.saveFailed"));
      return;
    }

    const url = projectForm.url.trim();
    const normalizedUrl = url && isHttpUrl(url) ? url : "";

    const payloadProject: ProjectContentItem = {
      id: makeId("project"),
      tag: projectForm.tag.trim() || "GENERAL",
      title,
      description: projectForm.description.trim(),
      image: normalizedUrl || projectForm.images[0],
      images: Array.from(
        new Set([
          ...(normalizedUrl ? [normalizedUrl] : []),
          ...projectForm.images.filter((image) => isHttpUrl(image)),
        ]),
      ),
    };

    const nextContent: AdminContent = {
      ...content,
      projects: [payloadProject, ...content.projects],
    };

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      const sanitized = sanitizeContentForSave(nextContent);
      const response = await adminApi.saveContent(apiLocale, {
        version,
        content: sanitized,
      });

      setContent(sanitized);
      setVersion(response.data?.version ?? version);
      setProjectForm({
        title: "",
        url: "",
        description: "",
        tag: "AI",
        images: [],
      });
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.saveFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteProject = async (id: string) => {
    const nextContent: AdminContent = {
      ...content,
      projects: content.projects.filter((project) => project.id !== id),
    };

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      const sanitized = sanitizeContentForSave(nextContent);
      const response = await adminApi.saveContent(apiLocale, {
        version,
        content: sanitized,
      });
      setContent(sanitized);
      setVersion(response.data?.version ?? version);
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.saveFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const uploadProjectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.uploading"));

    try {
      const response = await adminApi.uploadMany(Array.from(files));
      const uploadedUrls = response.data.urls?.length
        ? response.data.urls
        : response.data.url
          ? [response.data.url]
          : [];

      if (uploadedUrls.length === 0) {
        setUiState("error");
        setStatus(t("status.uploadFailed"));
        return;
      }

      setProjectForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      setStatus(t("status.uploaded"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setUiState("error");
      setStatus(t("status.uploadFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const createTechnical = async () => {
    const title = technicalForm.title.trim();
    if (!title) {
      setUiState("error");
      setStatus(t("status.saveFailed"));
      return;
    }

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      await adminApi.createTechnical(apiLocale, {
        title,
        description: technicalForm.description.trim(),
        icon: normalizeTechnicalIcon(technicalForm.icon),
      });
      const technicalResponse = await adminApi.getTechnical(apiLocale);
      setContent((prev) => ({
        ...prev,
        technical: technicalResponse.data.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
        })),
      }));
      setVersion(technicalResponse.data.version ?? version);
      setTechnicalForm({ title: "", description: "", icon: "" });
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.saveFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const uploadTechnicalIcon = async (file: File | null) => {
    if (!file) return;

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.uploading"));

    try {
      const response = await adminApi.upload(file);
      const iconUrl = response.data.url ?? response.data.urls?.[0] ?? "";
      if (!iconUrl) {
        setUiState("error");
        setStatus(t("status.uploadFailed"));
        return;
      }
      setTechnicalForm((prev) => ({ ...prev, icon: iconUrl }));
      setUiState("success");
      setStatus(t("status.uploaded"));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setUiState("error");
      setStatus(t("status.uploadFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const deleteTechnical = async (id: string) => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      const response = await adminApi.deleteTechnical(apiLocale, id);
      setVersion(response.data.version ?? version);
      setContent((prev) => ({
        ...prev,
        technical: prev.technical.filter((item) => item.id !== id),
      }));
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.saveFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      router.replace(`/${locale}/admin/login`);
    }
  };

  const showProjectForm = activeMenu === "projects";
  const showTechnicalForm = activeMenu === "technical";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#131313] text-[#e5e2e1]">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-[#4a4455]/15 bg-[#1c1b1b] p-6 text-sm lg:flex">
        <div className="text-xl font-black">{t("title")}</div>
        <div className="mb-8 mt-8 flex items-center gap-3 rounded-xl bg-[#2a2a2a]/50 p-3">
          <div className="h-10 w-10 rounded-full border border-[#4a4455]/30 bg-[#2a2a2a]" />
          <div>
            <p className="font-bold">The Architect</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#ccc3d8]">Digital Portfolio CMS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
              activeMenu === "dashboard"
                ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
                : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
            }`}
            onClick={() => setActiveMenu("dashboard")}
            type="button"
          >
            <LayoutDashboard size={18} />
            <span className={activeMenu === "dashboard" ? "font-semibold" : ""}>{menuLabels.dashboard}</span>
          </button>
          <button
            className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
              activeMenu === "projects"
                ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
                : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
            }`}
            onClick={() => setActiveMenu("projects")}
            type="button"
          >
            <FolderKanban size={18} />
            <span className={activeMenu === "projects" ? "font-semibold" : ""}>{menuLabels.projects}</span>
          </button>
          <button
            className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
              activeMenu === "technical"
                ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
                : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
            }`}
            onClick={() => setActiveMenu("technical")}
            type="button"
          >
            <Layers3 size={18} />
            <span className={activeMenu === "technical" ? "font-semibold" : ""}>{menuLabels.technical}</span>
          </button>
          <button
            className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
              activeMenu === "portfolioInfo"
                ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
                : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
            }`}
            onClick={() => setActiveMenu("portfolioInfo")}
            type="button"
          >
            <Globe2 size={18} />
            <span className={activeMenu === "portfolioInfo" ? "font-semibold" : ""}>{menuLabels.portfolioInfo}</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2 border-t border-[#4a4455]/15 pt-6">
          <button
            className="admin-btn-smooth mb-4 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-2.5 text-xs font-bold tracking-tight text-white"
            onClick={() => setActiveMenu("projects")}
            type="button"
          >
            Create New Project
          </button>
          <button className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]" type="button">
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
          <button
            className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
            onClick={logout}
            type="button"
          >
            <LogOut size={18} />
            <span>{t("actions.logout")}</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[280px]">
        <header className="fixed right-0 top-0 z-40 h-16 w-full border-b border-[#4a4455]/15 bg-[#131313]/70 px-4 backdrop-blur-xl lg:w-[calc(100%-280px)] lg:px-8">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8]" size={16} />
              <input
                className="w-56 rounded-full border-none bg-[#1c1b1b] py-1.5 pl-9 pr-4 text-sm text-[#e5e2e1] placeholder:text-[#4a4455] focus:ring-1 focus:ring-[#7c3aed] md:w-64"
                onChange={(event) => setSearch(event.target.value)}
                placeholder={activeMenu === "technical" ? "Search technical..." : "Search projects..."}
                type="text"
                value={search}
              />
            </div>
            <div className="flex items-center gap-4 text-[#ccc3d8]">
              <Bell className="cursor-pointer transition-colors hover:text-[#7c3aed]" size={18} />
              <Settings className="cursor-pointer transition-colors hover:text-[#7c3aed]" size={18} />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-10">
          {activeMenu === "dashboard" ? <AdminDashboardMock /> : null}

          {activeMenu !== "dashboard" ? (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter">
                    {activeMenu === "technical" ? "Technical Repository" : "Project Repository"}
                  </h1>
                  <p className="mt-2 text-lg font-light text-[#ccc3d8]">
                    {activeMenu === "technical"
                      ? "Manage stack items and icon assets from MinIO."
                      : "Architecting digital experiences through precise engineering."}
                  </p>
                </div>
                <div className="rounded-xl border border-[#4a4455]/10 bg-[#1c1b1b] px-4 py-2">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#d2bbff]" />
                  <span className="ml-2 text-xs uppercase tracking-widest text-[#ccc3d8]">
                    {isBusy ? "Syncing" : "Live Sync Enabled"}
                  </span>
                </div>
              </div>

              {isBusy ? <div className="admin-loading-bar mb-3" /> : null}
              <div className="mb-6 flex items-center gap-2 text-xs text-[#adc6ff]">
                {uiState === "loading" ? <Loader2 className="animate-spin" size={14} /> : null}
                {uiState === "success" ? <CheckCircle2 size={14} /> : null}
                {uiState === "error" ? <OctagonAlert size={14} /> : null}
                <p>{t("statusLabel", { status })}</p>
              </div>

              <div className="grid grid-cols-12 gap-8">
                <section className="col-span-12 space-y-8 lg:col-span-5">
                  <div className="admin-card-smooth glass-panel relative overflow-hidden rounded-3xl p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#7c3aed]/10 blur-[80px]" />
                    <div className="mb-8 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
                        <PlusSquare size={18} />
                      </div>
                      <h2 className="text-xl font-bold text-[#e5e2e1]">
                        {showTechnicalForm ? "New Technical Item" : "New Project Details"}
                      </h2>
                    </div>

                    {showProjectForm ? (
                      <div className="space-y-6">
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Project Title
                          </label>
                          <input
                            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setProjectForm((prev) => ({ ...prev, title: event.target.value }))
                            }
                            placeholder="E.g. Quantum Analytics Engine"
                            type="text"
                            value={projectForm.title}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Project URL
                          </label>
                          <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]" size={14} />
                            <input
                              className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] py-3 pl-10 pr-4 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                              onChange={(event) =>
                                setProjectForm((prev) => ({ ...prev, url: event.target.value }))
                              }
                              placeholder="https://project-url.com"
                              type="url"
                              value={projectForm.url}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Description
                          </label>
                          <textarea
                            className="w-full resize-none rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                            }
                            placeholder="Briefly describe the architectural vision and technical challenges..."
                            rows={4}
                            value={projectForm.description}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Tag
                          </label>
                          <input
                            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setProjectForm((prev) => ({ ...prev, tag: event.target.value }))
                            }
                            placeholder="AI / INFRA / WEB3"
                            type="text"
                            value={projectForm.tag}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Project Images
                          </label>
                          <label className="admin-btn-smooth inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#4a4455]/40 bg-[#0e0e0e] px-3 py-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#7c3aed]/60">
                            Upload Multiple Images
                            <input
                              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                              className="hidden"
                              multiple
                              onChange={(event) => uploadProjectFiles(event.target.files)}
                              type="file"
                            />
                          </label>
                          {projectForm.images.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {projectForm.images.map((image, index) => (
                                <div key={`${image}-${index}`} className="rounded-lg border border-[#4a4455]/30 bg-[#111114] px-3 py-2 text-xs text-[#adc6ff]">
                                  {image}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <button
                          className="admin-btn-smooth w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-4 text-xs font-bold tracking-widest text-[#e5e2e1] shadow-xl shadow-[#7c3aed]/20 disabled:opacity-60"
                          disabled={isBusy}
                          onClick={createProject}
                          type="button"
                        >
                          DEPLOY TO REPOSITORY
                        </button>
                      </div>
                    ) : null}

                    {showTechnicalForm ? (
                      <div className="space-y-6">
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Technical Title
                          </label>
                          <input
                            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setTechnicalForm((prev) => ({ ...prev, title: event.target.value }))
                            }
                            placeholder="E.g. Redis"
                            type="text"
                            value={technicalForm.title}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Description
                          </label>
                          <textarea
                            className="w-full resize-none rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setTechnicalForm((prev) => ({ ...prev, description: event.target.value }))
                            }
                            placeholder="Cache and memory store"
                            rows={4}
                            value={technicalForm.description}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">
                            Icon URL
                          </label>
                          <input
                            className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                            onChange={(event) =>
                              setTechnicalForm((prev) => ({ ...prev, icon: event.target.value }))
                            }
                            placeholder="https://.../redis.svg"
                            type="url"
                            value={technicalForm.icon}
                          />
                        </div>
                        <label className="admin-btn-smooth inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#4a4455]/40 bg-[#0e0e0e] px-3 py-3 text-xs font-semibold text-[#ccc3d8] hover:border-[#7c3aed]/60">
                          Upload Icon (svg/png)
                          <input
                            accept="image/svg+xml,image/png"
                            className="hidden"
                            onChange={(event) =>
                              uploadTechnicalIcon(event.target.files?.[0] ?? null)
                            }
                            type="file"
                          />
                        </label>
                        <button
                          className="admin-btn-smooth w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-4 text-xs font-bold tracking-widest text-[#e5e2e1] shadow-xl shadow-[#7c3aed]/20 disabled:opacity-60"
                          disabled={isBusy}
                          onClick={createTechnical}
                          type="button"
                        >
                          ADD TO TECHNICAL STACK
                        </button>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="col-span-12 space-y-6 lg:col-span-7">
                  {showProjectForm ? (
                    <>
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                          <h2 className="text-xl font-bold">Active Inventory</h2>
                          <span className="rounded bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-bold text-[#d2bbff]">
                            {filteredProjects.length} TOTAL
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {filteredProjects.map((project) => (
                          <div
                            key={project.id}
                            className="admin-card-smooth glass-panel group flex items-center gap-6 rounded-2xl p-5 transition-all duration-300 hover:bg-[#2a2a2a]/40"
                          >
                            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#4a4455]/20 bg-[#0e0e0e]">
                              {project.images[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={project.title}
                                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                                  src={project.images[0]}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#4a4455]">
                                  <UploadCloud size={18} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h3 className="truncate font-bold text-[#e5e2e1] transition-colors group-hover:text-[#d2bbff]">
                                  {project.title || "Untitled Project"}
                                </h3>
                                <span className="rounded bg-[#0566d9]/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-[#adc6ff]">
                                  {project.tag || "draft"}
                                </span>
                              </div>
                              <p className="mb-3 line-clamp-1 text-xs text-[#ccc3d8]">{project.description || "-"}</p>
                              <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a4455]">
                                {project.images.length} assets
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#7c3aed] hover:text-white"
                                onClick={() =>
                                  setProjectForm({
                                    title: project.title,
                                    url: project.image ?? "",
                                    description: project.description,
                                    tag: project.tag,
                                    images: project.images,
                                  })
                                }
                                type="button"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#93000a] hover:text-white"
                                onClick={() => deleteProject(project.id)}
                                type="button"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {showTechnicalForm ? (
                    <>
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                          <h2 className="text-xl font-bold">Technical Stack</h2>
                          <span className="rounded bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-bold text-[#d2bbff]">
                            {filteredTechnical.length} TOTAL
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {filteredTechnical.map((item) => (
                          <div
                            key={item.id}
                            className="admin-card-smooth glass-panel group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:bg-[#2a2a2a]/40"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#4a4455]/20 bg-[#0e0e0e]">
                              {item.icon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img alt={item.title} className="h-8 w-8 object-contain" src={item.icon} />
                              ) : (
                                <Layers3 size={18} className="text-[#4a4455]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-bold text-[#e5e2e1]">{item.title}</h3>
                              <p className="line-clamp-1 text-xs text-[#ccc3d8]">{item.description || "-"}</p>
                            </div>
                            <button
                              className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#93000a] hover:text-white"
                              onClick={() => deleteTechnical(item.id)}
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </section>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
