import { useState } from "react";
import { View, Text, StyleSheet, Alert, Linking } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCamera } from "@/hooks/use-camera";
import { useInference } from "@/hooks/use-inference";
import { ImageQualityError } from "@/lib/inference";
import { useSync } from "@/hooks/use-sync";
import { CameraView } from "@/components/capture/camera-view";
import { CaptureButton } from "@/components/capture/capture-button";
import { SyncStatus } from "@/components/shared/sync-status";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  insertCapture,
  insertClassification,
  insertRecommendation,
} from "@/lib/database";
import { generateRecommendation, getCachedThresholds } from "@/lib/rule-engine";
import { triggerBackgroundSync } from "@/lib/sync";
import { getCaptureLocation } from "@/lib/location";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";
import { dlogError } from "@/lib/debug-store";
import * as crypto from "expo-crypto";

const CONFIDENCE_THRESHOLD = 0.7;

export default function CaptureScreen() {
  const { cameraRef, permission, requestPermission, takePicture } = useCamera();
  const { classify, isRunning } = useInference();
  const { sync } = useSync();
  const [busy, setBusy] = useState(false);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>{strings.capture.cameraPermissionTitle}</Text>
        <Text style={styles.permissionBody}>{strings.capture.cameraPermissionBody}</Text>
        <Button
          label={strings.capture.openSettings}
          onPress={() => Linking.openSettings()}
          style={{ marginTop: 8 }}
        />
        <Button
          label="Grant permission"
          onPress={requestPermission}
          variant="secondary"
        />
      </View>
    );
  }

  async function handleCapture() {
    if (busy) return;
    setBusy(true); // show the loading state immediately on tap
    try {
      await runCapture();
    } finally {
      setBusy(false);
    }
  }

  async function runCapture() {
    const uri = await takePicture();
    if (!uri) {
      Alert.alert("Camera", "Could not capture an image. Please try again.");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let result;
    try {
      result = await classify(uri);
    } catch (err) {
      if (err instanceof ImageQualityError) {
        Alert.alert("Capture rejected", err.message);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      dlogError("capture", `Classification failed: ${msg}`);
      Alert.alert("Analysis failed", msg);
      return;
    }

    // Low-confidence guard: don't present or save an unclear result.
    if (result.confidence < CONFIDENCE_THRESHOLD) {
      Alert.alert(
        "Result unclear",
        "We could not confidently identify the leaf condition. Please capture again with the leaf centred and well-lit.",
      );
      return;
    }

    // Persist to SQLite
    const captureId = await generateId();
    const classificationId = await generateId();
    const recommendationId = await generateId();
    const now = Date.now();

    // Opt-in geotag (returns null unless the farmer enabled it in Settings).
    const coords = await getCaptureLocation();

    insertCapture({
      id: captureId,
      localUri: uri,
      capturedAt: now,
      gpsLatitude: coords?.latitude ?? null,
      gpsLongitude: coords?.longitude ?? null,
      syncStatus: "pending",
    });

    insertClassification({
      id: classificationId,
      captureId,
      diseaseClass: result.diseaseClass,
      confidence: result.confidence,
      probabilities: result.probabilities,
      inferenceSource: "ON_DEVICE",
      classifiedAt: now,
    });

    const thresholds = await getCachedThresholds();
    const recommendation = generateRecommendation(
      { diseaseClass: result.diseaseClass, confidence: result.confidence },
      null, // sensor context: Phase 2
      thresholds,
    );

    insertRecommendation({
      id: recommendationId,
      classificationId,
      adviceType: recommendation.adviceType,
      adviceText: recommendation.adviceText,
      urgencyLevel: recommendation.urgencyLevel,
      issuedAt: now,
      generatedLocally: true,
    });

    // Fire background sync (non-blocking)
    triggerBackgroundSync();

    // Navigate to result
    router.push(`/result/${captureId}`);
  }

  return (
    <View style={styles.container}>
      <CameraView cameraRef={cameraRef} />

      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <View style={{ flex: 1 }} />
        <SyncStatus onPress={sync} />
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {busy || isRunning ? (
          <Spinner message={strings.capture.analysing} />
        ) : (
          <CaptureButton onPress={handleCapture} disabled={busy} />
        )}
      </View>
    </View>
  );
}

async function generateId(): Promise<string> {
  return crypto.randomUUID();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
    backgroundColor: colors.surface.background,
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", color: colors.surface.text, textAlign: "center" },
  permissionBody: { fontSize: 14, color: colors.surface.textMuted, textAlign: "center", lineHeight: 20 },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
});
