import { Colors } from "../../../constants/colors";
import { router } from "expo-router";
import { memo, useMemo } from "react";
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../custom-button";
import CustomSvg from "../custom-svg";
import CustomText from "../custom-text";
import { SVGEnum } from "../../../enums/svg-enum";

const LayoutView = ({
  children,
  style,
  titleStyle,
  title,
  showBackButton,
  scrollableContent,
  isActiveHeader = true,
  onBackPress,
  leftButton,
  rightButton,
  contentContainerStyle,
  refreshControl,
  leftAction,
  paddingTop,
  paddingHorizontal,
  onKeyboardDismiss,
  onTouchableWithoutOnPress,
  backgroundColor,
  paddingVertical,
  paddingBottom,
  headerContainerStyle,
  showFormButton = false,
  formButtonName = "Ekle",
  formButtonPress = () => {},
}) => {
  const deviceInsets = useSafeAreaInsets();

  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: backgroundColor ?? Colors.Background,
      paddingTop: paddingTop ?? deviceInsets.top,
    }),
    [paddingTop, backgroundColor],
  );

  const headerStyle = useMemo(
    () => ({
      paddingHorizontal: 20,
      //   paddingHorizontal: _style.APP_HORIZONTAL_PADDING,
      paddingVertical: paddingVertical ?? 10,
      height: 56,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-center",
      ...headerContainerStyle,
    }),
    [paddingHorizontal, paddingVertical, headerContainerStyle],
  );

  const contentStyle = useMemo(
    () => ({
      paddingHorizontal: paddingHorizontal ?? 20,
      flex: 1,
      paddingBottom: paddingBottom ?? deviceInsets.bottom,
      ...style,
    }),
    [paddingHorizontal, paddingBottom],
  );

  const handleBackPress = () => {
    if (leftButton) return;
    onBackPress ? onBackPress() : router.back();
  };

  const handleTouchableWithoutOnPress = () => {
    Keyboard.dismiss();
    if (onTouchableWithoutOnPress instanceof Function) onTouchableWithoutOnPress();
  };

  return (
    <View style={containerStyle}>
      {isActiveHeader && (
        <View style={headerStyle}>
          <TouchableOpacity
            style={{ width: "15%", alignItems: "flex-start" }}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            onPress={handleBackPress}
            disabled={leftAction || showBackButton ? false : true}
          >
            <View style={styles.buttonStyle}>
              {leftButton
                ? leftButton
                : showBackButton && (
                    <View style={{ borderWidth: 1, borderRadius: 12, borderColor: Colors.BorderColor, width: 41, height: 41, justifyContent: "center", alignItems: "center" }}>
                      <CustomSvg svgEnum={SVGEnum.Back} size={14} />
                    </View>
                  )}
            </View>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <CustomText style={{ ...titleStyle }} center semibold>
              {title}
            </CustomText>
          </View>
          <View style={{ width: "15%", alignItems: "flex-end" }}>
            <View style={styles.buttonStyle}>{rightButton}</View>
          </View>
        </View>
      )}

      {scrollableContent ? (
        <KeyboardAwareScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <ScrollView style={contentStyle} showsVerticalScrollIndicator={false} contentContainerStyle={contentContainerStyle} refreshControl={refreshControl}>
            {children}
          </ScrollView>
        </KeyboardAwareScrollView>
      ) : (
        <TouchableWithoutFeedback disabled={!onKeyboardDismiss} onPress={handleTouchableWithoutOnPress} style={{ flex: 1 }}>
          <View style={contentStyle}>{children}</View>
        </TouchableWithoutFeedback>
      )}
      {showFormButton && <CustomButton title={formButtonName} style={{ marginHorizontal: 20, marginBottom: 25 }} onPress={formButtonPress} />}
    </View>
  );
};

export default memo(LayoutView);

const styles = StyleSheet.create({
  buttonStyle: {
    height: 40,
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 41,
    zIndex: 99999,
    width: "70%",
    justifyContent: "center",
  },
  bgLineContainer: {
    position: "absolute",
    top: 0,
    left: -100,
    zIndex: -1,
  },
  blur: {
    position: "absolute",
    left: 0,
    bottom: -180,
    zIndex: -1,
  },
  topLeftBlur: {
    position: "absolute",
    left: 0,
    top: -90,
    zIndex: -1,
  },
});
