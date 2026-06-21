import { TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Show the floating debug button whenever debug mode is enabled — i.e. during
// local development OR in preview builds where EXPO_PUBLIC_DEBUG_MODE is set.
// This keeps the debug screen one tap away while testing real APKs. In a true
// production release EXPO_PUBLIC_DEBUG_MODE is unset, so the button disappears.
export function DebugFab() {
  const debugEnabled = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_MODE === "true";
  if (!debugEnabled) return null;
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.navigate("/debug")}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="bug-outline" size={22} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 88,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 9999,
  },
});
