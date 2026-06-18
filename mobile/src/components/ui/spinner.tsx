import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface SpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function Spinner({ message, fullScreen }: SpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.brand[500]} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  fullScreen: { flex: 1 },
  message: { fontSize: 15, color: colors.surface.textMuted, textAlign: "center" },
});
