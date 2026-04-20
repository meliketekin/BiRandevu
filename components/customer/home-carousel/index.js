import React, { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";

const STEPS = [
  {
    icon: "storefront-outline",
    num: "01",
    title: "İşletmeni keşfet",
    desc: "Kategoriye göre filtrele, puanları incele",
  },
  {
    icon: "calendar-outline",
    num: "02",
    title: "Zamanını belirle",
    desc: "Uygun uzman ve müsait saati seç",
  },
  {
    icon: "checkmark-circle-outline",
    num: "03",
    title: "Randevun hazır",
    desc: "Anında onay ve hatırlatma bildirimi alırsın",
  },
];

const STEP_DURATION = 4000;
const FADE_DURATION = 420;

const CustomerHomeCarousel = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 2800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, { toValue: 1, duration: STEP_DURATION, useNativeDriver: false }).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -14, duration: FADE_DURATION, useNativeDriver: true }),
      ]).start(() => {
        setStepIndex((prev) => (prev + 1) % STEPS.length);
        slideAnim.setValue(14);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
        ]).start();
      });
    }, STEP_DURATION - FADE_DURATION);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  const step = STEPS[stepIndex];

  return (
    <LinearGradient
      colors={["#141414", "#1C1005", "#241408"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      {/* Dekoratif orb'lar */}
      <Animated.View style={[styles.orb, styles.orbTopRight, { transform: [{ scale: pulseAnim }] }]} />
      <View style={[styles.orb, styles.orbBottomLeft]} />
      <View style={styles.orbSmall} />
      <View style={styles.shimmerLine} />

      <View style={styles.content}>
        <Animated.View style={[styles.stepBody, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconWrap}>
            <Ionicons name={step.icon} size={26} color="#D4AF37" />
          </View>
          <View style={styles.stepTexts}>
            <CustomText style={styles.stepNum}>{step.num} / 03</CustomText>
            <CustomText style={styles.stepTitle}>{step.title}</CustomText>
            <CustomText style={styles.stepDesc}>{step.desc}</CustomText>
          </View>
        </Animated.View>

        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === stepIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.progressTrack} pointerEvents="none">
        <Animated.View
          style={[styles.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }]}
        />
      </View>

      <View style={styles.cornerDecor} pointerEvents="none">
        <CustomText style={styles.cornerText}>BuRandevu</CustomText>
      </View>
    </LinearGradient>
  );
};

export default memo(CustomerHomeCarousel);

const styles = StyleSheet.create({
  hero: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
  },

  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbTopRight: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
    backgroundColor: "rgba(212,175,55,0.13)",
  },
  orbBottomLeft: {
    width: 140,
    height: 140,
    bottom: -55,
    left: -40,
    backgroundColor: "rgba(212,175,55,0.06)",
  },
  orbSmall: {
    position: "absolute",
    width: 60,
    height: 60,
    top: 36,
    right: 90,
    borderRadius: 30,
    backgroundColor: "rgba(212,175,55,0.07)",
  },
  shimmerLine: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(212,175,55,0.18)",
    borderRadius: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 16,
  },

  stepBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepTexts: {
    flex: 1,
    gap: 3,
  },
  stepNum: {
    fontSize: 10,
    color: "rgba(212,175,55,0.6)",
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  stepTitle: {
    fontSize: 21,
    lineHeight: 26,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  stepDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "400",
    lineHeight: 17,
  },

  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(212,175,55,0.55)",
  },

  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#D4AF37",
  },

  cornerDecor: {
    position: "absolute",
    bottom: 18,
    right: 20,
  },
  cornerText: {
    fontSize: 11,
    color: "rgba(212,175,55,0.3)",
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
