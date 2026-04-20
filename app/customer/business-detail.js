import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CAROUSEL_HEIGHT = 230;

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import LayoutView from "@/components/high-level/layout-view";
import CustomButton from "@/components/high-level/custom-button";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import CustomerServiceItem from "@/components/customer/service-item";
import CustomerTeamMember from "@/components/customer/team-member";
import { Colors } from "@/constants/colors";
import CommandBus from "@/infrastructures/command-bus/command-bus";

const DAYS_ORDER = [
  { dayIndex: 1, label: "Pazartesi" },
  { dayIndex: 2, label: "Salı" },
  { dayIndex: 3, label: "Çarşamba" },
  { dayIndex: 4, label: "Perşembe" },
  { dayIndex: 5, label: "Cuma" },
  { dayIndex: 6, label: "Cumartesi" },
  { dayIndex: 0, label: "Pazar" },
];

const TABS = [
  { key: "services", label: "Hizmetler" },
  { key: "info", label: "Bilgiler" },
  { key: "reviews", label: "Yorumlar" },
];

const STATIC_RATING = "4.8";
const STATIC_REVIEW_COUNT = 124;
const STATIC_REVIEW_DISTRIBUTION = [
  { label: "5", percent: 78 },
  { label: "4", percent: 15 },
  { label: "3", percent: 4 },
];
const STATIC_REVIEWS = [
  { id: "1", name: "Ayşe K.", rating: 5, comment: "Harika bir deneyimdi, kesinlikle tavsiye ederim.", date: "2 gün önce" },
  { id: "2", name: "Mehmet Y.", rating: 4, comment: "Çok güzel hizmet, personel ilgili ve güler yüzlü.", date: "1 hafta önce" },
  { id: "3", name: "Zeynep A.", rating: 5, comment: "Mükemmel, tekrar geleceğim!", date: "2 hafta önce" },
];

function getBusinessStatus(workingHours) {
  if (!workingHours) return { isOpen: false, label: null };
  const now = new Date();
  const dayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayEntry = workingHours[String(dayIndex)];
  const parseMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  if (todayEntry?.enabled) {
    const start = parseMinutes(todayEntry.start);
    const end = parseMinutes(todayEntry.end);
    if (currentMinutes >= start && currentMinutes < end) {
      return { isOpen: true, label: `${todayEntry.end}'de kapanıyor` };
    }
    if (currentMinutes < start) {
      return { isOpen: false, label: `${todayEntry.start}'de açılıyor` };
    }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (dayIndex + offset) % 7;
    const nextEntry = workingHours[String(nextDayIndex)];
    if (nextEntry?.enabled) {
      const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
      const label =
        offset === 1
          ? `Yarın ${nextEntry.start}'de açılıyor`
          : `${dayNames[nextDayIndex]} ${nextEntry.start}'de açılıyor`;
      return { isOpen: false, label };
    }
  }
  return { isOpen: false, label: "Kapalı" };
}

const BusinessDetail = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const businessId = Array.isArray(id) ? id[0] : id;

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [lightbox, setLightbox] = useState({ visible: false, images: [], index: 0 });
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const lightboxRef = useRef(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const TAB_WIDTH = SCREEN_WIDTH / TABS.length;

  const handleTabChange = (key) => {
    const idx = TABS.findIndex((t) => t.key === key);
    Animated.spring(tabIndicatorAnim, {
      toValue: idx * TAB_WIDTH,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
    Animated.sequence([
      Animated.timing(tabFadeAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
      Animated.timing(tabFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveTab(key);
  };

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((sid) => sid !== serviceId) : [...prev, serviceId],
    );
  };

  useEffect(() => {
    if (!businessId) return;
    const todayIndex = String(new Date().getDay());
    const uid = auth.currentUser?.uid;
    const favRef = uid ? getDoc(doc(db, "users", uid, "favorites", businessId)) : Promise.resolve(null);

    Promise.all([
      getDoc(doc(db, "businesses", businessId)),
      getDocs(collection(db, "businesses", businessId, "services")),
      getDocs(collection(db, "businesses", businessId, "employees")),
      favRef,
    ])
      .then(([businessSnap, servicesSnap, employeesSnap, favSnap]) => {
        if (businessSnap.exists()) {
          setBusiness({ id: businessSnap.id, ...businessSnap.data() });
        }
        setServices(
          servicesSnap.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                title: data.name,
                description: data.description ?? "",
                duration: `${data.durationMinutes} dk`,
                price: `₺${Number(data.price).toLocaleString("tr-TR")}`,
                isActive: data.isActive ?? true,
              };
            })
            .filter((s) => s.isActive),
        );
        setTeamMembers(
          employeesSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name,
              imageUri: data.photoUrl ?? null,
              active: data.workingHours?.[todayIndex]?.enabled ?? false,
            };
          }),
        );
        if (favSnap?.exists()) setIsFavorite(true);
      })
      .catch((err) => console.error("BusinessDetail load error:", err))
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleToggleFavorite = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || favoriteLoading) return;
    setFavoriteLoading(true);
    const favRef = doc(db, "users", uid, "favorites", businessId);
    try {
      if (isFavorite) {
        await deleteDoc(favRef);
        setIsFavorite(false);
        CommandBus.sc.alertSuccess("Favori kaldırıldı", "İşletme favorilerinizden kaldırıldı.", 2200);
      } else {
        await setDoc(favRef, { businessId, savedAt: new Date() });
        setIsFavorite(true);
        CommandBus.sc.alertSuccess("Favori eklendi", "İşletme favorilerinize eklendi.", 2200);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleOpenMaps = (address) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  const openLightbox = (images, index) => setLightbox({ visible: true, images, index });
  const closeLightbox = () => setLightbox({ visible: false, images: [], index: 0 });

  const title = business?.businessName ?? "İşletme";
  const location = business?.address ?? "";
  const venuePhotos = Array.isArray(business?.venuePhotos) ? business.venuePhotos : [];
  const operationPhotos = Array.isArray(business?.servicePhotos) ? business.servicePhotos : [];
  const phone = business?.phone ?? null;
  const businessStatus = getBusinessStatus(business?.workingHours);

  if (loading) {
    return (
      <LayoutView showBackButton title="" paddingHorizontal={0}>
        <ActivityIndicator size="large" color={Colors.BrandPrimary} style={styles.loader} />
      </LayoutView>
    );
  }

  return (
    <LayoutView isActiveHeader={false} paddingTop={0} paddingHorizontal={0} style={styles.contentWrapper}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Carousel ── */}
        <View style={styles.carouselWrapper}>
          {venuePhotos.length > 0 ? (
            <FlatList
              data={venuePhotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCarouselIndex(idx);
              }}
              renderItem={({ item, index }) => (
                <CustomTouchableOpacity activeOpacity={0.92} onPress={() => openLightbox(venuePhotos, index)}>
                  <Image source={{ uri: item }} style={styles.carouselImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
                </CustomTouchableOpacity>
              )}
            />
          ) : (
            <LinearGradient colors={["#2C2C3E", "#1A1A2E"]} style={styles.carouselImage}>
              <View style={styles.carouselPlaceholderInner}>
                <Ionicons name="business-outline" size={52} color="rgba(255,255,255,0.2)" />
              </View>
            </LinearGradient>
          )}

          {/* Alt gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.carouselGradient}
            pointerEvents="none"
          />

          {/* Floating üst butonlar */}
          <View style={[styles.carouselTopRow, { paddingTop: insets.top + 10 }]}>
            <CustomTouchableOpacity style={styles.floatBtn} activeOpacity={0.8} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.White} />
            </CustomTouchableOpacity>
            <CustomTouchableOpacity style={styles.floatBtn} activeOpacity={0.8} onPress={handleToggleFavorite} disabled={favoriteLoading}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FF6B6B" : Colors.White} />
            </CustomTouchableOpacity>
          </View>

          {/* Alt göstergeler */}
          <View style={styles.carouselBottomRow}>
            {venuePhotos.length > 1 ? (
              <View style={styles.dotsRow}>
                {venuePhotos.map((_, i) => (
                  <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
                ))}
              </View>
            ) : <View />}
            {venuePhotos.length > 0 && (
              <View style={styles.photoCountBadge}>
                <Ionicons name="camera-outline" size={11} color="rgba(255,255,255,0.9)" />
                <CustomText xs color="rgba(255,255,255,0.9)" style={styles.photoCountText}>
                  {carouselIndex + 1}/{venuePhotos.length}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        {/* ── Lightbox ── */}
        <Modal visible={lightbox.visible} transparent animationType="fade" onRequestClose={closeLightbox} statusBarTranslucent>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <View style={styles.lightboxOverlay}>
            <Pressable style={styles.lightboxClose} onPress={closeLightbox}>
              <Ionicons name="close" size={26} color={Colors.White} />
            </Pressable>
            <CustomText xs color="rgba(255,255,255,0.6)" style={styles.lightboxCounter}>
              {lightbox.index + 1} / {lightbox.images.length}
            </CustomText>
            <FlatList
              ref={lightboxRef}
              data={lightbox.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={lightbox.index}
              getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setLightbox((prev) => ({ ...prev, index: newIndex }));
              }}
              renderItem={({ item }) => (
                <View style={styles.lightboxImageWrapper}>
                  <Image source={{ uri: item }} style={styles.lightboxImage} contentFit="contain" cachePolicy="memory-disk" />
                </View>
              )}
            />
          </View>
        </Modal>

        {/* ── İşletme Bilgileri ── */}
        <View style={styles.infoCard}>
          {/* Satır 1: İsim + aksiyon chipları */}
          <View style={styles.infoTopRow}>
            <CustomText extraBold headerxl color={Colors.BrandPrimary} style={styles.infoTitle}>
              {title}
            </CustomText>
            <View style={styles.infoChips}>
              <CustomTouchableOpacity style={styles.chip} activeOpacity={0.75} onPress={() => location && handleOpenMaps(location)}>
                <Ionicons name="map-outline" size={13} color={Colors.BrandGold} />
                <CustomText xs semibold color={Colors.BrandGold}>Harita</CustomText>
              </CustomTouchableOpacity>
              {!!phone && (
                <CustomTouchableOpacity style={[styles.chip, styles.chipCall]} activeOpacity={0.75} onPress={() => Linking.openURL(`tel:${phone}`)}>
                  <Ionicons name="call-outline" size={13} color={Colors.White} />
                  <CustomText xs semibold color={Colors.White}>Ara</CustomText>
                </CustomTouchableOpacity>
              )}
            </View>
          </View>

          {/* Satır 2: Puan */}
          <View style={styles.infoMetaRow}>
            <View style={styles.starsSmallRow}>
              {[0, 1, 2, 3].map((s) => (
                <Ionicons key={s} name="star" size={12} color={Colors.BrandGold} />
              ))}
              <Ionicons name="star-half" size={12} color={Colors.BrandGold} />
            </View>
            <CustomText xs semibold color={Colors.BrandPrimary}>{STATIC_RATING}</CustomText>
            <CustomText xs color={Colors.LightGray}>({STATIC_REVIEW_COUNT})</CustomText>
          </View>

          {/* Satır 3: Adres */}
          {!!location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.LightGray} />
              <CustomText xs color={Colors.LightGray} style={styles.locationText} numberOfLines={1}>
                {location}
              </CustomText>
            </View>
          )}

          {/* Satır 3: Durum */}
          {business?.workingHours && (
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, !businessStatus.isOpen && styles.statusDotClosed]} />
              <CustomText xs semibold color={businessStatus.isOpen ? "#15803D" : "#B91C1C"}>
                {businessStatus.isOpen ? "Açık" : "Kapalı"}
              </CustomText>
              {!!businessStatus.label && (
                <CustomText xs color={businessStatus.isOpen ? "#15803D" : "#B91C1C"}>
                  · {businessStatus.label}
                </CustomText>
              )}
            </View>
          )}
        </View>

        {/* ── Tab Bar ── */}
        <View style={styles.tabBar}>
          {/* Sliding indicator */}
          <Animated.View
            style={[styles.tabIndicator, { width: TAB_WIDTH, transform: [{ translateX: tabIndicatorAnim }] }]}
            pointerEvents="none"
          >
            <View />
          </Animated.View>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <CustomTouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => handleTabChange(tab.key)}
              >
                <CustomText sm semibold={isActive} color={isActive ? Colors.BrandPrimary : Colors.LightGray}>
                  {tab.label}
                </CustomText>
              </CustomTouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab İçerikleri ── */}

        {/* Hizmetler */}
        {activeTab === "services" && (
          <Animated.View style={[styles.tabContent, { opacity: tabFadeAnim }]}>
            {services.length === 0 ? (
              <CustomText sm color={Colors.LightGray} style={styles.emptyText}>
                Henüz hizmet eklenmemiş.
              </CustomText>
            ) : (
              <>
                {selectedServiceIds.length > 0 && (
                  <CustomText sm color={Colors.BrandGold} semibold style={{ marginBottom: 12 }}>
                    {selectedServiceIds.length} hizmet seçildi
                  </CustomText>
                )}
                {services.map((service, index) => (
                  <CustomerServiceItem
                    key={service.id}
                    item={service}
                    isLast={index === services.length - 1}
                    selected={selectedServiceIds.includes(service.id)}
                    onToggle={() => toggleService(service.id)}
                  />
                ))}
              </>
            )}
          </Animated.View>
        )}

        {/* Bilgiler */}
        {activeTab === "info" && (
          <Animated.View style={[styles.tabContent, { opacity: tabFadeAnim }]}>
            {business?.workingHours && (
              <>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="time-outline" size={16} color={Colors.BrandPrimary} />
                  <CustomText bold lg color={Colors.BrandPrimary}>
                    Çalışma Saatleri
                  </CustomText>
                </View>
                {DAYS_ORDER.map(({ dayIndex, label }) => {
                  const entry = business.workingHours[String(dayIndex)];
                  const isToday = new Date().getDay() === dayIndex;
                  const isOpen = entry?.enabled ?? false;
                  return (
                    <View key={dayIndex} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
                      <CustomText sm semibold={isToday} color={isToday ? Colors.BrandPrimary : Colors.TextColor} style={styles.hoursDay}>
                        {label}
                      </CustomText>
                      {isOpen ? (
                        <CustomText sm color={isToday ? Colors.BrandPrimary : Colors.LightGray}>
                          {entry.start} – {entry.end}
                        </CustomText>
                      ) : (
                        <CustomText sm color={Colors.ErrorColor ?? "#EF4444"}>
                          Kapalı
                        </CustomText>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {teamMembers.length > 0 && (
              <>
                <View style={[styles.infoSectionHeader, styles.infoSectionHeaderSpaced]}>
                  <Ionicons name="people-outline" size={16} color={Colors.BrandPrimary} />
                  <CustomText bold lg color={Colors.BrandPrimary}>
                    Çalışanlar
                  </CustomText>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamList}>
                  {teamMembers.map((member) => (
                    <CustomerTeamMember key={member.id} member={member} />
                  ))}
                </ScrollView>
              </>
            )}

            {operationPhotos.length > 0 && (
              <>
                <View style={[styles.infoSectionHeader, styles.infoSectionHeaderSpaced]}>
                  <Ionicons name="images-outline" size={16} color={Colors.BrandPrimary} />
                  <CustomText bold lg color={Colors.BrandPrimary}>
                    İşlem Fotoğrafları
                  </CustomText>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.opPhotoRow}>
                  {operationPhotos.map((uri, index) => (
                    <CustomTouchableOpacity key={index} activeOpacity={0.88} onPress={() => openLightbox(operationPhotos, index)}>
                      <Image source={{ uri }} style={styles.opPhotoThumb} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                    </CustomTouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </Animated.View>
        )}

        {/* Yorumlar */}
        {activeTab === "reviews" && (
          <Animated.View style={[styles.tabContent, { opacity: tabFadeAnim }]}>
            {/* Ortalama Puan */}
            <View style={styles.avgRatingRow}>
              <View style={styles.avgRatingLeft}>
                <CustomText extraBold xxlg color={Colors.BrandPrimary}>
                  {STATIC_RATING}
                </CustomText>
                <CustomText sm color={Colors.LightGray}>
                  / 5.0
                </CustomText>
              </View>
              <View style={styles.avgRatingRight}>
                <View style={styles.starsRow}>
                  {[0, 1, 2, 3].map((s) => (
                    <Ionicons key={s} name="star" size={17} color={Colors.BrandGold} />
                  ))}
                  <Ionicons name="star-half" size={17} color={Colors.BrandGold} />
                </View>
                <CustomText xs color={Colors.LightGray} style={{ marginTop: 4 }}>
                  {STATIC_REVIEW_COUNT} değerlendirme
                </CustomText>
                <View style={styles.reviewBars}>
                  {STATIC_REVIEW_DISTRIBUTION.map((item) => (
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

            {/* Yorum Listesi */}
            <View style={styles.reviewDivider} />
            {STATIC_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewItemHeader}>
                  <View style={styles.reviewAvatar}>
                    <CustomText sm bold color={Colors.White}>
                      {review.name[0]}
                    </CustomText>
                  </View>
                  <View style={styles.reviewItemMeta}>
                    <CustomText sm bold color={Colors.BrandPrimary}>
                      {review.name}
                    </CustomText>
                    <CustomText xs color={Colors.LightGray}>
                      {review.date}
                    </CustomText>
                  </View>
                  <View style={styles.reviewStarsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={13}
                        color={Colors.BrandGold}
                      />
                    ))}
                  </View>
                </View>
                <CustomText sm color={Colors.TextColor} style={styles.reviewComment}>
                  {review.comment}
                </CustomText>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Alt Buton (Sadece Hizmetler tab'ında) ── */}
      {activeTab === "services" && services.length > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <CustomButton
            title={selectedServiceIds.length > 0 ? `Randevu Al (${selectedServiceIds.length} hizmet)` : "Randevu Al"}
            onPress={() =>
              router.push({
                pathname: "/customer/create-appointment",
                params: { id: businessId, serviceIds: JSON.stringify(selectedServiceIds) },
              })
            }
            disabled={selectedServiceIds.length === 0}
            marginTop={0}
            height={56}
            borderRadius={14}
            backgroundColor="#C6A87C"
            titleStyle={styles.bottomButtonTitle}
            rightIcon={<Ionicons name="calendar-outline" size={20} color={Colors.White} style={styles.bottomButtonIcon} />}
          />
        </View>
      )}
    </LayoutView>
  );
};

export default BusinessDetail;

const styles = StyleSheet.create({
  contentWrapper: {
    paddingHorizontal: 0,
  },
  loader: {
    flex: 1,
    alignSelf: "center",
    marginTop: 80,
  },
  scrollView: {
    flex: 1,
  },

  // Carousel
  carouselWrapper: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    overflow: "hidden",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  carouselPlaceholderInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  carouselTopRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  carouselBottomRow: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  floatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.White,
  },
  photoCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    letterSpacing: 0.3,
  },

  // Info card
  infoCard: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    gap: 6,
  },
  infoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  infoTitle: {
    flex: 1,
  },
  infoMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
  },
  infoMetaAddress: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    flex: 1,
  },
  starsSmallRow: {
    flexDirection: "row",
    gap: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  statusDotClosed: {
    backgroundColor: "#EF4444",
  },
  infoChips: {
    flexDirection: "row",
    gap: 7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.BrandGold,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  chipCall: {
    backgroundColor: Colors.BrandPrimary,
    borderColor: Colors.BrandPrimary,
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    backgroundColor: Colors.White,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2.5,
    backgroundColor: Colors.BrandPrimary,
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },

  // Tab content
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Info tab
  infoSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  infoSectionHeaderSpaced: {
    marginTop: 28,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  hoursRowToday: {
    backgroundColor: "rgba(212,175,55,0.1)",
    paddingHorizontal: 10,
  },
  hoursDay: {
    width: 110,
  },
  teamList: {
    gap: 14,
    paddingRight: 4,
  },
  opPhotoRow: {
    gap: 10,
    paddingRight: 4,
  },
  opPhotoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  phoneIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(212,175,55,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Reviews tab
  avgRatingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 4,
  },
  avgRatingLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    paddingTop: 4,
  },
  avgRatingRight: {
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviewBars: {
    gap: 8,
    marginTop: 10,
  },
  reviewBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewLabel: {
    width: 16,
    textAlign: "right",
    marginRight: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
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
    width: 38,
    textAlign: "right",
    marginLeft: 8,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginVertical: 20,
  },
  reviewItem: {
    marginBottom: 20,
  },
  reviewItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.BrandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewItemMeta: {
    flex: 1,
  },
  reviewStarsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    lineHeight: 20,
    color: "#374151",
  },

  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxCounter: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 10,
  },
  lightboxImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },

  // Bottom bar
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
