import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import ActivityLoading from "@/components/high-level/activity-loading";
import { Colors } from "@/constants/colors";
import CommandBus from "@/infrastructures/command-bus/command-bus";

const STATIC_RATING = "4.8";
const STATIC_REVIEW_COUNT = 124;
const STATIC_CATEGORY = "İşletme";

async function fetchFavorites(uid) {
  const favSnap = await getDocs(collection(db, "users", uid, "favorites"));
  if (favSnap.empty) return [];

  const results = await Promise.all(
    favSnap.docs.map(async (favDoc) => {
      const businessId = favDoc.data().businessId ?? favDoc.id;
      try {
        const bizSnap = await getDoc(doc(db, "businesses", businessId));
        if (!bizSnap.exists()) return null;
        const data = bizSnap.data();
        return {
          favDocId: favDoc.id,
          businessId,
          title: data.businessName ?? "İşletme",
          categoryLabel: data.category ?? STATIC_CATEGORY,
          rating: STATIC_RATING,
          reviewCount: STATIC_REVIEW_COUNT,
          location: data.address ?? "",
          imageUri: Array.isArray(data.venuePhotos) && data.venuePhotos.length > 0 ? data.venuePhotos[0] : null,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}

const Favorites = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const loadFavorites = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchFavorites(uid);
      setItems(data);
    } catch (err) {
      console.error("Favorites load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const handleRemove = useCallback(
    async (item) => {
      const uid = auth.currentUser?.uid;
      if (!uid || removingId) return;

      setRemovingId(item.favDocId);
      try {
        await deleteDoc(doc(db, "users", uid, "favorites", item.favDocId));
        setItems((prev) => prev.filter((i) => i.favDocId !== item.favDocId));
        CommandBus.sc.alertInfo("Favoriler güncellendi", `${item.title} favorilerden kaldırıldı.`, 2200);
      } catch (err) {
        console.error("Remove favorite error:", err);
      } finally {
        setRemovingId(null);
      }
    },
    [removingId],
  );

  const handleCardPress = useCallback(
    (item) => {
      router.push({ pathname: "/customer/business-detail", params: { id: item.businessId } });
    },
    [router],
  );

  const handleBookPress = useCallback(
    (item) => {
      router.push({ pathname: "/customer/business-detail", params: { id: item.businessId } });
    },
    [router],
  );

  return (
    <LayoutView title="Favorilerim" showBackButton={false} style={styles.layoutContent}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityLoading style={styles.loader} />
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="heart-outline" size={28} color={Colors.LightGray2} />
            </View>
            <CustomText bold fontSize={15} color={Colors.BrandPrimary}>
              Henüz favori yok
            </CustomText>
            <CustomText medium fontSize={13} color={Colors.LightGray2} style={styles.emptyDescription}>
              Beğendiğin işletmeleri favorilere ekleyerek buradan hızlıca ulaşabilirsin.
            </CustomText>
          </View>
        ) : (
          <View style={styles.cardList}>
            {items.map((item) => (
              <Pressable key={item.favDocId} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => handleCardPress(item)}>

                {/* Fotoğraf bloğu */}
                <View style={styles.imageWrapper}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={200} />
                  ) : (
                    <LinearGradient colors={["#2C2C3E", "#1A1A2E"]} style={styles.imagePlaceholder}>
                      <Ionicons name="business-outline" size={36} color="rgba(255,255,255,0.2)" />
                    </LinearGradient>
                  )}

                  {/* Alt gradient */}
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={styles.imageGradient} pointerEvents="none" />

                  {/* Kategori chip — sol alt */}
                  {!!item.categoryLabel && (
                    <View style={styles.categoryChip}>
                      <CustomText xs semibold color={Colors.White}>{item.categoryLabel}</CustomText>
                    </View>
                  )}

                  {/* Kalp butonu — sağ üst */}
                  <Pressable
                    onPress={() => handleRemove(item)}
                    disabled={removingId === item.favDocId}
                    style={({ pressed }) => [styles.heartBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Ionicons name="heart" size={18} color="#E05252" />
                  </Pressable>
                </View>

                {/* İçerik */}
                <View style={styles.cardContent}>
                  {/* İsim + puan */}
                  <View style={styles.cardTopRow}>
                    <CustomText bold fontSize={16} color={Colors.BrandPrimary} numberOfLines={1} style={styles.cardTitle}>
                      {item.title}
                    </CustomText>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={Colors.BrandGold} />
                      <CustomText xs semibold color={Colors.BrandPrimary}>{item.rating}</CustomText>
                      <CustomText xs color={Colors.LightGray}>({item.reviewCount})</CustomText>
                    </View>
                  </View>

                  {/* Adres + Randevu butonu */}
                  <View style={styles.cardBottomRow}>
                    {!!item.location && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={13} color={Colors.LightGray} />
                        <CustomText xs color={Colors.LightGray} numberOfLines={1} style={styles.locationText}>
                          {item.location}
                        </CustomText>
                      </View>
                    )}
                    <Pressable style={({ pressed }) => [styles.bookButton, pressed && { opacity: 0.8 }]} onPress={() => handleBookPress(item)}>
                      <CustomText xs semibold color={Colors.White}>Randevu Al</CustomText>
                      <Ionicons name="arrow-forward" size={12} color={Colors.White} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </LayoutView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  layoutContent: {
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerSection: {
    marginBottom: 24,
  },
  subtitle: {
    lineHeight: 20,
  },
  loader: {
    minHeight: 200,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 10,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,20,20,0.05)",
    marginBottom: 4,
  },
  emptyDescription: {
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  cardList: {
    gap: 16,
    paddingBottom: 42,
  },
  card: {
    backgroundColor: Colors.White,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(20,20,20,0.06)",
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.93,
    transform: [{ scale: 0.99 }],
  },

  // Fotoğraf
  imageWrapper: {
    height: 155,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  categoryChip: {
    position: "absolute",
    bottom: 12,
    left: 14,
    backgroundColor: "rgba(198,168,124,0.85)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  // İçerik
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    lineHeight: 21,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  locationRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    flex: 1,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.BrandPrimary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 0,
  },
});
