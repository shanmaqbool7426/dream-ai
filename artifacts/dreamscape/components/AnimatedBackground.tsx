import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

const STAR_COUNT = 18;

function Star({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.8, duration: duration / 2, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.1, duration: duration / 2, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, { toValue: -12, duration: duration, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: duration, useNativeDriver: true }),
          ]),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3000,
  duration: 2500 + Math.random() * 2000,
}));

export function AnimatedBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#04040F", "#0A0520", "#04040F"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(123,92,245,0.08)", "transparent"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {stars.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} duration={s.duration} />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04040F",
  },
  star: {
    position: "absolute",
    backgroundColor: "#C8C4E8",
  },
});
