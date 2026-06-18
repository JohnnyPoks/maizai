import type { CloudinaryUploadResponse } from "@/types/api";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "maizai_unsigned";

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * No Cloudinary API secret is embedded — the preset enforces security on the server side.
 */
export async function uploadToCloudinary(localUri: string): Promise<CloudinaryUploadResponse> {
  if (!CLOUD_NAME) {
    throw new Error("EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not set.");
  }

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: "leaf.jpg",
  } as unknown as Blob);
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
