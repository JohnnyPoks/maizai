import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Share, Alert } from "react-native";
import type { AppLogEntry, LogLevel } from "@/lib/debug-store";
import { debugStore } from "@/lib/debug-store";

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: "#4ade80",
  warn: "#facc15",
  error: "#ef4444",
};

export default function AppLogsScreen() {
  const [logs, setLogs] = useState<AppLogEntry[]>([]);

  useEffect(() => {
    setLogs(debugStore.getAppLogs());
    return debugStore.subscribe(() => setLogs(debugStore.getAppLogs()));
  }, []);

  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No app logs yet.</Text>
        <Text style={styles.emptyHint}>Use dlog() in code to capture messages here.</Text>
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
          <Text style={styles.count}>{logs.length} entries</Text>
          <TouchableOpacity
            onPress={() => {
              debugStore.clearAppLogs();
              Alert.alert("Cleared");
            }}
          >
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const text = logs
                .map((e) => `[${e.at.slice(11, 19)}] [${e.level.toUpperCase()}] ${e.tag}: ${e.message}`)
                .join("\n");
              await Share.share({ message: text });
            }}
          >
            <Text style={styles.clearBtn}>Share</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => {
        const color = LEVEL_COLOR[item.level];
        return (
          <View style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={[styles.level, { color, backgroundColor: color + "22" }]}>
                {item.level.toUpperCase()}
              </Text>
              <Text style={styles.tag}>{item.tag}</Text>
              <Text style={styles.time}>{item.at.slice(11, 19)}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
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
  entry: { backgroundColor: "#1c1c1e", borderRadius: 10, padding: 12, marginBottom: 6, gap: 6 },
  entryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  level: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  tag: { fontSize: 12, color: "#888", fontFamily: "monospace" },
  time: { marginLeft: "auto", fontSize: 11, color: "#555" },
  message: { fontSize: 13, color: "#e5e5e5", fontFamily: "monospace" },
});
