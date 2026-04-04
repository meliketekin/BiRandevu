import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "@/components/high-level/custom-text";
import { Colors } from "@/constants/colors";

/**
 * DateTimePicker — aşağıdan kayan bottom sheet içinde tarih/saat seçici.
 *
 * @param {boolean}  visible
 * @param {"date"|"time"|"datetime"} mode
 * @param {Date}     value
 * @param {string}   [title]
 * @param {(date: Date) => void} onConfirm
 * @param {() => void} onClose
 */
export default function DateTimePicker({ visible, mode = "time", value, title, onConfirm, onClose }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(400)).current;
  const safeInitial = value instanceof Date && !isNaN(value) ? value : new Date();
  const [current, setCurrent] = useState(safeInitial);

  useEffect(() => {
    if (visible) setCurrent(value instanceof Date && !isNaN(value) ? value : new Date());
    Animated.spring(translateY, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12, transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}>
            <CustomText bold fontSize={15} color={Colors.LightGray2}>İptal</CustomText>
          </Pressable>

          {!!title && (
            <CustomText bold fontSize={15} color={Colors.BrandPrimary}>{title}</CustomText>
          )}

          <Pressable
            onPress={() => onConfirm(current)}
            hitSlop={12}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          >
            <CustomText bold fontSize={15} color={Colors.BrandPrimary}>Tamam</CustomText>
          </Pressable>
        </View>

        <DatePicker
          date={current}
          mode={mode}
          locale="tr"
          onDateChange={setCurrent}
          style={styles.picker}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.White,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingTop: 8,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerBtn: { minWidth: 52 },
  picker: {},
  pressed: { opacity: 0.6 },
});
