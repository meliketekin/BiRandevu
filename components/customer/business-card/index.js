import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";
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

const CustomerBusinessCard = ({ item, onPress, onBookPress, isFavorite = false, onToggleFavorite }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const scrollRef = useRef(null);

  const photos = item.photos?.length ? item.photos : (item.imageUri ? [item.imageUri] : []);
  const isOpen = getOpenStatus(item.workingHours);

  const handleMomentumEnd = useCallback((e) => {
    if (!imgWidth) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / imgWidth);
    setImgIndex(idx);
  }, [imgWidth]);

  const handleLayout = useCallback((e) => {
    setImgWidth(e.nativeEvent.layout.width);
  }, []);

  // Otomatik carousel — 5 saniyede bir
  useEffect(() => {
    if (photos.length <= 1 || !imgWidth) return;
    const timer = setInterval(() => {
      setImgIndex((prev) => {
        const next = (prev + 1) % photos.length;
        scrollRef.current?.scrollTo({ x: next * imgWidth, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length, imgWidth]);

  return (
    <View style={styles.card}>
      {/* ── Foto Carousel (tıklama navigasyona gitmiyor) ── */}
      <View style={styles.imageWrapper} onLayout={handleLayout}>
        {photos.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            scrollEventThrottle={16}
            style={styles.carousel}
          >
            {photos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={[styles.coverImage, imgWidth ? { width: imgWidth } : null]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ))}
          </ScrollView>
        ) : (
          <LinearGradient colors={["#2C2C3E", "#1A1A2E"]} style={[styles.coverImage, styles.coverImageFill]}>
            <Ionicons name="business-outline" size={40} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        )}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)"]}
          style={styles.imageGradient}
          pointerEvents="none"
        />

        {photos.length > 1 && (
          <View style={styles.dotsRow} pointerEvents="none">
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Puan — sol üst */}
        <View style={styles.ratingBadge} pointerEvents="none">
          <Ionicons name="star" size={13} color={Colors.BrandGold} />
          <CustomText semibold xs color={Colors.BrandPrimary} style={styles.ratingValue}>
            {item.rating}
          </CustomText>
          <CustomText min color={Colors.LightGray}>({item.reviewCount})</CustomText>
        </View>

        {/* Favori — sağ üst */}
        <Pressable
          onPress={() => onToggleFavorite?.(item)}
          style={({ pressed }) => [styles.heartBtn, pressed && { opacity: 0.7 }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#E05252" : Colors.BrandPrimary}
          />
        </Pressable>

        {/* Açık/Kapalı — sol alt */}
        {isOpen !== null && (
          <View style={[styles.statusChip, isOpen ? styles.statusOpen : styles.statusClosed]} pointerEvents="none">
            <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
            <CustomText xs semibold color={isOpen ? "#16A34A" : "#DC2626"}>
              {isOpen ? "Açık" : "Kapalı"}
            </CustomText>
          </View>
        )}
      </View>

      {/* ── İçerik (tıklayınca detaya git) ── */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed && styles.contentPressed]}
      >
        <CustomText bold lg color={Colors.BrandPrimary} numberOfLines={1}>
          {item.title}
        </CustomText>

        {!!item.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={Colors.LightGray} />
            <CustomText sm color={Colors.LightGray} numberOfLines={1} style={styles.locationText}>
              {item.location}
            </CustomText>
          </View>
        )}

        <View style={styles.footerRow}>
          {!!item.category && (
            <View style={styles.categoryChip}>
              <CustomText xs semibold color={Colors.BrandGold}>{item.category}</CustomText>
            </View>
          )}

          <Pressable
            onPress={() => onBookPress?.(item)}
            style={({ pressed }) => [styles.bookButton, pressed && { opacity: 0.82 }]}
          >
            <Ionicons name="calendar-outline" size={14} color={Colors.White} />
            <CustomText xs semibold color={Colors.White}>Randevu Al</CustomText>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  imageWrapper: {
    height: 185,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  carousel: {
    flex: 1,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverImageFill: {
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

  // Dots
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.White,
  },

  // Rating
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 3,
  },
  ratingValue: {
    marginRight: 1,
  },

  // Favori
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Açık/Kapalı
  statusChip: {
    position: "absolute",
    bottom: 24,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusOpen: {
    backgroundColor: "rgba(220,252,231,0.95)",
  },
  statusClosed: {
    backgroundColor: "rgba(254,226,226,0.95)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: "#16A34A",
  },
  dotClosed: {
    backgroundColor: "#DC2626",
  },

  // İçerik
  content: {
    padding: 16,
    gap: 6,
  },
  contentPressed: {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    flex: 1,
  },
  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(198,168,124,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.BrandPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 0,
  },
});

export default memo(CustomerBusinessCard);
