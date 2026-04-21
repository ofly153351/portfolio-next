import { Bell, Search, Settings } from "lucide-react";

type BackofficeTopbarProps = {
  search: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
};

export default function BackofficeTopbar({
  search,
  placeholder,
  onSearchChange,
}: BackofficeTopbarProps) {
  return (
    <header className="fixed right-0 top-0 z-40 h-16 w-full border-b border-[#4a4455]/15 bg-[#131313]/70 px-4 backdrop-blur-xl lg:w-[calc(100%-280px)] lg:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8]" size={16} />
          <input
            className="w-56 rounded-full border-none bg-[#1c1b1b] py-1.5 pl-9 pr-4 text-sm text-[#e5e2e1] placeholder:text-[#4a4455] focus:ring-1 focus:ring-[#7c3aed] md:w-64"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            type="text"
            value={search}
          />
        </div>
        <div className="flex items-center gap-4 text-[#ccc3d8]">
          <Bell className="cursor-pointer transition-colors hover:text-[#7c3aed]" size={18} />
          <Settings className="cursor-pointer transition-colors hover:text-[#7c3aed]" size={18} />
        </div>
      </div>
    </header>
  );
}
