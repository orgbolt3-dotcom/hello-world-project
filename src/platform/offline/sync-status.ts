import { create } from "zustand";
import type { SyncPhase, SyncState } from "@eco/core-contracts";
import type { MessageKey } from "@/lib/i18n/messages";

/**
 * Single source of truth for "is my work saved?" in the interface.
 * The sync worker pushes its state here; components only read it.
 */
interface SyncStatusStore extends SyncState {
  setState: (state: Partial<SyncState>) => void;
}

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  phase: "idle",
  pendingCount: 0,
  lastSyncedAt: null,
  messageKey: null,

  setState: (state) => {
    set(state);
  },
}));

export function resetSyncStatus(): void {
  useSyncStatusStore.setState({
    phase: "idle",
    pendingCount: 0,
    lastSyncedAt: null,
    messageKey: null,
  });
}

/** Plain-language message for each situation. */
const PHASE_MESSAGES: Record<SyncPhase, MessageKey> = {
  idle: "sync.saved",
  pulling: "sync.updating",
  pushing: "sync.sending",
  offline: "sync.offlineSaved",
  error: "sync.retrying",
};

export interface SyncStatusView {
  phase: SyncPhase;
  pendingCount: number;
  lastSyncedAt: number | null;
  messageKey: MessageKey;
  isSettled: boolean;
}

export function useSyncStatus(): SyncStatusView {
  const { phase, pendingCount, lastSyncedAt, messageKey } = useSyncStatusStore();

  const resolved = (messageKey as MessageKey | null) ?? PHASE_MESSAGES[phase];

  return {
    phase,
    pendingCount,
    lastSyncedAt,

    messageKey: pendingCount > 0 && phase !== "pushing" ? "sync.waiting" : resolved,

    isSettled: phase === "idle" && pendingCount === 0,
  };
}
