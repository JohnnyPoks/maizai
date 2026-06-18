import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { useSyncStore } from "@/stores/sync-store";
import { strings } from "@/strings";

interface SyncStatusProps {
  onPress?: () => void;
}

export function SyncStatus({ onPress }: SyncStatusProps) {
  const { pendingCount, isSyncing } = useSyncStore();

  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={[styles.dot, isSyncing && styles.dotSyncing]} />
      <Text style={styles.label}>
        {isSyncing ? "Syncing…" : strings.capture.pendingCount(pendingCount)}
      </Text>
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
  dotSyncing: { backgroundColor: colors.brand[500] },
  label: { fontSize: 11, fontWeight: "600", color: colors.surface.textMuted },
});
