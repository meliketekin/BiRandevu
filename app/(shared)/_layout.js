import { Slot } from 'expo-router';

/**
 * Ortak sayfalar layout'u. (shared) route group olduğu için
 * URL'de "shared" görünmez, sadece dosya organizasyonu için.
 */
export default function SharedLayout() {
  return <Slot />;
}
