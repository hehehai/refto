import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LikeLeaderboard } from "@/components/features/panel/dashboard/like-leaderboard";
import { StatCards } from "@/components/features/panel/dashboard/stat-cards";
import { UserGrowthChart } from "@/components/features/panel/dashboard/user-growth-chart";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(admin)/panel/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        orpc.panel.stat.getDashboardStats.queryOptions()
      ),
      context.queryClient.ensureQueryData(
        orpc.panel.stat.getUserGrowthChart.queryOptions()
      ),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: dashboardStats } = useSuspenseQuery(
    orpc.panel.stat.getDashboardStats.queryOptions()
  );

  const { data: userGrowthData } = useSuspenseQuery(
    orpc.panel.stat.getUserGrowthChart.queryOptions()
  );

  return (
    <div className="w-full">
      <NavMainHeader left={<h2 className="font-semibold">Dashboard</h2>} />
      <div className="space-y-6 p-6">
        {/* Stat Cards */}
        <StatCards data={dashboardStats} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* User Growth Chart (2/3 width) */}
          <UserGrowthChart data={userGrowthData} />

          {/* Like Leaderboard (1/3 width) */}
          <LikeLeaderboard />
        </div>
      </div>
    </div>
  );
}
