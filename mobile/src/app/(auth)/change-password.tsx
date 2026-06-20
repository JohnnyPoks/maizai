import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";

export default function ChangePasswordScreen() {
  const { setMustChangePassword, mustChangePassword } = useAuthStore();
  const isForced = mustChangePassword;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!isForced && !currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword !== confirm) {
      setError(strings.auth.passwordsDoNotMatch);
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.changePassword(newPassword, isForced ? undefined : currentPassword);
      setMustChangePassword(false);
      router.replace("/(tabs)/capture");
    } catch (err) {
      const status =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      setError(status === 400 ? "Your current password is incorrect." : strings.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="lock-reset" size={32} color={colors.brand[500]} />
      </View>
      <Text style={styles.title}>{strings.auth.changePasswordTitle}</Text>
      <Text style={styles.subtitle}>{strings.auth.changePasswordSubtitle}</Text>

      <View style={styles.form}>
        {!isForced && (
          <TextInput
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="Your current password"
          />
        )}
        <TextInput
          label={strings.auth.newPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
        />
        <TextInput
          label={strings.auth.confirmPassword}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={strings.auth.setPassword}
          onPress={handleSubmit}
          loading={loading}
          disabled={!newPassword || !confirm || (!isForced && !currentPassword)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.surface.background,
    padding: 24,
    paddingTop: 64,
    gap: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.surface.text },
  subtitle: { fontSize: 14, color: colors.surface.textMuted, marginBottom: 8 },
  form: { gap: 16 },
  error: { fontSize: 13, color: colors.alert.high },
});
