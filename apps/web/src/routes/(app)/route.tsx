import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChangeEmailDialog } from "@/components/features/profile/change-email-dialog";
import { ChangePasswordDialog } from "@/components/features/profile/change-password-dialog";
import { SetPasswordDialog } from "@/components/features/profile/set-password-dialog";
import { UserProfileDialog } from "@/components/features/profile/user-profile-dialog";
import { VerifyEmailDialog } from "@/components/features/profile/verify-email-dialog";
import { SubmitSiteDialog } from "@/components/features/submits/submit-site-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SiteHeader } from "@/components/shared/layout/site-header";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();

    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <SiteHeader user={session?.user ?? null} />
      <main className="overflow-auto">
        <Outlet />
      </main>
      <UserProfileDialog />
      <ChangeEmailDialog />
      <VerifyEmailDialog />
      <SetPasswordDialog />
      <ChangePasswordDialog />
      <ConfirmDialog />
      <SubmitSiteDialog />
    </div>
  );
}
