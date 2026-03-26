import { StyleSheet, useWindowDimensions } from "react-native";
import React, { memo } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { useDrawerProgress } from "@react-navigation/drawer";
import { Colors } from "@/constants/colors";

const DrawerSceneWrapper = ({ children, isAnimatedWithSideMenu }) => {
  if (!isAnimatedWithSideMenu) {
    return children;
  }

  const progress = useDrawerProgress();
  const { width } = useWindowDimensions();

  // Progress değerini spring fizikle yumuşat
  const smoothProgress = useDerivedValue(() =>
    withSpring(progress.value, {
      damping: 28,
      stiffness: 160,
      mass: 0.3,
      overshootClamping: false,
    })
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(smoothProgress.value, [0, 1], [1, 0.75], "clamp") },
      { translateX: interpolate(smoothProgress.value, [0, 3], [0, width], "clamp") },
      { rotate: `${interpolate(smoothProgress.value, [0, 1], [0, 5], "clamp")}deg` },
    ],
    borderRadius: interpolate(smoothProgress.value, [0, 1], [0, 20], "clamp"),
    overflow: "hidden",
  }));

  const animatedStyleBg = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(smoothProgress.value, [0, 2], [0, width], "clamp") },
    ],
  }));

  return (
    <>
      {/* Arka planda görünen küçük sayfa efekti */}
      <Animated.View style={[styles.bgPage, animatedStyleBg]} />
      {/* Ana içerik */}
      <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
    </>
  );
};

export default memo(DrawerSceneWrapper);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 99,
    backgroundColor: Colors.Background,
  },
  bgPage: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: "85%",
    width: 100,
    left: 20,
    top: "7%",
    borderRadius: 50,
    zIndex: -1,
  },
});
