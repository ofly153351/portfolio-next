import type { AdminMenuKey } from "@/types/admin";

type BackofficeContentHeaderProps = {
  activeMenu: AdminMenuKey;
  isBusy: boolean;
};

export default function BackofficeContentHeader({
  activeMenu,
  isBusy,
}: BackofficeContentHeaderProps) {
  const title =
    activeMenu === "technical"
      ? "Technical Repository"
      : activeMenu === "portfolioInfo"
        ? "Portfolio Information"
        : "Project Repository";

  const subtitle =
    activeMenu === "technical"
      ? "Manage stack items and icon assets from MinIO."
      : activeMenu === "portfolioInfo"
        ? "Manage owner profile and portfolio contact information."
        : "Architecting digital experiences through precise engineering.";

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter">{title}</h1>
        <p className="mt-2 text-lg font-light text-[#ccc3d8]">{subtitle}</p>
      </div>
      <div className="rounded-xl border border-[#4a4455]/10 bg-[#1c1b1b] px-4 py-2">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#d2bbff]" />
        <span className="ml-2 text-xs uppercase tracking-widest text-[#ccc3d8]">
          {isBusy ? "Syncing" : "Live Sync Enabled"}
        </span>
      </div>
    </div>
  );
}
