import { Dialog } from "@base-ui/react/dialog";

// User Detail Sheet
export const userDetailSheet = Dialog.createHandle<{ userId: string }>();

// Site Detail Sheet
export const siteDetailSheet = Dialog.createHandle<{
  siteId: string;
  pageId?: string;
}>();

// Site Edit Sheet
export const siteEditSheet = Dialog.createHandle<{
  siteId: string;
  pageId?: string;
}>();
