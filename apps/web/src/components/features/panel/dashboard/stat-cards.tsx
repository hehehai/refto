import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon: string;
  value: number;
  currentMonth: number;
  previousMonth: number;
  changePercent: number;
}

function StatCard({
  title,
  icon,
  value,
  currentMonth,
  changePercent,
}: StatCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <span className={cn(icon, "size-4")} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-semibold text-3xl tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? "+" : ""}
            {changePercent}%({currentMonth})
          </span>
          <span className="text-muted-foreground">vs Last Month</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardsProps {
  data: {
    sites: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
    versions: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
    likes: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
    users: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
  };
}

export function StatCards({ data }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        changePercent={data.sites.changePercent}
        currentMonth={data.sites.currentMonth}
        icon="i-hugeicons-web-design-01"
        previousMonth={data.sites.previousMonth}
        title="Total Sites"
        value={data.sites.total}
      />
      <StatCard
        changePercent={data.versions.changePercent}
        currentMonth={data.versions.currentMonth}
        icon="i-hugeicons-layers-01"
        previousMonth={data.versions.previousMonth}
        title="Total Versions"
        value={data.versions.total}
      />
      <StatCard
        changePercent={data.likes.changePercent}
        currentMonth={data.likes.currentMonth}
        icon="i-hugeicons-favourite"
        previousMonth={data.likes.previousMonth}
        title="Total Likes"
        value={data.likes.total}
      />
      <StatCard
        changePercent={data.users.changePercent}
        currentMonth={data.users.currentMonth}
        icon="i-hugeicons-user-group"
        previousMonth={data.users.previousMonth}
        title="Total Users"
        value={data.users.total}
      />
    </div>
  );
}
