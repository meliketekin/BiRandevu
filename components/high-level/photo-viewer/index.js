import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Modal, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomImage from "@/components/high-level/custom-image";
import CustomText from "@/components/high-level/custom-text";
import { Colors } from "@/constants/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

/**
 * PhotoViewer
 *
 * @param {string[]} photos  - URI dizisi
 * @param {number}   initialIndex - Açılacak fotoğrafın indeksi
 * @param {() => void} onClose
 */
function PhotoViewer({ photos, initialIndex, onClose }) {
  const flatRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.root}>
        <FlatList
          ref={flatRef}
          data={photos}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <CustomImage uri={item} style={styles.image} contentFit="contain" />
            </View>
          )}
        />

        <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]} onPress={onClose}>
          <Ionicons name="close" size={22} color={Colors.White} />
        </Pressable>

        {photos.length > 1 && (
          <View style={styles.counter}>
            <CustomText bold fontSize={13} color={Colors.White}>
              {currentIndex + 1} / {photos.length}
            </CustomText>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  closeButton: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pressed: { opacity: 0.7 },
});

export default React.memo(PhotoViewer);
