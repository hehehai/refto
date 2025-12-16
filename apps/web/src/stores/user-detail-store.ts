import { create } from "zustand";

interface UserDetailStore {
  userId: string | null;
  isOpen: boolean;
  openUserDetail: (userId: string) => void;
  closeUserDetail: () => void;
}

export const useUserDetailStore = create<UserDetailStore>((set) => ({
  userId: null,
  isOpen: false,
  openUserDetail: (userId: string) => set({ userId, isOpen: true }),
  closeUserDetail: () => set({ userId: null, isOpen: false }),
}));
