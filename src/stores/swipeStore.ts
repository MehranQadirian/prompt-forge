import { create } from 'zustand';

interface SwipeState {
  openCardId: string | null;
  setOpenCard: (id: string) => void;
  clearOpenCard: (id: string) => void;
  closeAll: () => void;
}

export const useSwipeStore = create<SwipeState>((set) => ({
  openCardId: null,
  setOpenCard: (id) => set({ openCardId: id }),
  clearOpenCard: (id) =>
    set((state) => ({
      openCardId: state.openCardId === id ? null : state.openCardId,
    })),
  closeAll: () => set({ openCardId: null }),
}));
