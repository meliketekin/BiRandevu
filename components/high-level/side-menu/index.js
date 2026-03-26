import { View } from 'react-native';
import React from 'react';
import CustomText from '@/components/high-level/custom-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTouchableOpacity from '@/components/high-level/custom-touchable-opacity';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDrawerStore } from '@/stores/drawer-store';

const SideMenu = () => {
  const insets = useSafeAreaInsets();
  const closeDrawer = useDrawerStore((s) => s.closeDrawer);

  const CustomMenuText = ({ title, onPress }) => {
    return (
      <CustomTouchableOpacity style={{ marginTop: 20 }} onPress={onPress}>
        <CustomText fontSize={14} useWhite medium onPress={onPress}>
          {title}
        </CustomText>
      </CustomTouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top + 80,
        paddingLeft: 20,
      }}
    >
      <CustomMenuText
        title="Ana Sayfa"
        onPress={() => {
          closeDrawer();
          router.navigate('/customer/home');
        }}
      />
      <CustomMenuText
        title="Randevularım"
        onPress={() => {
          closeDrawer();
          router.navigate('/customer/appointments');
        }}
      />
      <CustomMenuText
        title="Favoriler"
        onPress={() => {
          closeDrawer();
          router.navigate('/customer/favorites');
        }}
      />
      <CustomMenuText
        title="Profil"
        onPress={() => {
          closeDrawer();
          router.navigate('/customer/profile');
        }}
      />
      <CustomMenuText
        title="Çıkış Yap"
        onPress={async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userInfo');
          closeDrawer();
          router.replace('/');
        }}
      />
    </View>
  );
};

export default SideMenu;
