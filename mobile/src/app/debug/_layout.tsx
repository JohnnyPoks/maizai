import { Redirect } from "expo-router";
import { Stack } from "expo-router";

const debugEnabled = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_MODE === "true";

export default function DebugLayout() {
  if (!debugEnabled) return <Redirect href="/(tabs)/capture" />;
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
