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

// User Profile Dialog (for app section)
export const userProfileDialog = Dialog.createHandle();

// Submit Site Dialog (for app section)
export const submitSiteDialog = Dialog.createHandle();
