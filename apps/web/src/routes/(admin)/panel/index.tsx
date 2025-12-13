import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/panel/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(admin)/panel/"!</div>;
}
