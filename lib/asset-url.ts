const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function parseHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

function preferredAssetBaseURL(): string | null {
  const configured = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();
  if (configured) {
    const parsed = parseHttpUrl(configured);
    if (parsed) return parsed.toString();
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    const parsedOrigin = parseHttpUrl(origin);
    if (parsedOrigin && !isLoopbackHost(parsedOrigin.hostname)) {
      return parsedOrigin.toString();
    }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (apiBase) {
    const parsed = parseHttpUrl(apiBase);
    if (parsed && !isLoopbackHost(parsed.hostname)) {
      return parsed.origin;
    }
  }

  return null;
}

export function isHttpUrl(value: string): boolean {
  return parseHttpUrl(value) !== null;
}

export function resolveAssetUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  if (!raw) return undefined;

  const parsed = parseHttpUrl(raw);
  if (!parsed) return raw;
  if (!isLoopbackHost(parsed.hostname)) return raw;

  const base = preferredAssetBaseURL();
  if (!base) return raw;

  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const path = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
  const next = new URL(`${path}${parsed.search}${parsed.hash}`, normalizedBase);
  return next.toString();
}

export function resolveAssetUrls(values: string[]): string[] {
  return values
    .map((value) => resolveAssetUrl(value))
    .filter((value): value is string => Boolean(value));
}
