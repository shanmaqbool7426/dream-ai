import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDreams } from "@/context/DreamContext";

function getWeekDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const QUALITY_COLORS: Record<number, [string, string]> = {
  1: ["#FF5A7E", "#CC3A5E"],
  2: ["#FF9B5A", "#CC6E3A"],
  3: ["#FFD25A", "#CCa03A"],
  4: ["#7BE8A0", "#4CBF72"],
  5: ["#00D4FF", "#0099CC"],
};

const QUALITY_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Great",
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const weekDays = useMemo(() => getWeekDays(), []);

  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach((d) => d.emotions.forEach((e) => { counts[e] = (counts[e] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [dreams]);

  const symbolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach((d) => d.interpretation?.symbols?.forEach((s) => {
      counts[s.symbol] = (counts[s.symbol] || 0) + 1;
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [dreams]);

  const dreamsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    weekDays.forEach((d) => (map[d] = 0));
    dreams.forEach((dr) => {
      const day = dr.date.split("T")[0];
      if (map[day] !== undefined) map[day]++;
    });
    return map;
  }, [dreams, weekDays]);

  const sleepByDay = useMemo(() => {
    const map: Record<string, number | null> = {};
    weekDays.forEach((d) => (map[d] = null));
    dreams.forEach((dr) => {
      if (dr.sleepQuality == null) return;
      const day = dr.date.split("T")[0];
      if (day in map) {
        const prev = map[day];
        map[day] = prev == null ? dr.sleepQuality : Math.round((prev + dr.sleepQuality) / 2);
      }
    });
    return map;
  }, [dreams, weekDays]);

  const dreamsWithQuality = useMemo(() => dreams.filter((d) => d.sleepQuality != null), [dreams]);
  const avgSleep = useMemo(() => {
    if (!dreamsWithQuality.length) return null;
    const sum = dreamsWithQuality.reduce((acc, d) => acc + (d.sleepQuality ?? 0), 0);
    return Math.round((sum / dreamsWithQuality.length) * 10) / 10;
  }, [dreamsWithQuality]);

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
            <LinearGradient
              colors={avgSleep != null
                ? (QUALITY_COLORS[Math.round(avgSleep)] ?? ["rgba(123,92,245,0.2)", "rgba(123,92,245,0.05)"])
                    .map((c) => c + "33") as [string, string]
                : ["rgba(123,92,245,0.2)", "rgba(123,92,245,0.05)"]}
              style={styles.statGrad}
            >
              <Text style={[styles.statNumber, {
                color: avgSleep != null ? QUALITY_COLORS[Math.round(avgSleep)]?.[0] ?? "#B0A8FF" : "#B0A8FF"
              }]}>
                {avgSleep != null ? avgSleep.toFixed(1) : "--"}
              </Text>
              <Text style={styles.statLabel}>Sleep Avg</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Sleep Quality Trend */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            {avgSleep != null && (
              <View style={[styles.avgBadge, { borderColor: QUALITY_COLORS[Math.round(avgSleep)]?.[0] + "55" }]}>
                <Ionicons name="moon" size={11} color={QUALITY_COLORS[Math.round(avgSleep)]?.[0] ?? "#B0A8FF"} />
                <Text style={[styles.avgBadgeText, { color: QUALITY_COLORS[Math.round(avgSleep)]?.[0] ?? "#B0A8FF" }]}>
                  {QUALITY_LABELS[Math.round(avgSleep)]} avg
                </Text>
              </View>
            )}
          </View>
          <View style={styles.sleepChartCard}>
            {/* Y axis labels */}
            <View style={styles.yAxis}>
              {[5, 4, 3, 2, 1].map((v) => (
                <Text key={v} style={styles.yLabel}>{v}</Text>
              ))}
            </View>
            {/* Bars */}
            <View style={styles.sleepBars}>
              {weekDays.map((day) => {
                const q = sleepByDay[day];
                const hasDream = q != null;
                const barHeight = hasDream ? (q / 5) * 100 : 0;
                const colors = hasDream ? QUALITY_COLORS[q as number] ?? ["#7B5CF5", "#5A3DD4"] : ["#7B5CF5", "#5A3DD4"];
                const dayLabel = new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" });
                return (
                  <View key={day} style={styles.sleepDayCol}>
                    <View style={styles.sleepBarTrack}>
                      {hasDream && (
                        <LinearGradient
                          colors={colors as [string, string]}
                          style={[styles.sleepBarFill, { height: `${barHeight}%` }]}
                        />
                      )}
                    </View>
                    <Text style={styles.sleepDayLabel}>{dayLabel}</Text>
                    {hasDream && (
                      <Text style={[styles.sleepDayValue, { color: colors[0] }]}>{q}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          {dreamsWithQuality.length === 0 && (
            <Text style={styles.sleepEmptyHint}>Rate your sleep when recording a dream to see trends here.</Text>
          )}
        </View>

        {/* Weekly Dream Activity */}
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
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
  },
  statGrad: { padding: 16, alignItems: "center", gap: 4 },
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
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#E8E2FF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  avgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(13,11,34,0.8)",
  },
  avgBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  sleepChartCard: {
    backgroundColor: "rgba(13,11,34,0.9)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.1)",
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  yAxis: {
    height: 110,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  yLabel: {
    color: "#3D3A6E",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    width: 10,
  },
  sleepBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 4,
  },
  sleepDayCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  sleepBarTrack: {
    width: "100%",
    height: 90,
    borderRadius: 6,
    backgroundColor: "rgba(123,92,245,0.08)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  sleepBarFill: {
    width: "100%",
    borderRadius: 6,
  },
  sleepDayLabel: {
    color: "#6866A0",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  sleepDayValue: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  sleepEmptyHint: {
    color: "#3D3A6E",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
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
  dayCol: { alignItems: "center", gap: 8, flex: 1 },
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
  emotionBarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  barFill: { height: "100%", borderRadius: 4, minWidth: 8 },
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
