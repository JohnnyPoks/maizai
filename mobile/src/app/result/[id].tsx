import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getCaptureWithDetails, deleteCapture } from "@/lib/database";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";
import type { CaptureWithDetails, DiseaseClass } from "@/types/domain";

const DISEASE_CLASSES: DiseaseClass[] = ["Common_Rust", "Gray_Leaf_Spot", "Healthy", "Blight"];

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<CaptureWithDetails | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const data = getCaptureWithDetails(id);
    setDetail(data);
  }, [id]);

  if (detail === undefined) return <Spinner fullScreen />;
  if (!detail) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Result not found.</Text>
        <Button label="Close" onPress={() => router.back()} />
      </View>
    );
  }

  const { classification, recommendation } = detail;
  const isSynced = detail.syncStatus === "synced";
  const capturedDate = new Date(detail.capturedAt).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleShare() {
    await Share.share({
      message: `MaizAI Diagnosis\nCondition: ${strings.diseases[classification.diseaseClass]}\nConfidence: ${Math.round(classification.confidence * 100)}%\nRecommendation: ${recommendation.adviceText}`,
    });
  }

  function handleDelete() {
    if (!detail) return;
    Alert.alert(strings.history.deleteConfirmTitle, strings.history.deleteConfirmBody, [
      { text: strings.history.cancel, style: "cancel" },
      {
        text: strings.history.delete,
        style: "destructive",
        onPress: () => {
          deleteCapture(detail.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={22} color={colors.surface.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{strings.result.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Captured image */}
        <Image
          source={{ uri: detail.localUri }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />

        {/* Classification */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings.result.diseaseLabel}</Text>
          <View style={styles.diseaseRow}>
            <Text style={styles.diseaseName}>{strings.diseases[classification.diseaseClass]}</Text>
            <Badge
              label={strings.urgency[recommendation.urgencyLevel]}
              urgency={recommendation.urgencyLevel}
            />
          </View>
          <ConfidenceBar value={classification.confidence} />
        </View>

        {/* Probability distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings.result.probabilitiesLabel}</Text>
          <View style={styles.probList}>
            {DISEASE_CLASSES.map((cls) => (
              <View key={cls} style={styles.probRow}>
                <Text style={[styles.probLabel, cls === classification.diseaseClass && styles.probLabelActive]}>
                  {strings.diseases[cls]}
                </Text>
                <ConfidenceBar
                  value={(detail as unknown as Record<string, unknown>)[cls as string] as number ?? 0}
                  compact
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recommendation */}
        <View style={[styles.section, styles.recBox, urgencyBg(recommendation.urgencyLevel)]}>
          <View style={styles.recHeader}>
            <MaterialCommunityIcons
              name={urgencyIcon(recommendation.urgencyLevel)}
              size={20}
              color={urgencyColor(recommendation.urgencyLevel)}
            />
            <Text style={[styles.recType, { color: urgencyColor(recommendation.urgencyLevel) }]}>
              {recommendation.adviceType}
            </Text>
          </View>
          <Text style={styles.recText}>{recommendation.adviceText}</Text>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <MetaRow icon="clock-outline" label={strings.result.capturedAt} value={capturedDate} />
          <MetaRow icon="lightning-bolt" label="Analysis" value="On-device, under a second" />
          <MetaRow
            icon={isSynced ? "cloud-check" : "cloud-clock-outline"}
            label={strings.result.syncStatus}
            value={isSynced ? strings.result.synced : strings.result.pendingSync}
            valueColor={isSynced ? colors.brand[500] : colors.earth[500]}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label={strings.result.saveAndCaptureAnother}
            onPress={() => router.replace("/(tabs)/capture")}
          />
          <Button label={strings.result.share} onPress={handleShare} variant="secondary" />
          <Button label={strings.result.delete} onPress={handleDelete} variant="danger" />
        </View>
      </ScrollView>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metaRow}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.surface.textMuted} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function urgencyBg(u: string): { backgroundColor: string } {
  if (u === "HIGH") return { backgroundColor: "#fff1ee" };
  if (u === "MEDIUM") return { backgroundColor: "#fffbeb" };
  return { backgroundColor: colors.brand[50] };
}

function urgencyColor(u: string): string {
  if (u === "HIGH") return colors.alert.high;
  if (u === "MEDIUM") return colors.alert.medium;
  return colors.alert.low;
}

function urgencyIcon(u: string): keyof typeof MaterialCommunityIcons.glyphMap {
  if (u === "HIGH") return "alert-circle";
  if (u === "MEDIUM") return "alert";
  return "check-circle";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.surface.text },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surface.elevated,
  },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.surface.elevated,
  },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.surface.textMuted, letterSpacing: 0.5, textTransform: "uppercase" },
  diseaseRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  diseaseName: { fontSize: 22, fontWeight: "700", color: colors.surface.text },
  probList: { gap: 8 },
  probRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  probLabel: { fontSize: 12, color: colors.surface.textMuted, width: 110 },
  probLabelActive: { color: colors.surface.text, fontWeight: "600" },
  recBox: { borderRadius: 12, padding: 14, gap: 8 },
  recHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  recType: { fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  recText: { fontSize: 14, color: colors.surface.text, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaLabel: { fontSize: 13, color: colors.surface.textMuted, flex: 1 },
  metaValue: { fontSize: 13, color: colors.surface.text, fontWeight: "500" },
  actions: { gap: 10 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  notFoundText: { fontSize: 16, color: colors.surface.textMuted },
});
