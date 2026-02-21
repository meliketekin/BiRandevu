import { Colors } from "@/constants/colors";
import { ActivityIndicator, View } from "react-native";

const ActivityLoading = ({ size = "small", style, color }) => {
  const indicatorColor = color || Colors.BrandPrimary;

  return (
    <View style={[{ flex: 0.85, justifyContent: "center", alignItems: "center" }, style]}>
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
};

export default ActivityLoading;
