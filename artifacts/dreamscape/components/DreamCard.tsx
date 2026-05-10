import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { EmotionBadge } from "./EmotionBadge";
import type { Dream } from "@/context/DreamContext";

interface DreamCardProps {
  dream: Dream;
  onPress: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DreamCard({ dream, onPress }: DreamCardProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {dream.interpretation?.title || dream.title || "Untitled Dream"}
            </Text>
            {dream.interpretation && (
              <View style={styles.interpretedDot} />
            )}
          </View>
          <Text style={styles.date}>{formatDate(dream.date)}</Text>
        </View>

        <Text style={styles.preview} numberOfLines={2}>
          {dream.text}
        </Text>

        <View style={styles.footer}>
          <View style={styles.emotions}>
            {dream.emotions.slice(0, 3).map((e) => (
              <EmotionBadge key={e} emotion={e} small />
            ))}
          </View>
          {dream.interpretation && (
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(13,11,34,0.9)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  title: {
    color: "#E8E2FF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  interpretedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#7B5CF5",
  },
  date: {
    color: "#6866A0",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  preview: {
    color: "#A09EC8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emotions: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
});
