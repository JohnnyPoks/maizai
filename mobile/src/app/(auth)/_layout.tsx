import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout() {
  const { token, mustChangePassword, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (token && !mustChangePassword) {
      router.replace("/(tabs)/capture");
    }
  }, [token, mustChangePassword, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="request-access" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
