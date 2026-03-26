import { create } from 'zustand';

export const useDrawerStore = create((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}));
