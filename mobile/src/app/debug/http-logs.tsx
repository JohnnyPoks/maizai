import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Share, Alert } from "react-native";
import type { HttpLogEntry } from "@/lib/debug-store";
import { debugStore } from "@/lib/debug-store";

export default function HttpLogsScreen() {
  const [logs, setLogs] = useState<HttpLogEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLogs(debugStore.getHttpLogs());
    return debugStore.subscribe(() => setLogs(debugStore.getHttpLogs()));
  }, []);

  function statusColor(entry: HttpLogEntry): string {
    if (entry.error) return "#ef4444";
    if (!entry.statusCode) return "#888";
    if (entry.statusCode < 300) return "#4ade80";
    if (entry.statusCode < 400) return "#facc15";
    return "#ef4444";
  }

  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No HTTP requests yet.</Text>
        <Text style={styles.emptyHint}>Navigate the app to see requests here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      data={logs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.count}>{logs.length} requests</Text>
          <TouchableOpacity
            onPress={() => {
              debugStore.clearHttpLogs();
              Alert.alert("Cleared");
            }}
          >
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const text = logs
                .map((e) => `[${e.at}] ${e.method} ${e.url} → ${e.statusCode ?? e.error ?? "?"} (${e.durationMs ?? "?"}ms)`)
                .join("\n");
              await Share.share({ message: text });
            }}
          >
            <Text style={styles.clearBtn}>Share</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => {
        const isExpanded = expanded === item.id;
        const color = statusColor(item);
        return (
          <TouchableOpacity
            style={styles.entry}
            onPress={() => setExpanded(isExpanded ? null : item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.entryHeader}>
              <Text style={[styles.method, { backgroundColor: color + "33", color }]}>
                {item.method}
              </Text>
              <Text style={styles.url} numberOfLines={isExpanded ? 5 : 1}>
                {item.url}
              </Text>
            </View>
            <View style={styles.entryMeta}>
              <Text style={[styles.status, { color }]}>
                {item.error ?? (item.statusCode ? `${item.statusCode}` : "pending")}
              </Text>
              {item.durationMs != null && (
                <Text style={styles.duration}>{item.durationMs}ms</Text>
              )}
              <Text style={styles.time}>{item.at.slice(11, 19)}</Text>
            </View>
            {isExpanded && (
              <View style={styles.body}>
                {item.requestBody && (
                  <>
                    <Text style={styles.bodyLabel}>Request Body</Text>
                    <Text style={styles.bodyText}>{item.requestBody}</Text>
                  </>
                )}
                {item.responseBody && (
                  <>
                    <Text style={styles.bodyLabel}>Response Body</Text>
                    <Text style={styles.bodyText}>{item.responseBody}</Text>
                  </>
                )}
                {item.error && (
                  <>
                    <Text style={styles.bodyLabel}>Error</Text>
                    <Text style={[styles.bodyText, { color: "#ef4444" }]}>{item.error}</Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f0f0f" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f0f", gap: 8 },
  emptyText: { color: "#e5e5e5", fontSize: 16, fontWeight: "600" },
  emptyHint: { color: "#666", fontSize: 13 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 12 },
  count: { flex: 1, color: "#888", fontSize: 12 },
  clearBtn: { color: "#4ade80", fontSize: 13, fontWeight: "600" },
  entry: {
    backgroundColor: "#1c1c1e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 6,
  },
  entryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  method: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  url: { flex: 1, fontSize: 12, color: "#e5e5e5", fontFamily: "monospace" },
  entryMeta: { flexDirection: "row", gap: 10 },
  status: { fontSize: 12, fontWeight: "700" },
  duration: { fontSize: 12, color: "#888" },
  time: { fontSize: 12, color: "#555", marginLeft: "auto" },
  body: { borderTopWidth: 1, borderColor: "#333", paddingTop: 8, gap: 4 },
  bodyLabel: { fontSize: 10, fontWeight: "700", color: "#888", textTransform: "uppercase" },
  bodyText: { fontSize: 11, color: "#aaa", fontFamily: "monospace" },
});
