import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt ol</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.buttonText}>Giriş yap</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.replace("/hasta")}>
        <Text style={styles.buttonText}>Hasta olarak kayıt</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.replace("/doktor")}
      >
        <Text style={styles.buttonText}>Doktor olarak kayıt</Text>
      </Pressable>
      <Pressable
        style={styles.buttonOutlined}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonOutlinedText}>Ana sayfa</Text>
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
    marginBottom: 16,
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
    marginTop: 8,
  },
  buttonOutlinedText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
