import { View, Text, Pressable, StyleSheet } from "react-native";

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = "Tamam",
  cancelText = "İptal",
}) {
  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelText: {
    color: "#333",
    fontSize: 15,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  confirmText: {
    color: "#fff",
    fontSize: 15,
  },
});
