import React from "react";
import { StyleSheet, Text, View } from "react-native";

const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  fear: { bg: "rgba(255,77,106,0.2)", text: "#FF7A94" },
  anxiety: { bg: "rgba(255,140,0,0.2)", text: "#FFA040" },
  curiosity: { bg: "rgba(0,212,255,0.2)", text: "#00D4FF" },
  happiness: { bg: "rgba(80,220,100,0.2)", text: "#50DC64" },
  nostalgia: { bg: "rgba(255,128,192,0.2)", text: "#FF80C0" },
  loneliness: { bg: "rgba(123,92,245,0.25)", text: "#B0A8FF" },
  excitement: { bg: "rgba(255,210,0,0.2)", text: "#FFD200" },
  confusion: { bg: "rgba(150,150,255,0.2)", text: "#A0A0FF" },
  sadness: { bg: "rgba(80,130,220,0.2)", text: "#6090DD" },
  peace: { bg: "rgba(80,200,180,0.2)", text: "#50C8B4" },
  love: { bg: "rgba(255,100,150,0.2)", text: "#FF6496" },
  default: { bg: "rgba(123,92,245,0.15)", text: "#B0A8FF" },
};

interface EmotionBadgeProps {
  emotion: string;
  small?: boolean;
}

export function EmotionBadge({ emotion, small }: EmotionBadgeProps) {
  const scheme = EMOTION_COLORS[emotion.toLowerCase()] || EMOTION_COLORS.default;
  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }, small && styles.small]}>
      <Text style={[styles.text, { color: scheme.text }, small && styles.smallText]}>
        {emotion}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  smallText: {
    fontSize: 11,
  },
});
