import { useCallback } from "react";
import { syncPendingCaptures } from "@/lib/sync";
import { useSyncStore } from "@/stores/sync-store";
import { getPendingCaptures } from "@/lib/database";

export function useSync() {
  const { isSyncing, lastSyncAt, pendingCount, setIsSyncing, setLastSyncAt, setPendingCount, setLastError } =
    useSyncStore();

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingCaptures().length);
  }, [setPendingCount]);

  const sync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingCaptures();
      if (result.synced > 0 || result.failed === 0) {
        setLastSyncAt(Date.now());
      }
      if (result.failed > 0) {
        setLastError(`${result.failed} capture(s) failed to sync.`);
      }
      refreshPendingCount();
    } catch (err) {
      setLastError(String(err));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, setIsSyncing, setLastSyncAt, setLastError, refreshPendingCount]);

  return { sync, isSyncing, lastSyncAt, pendingCount, refreshPendingCount };
}
