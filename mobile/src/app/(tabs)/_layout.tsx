import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/theme/colors";
import { strings } from "@/strings";

export default function TabsLayout() {
  const { token, mustChangePassword, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/(auth)/sign-in");
    } else if (mustChangePassword) {
      router.replace("/(auth)/change-password");
    }
  }, [token, mustChangePassword, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.surface.textMuted,
        tabBarStyle: {
          borderTopColor: colors.surface.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: strings.capture.title,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: strings.history.title,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.settings.title,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
