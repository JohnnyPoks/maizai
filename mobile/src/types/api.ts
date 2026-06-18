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

export interface SyncImageRequest {
  cloudinaryUrl: string;
  cloudinaryId: string;
  capturedAt: string; // ISO-8601
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface SyncImageResponse {
  id: string;
}

export interface SyncClassificationRequest {
  imageId: string;
  diseaseClass: DiseaseClass;
  confidence: number;
  inferenceSource: "ON_DEVICE";
  classifiedAt: string; // ISO-8601
}

export interface SyncClassificationResponse {
  id: string;
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

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  asset_id: string;
}

export interface AccessRequestBody {
  fullName: string;
  email: string;
  affiliation?: string;
  reason: string;
}
