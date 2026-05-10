import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmotionBadge } from "@/components/EmotionBadge";
import { useDreams } from "@/context/DreamContext";
import type { DreamInterpretation } from "@/context/DreamContext";

const EMOTIONS = [
  "fear", "curiosity", "happiness", "nostalgia", "loneliness",
  "excitement", "anxiety", "peace", "sadness", "love", "confusion",
];

const VISUAL_STYLES = ["Cinematic", "Surreal", "Fantasy", "Horror", "Anime", "Watercolor", "Cyberpunk"];

const SLEEP_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Great",
};

const SLEEP_COLORS: Record<number, string> = {
  1: "#FF5A7E",
  2: "#FF9B5A",
  3: "#FFD25A",
  4: "#7BE8A0",
  5: "#00D4FF",
};

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDream } = useDreams();

  const [dreamText, setDreamText] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  function toggleEmotion(e: string) {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 6 ? [...prev, e] : prev
    );
  }

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }

  function stopPulse() {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  async function generateDreamImage(interp: DreamInterpretation, style: string, text: string) {
    setGeneratingImage(true);
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(`https://${domain}/api/dreams/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamText: text, interpretation: interp, visualStyle: style }),
      });
      if (!res.ok) return;
      const data = await res.json() as { b64_json?: string };
      if (data.b64_json) setImageBase64(data.b64_json);
    } catch {
    } finally {
      setGeneratingImage(false);
    }
  }

  async function interpret() {
    if (!dreamText.trim() || dreamText.trim().length < 20) {
      setError("Please describe your dream in a bit more detail.");
      return;
    }
    setError("");
    setInterpreting(true);
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(`https://${domain}/api/dreams/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamText: dreamText.trim() }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json() as DreamInterpretation;
      setInterpretation(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      generateDreamImage(data, selectedStyle, dreamText.trim());
    } catch {
      setError("Couldn't interpret your dream. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setInterpreting(false);
      stopPulse();
    }
  }

  async function saveDream() {
    if (!interpretation) return;
    const emotions = selectedEmotions.length > 0 ? selectedEmotions : (interpretation.emotions || []);
    const dream = await addDream({
      title: interpretation.title,
      text: dreamText,
      emotions,
      visualStyle: selectedStyle,
      interpretation,
      imageBase64: imageBase64 || undefined,
      sleepQuality,
    });
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push(`/dream/${dream.id}`), 600);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const activeColor = SLEEP_COLORS[sleepQuality];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Record Dream</Text>
        <Text style={styles.headerSub}>Describe what you remember</Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleep Quality */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <Ionicons name="moon" size={15} color={activeColor} />
            <Text style={styles.sleepCardLabel}>Sleep Quality</Text>
            <Text style={[styles.sleepQualityLabel, { color: activeColor }]}>
              {SLEEP_LABELS[sleepQuality]}
            </Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => {
                  setSleepQuality(star);
                  Haptics.selectionAsync();
                }}
                style={styles.starBtn}
              >
                <Ionicons
                  name={star <= sleepQuality ? "star" : "star-outline"}
                  size={32}
                  color={star <= sleepQuality ? activeColor : "rgba(104,102,160,0.35)"}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dream text */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.dreamInput}
            multiline
            placeholder="I was standing in a dark forest when suddenly the sky turned red and I felt..."
            placeholderTextColor="#3D3A6E"
            value={dreamText}
            onChangeText={setDreamText}
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{dreamText.length}/2000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Emotions felt</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {EMOTIONS.map((e) => (
              <Pressable key={e} onPress={() => toggleEmotion(e)}>
                <View style={[styles.chip, selectedEmotions.includes(e) && styles.chipSelected]}>
                  <Text style={[styles.chipText, selectedEmotions.includes(e) && styles.chipTextSelected]}>
                    {e}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Visual style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {VISUAL_STYLES.map((s) => (
              <Pressable key={s} onPress={() => setSelectedStyle(s)}>
                <View style={[styles.chip, s === selectedStyle && styles.chipSelected]}>
                  <Text style={[styles.chipText, s === selectedStyle && styles.chipTextSelected]}>{s}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!interpretation && (
          <Pressable onPress={interpret} disabled={interpreting} style={styles.interpretBtn}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={interpreting ? ["#3D2E8A", "#2A1E60"] : ["#9B7AFF", "#7B5CF5", "#5A3DD4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.interpretBtnGradient}
              >
                {interpreting ? (
                  <View style={styles.interpretingRow}>
                    <ActivityIndicator color="#B0A8FF" size="small" />
                    <Text style={styles.interpretBtnText}>Interpreting...</Text>
                  </View>
                ) : (
                  <Text style={styles.interpretBtnText}>Interpret My Dream</Text>
                )}
              </LinearGradient>
            </Animated.View>
          </Pressable>
        )}

        {interpretation && (
          <View style={styles.resultCard}>
            <LinearGradient
              colors={["rgba(123,92,245,0.15)", "rgba(0,212,255,0.05)"]}
              style={styles.resultGradient}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="sparkles" size={18} color="#7B5CF5" />
                <Text style={styles.resultTitle}>{interpretation.title}</Text>
              </View>

              {(generatingImage || imageBase64) && (
                <View style={styles.imageContainer}>
                  {generatingImage && !imageBase64 ? (
                    <View style={styles.imagePlaceholder}>
                      <ActivityIndicator color="#7B5CF5" size="small" />
                      <Text style={styles.imagePlaceholderText}>Visualizing your dream...</Text>
                    </View>
                  ) : imageBase64 ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${imageBase64}` }}
                      style={styles.dreamImage}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
              )}

              <Text style={styles.resultBody}>{interpretation.interpretation}</Text>

              {interpretation.symbols?.length > 0 && (
                <View style={styles.symbolsSection}>
                  <Text style={styles.resultSubLabel}>Dream Symbols</Text>
                  {interpretation.symbols.slice(0, 4).map((sym, i) => (
                    <View key={i} style={styles.symbolRow}>
                      <View style={styles.symbolDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.symbolName}>{sym.symbol}</Text>
                        <Text style={styles.symbolMeaning}>{sym.meaning}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {interpretation.emotions?.length > 0 && (
                <View style={styles.emotionRow}>
                  {interpretation.emotions.map((e) => (
                    <EmotionBadge key={e} emotion={e} small />
                  ))}
                </View>
              )}

              <View style={styles.insightBox}>
                <Text style={styles.resultSubLabel}>Psychological Insight</Text>
                <Text style={styles.resultBody}>{interpretation.insights}</Text>
              </View>

              <View style={styles.adviceBox}>
                <Ionicons name="moon" size={14} color="#00D4FF" />
                <Text style={styles.adviceText}>{interpretation.advice}</Text>
              </View>

              <Pressable
                onPress={saveDream}
                disabled={saved}
                style={[styles.saveBtn, saved && styles.saveBtnDone]}
              >
                <Ionicons name={saved ? "checkmark-circle" : "bookmark-outline"} size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>{saved ? "Saved to Journal" : "Save to Journal"}</Text>
              </Pressable>
            </LinearGradient>
          </View>
        )}
      </KeyboardAwareScrollView>
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },
  sleepCard: {
    backgroundColor: "rgba(13,11,34,0.95)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
    gap: 14,
  },
  sleepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sleepCardLabel: {
    color: "#B0A8FF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  sleepQualityLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  starBtn: {
    padding: 4,
  },
  inputCard: {
    backgroundColor: "rgba(13,11,34,0.95)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
  },
  dreamInput: {
    color: "#E8E2FF",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    minHeight: 160,
  },
  charCount: {
    color: "#3D3A6E",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 8,
  },
  section: { gap: 10 },
  sectionLabel: {
    color: "#B0A8FF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chips: { gap: 8, paddingRight: 20 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.25)",
    backgroundColor: "rgba(13,11,34,0.8)",
  },
  chipSelected: {
    backgroundColor: "rgba(123,92,245,0.2)",
    borderColor: "#7B5CF5",
  },
  chipText: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  chipTextSelected: { color: "#B0A8FF" },
  error: {
    color: "#FF7A94",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  interpretBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#7B5CF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  interpretBtnGradient: { paddingVertical: 16, alignItems: "center" },
  interpretingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  interpretBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  resultCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.3)",
  },
  resultGradient: { padding: 20, gap: 16 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultTitle: {
    color: "#E8E2FF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.25)",
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "rgba(13,11,34,0.8)",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  imagePlaceholderText: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  dreamImage: { width: "100%", height: 220 },
  resultSubLabel: {
    color: "#7B5CF5",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  resultBody: {
    color: "#A09EC8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  symbolsSection: { gap: 10 },
  symbolRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
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
  emotionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  insightBox: { gap: 4 },
  adviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(0,212,255,0.07)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.15)",
  },
  adviceText: {
    color: "#A0D8E8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7B5CF5",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  saveBtnDone: { backgroundColor: "#2E7D52" },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
