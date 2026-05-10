import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmotionBadge } from "@/components/EmotionBadge";
import { useDreams } from "@/context/DreamContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getDream, deleteDream } = useDreams();
  const dream = getDream(id);
  const [deleting, setDeleting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!dream) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.notFound}>
          <Ionicons name="moon-outline" size={44} color="#3D3A6E" />
          <Text style={styles.notFoundText}>Dream not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function handleDelete() {
    Alert.alert(
      "Delete Dream",
      "This dream will be permanently removed from your journal.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteDream(dream.id);
            router.back();
          },
        },
      ]
    );
  }

  const interp = dream.interpretation;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={22} color="#B0A8FF" />
        </Pressable>
        <Text style={styles.headerDate}>{formatDate(dream.date)}</Text>
        <Pressable onPress={handleDelete} style={styles.deleteIcon}>
          <Ionicons name="trash-outline" size={20} color="#6866A0" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {dream.imageBase64 ? (
          <View style={styles.heroImageWrap}>
            <Image
              source={{ uri: `data:image/png;base64,${dream.imageBase64}` }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "#04040F"]}
              style={styles.heroFade}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.dreamTitle}>
                {interp?.title || dream.title || "Untitled Dream"}
              </Text>
              {dream.visualStyle && (
                <View style={styles.styleBadge}>
                  <Text style={styles.styleBadgeText}>{dream.visualStyle}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.dreamTitle}>
            {interp?.title || dream.title || "Untitled Dream"}
          </Text>
        )}

        {/* Emotions */}
        {dream.emotions.length > 0 && (
          <View style={styles.emotionRow}>
            {dream.emotions.map((e) => (
              <EmotionBadge key={e} emotion={e} />
            ))}
          </View>
        )}

        {/* Dream Text */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Your Dream</Text>
          <Text style={styles.dreamText}>{dream.text}</Text>
        </View>

        {interp ? (
          <>
            {/* Interpretation */}
            <LinearGradient
              colors={["rgba(123,92,245,0.12)", "rgba(0,212,255,0.05)"]}
              style={styles.interpretCard}
            >
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="sparkles" size={16} color="#7B5CF5" />
                <Text style={styles.sectionLabel}>Interpretation</Text>
              </View>
              <Text style={styles.bodyText}>{interp.interpretation}</Text>
            </LinearGradient>

            {/* Symbols */}
            {interp.symbols?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Dream Symbols</Text>
                <View style={styles.symbolList}>
                  {interp.symbols.map((sym, i) => (
                    <View key={i} style={styles.symbolRow}>
                      <View style={styles.symbolDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.symbolName}>{sym.symbol}</Text>
                        <Text style={styles.symbolMeaning}>{sym.meaning}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Insights */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Psychological Insight</Text>
              <Text style={styles.bodyText}>{interp.insights}</Text>
            </View>

            {/* Advice */}
            <View style={styles.adviceCard}>
              <Ionicons name="moon" size={16} color="#00D4FF" />
              <Text style={styles.adviceText}>{interp.advice}</Text>
            </View>
          </>
        ) : (
          <View style={styles.noInterp}>
            <Ionicons name="sparkles-outline" size={28} color="#3D3A6E" />
            <Text style={styles.noInterpText}>This dream hasn't been interpreted yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(123,92,245,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerDate: {
    flex: 1,
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  heroImageWrap: {
    marginHorizontal: -20,
    marginTop: -4,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 280,
  },
  heroFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    gap: 6,
  },
  dreamTitle: {
    color: "#E8E2FF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  styleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(123,92,245,0.3)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.5)",
  },
  styleBadgeText: {
    color: "#B0A8FF",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  emotionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    backgroundColor: "rgba(13,11,34,0.95)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.12)",
    gap: 10,
  },
  interpretCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
    gap: 10,
  },
  sectionLabel: {
    color: "#7B5CF5",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dreamText: {
    color: "#A09EC8",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  bodyText: {
    color: "#A09EC8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  symbolList: { gap: 10 },
  symbolRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  symbolDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7B5CF5",
    marginTop: 7,
  },
  symbolName: {
    color: "#C8C4E8",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
  symbolMeaning: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  adviceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(0,212,255,0.07)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.15)",
  },
  adviceText: {
    color: "#A0D8E8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  notFoundText: {
    color: "#6866A0",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(123,92,245,0.2)",
    borderRadius: 12,
  },
  backBtnText: {
    color: "#B0A8FF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  noInterp: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
  noInterpText: {
    color: "#6866A0",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
