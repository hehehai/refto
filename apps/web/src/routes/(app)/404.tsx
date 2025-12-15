import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/404")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(app)/404"!</div>;
}
