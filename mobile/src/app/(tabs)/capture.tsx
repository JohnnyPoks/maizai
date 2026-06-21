import { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Alert, Linking, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCamera } from "@/hooks/use-camera";
import { useInference } from "@/hooks/use-inference";
import { ImageQualityError } from "@/lib/inference";
import { useSync } from "@/hooks/use-sync";
import { CameraView } from "@/components/capture/camera-view";
import { CaptureButton } from "@/components/capture/capture-button";
import { SyncStatus } from "@/components/shared/sync-status";
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
  const { sync, refreshPendingCount } = useSync();
  const [busy, setBusy] = useState(false);
  // Guards re-entry during the capture/pick phase without showing the overlay
  // (the overlay should only appear once we actually have an image to analyse).
  const inFlight = useRef(false);

  // Keep the pending badge accurate whenever this screen regains focus
  // (e.g. after saving a capture on the result screen).
  useFocusEffect(
    useCallback(() => {
      refreshPendingCount();
    }, [refreshPendingCount]),
  );

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
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      // Take the photo first (this is when the shutter sound/animation plays);
      // only then show the analysing overlay, so loading and capture stay in sync.
      const uri = await takePicture();
      if (!uri) {
        Alert.alert("Camera", "Could not capture an image. Please try again.");
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setBusy(true);
      await analyseAndSave(uri);
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }

  // Pick an existing photo from the gallery and run the same analysis. Useful
  // for testing the model on clean images and for leaves photographed earlier.
  async function handlePickFromGallery() {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      setBusy(true);
      await analyseAndSave(result.assets[0].uri);
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }

  async function analyseAndSave(uri: string) {
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

    // Reflect the new pending capture in the badge straight away, then fire
    // background sync (non-blocking).
    refreshPendingCount();
    triggerBackgroundSync();

    // Navigate to result
    router.push(`/result/${captureId}`);
  }

  const analysing = busy || isRunning;

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
        <View style={styles.captureRow}>
          <View style={styles.sideSlot} />
          <CaptureButton onPress={handleCapture} disabled={analysing} />
          <View style={styles.sideSlot}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handlePickFromGallery}
              disabled={analysing}
              accessibilityRole="button"
              accessibilityLabel="Pick a photo from gallery"
            >
              <MaterialCommunityIcons name="image-multiple-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full-screen analysing overlay — clearer, branded loading experience */}
      {analysing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconWrap}>
              <ActivityIndicator size="large" color={colors.brand[500]} />
              <MaterialCommunityIcons
                name="leaf"
                size={22}
                color={colors.brand[500]}
                style={styles.loadingLeaf}
              />
            </View>
            <Text style={styles.loadingTitle}>{strings.capture.analysing}</Text>
            <Text style={styles.loadingHint}>Running on-device diagnosis</Text>
          </View>
        </View>
      )}
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
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  sideSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  galleryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,42,28,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: colors.surface.background,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: "center",
    gap: 10,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  loadingIconWrap: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  loadingLeaf: { position: "absolute" },
  loadingTitle: { fontSize: 16, fontWeight: "700", color: colors.surface.text },
  loadingHint: { fontSize: 13, color: colors.surface.textMuted },
});
