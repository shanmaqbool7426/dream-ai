import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { fetch } from "expo/fetch";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello, I'm Luna — your AI dream companion. I'm here to help you explore your dreams, understand your emotions, and gently uncover what your subconscious might be telling you. What's on your mind?",
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const currentIdRef = useRef<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    const assistantId = Date.now().toString() + "_a";
    currentIdRef.current = assistantId;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    const history = [...messages, userMsg];
    setMessages([...history, assistantMsg]);
    setInput("");
    setStreaming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const conversationMessages = history
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`https://${domain}/api/dreams/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationMessages }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                const fContent = fullContent;
                const fId = assistantId;
                setMessages((prev) =>
                  prev.map((m) => (m.id === fId ? { ...m, content: fContent } : m))
                );
              }
            } catch {}
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "I couldn't connect right now. Please try again.", streaming: false }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.lunaAvatar}>
            <LinearGradient colors={["#9B7AFF", "#7B5CF5"]} style={StyleSheet.absoluteFill} />
            <Ionicons name="moon" size={14} color="#FFFFFF" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
            {item.streaming && item.content === "" ? "..." : ""}
          </Text>
          {item.streaming && item.content !== "" && (
            <View style={styles.streamingDot} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View style={styles.lunaInfo}>
          <View style={styles.lunaAvatarLg}>
            <LinearGradient colors={["#9B7AFF", "#7B5CF5"]} style={StyleSheet.absoluteFill} />
            <Ionicons name="moon" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.lunaName}>Luna</Text>
            <Text style={styles.lunaRole}>Dream Therapist</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesList, { paddingBottom: bottomPad + 80 }]}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputBar, { paddingBottom: bottomPad + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Tell Luna about your dream..."
            placeholderTextColor="#3D3A6E"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || streaming}
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || streaming) && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            <LinearGradient
              colors={!input.trim() || streaming ? ["#1F1A46", "#1F1A46"] : ["#9B7AFF", "#7B5CF5"]}
              style={styles.sendBtnGradient}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={!input.trim() || streaming ? "#3D3A6E" : "#FFFFFF"}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04040F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(123,92,245,0.1)",
  },
  lunaInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  lunaAvatarLg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  lunaName: {
    color: "#E8E2FF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  lunaRole: {
    color: "#6866A0",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#50DC64",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 2,
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  lunaAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 20,
    padding: 14,
  },
  bubbleAssistant: {
    backgroundColor: "rgba(13,11,34,0.95)",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.15)",
    borderBottomLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: "#7B5CF5",
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    color: "#A09EC8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7B5CF5",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(123,92,245,0.1)",
    backgroundColor: "#04040F",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(13,11,34,0.95)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#E8E2FF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: "rgba(123,92,245,0.2)",
    maxHeight: 100,
  },
  sendBtn: {
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnDisabled: {},
  sendBtnGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
