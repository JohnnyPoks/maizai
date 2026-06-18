import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@/components/ui/button";
import { colors } from "@/theme/colors";

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.message}</Text>
        <Button
          label="Try again"
          onPress={() => this.setState({ hasError: false, message: "" })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.surface.text },
  message: { fontSize: 14, color: colors.surface.textMuted, textAlign: "center" },
});
