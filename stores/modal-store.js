import { create } from 'zustand';

/**
 * Global modal state. ModalRenderer bu store'u dinler ve açık modal'ı render eder.
 * Kullanım: modalStore.open('confirm', { title: 'Emin misin?', onConfirm: () => {} })
 */
export const modalStore = create((set) => ({
  current: null, // { type: string, props: object } | null

  open: (type, props = {}) => set({ current: { type, props } }),

  close: () => set({ current: null }),

  setProps: (props) =>
    set((state) =>
      state.current
        ? { current: { ...state.current, props: { ...state.current.props, ...props } } }
        : state
    ),
}));
