import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import Header from "@/components/shared/header";
import { UserProfileDialog } from "@/components/shared/user-profile-dialog";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <Header />
      <main className="overflow-auto">
        <Outlet />
      </main>
      <UserProfileDialog />
      <ConfirmDialog />
    </div>
  );
}
