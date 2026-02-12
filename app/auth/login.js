import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={styles.buttonText}>Kayıt ol</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.replace("/customer")}
      >
        <Text style={styles.buttonText}>Customer olarak giriş</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.replace("/admin")}>
        <Text style={styles.buttonText}>Admin olarak giriş</Text>
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
