import axios from "axios";

import type { AdminContent } from "@/types/admin";

export type ApiLocale = "en" | "th";

export type AdminContentResponse = {
  locale: ApiLocale;
  version?: number;
  updated_at?: string;
  content: AdminContent;
};

export type PublicContentResponse = {
  locale: ApiLocale;
  content: AdminContent;
};

export type PublicTokenResponse = {
  token: string;
  token_type?: string;
  expires_at?: string;
  expires_in?: number;
};

export type SaveContentPayload = {
  version?: number;
  content: AdminContent & {
    projects: Array<
      AdminContent["projects"][number] & {
        image?: string;
      }
    >;
  };
};

export type SaveContentResponse = {
  ok: boolean;
  version?: number;
  updated_at?: string;
};

export type PublishContentResponse = {
  ok: boolean;
  published_version?: number;
  published_at?: string;
};

export type ContentHistoryItem = {
  locale: ApiLocale;
  version: number;
  updated_at: string;
  updated_by?: string;
  content: AdminContent;
};

export type ContentHistoryResponse = {
  locale?: ApiLocale;
  history?: ContentHistoryItem[];
  items?: ContentHistoryItem[];
};

export type UploadResponse = {
  ok: boolean;
  objectKey?: string;
  url?: string;
  urls?: string[];
};

export type TechnicalItemPayload = {
  title: string;
  description: string;
  icon?: string;
};

export type TechnicalListResponse = {
  locale: ApiLocale;
  version?: number;
  updated_at?: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
};

export type TechnicalDeleteResponse = {
  ok: boolean;
  version?: number;
  updated_at?: string;
  deleted_id?: string;
};

type AdminLoginResponse = {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const ADMIN_TOKEN_STORAGE_KEY = "portfolio_admin_access_token";
let cachedPublicToken = "";
let cachedPublicTokenExpiresAt = 0;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

function writeStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function extractBearerToken(headerValue?: string): string | null {
  if (!headerValue) return null;
  const value = headerValue.trim();
  if (!value.toLowerCase().startsWith("bearer ")) return null;
  return value.slice(7).trim();
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function toWsBaseURL(httpBaseURL: string): string {
  if (httpBaseURL.startsWith("https://")) {
    return `wss://${httpBaseURL.slice("https://".length)}`;
  }
  if (httpBaseURL.startsWith("http://")) {
    return `ws://${httpBaseURL.slice("http://".length)}`;
  }
  return httpBaseURL;
}

async function getPublicToken(): Promise<string> {
  const now = Date.now();
  if (cachedPublicToken && cachedPublicTokenExpiresAt-now > 15_000) {
    return cachedPublicToken;
  }

  const response = await api.get<PublicTokenResponse>("/api/public/token");
  const token = response.data?.token?.trim();
  if (!token) {
    throw new Error("public token is missing in response");
  }
  const expiresIn = Number(response.data?.expires_in ?? 300);
  cachedPublicToken = token;
  cachedPublicTokenExpiresAt = now + Math.max(30, expiresIn) * 1000;
  return cachedPublicToken;
}

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (url.startsWith("/api/admin/")) {
    const token = readStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const adminApi = {
  login: async (payload: { username: string; password: string }) => {
    const response = await api.post<AdminLoginResponse>("/api/admin/login", payload);
    const headerToken = extractBearerToken(response.headers.authorization as string | undefined);
    const bodyToken = response.data?.access_token;
    const token = headerToken || bodyToken;
    if (token) {
      writeStoredToken(token);
    }
    return response;
  },

  logout: async () => {
    try {
      return await api.post("/api/admin/logout");
    } finally {
      clearStoredToken();
    }
  },

  me: () => api.get("/api/admin/me"),

  health: () => api.get("/api/health"),

  getContent: (locale: ApiLocale) =>
    api.get<AdminContentResponse>("/api/admin/content", { params: { locale } }),

  saveContent: (locale: ApiLocale, payload: SaveContentPayload) =>
    api.put<SaveContentResponse>("/api/admin/content", payload, { params: { locale } }),

  publishContent: (locale: ApiLocale) =>
    api.post<PublishContentResponse>("/api/admin/content/publish", null, { params: { locale } }),

  getHistory: (locale: ApiLocale) =>
    api.get<ContentHistoryResponse>("/api/admin/content/history", { params: { locale } }),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<UploadResponse>("/api/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMany: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post<UploadResponse>("/api/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getPublicContent: async (locale: ApiLocale) => {
    const token = await getPublicToken();
    return api.get<PublicContentResponse>("/api/content", {
      params: { locale },
      headers: { "X-Public-Token": token },
    });
  },

  getPublicWsURL: async () => {
    const token = await getPublicToken();
    const wsBase = toWsBaseURL(baseURL);
    return `${wsBase}/api/chat/ws?public_token=${encodeURIComponent(token)}`;
  },

  getTechnical: (locale: ApiLocale) =>
    api.get<TechnicalListResponse>("/api/admin/technical", { params: { locale } }),

  createTechnical: (locale: ApiLocale, payload: TechnicalItemPayload) =>
    api.post("/api/admin/technical", payload, { params: { locale } }),

  updateTechnical: (locale: ApiLocale, id: string, payload: TechnicalItemPayload) =>
    api.put(`/api/admin/technical/${id}`, payload, { params: { locale } }),

  deleteTechnical: (locale: ApiLocale, id: string) =>
    api.delete<TechnicalDeleteResponse>(`/api/admin/technical/${id}`, { params: { locale } }),

  clearToken: () => {
    clearStoredToken();
  },
};
