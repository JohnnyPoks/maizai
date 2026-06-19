import { TextInput as RNTextInput, Text, View, StyleSheet, TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.surface.textMuted}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: colors.surface.text },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.surface.text,
    backgroundColor: colors.surface.background,
  },
  inputError: { borderColor: colors.alert.high },
  error: { fontSize: 12, color: colors.alert.high },
});
