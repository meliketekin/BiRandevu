import { Colors } from "@/constants/colors";
import general from "@/utils/general";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";
import { Easing } from "react-native-reanimated";
import CustomSvg from "../custom-svg";
import CustomText from "../custom-text";
import CustomTouchableOpacity from "../custom-touchable-opacity";

const FormInput = ({
  secureTextEntry = false,
  label = "",
  placeholder = "",
  duration = 300,
  value,
  onChangeText,
  error,
  style,
  keyboardType = "default",
  maxLength,
  disabled = false,
  rightContent,
  rightIcon,
  rightIconFill,
  onRightIconPress,
  inputStyle,
  onBlur = () => {},
  onFocus,
  required,
  height = 55,
  errorMessage,
  inputRef,
  errorTextStyle,
  multiline = false,
  backgroundColor,
  borderColor,
}) => {
  const transY = useRef(new Animated.Value(17));
  const labelValue = useRef(new Animated.Value(0));
  const fontSizeValue = useRef(new Animated.Value(16));

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (event) => {
      onFocus && onFocus(event);
      animateTransform(multiline ? 5 : 8);
      animateLabel(2);
      animateFontSize(12);
      setIsFocused(true);
    },
    [onFocus, multiline],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur();
    if (value) return;
    animateTransform(17);
    animateLabel(0);
    animateFontSize(16);
  }, [value]);

  const animateTransform = useCallback(
    (toValue) => {
      Animated.timing(transY.current, {
        toValue,
        duration,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    },
    [duration],
  );

  const animateLabel = useCallback(
    (toValue) => {
      Animated.timing(labelValue.current, {
        toValue,
        duration,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start();
    },
    [duration],
  );

  const animateFontSize = useCallback(
    (toValue) => {
      Animated.timing(fontSizeValue.current, {
        toValue,
        duration,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start();
    },
    [duration],
  );

  useEffect(() => {
    if (value) {
      animateTransform(8);
      animateLabel(2);
      animateFontSize(12);
    } else if (general.isNullOrEmpty(value) && !isFocused) {
      // animateTransform(17);
      animateLabel(0);
      animateFontSize(16);
    }
  }, [value]);

  const fontFamily = "Urbanist_400Regular";

  return (
    <Animated.View style={[styles.container, style, { borderColor: error ? Colors.ErrorColor : borderColor || Colors.InputBorderColor, backgroundColor: backgroundColor ?? Colors.InputBackground }]}>
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              transform: [{ translateY: transY.current }],
            },
          ]}
        >
          <Animated.Text style={[styles.label, { color: Colors.InputPlaceholderColor, fontSize: fontSizeValue.current, fontFamily }]}>{required ? `${label} *` : label}</Animated.Text>
        </Animated.View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: Colors.TextColor,
              height: multiline ? 95 : height,
              textAlignVertical: multiline ? "top" : "center",
              marginTop: multiline && 20,
              marginBottom: multiline ? 15 : 0,
              top: placeholder ? 0 : 7,
              paddingRight: rightIcon ? 35 : 15, // SVG için sağ padding
              ...inputStyle,
            },
          ]}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          onChangeText={onChangeText}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={Colors.PrimaryColor}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={Colors.InputPlaceholderColor}
          keyboardAppearance="light"
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            <CustomTouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
              <CustomSvg svgEnum={rightIcon} size={20} fill={rightIconFill || Colors.InputPlaceholderColor} />
            </CustomTouchableOpacity>
          </View>
        )}
        {rightContent}
      </View>
      {error && (
        <CustomText numberOfLines={1} color={Colors.ErrorColor} fontSize={12} style={{ position: "absolute", bottom: -15, ...errorTextStyle }}>
          {error}
        </CustomText>
      )}
      {errorMessage && (
        <CustomText numberOfLines={1} color={Colors.ErrorColor} fontSize={12} style={{ position: "absolute", bottom: -15 }}>
          {errorMessage}
        </CustomText>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: "100%",
    alignSelf: "center",
    minHeight: 56,
    borderWidth: 1,
    zIndex: -1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    paddingHorizontal: 15,
    textAlignVertical: "center",
    flex: 1,
  },
  rightIconContainer: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -10 }], // SVG'yi dikey olarak ortala
    zIndex: 1,
  },
  labelContainer: {
    position: "absolute",
  },
  label: {
    paddingLeft: 15,
  },
});

export default memo(FormInput);
