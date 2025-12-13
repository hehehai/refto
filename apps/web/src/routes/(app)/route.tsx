import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/shared/header";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid h-svh grid-rows-[auto_1fr]">
      <Header />
      <Outlet />
    </div>
  );
}
