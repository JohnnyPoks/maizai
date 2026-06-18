import { isOnline } from "./network";
import { uploadToCloudinary } from "./cloudinary";
import { api } from "./api";
import {
  getPendingCaptures,
  getClassificationForCapture,
  markCaptureSynced,
  markCaptureFailed,
  markClassificationSynced,
} from "./database";

let _isSyncing = false;

export interface SyncResult {
  synced: number;
  failed: number;
}

export async function syncPendingCaptures(): Promise<SyncResult> {
  if (_isSyncing || !isOnline()) return { synced: 0, failed: 0 };

  _isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = getPendingCaptures();

    for (const capture of pending) {
      try {
        // 1. Upload image to Cloudinary
        const upload = await uploadToCloudinary(capture.localUri);

        // 2. Register the image in the cloud back-end
        const remoteImage = await api.syncImage({
          cloudinaryUrl: upload.secure_url,
          cloudinaryId: upload.public_id,
          capturedAt: new Date(capture.capturedAt).toISOString(),
          gpsLatitude: capture.gpsLatitude ?? undefined,
          gpsLongitude: capture.gpsLongitude ?? undefined,
        });

        // 3. Sync the classification
        const localClassification = getClassificationForCapture(capture.id);
        if (localClassification) {
          await api.syncClassification({
            imageId: remoteImage.id,
            diseaseClass: localClassification.diseaseClass,
            confidence: localClassification.confidence,
            inferenceSource: "ON_DEVICE",
            classifiedAt: new Date(localClassification.classifiedAt).toISOString(),
          });
          markClassificationSynced(capture.id);
        }

        // 4. Mark local capture as synced
        markCaptureSynced(capture.id, upload.secure_url, upload.public_id);
        synced++;
      } catch (err) {
        markCaptureFailed(capture.id, String(err));
        failed++;
      }
    }
  } finally {
    _isSyncing = false;
  }

  return { synced, failed };
}

/** Fire-and-forget sync — never throws. */
export function triggerBackgroundSync(): void {
  syncPendingCaptures().catch((err) => console.warn("Background sync error:", err));
}
