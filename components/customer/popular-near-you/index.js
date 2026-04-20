import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import SkeletonBox from "@/components/high-level/skeleton-box";
import { Colors } from "@/constants/colors";

function getOpenStatus(workingHours) {
  if (!workingHours) return null;
  const now = new Date();
  const entry = workingHours[String(now.getDay())];
  if (!entry?.enabled) return false;
  const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMins(entry.start) && cur < toMins(entry.end);
}

function PopularRowSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <SkeletonBox style={styles.skeletonTitle} />
        <SkeletonBox style={styles.skeletonMeta} />
        <SkeletonBox style={styles.skeletonSub} />
      </View>
    </View>
  );
}

const CustomerPopularNearYou = ({ businesses = [], loading = false, onItemPress }) => {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <CustomText bold lg color={Colors.BrandPrimary}>
          Yakınındaki Popülerler
        </CustomText>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => <PopularRowSkeleton key={i} />)}
        </View>
      ) : businesses.length === 0 ? (
        <CustomText fontSize={13} color={Colors.LightGray} style={styles.emptyText}>
          Henüz kayıtlı işletme yok.
        </CustomText>
      ) : (
        <View style={styles.list}>
          {businesses.map((item) => {
            const imageUri = item.venuePhotos?.[0] ?? item.servicePhotos?.[0] ?? null;
            const isOpen = getOpenStatus(item.workingHours);

            return (
              <CustomTouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => onItemPress?.(item.id)}
              >
                {/* Fotoğraf */}
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={[styles.image, styles.imageFallback]}>
                    <Ionicons name="business-outline" size={26} color="#C8C8C8" />
                  </View>
                )}

                {/* İçerik */}
                <View style={styles.content}>
                  {/* İsim + chevron */}
                  <View style={styles.nameRow}>
                    <CustomText bold fontSize={15} color={Colors.BrandPrimary} numberOfLines={1} style={styles.name}>
                      {item.businessName || "İşletme"}
                    </CustomText>
                    <Ionicons name="chevron-forward" size={15} color="#C8C8C8" />
                  </View>

                  {/* Kategori + durum */}
                  <View style={styles.badgeRow}>
                    {!!item.category && (
                      <View style={styles.categoryPill}>
                        <CustomText xs color={Colors.BrandGold} semibold>{item.category}</CustomText>
                      </View>
                    )}
                    {isOpen !== null && (
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, !isOpen && styles.statusDotClosed]} />
                        <CustomText xs semibold color={isOpen ? "#16A34A" : "#DC2626"}>
                          {isOpen ? "Açık" : "Kapalı"}
                        </CustomText>
                      </View>
                    )}
                  </View>

                  {/* Adres */}
                  {!!item.address && (
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={12} color={Colors.LightGray} />
                      <CustomText xs color={Colors.LightGray} numberOfLines={1} style={styles.addressText}>
                        {item.address}
                      </CustomText>
                    </View>
                  )}
                </View>
              </CustomTouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  headerRow: {
    marginBottom: 14,
  },
  emptyText: {
    marginTop: 4,
  },
  list: {
    gap: 10,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
  },
  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  name: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryPill: {
    backgroundColor: "rgba(198,168,124,0.12)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  statusDotClosed: {
    backgroundColor: "#EF4444",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  addressText: {
    flex: 1,
  },

  // Skeleton
  skeletonImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    flexShrink: 0,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitle: {
    height: 15,
    borderRadius: 6,
    width: "60%",
  },
  skeletonMeta: {
    height: 12,
    borderRadius: 6,
    width: "40%",
  },
  skeletonSub: {
    height: 11,
    borderRadius: 6,
    width: "75%",
  },
});

export default memo(CustomerPopularNearYou);
