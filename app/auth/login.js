import { useCallback, useState } from "react";
import { View, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import CustomButton from "@/components/high-level/custom-button";
import CustomImage from "@/components/high-level/custom-image";
import { Colors } from "@/constants/colors";
import CustomInput from "@/components/high-level/custom-input";
import CustomSvg from "@/components/high-level/custom-svg";
import { SVGEnum } from "@/enums/svg-enum";
import Validator from "@/infrastructures/validation";

export default function Login() {
  const [state, setState] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validator] = useState(() => new Validator());
  const validatorScopeKey = validator.scopeKey;
  const updateState = useCallback((values) => setState((curr) => ({ ...curr, ...values })), []);
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    Keyboard.dismiss();
    if (!validator.allValid()) {
      updateState({});
      return;
    }
    // TODO: auth API
    router.replace("/customer");
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <LayoutView isActiveHeader={false} backgroundColor={Colors.BrandBackground}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <CustomImage uri={require("../../assets/logo.png")} isLocalFile style={styles.logo} contentFit="contain" />
            <View style={styles.header}>
              <CustomText color={Colors.BrandDark} style={styles.welcome} headerxxl bold>
                Hoş geldiniz
              </CustomText>
              <CustomText color={Colors.LightGray2} customMarginTop={8} md>
                Hesabınıza giriş yapın
              </CustomText>
            </View>

            <View style={styles.card}>
              <CustomInput
                placeholder="E-posta"
                value={state?.email}
                onChangeText={(text) => updateState({ email: text })}
                error={validator.registerDestructuring({
                  name: "email",
                  value: state?.email,
                  rules: [
                    { rule: "required", value: 1 },
                    { rule: "isEmail", value: 1 },
                  ],
                  validatorScopeKey,
                })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <CustomInput
                placeholder="Şifre"
                value={state?.password}
                onChangeText={(text) => updateState({ password: text })}
                error={validator.registerDestructuring({
                  name: "password",
                  value: state?.password,
                  rules: [
                    { rule: "required", value: 1 },
                    { rule: "minStringLength", value: 6 },
                  ],
                  validatorScopeKey,
                })}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                rightIcon={!state?.password ? SVGEnum.EyeOff : showPassword ? SVGEnum.EyeOff : SVGEnum.Eye}
                onRightIconPress={togglePasswordVisibility}
              />
              <CustomButton title="Giriş yap" onPress={handleLogin} backgroundColor={Colors.BrandPrimary} style={styles.loginButton} marginTop={24} fontColor={Colors.White} />

              <Pressable style={styles.forgotPress} onPress={() => {}} hitSlop={8}>
                <CustomText sm color={Colors.BrandPrimary}>
                  Şifremi unuttum
                </CustomText>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <CustomText md color={Colors.BrandDark}>
                Hesabınız yok mu?{" "}
              </CustomText>
              <Pressable onPress={() => router.push("/auth/register")} hitSlop={8}>
                <CustomText md semibold color={Colors.BrandPrimary}>
                  Kayıt ol
                </CustomText>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.White,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: -8,
    shadowColor: Colors.BrandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  passwordInput: {
    marginTop: 20,
  },
  loginButton: {
    borderRadius: 12,
  },
  forgotPress: {
    alignSelf: "center",
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    flexWrap: "wrap",
  },
});
