export enum AppointmentStatusEnum {
  Pending   = "pending",
  Approved  = "approved",
  Rejected  = "rejected",
  Cancelled = "cancelled",
  Completed = "completed",
  NoShow    = "no_show",
}

export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatusEnum,
  { label: string; color: string }
> = {
  [AppointmentStatusEnum.Pending]:   { label: "Onay Bekliyor", color: "#D4AF37" },
  [AppointmentStatusEnum.Approved]:  { label: "Onaylandı",     color: "#22C55E" },
  [AppointmentStatusEnum.Rejected]:  { label: "Reddedildi",    color: "#EF4444" },
  [AppointmentStatusEnum.Cancelled]: { label: "İptal Edildi",  color: "#EF4444" },
  [AppointmentStatusEnum.Completed]: { label: "Tamamlandı",    color: "#6366F1" },
  [AppointmentStatusEnum.NoShow]:    { label: "Gelmedi",       color: "#F97316" },
};
