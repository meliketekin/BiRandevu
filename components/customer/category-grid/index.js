import React, { memo, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import { Colors } from "@/constants/colors";
import { BusinessCategoryEnum, BUSINESS_CATEGORIES } from "@/enums/business-category-enum";

const CATEGORY_META = {
  [BusinessCategoryEnum.Barber]: {
    icon: "cut-outline",
    label: "Berber",
    imageUri: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
  },
  [BusinessCategoryEnum.Hairdresser]: {
    icon: "woman-outline",
    label: "Kuaför",
    imageUri: "https://images.unsplash.com/photo-1560066984-138daaa0382b?w=600&q=80",
  },
  [BusinessCategoryEnum.BeautySalon]: {
    icon: "sparkles-outline",
    label: "Güzellik",
    imageUri: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
  },
  [BusinessCategoryEnum.NailSalon]: {
    icon: "hand-left-outline",
    label: "Tırnak",
    imageUri: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
  },
  [BusinessCategoryEnum.SpaMassage]: {
    icon: "flower-outline",
    label: "Spa & Masaj",
    imageUri: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
  },
  [BusinessCategoryEnum.TattooPiercing]: {
    icon: "color-filter-outline",
    label: "Dövme",
    imageUri: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=600&q=80",
  },
};

const PREFETCH_URIS = Object.values(CATEGORY_META).map((m) => m.imageUri);

const CustomerCategoryGrid = ({ onCategoryPress, onViewAllPress, categoryCounts = {} }) => {
  useEffect(() => {
    Image.prefetch(PREFETCH_URIS);
  }, []);

  return (
    <View style={styles.section}>
      {/* Başlık */}
      <View style={styles.headerRow}>
        <CustomText style={styles.headerTitle}>Kategoriler</CustomText>
        <CustomTouchableOpacity activeOpacity={0.75} onPress={onViewAllPress}>
          <View style={styles.viewAllBtn}>
            <CustomText style={styles.viewAllText}>Tümünü gör</CustomText>
            <Ionicons name="arrow-forward" size={12} color="#D4AF37" />
          </View>
        </CustomTouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {BUSINESS_CATEGORIES.map((categoryId) => {
          const meta = CATEGORY_META[categoryId] ?? {};
          const count = categoryCounts[categoryId] ?? 0;

          return (
            <Pressable
              key={categoryId}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onCategoryPress?.(categoryId)}
            >
              {/* Arka plan fotoğrafı */}
              {meta.imageUri ? (
                <Image
                  source={{ uri: meta.imageUri }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.imageFallback]} />
              )}

              {/* Gradient overlay */}
              <LinearGradient
                colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.62)"]}
                style={StyleSheet.absoluteFillObject}
              />

              {/* İkon — sağ üst */}
              <View style={styles.iconBadge}>
                <Ionicons name={meta.icon ?? "ellipse-outline"} size={15} color="rgba(255,255,255,0.9)" />
              </View>

              {/* Alt içerik */}
              <View style={styles.cardBottom}>
                <CustomText style={styles.cardLabel} numberOfLines={1}>
                  {meta.label ?? categoryId}
                </CustomText>
                {count > 0 && (
                  <CustomText style={styles.cardCount}>{count} mekan</CustomText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default memo(CustomerCategoryGrid);

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.BrandPrimary,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D4AF37",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48.5%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.977 }],
  },
  imageFallback: {
    backgroundColor: "#2a2a2a",
  },

  iconBadge: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBottom: {
    gap: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  cardCount: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
  },
});
