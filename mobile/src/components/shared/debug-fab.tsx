import { TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Only show the floating button during local development. In preview/release
// builds debug is reached via Settings → tap the version five times, so the
// button never floats over real content.
export function DebugFab() {
  if (!__DEV__) return null;
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
