import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

/**
 * Ortak sayfa – hem admin hem customer bu sayfaya gidebilir.
 * app/(shared)/ altında; route: /kullanim-kosullari
 */
export default function KullanimKosullari() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </Pressable>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Kullanım Koşulları</Text>
        <Text style={styles.body}>
          Bu sayfa admin ve customer tarafından ortak kullanılır. app/(shared)/
          klasöründe olduğu için her iki kullanıcı türü de /kullanim-kosullari
          route'u ile buraya gelir.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
