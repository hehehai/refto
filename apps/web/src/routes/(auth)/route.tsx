import { FeedSort } from "@refto-one/common";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(auth)")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      orpc.app.site.getVersionsFeed.queryOptions({
        input: { cursor: undefined, limit: 1, sort: FeedSort.LATEST },
      })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
