import { FeedSort } from "@refto-one/common";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { VersionViewer } from "@/components/features/detail/version-viewer";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";

export const AuthLayout = ({ children }: React.PropsWithChildren) => {
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");

  const { data } = useSuspenseQuery(
    orpc.app.site.getVersionsFeed.queryOptions({
      input: { cursor: undefined, limit: 1, sort: FeedSort.LATEST },
    })
  );

  const latestItem = useMemo(() => data.items.at(0), [data.items]);
  const latestVersion = latestItem?.version;
  const hasMobileContent = Boolean(
    latestVersion?.mobileCover || latestVersion?.mobileRecord
  );

  useEffect(() => {
    if (!hasMobileContent && viewMode === "mobile") {
      setViewMode("web");
    }
  }, [hasMobileContent, viewMode]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex h-screen w-full">
        <div className="hidden h-full w-1/2 p-6 lg:flex">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-muted/40">
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <p className="text-muted-foreground text-xs">Latest version</p>
                {latestItem ? (
                  <p className="font-semibold">
                    {latestItem.site.title} · {latestItem.page.title}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Loading latest inspiration...
                  </p>
                )}
              </div>
              <span className="i-hugeicons-flash-1 text-lg text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 pb-4">
              {latestVersion ? (
                <VersionViewer
                  className="w-full max-w-4xl rounded-2xl"
                  hasMobileContent={hasMobileContent}
                  onViewModeChange={setViewMode}
                  version={latestVersion}
                  viewMode={viewMode}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No latest version available
                </div>
              )}
            </div>
          </div>
        </div>
        <main className="flex w-full flex-col p-4 lg:w-1/2">
          <header className="flex shrink-0 items-center justify-between">
            <Button
              render={
                <Link to="/">
                  <span className="i-hugeicons-arrow-left-01 mr-2 size-4" />{" "}
                  Back
                </Link>
              }
              variant="ghost"
            />
          </header>
          <div className="flex grow items-center justify-center">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
