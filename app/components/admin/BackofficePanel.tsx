"use client";

import axios from "axios";
import { CheckCircle2, Loader2, OctagonAlert } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminApi, type ApiLocale, type ContentHistoryItem } from "@/lib/admin-api";
import type { AdminContent, AdminMenuKey, PortfolioInfoContent, ProjectContentItem, TechnicalContentItem } from "@/types/admin";
import type { ProjectItem, SkillItem } from "@/types/portfolio";
import AdminMenuTabs from "./AdminMenuTabs";
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

  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>("technical");
  const [content, setContent] = useState<AdminContent>(fallbackContent);
  const [status, setStatus] = useState(t("status.loading"));
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [uiState, setUiState] = useState<"idle" | "loading" | "success" | "error">("loading");

  const apiLocale = normalizeLocale(locale);

  const menuLabels: Record<AdminMenuKey, string> = {
    technical: t("menu.technical"),
    projects: t("menu.projects"),
    portfolioInfo: t("menu.portfolioInfo"),
  };

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

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      router.replace(`/${locale}/admin/login`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e2e1]">
      <div className="admin-enter mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-8">
        <header className="admin-card-smooth mb-8 rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d2bbff]">{t("badge")}</p>
              <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{t("title")}</h1>
              <p className="mt-2 text-sm text-[#ccc3d8]">{t("subtitle")}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                className="admin-btn-smooth min-h-11 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8]"
                href={`/${locale}`}
              >
                {t("actions.viewSite")}
              </Link>
              <button
                className="admin-btn-smooth min-h-11 rounded-xl border border-[#ff6f91]/45 px-4 py-2 text-sm font-semibold text-[#ffb4c4]"
                onClick={logout}
                type="button"
              >
                {t("actions.logout")}
              </button>
            </div>
          </div>
        </header>

        <section className="admin-card-smooth mb-6 rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-4 shadow-[0_0_80px_rgba(124,58,237,0.06)] transition-all duration-500 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="admin-btn-smooth min-h-11 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-[#ede0ff] disabled:opacity-50"
              disabled={isBusy}
              onClick={saveContent}
              type="button"
            >
              {t("actions.save")}
            </button>
            <button
              className="admin-btn-smooth min-h-11 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50"
              disabled={isBusy}
              onClick={loadContent}
              type="button"
            >
              {t("actions.load")}
            </button>
            <button
              className="admin-btn-smooth min-h-11 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50"
              disabled={isBusy}
              onClick={publishContent}
              type="button"
            >
              {t("actions.publish")}
            </button>
            <button
              className="admin-btn-smooth min-h-11 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8] disabled:opacity-50"
              disabled={isBusy}
              onClick={loadHistory}
              type="button"
            >
              {t("actions.history")}
            </button>
            <button
              className="admin-btn-smooth min-h-11 rounded-xl border border-[#4a4455]/30 px-4 py-2 text-sm text-[#ccc3d8]"
              onClick={exportContent}
              type="button"
            >
              {t("actions.export")}
            </button>
          </div>

          {isBusy ? <div className="admin-loading-bar mb-3" /> : null}
          <div className="flex items-center gap-2 text-xs text-[#adc6ff]">
            {uiState === "loading" ? (
              <Loader2 className="admin-status-pulse" size={14} />
            ) : null}
            {uiState === "success" ? <CheckCircle2 size={14} /> : null}
            {uiState === "error" ? <OctagonAlert size={14} /> : null}
            <p>{t("statusLabel", { status })}</p>
          </div>
          {uploadedUrl ? <p className="mt-2 text-xs text-[#d2bbff]">{t("uploadedUrl", { url: uploadedUrl })}</p> : null}
        </section>

        <section className="admin-card-smooth space-y-6 rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-4 shadow-[0_0_80px_rgba(59,130,246,0.06)] transition-all duration-500 md:p-6">
          <AdminMenuTabs activeMenu={activeMenu} labels={menuLabels} onSelect={setActiveMenu} />

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
          <section className="mt-6 rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-4 md:p-6">
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
      </div>
    </div>
  );
}
