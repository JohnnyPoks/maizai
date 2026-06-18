import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
// jpeg-js is a pure-JS JPEG decoder — no native bindings required
import jpegJs from "jpeg-js";

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

export async function initialiseModel(): Promise<void> {
  if (modelInstance) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  modelInstance = await loadTensorflowModel(require("../../assets/models/maize_classifier.tflite"));
}

export async function classifyLeaf(imageUri: string): Promise<ClassificationResult> {
  if (!modelInstance) {
    throw new Error("Model not initialised. Call initialiseModel() first.");
  }

  // Step 1: Resize to the model's input resolution (224×224)
  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 224, height: 224 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false },
  );

  // Step 2: Decode JPEG → RGBA pixel array using jpeg-js
  const inputTensor = await imageToUint8Tensor(resized.uri);

  // Step 3: Run inference
  const start = performance.now();
  const output = modelInstance.runSync([inputTensor]);
  const inferenceTimeMs = Math.round(performance.now() - start);

  // Step 4: Interpret output
  // The model outputs a uint8 quantised softmax vector of length 4
  // matching the order of DISEASE_CLASSES.
  const rawScores = Array.from(output[0] as Uint8Array);
  const total = rawScores.reduce((a, b) => a + b, 0) || 1;

  const probabilities: Record<DiseaseClass, number> = {
    Common_Rust: rawScores[0] / total,
    Gray_Leaf_Spot: rawScores[1] / total,
    Healthy: rawScores[2] / total,
    Blight: rawScores[3] / total,
  };

  let bestClass: DiseaseClass = "Healthy";
  let bestProb = 0;
  for (const cls of DISEASE_CLASSES) {
    if (probabilities[cls] > bestProb) {
      bestProb = probabilities[cls];
      bestClass = cls;
    }
  }

  return { diseaseClass: bestClass, confidence: bestProb, probabilities, inferenceTimeMs };
}

/**
 * Reads a JPEG file, decodes it with jpeg-js, and returns a Uint8Array of
 * interleaved RGB values suitable for the TFLite model input [1, 224, 224, 3].
 */
async function imageToUint8Tensor(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // jpeg-js needs a Buffer; Buffer is globally polyfilled in React Native.
  const rawBytes = Buffer.from(base64, "base64");
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
