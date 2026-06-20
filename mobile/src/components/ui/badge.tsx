import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import type { UrgencyLevel, DiseaseClass } from "@/types/domain";

interface BadgeProps {
  label: string;
  urgency?: UrgencyLevel;
  disease?: DiseaseClass;
  synced?: boolean;
}

export function Badge({ label, urgency, disease, synced }: BadgeProps) {
  const bg = urgency
    ? urgencyBg[urgency]
    : disease
    ? diseaseBg(disease)
    : synced !== undefined
    ? (synced ? "#dcf0e1" : "#f0e6d6")
    : colors.brand[100];

  const text = urgency
    ? urgencyText[urgency]
    : disease
    ? diseaseText(disease)
    : synced !== undefined
    ? (synced ? colors.brand[700] : colors.earth[600])
    : colors.brand[700];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const urgencyBg: Record<UrgencyLevel, string> = {
  LOW: "#f0fdf4",
  MEDIUM: "#fffbeb",
  HIGH: "#fff1ee",
};

const urgencyText: Record<UrgencyLevel, string> = {
  LOW: colors.alert.low,
  MEDIUM: colors.alert.medium,
  HIGH: colors.alert.high,
};

function diseaseBg(d: DiseaseClass): string {
  if (d === "Healthy") return colors.brand[50];
  if (d === "Blight") return "#fff1ee";
  return "#fffbeb";
}

function diseaseText(d: DiseaseClass): string {
  if (d === "Healthy") return colors.brand[700];
  if (d === "Blight") return colors.alert.high;
  return colors.alert.medium;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
