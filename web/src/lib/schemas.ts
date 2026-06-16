import { z } from "zod";
import { DiseaseClass, InferenceSource, SyncStatus } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
});

export const syncImageSchema = z.object({
  base64Image: z.string().min(1),
  capturedAt: z.string().datetime(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
});

export const syncClassificationSchema = z.object({
  imageId: z.string().cuid(),
  diseaseClass: z.nativeEnum(DiseaseClass),
  confidence: z.number().min(0).max(1),
  inferenceSource: z.nativeEnum(InferenceSource).default(InferenceSource.ON_DEVICE),
  classifiedAt: z.string().datetime(),
});

export const syncReadingSchema = z.object({
  nodeId: z.string().min(1),
  soilMoisture: z.number().min(0).max(100),
  ambientTemperature: z.number().min(-10).max(60),
  relativeHumidity: z.number().min(0).max(100),
  recordedAt: z.string().datetime(),
});

export const sensorIngestSchema = z.object({
  nodeId: z.string().min(1),
  soilMoisture: z.number().min(0).max(100),
  ambientTemperature: z.number().min(-10).max(60),
  relativeHumidity: z.number().min(0).max(100),
  recordedAt: z.string().datetime().optional(),
});

export const generateRecommendationSchema = z.object({
  classificationId: z.string().cuid(),
  readingId: z.string().cuid().optional(),
});

export const updateThresholdSchema = z.object({
  id: z.string().cuid(),
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  adviceType: z.string().min(1),
  adviceText: z.string().min(10),
  active: z.boolean(),
});
