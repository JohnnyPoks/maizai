import { Stack } from "expo-router";

// The debug screen is reachable only via the hidden 5-tap on the version number
// (and the dev-only floating button). That tap is the access gate, so we no
// longer redirect away when EXPO_PUBLIC_DEBUG_MODE is off — this lets the
// developer reach logs/export even in a production build if they know the tap.
export default function DebugLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1c1c1e" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Debug Dashboard" }} />
      <Stack.Screen name="http-logs" options={{ title: "HTTP Logs" }} />
      <Stack.Screen name="app-logs" options={{ title: "App Logs" }} />
    </Stack>
  );
}
