import { View, Text, StyleSheet, Dimensions } from "react-native";
import { CameraView as ExpoCameraView } from "expo-camera";
import type { RefObject } from "react";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";

const { width: SCREEN_W } = Dimensions.get("window");
const FRAME_SIZE = SCREEN_W * 0.72;
const BRACKET = 22;
const BRACKET_THICKNESS = 3;

interface Props {
  cameraRef: RefObject<ExpoCameraView | null>;
}

export function CameraView({ cameraRef }: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <ExpoCameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Dimmed surround */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Top bar */}
        <View style={[styles.dim, { height: (SCREEN_W - FRAME_SIZE) / 2 + 20 }]} />
        <View style={styles.middleRow}>
          <View style={[styles.dim, { width: (SCREEN_W - FRAME_SIZE) / 2 }]} />

          {/* Frame with corner brackets */}
          <View style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
            {/* TL */}
            <View style={[styles.corner, styles.tl]} />
            {/* TR */}
            <View style={[styles.corner, styles.tr]} />
            {/* BL */}
            <View style={[styles.corner, styles.bl]} />
            {/* BR */}
            <View style={[styles.corner, styles.br]} />
          </View>

          <View style={[styles.dim, { width: (SCREEN_W - FRAME_SIZE) / 2 }]} />
        </View>
        {/* Bottom area */}
        <View style={[styles.dim, { flex: 1 }]}>
          <Text style={styles.instruction}>{strings.capture.instruction}</Text>
        </View>
      </View>
    </View>
  );
}

const bracketColor = colors.brand[400];

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: "column" },
  dim: { backgroundColor: "rgba(0,0,0,0.45)" },
  middleRow: { flexDirection: "row" },
  frame: { position: "relative" },
  corner: { position: "absolute", width: BRACKET, height: BRACKET },
  tl: { top: 0, left: 0, borderTopWidth: BRACKET_THICKNESS, borderLeftWidth: BRACKET_THICKNESS, borderColor: bracketColor, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: BRACKET_THICKNESS, borderRightWidth: BRACKET_THICKNESS, borderColor: bracketColor, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: BRACKET_THICKNESS, borderLeftWidth: BRACKET_THICKNESS, borderColor: bracketColor, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: BRACKET_THICKNESS, borderRightWidth: BRACKET_THICKNESS, borderColor: bracketColor, borderBottomRightRadius: 4 },
  instruction: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 14,
    letterSpacing: 0.2,
  },
});
