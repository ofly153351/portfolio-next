import type { AdminUiState } from "@/types/admin";

type BackofficeStatusProps = {
  isBusy: boolean;
  uiState: AdminUiState;
  statusText: string;
};

export default function BackofficeStatus({
  isBusy,
  uiState: _uiState,
  statusText: _statusText,
}: BackofficeStatusProps) {
  return isBusy ? <div className="admin-loading-bar mb-3" /> : null;
}
