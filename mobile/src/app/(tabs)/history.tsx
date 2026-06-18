import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Text, Alert, RefreshControl } from "react-native";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getAllCaptures, getCaptureWithDetails, deleteCapture } from "@/lib/database";
import { HistoryListItem } from "@/components/history/history-list-item";
import { EmptyState } from "@/components/ui/empty-state";
import { useSync } from "@/hooks/use-sync";
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

export default function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const { sync } = useSync();

  function loadItems(): CaptureWithDetails[] {
    const captures = getAllCaptures(filter === "pending" ? "pending" : undefined);
    return captures
      .map((c) => getCaptureWithDetails(c.id))
      .filter((d): d is CaptureWithDetails => {
        if (!d) return false;
        if (filter === "healthy") return d.classification.diseaseClass === "Healthy";
        if (filter === "diseased") return d.classification.diseaseClass !== "Healthy";
        return true;
      });
  }

  const [items, setItems] = useState<CaptureWithDetails[]>(loadItems);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await sync();
    setItems(loadItems());
    setRefreshing(false);
  }, [sync]);

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
            onPress={() => {
              setFilter(f.key);
              setItems(loadItems());
            }}
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
        contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
      />
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
});
