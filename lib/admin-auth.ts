import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "bo_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

function readEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value) return fallback;
  return value;
}

export function getAdminCredentials() {
  return {
    username: readEnv("BACKOFFICE_USERNAME", "admin"),
    password: readEnv("BACKOFFICE_PASSWORD", "admin123"),
  };
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return creds.username === username && creds.password === password;
}

export function issueAdminSessionToken(): string {
  const secret = readEnv("BACKOFFICE_SESSION_SECRET", "portfolio-backoffice-secret");
  const raw = `${Date.now()}-${crypto.randomUUID()}`;
  const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return `${raw}.${signature}`;
}

export function cookieMaxAgeSeconds(): number {
  return SESSION_TTL_SECONDS;
}

export function isValidSessionToken(token?: string): boolean {
  return Boolean(token && token.includes("."));
}
