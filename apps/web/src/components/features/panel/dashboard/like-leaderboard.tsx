import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";

type LeaderboardRange =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year";

const rangeLabels: Record<LeaderboardRange, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  last_week: "Last Week",
  this_month: "This Month",
  last_month: "Last Month",
  this_year: "This Year",
};

export function LikeLeaderboard() {
  const [range, setRange] = useState<LeaderboardRange>("today");

  const { data, isLoading } = useQuery(
    orpc.panel.stat.getLikeLeaderboard.queryOptions({
      input: { range, limit: 10 },
    })
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="i-hugeicons-ranking size-5" />
          Like Leaderboard
        </CardTitle>
        <Select
          onValueChange={(v) => setRange(v as LeaderboardRange)}
          value={range}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {Object.entries(rangeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="flex items-center gap-3" key={i}>
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                className="flex items-center gap-3"
                key={item.site?.id ?? index}
              >
                <div className="flex size-6 shrink-0 items-center justify-center font-medium text-muted-foreground text-sm">
                  {index + 1}
                </div>
                <Avatar className="size-8">
                  <AvatarImage alt={item.site?.title} src={item.site?.logo} />
                  <AvatarFallback>
                    {item.site?.title?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {item.site?.title ?? "Unknown"}
                  </p>
                </div>
                <div className="shrink-0 font-semibold text-muted-foreground text-sm tabular-nums">
                  {item.likeCount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            No likes in this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
