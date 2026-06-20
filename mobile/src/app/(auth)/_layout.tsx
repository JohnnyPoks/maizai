import { useEffect } from "react";
import { Stack, router, usePathname } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout() {
  const { token, mustChangePassword, isLoading } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    // Logged-in users may still open change-password voluntarily from Settings.
    const onChangePassword = pathname.includes("change-password");
    if (token && !mustChangePassword && !onChangePassword) {
      router.replace("/(tabs)/capture");
    }
  }, [token, mustChangePassword, isLoading, pathname]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="request-access" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
