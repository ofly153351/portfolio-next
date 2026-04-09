export type QuickAction = {
  label: string;
};

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export type ChatUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type ChatWsEvent =
  | {
      type: "status";
      message?: string;
    }
  | {
      type: "token";
      token?: string;
    }
  | {
      type: "done";
      session_id?: string;
      provider?: string;
      usage?: ChatUsage;
    }
  | {
      type: "error";
      error?: string;
    };

export type ChatRequestPayload = {
  message: string;
  session_id: string;
  top_k: number;
  lang: "en" | "th";
};
