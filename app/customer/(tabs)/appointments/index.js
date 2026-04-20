import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/firebase";
import useAuthStore from "@/store/auth-store";
import LayoutView from "@/components/high-level/layout-view";
import CustomText from "@/components/high-level/custom-text";
import CustomTouchableOpacity from "@/components/high-level/custom-touchable-opacity";
import CommandBus from "@/infrastructures/command-bus/command-bus";
import CustomModal from "@/components/high-level/custom-modal";
import moment from "moment";
import "moment/locale/tr";
import { APPOINTMENT_STATUS_CONFIG, AppointmentStatusEnum } from "@/enums/appointment-status-enum";

const CANCEL_DEADLINE_MINUTES = 60;

// Randevu zamanına kaç dakika kaldığını hesaplar
const minutesUntilAppointment = (date, time) => {
  const [h, m] = time.split(":").map(Number);
  const apt = new Date(date);
  apt.setHours(h, m, 0, 0);
  return (apt.getTime() - Date.now()) / 60000;
};

const canCancel = (apt) =>
  apt.status === AppointmentStatusEnum.Pending &&
  minutesUntilAppointment(apt.date, apt.time) > CANCEL_DEADLINE_MINUTES;

moment.locale("tr");

// Takvim için Türkçe locale ayarı
LocaleConfig.locales.tr = {
  monthNames: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  monthNamesShort: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
  dayNames: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  dayNamesShort: ["Pa", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"],
  today: "Bugün",
};
LocaleConfig.defaultLocale = "tr";


const PALETTE = {
  primary: "#141414",
  primaryGold: "#D4AF37",
  backgroundLight: "#f7f7f7",
  backgroundDark: "#191919",
  white: "#FFFFFF",
  mutedText: "#7B7B7B",
  softBorder: "rgba(20,20,20,0.08)",
  softGold: "rgba(212,175,55,0.14)",
  darkGold: "#8B6B16",
};

export default function CustomerRandevular() {
  const insets = useSafeAreaInsets();
  const { date: initialDate } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(initialDate ?? null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const calendarRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const today = useMemo(() => new Date(), []);

  const formattedToday = today.toISOString().slice(0, 10);
  const currentSelected = selectedDate || formattedToday;

  useEffect(() => {
    const customerId = user?.uid ?? auth.currentUser?.uid;
    if (!customerId) { setLoading(false); return; }

    const q = query(
      collection(db, "appointments"),
      where("customerId", "==", customerId)
    );
    getDocs(q)
      .then((snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => {
          const keyA = `${a.date} ${a.time}`;
          const keyB = `${b.date} ${b.time}`;
          return keyA.localeCompare(keyB);
        });
        setAppointments(items);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Tarihe göre grupla: { "YYYY-MM-DD": [...] }
  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((acc, apt) => {
      const key = apt.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(apt);
      return acc;
    }, {});
  }, [appointments]);

  const dayAppointments = appointmentsByDate[currentSelected] || [];
  const selectedDateText = moment(currentSelected).format("D MMMM YYYY");

  const handleCancel = async (apt) => {
    const customerId = user?.uid ?? auth.currentUser?.uid;
    if (!customerId || !canCancel(apt)) return;

    setCancelling(true);
    try {
      await updateDoc(doc(db, "appointments", apt.id), { status: AppointmentStatusEnum.Cancelled });

      setAppointments((prev) =>
        prev.map((a) => a.id === apt.id ? { ...a, status: AppointmentStatusEnum.Cancelled } : a)
      );
      setSelectedAppointment((prev) => prev?.id === apt.id ? { ...prev, status: AppointmentStatusEnum.Cancelled } : prev);

      CommandBus.sc.alertSuccess("Randevu İptal Edildi", "Randevunuz başarıyla iptal edildi.");
    } catch (e) {
      console.error("İptal edilemedi:", e);
      CommandBus.sc.alertError("Hata", "Randevu iptal edilemedi. Lütfen tekrar deneyin.");
    } finally {
      setCancelling(false);
    }
  };

  const renderArrow = (direction) => (
    <View style={styles.calendarArrow}>
      <Ionicons name={direction === "left" ? "chevron-back" : "chevron-forward"} size={16} color={PALETTE.primary} />
    </View>
  );

  const renderDayItem = ({ date, state }) => {
    const isToday = date.dateString === formattedToday;
    const isSelected = date.dateString === currentSelected;
    const hasAppointment = !!appointmentsByDate[date.dateString];
    const isDisabled = state === "disabled";

    return (
      <CustomTouchableOpacity
        onPress={() => setSelectedDate(date.dateString)}
        style={[styles.dayWrapper, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday, isDisabled && styles.dayDisabled]}
      >
        <CustomText style={styles.dayText} semibold color={isSelected ? PALETTE.white : isDisabled ? "#C7C7C7" : PALETTE.primary}>
          {date.day}
        </CustomText>
        {hasAppointment && <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />}
      </CustomTouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LayoutView title="Randevularım" backgroundColor={PALETTE.backgroundLight} titleStyle={{ color: PALETTE.primary }}>
        <ActivityIndicator size="large" color={PALETTE.primaryGold} style={{ marginTop: 80 }} />
      </LayoutView>
    );
  }

  return (
    <LayoutView title="Randevularım" backgroundColor={PALETTE.backgroundLight} titleStyle={{ color: PALETTE.primary }}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 36 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          <View style={styles.calendarCard}>
            <RNCalendar
              firstDay={1}
              current={currentSelected}
              renderHeader={(date) => {
                const label = moment(date?.toString?.() || today).format("MMMM YYYY");
                return (
                  <View style={styles.calendarHeaderStrip}>
                    <CustomText semibold style={{ fontSize: 15, color: PALETTE.primary }}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </CustomText>
                  </View>
                );
              }}
              renderArrow={renderArrow}
              dayComponent={renderDayItem}
              hideExtraDays
              enableSwipeMonths
              theme={{
                calendarBackground: "transparent",
                textSectionTitleColor: PALETTE.mutedText,
                dayTextColor: PALETTE.primary,
                textDayHeaderFontSize: 10,
                textDayHeaderFontWeight: "700",
              }}
              headerStyle={styles.calendarHeader}
              style={styles.calendar}
            />
          </View>

          <View style={styles.agendaCard}>
            <View style={styles.agendaHeader}>
              <View>
                <CustomText color={PALETTE.primary} semibold style={styles.sectionTitle}>
                  Günlük Randevular
                </CustomText>
                <CustomText xs color={PALETTE.mutedText} style={styles.sectionDescription}>
                  {selectedDateText}
                </CustomText>
              </View>

              <View style={styles.countBadge}>
                <CustomText xs semibold color={dayAppointments.length ? PALETTE.primaryGold : PALETTE.mutedText}>
                  {dayAppointments.length} kayıt
                </CustomText>
              </View>
            </View>

            {dayAppointments.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="calendar-clear-outline" size={24} color={PALETTE.primaryGold} />
                </View>
                <CustomText sm color={PALETTE.primary} semibold style={styles.emptyTitle}>
                  Bu gün için plan bulunmuyor
                </CustomText>
                <CustomText xs color={PALETTE.mutedText} center style={styles.emptyDescription}>
                  Farklı bir tarih seçerek planlanmış rezervasyonlarını inceleyebilirsin.
                </CustomText>
              </View>
            ) : (
              dayAppointments.map((item) => {
                const statusCfg = APPOINTMENT_STATUS_CONFIG[item.status] ?? APPOINTMENT_STATUS_CONFIG[AppointmentStatusEnum.Pending];
                const serviceName = item.serviceNames?.join(" & ") ?? "Randevu";
                const expertName = [...new Set(Object.values(item.employeeNames ?? {}))].join(", ");
                const [timeH, timeM] = (item.time ?? "--:--").split(":");
                const weekdayStr = moment(item.date).format("ddd");

                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [styles.appointmentItem, pressed && styles.appointmentItemPressed]}
                    onPress={() => setSelectedAppointment(item)}
                  >
                    {/* Sol: saat bloğu */}
                    <View style={styles.timeBlock}>
                      <CustomText extraBold fontSize={22} color={PALETTE.primary} style={styles.timeHour}>
                        {timeH}
                      </CustomText>
                      <CustomText bold fontSize={13} color={PALETTE.primaryGold}>:{timeM}</CustomText>
                      <CustomText xs color={PALETTE.mutedText} style={styles.timeWeekday}>{weekdayStr}</CustomText>
                    </View>

                    {/* Dikey ayraç */}
                    <View style={[styles.verticalDivider, { backgroundColor: `${statusCfg.color}50` }]} />

                    {/* Sağ: içerik */}
                    <View style={styles.aptContent}>
                      {/* Durum + fiyat */}
                      <View style={styles.aptTopRow}>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}18` }]}>
                          <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                          <CustomText xs semibold color={statusCfg.color}>{statusCfg.label}</CustomText>
                        </View>
                        {item.totalPrice != null && (
                          <CustomText xs bold color={PALETTE.darkGold}>
                            ₺{Number(item.totalPrice).toLocaleString("tr-TR")}
                          </CustomText>
                        )}
                      </View>

                      {/* Hizmet adı */}
                      <CustomText bold color={PALETTE.primary} numberOfLines={1} style={styles.aptServiceName}>
                        {serviceName}
                      </CustomText>

                      {/* Meta: uzman + süre */}
                      <View style={styles.aptMetaRow}>
                        {!!expertName && (
                          <View style={styles.aptMetaItem}>
                            <Ionicons name="person-outline" size={11} color={PALETTE.mutedText} />
                            <CustomText xs color={PALETTE.mutedText} numberOfLines={1}>{expertName}</CustomText>
                          </View>
                        )}
                        {!!item.totalDuration && (
                          <>
                            {!!expertName && <View style={styles.metaDot} />}
                            <View style={styles.aptMetaItem}>
                              <Ionicons name="time-outline" size={11} color={PALETTE.mutedText} />
                              <CustomText xs color={PALETTE.mutedText}>{item.totalDuration} dk</CustomText>
                            </View>
                          </>
                        )}
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={15} color="#D1D5DB" style={styles.chevron} />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Randevu Detay Modal */}
      <CustomModal
        visible={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Randevu Detayı"
      >
        {selectedAppointment && (() => {
          const apt = selectedAppointment;
          const statusCfg = APPOINTMENT_STATUS_CONFIG[apt.status] ?? APPOINTMENT_STATUS_CONFIG[AppointmentStatusEnum.Pending];
          const cancelable = canCancel(apt);
          const minsLeft = minutesUntilAppointment(apt.date, apt.time);
          const isPast = minsLeft <= 0;
          const dateLabel = moment(apt.date).format("D MMMM YYYY, dddd");

          return (
            <View style={styles.modalContent}>
              {/* Detay Kartı */}
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>DURUM</CustomText>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + "22" }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                    <CustomText xs semibold color={statusCfg.color}>{statusCfg.label}</CustomText>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>HİZMET</CustomText>
                  <CustomText sm semibold color={PALETTE.primary} style={styles.detailValueRight}>
                    {apt.serviceNames?.join(" & ") ?? "—"}
                  </CustomText>
                </View>

                <View style={styles.detailRow}>
                  <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>TARİH</CustomText>
                  <CustomText sm semibold color={PALETTE.primary} style={styles.detailValueRight}>{dateLabel}</CustomText>
                </View>

                <View style={styles.detailRow}>
                  <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>SAAT</CustomText>
                  <CustomText sm semibold color={PALETTE.primary}>{apt.time}</CustomText>
                </View>

                {apt.employeeNames && Object.keys(apt.employeeNames).length > 0 && (
                  <View style={styles.detailRow}>
                    <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>ÇALIŞAN</CustomText>
                    <CustomText sm semibold color={PALETTE.primary} style={styles.detailValueRight}>
                      {[...new Set(Object.values(apt.employeeNames))].join(", ")}
                    </CustomText>
                  </View>
                )}

                {!!apt.totalDuration && (
                  <View style={styles.detailRow}>
                    <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>TAHMİNİ SÜRE</CustomText>
                    <CustomText sm semibold color={PALETTE.primary}>{apt.totalDuration} dk</CustomText>
                  </View>
                )}

                {apt.totalPrice != null ? (
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <CustomText min bold color={PALETTE.mutedText} style={styles.detailLabel}>TOPLAM</CustomText>
                    <CustomText sm bold color={PALETTE.primaryGold}>
                      ₺{Number(apt.totalPrice).toLocaleString("tr-TR")}
                    </CustomText>
                  </View>
                ) : (
                  <View style={styles.detailRowLastSpacer} />
                )}
              </View>

              {/* Bilgi alanı */}
              {apt.status === AppointmentStatusEnum.Pending && !isPast && (
                <View style={[styles.infoBanner, cancelable ? styles.infoBannerWarning : styles.infoBannerError]}>
                  <Ionicons
                    name={cancelable ? "information-circle-outline" : "lock-closed-outline"}
                    size={16}
                    color={cancelable ? "#D4AF37" : "#EF4444"}
                  />
                  <CustomText xs color={cancelable ? "#8B6B16" : "#9B1C1C"} style={{ flex: 1, lineHeight: 18 }}>
                    {cancelable
                      ? "Randevunuzu saatinden en az 1 saat önce iptal edebilirsiniz."
                      : "Randevuya 1 saatten az kaldığı için iptal süresi dolmuştur."}
                  </CustomText>
                </View>
              )}

              {/* İptal Butonu */}
              {cancelable && (
                <Pressable
                  style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.8 }, cancelling && { opacity: 0.6 }]}
                  onPress={() => handleCancel(apt)}
                  disabled={cancelling}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  <CustomText bold sm color="#EF4444">
                    {cancelling ? "İptal ediliyor..." : "Randevuyu İptal Et"}
                  </CustomText>
                </Pressable>
              )}
            </View>
          );
        })()}
      </CustomModal>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 14,
  },
  container: {
    flex: 1,
    gap: 18,
    paddingBottom: 82,
  },
  calendarCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
  },
  calendarHeaderStrip: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionDescription: {
    marginTop: 2,
    lineHeight: 17,
  },
  calendar: {
    backgroundColor: "transparent",
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  calendarHeader: {
    marginBottom: 0,
  },
  calendarArrow: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,175,55,0.15)",
  },
  dayWrapper: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 14,
  },
  dayDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PALETTE.primaryGold,
  },
  dayDotSelected: {
    backgroundColor: PALETTE.white,
  },
  daySelected: {
    backgroundColor: PALETTE.primary,
  },
  dayToday: {
    backgroundColor: PALETTE.softGold,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
  },
  dayDisabled: {
    opacity: 0.35,
  },
  agendaCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
  },
  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PALETTE.backgroundLight,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PALETTE.softGold,
    marginBottom: 14,
  },
  emptyTitle: {
    marginBottom: 6,
  },
  emptyDescription: {
    lineHeight: 18,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: PALETTE.softBorder,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentItemPressed: {
    opacity: 0.88,
    borderColor: "rgba(212,175,55,0.3)",
  },
  timeBlock: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(212,175,55,0.07)",
    gap: 1,
    alignSelf: "stretch",
  },
  timeHour: {
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  timeWeekday: {
    marginTop: 5,
    fontSize: 10,
    textTransform: "capitalize",
  },
  verticalDivider: {
    width: 2,
    alignSelf: "stretch",
  },
  aptContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 5,
  },
  aptTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aptServiceName: {
    fontSize: 15,
    lineHeight: 20,
  },
  aptMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  aptMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: PALETTE.mutedText,
    opacity: 0.4,
  },
  chevron: {
    marginRight: 12,
  },

  /* Modal */
  modalContent: {
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  detailCard: {
    backgroundColor: PALETTE.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20,20,20,0.06)",
    gap: 12,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 14,
  },
  detailRowLastSpacer: {
    height: 6,
  },
  detailLabel: {
    letterSpacing: 1.3,
    flexShrink: 0,
  },
  detailValueRight: {
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  infoBannerWarning: {
    backgroundColor: "rgba(212,175,55,0.10)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  infoBannerError: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    paddingVertical: 15,
    backgroundColor: "rgba(239,68,68,0.05)",
  },
});
