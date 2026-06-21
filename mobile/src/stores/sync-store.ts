import { create } from "zustand";

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: number | null;
  pendingCount: number;
  lastError: string | null;
  // Id of the capture currently being uploaded, so the UI can show a live
  // per-item loading state as the queue drains one capture at a time.
  activeCaptureId: string | null;

  setIsSyncing: (value: boolean) => void;
  setLastSyncAt: (ts: number) => void;
  setPendingCount: (count: number) => void;
  setLastError: (err: string | null) => void;
  setActiveCaptureId: (id: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  lastError: null,
  activeCaptureId: null,

  setIsSyncing: (value) => set({ isSyncing: value }),
  setLastSyncAt: (ts) => set({ lastSyncAt: ts, lastError: null }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setLastError: (err) => set({ lastError: err }),
  setActiveCaptureId: (id) => set({ activeCaptureId: id }),
}));
