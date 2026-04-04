"use client";

import { Bot, Brain, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { QuickAction } from "@/types/ai";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ResponseKey = "greeting" | "projects" | "skills" | "contact" | "default";

export default function AssistantCard() {
  const t = useTranslations("Portfolio.ai");
  const quickActions = t.raw("quickActions") as QuickAction[];
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: t("response"),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const messageIdRef = useRef(0);

  const nextMessageId = (prefix: "assistant" | "user") => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  useEffect(
    () => () => {
      timeoutRef.current.forEach((timerId) => window.clearTimeout(timerId));
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    },
    [],
  );

  const resolveResponse = (value: string): { key: ResponseKey; target?: string } => {
    const text = value.toLowerCase();

    if (text.includes("hi") || text.includes("hello") || text.includes("สวัสดี")) {
      return { key: "greeting" };
    }

    if (text.includes("project") || text.includes("work") || text.includes("โปรเจกต์")) {
      return { key: "projects", target: "projects" };
    }

    if (text.includes("skill") || text.includes("stack") || text.includes("ทักษะ")) {
      return { key: "skills", target: "skills" };
    }

    if (text.includes("contact") || text.includes("hire") || text.includes("ติดต่อ")) {
      return { key: "contact", target: "contact" };
    }

    return { key: "default" };
  };

  const streamReply = (text: string, target?: string) => {
    const replyId = nextMessageId("assistant");
    let currentIndex = 0;

    setMessages((prev) => [...prev, { id: replyId, role: "assistant", text: "" }]);
    setIsStreaming(true);

    intervalRef.current = window.setInterval(() => {
      currentIndex += 1;
      setMessages((prev) =>
        prev.map((item) => (item.id === replyId ? { ...item, text: text.slice(0, currentIndex) } : item)),
      );

      if (currentIndex >= text.length) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsStreaming(false);

        if (target) {
          const scrollTimer = window.setTimeout(() => {
            document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 320);
          timeoutRef.current.push(scrollTimer);
        }
      }
    }, 18);
  };

  const submitMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isThinking || isStreaming) return;

    setMessages((prev) => [...prev, { id: nextMessageId("user"), role: "user", text: trimmed }]);
    setInput("");
    setIsThinking(true);

    const resolved = resolveResponse(trimmed);
    const thinkingTimer = window.setTimeout(() => {
      setIsThinking(false);
      streamReply(t(`responses.${resolved.key}`), resolved.target);
    }, 620);

    timeoutRef.current.push(thinkingTimer);
  };

  const isBusy = isThinking || isStreaming;

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

        <div className="flex h-[420px] flex-col gap-4 p-6 sm:h-[400px]">
          <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-pop flex items-start gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/20">
                    <Brain className="text-[#d2bbff]" size={16} />
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    message.role === "assistant"
                      ? "rounded-tl-none border border-[#4a4455]/10 bg-[#2a2a2a]/60 text-[#e5e2e1]"
                      : "rounded-tr-none bg-[#7c3aed]/20 text-[#ede0ff]"
                  }`}
                >
                  {message.text}
                  {isStreaming && message.id === messages[messages.length - 1]?.id ? (
                    <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-[#d2bbff]" />
                  ) : null}
                </div>
              </div>
            ))}

            {isThinking ? (
              <div className="chat-pop flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/20">
                  <Brain className="text-[#d2bbff]" size={16} />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-[#4a4455]/10 bg-[#2a2a2a]/60 p-4 text-sm leading-relaxed text-[#e5e2e1]">
                  <span className="mr-2 text-[#ccc3d8]">{t("thinking")}</span>
                  <span className="typing-dot inline-block h-2 w-2 rounded-full bg-[#d2bbff]" />
                  <span
                    className="typing-dot inline-block h-2 w-2 rounded-full bg-[#adc6ff]"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="typing-dot inline-block h-2 w-2 rounded-full bg-[#cebdff]"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="min-h-11 rounded-full border border-[#4a4455]/20 px-3 py-2 text-xs transition-all hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/5 disabled:opacity-40"
                disabled={isBusy}
                onClick={() => submitMessage(action.label)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              className="w-full rounded-full border border-[#4a4455]/30 bg-[#0e0e0e] py-4 pl-6 pr-14 text-sm transition-all placeholder:text-[#ccc3d8]/50 focus:border-[#7c3aed]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30"
              disabled={isBusy}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitMessage(input);
                }
              }}
              placeholder={t("placeholder")}
              type="text"
              value={input}
            />
            <button
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7c3aed] text-[#ede0ff]"
              aria-label={t("sendAria")}
              disabled={isBusy}
              onClick={() => submitMessage(input)}
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
