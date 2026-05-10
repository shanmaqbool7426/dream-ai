import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmotionBadge } from "@/components/EmotionBadge";

interface CommunityDream {
  id: string;
  author: string;
  initials: string;
  authorColor: string;
  title: string;
  preview: string;
  emotions: string[];
  likes: number;
  liked: boolean;
  timeAgo: string;
  hasImage?: boolean;
}

const MOCK_DREAMS: CommunityDream[] = [
  {
    id: "1",
    author: "Mara K.",
    initials: "MK",
    authorColor: "#9B7AFF",
    title: "The Library at the Edge of the World",
    preview: "I found an infinite library where every book contained a version of my life I never lived. The librarian knew my name and handed me a book before I could even ask...",
    emotions: ["curiosity", "nostalgia", "peace"],
    likes: 142,
    liked: false,
    timeAgo: "2h ago",
    hasImage: true,
  },
  {
    id: "2",
    author: "James R.",
    initials: "JR",
    authorColor: "#00D4FF",
    title: "Ocean of Glass",
    preview: "I walked across a perfectly still ocean that was made of translucent glass. Beneath me were entire cities, light glowing from the depths, people living in silence...",
    emotions: ["peace", "loneliness", "curiosity"],
    likes: 89,
    liked: false,
    timeAgo: "5h ago",
    hasImage: false,
  },
  {
    id: "3",
    author: "Sofia M.",
    initials: "SM",
    authorColor: "#FF80C0",
    title: "The Recurring Door",
    preview: "For the third time this month, I found the door again. Blue paint, brass handle, always in a different house. This time I finally opened it and stepped into...",
    emotions: ["fear", "excitement", "confusion"],
    likes: 214,
    liked: false,
    timeAgo: "8h ago",
    hasImage: false,
  },
  {
    id: "4",
    author: "Alex T.",
    initials: "AT",
    authorColor: "#50DC64",
    title: "Falling Upward",
    preview: "Gravity reversed and I was falling into the sky. The ground below me became a ceiling and I could see everything I had ever lost hanging from it like stars...",
    emotions: ["anxiety", "excitement", "nostalgia"],
    likes: 67,
    liked: false,
    timeAgo: "1d ago",
    hasImage: true,
  },
  {
    id: "5",
    author: "Cleo W.",
    initials: "CW",
    authorColor: "#FFD200",
    title: "My Grandmother's Voice",
    preview: "She passed three years ago, but last night she came to visit. We sat in her garden eating fruits I cannot name in waking life. She said something I can still almost hear...",
    emotions: ["nostalgia", "love", "sadness"],
    likes: 338,
    liked: false,
    timeAgo: "1d ago",
    hasImage: false,
  },
];

const CATEGORIES = ["All", "Lucid", "Nightmares", "Fantasy", "Emotional", "Weird"];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [dreams, setDreams] = useState(MOCK_DREAMS);
  const [activeCategory, setActiveCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function toggleLike(id: string) {
    setDreams((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, liked: !d.liked, likes: d.liked ? d.likes - 1 : d.likes + 1 } : d
      )
    );
  }

  function renderItem({ item }: { item: CommunityDream }) {
    return (
      <View style={styles.card}>
        {item.hasImage && (
          <Image
            source={require("../../assets/images/dream_hero.png")}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: item.authorColor + "30" }]}>
              <Text style={[styles.avatarText, { color: item.authorColor }]}>{item.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{item.author}</Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
          </View>

          <Text style={styles.dreamTitle}>{item.title}</Text>
          <Text style={styles.dreamPreview} numberOfLines={3}>{item.preview}</Text>

          <View style={styles.emotionRow}>
            {item.emotions.map((e) => (
              <EmotionBadge key={e} emotion={e} small />
            ))}
          </View>

          <View style={styles.cardFooter}>
            <Pressable style={styles.likeBtn} onPress={() => toggleLike(item.id)}>
              <Ionicons
                name={item.liked ? "heart" : "heart-outline"}
                size={18}
                color={item.liked ? "#FF7A94" : "#6866A0"}
              />
              <Text style={[styles.likeCount, item.liked && styles.likeCountActive]}>
                {item.likes}
              </Text>
            </Pressable>
            <View style={styles.commentRow}>
              <Ionicons name="chatbubble-outline" size={16} color="#6866A0" />
              <Text style={styles.commentCount}>{Math.floor(item.likes / 7)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSub}>Dreams from around the world</Text>
      </View>

      <FlatList
        data={dreams}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.categories}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setActiveCategory(c)}>
                <View style={[styles.catChip, c === activeCategory && styles.catChipActive]}>
                  {c === activeCategory ? (
                    <LinearGradient
                      colors={["#9B7AFF", "#7B5CF5"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                  <Text style={[styles.catText, c === activeCategory && styles.catTextActive]}>
                    {c}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        }
      />
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
  categories: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexWrap: "wrap",
  },
  catChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.25)",
    backgroundColor: "rgba(13,11,34,0.8)",
    overflow: "hidden",
  },
  catChipActive: {
    borderColor: "#7B5CF5",
  },
  catText: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  catTextActive: {
    color: "#FFFFFF",
  },
  list: {
    gap: 0,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: "rgba(13,11,34,0.95)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.12)",
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  authorName: {
    color: "#C8C4E8",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  timeAgo: {
    color: "#6866A0",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  dreamTitle: {
    color: "#E8E2FF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    lineHeight: 21,
  },
  dreamPreview: {
    color: "#7A78A8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  emotionRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 4,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likeCount: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  likeCountActive: {
    color: "#FF7A94",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  commentCount: {
    color: "#6866A0",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
