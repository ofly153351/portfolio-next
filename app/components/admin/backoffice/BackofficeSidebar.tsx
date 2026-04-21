import {
  FolderKanban,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  Layers3,
  LogOut,
} from "lucide-react";
import type { AdminMenuKey } from "@/types/admin";

type BackofficeSidebarProps = {
  activeMenu: AdminMenuKey;
  menuLabels: Record<AdminMenuKey, string>;
  onMenuChange: (menu: AdminMenuKey) => void;
  onCreateProject: () => void;
  onLogout: () => void;
  logoutLabel: string;
};

export default function BackofficeSidebar({
  activeMenu,
  menuLabels,
  onMenuChange,
  onCreateProject,
  onLogout,
  logoutLabel,
}: BackofficeSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-[#4a4455]/15 bg-[#1c1b1b] p-6 text-sm lg:flex">
      <div className="text-xl font-black">Luminous CMS</div>
      <div className="mb-8 mt-8 flex items-center gap-3 rounded-xl bg-[#2a2a2a]/50 p-3">
        <div className="h-10 w-10 rounded-full border border-[#4a4455]/30 bg-[#2a2a2a]" />
        <div>
          <p className="font-bold">The Architect</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-[#ccc3d8]">Digital Portfolio CMS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
            activeMenu === "dashboard"
              ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
              : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
          }`}
          onClick={() => onMenuChange("dashboard")}
          type="button"
        >
          <LayoutDashboard size={18} />
          <span className={activeMenu === "dashboard" ? "font-semibold" : ""}>{menuLabels.dashboard}</span>
        </button>

        <button
          className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
            activeMenu === "projects"
              ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
              : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
          }`}
          onClick={() => onMenuChange("projects")}
          type="button"
        >
          <FolderKanban size={18} />
          <span className={activeMenu === "projects" ? "font-semibold" : ""}>{menuLabels.projects}</span>
        </button>

        <button
          className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
            activeMenu === "technical"
              ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
              : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
          }`}
          onClick={() => onMenuChange("technical")}
          type="button"
        >
          <Layers3 size={18} />
          <span className={activeMenu === "technical" ? "font-semibold" : ""}>{menuLabels.technical}</span>
        </button>

        <button
          className={`admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 ${
            activeMenu === "portfolioInfo"
              ? "border-l-2 border-[#7c3aed] bg-[#2a2a2a] text-[#e5e2e1]"
              : "text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
          }`}
          onClick={() => onMenuChange("portfolioInfo")}
          type="button"
        >
          <Globe2 size={18} />
          <span className={activeMenu === "portfolioInfo" ? "font-semibold" : ""}>{menuLabels.portfolioInfo}</span>
        </button>
      </nav>

      <div className="mt-auto space-y-2 border-t border-[#4a4455]/15 pt-6">
        <button
          className="admin-btn-smooth mb-4 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#0566d9] py-2.5 text-xs font-bold tracking-tight text-white"
          onClick={onCreateProject}
          type="button"
        >
          Create New Project
        </button>
        <button className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]" type="button">
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
        <button
          className="admin-btn-smooth flex w-full items-center gap-3 rounded-lg p-3 text-[#ccc3d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
          onClick={onLogout}
          type="button"
        >
          <LogOut size={18} />
          <span>{logoutLabel}</span>
        </button>
      </div>
    </aside>
  );
}
