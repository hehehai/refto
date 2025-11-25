import { atom } from "jotai";
import mitt from "mitt";
import type { UserWithMeta } from "../_components/columns";

// User edit dialog state
interface UserEditDialogState {
  show: boolean;
  user: UserWithMeta | null;
}

export const userEditDialogAtom = atom<UserEditDialogState>({
  show: false,
  user: null,
});

type UserEditDialogEvents = {
  open: { user: UserWithMeta };
  success: undefined;
};

export const userEditDialogEmitter = mitt<UserEditDialogEvents>();
