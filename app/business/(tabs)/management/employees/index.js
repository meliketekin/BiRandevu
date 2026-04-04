import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/firebase";
import CustomText from "@/components/high-level/custom-text";
import CustomImage from "@/components/high-level/custom-image";
import ActivityLoading from "@/components/high-level/activity-loading";
import { Colors } from "@/constants/colors";

export default function Employees() {
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, "users", uid, "employees"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Employees snapshot error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /** Ekrana dönünce (stack’ten geri gelince) liste sunucu ile hizalansın */
  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      getDocs(query(collection(db, "users", uid, "employees"), orderBy("createdAt", "desc")))
        .then((snap) => {
          setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        })
        .catch((err) => console.error("Employees focus sync:", err));
    }, []),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.BrandPrimary} />
        </Pressable>
        <CustomText extraBold fontSize={22} color={Colors.BrandPrimary} style={styles.headerTitle}>
          Ekibim
        </CustomText>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={() => router.push("/business/management/employees/form")}
        >
          <Ionicons name="add" size={20} color={Colors.White} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityLoading style={styles.loader} />
        ) : employees.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people-outline" size={28} color={Colors.LightGray2} />
            </View>
            <CustomText bold fontSize={15} color={Colors.BrandPrimary}>Henüz çalışan yok</CustomText>
            <CustomText medium fontSize={13} color={Colors.LightGray2} style={styles.emptyDescription}>
              Sağ üstteki + butonuna basarak ilk çalışanını ekle.
            </CustomText>
          </View>
        ) : (
          <View style={styles.list}>
            {employees.map((emp) => (
              <Pressable
                key={emp.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: "/business/management/employees/[id]", params: { id: emp.id } })}
              >
                {emp.photoUrl ? (
                  <CustomImage uri={emp.photoUrl} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person-outline" size={18} color="#C0C0C0" />
                  </View>
                )}
                <View style={styles.employeeInfo}>
                  <CustomText bold color={Colors.BrandPrimary} style={styles.employeeName}>
                    {emp.name}
                  </CustomText>
                  {emp.services?.length > 0 && (
                    <CustomText medium fontSize={12} color={Colors.LightGray2} numberOfLines={1}>
                      {emp.services.map((s) => s.name).join(", ")}
                    </CustomText>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.LightGray2} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.BrandBackground },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.BrandBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(20,20,20,0.05)",
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { letterSpacing: -0.5 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BrandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.Gold,
    shadowColor: Colors.Gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },
  loader: { minHeight: 160 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,20,20,0.05)",
    marginBottom: 4,
  },
  emptyDescription: { textAlign: "center", lineHeight: 20, maxWidth: 240 },
  list: { gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.White,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(196,199,199,0.18)",
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  employeeInfo: { flex: 1, gap: 2 },
  employeeName: { letterSpacing: -0.2, fontSize: 15 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
});
