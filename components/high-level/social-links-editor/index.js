import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import CustomText from "@/components/high-level/custom-text";

function getPlatform(url) {
  if (!url) return { icon: "globe-outline", label: "Website" };
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return { icon: "logo-instagram", label: "Instagram" };
  if (lower.includes("facebook.com")) return { icon: "logo-facebook", label: "Facebook" };
  if (lower.includes("twitter.com") || lower.includes("x.com")) return { icon: "logo-twitter", label: "X / Twitter" };
  if (lower.includes("youtube.com")) return { icon: "logo-youtube", label: "YouTube" };
  if (lower.includes("tiktok.com")) return { icon: "logo-tiktok", label: "TikTok" };
  if (lower.includes("linkedin.com")) return { icon: "logo-linkedin", label: "LinkedIn" };
  return { icon: "globe-outline", label: "Website" };
}

function LinkCard({ url, onRemove }) {
  const { icon, label } = getPlatform(url);
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={20} color={Colors.BrandPrimary} />
      </View>
      <View style={styles.cardBody}>
        <CustomText bold fontSize={12} color={Colors.LightGray2}>
          {label}
        </CustomText>
        <CustomText fontSize={13} color={Colors.BrandPrimary} numberOfLines={1} style={styles.cardUrl}>
          {displayUrl}
        </CustomText>
      </View>
      <Pressable style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]} onPress={onRemove} hitSlop={8}>
        <Ionicons name="close" size={16} color={Colors.LightGray} />
      </Pressable>
    </View>
  );
}

export default function SocialLinksEditor({ links = [], onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    onChange([...links, withScheme]);
    setInputValue("");
  };

  const handleRemove = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.root}>
      <CustomText bold fontSize={10} color={Colors.LightGray2} letterSpacing={1.8} style={styles.label}>
        LİNKLER
      </CustomText>

      {links.length > 0 && (
        <View style={styles.cardList}>
          {links.map((url, i) => (
            <LinkCard key={i} url={url} onRemove={() => handleRemove(i)} />
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="https://instagram.com/isletmeniz"
          placeholderTextColor={Colors.InputPlaceholderColor}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed, !inputValue.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Ionicons name="add" size={20} color={inputValue.trim() ? Colors.White : Colors.LightGray} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  label: { paddingHorizontal: 2 },
  cardList: { gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.White,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.BrandBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 2 },
  cardUrl: { letterSpacing: -0.2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.BrandBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.White,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.InputBorderColor,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: Colors.TextColor,
    fontFamily: "Urbanist_400Regular",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.BrandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: Colors.BrandBackground,
  },
  pressed: { opacity: 0.75 },
});
