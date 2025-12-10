import { atom } from "jotai";
import mitt from "mitt";

// site detail
export const siteDetailSheetAtom = atom<string | null>(null);

// site upsert
interface SiteUpsertSheetState {
  show: boolean;
  isAdd: boolean;
  id: string | null;
}

export const siteUpsertSheetAtom = atom<SiteUpsertSheetState>({
  show: false,
  isAdd: true,
  id: null,
});

type SiteUpsertSheetEvents = {
  success: undefined;
};

export const siteUpsertSheetEmitter = mitt<SiteUpsertSheetEvents>();

// weekly upset
interface WeeklyDialogState {
  show: boolean;
  isAdd: boolean;
  id: string | null;
}

export const weeklyDialogAtom = atom<WeeklyDialogState>({
  show: false,
  isAdd: true,
  id: null,
});

type WeeklyDialogEvents = {
  success: undefined;
};

export const weeklyDialogEmitter = mitt<WeeklyDialogEvents>();
