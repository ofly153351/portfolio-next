import { CheckCircle2, Loader2, OctagonAlert } from "lucide-react";
import type { AdminUiState } from "@/types/admin";

type BackofficeStatusProps = {
  isBusy: boolean;
  uiState: AdminUiState;
  statusText: string;
};

export default function BackofficeStatus({
  isBusy,
  uiState,
  statusText,
}: BackofficeStatusProps) {
  return (
    <>
      {isBusy ? <div className="admin-loading-bar mb-3" /> : null}
      <div className="mb-6 flex items-center gap-2 text-xs text-[#adc6ff]">
        {uiState === "loading" ? <Loader2 className="animate-spin" size={14} /> : null}
        {uiState === "success" ? <CheckCircle2 size={14} /> : null}
        {uiState === "error" ? <OctagonAlert size={14} /> : null}
        <p>{statusText}</p>
      </div>
    </>
  );
}
