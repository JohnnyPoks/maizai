import * as FileSystem from "expo-file-system/legacy";
import { isOnline } from "./network";
import { api } from "./api";
import { useSyncStore } from "@/stores/sync-store";
import { dlog, dlogError } from "./debug-store";
import {
  getPendingCaptures,
  getClassificationForCapture,
  getRecommendationForClassification,
  markCaptureSynced,
  markCaptureFailed,
  markClassificationSynced,
} from "./database";
import type { ServerDiseaseClass } from "@/types/api";
import type { DiseaseClass } from "@/types/domain";

let _isSyncing = false;

export interface SyncResult {
  synced: number;
  failed: number;
}

/** Mobile uses Title_Case disease classes; the server (Prisma) uses UPPER_CASE. */
function toServerDiseaseClass(c: DiseaseClass): ServerDiseaseClass {
  return c.toUpperCase() as ServerDiseaseClass;
}

export async function syncPendingCaptures(): Promise<SyncResult> {
  if (_isSyncing) {
    dlog("sync", "Already syncing — skipped");
    return { synced: 0, failed: 0 };
  }
  if (!isOnline()) {
    dlog("sync", "Offline — sync deferred");
    return { synced: 0, failed: 0 };
  }

  _isSyncing = true;
  const store = useSyncStore.getState();
  let synced = 0;
  let failed = 0;

  try {
    const pending = getPendingCaptures();
    dlog("sync", `Starting sync of ${pending.length} pending capture(s)`);

    for (const capture of pending) {
      // Mark this capture as the one currently uploading so the UI can show a
      // live spinner on it; the queue drains one capture at a time.
      useSyncStore.getState().setActiveCaptureId(capture.id);
      try {
        const classification = getClassificationForCapture(capture.id);
        if (!classification) {
          throw new Error("No classification found for capture");
        }
        const recommendation = getRecommendationForClassification(classification.id);
        if (!recommendation) {
          throw new Error("No recommendation found for capture");
        }

        // Read the image as base64 and let the server handle the Cloudinary
        // upload — no upload credentials live on the device.
        const base64 = await FileSystem.readAsStringAsync(capture.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const result = await api.syncCapture({
          base64Image: `data:image/jpeg;base64,${base64}`,
          capturedAt: new Date(capture.capturedAt).toISOString(),
          gpsLatitude: capture.gpsLatitude ?? undefined,
          gpsLongitude: capture.gpsLongitude ?? undefined,
          diseaseClass: toServerDiseaseClass(classification.diseaseClass),
          confidence: classification.confidence,
          classifiedAt: new Date(classification.classifiedAt).toISOString(),
          recommendation: {
            adviceType: recommendation.adviceType,
            adviceText: recommendation.adviceText,
            urgencyLevel: recommendation.urgencyLevel,
          },
        });

        markClassificationSynced(capture.id);
        markCaptureSynced(capture.id, result.cloudinaryUrl, result.imageId);
        synced++;
        dlog("sync", `Synced capture ${capture.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        markCaptureFailed(capture.id, msg);
        failed++;
        dlogError("sync", `Capture ${capture.id} failed: ${msg}`);
      } finally {
        // Reflect the freshly drained queue in the badge as we go.
        store.setPendingCount(getPendingCaptures().length);
      }
    }
    dlog("sync", `Sync finished: ${synced} synced, ${failed} failed`);
  } finally {
    useSyncStore.getState().setActiveCaptureId(null);
    _isSyncing = false;
  }

  return { synced, failed };
}

/** Fire-and-forget sync — never throws. */
export function triggerBackgroundSync(): void {
  syncPendingCaptures().catch((err) => console.warn("Background sync error:", err));
}
