import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Share,
} from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { client, getDefaultBaseUrl } from "@/lib/api";
import { saveDebugApiUrl, getDebugApiUrl } from "@/lib/debug-http";
import { debugStore } from "@/lib/debug-store";

export default function DebugDashboard() {
  const [currentUrl, setCurrentUrl] = useState(client.defaults.baseURL ?? getDefaultBaseUrl());
  const [urlInput, setUrlInput] = useState("");
  const [isOverridden, setIsOverridden] = useState(false);
  const [appLogCount, setAppLogCount] = useState(0);
  const [httpLogCount, setHttpLogCount] = useState(0);

  useEffect(() => {
    getDebugApiUrl().then((saved) => {
      setIsOverridden(!!saved);
      setCurrentUrl(saved ?? client.defaults.baseURL ?? getDefaultBaseUrl());
    });
    const unsub = debugStore.subscribe(() => {
      setAppLogCount(debugStore.getAppLogs().length);
      setHttpLogCount(debugStore.getHttpLogs().length);
    });
    setAppLogCount(debugStore.getAppLogs().length);
    setHttpLogCount(debugStore.getHttpLogs().length);
    return unsub;
  }, []);

  const applyUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) {
      Alert.alert("Empty URL", "Paste a tunnel URL first.");
      return;
    }
    await saveDebugApiUrl(url);
    setCurrentUrl(url);
    setIsOverridden(true);
    setUrlInput("");
    Alert.alert("Applied", `Requests will now go to:\n${url}`);
  }, [urlInput]);

  const resetUrl = useCallback(async () => {
    await saveDebugApiUrl(null);
    setCurrentUrl(getDefaultBaseUrl());
    setIsOverridden(false);
    Alert.alert("Reset", "Reverted to default API URL.");
  }, []);

  const shareAllLogs = useCallback(async () => {
    await Share.share({ message: debugStore.exportAll() });
  }, []);

  const version = Constants.expoConfig?.version ?? "0.1.0";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Environment card */}
      <View style={styles.envCard}>
        <Text style={styles.envTitle}>Environment</Text>
        <InfoRow label="Version" value={`v${version}`} />
        <InfoRow label="Build" value="DEBUG" highlight />
        <InfoRow label="API URL" value={currentUrl} />
        {isOverridden && (
          <View style={styles.overrideBadge}>
            <Text style={styles.overrideBadgeText}>URL OVERRIDDEN</Text>
          </View>
        )}
      </View>

      {/* URL override */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API URL Override</Text>
        <Text style={styles.hint}>
          Paste a Cloudflare / ngrok tunnel URL to route requests without rebuilding the APK.
        </Text>
        <TextInput
          style={styles.input}
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="https://xxxx.trycloudflare.com"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.row}>
          <ActionButton label="Apply URL" onPress={applyUrl} />
          {isOverridden && (
            <ActionButton label="Reset to Default" onPress={resetUrl} secondary />
          )}
        </View>
      </View>

      {/* Log viewers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logs</Text>
        <NavTile
          icon="web"
          title="HTTP Request Logs"
          subtitle={`${httpLogCount} entries`}
          onPress={() => router.push("/debug/http-logs")}
        />
        <NavTile
          icon="text-box-outline"
          title="Application Logs"
          subtitle={`${appLogCount} entries`}
          onPress={() => router.push("/debug/app-logs")}
        />
        <NavTile
          icon="share-variant-outline"
          title="Export All Logs"
          subtitle="Share as plain text"
          onPress={shareAllLogs}
        />
      </View>

      {/* Clear */}
      <View style={styles.section}>
        <ActionButton
          label="Clear All Logs"
          onPress={() => {
            debugStore.clearAppLogs();
            debugStore.clearHttpLogs();
            Alert.alert("Cleared", "All in-memory logs cleared.");
          }}
          secondary
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function NavTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name={icon} size={22} color="#4ade80" />
      <View style={{ flex: 1 }}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSub}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );
}

function ActionButton({
  label,
  onPress,
  secondary,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, secondary && styles.btnSecondary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, secondary && styles.btnTextSecondary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f0f0f" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  envCard: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  envTitle: { fontSize: 12, fontWeight: "700", color: "#4ade80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  infoRow: { flexDirection: "row", gap: 8 },
  infoLabel: { width: 80, fontSize: 12, color: "#888" },
  infoValue: { flex: 1, fontSize: 12, color: "#e5e5e5", fontFamily: "monospace" },
  infoValueHighlight: { color: "#facc15", fontWeight: "700" },
  overrideBadge: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "#7c3aed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  overrideBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: 0.8 },
  hint: { fontSize: 12, color: "#666", lineHeight: 18 },
  input: {
    backgroundColor: "#1c1c1e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    color: "#e5e5e5",
    fontSize: 13,
    fontFamily: "monospace",
  },
  row: { flexDirection: "row", gap: 8 },
  tile: {
    backgroundColor: "#1c1c1e",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tileTitle: { fontSize: 14, fontWeight: "600", color: "#e5e5e5" },
  tileSub: { fontSize: 12, color: "#888", marginTop: 2 },
  btn: {
    flex: 1,
    backgroundColor: "#4ade80",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnSecondary: { backgroundColor: "#1c1c1e", borderWidth: 1, borderColor: "#444" },
  btnText: { fontSize: 14, fontWeight: "700", color: "#000" },
  btnTextSecondary: { color: "#aaa" },
});
