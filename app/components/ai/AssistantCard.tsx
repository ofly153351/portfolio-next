"use client";

import { Bot, Brain, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  ChatMessage,
  ChatRequestPayload,
  ChatUsage,
  ChatWsEvent,
  QuickAction,
} from "@/types/ai";

export default function AssistantCard() {
  const t = useTranslations("Portfolio.ai");
  const locale = useLocale();
  const quickActions = t.raw("quickActions") as QuickAction[];
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusLabel, setStatusLabel] = useState(t("status.idle"));
  const [usage, setUsage] = useState<ChatUsage>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: t("response"),
    },
  ]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingPayloadRef = useRef<ChatRequestPayload | null>(null);
  const activeReplyIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef(false);
  const tokenQueueRef = useRef<string[]>([]);
  const pendingTextRef = useRef("");
  const tokenDrainTimerRef = useRef<number | null>(null);
  const pendingDoneUsageRef = useRef<ChatUsage | undefined>(undefined);
  const messageIdRef = useRef(0);
  const sessionIdRef = useRef(
    `nextjs-ws-${Math.random().toString(36).slice(2, 10)}`,
  );

  const nextMessageId = (prefix: "assistant" | "user"): string => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [messages, isStreaming]);

  useEffect(
    () => () => {
      if (tokenDrainTimerRef.current !== null) {
        window.clearTimeout(tokenDrainTimerRef.current);
        tokenDrainTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    },
    [],
  );

  useEffect(() => {
    activeReplyIdRef.current = activeReplyId;
  }, [activeReplyId]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const appendToken = (token: string) => {
    const replyId = activeReplyIdRef.current;
    if (!replyId) return;

    setMessages((prev) =>
      prev.map((item) =>
        item.id === replyId ? { ...item, text: item.text + token } : item,
      ),
    );
  };

  const finalizeStreamIfDone = () => {
    if (tokenQueueRef.current.length > 0) return;
    if (!pendingDoneUsageRef.current) return;

    setUsage(pendingDoneUsageRef.current);
    pendingDoneUsageRef.current = undefined;
    setIsStreaming(false);
    setStatusLabel(t("status.done"));
  };

  const startTokenDrain = () => {
    if (tokenDrainTimerRef.current !== null) return;

    const nextDelay = (char: string): number => {
      if (char === "\n") return 170;
      if (/[.!?]/.test(char)) return 150;
      if (/[,;:]/.test(char)) return 90;
      return 24;
    };

    const tick = () => {
      if (!pendingTextRef.current && tokenQueueRef.current.length > 0) {
        pendingTextRef.current = tokenQueueRef.current.join("");
        tokenQueueRef.current = [];
      }

      if (!pendingTextRef.current) {
        tokenDrainTimerRef.current = null;
        finalizeStreamIfDone();
        return;
      }

      const char = pendingTextRef.current[0];
      pendingTextRef.current = pendingTextRef.current.slice(1);
      appendToken(char);

      tokenDrainTimerRef.current = window.setTimeout(tick, nextDelay(char));
    };

    tokenDrainTimerRef.current = window.setTimeout(tick, 0);
  };

  const connectSocket = () => {
    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return existing;
    }

    const ws = new WebSocket("ws://localhost:8080/api/chat/ws");
    wsRef.current = ws;
    setStatusLabel(t("status.connecting"));

    ws.onopen = () => {
      setStatusLabel(t("status.connected"));
      const pending = pendingPayloadRef.current;
      if (!pending) return;

      ws.send(JSON.stringify(pending));
      pendingPayloadRef.current = null;
      setStatusLabel(t("status.streaming"));
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (isStreamingRef.current) {
        setStatusLabel(t("status.connectionClosed"));
        setIsStreaming(false);
      } else {
        setStatusLabel(t("status.closed"));
      }
    };

    ws.onerror = () => {
      setStatusLabel(t("status.error"));
    };

    ws.onmessage = (event) => {
      let data: ChatWsEvent;
      try {
        data = JSON.parse(event.data) as ChatWsEvent;
      } catch {
        setIsStreaming(false);
        setStatusLabel(t("status.error"));
        appendToken(`\n${t("serverError")}: ${t("unknownError")}`);
        return;
      }

      if (data.type === "status") {
        setStatusLabel(data.message || t("status.streaming"));
        return;
      }

      if (data.type === "token") {
        tokenQueueRef.current.push(data.token ?? "");
        startTokenDrain();
        setIsStreaming(true);
        return;
      }

      if (data.type === "done") {
        pendingDoneUsageRef.current = data.usage;
        startTokenDrain ();
        finalizeStreamIfDone();
        return;
      }

      if (data.type === "error") {
        tokenQueueRef.current = [];
        pendingTextRef.current = "";
        pendingDoneUsageRef.current = undefined;
        if (tokenDrainTimerRef.current !== null) {
          window.clearTimeout(tokenDrainTimerRef.current);
          tokenDrainTimerRef.current = null;
        }
        setIsStreaming(false);
        setStatusLabel(data.error || t("status.error"));
        appendToken(
          `\n${t("serverError")}: ${data.error ?? t("unknownError")}`,
        );
      }
    };

    return ws;
  };

  const resolveScrollTarget = (value: string): string | undefined => {
    const text = value.toLowerCase();
    if (
      text.includes("project") ||
      text.includes("work") ||
      text.includes("โปรเจกต์")
    )
      return "projects";
    if (
      text.includes("skill") ||
      text.includes("stack") ||
      text.includes("ทักษะ")
    )
      return "skills";
    if (
      text.includes("contact") ||
      text.includes("hire") ||
      text.includes("ติดต่อ")
    )
      return "contact";
    return undefined;
  };

  const submitMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;

    const userId = nextMessageId("user");
    const replyId = nextMessageId("assistant");
    const target = resolveScrollTarget(trimmed);
    const payload: ChatRequestPayload = {
      message: trimmed,
      session_id: sessionIdRef.current,
      top_k: 5,
      lang: locale.startsWith("th") ? "th" : "en",
    };

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text: trimmed },
      { id: replyId, role: "assistant", text: "" },
    ]);
    setInput("");
    setUsage(undefined);
    pendingDoneUsageRef.current = undefined;
    tokenQueueRef.current = [];
    pendingTextRef.current = "";
    if (tokenDrainTimerRef.current !== null) {
      window.clearTimeout(tokenDrainTimerRef.current);
      tokenDrainTimerRef.current = null;
    }
    setActiveReplyId(replyId);
    setIsStreaming(true);
    setStatusLabel(t("status.streaming"));

    if (target) {
      document
        .getElementById(target)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const ws = connectSocket();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return;
    }

    pendingPayloadRef.current = payload;
  };

  const isBusy = isStreaming;

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
          <p className="text-xs text-[#ccc3d8]/70">
            {t("statusLabel", { status: statusLabel })}
          </p>
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
          >
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
                  {isStreaming &&
                  message.id === messages[messages.length - 1]?.id ? (
                    <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-[#d2bbff]" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {usage ? (
            <p className="text-xs text-[#adc6ff]">
              {t("usage", {
                prompt: usage.prompt_tokens,
                completion: usage.completion_tokens,
                total: usage.total_tokens,
              })}
            </p>
          ) : null}

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
