import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen not found</Text>
      <Button label="Go to home" onPress={() => router.replace("/(tabs)/capture")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16, backgroundColor: colors.surface.background },
  title: { fontSize: 18, color: colors.surface.textMuted },
});
