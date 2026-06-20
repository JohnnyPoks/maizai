import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";

type FeedbackType = "BUG" | "SUGGESTION";

export default function FeedbackScreen() {
  const [type, setType] = useState<FeedbackType>("BUG");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (message.trim().length < 5) {
      Alert.alert("Too short", "Please describe the issue or suggestion in a little more detail.");
      return;
    }
    setLoading(true);
    try {
      await api.submitFeedback({
        type,
        message: message.trim(),
        appVersion: Constants.expoConfig?.version ?? undefined,
        device: `${Platform.OS} ${Platform.Version}`,
      });
      Alert.alert("Thank you", "Your feedback has been sent to the MaizAI team.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Could not send", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={22} color={colors.surface.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Send feedback</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.label}>What would you like to share?</Text>
      <View style={styles.typeRow}>
        <TypeChip label="Report an issue" active={type === "BUG"} onPress={() => setType("BUG")} />
        <TypeChip label="Suggestion" active={type === "SUGGESTION"} onPress={() => setType("SUGGESTION")} />
      </View>

      <Text style={styles.label}>Details</Text>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder={
          type === "BUG"
            ? "Describe what went wrong and what you expected to happen…"
            : "Tell us what would make MaizAI more useful…"
        }
        placeholderTextColor={colors.surface.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Button label="Send" onPress={submit} loading={loading} disabled={!message.trim()} />
      <Text style={styles.note}>
        Your message goes to the MaizAI team dashboard. We may use your account email to follow up.
      </Text>
    </ScrollView>
  );
}

function TypeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56, gap: 12, backgroundColor: colors.surface.background, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surface.elevated,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.surface.text },
  label: { fontSize: 13, fontWeight: "600", color: colors.surface.textMuted, marginTop: 8 },
  typeRow: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: "center",
  },
  chipActive: { borderColor: colors.brand[500], backgroundColor: colors.brand[50] },
  chipText: { fontSize: 14, color: colors.surface.textMuted, fontWeight: "600" },
  chipTextActive: { color: colors.brand[700] },
  input: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.elevated,
    padding: 14,
    fontSize: 15,
    color: colors.surface.text,
  },
  note: { fontSize: 12, color: colors.surface.textMuted, marginTop: 4, lineHeight: 18 },
});
