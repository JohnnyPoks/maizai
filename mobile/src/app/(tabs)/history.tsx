import { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAllCaptures, getCaptureWithDetails, deleteCapture } from "@/lib/database";
import { HistoryListItem } from "@/components/history/history-list-item";
import { EmptyState } from "@/components/ui/empty-state";
import { useSync } from "@/hooks/use-sync";
import { useSyncStore } from "@/stores/sync-store";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";
import type { CaptureWithDetails } from "@/types/domain";

type Filter = "all" | "healthy" | "diseased" | "pending";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: strings.history.filterAll },
  { key: "healthy", label: strings.history.filterHealthy },
  { key: "diseased", label: strings.history.filterDiseased },
  { key: "pending", label: strings.history.filterPending },
];

function loadItems(currentFilter: Filter): CaptureWithDetails[] {
  const captures = getAllCaptures(currentFilter === "pending" ? "pending" : undefined);
  return captures
    .map((c) => getCaptureWithDetails(c.id))
    .filter((d): d is CaptureWithDetails => {
      if (!d) return false;
      if (currentFilter === "healthy") return d.classification.diseaseClass === "Healthy";
      if (currentFilter === "diseased") return d.classification.diseaseClass !== "Healthy";
      return true;
    });
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<CaptureWithDetails[]>([]);
  const { sync, refreshPendingCount } = useSync();
  const { pendingCount, isSyncing, activeCaptureId } = useSyncStore();

  const reload = useCallback(() => {
    setItems(loadItems(filter));
  }, [filter]);

  // Reload when the filter changes and whenever the tab regains focus
  // (e.g. after a new capture is saved).
  useEffect(() => {
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      refreshPendingCount();
      reload();
    }, [refreshPendingCount, reload]),
  );

  // As each capture finishes uploading, the active id changes; reload so the
  // per-item cloud icons flip to "synced" live.
  useEffect(() => {
    reload();
  }, [activeCaptureId, reload]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await sync();
    reload();
    setRefreshing(false);
  }, [sync, reload]);

  function handleDelete(id: string) {
    Alert.alert(
      strings.history.deleteConfirmTitle,
      strings.history.deleteConfirmBody,
      [
        { text: strings.history.cancel, style: "cancel" },
        {
          text: strings.history.delete,
          style: "destructive",
          onPress: () => {
            deleteCapture(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{strings.history.title}</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryListItem
            item={item}
            onPress={() => router.push(`/result/${item.id}`)}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand[500]} />}
        ListEmptyComponent={
          <EmptyState
            icon="leaf-off"
            title={strings.history.empty}
            subtitle={strings.history.emptyDetail}
          />
        }
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 96 }}
      />

      {/* Floating sync button — shown while captures are awaiting upload. */}
      {(pendingCount > 0 || isSyncing) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={isSyncing ? undefined : sync}
          activeOpacity={0.85}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#fff" />
          )}
          <Text style={styles.fabText}>
            {isSyncing ? "Uploading…" : `Sync ${pendingCount}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "700", color: colors.surface.text },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  chipActive: { backgroundColor: colors.brand[50], borderColor: colors.brand[300] },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.surface.textMuted },
  chipTextActive: { color: colors.brand[600] },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand[500],
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
