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

// Profile Settings Dialogs
export const changeEmailDialog = Dialog.createHandle<{
  currentEmail: string;
}>();
export const verifyEmailDialog = Dialog.createHandle<{ email: string }>();
export const setPasswordDialog = Dialog.createHandle();
export const changePasswordDialog = Dialog.createHandle();

// Filter Dialog (for global search)
export const filterDialog = Dialog.createHandle<
  | {
      initialQuery?: string;
      initialTags?: string[];
    }
  | undefined
>();

// Video Marker Dialog
export const videoMarkerDialog = Dialog.createHandle<{
  versionId: string;
  recordType: "web" | "mobile";
  videoUrl: string;
  coverUrl: string;
}>();

// Video Marker Detail Dialog
export const videoMarkerDetailDialog = Dialog.createHandle<{
  versionId: string;
  recordType: "web" | "mobile";
  videoUrl: string;
  coverUrl: string;
}>();
