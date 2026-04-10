"use client";

import type { AdminMenuKey } from "@/types/admin";

type AdminMenuTabsProps = {
  activeMenu: AdminMenuKey;
  labels: Record<AdminMenuKey, string>;
  onSelect: (menu: AdminMenuKey) => void;
};

const menuOrder: AdminMenuKey[] = ["technical", "projects", "portfolioInfo"];

export default function AdminMenuTabs({ activeMenu, labels, onSelect }: AdminMenuTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {menuOrder.map((menuKey, index) => {
        const active = menuKey === activeMenu;

        return (
          <button
            key={menuKey}
            className={`admin-btn-smooth admin-enter min-h-11 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              active
                ? "border-[#7c3aed]/60 bg-[#7c3aed]/20 text-[#ede0ff]"
                : "border-[#4a4455]/25 bg-[#1d1c1f]/60 text-[#ccc3d8] hover:border-[#7c3aed]/40 hover:text-[#e5e2e1]"
            }`}
            onClick={() => onSelect(menuKey)}
            style={{ animationDelay: `${index * 60}ms` }}
            type="button"
          >
            {labels[menuKey]}
          </button>
        );
      })}
    </div>
  );
}
