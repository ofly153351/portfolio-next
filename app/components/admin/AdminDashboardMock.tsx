"use client";

import {
  Activity,
  ArrowRight,
  Bot,
  Cloud,
  Eye,
  Plus,
  TrendingUp,
} from "lucide-react";

type MockProject = {
  title: string;
  status: "In Progress" | "Deployed" | "Archived";
  description: string;
  contributors: string;
  updatedAt: string;
};

const mockProjects: MockProject[] = [
  {
    title: "Quantum UI Design System",
    status: "In Progress",
    description: "Updated 24 components with motion tokens and glass support.",
    contributors: "2 contributors",
    updatedAt: "1 hour ago",
  },
  {
    title: "Aegis Security Protocol",
    status: "Deployed",
    description: "JWT middleware optimized for low-latency verification.",
    contributors: "1 contributor",
    updatedAt: "5 hours ago",
  },
  {
    title: "Luminous Cloud Connect",
    status: "Archived",
    description: "Legacy cloud integration moved to cold storage.",
    contributors: "Phiraphat",
    updatedAt: "Yesterday",
  },
];

const activity = [
  { time: "10:42 AM", text: "New interaction on Quantum UI from AI assistant", tone: "primary" },
  { time: "09:15 AM", text: "Aegis deployed successfully to Vercel", tone: "secondary" },
  { time: "Yesterday", text: "Public API added to technical stack", tone: "muted" },
  { time: "Yesterday", text: "System backup completed for Cluster A", tone: "muted" },
] as const;

function statusTone(status: MockProject["status"]) {
  if (status === "Deployed") return "bg-[#7c3aed]/20 text-[#d2bbff]";
  if (status === "In Progress") return "bg-[#0566d9]/20 text-[#adc6ff]";
  return "bg-[#353534] text-[#ccc3d8]";
}

function activityTone(tone: (typeof activity)[number]["tone"]) {
  if (tone === "primary") return "bg-[#7c3aed]";
  if (tone === "secondary") return "bg-[#0566d9]";
  return "bg-[#4a4455]";
}

export default function AdminDashboardMock() {
  return (
    <div className="space-y-10">
      <section className="admin-enter relative">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7c3aed]/10 blur-[120px]" />
        <h1 className="text-5xl font-extrabold tracking-tight text-[#e5e2e1]">
          Architect&apos;s <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#ccc3d8]">
          Welcome back, Phiraphat. Your digital ecosystem is thriving with stable infrastructure and active AI engagement.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <article className="admin-card-smooth rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] p-8">
          <Eye className="mb-4 text-[#d2bbff]" size={30} />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ccc3d8]">Total Project Views</p>
          <h3 className="mt-2 text-3xl font-bold">12.4k</h3>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-400">
            <TrendingUp size={14} />
            <span>12% from last week</span>
          </div>
        </article>

        <article className="admin-card-smooth rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] p-8">
          <Bot className="mb-4 text-[#adc6ff]" size={30} />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ccc3d8]">AI Interactions</p>
          <h3 className="mt-2 text-3xl font-bold">842</h3>
          <div className="mt-4 flex items-center gap-1 text-xs text-[#ccc3d8]">
            <Activity size={14} />
            <span>Active sessions</span>
          </div>
        </article>

        <article className="admin-card-smooth relative overflow-hidden rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b] p-8 md:col-span-2">
          <Cloud className="absolute right-6 top-6 text-[#7c3aed]/20" size={96} />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ccc3d8]">Uptime Performance</p>
          <h3 className="mt-2 text-3xl font-bold">99.98%</h3>
          <p className="mt-4 max-w-xs text-sm text-[#ccc3d8]">Node instances running across 4 global clusters smoothly.</p>
          <div className="mt-6 flex gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className="h-2 flex-1 rounded-full bg-[#7c3aed]" />
            ))}
            <span className="h-2 w-2 rounded-full bg-[#ffb4ab]" />
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Project Updates</h2>
            <button className="admin-btn-smooth inline-flex items-center gap-1 text-sm font-semibold text-[#d2bbff]" type="button">
              View all projects <ArrowRight size={14} />
            </button>
          </div>

          {mockProjects.map((project, index) => (
            <article key={project.title} className="admin-card-smooth admin-enter flex items-center gap-5 rounded-2xl border border-transparent bg-[#1c1b1b] p-6 hover:border-[#4a4455]/30" style={{ animationDelay: `${index * 55}ms` }}>
              <div className="h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#111214]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-lg font-bold">{project.title}</h4>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${statusTone(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[#ccc3d8]">{project.description}</p>
                <div className="mt-4 text-xs text-[#ccc3d8]">
                  {project.contributors} • {project.updatedAt}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <section className="admin-card-smooth rounded-3xl border border-[#4a4455]/10 bg-[#1c1b1b]/80 p-6">
            <h3 className="mb-5 text-xl font-bold">Recent Activity</h3>
            <div className="space-y-6">
              {activity.map((item, index) => (
                <div key={`${item.time}-${index}`} className="relative border-l-2 border-[#7c3aed]/20 pl-6">
                  <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${activityTone(item.tone)}`} />
                  <p className="mb-1 text-xs text-[#ccc3d8]">{item.time}</p>
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card-smooth relative overflow-hidden rounded-3xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/10 to-transparent p-6">
            <div className="pointer-events-none absolute -bottom-5 -right-5 h-20 w-20 rounded-full bg-[#7c3aed]/20 blur-2xl" />
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
              <Bot className="text-[#d2bbff]" size={18} /> AI Assistant
            </h3>
            <p className="text-sm text-[#ccc3d8]">
              Active and monitoring portfolio engagement. Suggested 3 new visibility optimizations.
            </p>
            <button className="admin-btn-smooth mt-5 rounded-lg bg-[#e5e2e1] px-4 py-2 text-xs font-black text-[#131313]" type="button">
              READ SUGGESTIONS
            </button>
          </section>
        </aside>
      </section>

      <button className="admin-btn-smooth fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] text-[#ede0ff] shadow-[0_10px_40px_rgba(124,58,237,0.4)] lg:right-10" type="button">
        <Plus size={24} />
      </button>
    </div>
  );
}
