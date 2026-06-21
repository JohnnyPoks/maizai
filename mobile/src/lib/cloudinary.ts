import * as FileSystem from "expo-file-system/legacy";
import type { CloudinaryUploadResponse } from "@/types/api";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "maizai_unsigned";

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 *
 * The image is sent as a base64 data URI in a string FormData part. React
 * Native 0.85's FormData rejects `{ uri, type, name }` file-object parts
 * ("Unsupported FormDataPart implementation"), but Cloudinary accepts a data
 * URI in the `file` field, and string parts are always supported.
 *
 * No Cloudinary API secret is embedded — the unsigned preset enforces security.
 */
export async function uploadToCloudinary(localUri: string): Promise<CloudinaryUploadResponse> {
  if (!CLOUD_NAME) {
    throw new Error("EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
  }

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const formData = new FormData();
  formData.append("file", `data:image/jpeg;base64,${base64}`);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "maizai/captures");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<CloudinaryUploadResponse>;
}
