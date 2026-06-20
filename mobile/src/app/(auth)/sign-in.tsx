import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router, Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";

export default function SignInScreen() {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.mustChangePassword) {
        router.replace("/(auth)/change-password");
      } else {
        router.replace("/(tabs)/capture");
      }
    } catch (err) {
      const msg = err instanceof Error && err.message.includes("401")
        ? strings.auth.invalidCredentials
        : strings.errors.offline;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="corn" size={32} color={colors.brand[500]} />
        <Text style={styles.logoText}>{strings.app.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{strings.auth.signIn}</Text>
        <Text style={styles.subtitle}>{strings.app.tagline}</Text>

        <View style={styles.form}>
          <TextInput
            label={strings.auth.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="farmer@example.com"
          />
          <TextInput
            label={strings.auth.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={strings.auth.signInButton}
            onPress={handleSignIn}
            loading={loading}
            disabled={!email || !password}
          />
        </View>
      </View>

      <Link href="/(auth)/request-access" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>
            No account? <Text style={styles.linkEmphasis}>{strings.auth.requestAccess}</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.brand[50],
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoText: { fontSize: 26, fontWeight: "800", color: colors.brand[800], letterSpacing: -0.5 },
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: 16,
    padding: 24,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.surface.text },
  subtitle: { fontSize: 14, color: colors.surface.textMuted, marginBottom: 8 },
  form: { gap: 16 },
  error: { fontSize: 13, color: colors.alert.high },
  link: { alignItems: "center" },
  linkText: { fontSize: 14, color: colors.surface.textMuted },
  linkEmphasis: { color: colors.brand[600], fontWeight: "600" },
});
