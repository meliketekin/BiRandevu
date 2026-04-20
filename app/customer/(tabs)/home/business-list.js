import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import CommandBus from "@/infrastructures/command-bus/command-bus";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import CustomerBusinessCard from "@/components/customer/business-card";
import BusinessCardSkeleton from "@/components/customer/business-card-skeleton";
import CustomerBusinessCategoryTabs from "@/components/customer/business-category-tabs";
import { Colors } from "@/constants/colors";
import { BUSINESS_CATEGORIES, normalizeBusinessCategory } from "@/enums/business-category-enum";

function categoryFromRouteParam(param) {
  const v = Array.isArray(param) ? param[0] : param;
  if (v === "all" || v === undefined || v === "") return "all";
  if (BUSINESS_CATEGORIES.includes(v)) return v;
  return "all";
}

const BusinessList = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams();
  const searchInputRef = useRef(null);

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(() => categoryFromRouteParam(categoryParam));
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const favPromise = uid
      ? getDocs(collection(db, "users", uid, "favorites")).then((snap) =>
          new Set(snap.docs.map((d) => d.data().businessId ?? d.id)),
        )
      : Promise.resolve(new Set());

    Promise.all([getDocs(collection(db, "businesses")), favPromise])
      .then(([snap, favSet]) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          const venuePhotos = Array.isArray(data.venuePhotos) ? data.venuePhotos : [];
          const servicePhotos = Array.isArray(data.servicePhotos) ? data.servicePhotos : [];
          const photos = [...venuePhotos, ...servicePhotos].filter(Boolean);
          return {
            id: d.id,
            title: data.businessName ?? "",
            category: normalizeBusinessCategory(data.category ?? ""),
            location: data.address ?? "",
            photos,
            imageUri: photos[0] ?? null,
            workingHours: data.workingHours ?? null,
            staffImages: [],
            rating: "4.8",
            reviewCount: 0,
          };
        });
        setBusinesses(docs);
        setFavoriteIds(favSet);
        const uris = docs.map((d) => d.imageUri).filter(Boolean);
        if (uris.length) Image.prefetch(uris);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = useCallback(async (item) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const favRef = doc(db, "users", uid, "favorites", item.id);
    const isCurrentlyFav = favoriteIds.has(item.id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isCurrentlyFav ? next.delete(item.id) : next.add(item.id);
      return next;
    });
    try {
      if (isCurrentlyFav) {
        await deleteDoc(favRef);
        CommandBus.sc.alertInfo("Favori kaldırıldı", `${item.title} favorilerden kaldırıldı.`, 2000);
      } else {
        await setDoc(favRef, { businessId: item.id, savedAt: new Date() });
        CommandBus.sc.alertSuccess("Favori eklendi", `${item.title} favorilerinize eklendi.`, 2000);
      }
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isCurrentlyFav ? next.add(item.id) : next.delete(item.id);
        return next;
      });
    }
  }, [favoriteIds]);

  useEffect(() => {
    setSelectedCategory(categoryFromRouteParam(categoryParam));
  }, [categoryParam]);

  const toggleSearch = () => {
    setSearchVisible((v) => {
      if (v) setSearchQuery("");
      else setTimeout(() => searchInputRef.current?.focus(), 50);
      return !v;
    });
  };

  const filteredBusinesses = useMemo(() => {
    let list = businesses;
    if (selectedCategory !== "all") {
      list = list.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }
    return list;
  }, [businesses, selectedCategory, searchQuery]);

  return (
    <LayoutView
      showBackButton
      title="İşletmeler"
      paddingHorizontal={10}
      rightButton={
        <CustomTouchableOpacity activeOpacity={0.8} onPress={toggleSearch}>
          <Ionicons
            name={searchVisible ? "close-outline" : "search-outline"}
            size={22}
            color={Colors.BrandPrimary}
          />
        </CustomTouchableOpacity>
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searchVisible && (
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.LightGray2} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="İşletme ara..."
              placeholderTextColor={Colors.LightGray2}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <CustomTouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color={Colors.LightGray2} />
              </CustomTouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.tabsWrap}>
          <CustomerBusinessCategoryTabs
            categories={BUSINESS_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {!loading && (
          <View style={styles.countRow}>
            <View style={styles.countBadge}>
              <Ionicons name="storefront-outline" size={15} color={Colors.Gold} />
              <View style={styles.countBadgeTextRow}>
                <CustomText xs semibold color={Colors.Gold}>
                  {filteredBusinesses.length}
                </CustomText>
                <CustomText xs semibold color={Colors.BrandPrimary}>
                  {" işletme"}
                </CustomText>
              </View>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.list}>
            {[1, 2, 3].map((i) => <BusinessCardSkeleton key={i} />)}
          </View>
        ) : filteredBusinesses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={36} color={Colors.LightGray2} />
            <CustomText sm color={Colors.LightGray2} style={styles.emptyText}>
              {searchQuery ? `"${searchQuery}" için sonuç bulunamadı.` : "Bu kategoride işletme bulunamadı."}
            </CustomText>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredBusinesses.map((item) => (
              <CustomerBusinessCard
                key={item.id}
                item={item}
                isFavorite={favoriteIds.has(item.id)}
                onToggleFavorite={handleToggleFavorite}
                onPress={() => router.push({ pathname: "/customer/business-detail", params: { id: item.id } })}
                onBookPress={() => router.push({ pathname: "/customer/business-detail", params: { id: item.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </LayoutView>
  );
};

export default BusinessList;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingTop: 8,
  },
  tabsWrap: {
    paddingHorizontal: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 6,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.BrandPrimary,
    padding: 0,
  },
  countRow: {
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  countBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  countBadgeTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  list: {
    gap: 18,
    paddingHorizontal: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 240,
  },
});
