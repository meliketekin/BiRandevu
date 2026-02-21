import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";

const SECTIONS = [
  {
    title: "1. Kabul ve Kapsam",
    body: "Bu Kullanım Koşulları (“Koşullar”), BuRandevu mobil uygulaması ve ilgili hizmetleri (“Hizmet”) kullanımınızı yönetir. Uygulamayı indirerek veya kullanmaya devam ederek bu koşulları kabul etmiş sayılırsınız.",
  },
  {
    title: "2. Hizmetin Tanımı",
    body: "BuRandevu, kullanıcıların berber, kuaför, nail art vb. işletmelerden randevu almasını sağlayan bir platformdur. Hizmet, işletmeler ve kullanıcılar arasında randevu oluşturma, yönetme ve iptal etme imkânı sunar.",
  },
  {
    title: "3. Hesap ve Kayıt",
    body: "Hizmetten yararlanmak için geçerli bilgilerle kayıt olmanız gerekir. Hesap bilgilerinizi güncel ve doğru tutmaktan siz sorumlusunuz. Hesabınızın güvenliğinden ve hesabınız üzerinden yapılan işlemlerden siz sorumlusunuz.",
  },
  {
    title: "4. Kullanıcı Yükümlülükleri",
    body: "Hizmeti yalnızca yasalara uygun ve bu Koşullar çerçevesinde kullanacaksınız. Aldığınız randevulara riayet etmek veya gerekirse zamanında iptal etmek, diğer kullanıcı ve işletmelere saygılı olmak ve platformu kötüye kullanmamak yükümlülükleriniz arasındadır.",
  },
  {
    title: "5. Randevu ve İptal",
    body: "Randevular, seçtiğiniz işletmenin müsaitliklerine göre oluşturulur. İptal politikası işletmeye göre değişiklik gösterebilir. Geç iptaller veya gelmeme durumunda işletme veya platform tarafından kısıtlamalar uygulanabilir.",
  },
  {
    title: "6. Gizlilik",
    body: "Kişisel verilerinizin işlenmesi Gizlilik Politikamızda açıklanmaktadır. Hizmeti kullanarak veri işleme uygulamalarımızı kabul etmiş sayılırsınız.",
  },
  {
    title: "7. Sorumluluk Sınırı",
    body: "Hizmet “olduğu gibi” sunulmaktadır. Platform, işletmelerin hizmet kalitesi veya randevu sonuçlarından doğrudan sorumlu tutulamaz. Yasalarca izin verilen ölçüde maksimum sorumluluk, doğrudan zararlarla sınırlı olabilir.",
  },
  {
    title: "8. Değişiklikler",
    body: "Bu Koşullar zaman zaman güncellenebilir. Önemli değişiklikler uygulama veya e-posta ile duyurulacaktır. Değişikliklerden sonra hizmeti kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.",
  },
  {
    title: "9. İletişim",
    body: "Kullanım Koşulları hakkında sorularınız için uygulama içi destek veya belirtilen iletişim kanallarından bize ulaşabilirsiniz.",
  },
];

/**
 * Ortak sayfa – hem admin hem customer bu sayfaya gidebilir.
 * Route: /kullanim-kosullari
 */
export default function KullanimKosullari() {
  const insets = useSafeAreaInsets();

  return (
    <LayoutView title="Kullanım Koşulları" showBackButton isActiveHeader backgroundColor={Colors.Background}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <CustomText color={Colors.LightGray} sm style={styles.lastUpdate}>
          Son güncelleme: Şubat 2025
        </CustomText>
        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <CustomText color={Colors.BrandDark} semibold fontSize={15} style={styles.sectionTitle}>
              {section.title}
            </CustomText>
            <CustomText color={Colors.TextColor} sm lineHeight={22} style={styles.sectionBody}>
              {section.body}
            </CustomText>
          </View>
        ))}
      </ScrollView>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  lastUpdate: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionBody: {
    paddingHorizontal: 2,
    opacity: 0.95,
  },
});
