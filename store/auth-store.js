import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,       // Firebase auth user objesi
  userType: null,   // "customer" | "business"
  isAdmin: false,

  setAuth: (user, userType, isAdmin) =>
    set({ user, userType, isAdmin: !!isAdmin }),

  clearAuth: () =>
    set({ user: null, userType: null, isAdmin: false }),
}));

export default useAuthStore;
