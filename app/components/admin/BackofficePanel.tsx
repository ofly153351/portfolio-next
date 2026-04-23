"use client";

import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminApi, type ApiLocale } from "@/lib/admin-api";
import type {
  AdminContent,
  AdminMenuKey,
  AdminUiState,
  PortfolioInfoContent,
  ProjectContentItem,
  ProjectFormState,
  TechnicalContentItem,
  TechnicalFormState,
} from "@/types/admin";
import AdminDashboardMock from "./AdminDashboardMock";
import BackofficeContentHeader from "./backoffice/BackofficeContentHeader";
import BackofficeSidebar from "./backoffice/BackofficeSidebar";
import BackofficeStatus from "./backoffice/BackofficeStatus";
import BackofficeTopbar from "./backoffice/BackofficeTopbar";
import PortfolioInfoEditor from "./PortfolioInfoEditor";
import ProjectFormCard from "./backoffice/ProjectFormCard";
import ProjectList from "./backoffice/ProjectList";
import TechnicalFormCard from "./backoffice/TechnicalFormCard";
import TechnicalList from "./backoffice/TechnicalList";

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

function isSvgMarkup(value?: string): boolean {
  if (!value) return false;
  return value.trim().startsWith("<svg");
}

function createSvgFile(markup: string): File {
  const normalized = markup.trim();
  const svgWithNamespace = normalized.includes("xmlns=")
    ? normalized
    : normalized.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');

  return new File([svgWithNamespace], `technical-icon-${Date.now()}.svg`, {
    type: "image/svg+xml",
  });
}

function normalizeProjectUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const nextUrl = url.trim();
  if (!nextUrl) return undefined;
  return isHttpUrl(nextUrl) ? nextUrl : undefined;
}

function normalizeOptionalHttpUrl(url?: string): string {
  if (!url) return "";
  const nextUrl = url.trim();
  if (!nextUrl) return "";
  return isHttpUrl(nextUrl) ? nextUrl : "";
}

function normalizePortfolioInfo(
  value: unknown,
  fallback: PortfolioInfoContent,
): PortfolioInfoContent {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Record<string, unknown>;

  return {
    ownerName: typeof candidate.ownerName === "string" ? candidate.ownerName : fallback.ownerName,
    title: typeof candidate.title === "string" ? candidate.title : fallback.title,
    subtitle: typeof candidate.subtitle === "string" ? candidate.subtitle : fallback.subtitle,
    about: typeof candidate.about === "string" ? candidate.about : fallback.about,
    contactEmail:
      typeof candidate.contactEmail === "string" ? candidate.contactEmail : fallback.contactEmail,
    contactPhone:
      typeof candidate.contactPhone === "string" ? candidate.contactPhone : fallback.contactPhone,
    location: typeof candidate.location === "string" ? candidate.location : fallback.location,
    github: typeof candidate.github === "string" ? candidate.github : fallback.github,
    linkedin: typeof candidate.linkedin === "string" ? candidate.linkedin : fallback.linkedin,
    instagram: typeof candidate.instagram === "string" ? candidate.instagram : fallback.instagram,
  };
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
    projectUrl:
      typeof item.projectUrl === "string"
        ? normalizeProjectUrl(item.projectUrl)
        : typeof item.url === "string"
          ? normalizeProjectUrl(item.url)
          : undefined,
    image: typeof item.image === "string" ? item.image : images[0],
    images,
  };
}

function sanitizeContentForSave(content: AdminContent): AdminContent {
  return {
    ...content,
    technical: content.technical.map((item) => ({
      ...item,
      title: item.title.trim(),
      description: item.description.slice(0, 2000),
      icon: normalizeTechnicalIcon(item.icon),
    })),
    projects: content.projects.map((project) => {
      const normalizedImages = project.images
        .map((image) => image.trim())
        .filter((image) => image && isHttpUrl(image));
      const projectUrl = normalizeProjectUrl(project.projectUrl);

      const fallbackImage =
        project.image && isHttpUrl(project.image) ? project.image : undefined;
      const primaryImage = normalizedImages[0] ?? fallbackImage;
      const images = primaryImage
        ? Array.from(new Set([primaryImage, ...normalizedImages]))
        : normalizedImages;

      return {
        ...project,
        tag: project.tag.trim(),
        title: project.title.trim(),
        description: project.description.slice(0, 3000),
        projectUrl,
        image: primaryImage,
        images,
      };
    }),
    portfolioInfo: {
      ...content.portfolioInfo,
      ownerName: content.portfolioInfo.ownerName.trim(),
      title: content.portfolioInfo.title.trim(),
      subtitle: content.portfolioInfo.subtitle.trim(),
      about: content.portfolioInfo.about.slice(0, 5000),
      contactEmail: content.portfolioInfo.contactEmail.trim(),
      contactPhone: content.portfolioInfo.contactPhone.trim(),
      location: content.portfolioInfo.location.trim(),
      github: normalizeOptionalHttpUrl(content.portfolioInfo.github),
      linkedin: normalizeOptionalHttpUrl(content.portfolioInfo.linkedin),
      instagram: normalizeOptionalHttpUrl(content.portfolioInfo.instagram),
    },
  };
}

export default function BackofficePanel() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Backoffice");
  const tPortfolioHero = useTranslations("Portfolio.hero");
  const tPortfolioNav = useTranslations("Portfolio.nav");

  const fallbackContent = useMemo<AdminContent>(
    () => ({
      technical: [],
      projects: [],
      portfolioInfo: {
        ownerName: tPortfolioHero("name"),
        title: tPortfolioNav("brand"),
        subtitle: tPortfolioHero("subtitle"),
        about: tPortfolioHero("description"),
        contactEmail: "",
        contactPhone: "",
        location: "",
        github: "",
        linkedin: "",
        instagram: "",
      },
    }),
    [tPortfolioHero, tPortfolioNav],
  );

  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>("dashboard");
  const [content, setContent] = useState<AdminContent>(fallbackContent);
  const [version, setVersion] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState(t("status.loading"));
  const [isBusy, setIsBusy] = useState(false);
  const [uiState, setUiState] = useState<AdminUiState>("loading");
  const [search, setSearch] = useState("");

  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    title: "",
    url: "",
    description: "",
    tag: "AI",
    images: [],
  });

  const [technicalForm, setTechnicalForm] = useState<TechnicalFormState>({
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

  const syncVersionConflict = async () => {
    await loadContent();
    setStatus(t("status.versionConflict"));
    setUiState("error");
  };

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
            : [],
          projects:
            normalizedProjects.length > 0
              ? normalizedProjects
              : [],
          portfolioInfo: normalizePortfolioInfo(parsed.portfolioInfo, fallbackContent.portfolioInfo),
        };

        setContent(contentFromApi);
      }

      setVersion(response.data?.version);

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
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await syncVersionConflict();
        return;
      }
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
      projectUrl: normalizedUrl || undefined,
      image: projectForm.images.find((image) => isHttpUrl(image)),
      images: Array.from(new Set(projectForm.images.filter((image) => isHttpUrl(image)))),
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
      await adminApi.publishContent(apiLocale);

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
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await syncVersionConflict();
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
      await adminApi.publishContent(apiLocale);
      setContent(sanitized);
      setVersion(response.data?.version ?? version);
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await syncVersionConflict();
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
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await syncVersionConflict();
        return;
      }
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
      let icon = normalizeTechnicalIcon(technicalForm.icon);

      if (isSvgMarkup(technicalForm.icon)) {
        const uploadResponse = await adminApi.upload(createSvgFile(technicalForm.icon));
        icon = uploadResponse.data.url ?? uploadResponse.data.urls?.[0] ?? undefined;
      }

      await adminApi.createTechnical(apiLocale, {
        title,
        description: technicalForm.description.trim(),
        icon,
      });
      await adminApi.publishContent(apiLocale);
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
      await adminApi.publishContent(apiLocale);
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

  const savePortfolioInfo = async () => {
    setIsBusy(true);
    setUiState("loading");
    setStatus(t("status.saving"));

    try {
      const sanitized = sanitizeContentForSave(content);
      const response = await adminApi.saveContent(apiLocale, {
        version,
        content: sanitized,
      });
      await adminApi.publishContent(apiLocale);
      setContent(sanitized);
      setVersion(response.data?.version ?? version);
      setStatus(t("status.saved"));
      setUiState("success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await syncVersionConflict();
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

  const showProjectForm = activeMenu === "projects";
  const showTechnicalForm = activeMenu === "technical";
  const showPortfolioInfo = activeMenu === "portfolioInfo";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#131313] text-[#e5e2e1]">
      <BackofficeSidebar
        activeMenu={activeMenu}
        logoutLabel={t("actions.logout")}
        menuLabels={menuLabels}
        onCreateProject={() => setActiveMenu("projects")}
        onLogout={logout}
        onMenuChange={setActiveMenu}
      />

      <main className="min-h-screen lg:ml-[280px]">
        <BackofficeTopbar
          onSearchChange={setSearch}
          placeholder={
            activeMenu === "technical"
              ? "Search technical..."
              : activeMenu === "portfolioInfo"
                ? "Search disabled..."
                : "Search projects..."
          }
          search={search}
        />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 md:px-10">
          {activeMenu === "dashboard" ? <AdminDashboardMock /> : null}

          {activeMenu !== "dashboard" ? (
            <>
              <BackofficeContentHeader activeMenu={activeMenu} isBusy={isBusy} />
              <BackofficeStatus isBusy={isBusy} statusText={t("statusLabel", { status })} uiState={uiState} />

              <div className="grid grid-cols-12 gap-8">
                <section className="col-span-12 space-y-8 lg:col-span-5">
                  {showProjectForm ? (
                    <ProjectFormCard
                      form={projectForm}
                      isBusy={isBusy}
                      onChange={setProjectForm}
                      onSubmit={createProject}
                      onUploadImages={uploadProjectFiles}
                    />
                  ) : null}

                  {showTechnicalForm ? (
                    <TechnicalFormCard
                      form={technicalForm}
                      isBusy={isBusy}
                      onChange={setTechnicalForm}
                      onSubmit={createTechnical}
                      onUploadIcon={uploadTechnicalIcon}
                    />
                  ) : null}

                  {showPortfolioInfo ? (
                    <div className="admin-card-smooth glass-panel rounded-3xl p-8">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#e5e2e1]">{t("portfolioInfo.title")}</h2>
                        <button
                          className="admin-btn-smooth rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0566d9] px-4 py-2 text-xs font-bold tracking-wider text-[#e5e2e1] disabled:opacity-60"
                          disabled={isBusy}
                          onClick={savePortfolioInfo}
                          type="button"
                        >
                          {t("actions.save")}
                        </button>
                      </div>
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
                          githubField: t("portfolioInfo.fields.github"),
                          linkedinField: t("portfolioInfo.fields.linkedin"),
                          instagramField: t("portfolioInfo.fields.instagram"),
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
                    </div>
                  ) : null}
                </section>

                <section className="col-span-12 space-y-6 lg:col-span-7">
                  {showProjectForm ? (
                    <ProjectList
                      items={filteredProjects}
                      onDelete={deleteProject}
                      onEdit={setProjectForm}
                    />
                  ) : null}

                  {showTechnicalForm ? (
                    <TechnicalList
                      items={filteredTechnical}
                      onDelete={deleteTechnical}
                    />
                  ) : null}

                  {showPortfolioInfo ? (
                    <section className="admin-card-smooth glass-panel rounded-3xl p-6">
                      <h3 className="mb-4 text-lg font-bold text-[#e5e2e1]">Live Preview</h3>
                      <div className="space-y-3 text-sm">
                        <p><span className="text-[#ccc3d8]">Owner:</span> {content.portfolioInfo.ownerName || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Title:</span> {content.portfolioInfo.title || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Subtitle:</span> {content.portfolioInfo.subtitle || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Email:</span> {content.portfolioInfo.contactEmail || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Phone:</span> {content.portfolioInfo.contactPhone || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Location:</span> {content.portfolioInfo.location || "-"}</p>
                        <p><span className="text-[#ccc3d8]">GitHub:</span> {content.portfolioInfo.github || "-"}</p>
                        <p><span className="text-[#ccc3d8]">LinkedIn:</span> {content.portfolioInfo.linkedin || "-"}</p>
                        <p><span className="text-[#ccc3d8]">Instagram:</span> {content.portfolioInfo.instagram || "-"}</p>
                        <p className="pt-2 text-[#ccc3d8]">{content.portfolioInfo.about || "-"}</p>
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
