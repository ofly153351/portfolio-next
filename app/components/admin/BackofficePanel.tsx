"use client";

import axios from "axios";
import {
  CheckCircle2,
  Download,
  FolderKanban,
  History,
  Layers3,
  LayoutDashboard,
  Loader2,
  LogOut,
  OctagonAlert,
  PlusSquare,
  RefreshCcw,
  Rocket,
  Save,
  Search,
  Settings,
  Bell,
  Globe2,
  HelpCircle,
  Pencil,
  Trash2,
  UploadCloud,
  Link2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminApi, type ApiLocale, type ContentHistoryItem } from "@/lib/admin-api";
import type { AdminContent, AdminMenuKey, PortfolioInfoContent, ProjectContentItem, TechnicalContentItem } from "@/types/admin";
import type { ProjectItem, SkillItem } from "@/types/portfolio";
import AdminDashboardMock from "./AdminDashboardMock";
import PortfolioInfoEditor from "./PortfolioInfoEditor";
import ProjectsEditor from "./ProjectsEditor";
import TechnicalEditor from "./TechnicalEditor";

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLocale(locale: string): ApiLocale {
  return locale.startsWith("th") ? "th" : "en";
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

function isProjectsArray(value: unknown): value is ProjectContentItem[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.tag === "string" &&
      typeof item.title === "string" &&
      typeof item.description === "string" &&
      Array.isArray(item.images) &&
      item.images.every((image: unknown) => typeof image === "string"),
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
    images,
  };
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

function isAdminContent(value: unknown): value is AdminContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    isTechnicalArray(candidate.technical) &&
    isProjectsArray(candidate.projects) &&
    isPortfolioInfo(candidate.portfolioInfo)
  );
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
  const [status, setStatus] = useState(t("status.loading"));
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [uiState, setUiState] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [search, setSearch] = useState("");
  const [quickProject, setQuickProject] = useState({
    title: "",
    url: "",
    description: "",
    tag: "AI",
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

  const loadContent = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.loading"));

    try {
      const response = await adminApi.getContent(apiLocale);
      const nextContent = response.data?.content;
      if (isAdminContent(nextContent)) {
        setContent(nextContent);
      } else if (nextContent && typeof nextContent === "object") {
        const parsed = nextContent as Record<string, unknown>;
        const normalizedProjects = Array.isArray(parsed.projects)
          ? parsed.projects.map(normalizeProjectItem).filter((item): item is ProjectContentItem => item !== null)
          : [];

        setContent({
          technical: isTechnicalArray(parsed.technical) ? parsed.technical : fallbackContent.technical,
          projects: normalizedProjects.length > 0 ? normalizedProjects : fallbackContent.projects,
          portfolioInfo: isPortfolioInfo(parsed.portfolioInfo) ? parsed.portfolioInfo : fallbackContent.portfolioInfo,
        });
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
        // keep technical from /api/admin/content as fallback
      }
      setVersion(response.data?.version);
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

  const saveContent = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      const sanitizedContent = {
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

      const response = await adminApi.saveContent(apiLocale, {
        version,
        content: sanitizedContent,
      });
      setVersion(response.data?.version ?? version);
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setStatus(t("status.versionConflict"));
        setUiState("error");
        return;
      }
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

  const publishContent = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.publishing"));

    try {
      await adminApi.publishContent(apiLocale);
      setStatus(t("status.published"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.publishFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const loadHistory = async () => {
    setIsBusy(true);
    setUiState("loading");

    try {
      const response = await adminApi.getHistory(apiLocale);
      setHistoryItems(response.data?.history ?? response.data?.items ?? []);
      setStatus(t("status.historyLoaded"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.historyFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const uploadProjectImages = async (projectId: string, files: FileList | null) => {
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
        setStatus(t("status.uploadFailed"));
        setUiState("error");
        return;
      }

      setContent((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                images: [...project.images, ...uploadedUrls],
                image: project.image || uploadedUrls[0],
              }
            : project,
        ),
      }));
      setUploadedUrl(uploadedUrls[uploadedUrls.length - 1] ?? "");
      setStatus(t("status.uploaded"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.uploadFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const uploadTechnicalIcon = async (technicalId: string, file: File | null) => {
    if (!file) return;
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.uploading"));

    try {
      const response = await adminApi.upload(file);
      const iconUrl = response.data.url ?? response.data.urls?.[0];
      if (!iconUrl) {
        setStatus(t("status.uploadFailed"));
        setUiState("error");
        return;
      }

      setContent((prev) => ({
        ...prev,
        technical: prev.technical.map((item) =>
          item.id === technicalId ? { ...item, icon: iconUrl } : item,
        ),
      }));
      setUploadedUrl(iconUrl);
      setStatus(t("status.uploaded"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        router.replace(`/${locale}/admin/login`);
        return;
      }
      setStatus(t("status.uploadFailed"));
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const createTechnicalItem = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));
    try {
      await adminApi.createTechnical(apiLocale, {
        title: t("technical.defaultTitle"),
        description: t("technical.defaultDescription"),
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

  const saveTechnicalItem = async (id: string) => {
    const item = content.technical.find((entry) => entry.id === id);
    if (!item) return;

    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      await adminApi.updateTechnical(apiLocale, id, {
        title: item.title,
        description: item.description,
        icon: normalizeTechnicalIcon(item.icon),
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

  const removeTechnicalItem = async (id: string) => {
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

  const exportContent = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `portfolio-cms-${apiLocale}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const createQuickProject = () => {
    const title = quickProject.title.trim();
    if (!title) {
      setUiState("error");
      setStatus(t("status.saveFailed"));
      return;
    }

    const url = quickProject.url.trim();
    const isValidUrl = url ? isHttpUrl(url) : false;
    const imageList = isValidUrl ? [url] : [];

    setContent((prev) => ({
      ...prev,
      projects: [
        {
          id: makeId("project"),
          tag: quickProject.tag.trim() || "GENERAL",
          title,
          description: quickProject.description.trim(),
          image: isValidUrl ? url : undefined,
          images: imageList,
        },
        ...prev.projects,
      ],
    }));

    setQuickProject({ title: "", url: "", description: "", tag: "AI" });
    setActiveMenu("projects");
    setUiState("success");
    setStatus(t("status.saved"));
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      router.replace(`/${locale}/admin/login`);
    }
  };

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
            onClick={createQuickProject}
            type="button"
          >
            Create New Project
          </button>
          <button className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]" type="button">
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
          <button className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]" onClick={logout} type="button">
            <LogOut size={18} />
            <span>{t("actions.logout")}</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[280px]">
        <header className="fixed right-0 top-0 z-40 h-16 w-full border-b border-[#4a4455]/15 bg-[#131313]/70 px-4 backdrop-blur-xl lg:w-[calc(100%-280px)] lg:px-8">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8]" size={16} />
              <input
                className="w-56 rounded-full border-none bg-[#1c1b1b] py-1.5 pl-9 pr-4 text-sm text-[#e5e2e1] placeholder:text-[#4a4455] focus:ring-1 focus:ring-[#7c3aed] md:w-64"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects..."
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
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter">Project Repository</h1>
              <p className="mt-2 text-lg font-light text-[#ccc3d8]">Architecting digital experiences through precise engineering.</p>
            </div>
            <div className="rounded-xl border border-[#4a4455]/10 bg-[#1c1b1b] px-4 py-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#d2bbff]" />
              <span className="ml-2 text-xs uppercase tracking-widest text-[#ccc3d8]">Live Sync Enabled</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 space-y-8 lg:col-span-5">
              <div className="admin-card-smooth glass-panel relative overflow-hidden rounded-3xl p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#7c3aed]/10 blur-[80px]" />
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/20 text-[#d2bbff]">
                    <PlusSquare size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-[#e5e2e1]">New Project Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">Project Title</label>
                    <input
                      className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                      onChange={(event) => setQuickProject((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="E.g. Quantum Analytics Engine"
                      type="text"
                      value={quickProject.title}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">Project URL</label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]" size={14} />
                      <input
                        className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] py-3 pl-10 pr-4 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                        onChange={(event) => setQuickProject((prev) => ({ ...prev, url: event.target.value }))}
                        placeholder="https://project-url.com"
                        type="url"
                        value={quickProject.url}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">Description</label>
                    <textarea
                      className="w-full resize-none rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                      onChange={(event) => setQuickProject((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Briefly describe the architectural vision and technical challenges..."
                      rows={4}
                      value={quickProject.description}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccc3d8]">Tag</label>
                    <input
                      className="w-full rounded-xl border border-[#4a4455]/15 bg-[#0e0e0e] px-4 py-3 text-[#e5e2e1] placeholder:text-[#4a4455] transition-all focus:border-transparent focus:ring-2 focus:ring-[#7c3aed]"
                      onChange={(event) => setQuickProject((prev) => ({ ...prev, tag: event.target.value }))}
                      placeholder="AI / INFRA / WEB3"
                      type="text"
                      value={quickProject.tag}
                    />
                  </div>
                  <button
                    className="admin-btn-smooth w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-4 text-xs font-bold tracking-widest text-[#e5e2e1] shadow-xl shadow-[#7c3aed]/20"
                    onClick={createQuickProject}
                    type="button"
                  >
                    DEPLOY TO REPOSITORY
                  </button>
                </div>
              </div>
            </section>

            <section className="col-span-12 space-y-6 lg:col-span-7">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">Active Inventory</h2>
                  <span className="rounded bg-[#2a2a2a] px-2.5 py-0.5 text-[10px] font-bold text-[#d2bbff]">{filteredProjects.length} TOTAL</span>
                </div>
              </div>

              <div className="space-y-4">
                {filteredProjects.slice(0, 6).map((project) => (
                  <div key={project.id} className="admin-card-smooth glass-panel group flex items-center gap-6 rounded-2xl p-5 transition-all duration-300 hover:bg-[#2a2a2a]/40">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#4a4455]/20 bg-[#0e0e0e]">
                      {project.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100" src={project.images[0]} alt={project.title} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#4a4455]">
                          <UploadCloud size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-bold text-[#e5e2e1] transition-colors group-hover:text-[#d2bbff]">{project.title || "Untitled Project"}</h3>
                        <span className="rounded bg-[#0566d9]/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-[#adc6ff]">
                          {project.tag || "draft"}
                        </span>
                      </div>
                      <p className="mb-3 line-clamp-1 text-xs text-[#ccc3d8]">{project.description || "-"}</p>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a4455]">{project.images.length} assets</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#7c3aed] hover:text-white" onClick={() => setActiveMenu("projects")} type="button">
                        <Pencil size={16} />
                      </button>
                      <button
                        className="admin-btn-smooth flex h-10 w-10 items-center justify-center rounded-full border border-[#4a4455]/20 text-[#ccc3d8] hover:bg-[#93000a] hover:text-white"
                        onClick={() =>
                          setContent((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== project.id) }))
                        }
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <section className="admin-card-smooth rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-4 shadow-[0_0_80px_rgba(59,130,246,0.06)] transition-all duration-500 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="admin-btn-smooth inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-[#ede0ff] disabled:opacity-50"
                      disabled={isBusy}
                      onClick={saveContent}
                      type="button"
                    >
                      {isBusy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      {t("actions.save")}
                    </button>
                    <button className="admin-btn-smooth inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50" disabled={isBusy} onClick={loadContent} type="button">
                      <RefreshCcw size={14} />
                      {t("actions.load")}
                    </button>
                    <button className="admin-btn-smooth inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50" disabled={isBusy} onClick={publishContent} type="button">
                      <Rocket size={14} />
                      {t("actions.publish")}
                    </button>
                    <button className="admin-btn-smooth inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50" disabled={isBusy} onClick={loadHistory} type="button">
                      <History size={14} />
                      {t("actions.history")}
                    </button>
                    <button className="admin-btn-smooth inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8]" onClick={exportContent} type="button">
                      <Download size={14} />
                      {t("actions.export")}
                    </button>
                  </div>
                </div>

                {isBusy ? <div className="admin-loading-bar mb-3" /> : null}
                <div className="mb-4 flex items-center gap-2 text-xs text-[#adc6ff]">
                  {uiState === "loading" ? <Loader2 className="admin-status-pulse" size={14} /> : null}
                  {uiState === "success" ? <CheckCircle2 size={14} /> : null}
                  {uiState === "error" ? <OctagonAlert size={14} /> : null}
                  <p>{t("statusLabel", { status })}</p>
                </div>
                {uploadedUrl ? <p className="mb-4 text-xs text-[#d2bbff]">{t("uploadedUrl", { url: uploadedUrl })}</p> : null}

                {activeMenu === "technical" ? (
                  <TechnicalEditor
                    items={content.technical}
                    labels={{
                      sectionTitle: t("technical.title"),
                      titleField: t("technical.fields.title"),
                      descriptionField: t("technical.fields.description"),
                      iconField: t("technical.fields.icon"),
                      uploadIcon: t("technical.uploadIcon"),
                      save: t("actions.save"),
                      add: t("common.add"),
                      remove: t("common.remove"),
                    }}
                    onAdd={createTechnicalItem}
                    onChange={(id, field, value) =>
                      setContent((prev) => ({
                        ...prev,
                        technical: prev.technical.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
                      }))
                    }
                    onSave={saveTechnicalItem}
                    onUploadIcon={uploadTechnicalIcon}
                    onRemove={removeTechnicalItem}
                  />
                ) : null}

                {activeMenu === "projects" ? (
                  <ProjectsEditor
                    items={content.projects}
                    labels={{
                      sectionTitle: t("projects.title"),
                      tagField: t("projects.fields.tag"),
                      titleField: t("projects.fields.title"),
                      descriptionField: t("projects.fields.description"),
                      imageField: t("projects.fields.image"),
                      imagesTitle: t("projects.imagesTitle"),
                      addImageUrl: t("projects.addImageUrl"),
                      uploadImages: t("projects.uploadImages"),
                      add: t("common.add"),
                      remove: t("common.remove"),
                    }}
                    onAdd={() =>
                      setContent((prev) => ({
                        ...prev,
                        projects: [...prev.projects, { id: makeId("project"), tag: "", title: "", description: "", images: [] }],
                      }))
                    }
                    onChange={(id, field, value) =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
                      }))
                    }
                    onAddImage={(id) =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) =>
                          item.id === id ? { ...item, images: [...item.images, ""] } : item,
                        ),
                      }))
                    }
                    onChangeImage={(id, index, value) =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) =>
                          item.id === id
                            ? {
                                ...item,
                                images: item.images.map((image, imageIndex) => (imageIndex === index ? value : image)),
                              }
                            : item,
                        ),
                      }))
                    }
                    onRemoveImage={(id, index) =>
                      setContent((prev) => ({
                        ...prev,
                        projects: prev.projects.map((item) =>
                          item.id === id
                            ? { ...item, images: item.images.filter((_, imageIndex) => imageIndex !== index) }
                            : item,
                        ),
                      }))
                    }
                    onUploadImages={uploadProjectImages}
                    onRemove={(id) =>
                      setContent((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== id) }))
                    }
                  />
                ) : null}

                {activeMenu === "portfolioInfo" ? (
                  <PortfolioInfoEditor
                    info={content.portfolioInfo}
                    labels={{
                      sectionTitle: t("portfolioInfo.title"),
                      ownerNameField: t("portfolioInfo.fields.ownerName"),
                      titleField: t("portfolioInfo.fields.title"),
                      subtitleField: t("portfolioInfo.fields.subtitle"),
                      aboutField: t("portfolioInfo.fields.about"),
                      emailField: t("portfolioInfo.fields.email"),
                      phoneField: t("portfolioInfo.fields.phone"),
                      locationField: t("portfolioInfo.fields.location"),
                    }}
                    onChange={(field, value) =>
                      setContent((prev) => ({
                        ...prev,
                        portfolioInfo: {
                          ...prev.portfolioInfo,
                          [field]: value,
                        },
                      }))
                    }
                  />
                ) : null}
              </section>

              {historyItems.length > 0 ? (
                <section className="admin-card-smooth rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-4 md:p-6">
                  <h2 className="mb-3 text-base font-bold text-[#e5e2e1]">{t("historyTitle")}</h2>
                  <div className="space-y-2 text-sm text-[#ccc3d8]">
                    {historyItems.map((item) => (
                      <div key={`${item.version}-${item.updated_at}`} className="rounded-xl border border-[#4a4455]/20 bg-[#161519] px-3 py-2">
                        v{item.version} · {item.updated_at} · {item.updated_by ?? t("systemUser")}
                      </div>
                    ))}
                  </div>
                </section>
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
