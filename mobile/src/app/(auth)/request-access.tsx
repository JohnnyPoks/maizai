import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";

export default function RequestAccessScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await api.requestAccess({ fullName, email: email.trim().toLowerCase(), affiliation: affiliation || undefined, reason });
      setSubmitted(true);
    } catch {
      setError(strings.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <MaterialCommunityIcons name="check-circle-outline" size={64} color={colors.brand[500]} />
        <Text style={styles.successTitle}>{strings.auth.requestSent}</Text>
        <Text style={styles.successBody}>{strings.auth.requestSentDetail}</Text>
        <Button label="Back to sign in" onPress={() => router.replace("/(auth)/sign-in")} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.brand[600]} />
      </TouchableOpacity>

      <Text style={styles.title}>{strings.auth.requestAccessTitle}</Text>
      <Text style={styles.subtitle}>{strings.auth.requestAccessSubtitle}</Text>

      <View style={styles.form}>
        <TextInput label={strings.auth.fullName} value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextInput label={strings.auth.email} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput label={strings.auth.affiliation} value={affiliation} onChangeText={setAffiliation} />
        <TextInput
          label={strings.auth.reason}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={strings.auth.submitRequest}
          onPress={handleSubmit}
          loading={loading}
          disabled={!fullName || !email || !reason}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.surface.background, padding: 24, paddingTop: 56, gap: 12 },
  back: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.surface.text },
  subtitle: { fontSize: 14, color: colors.surface.textMuted, marginBottom: 8 },
  form: { gap: 16 },
  error: { fontSize: 13, color: colors.alert.high },
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16, backgroundColor: colors.surface.background },
  successTitle: { fontSize: 22, fontWeight: "700", color: colors.surface.text },
  successBody: { fontSize: 14, color: colors.surface.textMuted, textAlign: "center", lineHeight: 20 },
});
