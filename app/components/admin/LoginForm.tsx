"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { adminApi } from "@/lib/admin-api";

export default function LoginForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Backoffice.login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        await adminApi.me();
        if (!active) return;
        router.replace(`/${locale}/admin`);
      } catch {
        adminApi.clearToken();
        // keep user on login page when session is missing/invalid
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, [locale, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await adminApi.login({ username, password });
      router.replace(`/${locale}/admin`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        adminApi.clearToken();
        setError(t("invalidCredentials"));
      } else {
        setError(t("requestFailed"));
      }
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#ccc3d8]" htmlFor="bo-username">
          {t("username")}
        </label>
        <input
          className="min-h-11 w-full rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
          id="bo-username"
          onChange={(event) => setUsername(event.target.value)}
          placeholder={t("usernamePlaceholder")}
          type="text"
          value={username}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#ccc3d8]" htmlFor="bo-password">
          {t("password")}
        </label>
        <input
          className="min-h-11 w-full rounded-xl border border-[#4a4455]/35 bg-[#0e0e0f] px-3 text-sm text-[#e5e2e1]"
          id="bo-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("passwordPlaceholder")}
          type="password"
          value={password}
        />
      </div>

      {error ? <p className="text-sm text-[#ffb4c4]">{error}</p> : null}

      <button
        className="min-h-11 w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] px-4 py-2 text-sm font-semibold text-[#ede0ff]"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
