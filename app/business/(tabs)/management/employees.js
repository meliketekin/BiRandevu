import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";
import CustomImage from "@/components/high-level/custom-image";
import { Colors } from "@/constants/colors";


const EMPLOYEES = [
  {
    id: "1",
    name: "Julian Vance",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADwLEr8rYb-5pKfrwlRFdgXuaptiNdsYh3WFu6CyQWoWCkGx5mSHu_KmK43IBwnd56pCWEZVC1WfPiRnitqLPgv2xSgNfd75mh6uORubybpNFwZRUa5rJ_sziLIYjhl1V2xMKFS2XWLk2mEbX7yYnLxiI58BYtufjDw_w2mV-wZsgmstR7ptM9Cc7wg11TpWWf3qgY0kD0Y0Aq4ubOPcGfFqtChLrCq8gO6qx0nWiuMtSQD9dXC8J7ZeeovVIUaAqPsq7N4r3evmg",
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDad3jniGezsFAC7yDvGb4gxGSyhenzyGnDLGdmdhQQWnRWeYHKTDn3-fRNZ99ZQ0MgITZNtq7EoAfGWNigwo_N5CMj1ZOTh7U3-6ozalmjS6FFvbUvozCvkqbEmdntjCNkrKFzoGFwYkyNx3evQB5A28briHB5HfPVyDsaTlj5S7jelLCUA97sttUszAz-bjvDLuq1mDaRxnQEfuj2YBK_KAnzh8li27BzNEReOZSZWIyPVvzLH8oZmFgNUMgEQ-Crev3s8EZ8XD8",
  },
  {
    id: "3",
    name: "Marcus Thorne",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2DMo2PmW_wkOMe6oejK1zoAMYSqSZOBxB0mx0HAEUef8iT2nNeYiP1UIBfRJzNH6NqKT-skNyaEY0n47siS_lIyULtzFY9YDLw6ECGWc0gseRD-u-mGGqdgKdZTW1kvEZB187iCm6Jh7yJPNNq0F6dpSu7mOPs0OeSq4yDwu7UhN4zAAHTZMnL2j-ksJD_04YAMvIHjSbNj1eC59f1ZDrauHWXb-BXMqcO8C8esIIYjicc6qIq-WlcOqbm1Q-fcaCXpEz9R3VAKc",
  },
  {
    id: "4",
    name: "Sophia Lee",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhEIfD06lCgaJGXfVIZkTQe_Ah8WvrAKIYTpQ8KRGic7nkZnPKGh3e6YrafBWKx3x4Biw7H3REE9wcebczHHAm2C6P7mvIrRSiXU_8YuqFAKB0aNQSD7lx4809zn-MdnHTN5Pdz8b7K0EUJNgthLgkdtEcDHxgt7P144sI6IHZySzb6Yx1dcHRPAwtsZFTTgp45QN-ExjCrVbl0U4mTxiHir7-zZin32hxy2rEDNC_r-tpRF5aOzBcJCjlFec_L8IRgX8lYuQYrE4",
  },
  {
    id: "5",
    name: "David Brooks",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCf3xu5pzPE7eXmOo4WSDm_AKkjpBInbmnsKhdAPPjztggFxOfeDLVTZXul39pKvGbG4fPia8ANi2LDSlB6IW5tMrnB3WXLDY3oy4w_B-iyvyrdAPx6NOLD_FpyGHURlgoBC0RT04eyzamAzZsu8JARoQlky8wltK1n8GKNrnTt-guhnMEWiCVIUjaagOkBAYm0D6CuJ5Ky9W4G_NlUSfYPTuEGV2W2DOBoVI_8elo0oD5p_xPjyp1gOha22yaxHkAKpVu5mijN0qM",
  },
];

export default function Employees() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.BrandPrimary} />
        </Pressable>
        <CustomText extraBold fontSize={22} color={Colors.BrandPrimary} style={styles.headerTitle}>
          Ekibim
        </CustomText>
        <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <View style={styles.addButtonInner}>
            <Ionicons name="add" size={20} color={Colors.White} />
          </View>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 112 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Employee Cards */}
        <View style={styles.list}>
          {EMPLOYEES.map((emp) => (
            <Pressable key={emp.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <CustomImage uri={emp.image} style={styles.avatar} contentFit="cover" />
              <CustomText bold color={Colors.BrandPrimary} style={styles.employeeName}>
                {emp.name}
              </CustomText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BrandBackground,
  },
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    letterSpacing: -0.5,
  },
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
  addButtonInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  list: {
    gap: 8,
  },
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  employeeName: {
    letterSpacing: -0.2,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
