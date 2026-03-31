import { useEffect, useRef, useCallback } from "react";
import { BackHandler, View, Pressable, StyleSheet, Animated } from "react-native";
import { Tabs, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "@/store/auth-store";
import useTabBarStore from "@/store/tab-bar-store";
import CustomText from "@/components/high-level/custom-text";

const TAB_ITEMS = [
  { name: "index",       label: "Anasayfa",  icon: "home",           iconOutline: "home-outline" },
  { name: "appointments",label: "Randevular",icon: "calendar",       iconOutline: "calendar-outline" },
  { name: "requests",    label: "Talepler",  icon: "file-tray-full", iconOutline: "file-tray-full-outline" },
  { name: "management",  label: "Yönetim",   icon: "grid",           iconOutline: "grid-outline" },
  { name: "profile",     label: "Profil",    icon: "person",         iconOutline: "person-outline" },
];

function AnimatedTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const visible = useTabBarStore((s) => s.visible);
  const translateY = useRef(new Animated.Value(0)).current;
  const TAB_HEIGHT = 56 + insets.bottom;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : TAB_HEIGHT + 10,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible, TAB_HEIGHT]);

  return (
    <Animated.View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom, height: TAB_HEIGHT },
        { transform: [{ translateY }] },
      ]}
    >
      {TAB_ITEMS.map((item) => {
        const routeIndex = state.routes.findIndex((r) => r.name === item.name);
        const focused = state.index === routeIndex;

        return (
          <Pressable
            key={item.name}
            style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: state.routes[routeIndex]?.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(item.name);
              }
            }}
          >
            <Ionicons
              name={focused ? item.icon : item.iconOutline}
              size={24}
              color={focused ? "#007AFF" : "#8F959E"}
            />
            <CustomText min color={focused ? "#007AFF" : "#8F959E"} style={styles.tabLabel}>
              {item.label}
            </CustomText>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

export default function BusinessTabsLayout() {
  const isBusinessInfoCompleted = useAuthStore((s) => s.isBusinessInfoCompleted);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const redirected = useRef(false);

  useEffect(() => {
    if (isAdmin && !isBusinessInfoCompleted && !redirected.current) {
      redirected.current = true;
      router.replace("/auth/business-info-form");
    }
  }, [isAdmin, isBusinessInfoCompleted]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, [])
  );

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="management" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(20,20,20,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    gap: 3,
  },
  tabLabel: {
    letterSpacing: 0,
  },
});
