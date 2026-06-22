import { View, Text, StyleSheet } from "react-native";
import { CameraView as ExpoCameraView } from "expo-camera";
import type { RefObject } from "react";
import { strings } from "@/strings";

interface Props {
  cameraRef: RefObject<ExpoCameraView | null>;
  // When false the native camera is unmounted (and released). Mounting it only
  // while the screen is focused avoids the camera freezing / going black after
  // navigating away and back, and frees the camera (e.g. so the torch works
  // elsewhere). Re-mounting on focus gives a fresh camera session.
  active?: boolean;
}

export function CameraView({ cameraRef, active = true }: Props) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.bg]}>
      {active && (
        <ExpoCameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      )}

      {/* Lightweight hint only — the full frame is captured and analysed. */}
      {active && (
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={styles.hint}>{strings.capture.instruction}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: "#000" },
  hintWrap: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hint: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
});
