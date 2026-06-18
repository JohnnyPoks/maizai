import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "@/theme/colors";
import { MIN_TOUCH_TARGET } from "@/theme/spacing";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = "primary", loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.brand[500]} size="small" />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.brand[500] },
  secondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.brand[300] },
  danger: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.alert.high },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: "600" },
});

const labelStyles: Record<Variant, TextStyle> = {
  primary: { color: "#fff" },
  secondary: { color: colors.brand[600] },
  danger: { color: colors.alert.high },
  ghost: { color: colors.brand[600] },
};
