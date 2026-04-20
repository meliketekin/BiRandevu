import { useState, useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal, useWindowDimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, auth } from "@/firebase";
import useAuthStore from "@/store/auth-store";
import LayoutView from "@/components/high-level/layout-view";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/high-level/custom-text";
import CustomImage from "@/components/high-level/custom-image";
import CustomModal from "@/components/high-level/custom-modal";
import { Colors } from "@/constants/colors";
import { APPOINTMENT_STATUS_CONFIG, AppointmentStatusEnum } from "@/enums/appointment-status-enum";
import CommandBus from "@/infrastructures/command-bus/command-bus";
import general from "@/utils/general";

const TERTIARY = "#735C00";
const TERTIARY_CONTAINER = "#CCA830";
const SURFACE_HIGH = "#E8E8E8";
const ERROR_CONTAINER = "#FFDAD6";
const ON_ERROR_CONTAINER = "#93000A";

const PALETTE = {
  bg: "#F7F7F7",
  surface: "#FFFFFF",
  muted: "#7B7B7B",
  border: "rgba(20,20,20,0.08)",
  softFill: "rgba(20,20,20,0.04)",
  gold: Colors.Gold,
  goldSoft: "rgba(212,175,55,0.14)",
};

const DATE_FILTER_OPTIONS = ["Bugün", "Yarın", "Bu hafta"];

function getDateStrings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString("sv");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("sv");
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toLocaleDateString("sv");
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("sv");
  return { todayStr, tomorrowStr, weekEndStr, yesterdayStr };
}

function formatCompletedDay(dateStr) {
  if (!dateStr) return null;
  const { yesterdayStr } = getDateStrings();
  if (dateStr === yesterdayStr) return "Dün";
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays > 0 && diffDays < 30) return `${diffDays} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function filterByEmployeeUid(list, employeeUid) {
  if (!employeeUid) return list;
  return list.filter((item) => Object.values(item.employeeIds ?? {}).includes(employeeUid));
}

function filterUpcomingByDate(list, dateFilter) {
  const { todayStr, tomorrowStr, weekEndStr } = getDateStrings();
  if (dateFilter === "Bugün") return list.filter((a) => a.date === todayStr);
  if (dateFilter === "Yarın") return list.filter((a) => a.date === tomorrowStr);
  if (dateFilter === "Bu hafta") return list.filter((a) => a.date >= todayStr && a.date <= weekEndStr);
  return list;
}

function appointmentStatusCfg(status) {
  return APPOINTMENT_STATUS_CONFIG[status] ?? APPOINTMENT_STATUS_CONFIG[AppointmentStatusEnum.Pending];
}

export default function Appointments() {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();

  const isAdmin = useAuthStore((s) => s.isAdmin);
  const userType = useAuthStore((s) => s.userType);
  const storedBusinessId = useAuthStore((s) => s.businessId);
  const isEmployee = userType === "business" && !isAdmin;
  const currentUid = auth.currentUser?.uid;
  const bizId = isEmployee ? storedBusinessId : currentUid;

  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [periodTab, setPeriodTab] = useState("upcoming");
  const [dateFilter, setDateFilter] = useState("Bugün");
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [sortLabel, setSortLabel] = useState("En yakın saat");
  const [pickerKind, setPickerKind] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const closeSheet = useCallback(() => setSelected(null), []);
  const closePicker = useCallback(() => setPickerKind(null), []);

  const handleAppointmentAction = useCallback(async (newStatus) => {
    if (!selected) return;
    setActionLoading(newStatus);
    try {
      await updateDoc(doc(db, "appointments", selected.id), { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => a.id === selected.id ? { ...a, status: newStatus } : a)
      );
      setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
      const cfg = APPOINTMENT_STATUS_CONFIG[newStatus];
      CommandBus.sc.alertSuccess("Güncellendi", `Randevu durumu "${cfg?.label}" olarak işaretlendi.`, 2600);
      closeSheet();
    } catch (e) {
      console.error("Randevu güncellenemedi:", e);
      CommandBus.sc.alertError("Hata", "İşlem tamamlanamadı. Lütfen tekrar deneyin.", 3000);
    } finally {
      setActionLoading(null);
    }
  }, [selected, closeSheet]);

  useEffect(() => {
    if (!bizId) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const [apptSnap, empSnap] = await Promise.all([
          getDocs(query(collection(db, "appointments"), where("businessId", "==", bizId))),
          !isEmployee ? getDocs(collection(db, "businesses", bizId, "employees")) : Promise.resolve(null),
        ]);

        const items = apptSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const enriched = items.map((a) => ({
          ...a,
          customerName: a.customerName || "Müşteri",
          expertName: Object.values(a.employeeNames ?? {})[0] ?? "—",
          serviceName: (a.serviceNames ?? []).join(", "),
          formattedPrice: `₺${Number(a.totalPrice ?? 0).toLocaleString("tr-TR")}`,
        }));

        setAppointments(enriched);
        if (empSnap) {
          setEmployees(empSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bizId, isEmployee]);

  const { todayStr } = getDateStrings();

  const employeeOptions = useMemo(() => [
    { id: null, name: "Tümü" },
    ...employees.map((e) => ({ id: e.id, name: e.name })),
  ], [employees]);

  const upcomingBase = useMemo(() => {
    let list = appointments.filter((a) => (a.date ?? "") >= todayStr && !["cancelled", "rejected"].includes(a.status));
    if (isEmployee) list = list.filter((a) => Object.values(a.employeeIds ?? {}).includes(currentUid));
    return list;
  }, [appointments, isEmployee, currentUid, todayStr]);

  const pastBase = useMemo(() => {
    let list = appointments.filter((a) => (a.date ?? "") < todayStr);
    if (isEmployee) list = list.filter((a) => Object.values(a.employeeIds ?? {}).includes(currentUid));
    return list;
  }, [appointments, isEmployee, currentUid, todayStr]);

  const filteredAppointments = useMemo(() => {
    const base = periodTab === "upcoming" ? upcomingBase : pastBase;
    let list = !isEmployee ? filterByEmployeeUid(base, employeeFilter) : base;
    if (periodTab === "upcoming") list = filterUpcomingByDate(list, dateFilter);
    if (sortLabel === "Ada göre") {
      list = [...list].sort((a, b) => (a.customerName ?? "").localeCompare(b.customerName ?? "", "tr"));
    } else {
      list = [...list].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    }
    return list;
  }, [periodTab, upcomingBase, pastBase, isEmployee, employeeFilter, dateFilter, sortLabel]);

  const selectedEmployeeName = useMemo(() => {
    if (!employeeFilter) return "Tümü";
    return employeeOptions.find((e) => e.id === employeeFilter)?.name ?? "Tümü";
  }, [employeeFilter, employeeOptions]);

  if (loading) {
    return (
      <LayoutView isActiveHeader={true} title="Randevular" backgroundColor={PALETTE.bg} paddingHorizontal={0}>
        <ActivityIndicator size="large" color={Colors.Gold} style={{ marginTop: 80 }} />
      </LayoutView>
    );
  }

  return (
    <LayoutView isActiveHeader={true} title="Randevular" backgroundColor={PALETTE.bg} paddingHorizontal={0}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSegmentCard}>
          <View style={styles.periodSegment}>
            <Pressable style={({ pressed }) => [styles.periodTabBtn, periodTab === "upcoming" && styles.periodTabBtnActive, pressed && styles.pressed]} onPress={() => setPeriodTab("upcoming")}>
              <CustomText sm semibold color={periodTab === "upcoming" ? Colors.White : Colors.LightGray2}>
                Yaklaşan
              </CustomText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.periodTabBtn, periodTab === "past" && styles.periodTabBtnActive, pressed && styles.pressed]} onPress={() => setPeriodTab("past")}>
              <CustomText sm semibold color={periodTab === "past" ? Colors.White : Colors.LightGray2}>
                Geçmiş
              </CustomText>
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterRowScroll}>
          {periodTab === "upcoming" ? (
            <Pressable style={({ pressed }) => [styles.filterPill, pressed && styles.pressed]} onPress={() => setPickerKind("date")}>
              <Ionicons name="calendar-outline" size={18} color={TERTIARY} />
              <View style={styles.filterPillTextCol}>
                <CustomText min bold color={Colors.BrandPrimary}>
                  Tarih
                </CustomText>
                <CustomText minx color={PALETTE.muted}>
                  {dateFilter}
                </CustomText>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.LightGray2} />
            </Pressable>
          ) : null}

          {!isEmployee && (
            <Pressable style={({ pressed }) => [styles.filterPill, pressed && styles.pressed]} onPress={() => setPickerKind("employee")}>
              <Ionicons name="id-card-outline" size={18} color={TERTIARY} />
              <View style={styles.filterPillTextCol}>
                <CustomText min bold color={Colors.BrandPrimary}>
                  Çalışan
                </CustomText>
                <CustomText minx color={PALETTE.muted} numberOfLines={1}>
                  {selectedEmployeeName}
                </CustomText>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.LightGray2} />
            </Pressable>
          )}

          <Pressable style={({ pressed }) => [styles.sortBtn, pressed && styles.pressed]} onPress={() => setPickerKind("tune")}>
            <Ionicons name="swap-vertical-outline" size={20} color={Colors.BrandPrimary} />
            <CustomText min bold color={Colors.BrandPrimary}>
              {sortLabel}
            </CustomText>
          </Pressable>
        </ScrollView>

        <View style={styles.countRow}>
          <CustomText sm semibold color={PALETTE.muted}>
            {filteredAppointments.length} randevu
          </CustomText>
        </View>

        <View style={styles.list}>
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={26} color={Colors.Gold} />
              </View>
              <CustomText semibold md color={Colors.BrandPrimary} style={styles.emptyTitle}>
                Randevu bulunamadı
              </CustomText>
              <CustomText xs color={PALETTE.muted} center style={styles.emptyHint}>
                Farklı bir tarih, çalışan veya sekme seçerek tekrar deneyin.
              </CustomText>
            </View>
          ) : (
            filteredAppointments.map((item) => {
              const statusCfg = appointmentStatusCfg(item.status);
              const dateObj = item.date ? new Date(item.date) : null;
              const dayNum = dateObj ? String(dateObj.getDate()).padStart(2, "0") : "--";
              const monthStr = dateObj ? dateObj.toLocaleDateString("tr-TR", { month: "short" }) : "";
              const weekdayStr = dateObj ? dateObj.toLocaleDateString("tr-TR", { weekday: "long" }) : "";
              const initials = general.getInitials(item.customerName) || "M";
              const [timeH, timeM] = (item.time ?? "--:--").split(":");

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => setSelected(item)}
                >
                  {/* Sol: saat bloğu */}
                  <View style={styles.timeBlock}>
                    <CustomText extraBold fontSize={22} color={Colors.BrandPrimary} style={styles.timeHour}>
                      {timeH}
                    </CustomText>
                    <View style={styles.timeMinRow}>
                      <CustomText bold fontSize={13} color={TERTIARY_CONTAINER}>:{timeM}</CustomText>
                    </View>
                    <CustomText xs color={PALETTE.muted} style={styles.timeWeekday} numberOfLines={1}>
                      {weekdayStr}
                    </CustomText>
                  </View>

                  {/* Dikey ayraç */}
                  <View style={[styles.verticalDivider, { backgroundColor: `${statusCfg.color}40` }]} />

                  {/* Sağ: içerik */}
                  <View style={styles.cardContent}>
                    {/* Durum badge */}
                    <View style={styles.cardContentTopRow}>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}18` }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                        <CustomText xs semibold color={statusCfg.color}>{statusCfg.label}</CustomText>
                      </View>
                      <CustomText xs semibold color={PALETTE.muted}>{dayNum} {monthStr}</CustomText>
                    </View>

                    {/* Müşteri */}
                    <View style={styles.customerRow}>
                      {item.customerPhotoUrl ? (
                        <CustomImage uri={item.customerPhotoUrl} style={styles.avatar} contentFit="cover" />
                      ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <CustomText xs bold color={Colors.BrandPrimary}>{initials}</CustomText>
                        </View>
                      )}
                      <View style={styles.cardTexts}>
                        <CustomText bold md color={Colors.BrandPrimary} numberOfLines={1}>
                          {item.customerName}
                        </CustomText>
                        <CustomText xs color={PALETTE.muted} numberOfLines={1}>
                          {item.serviceName}
                        </CustomText>
                      </View>
                    </View>

                    {/* Expert */}
                    {item.expertName && item.expertName !== "—" && (
                      <View style={styles.expertRow}>
                        <Ionicons name="person-circle-outline" size={13} color={TERTIARY} />
                        <CustomText xs color={PALETTE.muted} numberOfLines={1}>
                          {item.expertName}
                        </CustomText>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <CustomModal visible={!!selected} onClose={closeSheet} title="Randevu Detayı" maxHeight="88%">
        {selected ? (
          <View style={styles.sheetBody}>
            <View style={styles.detailRows}>
              <View style={styles.detailRow}>
                <CustomText sm medium color={Colors.LightGray2}>Durum</CustomText>
                {(() => {
                  const sc = appointmentStatusCfg(selected.status);
                  return (
                    <View style={[styles.statusBadge, { backgroundColor: `${sc.color}22` }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
                      <CustomText xs semibold color={sc.color}>{sc.label}</CustomText>
                    </View>
                  );
                })()}
              </View>
              <View style={styles.detailRow}>
                <CustomText sm medium color={Colors.LightGray2}>Müşteri</CustomText>
                <CustomText bold md color={Colors.BrandPrimary}>{selected.customerName}</CustomText>
              </View>
              <View style={styles.detailRow}>
                <CustomText sm medium color={Colors.LightGray2}>Hizmet</CustomText>
                <CustomText bold md color={Colors.BrandPrimary} style={styles.detailValueRight}>{selected.serviceName}</CustomText>
              </View>
              <View style={styles.detailRow}>
                <CustomText sm medium color={Colors.LightGray2}>Uzman</CustomText>
                <CustomText bold md color={Colors.BrandPrimary}>{selected.expertName}</CustomText>
              </View>
              <View style={styles.detailRow}>
                <CustomText sm medium color={Colors.LightGray2}>Tarih / Saat</CustomText>
                <CustomText bold md color={Colors.BrandPrimary}>{selected.date}  {selected.time}</CustomText>
              </View>
              <View style={[styles.detailRow, styles.detailRowLast]}>
                <CustomText sm medium color={Colors.LightGray2}>Ücret</CustomText>
                <CustomText extraBold fontSize={24} color={TERTIARY}>{selected.formattedPrice}</CustomText>
              </View>
            </View>

            {[AppointmentStatusEnum.Approved, AppointmentStatusEnum.Pending].includes(selected.status) && (
              <View style={styles.sheetActions}>
                <Pressable
                  style={({ pressed }) => [styles.btnCompleted, pressed && styles.pressed, actionLoading === AppointmentStatusEnum.Completed && styles.btnDisabled]}
                  onPress={() => handleAppointmentAction(AppointmentStatusEnum.Completed)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === AppointmentStatusEnum.Completed ? (
                    <ActivityIndicator size="small" color={Colors.White} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.White} />
                      <CustomText bold md color={Colors.White}>Tamamlandı</CustomText>
                    </>
                  )}
                </Pressable>

                <View style={styles.btnRow}>
                  <Pressable
                    style={({ pressed }) => [styles.btnNoShow, pressed && styles.pressed, actionLoading === AppointmentStatusEnum.NoShow && styles.btnDisabled]}
                    onPress={() => handleAppointmentAction(AppointmentStatusEnum.NoShow)}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === AppointmentStatusEnum.NoShow ? (
                      <ActivityIndicator size="small" color="#92400E" />
                    ) : (
                      <>
                        <Ionicons name="person-remove-outline" size={18} color="#92400E" />
                        <CustomText semibold md color="#92400E">Gelmedi</CustomText>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.btnDanger, pressed && styles.pressed, actionLoading === AppointmentStatusEnum.Cancelled && styles.btnDisabled]}
                    onPress={() => handleAppointmentAction(AppointmentStatusEnum.Cancelled)}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === AppointmentStatusEnum.Cancelled ? (
                      <ActivityIndicator size="small" color={ON_ERROR_CONTAINER} />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={18} color={ON_ERROR_CONTAINER} />
                        <CustomText semibold md color={ON_ERROR_CONTAINER}>İptal</CustomText>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ) : null}
      </CustomModal>

      <Modal visible={!!pickerKind} transparent animationType="fade" statusBarTranslucent onRequestClose={closePicker}>
        <View style={styles.pickerModalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closePicker} accessibilityRole="button" />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.sheetHandle} />
            <CustomText bold fontSize={18} color={Colors.BrandPrimary} style={styles.pickerTitle}>
              {pickerKind === "date" ? "Tarih" : pickerKind === "employee" ? "Çalışan" : "Sıralama"}
            </CustomText>
            <CustomText sm color={PALETTE.muted} style={styles.pickerSubtitle}>
              {pickerKind === "tune" ? "Listeyi nasıl sıralamak istediğinizi seçin." : "Seçiminizi yapın; liste anında güncellenir."}
            </CustomText>

            <View style={styles.pickerList}>
              {pickerKind === "date"
                ? DATE_FILTER_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      style={({ pressed }) => [styles.pickerRow, dateFilter === opt && styles.pickerRowActive, pressed && styles.pressed]}
                      onPress={() => {
                        setDateFilter(opt);
                        closePicker();
                      }}
                    >
                      <CustomText semibold md color={Colors.BrandPrimary}>
                        {opt}
                      </CustomText>
                      {dateFilter === opt ? <Ionicons name="checkmark-circle" size={22} color={Colors.Gold} /> : null}
                    </Pressable>
                  ))
                : null}

              {pickerKind === "employee"
                ? employeeOptions.map((opt) => (
                    <Pressable
                      key={opt.id ?? "all"}
                      style={({ pressed }) => [styles.pickerRow, employeeFilter === opt.id && styles.pickerRowActive, pressed && styles.pressed]}
                      onPress={() => {
                        setEmployeeFilter(opt.id);
                        closePicker();
                      }}
                    >
                      <CustomText semibold md color={Colors.BrandPrimary}>
                        {opt.name}
                      </CustomText>
                      {employeeFilter === opt.id ? <Ionicons name="checkmark-circle" size={22} color={Colors.Gold} /> : null}
                    </Pressable>
                  ))
                : null}

              {pickerKind === "tune"
                ? [
                    { key: "time", label: "En yakın saat" },
                    { key: "name", label: "Ada göre" },
                  ].map((opt) => (
                    <Pressable
                      key={opt.key}
                      style={({ pressed }) => [styles.pickerRow, sortLabel === opt.label && styles.pickerRowActive, pressed && styles.pressed]}
                      onPress={() => {
                        setSortLabel(opt.label);
                        closePicker();
                      }}
                    >
                      <CustomText semibold md color={Colors.BrandPrimary}>
                        {opt.label}
                      </CustomText>
                      {sortLabel === opt.label ? <Ionicons name="checkmark-circle" size={22} color={Colors.Gold} /> : null}
                    </Pressable>
                  ))
                : null}
            </View>
          </View>
        </View>
      </Modal>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    letterSpacing: -0.5,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 999,
  },
  headerAvatarBtn: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196, 199, 199, 0.35)",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  periodSegmentCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  periodSegment: {
    flexDirection: "row",
    gap: 4,
  },
  periodTabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  periodTabBtnActive: {
    backgroundColor: Colors.BrandPrimary,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  filterRowScroll: {
    marginBottom: 20,
    marginHorizontal: -4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  filterPillTextCol: {
    minWidth: 72,
    gap: 2,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  countRow: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  list: {
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: PALETTE.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 4,
  },
  emptyHint: {
    lineHeight: 18,
    maxWidth: 280,
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: Colors.Black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
    borderColor: "rgba(212,175,55,0.3)",
  },

  // Sol saat bloğu
  timeBlock: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    backgroundColor: "rgba(212,175,55,0.07)",
    gap: 1,
  },
  timeHour: {
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  timeMinRow: {
    marginTop: -2,
  },
  timeWeekday: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 10,
    textTransform: "capitalize",
  },
  verticalDivider: {
    width: 2,
    alignSelf: "stretch",
  },

  // Sağ içerik
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  cardContentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(196,199,199,0.35)",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  expertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sheetBody: {
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  detailRows: {
    marginBottom: 24,
    gap: 0,
    backgroundColor: PALETTE.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(196, 199, 199, 0.35)",
    gap: 12,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailValueRight: {
    flex: 1,
    textAlign: "right",
  },
  sheetActions: {
    gap: 12,
    paddingBottom: 8,
  },
  btnCompleted: {
    backgroundColor: Colors.BrandPrimary,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.BrandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  btnNoShow: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  btnDanger: {
    flex: 1,
    backgroundColor: ERROR_CONTAINER,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  pickerModalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerSheet: {
    width: "100%",
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 6,
    maxHeight: "55%",
  },
  pickerTitle: {
    marginBottom: 4,
  },
  pickerSubtitle: {
    marginBottom: 16,
    lineHeight: 20,
  },
  pickerList: {
    gap: 8,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: PALETTE.bg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pickerRowActive: {
    borderColor: "rgba(212,175,55,0.45)",
    backgroundColor: PALETTE.goldSoft,
  },
});
