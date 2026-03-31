import { create } from "zustand";

const useTabBarStore = create((set) => ({
  visible: true,
  setVisible: (visible) => set({ visible }),
}));

export default useTabBarStore;
