import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { openModal, ModalTypeEnum } from "../components/high-level/modal-renderer";

export default function Index() {
  const openExampleModal = () => {
    openModal(ModalTypeEnum.ConfirmModal, {
      title: "Modal örneği",
      message: "Bu onay kutusu modal renderer ile açıldı. Tamam veya İptal ile kapatabilirsin.",
      confirmText: "Tamam",
      cancelText: "İptal",
      onConfirm: () => console.log("Tamam seçildi"),
      onCancel: () => console.log("İptal seçildi"),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BiRandevu</Text>
      <Pressable style={styles.buttonOutlined} onPress={openExampleModal}>
        <Text style={styles.buttonOutlinedText}>Modal örneği aç</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.buttonText}>Giriş yap</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={styles.buttonText}>Kayıt ol</Text>
      </Pressable>
      <Text style={styles.divider}>veya hesap türüne göre devam et</Text>
      <Pressable
        style={styles.buttonOutlined}
        onPress={() => router.replace("/customer")}
      >
        <Text style={styles.buttonOutlinedText}>Customer olarak devam</Text>
      </Pressable>
      <Pressable
        style={styles.buttonOutlined}
        onPress={() => router.replace("/admin")}
      >
        <Text style={styles.buttonOutlinedText}>Admin olarak devam</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  divider: {
    marginTop: 16,
    marginBottom: 8,
    color: "#666",
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonOutlined: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  buttonOutlinedText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
