import { getTranslations } from "next-intl/server";
import LoginForm from "../../../components/admin/LoginForm";

export default async function AdminLoginPage() {
  const t = await getTranslations("Backoffice.login");
 
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-[#e5e2e1] md:px-8">
      <div className="mx-auto max-w-md rounded-3xl border border-[#4a4455]/20 bg-[#141317]/80 p-6 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-[#d2bbff]">{t("badge")}</p>
        <h1 className="mt-2 text-2xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 mb-6 text-sm text-[#ccc3d8]">{t("subtitle")}</p>
        <LoginForm />
      </div>
    </div>
  );
}
