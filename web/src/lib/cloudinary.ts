import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadLeafImage(
  base64Data: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder: `maizai/leaf-images/${userId}`,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1024, height: 1024, crop: "limit", quality: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteLeafImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
