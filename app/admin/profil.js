import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function AdminProfil() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Pressable
        style={styles.link}
        onPress={() => router.push('/kullanim-kosullari')}
      >
        <Text style={styles.linkText}>Kullanım koşulları (ortak sayfa)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
  },
  link: {
    marginTop: 16,
    padding: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
