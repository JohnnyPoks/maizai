import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { useSyncStore } from "@/stores/sync-store";
import { strings } from "@/strings";

interface SyncStatusProps {
  onPress?: () => void;
}

export function SyncStatus({ onPress }: SyncStatusProps) {
  const { pendingCount, isSyncing } = useSyncStore();

  // The badge only exists while there is work to show, and it disappears the
  // moment the queue is empty and nothing is uploading.
  if (pendingCount === 0 && !isSyncing) return null;

  const label = isSyncing
    ? pendingCount > 0
      ? `Uploading ${pendingCount}…`
      : "Uploading…"
    : strings.capture.pendingCount(pendingCount);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.brand[500]} style={styles.spinner} />
      ) : (
        <View style={styles.dot} />
      )}
      <Text style={styles.label}>{label}</Text>
      <MaterialCommunityIcons
        name={isSyncing ? "cloud-sync" : "cloud-upload-outline"}
        size={14}
        color={colors.surface.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.earth[400],
  },
  spinner: { width: 14, height: 14 },
  label: { fontSize: 11, fontWeight: "600", color: colors.surface.textMuted },
});
