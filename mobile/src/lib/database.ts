import * as SQLite from "expo-sqlite";
import type { Capture, Classification, Recommendation, CaptureWithDetails, SyncStatus } from "@/types/domain";

const db = SQLite.openDatabaseSync("maizai.db");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS captures (
  id TEXT PRIMARY KEY,
  local_uri TEXT NOT NULL,
  cloudinary_url TEXT,
  cloudinary_id TEXT,
  captured_at INTEGER NOT NULL,
  gps_latitude REAL,
  gps_longitude REAL,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at INTEGER,
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  last_sync_error TEXT,
  was_rejected INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classifications (
  id TEXT PRIMARY KEY,
  capture_id TEXT NOT NULL,
  disease_class TEXT NOT NULL,
  confidence REAL NOT NULL,
  inference_source TEXT NOT NULL DEFAULT 'ON_DEVICE',
  classified_at INTEGER NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (capture_id) REFERENCES captures(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  classification_id TEXT NOT NULL,
  advice_type TEXT NOT NULL,
  advice_text TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  generated_locally INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (classification_id) REFERENCES classifications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  soil_moisture REAL NOT NULL,
  ambient_temperature REAL NOT NULL,
  relative_humidity REAL NOT NULL,
  recorded_at INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'cloud',
  cached_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captures_sync ON captures(sync_status, captured_at);
CREATE INDEX IF NOT EXISTS idx_classifications_capture ON classifications(capture_id);
CREATE INDEX IF NOT EXISTS idx_sensor_recorded ON sensor_readings(node_id, recorded_at DESC);
`;

export function initDatabase(): void {
  db.execSync(SCHEMA_SQL);
  // Lightweight migrations for columns added after first release.
  try {
    db.execSync("ALTER TABLE classifications ADD COLUMN probabilities TEXT");
  } catch {
    // Column already exists — ignore.
  }
  try {
    db.execSync("ALTER TABLE captures ADD COLUMN was_rejected INTEGER NOT NULL DEFAULT 0");
  } catch {
    // Column already exists — ignore.
  }
}

// ── Captures ─────────────────────────────────────────────────────────────────

export function insertCapture(capture: Omit<Capture, "syncAttempts" | "lastSyncError" | "uploadedAt" | "cloudinaryUrl" | "cloudinaryId">): void {
  db.runSync(
    `INSERT INTO captures (id, local_uri, captured_at, gps_latitude, gps_longitude, sync_status, was_rejected)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    capture.id,
    capture.localUri,
    capture.capturedAt,
    capture.gpsLatitude ?? null,
    capture.gpsLongitude ?? null,
    capture.syncStatus,
    capture.wasRejected ? 1 : 0,
  );
}

export function getPendingCaptures(): Capture[] {
  // Retry failed uploads too, not just never-attempted ones. Rejected
  // ("not a maize leaf") captures are debug-only and never synced.
  return db
    .getAllSync<Record<string, unknown>>(
      `SELECT * FROM captures WHERE sync_status IN ('pending', 'failed') AND was_rejected = 0 ORDER BY captured_at ASC LIMIT 20`,
    )
    .map(rowToCapture);
}

export function getAllCaptures(filter?: "Healthy" | "diseased" | "pending"): Capture[] {
  let sql = "SELECT * FROM captures";
  // "pending" in the UI means "not yet synced" (includes failed retries).
  if (filter === "pending") sql += " WHERE sync_status != 'synced'";
  sql += " ORDER BY captured_at DESC";
  return db.getAllSync<Record<string, unknown>>(sql).map(rowToCapture);
}

export function getCaptureById(id: string): Capture | null {
  const row = db.getFirstSync<Record<string, unknown>>(
    "SELECT * FROM captures WHERE id = ?",
    id,
  );
  return row ? rowToCapture(row) : null;
}

export function markCaptureSynced(id: string, cloudinaryUrl: string, cloudinaryId: string): void {
  db.runSync(
    `UPDATE captures SET sync_status = 'synced', cloudinary_url = ?, cloudinary_id = ?, uploaded_at = ? WHERE id = ?`,
    cloudinaryUrl,
    cloudinaryId,
    Date.now(),
    id,
  );
}

export function markCaptureFailed(id: string, error: string): void {
  db.runSync(
    `UPDATE captures SET sync_status = 'failed', sync_attempts = sync_attempts + 1, last_sync_error = ? WHERE id = ?`,
    error,
    id,
  );
}

export function deleteCapture(id: string): void {
  db.runSync("DELETE FROM captures WHERE id = ?", id);
}

export function clearAllCaptures(): void {
  db.runSync("DELETE FROM captures");
}

// ── Classifications ───────────────────────────────────────────────────────────

export function insertClassification(c: Omit<Classification, "syncStatus">): void {
  db.runSync(
    `INSERT INTO classifications (id, capture_id, disease_class, confidence, probabilities, inference_source, classified_at, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    c.id,
    c.captureId,
    c.diseaseClass,
    c.confidence,
    c.probabilities ? JSON.stringify(c.probabilities) : null,
    c.inferenceSource,
    c.classifiedAt,
  );
}

export function getClassificationForCapture(captureId: string): Classification | null {
  const row = db.getFirstSync<Record<string, unknown>>(
    "SELECT * FROM classifications WHERE capture_id = ? LIMIT 1",
    captureId,
  );
  return row ? rowToClassification(row) : null;
}

export function markClassificationSynced(captureId: string): void {
  db.runSync(
    "UPDATE classifications SET sync_status = 'synced' WHERE capture_id = ?",
    captureId,
  );
}

// ── Recommendations ───────────────────────────────────────────────────────────

export function insertRecommendation(r: Omit<Recommendation, never>): void {
  db.runSync(
    `INSERT INTO recommendations (id, classification_id, advice_type, advice_text, urgency_level, issued_at, generated_locally)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    r.id,
    r.classificationId,
    r.adviceType,
    r.adviceText,
    r.urgencyLevel,
    r.issuedAt,
    r.generatedLocally ? 1 : 0,
  );
}

export function getRecommendationForClassification(classificationId: string): Recommendation | null {
  const row = db.getFirstSync<Record<string, unknown>>(
    "SELECT * FROM recommendations WHERE classification_id = ? LIMIT 1",
    classificationId,
  );
  return row ? rowToRecommendation(row) : null;
}

// ── Composite ─────────────────────────────────────────────────────────────────

export function getCaptureWithDetails(captureId: string): CaptureWithDetails | null {
  const capture = getCaptureById(captureId);
  if (!capture) return null;
  const classification = getClassificationForCapture(captureId);
  if (!classification) return null;
  const recommendation = getRecommendationForClassification(classification.id);
  if (!recommendation) return null;
  return { ...capture, classification, recommendation };
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToCapture(row: Record<string, unknown>): Capture {
  return {
    id: row.id as string,
    localUri: row.local_uri as string,
    cloudinaryUrl: (row.cloudinary_url as string | null) ?? null,
    cloudinaryId: (row.cloudinary_id as string | null) ?? null,
    capturedAt: row.captured_at as number,
    gpsLatitude: (row.gps_latitude as number | null) ?? null,
    gpsLongitude: (row.gps_longitude as number | null) ?? null,
    syncStatus: row.sync_status as SyncStatus,
    uploadedAt: (row.uploaded_at as number | null) ?? null,
    syncAttempts: row.sync_attempts as number,
    lastSyncError: (row.last_sync_error as string | null) ?? null,
    wasRejected: (row.was_rejected as number | null) === 1,
  };
}

function rowToClassification(row: Record<string, unknown>): Classification {
  let probabilities: Classification["probabilities"] = null;
  if (row.probabilities) {
    try {
      probabilities = JSON.parse(row.probabilities as string);
    } catch {
      probabilities = null;
    }
  }
  return {
    id: row.id as string,
    captureId: row.capture_id as string,
    diseaseClass: row.disease_class as Classification["diseaseClass"],
    confidence: row.confidence as number,
    probabilities,
    inferenceSource: row.inference_source as "ON_DEVICE",
    classifiedAt: row.classified_at as number,
    syncStatus: row.sync_status as SyncStatus,
  };
}

function rowToRecommendation(row: Record<string, unknown>): Recommendation {
  return {
    id: row.id as string,
    classificationId: row.classification_id as string,
    adviceType: row.advice_type as string,
    adviceText: row.advice_text as string,
    urgencyLevel: row.urgency_level as Recommendation["urgencyLevel"],
    issuedAt: row.issued_at as number,
    generatedLocally: (row.generated_locally as number) === 1,
  };
}
