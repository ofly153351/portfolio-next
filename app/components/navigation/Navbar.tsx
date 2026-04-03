"use client";

import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations("Hero");

  return (
    <div className="w-screen h-24 flex justify-center items-center fixed top-0 left-0 right-0 z-50 ">
      <div className="justify-between flex items-center w-screen px-4 mx-64 rounded-2xl bg-[#0A0A0A] h-18 text-white">
        <div className="name">{t("name")}</div>
        <div className="menu flex gap-4">
          <div className="menu-item">{t("project")}</div>
          <div className="menu-item">{t("experience")}</div>
          <div className="menu-item">{t("contact")}</div>
        </div>
        <div className="hireme">
          <button className="p-2 bg-[#7C3AED] rounded-xl hover:bg-[#6d28d9] transition-colors duration-160">
            {t("hireMe")}
          </button>
        </div>
      </div>
    </div>
  );
}
