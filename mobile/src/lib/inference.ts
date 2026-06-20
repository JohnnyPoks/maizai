import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
// jpeg-js is a pure-JS JPEG decoder — no native bindings required
import jpegJs from "jpeg-js";
import { dlog, dlogWarn } from "./debug-store";

let modelInstance: TensorflowModel | null = null;

export const DISEASE_CLASSES = [
  "Common_Rust",
  "Gray_Leaf_Spot",
  "Healthy",
  "Blight",
] as const;

export type DiseaseClass = (typeof DISEASE_CLASSES)[number];

export interface ClassificationResult {
  diseaseClass: DiseaseClass;
  confidence: number;
  probabilities: Record<DiseaseClass, number>;
  inferenceTimeMs: number;
}

const INPUT_SIZE = 224;

export async function initialiseModel(): Promise<void> {
  if (modelInstance) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const modelAsset = require("../../assets/models/maize_classifier.tflite");
  modelInstance = await loadTensorflowModel(modelAsset, []);
  const input = modelInstance.inputs[0];
  const output = modelInstance.outputs[0];
  dlog(
    "inference",
    `Model loaded. input=${input?.dataType} ${JSON.stringify(input?.shape)} ` +
      `output=${output?.dataType} ${JSON.stringify(output?.shape)}`,
  );
}

export async function classifyLeaf(imageUri: string): Promise<ClassificationResult> {
  if (!modelInstance) {
    throw new Error("Model not initialised. Call initialiseModel() first.");
  }

  const inputSpec = modelInstance.inputs[0];
  if (!inputSpec) {
    throw new Error("Model has no input tensor.");
  }

  // Step 1: Resize to the model's input resolution (224×224)
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false },
  );

  // Step 2: Decode JPEG → interleaved RGB bytes
  const rgb = await decodeRgb(resized.uri);
  const pixelCount = INPUT_SIZE * INPUT_SIZE * 3;
  if (rgb.length < pixelCount) {
    throw new Error(`Decoded image too small: got ${rgb.length} bytes, expected ${pixelCount}.`);
  }

  // Step 3: Build the input tensor in whatever dtype the model expects.
  const inputBuffer = buildInputBuffer(rgb, inputSpec.dataType);

  // Step 4: Run inference
  const start = performance.now();
  const output = modelInstance.runSync([inputBuffer]);
  const inferenceTimeMs = Math.round(performance.now() - start);

  // Step 5: Interpret output according to its dtype
  const outputSpec = modelInstance.outputs[0];
  const scores = readOutputScores(output[0], outputSpec?.dataType ?? "float32");

  if (scores.length < DISEASE_CLASSES.length) {
    throw new Error(
      `Model returned ${scores.length} scores, expected ${DISEASE_CLASSES.length}.`,
    );
  }

  // Normalise to a probability distribution (handles raw logits or quantised ints)
  const total = scores.reduce((a, b) => a + b, 0);
  const norm = total > 0 ? total : 1;

  const probabilities = {} as Record<DiseaseClass, number>;
  DISEASE_CLASSES.forEach((cls, i) => {
    probabilities[cls] = scores[i] / norm;
  });

  let bestClass: DiseaseClass = DISEASE_CLASSES[0];
  let bestProb = -1;
  for (const cls of DISEASE_CLASSES) {
    if (probabilities[cls] > bestProb) {
      bestProb = probabilities[cls];
      bestClass = cls;
    }
  }

  dlog(
    "inference",
    `Result=${bestClass} (${(bestProb * 100).toFixed(1)}%) in ${inferenceTimeMs}ms`,
  );

  return { diseaseClass: bestClass, confidence: bestProb, probabilities, inferenceTimeMs };
}

/**
 * Builds the model input buffer. Most Keras/TFLite image classifiers expect a
 * float32 tensor normalised to [0, 1]; quantised models expect uint8/int8.
 * We adapt to whatever the model actually declares.
 */
function buildInputBuffer(rgb: Uint8Array, dataType: string): ArrayBuffer {
  const pixelCount = INPUT_SIZE * INPUT_SIZE * 3;

  if (dataType === "float32") {
    const floats = new Float32Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      floats[i] = rgb[i] / 255; // normalise to [0, 1]
    }
    return floats.buffer;
  }

  if (dataType === "uint8" || dataType === "int8") {
    const bytes = new Uint8Array(pixelCount);
    bytes.set(rgb.subarray(0, pixelCount));
    return bytes.buffer;
  }

  dlogWarn("inference", `Unexpected input dtype "${dataType}" — sending uint8.`);
  const fallback = new Uint8Array(pixelCount);
  fallback.set(rgb.subarray(0, pixelCount));
  return fallback.buffer;
}

/** Reads the raw output buffer into a plain number[] based on its dtype. */
function readOutputScores(buffer: ArrayBuffer, dataType: string): number[] {
  switch (dataType) {
    case "float32":
      return Array.from(new Float32Array(buffer));
    case "int32":
      return Array.from(new Int32Array(buffer));
    case "int8":
      return Array.from(new Int8Array(buffer));
    case "uint8":
    default:
      return Array.from(new Uint8Array(buffer));
  }
}

/**
 * Reads a JPEG file, decodes it with jpeg-js, and returns a Uint8Array of
 * interleaved RGB values (3 bytes/pixel).
 */
async function decodeRgb(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryString = atob(base64);
  const rawBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    rawBytes[i] = binaryString.charCodeAt(i);
  }

  const { width, height, data } = jpegJs.decode(rawBytes, { useTArray: true });

  // data is RGBA (4 bytes/pixel); model expects RGB (3 bytes/pixel)
  const pixels = width * height;
  const rgb = new Uint8Array(pixels * 3);
  for (let i = 0; i < pixels; i++) {
    rgb[i * 3] = data[i * 4];
    rgb[i * 3 + 1] = data[i * 4 + 1];
    rgb[i * 3 + 2] = data[i * 4 + 2];
  }
  return rgb;
}
