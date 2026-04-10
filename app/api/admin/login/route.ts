import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  cookieMaxAgeSeconds,
  issueAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username ?? "";
  const password = body.password ?? "";

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: issueAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAgeSeconds(),
  });

  return response;
}
