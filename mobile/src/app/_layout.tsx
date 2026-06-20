import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/auth-store";
import { initDatabase } from "@/lib/database";
import { initialiseModel } from "@/lib/inference";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { DebugFab } from "@/components/shared/debug-fab";
import { attachDebugInterceptor, loadDebugApiUrl } from "@/lib/debug-http";
import { dlogError } from "@/lib/debug-store";

// Keep the native splash visible until auth is hydrated from storage.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60_000 },
    mutations: { retry: 1 },
  },
});

export default function RootLayout() {
  const { hydrateFromStorage, isLoading } = useAuthStore();

  useEffect(() => {
    initDatabase();
    initialiseModel().catch((err) =>
      dlogError("inference", `Startup model init failed: ${err?.message ?? err}`),
    );
    hydrateFromStorage();
    const debugEnabled = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_MODE === "true";
    if (debugEnabled) {
      attachDebugInterceptor();
      loadDebugApiUrl();
    }
  }, [hydrateFromStorage]);

  // Hide the splash as soon as auth hydration finishes.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <ErrorBoundary>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="result/[id]"
                options={{ presentation: "modal", animation: "slide_from_bottom" }}
              />
              <Stack.Screen name="debug" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ErrorBoundary>
          <DebugFab />
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
