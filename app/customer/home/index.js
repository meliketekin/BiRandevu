import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDrawerStore } from "@/stores/drawer-store";
import { Ionicons } from "@expo/vector-icons";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import { Colors } from "@/constants/colors";
import CustomImage from "@/components/high-level/custom-image";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import CustomerHomeCarousel from "@/components/high-level/customer-home-carousel";
import CustomerCategoryGrid from "@/components/high-level/customer-category-grid";
import CustomerPopularNearYou from "@/components/high-level/customer-popular-near-you";

export default function CustomerAnaSayfa() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openDrawerMenu = useDrawerStore((s) => s.openDrawer);

  const handleCategoryPress = (id) => {
    router.push("/customer/home/business-list");
  };

  const handleViewAllPress = () => {
    router.push("/customer/home/business-list");
  };

  const handlePopularItemPress = (id) => {
    // TODO: populer mekan detayına yönlendirme
  };

  return (
    <LayoutView isActiveHeader={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: 16,
            paddingBottom: insets.bottom + 89,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <View style={styles.headerTitle}>
            <CustomTouchableOpacity onPress={openDrawerMenu} style={styles.drawerButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="menu" size={26} color={Colors.BrandDark} />
            </CustomTouchableOpacity>
            <CustomImage uri={require("../../../assets/logo1.png")} isLocalFile style={styles.headerLogo} contentFit="contain" />
            <CustomText usePrimaryColor semibold lg>
              BuRandevu
            </CustomText>
            
          </View>
        </View>

        <CustomerHomeCarousel />
        <CustomerCategoryGrid onCategoryPress={handleCategoryPress} onViewAllPress={handleViewAllPress} />
        <CustomerPopularNearYou onItemPress={handlePopularItemPress} />
      </ScrollView>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 1,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drawerButton: {
    padding: 2,
  },
  headerDescription: {
    paddingLeft: 2,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: 24,
  },
});
