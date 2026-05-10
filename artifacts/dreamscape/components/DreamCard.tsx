import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
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
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  const hasImage = !!dream.imageBase64;

  if (hasImage) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.imageCard, { transform: [{ scale }] }]}>
          <Image
            source={{ uri: `data:image/png;base64,${dream.imageBase64}` }}
            style={styles.cardBg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(4,4,15,0.55)", "rgba(4,4,15,0.96)"]}
            style={styles.cardGradient}
          />
          <View style={styles.imageCardContent}>
            <View style={styles.imageMeta}>
              <Text style={styles.imageDate}>{formatDate(dream.date)}</Text>
              {dream.visualStyle && (
                <View style={styles.stylePill}>
                  <Text style={styles.stylePillText}>{dream.visualStyle}</Text>
                </View>
              )}
            </View>
            <Text style={styles.imageTitle} numberOfLines={2}>
              {dream.interpretation?.title || dream.title || "Untitled Dream"}
            </Text>
            {dream.emotions.length > 0 && (
              <View style={styles.imageEmotions}>
                {dream.emotions.slice(0, 3).map((e) => (
                  <EmotionBadge key={e} emotion={e} small />
                ))}
                {dream.interpretation && (
                  <View style={styles.aiChip}>
                    <Ionicons name="sparkles" size={10} color="#B0A8FF" />
                    <Text style={styles.aiChipText}>Interpreted</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
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
            <Ionicons name="chevron-forward" size={16} color="#6866A0" />
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

  imageCard: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    height: 220,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
  },
  cardBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageCardContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    gap: 6,
  },
  imageMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageDate: {
    color: "rgba(176,168,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  stylePill: {
    backgroundColor: "rgba(123,92,245,0.35)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.5)",
  },
  stylePillText: {
    color: "#B0A8FF",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  imageTitle: {
    color: "#F0EEFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  imageEmotions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(123,92,245,0.25)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.4)",
  },
  aiChipText: {
    color: "#B0A8FF",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
