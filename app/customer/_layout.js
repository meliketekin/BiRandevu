import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useEffect } from "react";

const TAB_ICON_SIZE = 24;

const springConfig = {
  damping: 14,
  stiffness: 150,
};

function AnimatedTabIcon({ name, color, focused }) {
  const scale = useSharedValue(focused ? 1.15 : 0.92);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 0.92, springConfig);
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, animatedStyle]}>
      <Ionicons name={name} size={TAB_ICON_SIZE} color={color} />
    </Animated.View>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.BrandPrimary,
        tabBarInactiveTintColor: Colors.LightGray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarLabel: ({ focused, color }) => (focused ? <Text style={[styles.tabBarLabel, { color }]}>Ana Sayfa</Text> : null),
          tabBarIcon: (props) => <AnimatedTabIcon name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="randevular"
        options={{
          title: "Randevularım",
          tabBarLabel: ({ focused, color }) => (focused ? <Text style={[styles.tabBarLabel, { color }]}>Randevular</Text> : null),
          tabBarIcon: (props) => <AnimatedTabIcon name="calendar" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarLabel: ({ focused, color }) => (focused ? <Text style={[styles.tabBarLabel, { color }]}>Profil</Text> : null),
          tabBarIcon: (props) => <AnimatedTabIcon name="person" {...props} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BorderColor,
    elevation: 8,
    shadowColor: Colors.BrandDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
