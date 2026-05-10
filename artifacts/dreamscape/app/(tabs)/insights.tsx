import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDreams } from "@/context/DreamContext";

const { width } = Dimensions.get("window");

function getDayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
}

function getWeekDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach((d) => {
      d.emotions.forEach((e) => {
        counts[e] = (counts[e] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [dreams]);

  const symbolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach((d) => {
      d.interpretation?.symbols?.forEach((s) => {
        counts[s.symbol] = (counts[s.symbol] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [dreams]);

  const weekDays = getWeekDays();
  const dreamsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    weekDays.forEach((d) => (map[d] = 0));
    dreams.forEach((dr) => {
      const day = dr.date.split("T")[0];
      if (map[day] !== undefined) map[day]++;
    });
    return map;
  }, [dreams, weekDays]);

  const maxEmotion = emotionCounts[0]?.[1] || 1;
  const totalDreams = dreams.length;
  const interpreted = dreams.filter((d) => !!d.interpretation).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSub}>Your subconscious patterns</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(123,92,245,0.2)", "rgba(123,92,245,0.05)"]} style={styles.statGrad}>
              <Text style={styles.statNumber}>{totalDreams}</Text>
              <Text style={styles.statLabel}>Dreams</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(0,212,255,0.15)", "rgba(0,212,255,0.03)"]} style={styles.statGrad}>
              <Text style={[styles.statNumber, { color: "#00D4FF" }]}>{interpreted}</Text>
              <Text style={styles.statLabel}>Interpreted</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(255,128,192,0.15)", "rgba(255,128,192,0.03)"]} style={styles.statGrad}>
              <Text style={[styles.statNumber, { color: "#FF80C0" }]}>{symbolCounts.length}</Text>
              <Text style={styles.statLabel}>Symbols</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekGrid}>
            {weekDays.map((day) => {
              const count = dreamsByDay[day] || 0;
              const hasD = count > 0;
              return (
                <View key={day} style={styles.dayCol}>
                  <View style={[styles.dayBar, hasD && styles.dayBarActive]}>
                    {hasD && (
                      <LinearGradient
                        colors={["#9B7AFF", "#7B5CF5"]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>
                    {new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Emotion Frequency */}
        {emotionCounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotion Frequency</Text>
            <View style={styles.emotionBars}>
              {emotionCounts.map(([emotion, count]) => (
                <View key={emotion} style={styles.emotionBarRow}>
                  <Text style={styles.emotionLabel}>{emotion}</Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={["#9B7AFF", "#7B5CF5"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barFill, { width: `${(count / maxEmotion) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Symbols */}
        {symbolCounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recurring Symbols</Text>
            <View style={styles.symbolList}>
              {symbolCounts.map(([symbol, count], i) => (
                <View key={symbol} style={styles.symbolRow}>
                  <Text style={styles.symbolRank}>#{i + 1}</Text>
                  <View style={styles.symbolInfo}>
                    <Text style={styles.symbolName}>{symbol}</Text>
                    <Text style={styles.symbolMeta}>appeared {count} {count === 1 ? "time" : "times"}</Text>
                  </View>
                  <View style={styles.symbolBadge}>
                    <Text style={styles.symbolBadgeText}>{count}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {dreams.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={44} color="#3D3A6E" />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Record and interpret your first dream to see insights about your subconscious patterns.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040F" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  headerTitle: {
    color: "#E8E2FF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    color: "#6866A0",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
    paddingTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
  },
  statGrad: {
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    color: "#B0A8FF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "#6866A0",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: { gap: 14 },
  sectionTitle: {
    color: "#E8E2FF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(13,11,34,0.9)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.1)",
  },
  dayCol: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dayBar: {
    width: 28,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(123,92,245,0.1)",
    overflow: "hidden",
  },
  dayBarActive: {},
  dayLabel: {
    color: "#6866A0",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  emotionBars: { gap: 10 },
  emotionBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emotionLabel: {
    color: "#A09EC8",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    width: 80,
    textTransform: "capitalize",
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(123,92,245,0.1)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 8,
  },
  barCount: {
    color: "#6866A0",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    width: 20,
    textAlign: "right",
  },
  symbolList: {
    backgroundColor: "rgba(13,11,34,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.1)",
    overflow: "hidden",
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(123,92,245,0.08)",
  },
  symbolRank: {
    color: "#3D3A6E",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    width: 24,
  },
  symbolInfo: { flex: 1 },
  symbolName: {
    color: "#C8C4E8",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  symbolMeta: {
    color: "#6866A0",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  symbolBadge: {
    backgroundColor: "rgba(123,92,245,0.2)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  symbolBadgeText: {
    color: "#B0A8FF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyTitle: {
    color: "#E8E2FF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    color: "#6866A0",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 280,
  },
});
