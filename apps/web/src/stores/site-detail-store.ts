import { create } from "zustand";

interface SiteDetailStore {
  siteId: string | null;
  isOpen: boolean;
  openSiteDetail: (siteId: string) => void;
  closeSiteDetail: () => void;
}

export const useSiteDetailStore = create<SiteDetailStore>((set) => ({
  siteId: null,
  isOpen: false,
  openSiteDetail: (siteId: string) => set({ siteId, isOpen: true }),
  closeSiteDetail: () => set({ siteId: null, isOpen: false }),
}));
