"use client";

import { Bot, Brain, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { QuickAction } from "@/types/ai";

export default function AssistantCard() {
  const t = useTranslations("Portfolio.ai");
  const quickActions = t.raw("quickActions") as QuickAction[];

  return (
    <div className="relative group w-full">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7c3aed]/20 to-[#0566d9]/20 blur-xl opacity-50 transition duration-1000 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-3xl border border-[#4a4455]/15 glass-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#4a4455]/10 bg-[#2a2a2a]/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ffb4ab]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#d2bbff]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#adc6ff]" />
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-[#ccc3d8]">
            <Bot className="text-[#d2bbff]" size={14} /> {t("version")}
          </span>
        </div>

        <div className="flex h-[420px] flex-col justify-end gap-6 overflow-hidden p-6 sm:h-[400px]">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/20">
                <Brain className="text-[#d2bbff]" size={16} />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-[#4a4455]/10 bg-[#2a2a2a]/60 p-4 text-sm leading-relaxed text-[#e5e2e1]">
                {t("response")}
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-[#d2bbff]" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="min-h-11 rounded-full border border-[#4a4455]/20 px-3 py-2 text-xs transition-all hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/5"
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              className="w-full rounded-full border border-[#4a4455]/30 bg-[#0e0e0e] py-4 pl-6 pr-14 text-sm transition-all placeholder:text-[#ccc3d8]/50 focus:border-[#7c3aed]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
              placeholder={t("placeholder")}
              type="text"
            />
            <button
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7c3aed] text-[#ede0ff]"
              type="button"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
