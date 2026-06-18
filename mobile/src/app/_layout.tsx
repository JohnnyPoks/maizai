import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/auth-store";
import { initDatabase } from "@/lib/database";
import { initialiseModel } from "@/lib/inference";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60_000 },
    mutations: { retry: 1 },
  },
});

export default function RootLayout() {
  const { hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialise SQLite schema
    initDatabase();
    // Pre-warm the TFLite model so first inference is fast
    initialiseModel().catch((err) => console.error("Model init failed:", err));
    // Restore auth state from secure storage
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="result/[id]"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
