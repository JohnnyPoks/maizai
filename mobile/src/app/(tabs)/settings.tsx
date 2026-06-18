import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { useSync } from "@/hooks/use-sync";
import { clearAllCaptures } from "@/lib/database";
import { api } from "@/lib/api";
import { cacheThresholds } from "@/lib/rule-engine";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";
import Constants from "expo-constants";

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { sync, isSyncing, lastSyncAt, pendingCount } = useSync();
  const [refreshingThresholds, setRefreshingThresholds] = useState(false);

  function confirmSignOut() {
    Alert.alert(strings.settings.signOut, strings.settings.signOutConfirm, [
      { text: strings.history.cancel, style: "cancel" },
      {
        text: strings.settings.signOut,
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  }

  function confirmClearHistory() {
    Alert.alert(strings.settings.clearHistory, strings.settings.clearHistoryConfirm, [
      { text: strings.history.cancel, style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          clearAllCaptures();
          Alert.alert("Done", "Local history cleared.");
        },
      },
    ]);
  }

  async function refreshThresholds() {
    setRefreshingThresholds(true);
    try {
      const thresholds = await api.fetchThresholds();
      await cacheThresholds(thresholds);
      Alert.alert("Done", "Rule thresholds refreshed.");
    } catch {
      Alert.alert("Error", strings.errors.networkError);
    } finally {
      setRefreshingThresholds(false);
    }
  }

  const version = Constants.expoConfig?.version ?? "0.1.0";
  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString()
    : strings.settings.never;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{strings.settings.title}</Text>

      {/* Profile */}
      <Section title={strings.settings.profile}>
        <Row icon="account-circle-outline" label={user?.fullName ?? "—"} />
        <Row icon="email-outline" label={user?.email ?? "—"} />
        <Row
          icon="lock-outline"
          label={strings.settings.changePassword}
          onPress={() => router.push("/(auth)/change-password")}
          showChevron
        />
      </Section>

      {/* Sync */}
      <Section title={strings.settings.sync}>
        <Row icon="clock-outline" label={`${strings.settings.lastSync}: ${lastSyncLabel}`} />
        <Row
          icon="cloud-upload-outline"
          label={pendingCount > 0 ? strings.settings.pendingCaptures(pendingCount) : "All synced"}
        />
        <Row
          icon="sync"
          label={isSyncing ? strings.settings.syncing : strings.settings.syncNow}
          onPress={isSyncing ? undefined : sync}
          showChevron={!isSyncing}
        />
      </Section>

      {/* Cache */}
      <Section title={strings.settings.cache}>
        <Row
          icon="delete-outline"
          label={strings.settings.clearHistory}
          onPress={confirmClearHistory}
          destructive
          showChevron
        />
        <Row
          icon="refresh"
          label={refreshingThresholds ? "Refreshing…" : strings.settings.refreshThresholds}
          onPress={refreshingThresholds ? undefined : refreshThresholds}
          showChevron={!refreshingThresholds}
        />
      </Section>

      {/* About */}
      <Section title={strings.settings.about}>
        <Row icon="information-outline" label={`${strings.settings.version} ${version}`} />
        <Row
          icon="github"
          label={strings.settings.openSource}
          onPress={() => Linking.openURL("https://github.com/JohnnyPoks/maizai")}
          showChevron
        />
        <Row
          icon="bug-outline"
          label={strings.settings.reportBug}
          onPress={() => Linking.openURL("mailto:minasji86@gmail.com?subject=MaizAI Bug Report")}
          showChevron
        />
      </Section>

      {/* Account */}
      <Section title={strings.settings.account}>
        <Row
          icon="logout"
          label={strings.settings.signOut}
          onPress={confirmSignOut}
          destructive
          showChevron
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  showChevron,
  destructive,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}) {
  const textColor = destructive ? colors.alert.high : colors.surface.text;
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}
    >
      <MaterialCommunityIcons name={icon} size={20} color={destructive ? colors.alert.high : colors.surface.textMuted} />
      <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={18} color={colors.surface.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.elevated },
  content: { padding: 16, paddingTop: 56, gap: 8, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: "700", color: colors.surface.text, marginBottom: 8 },
  section: { gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.surface.textMuted, letterSpacing: 0.5, textTransform: "uppercase", paddingHorizontal: 4 },
  sectionCard: {
    backgroundColor: colors.surface.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surface.border,
    minHeight: 48,
  },
  rowLabel: { flex: 1, fontSize: 15 },
});
