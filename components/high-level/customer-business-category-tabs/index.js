import React, { memo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import { Colors } from "@/constants/colors";

const CustomerBusinessCategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;

          return (
            <CustomTouchableOpacity
              key={category.id}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              activeOpacity={0.9}
              onPress={() => onSelectCategory?.(category.id)}
            >
              <CustomText semibold sm color={isSelected ? Colors.White : Colors.BrandPrimary}>
                {category.label}
              </CustomText>
            </CustomTouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    marginBottom: 18,
  },
  contentContainer: {
    gap: 10,
    paddingRight: 20,
  },
  tabButton: {
    minHeight: 38,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  tabButtonActive: {
    backgroundColor: Colors.BrandPrimary,
  },
});

export default memo(CustomerBusinessCategoryTabs);
