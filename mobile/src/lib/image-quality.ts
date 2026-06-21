/**
 * Pre-inference quality gate.
 *
 * The disease classifier has only four maize classes and no "not a maize leaf"
 * class, so a softmax model will always return a confident answer even for
 * unrelated inputs (a stool, a screen, a wall). These cheap colour/texture
 * heuristics reject obvious non-leaf images before inference runs.
 *
 * Operates on the already-resized 224×224 interleaved RGB byte array, so it
 * adds negligible cost to the existing pipeline.
 */

export interface QualityResult {
  ok: boolean;
  reason?: string;
}

const REJECTION_MESSAGE =
  "We could not detect a maize leaf in this photo. Please make sure you are capturing a single maize leaf in good lighting, with the leaf filling most of the frame, then try again.";

export function assessLeafImage(rgb: Uint8Array, pixelCount: number): QualityResult {
  if (pixelCount <= 0) return { ok: false, reason: REJECTION_MESSAGE };

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumLum = 0;

  for (let i = 0; i < pixelCount; i++) {
    const r = rgb[i * 3];
    const g = rgb[i * 3 + 1];
    const b = rgb[i * 3 + 2];
    sumR += r;
    sumG += g;
    sumB += b;
    sumLum += 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const avgR = sumR / pixelCount;
  const avgG = sumG / pixelCount;
  const avgB = sumB / pixelCount;
  const avgLum = sumLum / pixelCount;

  // Green-channel dominance: a maize leaf is dominantly green, even when diseased.
  if (avgG < 60 || (avgG < avgR && avgG < avgB)) {
    return { ok: false, reason: REJECTION_MESSAGE };
  }

  // Luminance: reject images that are too dark or blown out.
  if (avgLum < 40 || avgLum > 230) {
    return { ok: false, reason: REJECTION_MESSAGE };
  }

  // Colour variance: a near-uniform image is probably a wall, table, or screen.
  let varAcc = 0;
  for (let i = 0; i < pixelCount; i++) {
    const diff = rgb[i * 3 + 1] - avgG;
    varAcc += diff * diff;
  }
  const stdG = Math.sqrt(varAcc / pixelCount);
  if (stdG < 20) {
    return { ok: false, reason: REJECTION_MESSAGE };
  }

  return { ok: true };
}
