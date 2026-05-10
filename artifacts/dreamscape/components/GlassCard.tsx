import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint="dark" style={[styles.card, style]}>
        <View style={styles.overlay}>{children}</View>
      </BlurView>
    );
  }
  return (
    <View style={[styles.card, styles.androidCard, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
  },
  overlay: {
    backgroundColor: "rgba(13,11,34,0.6)",
  },
  androidCard: {
    backgroundColor: "rgba(13,11,34,0.85)",
  },
});
