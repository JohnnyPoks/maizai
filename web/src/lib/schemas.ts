import { z } from "zod";
import { DiseaseClass, InferenceSource, SyncStatus, Role, AccessRequestStatus, UrgencyLevel } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const accessRequestSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  affiliation: z.string().max(200).optional(),
  reason: z.string().min(30).max(500),
});

export const approveAccessRequestSchema = z.object({
  approvedRole: z.nativeEnum(Role),
  notes: z.string().max(500).optional(),
});

export const denyAccessRequestSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  role: z.nativeEnum(Role).optional(),
});

export const updateOwnProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const setPasswordSchema = z.object({
  newPassword: z.string().min(8),
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
  urgencyLevel: z.nativeEnum(UrgencyLevel),
  adviceType: z.string().min(1),
  adviceText: z.string().min(10),
  active: z.boolean(),
});

export const createThresholdSchema = z.object({
  diseaseClass: z.nativeEnum(DiseaseClass),
  parameter: z.string().min(1),
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  urgencyLevel: z.nativeEnum(UrgencyLevel),
  adviceType: z.string().min(1),
  adviceText: z.string().min(10),
  active: z.boolean().default(true),
});

export const patchThresholdSchema = z.object({
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
  adviceType: z.string().min(1).optional(),
  adviceText: z.string().min(10).optional(),
  active: z.boolean().optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export const accessRequestListSchema = listQuerySchema.extend({
  status: z.nativeEnum(AccessRequestStatus).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const classificationListSchema = listQuerySchema.extend({
  diseaseClass: z.nativeEnum(DiseaseClass).optional(),
  inferenceSource: z.nativeEnum(InferenceSource).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const sensorReadingListSchema = listQuerySchema.extend({
  nodeId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const recommendationListSchema = listQuerySchema.extend({
  urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
  diseaseClass: z.nativeEnum(DiseaseClass).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const leafImageListSchema = listQuerySchema.extend({
  syncStatus: z.nativeEnum(SyncStatus).optional(),
  diseaseClass: z.nativeEnum(DiseaseClass).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const userListSchema = listQuerySchema.extend({
  role: z.nativeEnum(Role).optional(),
});
