import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Badge } from "@/components/ui/badge";
import { useSyncStore } from "@/stores/sync-store";
import { strings } from "@/strings";
import type { CaptureWithDetails } from "@/types/domain";

interface Props {
  item: CaptureWithDetails;
  onPress: () => void;
  onLongPress: () => void;
}

export function HistoryListItem({ item, onPress, onLongPress }: Props) {
  const { capture, classification, recommendation } = {
    capture: item,
    classification: item.classification,
    recommendation: item.recommendation,
  };
  const relativeTime = formatRelative(capture.capturedAt);
  const uploading = useSyncStore((s) => s.activeCaptureId === capture.id);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: capture.localUri }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Badge label={strings.diseases[classification.diseaseClass]} disease={classification.diseaseClass} />
          <Text style={styles.time}>{relativeTime}</Text>
        </View>
        <Text style={styles.confidence}>
          {Math.round(classification.confidence * 100)}% confidence · {strings.urgency[recommendation.urgencyLevel]} urgency
        </Text>
      </View>
      {uploading ? (
        <ActivityIndicator size="small" color={colors.brand[500]} />
      ) : (
        <MaterialCommunityIcons
          name={capture.syncStatus === "synced" ? "cloud-check" : "cloud-clock-outline"}
          size={18}
          color={capture.syncStatus === "synced" ? colors.brand[400] : colors.earth[400]}
        />
      )}
    </TouchableOpacity>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
  },
  thumbnail: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.surface.elevated },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  time: { fontSize: 11, color: colors.surface.textMuted },
  confidence: { fontSize: 12, color: colors.surface.textMuted },
});
