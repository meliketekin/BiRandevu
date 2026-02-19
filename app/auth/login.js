import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import LayoutView from "../../components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";

export default function Login() {
  return (
    <LayoutView title="Giriş" scrollableContent contentContainerStyle={styles.contentContainer}>
      <CustomText>Giriş</CustomText>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  buttonOutlined: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
});
