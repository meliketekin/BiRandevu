import { View, Text, StyleSheet } from 'react-native';

export default function AdminAnaSayfa() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin - Ana Sayfa</Text>
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
});
