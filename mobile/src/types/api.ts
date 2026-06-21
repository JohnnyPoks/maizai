import type { DiseaseClass, UrgencyLevel } from "./domain";

export interface ApiError {
  code: string;
  message: string;
}

export interface MobileSignInRequest {
  email: string;
  password: string;
}

export interface MobileSignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  mustChangePassword: boolean;
}

// Server disease-class enum (Prisma). Mobile uses a Title_Case variant; the
// two are bridged by upper-casing before sync (see api.syncCapture).
export type ServerDiseaseClass = "HEALTHY" | "COMMON_RUST" | "GRAY_LEAF_SPOT" | "BLIGHT";

export interface SyncCaptureRequest {
  base64Image: string; // data URI or raw base64
  capturedAt: string; // ISO-8601
  gpsLatitude?: number;
  gpsLongitude?: number;
  diseaseClass: ServerDiseaseClass;
  confidence: number;
  classifiedAt: string; // ISO-8601
  recommendation: {
    adviceType: string;
    adviceText: string;
    urgencyLevel: UrgencyLevel;
  };
}

export interface SyncCaptureResponse {
  imageId: string;
  classificationId?: string;
  cloudinaryUrl: string;
}

export interface ApiRuleThreshold {
  id: string;
  diseaseClass: DiseaseClass;
  parameter: "soilMoisture" | "ambientTemperature" | "relativeHumidity";
  minValue: number | null;
  maxValue: number | null;
  urgencyLevel: UrgencyLevel;
  adviceType: string;
  adviceText: string;
  active: boolean;
}

export interface AccessRequestBody {
  fullName: string;
  email: string;
  affiliation?: string;
  reason: string;
}
