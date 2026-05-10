import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

const { width } = Dimensions.get("window");

const EMOTIONS = [
  "fear", "curiosity", "happiness", "nostalgia", "loneliness",
  "excitement", "anxiety", "peace", "sadness", "love", "confusion",
];

const STEPS = [
  {
    id: 0,
    title: "Welcome to\nDreamScape AI",
    subtitle: "Your subconscious mind holds the answers.\nLet's explore them together.",
  },
  {
    id: 1,
    title: "Understand\nYour Dreams",
    subtitle: "Describe any dream. Our AI interprets symbols, emotions, and hidden meanings with cinematic depth.",
  },
  {
    id: 2,
    title: "What do you\noften feel?",
    subtitle: "Select the emotions that appear most in your dreams.",
  },
  {
    id: 3,
    title: "Your journey\nbegins tonight",
    subtitle: "DreamScape is ready to illuminate your inner world. Sweet dreams.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function toggleEmotion(e: string) {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : prev.length < 5 ? [...prev, e] : prev
    );
  }

  function nextStep() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }
    });
  }

  async function finish() {
    await AsyncStorage.setItem("onboarding_done", "1");
    router.replace("/(tabs)");
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={["#04040F", "#0A0520", "#04040F"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && (
          <View style={styles.iconWrap}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.icon}
            />
          </View>
        )}

        {step === 1 && (
          <Image
            source={require("../assets/images/dream_hero.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.textBlock}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </View>

        {step === 2 && (
          <View style={styles.emotionsWrap}>
            <ScrollView contentContainerStyle={styles.emotionsGrid} showsVerticalScrollIndicator={false}>
              {EMOTIONS.map((e) => (
                <Pressable key={e} onPress={() => toggleEmotion(e)}>
                  <View style={[
                    styles.emotionChip,
                    selectedEmotions.includes(e) && styles.emotionChipSelected,
                  ]}>
                    <Text style={[
                      styles.emotionChipText,
                      selectedEmotions.includes(e) && styles.emotionChipTextSelected,
                    ]}>
                      {e}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {step === 3 && (
          <Image
            source={require("../assets/images/dream_emotions.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}
      </Animated.View>

      <View style={styles.bottomRow}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          onPress={isLast ? finish : nextStep}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={["#9B7AFF", "#7B5CF5", "#5A3DD4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>{isLast ? "Enter DreamScape" : "Continue"}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04040F",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconWrap: {
    marginBottom: 32,
    shadowColor: "#7B5CF5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  heroImage: {
    width: width - 56,
    height: 220,
    borderRadius: 24,
    marginBottom: 32,
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#E8E2FF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6866A0",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  emotionsWrap: {
    marginTop: 24,
    maxHeight: 180,
    width: "100%",
  },
  emotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 8,
  },
  emotionChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.3)",
    backgroundColor: "rgba(13,11,34,0.8)",
  },
  emotionChipSelected: {
    backgroundColor: "rgba(123,92,245,0.25)",
    borderColor: "#7B5CF5",
  },
  emotionChipText: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  emotionChipTextSelected: {
    color: "#B0A8FF",
  },
  bottomRow: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "web" ? 34 : 20,
    gap: 20,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(123,92,245,0.3)",
  },
  dotActive: {
    backgroundColor: "#7B5CF5",
    width: 20,
  },
  btn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
