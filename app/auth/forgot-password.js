import { useCallback, useState } from "react";
import { View, Pressable, StyleSheet, Keyboard, TouchableWithoutFeedback, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import { Colors } from "@/constants/colors";
import Validator from "@/infrastructures/validation";
import { SupabaseConfig } from "@/config/app-config";

export default function ForgotPassword() {
  const [state, setState] = useState({ email: "", submitted: false, loading: false, success: false, error: "" });
  const [validator] = useState(() => new Validator());
  const validatorScopeKey = validator.scopeKey;
  const updateState = useCallback((values) => setState((curr) => ({ ...curr, ...values })), []);
  const insets = useSafeAreaInsets();

  const emailError = validator.registerDestructuring({
    name: "email",
    value: state.email,
    rules: [
      { rule: "required", value: 1 },
      { rule: "isEmail", value: 1 },
    ],
    validatorScopeKey,
  });

  const handleSend = async () => {
    Keyboard.dismiss();
    if (!validator.allValid()) {
      updateState({ submitted: true });
      return;
    }
    updateState({ loading: true, error: "" });
    try {
      const res = await fetch(SupabaseConfig.SEND_PASSWORD_RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email.trim().toLowerCase() }),
      });
      console.log(res);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      updateState({ success: true });
    } catch (error) {
      const message = error?.message ?? "Bir hata oluştu. Lütfen tekrar deneyin.";
      updateState({ error: message });
    } finally {
      updateState({ loading: false });
    }
  };

  return (
    <LayoutView isActiveHeader={false} backgroundColor={Colors.BrandBackground}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.BrandPrimary} />
        </Pressable>
        <CustomText semibold fontSize={18} color={Colors.BrandPrimary}>
          Şifremi Unuttum
        </CustomText>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {state.success ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="mail-outline" size={48} color={Colors.BrandPrimary} />
                </View>
                <CustomText bold fontSize={22} color={Colors.BrandPrimary} center style={styles.successTitle}>
                  E-posta Gönderildi
                </CustomText>
                <CustomText md color={Colors.LightGray2} center style={styles.successText}>
                  Şifre sıfırlama bağlantısı{" "}
                  <CustomText md bold color={Colors.BrandPrimary}>
                    {state.email}
                  </CustomText>{" "}
                  adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.
                </CustomText>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                  <CustomText bold fontSize={16} color={Colors.White}>
                    Giriş Sayfasına Dön
                  </CustomText>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.titleSection}>
                  <CustomText bold fontSize={28} color={Colors.BrandPrimary} center>
                    Şifrenizi Sıfırlayın
                  </CustomText>
                  <CustomText md color={Colors.LightGray2} center style={styles.subtitle}>
                    Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                  </CustomText>
                </View>

                <View style={styles.form}>
                  <View style={styles.fieldGroup}>
                    <CustomText style={styles.fieldLabel} color={Colors.LightGray}>
                      E-POSTA
                    </CustomText>
                    <View style={[styles.inputWrapper, state.submitted && emailError && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color={Colors.LightGray} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="isim@ornek.com"
                        placeholderTextColor={Colors.LightGray}
                        value={state.email}
                        onChangeText={(text) => updateState({ email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardAppearance="light"
                        autoFocus
                      />
                    </View>
                    {state.submitted && emailError ? (
                      <CustomText fontSize={12} color={Colors.ErrorColor} style={styles.errorText}>
                        {emailError}
                      </CustomText>
                    ) : null}
                  </View>

                  {state.error ? (
                    <CustomText fontSize={13} color={Colors.ErrorColor} center style={styles.errorText}>
                      {state.error}
                    </CustomText>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

      {!state.success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            style={[styles.sendButton, state.loading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={state.loading}
          >
            {state.loading ? (
              <ActivityIndicator color={Colors.White} />
            ) : (
              <CustomText bold fontSize={17} color={Colors.White}>
                Bağlantı Gönder
              </CustomText>
            )}
          </Pressable>
          <View style={styles.footerLink}>
            <CustomText md color={Colors.LightGray2}>
              Şifrenizi hatırladınız mı?{" "}
            </CustomText>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <CustomText md bold color={Colors.BrandPrimary}>
                Giriş Yap
              </CustomText>
            </Pressable>
          </View>
        </View>
      )}
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: Colors.BrandBackground,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 32,
    gap: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.White,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BorderColor,
    paddingHorizontal: 12,
    height: 56,
  },
  inputError: {
    borderColor: Colors.ErrorColor,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.BrandPrimary,
    height: "100%",
  },
  errorText: {
    marginLeft: 4,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.White,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.BrandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  successTitle: {
    marginBottom: 4,
  },
  successText: {
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  backButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.BrandPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    shadowColor: Colors.Gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
    alignSelf: "stretch",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors.BrandBackground,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  sendButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.BrandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.Gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  footerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    flexWrap: "wrap",
  },
});
