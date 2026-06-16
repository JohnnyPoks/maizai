export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface SyncImageRequest {
  base64Image: string;
  capturedAt: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface SyncImageResponse {
  imageId: string;
  cloudinaryUrl: string;
}

export interface SyncClassificationRequest {
  imageId: string;
  diseaseClass: string;
  confidence: number;
  inferenceSource?: string;
  classifiedAt: string;
}

export interface SyncReadingRequest {
  nodeId: string;
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
  recordedAt: string;
}

export interface SensorIngestRequest {
  nodeId: string;
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
  recordedAt?: string;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}
