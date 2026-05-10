import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { DreamCard } from "@/components/DreamCard";
import { useDreams } from "@/context/DreamContext";
import type { Dream } from "@/context/DreamContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Still dreaming?";
  if (h < 12) return "Good morning, dreamer";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Sleep well tonight";
}

function toDateStr(iso: string) {
  return iso.split("T")[0];
}

function computeStreak(dreams: Dream[]): number {
  if (!dreams.length) return 0;

  const daySet = new Set(dreams.map((d) => toDateStr(d.date)));

  const today = toDateStr(new Date().toISOString());
  const yesterday = toDateStr(new Date(Date.now() - 86400000).toISOString());

  // Streak is alive if today OR yesterday has a dream
  const anchor = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : null;
  if (!anchor) return 0;

  let streak = 0;
  const cursor = new Date(anchor + "T12:00:00");
  while (daySet.has(toDateStr(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function StreakBadge({ streak }: { streak: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
    return () => pulse.stopAnimation();
  }, [streak]);

  if (streak === 0) return null;

  const isHot = streak >= 3;
  const isMilestone = streak === 7 || streak === 14 || streak === 30;

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <LinearGradient
        colors={isHot ? ["#FF8C42", "#FF5A7E"] : ["rgba(123,92,245,0.3)", "rgba(123,92,245,0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.streakBadge, isHot && styles.streakBadgeHot]}
      >
        <Text style={styles.streakFlame}>{isHot ? "🔥" : "✦"}</Text>
        <View>
          <Text style={[styles.streakCount, isHot && styles.streakCountHot]}>
            {streak}
          </Text>
          <Text style={[styles.streakLabel, isHot && styles.streakLabelHot]}>
            {streak === 1 ? "day" : "days"}
          </Text>
        </View>
        {isMilestone && (
          <View style={styles.milestoneDot} />
        )}
      </LinearGradient>
    </Animated.View>
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dreams, loading } = useDreams();
  const [search, setSearch] = useState("");
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    const done = await AsyncStorage.getItem("onboarding_done");
    if (!done) {
      router.replace("/onboarding");
    } else {
      setOnboardingChecked(true);
    }
  }

  const streak = useMemo(() => computeStreak(dreams), [dreams]);

  if (!onboardingChecked) return null;

  const filtered = dreams.filter(
    (d) =>
      !search ||
      (d.interpretation?.title || d.title || "").toLowerCase().includes(search.toLowerCase()) ||
      d.text.toLowerCase().includes(search.toLowerCase())
  );

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require("../../assets/images/dream_hero.png")}
          style={styles.emptyImage}
          resizeMode="cover"
        />
        <View style={styles.emptyTextBlock}>
          <Text style={styles.emptyTitle}>Your dream journal awaits</Text>
          <Text style={styles.emptySubtitle}>
            Record your first dream and let AI reveal what your subconscious is trying to tell you.
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => router.push("/(tabs)/create")}
          >
            <LinearGradient
              colors={["#9B7AFF", "#7B5CF5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyBtnGradient}
            >
              <Text style={styles.emptyBtnText}>Record a Dream</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderItem({ item }: { item: Dream }) {
    return (
      <DreamCard
        dream={item}
        onPress={() => router.push(`/dream/${item.id}`)}
      />
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const headerHeight = streak > 0 ? 156 : 136;

  return (
    <AnimatedBackground>
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + headerHeight },
          filtered.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={loading ? null : renderEmpty()}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Header */}
      <View style={[styles.headerWrap, { top: topPad }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>DreamScape</Text>
          </View>
          <View style={styles.headerRight}>
            <StreakBadge streak={streak} />
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.avatar}
            />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#6866A0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dreams..."
            placeholderTextColor="#6866A0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#6866A0" />
            </Pressable>
          )}
        </View>

        {streak > 0 && (
          <View style={styles.streakBanner}>
            <Ionicons
              name={streak >= 3 ? "flame" : "star-outline"}
              size={13}
              color={streak >= 3 ? "#FF8C42" : "#7B5CF5"}
            />
            <Text style={[styles.streakBannerText, streak >= 3 && styles.streakBannerTextHot]}>
              {streak >= 7
                ? `${streak}-day streak — you're on fire!`
                : streak >= 3
                ? `${streak}-day streak — keep it going!`
                : streak === 1
                ? "Day 1 — great start!"
                : `${streak}-day streak`}
            </Text>
          </View>
        )}
      </View>

      {/* FAB */}
      {dreams.length > 0 && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + (Platform.OS === "web" ? 34 : 90) }]}
          onPress={() => router.push("/(tabs)/create")}
        >
          <LinearGradient
            colors={["#9B7AFF", "#7B5CF5"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      )}
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  headerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greeting: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  headerTitle: {
    color: "#E8E2FF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.4)",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.3)",
  },
  streakBadgeHot: {
    borderColor: "rgba(255,90,126,0.4)",
  },
  streakFlame: {
    fontSize: 14,
  },
  streakCount: {
    color: "#B0A8FF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    lineHeight: 17,
  },
  streakCountHot: {
    color: "#FFFFFF",
  },
  streakLabel: {
    color: "#6866A0",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  streakLabelHot: {
    color: "rgba(255,255,255,0.7)",
  },
  milestoneDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFD25A",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13,11,34,0.9)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
  },
  searchInput: {
    flex: 1,
    color: "#E8E2FF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(13,11,34,0.85)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
    alignSelf: "flex-start",
  },
  streakBannerText: {
    color: "#7B5CF5",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  streakBannerTextHot: {
    color: "#FF8C42",
  },
  emptyContainer: {
    alignItems: "center",
    gap: 24,
  },
  emptyImage: {
    width: "100%",
    height: 240,
    borderRadius: 24,
  },
  emptyTextBlock: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  emptyTitle: {
    color: "#E8E2FF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#6866A0",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
  emptyBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    width: 200,
  },
  emptyBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  fab: {
    position: "absolute",
    right: 24,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#7B5CF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
});
