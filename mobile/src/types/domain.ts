export type DiseaseClass =
  | "Healthy"
  | "Common_Rust"
  | "Gray_Leaf_Spot"
  | "Northern_Leaf_Blight"
  | "Not_Maize";
export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH";
export type SyncStatus = "pending" | "synced" | "failed";
export type InferenceSource = "ON_DEVICE";

export interface Capture {
  id: string;
  localUri: string;
  cloudinaryUrl: string | null;
  cloudinaryId: string | null;
  capturedAt: number; // Unix ms
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  syncStatus: SyncStatus;
  uploadedAt: number | null;
  syncAttempts: number;
  lastSyncError: string | null;
  // True when saved despite the model rejecting it as "not a maize leaf".
  // These are kept local (debug only) and never synced.
  wasRejected: boolean;
}

export interface Classification {
  id: string;
  captureId: string;
  diseaseClass: DiseaseClass;
  confidence: number;
  probabilities: Record<DiseaseClass, number> | null;
  inferenceSource: InferenceSource;
  classifiedAt: number;
  syncStatus: SyncStatus;
}

export interface Recommendation {
  id: string;
  classificationId: string;
  adviceType: string;
  adviceText: string;
  urgencyLevel: UrgencyLevel;
  issuedAt: number;
  generatedLocally: boolean;
}

export interface SensorReading {
  id: string;
  nodeId: string;
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
  recordedAt: number;
  source: "cloud" | "local";
  cachedAt: number;
}

export interface CaptureWithDetails extends Capture {
  classification: Classification;
  recommendation: Recommendation;
}
