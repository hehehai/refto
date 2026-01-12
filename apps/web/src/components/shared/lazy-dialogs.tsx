import { lazy } from "react";

// App Dialogs
export const LazyUserProfileDialog = lazy(() =>
  import("@/components/features/profile/user-profile-dialog").then((m) => ({
    default: m.UserProfileDialog,
  }))
);

export const LazyChangeEmailDialog = lazy(() =>
  import("@/components/features/profile/change-email-dialog").then((m) => ({
    default: m.ChangeEmailDialog,
  }))
);

export const LazyVerifyEmailDialog = lazy(() =>
  import("@/components/features/profile/verify-email-dialog").then((m) => ({
    default: m.VerifyEmailDialog,
  }))
);

export const LazySetPasswordDialog = lazy(() =>
  import("@/components/features/profile/set-password-dialog").then((m) => ({
    default: m.SetPasswordDialog,
  }))
);

export const LazyChangePasswordDialog = lazy(() =>
  import("@/components/features/profile/change-password-dialog").then((m) => ({
    default: m.ChangePasswordDialog,
  }))
);

export const LazySubmitSiteDialog = lazy(() =>
  import("@/components/features/submits/submit-site-dialog").then((m) => ({
    default: m.SubmitSiteDialog,
  }))
);

export const LazyConfirmDialog = lazy(() =>
  import("@/components/shared/confirm-dialog").then((m) => ({
    default: m.ConfirmDialog,
  }))
);

export const LazyFilterDialog = lazy(() =>
  import("@/components/features/filter/filter-dialog").then((m) => ({
    default: m.FilterDialog,
  }))
);

export const LazyImagePreviewDialog = lazy(() =>
  import("@/components/shared/image-preview-dialog").then((m) => ({
    default: m.ImagePreviewDialog,
  }))
);

// Panel Sheets
export const LazySiteDetailSheet = lazy(() =>
  import("@/components/features/panel/sites/detail/site-detail-sheet").then(
    (m) => ({
      default: m.SiteDetailSheet,
    })
  )
);

export const LazySiteEditSheet = lazy(() =>
  import("@/components/features/panel/sites/edit/site-edit-sheet").then(
    (m) => ({
      default: m.SiteEditSheet,
    })
  )
);

export const LazyUserDetailSheet = lazy(() =>
  import("@/components/features/panel/users/user-detail-sheet").then((m) => ({
    default: m.UserDetailSheet,
  }))
);
