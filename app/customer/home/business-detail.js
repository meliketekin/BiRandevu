import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LayoutView from "@/components/high-level/layout-view";
import CustomButton from "@/components/high-level/custom-button";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import CustomerBusinessCategoryTabs from "@/components/high-level/customer-business-category-tabs";
import CustomerServiceItem from "@/components/high-level/customer-service-item";
import CustomerTeamMember from "@/components/high-level/customer-team-member";
import { BUSINESS_ITEMS } from "@/constants/customer-businesses";
import { Colors } from "@/constants/colors";

const DETAIL_SERVICE_TABS = [
  { id: "hair", label: "Hair" },
  { id: "nails", label: "Nails" },
  { id: "facial", label: "Facial" },
  { id: "massage", label: "Massage" },
];

const DEFAULT_SERVICE_CATALOG = {
  hair: [{ id: "signature-cut", title: "Signature Cut & Style", description: "Kisisel analiz ile kesim, yikama ve sekillendirme hizmeti.", duration: "60 dk", price: "$80" }],
  nails: [{ id: "classic-manicure", title: "Classic Manicure", description: "Temel tirnak bakimi ve oje uygulamasi.", duration: "40 dk", price: "$40" }],
  facial: [{ id: "express-facial", title: "Express Facial", description: "Kisa sureli canlandirici cilt bakimi.", duration: "35 dk", price: "$55" }],
  massage: [{ id: "relief-massage", title: "Relief Massage", description: "Kaslari rahatlatan yenileyici masaj seansi.", duration: "50 dk", price: "$75" }],
};

const BusinessDetail = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const businessId = Array.isArray(id) ? id[0] : id;
  const business = useMemo(() => BUSINESS_ITEMS.find((item) => item.id === businessId) ?? BUSINESS_ITEMS[0], [businessId]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState(DETAIL_SERVICE_TABS[0].id);
  const teamMembers = business.team ?? business.staffImages?.map((imageUri, index) => ({ id: `member-${index}`, name: `Uzman ${index + 1}`, imageUri })) ?? [];
  const serviceCatalog = business.services ?? DEFAULT_SERVICE_CATALOG;

  const serviceItems = serviceCatalog[selectedServiceCategory] ?? [];
  const selectedService = serviceItems[0] ?? DEFAULT_SERVICE_CATALOG.hair[0];

  return (
    <LayoutView
      showBackButton
      title={business.title}
      rightButton={
        <CustomTouchableOpacity activeOpacity={0.8}>
          <Ionicons name="bookmark-outline" size={22} color={Colors.BrandPrimary} />
        </CustomTouchableOpacity>
      }
      style={styles.contentWrapper}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
          {business.galleryImages?.map((imageUri, index) => (
            <View key={`${business.id}-gallery-${index}`} style={[styles.galleryCard, index > 0 && styles.galleryCardSmall]}>
              <Image source={{ uri: imageUri }} style={styles.galleryImage} resizeMode="cover" />
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotsRow}>
          {business.galleryImages?.map((_, index) => (
            <View key={`${business.id}-dot-${index}`} style={[styles.dot, index === 0 ? styles.dotActive : null]} />
          ))}
        </View>

        <View style={styles.sectionCard}>
          <CustomText extraBold headerxl color={Colors.BrandPrimary}>
            {business.title}
          </CustomText>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={Colors.LightGray} />
            <CustomText sm color={Colors.LightGray} style={styles.locationText}>
              {business.location}
            </CustomText>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <CustomText semibold xs color="#15803D">
                Open Now
              </CustomText>
            </View>
            <CustomText sm color={Colors.LightGray}>
              {business.closesAt ?? "20:00'de kapaniyor"}
            </CustomText>
            <CustomText sm color={Colors.BrandGold}>
              Haritada Gor
            </CustomText>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.reviewBlock}>
            <View style={styles.reviewScoreColumn}>
              <View style={styles.scoreRow}>
                <CustomText extraBold xxlg color={Colors.BrandPrimary}>
                  {business.rating}
                </CustomText>
                <CustomText sm color={Colors.LightGray}>
                  / 5.0
                </CustomText>
              </View>

              <View style={styles.starsRow}>
                {[0, 1, 2, 3].map((star) => (
                  <Ionicons key={`star-full-${star}`} name="star" size={18} color={Colors.BrandGold} />
                ))}
                <Ionicons name="star-half" size={18} color={Colors.BrandGold} />
              </View>

              <CustomText sm color={Colors.LightGray} style={styles.reviewCountText}>
                {business.reviewCount} degerlendirme baz alindi
              </CustomText>
            </View>

            <View style={styles.reviewBars}>
              {(business.reviewDistribution ?? []).map((item) => (
                <View key={item.label} style={styles.reviewBarRow}>
                  <CustomText xs semibold color={Colors.BrandPrimary} style={styles.reviewLabel}>
                    {item.label}
                  </CustomText>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.percent}%` }]} />
                  </View>
                  <CustomText xs color={Colors.LightGray} style={styles.reviewPercent}>
                    %{item.percent}
                  </CustomText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CustomText bold lg color={Colors.BrandPrimary}>
              Meet the Team
            </CustomText>
            <CustomText semibold sm color={Colors.BrandGold}>
              View all
            </CustomText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamList}>
            {teamMembers.map((member) => (
              <CustomerTeamMember key={member.id} member={member} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionCard}>
          <CustomText bold lg color={Colors.BrandPrimary} style={styles.servicesTitle}>
            Services
          </CustomText>

          <CustomerBusinessCategoryTabs
            categories={DETAIL_SERVICE_TABS}
            selectedCategory={selectedServiceCategory}
            onSelectCategory={setSelectedServiceCategory}
          />

          <View>
            {serviceItems.map((service, index) => (
              <CustomerServiceItem key={service.id} item={service} isLast={index === serviceItems.length - 1} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <CustomButton
          title="Book Appointment"
          onPress={() =>
            router.push({
              pathname: "/customer/home/create-appointment",
              params: {
                id: business.id,
                serviceCategory: selectedServiceCategory,
                serviceId: selectedService.id,
              },
            })
          }
          marginTop={0}
          height={56}
          borderRadius={14}
          backgroundColor="#C6A87C"
          titleStyle={styles.bottomButtonTitle}
          rightIcon={<Ionicons name="calendar-outline" size={20} color={Colors.White} style={styles.bottomButtonIcon} />}
        />
      </View>
    </LayoutView>
  );
};

export default BusinessDetail;

const styles = StyleSheet.create({
  contentWrapper: {
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingTop: 14,
  },
  galleryContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  galleryCard: {
    width: 300,
    height: 250,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  galleryCardSmall: {
    width: 255,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(20,20,20,0.22)",
  },
  dotActive: {
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: "rgba(20,20,20,0.12)",
  },
  sectionCard: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  statusBadge: {
    backgroundColor: "#ECFDF3",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewBlock: {
    gap: 18,
  },
  reviewScoreColumn: {
    gap: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviewCountText: {
    marginTop: 4,
  },
  reviewBars: {
    gap: 10,
  },
  reviewBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewLabel: {
    width: 18,
    textAlign: "right",
    marginRight: 10,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#F1F1F1",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.BrandPrimary,
  },
  reviewPercent: {
    width: 42,
    textAlign: "right",
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  teamList: {
    gap: 14,
    paddingRight: 20,
  },
  servicesTitle: {
    marginBottom: 4,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
  },
  bottomButtonTitle: {
    lineHeight: 20,
  },
  bottomButtonIcon: {
    marginLeft: 8,
  },
});