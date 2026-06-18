import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface ConfidenceBarProps {
  value: number; // 0..1
  label?: string;
  compact?: boolean;
}

export function ConfidenceBar({ value, label, compact }: ConfidenceBarProps) {
  const pct = Math.round(value * 100);
  const barColor =
    pct >= 80 ? colors.brand[500] : pct >= 55 ? colors.alert.medium : colors.alert.high;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, compact && styles.trackCompact]}>
        <View style={[styles.fill, { width: `${pct}%` as `${number}%`, backgroundColor: barColor }]} />
      </View>
      {!compact && <Text style={[styles.pct, { color: barColor }]}>{pct}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 12, color: colors.surface.textMuted, width: 100 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.border,
    overflow: "hidden",
  },
  trackCompact: { height: 5 },
  fill: { height: "100%", borderRadius: 4 },
  pct: { fontSize: 13, fontWeight: "700", minWidth: 36, textAlign: "right" },
});
