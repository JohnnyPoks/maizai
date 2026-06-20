import { useState } from "react";
import {
  TextInput as RNTextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, secureTextEntry, ...props }: Props) {
  const isPassword = !!secureTextEntry;
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <RNTextInput
          style={[styles.input, isPassword && styles.inputWithIcon, error ? styles.inputError : null, style]}
          placeholderTextColor={colors.surface.textMuted}
          autoCapitalize="none"
          secureTextEntry={isPassword && hidden}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <MaterialCommunityIcons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.surface.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
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
  inputWithIcon: { paddingRight: 46 },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  inputError: { borderColor: colors.alert.high },
  error: { fontSize: 12, color: colors.alert.high },
});
