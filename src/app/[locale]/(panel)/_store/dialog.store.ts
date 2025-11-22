import { atom } from "jotai";
import mitt from "mitt";

// detail
export const refSiteDetailSheetAtom = atom<string | null>(null);

// ref site upset
interface RefSiteDialogState {
  show: boolean;
  isAdd: boolean;
  id: string | null;
}

export const refSiteDialogAtom = atom<RefSiteDialogState>({
  show: false,
  isAdd: true,
  id: null,
});

type RefSiteDialogEvents = {
  success: undefined;
};

export const refSiteDialogEmitter = mitt<RefSiteDialogEvents>();

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
