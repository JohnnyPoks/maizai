import { useRef } from "react";
import { Animated, PanResponder, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDebugUiStore } from "@/stores/debug-ui-store";

// Show the floating debug button whenever debug mode is enabled — i.e. during
// local development OR in preview builds where EXPO_PUBLIC_DEBUG_MODE is set.
// In a true production release EXPO_PUBLIC_DEBUG_MODE is unset, so it disappears.
// The button is draggable (drag it anywhere) and can be hidden entirely from
// the debug dashboard; the version-tap-5× entry still works when hidden.
const FAB_SIZE = 44;

export function DebugFab() {
  const debugEnabled = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_MODE === "true";
  const fabVisible = useDebugUiStore((s) => s.fabVisible);

  const { width, height } = Dimensions.get("window");
  // Start near the bottom-right, above the tab bar.
  const pan = useRef(new Animated.ValueXY({ x: width - FAB_SIZE - 16, y: height - 160 })).current;
  const dragged = useRef(false);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        dragged.current = false;
        pan.extractOffset();
      },
      onPanResponderMove: (_e, g) => {
        if (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3) dragged.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_e, g);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // A tap (no real drag) opens the debug dashboard.
        if (!dragged.current) router.navigate("/debug");
      },
    }),
  ).current;

  if (!debugEnabled || !fabVisible) return null;

  return (
    <Animated.View
      style={[styles.fab, { transform: pan.getTranslateTransform() }]}
      {...responder.panHandlers}
    >
      <MaterialCommunityIcons name="bug-outline" size={22} color="#000" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    top: 0,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
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
