import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/theme/colors";

export default function Index() {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.surface.background }}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)/capture" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
