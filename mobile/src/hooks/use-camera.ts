import { useState, useRef } from "react";
import { useCameraPermissions } from "expo-camera";
import type { CameraView } from "expo-camera";

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  async function takePicture(): Promise<string | null> {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: false,
        skipProcessing: false,
      });
      return photo?.uri ?? null;
    } catch (err) {
      console.warn("takePicture error:", err);
      return null;
    }
  }

  return {
    cameraRef,
    permission,
    requestPermission,
    isPermissionGranted: permission?.granted ?? false,
    takePicture,
  };
}
