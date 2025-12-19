import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SiteHeader } from "@/components/shared/layout/site-header";
import { UserProfileDialog } from "@/components/shared/user-profile-dialog";
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
      <SiteHeader isLogin={!!session} />
      <main className="overflow-auto">
        <Outlet />
      </main>
      <UserProfileDialog />
      <ConfirmDialog />
    </div>
  );
}
