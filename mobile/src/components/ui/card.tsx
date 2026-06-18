import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
