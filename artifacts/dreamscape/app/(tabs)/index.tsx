import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

  return (
    <AnimatedBackground>
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 140 },
          filtered.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={loading ? null : renderEmpty()}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Header */}
      <View style={[styles.headerWrap, { top: topPad }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>DreamScape</Text>
          </View>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.avatar}
          />
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
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
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
