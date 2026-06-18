import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const typography = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "700", color: colors.surface.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700", color: colors.surface.text, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600", color: colors.surface.text },
  body: { fontSize: 15, fontWeight: "400", color: colors.surface.text, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400", color: colors.surface.textMuted, lineHeight: 19 },
  label: { fontSize: 12, fontWeight: "600", color: colors.surface.textMuted, letterSpacing: 0.5 },
  mono: { fontSize: 13, fontFamily: "monospace", color: colors.surface.text },
});
