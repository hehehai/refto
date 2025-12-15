import { createFileRoute } from "@tanstack/react-router";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";

export const Route = createFileRoute("/(admin)/panel/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <NavMainHeader left={<h2 className="font-semibold">Dashboard</h2>} />
      <div>dashboard</div>
    </div>
  );
}
