import { debounce } from "lodash";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

const CustomTouchableOpacity = ({ children, onPress, style, onDisabled, activeOpacity, loading = false, debounceTime = 900, hitSlop, disabled, onPressIn, onPressOut, onLongPress }) => {
  const [isDisabled, setIsDisabled] = useState(!(onPress instanceof Function));

  const handlePress = debounce(
    () => {
      setIsDisabled(true);
      onPress?.();
      setTimeout(() => {
        setIsDisabled(false);
      }, debounceTime);
    },
    500,
    { leading: true, trailing: false },
  );

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={hitSlop}
      onPress={handlePress}
      disabled={isDisabled || onDisabled || loading || disabled}
      style={style}
      activeOpacity={activeOpacity}
      onLongPress={onLongPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default React.memo(CustomTouchableOpacity);
