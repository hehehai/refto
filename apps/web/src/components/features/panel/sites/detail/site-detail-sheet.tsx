import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { siteDetailSheet } from "@/lib/sheets";
import { PageViewPanel } from "./page-view-panel";
import { SiteDetailProvider, useSiteDetail } from "./site-detail-context";
import { SiteDetailSide } from "./site-detail-side";
import { VersionViewPanel } from "./version-view-panel";

function SiteDetailContent() {
  const { site, isLoading, pages, activePageId } = useSiteDetail();

  const activePage = pages.find((p) => p.id === activePageId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Site not found
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left side - Site detail */}
      <SiteDetailSide />

      {/* Right side - Pages & Versions */}
      <PageViewPanel>
        {activePage ? (
          <VersionViewPanel />
        ) : (
          <EmptyPlaceholder
            className="flex-1"
            description="No pages available"
            icon="i-hugeicons-file-add"
          />
        )}
      </PageViewPanel>
    </div>
  );
}

export function SiteDetailSheet() {
  return (
    <Sheet<{ siteId: string; pageId?: string }> handle={siteDetailSheet}>
      {({ payload }) =>
        payload && (
          <SiteDetailProvider
            initialPageId={payload.pageId}
            open={true}
            siteId={payload.siteId}
          >
            <SheetContent
              className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3/4 data-[side=right]:sm:max-w-3/4"
              showCloseButton={false}
              side="right"
            >
              <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
                <SheetHeader className="sr-only">
                  <SheetTitle>Site Detail</SheetTitle>
                  <SheetDescription>
                    View site details and pages
                  </SheetDescription>
                </SheetHeader>
                <SiteDetailContent />
              </div>
            </SheetContent>
          </SiteDetailProvider>
        )
      }
    </Sheet>
  );
}
